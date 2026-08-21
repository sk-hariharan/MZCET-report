import express from 'express';
import { db } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Helper: Get HOD email for a department
async function getHodEmail(departmentId) {
  const users = await db.getAllUsers();
  const hod = users.find(u => u.role === 'hod' && u.department_id === departmentId);
  return hod ? hod.email : null;
}

// 1. Create Report (as Draft or Submitted)
router.post('/', authenticateToken, async (req, res) => {
  const {
    report_type,
    academic_year,
    semester,
    week_number,
    month,
    start_date,
    end_date,
    status,
    sections
  } = req.body;

  if (!report_type || !academic_year || !semester || !month || !start_date || !end_date) {
    return res.status(400).json({ message: 'Missing required report metadata fields' });
  }

  try {
    // Prevent duplicate reporting periods for the same staff member
    const duplicates = await db.getDuplicateReportCount(
      req.user.id,
      report_type,
      academic_year,
      semester,
      month,
      week_number
    );

    if (duplicates > 0) {
      return res.status(400).json({ message: `A report has already been created for this period (${report_type} - ${month}${week_number ? ', Week ' + week_number : ''})` });
    }

    const reportMeta = {
      staff_id: req.user.id,
      report_type,
      academic_year,
      semester,
      week_number: week_number ? Number(week_number) : null,
      month,
      start_date,
      end_date,
      status: status || 'Draft'
    };

    if (status === 'Submitted') {
      reportMeta.submitted_at = new Date().toISOString();
    }

    const createdReport = await db.createReport(reportMeta, sections || {});

    // Write audit log if submitted
    if (status === 'Submitted') {
      await db.updateReportStatus(createdReport.id, 'Submitted', req.user.id, req.user.name, 'Initial submission');
      
      // Notify HOD by email
      const hodEmail = await getHodEmail(req.user.department_id);
      if (hodEmail) {
        await sendEmail({
          to: hodEmail,
          subject: `New Staff Report Submitted – ${req.user.name} – ${month}`,
          html: `<p>Dear HOD,</p>
                 <p>A new activity report has been submitted by <strong>${req.user.name}</strong> for the period <strong>${month}${week_number ? ', Week ' + week_number : ''} (${academic_year})</strong>.</p>
                 <p>Please log into the MZCET FacultyReport Portal to review and approve the submission.</p>
                 <p>Best regards,<br>MZCET automated system</p>`
        });
      }
    }

    res.status(201).json({ message: 'Report created successfully', report: createdReport });
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
});

// 2. Get reports list (with Filters)
router.get('/', authenticateToken, async (req, res) => {
  const { status, report_type, academic_year, semester, month, week_number, search, department_id } = req.query;

  const filters = {
    status,
    report_type,
    academic_year,
    semester,
    month,
    week_number: week_number ? Number(week_number) : undefined,
    search,
    department_id
  };

  // Role based access enforcement
  if (req.user.role === 'staff') {
    // Staff can only view their own reports
    filters.staff_id = req.user.id;
  } else if (req.user.role === 'hod') {
    // HOD can only view reports from their own department
    filters.department_id = req.user.department_id;
  }

  try {
    const list = await db.getReports(filters);
    res.json({ reports: list });
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ message: 'Failed to retrieve reports list' });
  }
});

// 3. Get Specific Report (Detailed view with all sub tables)
router.get('/:id', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Role-based protection: Staff can only access their own report
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this report' });
    }

    // HOD can only access their department's reports
    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You do not have permission to access reports from another department' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get Report Details Error:', error);
    res.status(500).json({ message: 'Failed to retrieve report details' });
  }
});

