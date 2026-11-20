import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seed.js';

const run = async () => {
  await connectDB();
  await seedInitialData();
  await mongoose.disconnect();
  console.log('[Seed] Finished successfully.');
  process.exit(0);
};

run();
