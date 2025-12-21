import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import { initializeBucket } from './config/minio';
import authRoutes from './routes/auth';
import assetsRoutes from './routes/assets';
import scenesRoutes from './routes/scenes';
import tokensRoutes from './routes/tokens';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/scenes', scenesRoutes);
app.use('/api/tokens', tokensRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize database and storage
const initialize = async () => {
  try {
    console.log('[Init] Starting initialization...');
    console.log('[Init] Environment variables:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('  - PORT:', process.env.PORT || '3001');
    console.log('  - MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT || 'not set');
    console.log('  - MINIO_PORT:', process.env.MINIO_PORT || 'not set');
    console.log('  - MINIO_BUCKET:', process.env.MINIO_BUCKET || 'not set');
    
    // Test database connection
    console.log('[Init] Testing database connection...');
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('[Init] Database connected successfully');
    console.log('  - Database name:', result.rows[0].db);
    console.log('  - Server time:', result.rows[0].now);

    // Initialize MinIO bucket
    console.log('[Init] Initializing MinIO...');
    await initializeBucket();
    console.log('[Init] MinIO initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log('[Server] ========================================');
      console.log('[Server] Server started successfully!');
      console.log('[Server] Port:', PORT);
      console.log('[Server] Environment:', process.env.NODE_ENV || 'development');
      console.log('[Server] Health check: http://localhost:' + PORT + '/health');
      console.log('[Server] ========================================');
    });
  } catch (error) {
    console.error('[Init] Failed to initialize:', error);
    if (error instanceof Error) {
      console.error('[Init] Error message:', error.message);
      console.error('[Init] Error stack:', error.stack);
    }
    process.exit(1);
  }
};

initialize();

