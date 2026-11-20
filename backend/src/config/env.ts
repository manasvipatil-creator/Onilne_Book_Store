import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_book_store',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_online_book_store_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin Manager',
    email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
};
