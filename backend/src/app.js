import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import libraryRoutes from './routes/libraryRoutes.js';
import commandRoutes from './routes/commandRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet());

// CORS — allow semua *.vercel.app dan localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    const customOrigin = process.env.CORS_ORIGIN;
    if (customOrigin && origin === customOrigin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));

// Morgan logging hanya di development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Glappy Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
