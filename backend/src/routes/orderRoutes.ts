import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.js';
import { getOrders, getOrderById } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Checkout / Order Creation (Maintains backwards compatibility)
router.post('/checkout', authenticate, createOrder);

// Payment Verification
router.post('/payments/verify', authenticate, verifyPayment);

// Razorpay Webhooks
router.post('/payments/webhook', handleWebhook);

// Customer Orders & History
router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrderById);

export default router;
