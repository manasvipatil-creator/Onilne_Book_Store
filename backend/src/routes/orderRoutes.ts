import { Router } from 'express';
import { checkout, verifyPayment, getOrders, getOrderById, handleRazorpayWebhook } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/checkout', authenticate, checkout);
router.post('/payments/verify', authenticate, verifyPayment);
router.post('/payments/webhook', handleRazorpayWebhook);
router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrderById);

export default router;