// 4. Update Report (Drafts and Rejections only)
router.put('/:id', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);
  const {
    report_type,
    academic_year,
    semester,
    week_number,
    month,
    start_date,
    end_date,
    status,
    sections
  } = req.body;

  try {
    const existing = await db.getReportById(reportId);
    if (!existing) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Ensure user owns this report
    if (existing.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    // Enforce business rule: Staff can edit only Draft or Rejected reports
    if (existing.status !== 'Draft' && existing.status !== 'Rejected') {
      return res.status(400).json({ message: `Reports in status "${existing.status}" cannot be modified.` });
    }

    // Check duplicate reporting period if metadata is changed
    if (
      existing.report_type !== report_type ||
      existing.academic_year !== academic_year ||
      existing.semester !== semester ||
      existing.month !== month ||
      existing.week_number !== (week_number ? Number(week_number) : null)
    ) {
      const duplicates = await db.getDuplicateReportCount(
        req.user.id,
        report_type,
        academic_year,
        semester,
        month,
        week_number,
        reportId
      );
      if (duplicates > 0) {
        return res.status(400).json({ message: `A report already exists for this updated period.` });
      }
    }

    const reportMeta = {
      report_type,
      academic_year,
      semester,
      week_number: week_number ? Number(week_number) : null,
      month,
      start_date,
      end_date,
      status: status || existing.status
    };

    if (status === 'Submitted') {
      reportMeta.submitted_at = new Date().toISOString();
    }

    const updated = await db.updateReport(reportId, reportMeta, sections || {});

    // If submitted, write audit log and send mail
    if (status === 'Submitted') {
      await db.updateReportStatus(reportId, 'Submitted', req.user.id, req.user.name, 'Resubmission');

      const hodEmail = await getHodEmail(req.user.department_id);
      if (hodEmail) {
        await sendEmail({
          to: hodEmail,
          subject: `Staff Report Submitted – ${req.user.name} – ${month}`,
          html: `<p>Dear HOD,</p>
                 <p>An activity report has been submitted by <strong>${req.user.name}</strong> for the period <strong>${month}${week_number ? ', Week ' + week_number : ''} (${academic_year})</strong>.</p>
                 <p>Please review this report on the MZCET Portal.</p>
                 <p>Best regards,<br>MZCET FacultyReport</p>`
        });
      }
    }

    res.json({ message: 'Report updated successfully', report: updated });
  } catch (error) {
    console.error('Update Report Error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
});

// 5. Submit Report (Explicit trigger)
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const existing = await db.getReportById(reportId);
    if (!existing) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (existing.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the report owner can submit it' });
    }

    if (existing.status !== 'Draft' && existing.status !== 'Rejected') {
      return res.status(400).json({ message: 'Report is already submitted or approved.' });
    }

    await db.updateReportStatus(reportId, 'Submitted', req.user.id, req.user.name, 'Submitted report');

    const hodEmail = await getHodEmail(req.user.department_id);
    if (hodEmail) {
      await sendEmail({
        to: hodEmail,
        subject: `New Staff Report Submitted – ${req.user.name} – ${existing.month}`,
        html: `<p>Dear HOD,</p>
               <p>A new activity report has been submitted by <strong>${req.user.name}</strong> for the period <strong>${existing.month}${existing.week_number ? ', Week ' + existing.week_number : ''} (${existing.academic_year})</strong>.</p>
               <p>Please review and approve this submission.</p>
               <p>Best regards,<br>MZCET FacultyReport</p>`
      });
    }

    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Submit Report Error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// 6. Approve Report (HOD or Admin only)
router.post('/:id/approve', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const reportId = Number(req.params.id);
  const { comments } = req.body;

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Business rule: HOD can approve only department reports
    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You can only approve reports belonging to your own department' });
    }

    await db.updateReportStatus(reportId, 'Approved', req.user.id, req.user.name, comments || 'Approved');

    // Notify staff member
    const staff = await db.getUserById(report.staff_id);
    if (staff && staff.email) {
      await sendEmail({
        to: staff.email,
        subject: `Staff Report Approved – ${report.month}`,
        html: `<p>Dear ${staff.name},</p>
               <p>Your activity report for <strong>${report.month}${report.week_number ? ', Week ' + report.week_number : ''}</strong> has been <strong>Approved</strong> by HOD/Admin.</p>
               <p>HOD/Admin Comments: <em>${comments || 'None'}</em></p>
               <p>Thank you for your submissions.</p>
               <p>Best regards,<br>MZCET FacultyReport Portal</p>`
      });
    }

    res.json({ message: 'Report approved successfully' });
  } catch (error) {
    console.error('Approve Report Error:', error);
    res.status(500).json({ message: 'Failed to approve report' });
  }
});

// 7. Reject Report (HOD or Admin only)
router.post('/:id/reject', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const reportId = Number(req.params.id);
  const { comments } = req.body;

  if (!comments) {
    return res.status(400).json({ message: 'Review correction comments are required when rejecting a report' });
  }

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Business rule: HOD can reject only department reports
    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You can only reject reports belonging to your own department' });
    }

    await db.updateReportStatus(reportId, 'Rejected', req.user.id, req.user.name, comments);

    // Notify staff member
    const staff = await db.getUserById(report.staff_id);
    if (staff && staff.email) {
      await sendEmail({
        to: staff.email,
        subject: `Staff Report Requires Correction – ${report.month}`,
        html: `<p>Dear ${staff.name},</p>
               <p>Your activity report for <strong>${report.month}${report.week_number ? ', Week ' + report.week_number : ''}</strong> has been sent back for corrections.</p>
               <p>Reason/Comments: <strong><em>${comments}</em></strong></p>
               <p>Please edit the report and resubmit.</p>
               <p>Best regards,<br>MZCET FacultyReport Portal</p>`
      });
    }

    res.json({ message: 'Report sent back for corrections successfully' });
  } catch (error) {
    console.error('Reject Report Error:', error);
    res.status(500).json({ message: 'Failed to reject report' });
  }
});

