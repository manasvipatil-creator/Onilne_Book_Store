import { Response } from 'express';
import { Order } from '../models/Order.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export {
  createOrder as checkout,
  verifyPayment,
  handleWebhook as handleRazorpayWebhook,
} from './paymentController.js';

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { orders } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, data: { order } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};
