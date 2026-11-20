import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Mongoose will auto-reconnect…');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnected successfully.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });
  } catch (err: any) {
    console.error(`[MongoDB] Failed to connect: ${err.message}`);
    // Re-throw so server startup fails loudly instead of running disconnected
    throw err;
  }
};