// 7b. Unified Status Transition (Submit, Reject, Resubmit, Approve)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);
  const { status, review_comments } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (status === 'Submitted' || status === 'Resubmitted') {
      if (report.staff_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only the author can submit or resubmit this report' });
      }
    } else if (status === 'Approved' || status === 'Rejected') {
      if (req.user.role !== 'hod' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only HOD or Admin can approve or reject reports' });
      }
      if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'You can only review reports from your department' });
      }
      if (status === 'Rejected' && !review_comments) {
        return res.status(400).json({ message: 'Review correction comments are required when rejecting a report' });
      }
    }

    await db.updateReportStatus(reportId, status, req.user.id, req.user.name, review_comments || `${status} update`);
    const updated = await db.getReportById(reportId);

    // Send notifications if applicable
    if (status === 'Submitted' || status === 'Resubmitted') {
      const hodEmail = await getHodEmail(req.user.department_id);
      if (hodEmail) {
        await sendEmail({
          to: hodEmail,
          subject: `Staff Report ${status} – ${req.user.name} – ${report.month}`,
          html: `<p>A staff report has been ${status} by <strong>${req.user.name}</strong> for ${report.month}.</p>`
        });
      }
    } else if (status === 'Approved' || status === 'Rejected') {
      const staff = await db.getUserById(report.staff_id);
      if (staff && staff.email) {
        await sendEmail({
          to: staff.email,
          subject: `Staff Report ${status} – ${report.month}`,
          html: `<p>Your report for ${report.month} has been <strong>${status}</strong>.</p><p>Comments: ${review_comments || 'None'}</p>`
        });
      }
    }

    res.json({ message: `Report status updated to ${status} successfully`, report: updated });
  } catch (error) {
    console.error('Status Update Error:', error);
    res.status(500).json({ message: 'Failed to update report status' });
  }
});

// 8. Delete Report (Staff can delete their reports, HOD can delete department reports, Admin can delete any report)
router.delete('/:id', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isHod = req.user.role === 'hod' && (report.department_id === req.user.department_id || !req.user.department_id || !report.department_id);
    const isOwner = report.staff_id === req.user.id;

    if (!isAdmin && !isHod && !isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this report' });
    }

    await db.deleteReport(reportId);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// 9. Download Word Report
router.get('/:id/word', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Role protection: Staff can only access their own report
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to download this report' });
    }

    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You do not have permission to download reports from another department' });
    }

    const { generateDocx } = await import('../services/docxGenerator.js');
    const docxBuffer = await generateDocx(report);

    // File naming rule: StaffReport_Dr_Kumar_IT_August_2026.docx
    const cleanStaff = report.staff_name ? report.staff_name.replace(/[\s\.]+/g, '_') : 'Staff';
    const cleanDept = report.department_name ? (report.department_name.toLowerCase().includes('information technology') ? 'IT' : report.department_name.replace(/[\s\.]+/g, '_')) : 'Dept';
    const year = report.academic_year ? report.academic_year.split('-')[0] : new Date().getFullYear();
    const filename = `StaffReport_${cleanStaff}_${cleanDept}_${report.month}_${year}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('Word Export Error:', error);
    res.status(500).json({ message: 'Failed to generate Word document' });
  }
});

// 10. Download PowerPoint Presentation
router.get('/:id/ppt', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Role protection
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to download this report' });
    }

    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You do not have permission to download reports from another department' });
    }

    const { generatePptx } = await import('../services/pptxGenerator.js');
    const pptxBuffer = await generatePptx(report);

    // File naming rule: StaffReport_Dr_Kumar_IT_August_2026.pptx
    const cleanStaff = report.staff_name ? report.staff_name.replace(/[\s\.]+/g, '_') : 'Staff';
    const cleanDept = report.department_name ? (report.department_name.toLowerCase().includes('information technology') ? 'IT' : report.department_name.replace(/[\s\.]+/g, '_')) : 'Dept';
    const year = report.academic_year ? report.academic_year.split('-')[0] : new Date().getFullYear();
    const filename = `StaffReport_${cleanStaff}_${cleanDept}_${report.month}_${year}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pptxBuffer);
  } catch (error) {
    console.error('PowerPoint Export Error:', error);
    res.status(500).json({ message: 'Failed to generate PowerPoint presentation' });
  }
});

// 11. Download PDF Report
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  const reportId = Number(req.params.id);

  try {
    const report = await db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Role protection
    if (req.user.role === 'staff' && report.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to download this report' });
    }

    if (req.user.role === 'hod' && report.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You do not have permission to download reports from another department' });
    }

    const { generatePdf } = await import('../services/pdfGenerator.js');
    const pdfBuffer = await generatePdf(report);

    // File naming rule: StaffReport_Dr_Kumar_IT_August_2026.pdf
    const cleanStaff = report.staff_name ? report.staff_name.replace(/[\s\.]+/g, '_') : 'Staff';
    const cleanDept = report.department_name ? (report.department_name.toLowerCase().includes('information technology') ? 'IT' : report.department_name.replace(/[\s\.]+/g, '_')) : 'Dept';
    const year = report.academic_year ? report.academic_year.split('-')[0] : new Date().getFullYear();
    const filename = `StaffReport_${cleanStaff}_${cleanDept}_${report.month}_${year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF document' });
  }
});

export default router;

