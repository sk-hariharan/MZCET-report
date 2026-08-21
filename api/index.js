import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase } from '../backend/db.js';

// Route imports
import authRouter from '../backend/routes/auth.js';
import reportsRouter from '../backend/routes/reports.js';
import analyticsRouter from '../backend/routes/analytics.js';
import documentsRouter from '../backend/routes/documents.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists (in /tmp for Vercel)
const uploadDir = path.resolve(process.env.VERCEL ? '/tmp/uploads' : 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error('Upload dir creation error:', e);
  }
}
app.use('/uploads', express.static(uploadDir));

// Initialize DB middleware for serverless cold starts
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }
  next();
});

// Mount REST API endpoints
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/documents', documentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local', 
    time: new Date() 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  res.status(500).json({ message: err.message || 'An unexpected server error occurred' });
});

export default app;
