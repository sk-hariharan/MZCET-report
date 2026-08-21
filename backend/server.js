import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';

// Route imports
import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import analyticsRouter from './routes/analytics.js';
import documentsRouter from './routes/documents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists and is static
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Mount REST API endpoints
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/documents', documentsRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  res.status(500).json({ message: err.message || 'An unexpected server error occurred' });
});

// Bootstrapping function
async function startServer() {
  try {
    // 1. Initialize relational database (SQLite autoseed / Supabase configuration validation)
    await initializeDatabase();
    
    // 2. Start Express listener
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` MZCET FacultyReport API Server Running on port ${PORT}`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
