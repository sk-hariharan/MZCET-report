import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const isSupabaseActive = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = isSupabaseActive 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) 
  : null;

// Ensure upload folder exists for local storage fallback (/tmp for Vercel)
const uploadDir = path.resolve(process.env.VERCEL ? '/tmp/uploads' : 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error('Upload dir creation warning:', e.message);
  }
}

// Multer storage selector
const storage = isSupabaseActive 
  ? multer.memoryStorage() // Memory buffer for Supabase API uploads
  : multer.diskStorage({   // Local file system write
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    });

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Supported formats: PDF, DOCX, XLSX, JPG, PNG'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 1. Upload Supporting Document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  const reportId = Number(req.body.report_id);

  if (!reportId) {
    // If saving uploaded file locally without disk write completed, clean up
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'Report ID is required to link this file' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded' });
  }

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Linked report not found' });
    }

    // Business rule: Staff can only link files to their own reports
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'You do not have permission to attach documents to this report' });
    }

    // Check report status
    if (req.user.role === 'staff' && report.status !== 'Draft' && report.status !== 'Rejected') {
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Files can only be linked to reports in Draft or Rejected status' });
    }

    let fileUrl = '';
    const origName = req.file.originalname;

    if (isSupabaseActive) {
      // Upload memory buffer to Supabase Storage
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(origName);
      const uniqueFileName = `report-${reportId}/${req.file.fieldname}-${uniqueSuffix}${ext}`;

      const { data, error } = await supabase.storage
        .from('report-documents')
        .upload(uniqueFileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtain public URL
      const { data: urlData } = supabase.storage
        .from('report-documents')
        .getPublicUrl(uniqueFileName);
      
      fileUrl = urlData.publicUrl;
    } else {
      // Local URL
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Save metadata in database
    const fileRecord = await db.addDocument(reportId, origName, fileUrl, req.file.mimetype);

    res.status(201).json({
      message: 'File uploaded and linked successfully',
      document: fileRecord
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    // Clean up local file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to process file upload' });
  }
});

// 2. Delete Document
router.delete('/:id', authenticateToken, async (req, res) => {
  const docId = Number(req.params.id);

  try {
    // Look up doc metadata
    let report = null;
    let documentRecord = null;

    if (isSupabaseActive) {
      // We can get report owner by joining tables, or get the doc details
      const { data: doc, error } = await supabase.from('documents').select('*, reports(staff_id, status)').eq('id', docId).maybeSingle();
      if (error) throw error;
      documentRecord = doc;
      if (doc) report = doc.reports;
    } else {
      documentRecord = await db.get('SELECT * FROM documents WHERE id = ?', [docId]);
      if (documentRecord) {
        report = await db.get('SELECT staff_id, status FROM reports WHERE id = ?', [documentRecord.report_id]);
      }
    }

    if (!documentRecord) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Authorization
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete files linked to your own reports' });
    }

    if (req.user.role === 'staff' && report.status !== 'Draft' && report.status !== 'Rejected') {
      return res.status(400).json({ message: 'Documents can only be deleted from reports in Draft or Rejected status' });
    }

    // Delete file from disk/storage
    if (isSupabaseActive) {
      // Extract file path from public URL
      const fileUrlParts = documentRecord.file_path.split('/report-documents/');
      if (fileUrlParts.length > 1) {
        const storagePath = fileUrlParts[1];
        await supabase.storage.from('report-documents').remove([storagePath]);
      }
    } else {
      const fileName = path.basename(documentRecord.file_path);
      const filePathOnDisk = path.join(uploadDir, fileName);
      if (fs.existsSync(filePathOnDisk)) {
        fs.unlinkSync(filePathOnDisk);
      }
    }

    // Delete database entry
    await db.deleteDocument(docId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

export default router;
