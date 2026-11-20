import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Helmet & Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Parse JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads serving for covers
  app.use('/uploads/covers', express.static(path.resolve(process.cwd(), 'uploads', 'covers')));
  // Note: /uploads/ebooks is intentionally NOT served statically for private file protection

  // Health-check endpoint
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Online Book Store API',
      timestamp: new Date().toISOString(),
    });
  });

  // Base API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/books', bookRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/addresses', addressRoutes);
  app.use('/api/v1', orderRoutes);
  app.use('/api/v1/my-ebooks', ebookRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
  });

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });

  return app;
};
