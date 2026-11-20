import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { seedInitialData } from './utils/seed.js';

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`[Server] Online Book Store Backend running on port ${config.port} (${config.nodeEnv})`);
      console.log(`[Server] Health check available at: http://localhost:${config.port}/api/v1/health`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${config.port} is already in use. Waiting 2s and retrying…`);
        setTimeout(() => {
          server.close();
          server.listen(config.port);
        }, 2000);
      } else {
        console.error('[Server] Unexpected error:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('[Server] Shutting down gracefully…');
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
