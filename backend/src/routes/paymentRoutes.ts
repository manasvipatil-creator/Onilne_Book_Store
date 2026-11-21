import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  processRefund,
} from '../controllers/paymentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rate limiting on sensitive payment endpoints
const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 payment requests per window per IP
  message: {
    success: false,
    message: 'Too many payment requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. Create Order
router.post('/create-order', authenticate, paymentRateLimiter, createOrder);

// 2. Verify Payment
router.post('/verify', authenticate, paymentRateLimiter, verifyPayment);

// 3. Webhook (Public, raw signature verification inside controller)
router.post('/webhook', handleWebhook);

// 4. Admin Refund
router.post('/refund', authenticate, requireAdmin, processRefund);

export default router;
