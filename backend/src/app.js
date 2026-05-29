import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import libraryRoutes from './routes/libraryRoutes.js';
import commandRoutes from './routes/commandRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { testDatabaseConnection } from './services/databaseService.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Happy Instalasi Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database test endpoint
app.get('/api/db/test', async (req, res) => {
  try {
    const result = await testDatabaseConnection();
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(500).json({ success: false, message: result.message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Database test failed' });
  }
});

// API Routes
app.use('/api/libraries', libraryRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
