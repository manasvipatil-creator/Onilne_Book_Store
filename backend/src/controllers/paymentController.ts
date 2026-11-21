import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Book } from '../models/Book.js';
import { Order, IOrderItem } from '../models/Order.js';
import { Address } from '../models/Address.js';
import { Coupon } from '../models/Coupon.js';
import { Payment } from '../models/Payment.js';
import { DigitalPurchase } from '../models/DigitalPurchase.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  refundRazorpayPayment,
} from '../services/paymentService.js';
import { config } from '../config/env.js';

/**
 * Helper to execute post-payment actions idempotently
 */
export const fulfillOrder = async (
  orderId: string | mongoose.Types.ObjectId,
  razorpayPaymentId?: string,
  razorpaySignature?: string,
  paymentMethod: string = 'razorpay'
) => {
  const order = await Order.findById(orderId);
  if (!order) return null;

  if (order.payment.status === 'Paid') {
    return order; // Already fulfilled
  }

  // Mark Paid
  order.payment.status = 'Paid';
  order.payment.method = 'razorpay';
  if (razorpayPaymentId) order.payment.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) order.payment.razorpaySignature = razorpaySignature;
  order.payment.paidAt = new Date();

  if (order.hasPhysicalItems) {
    order.physicalStatus = 'Confirmed';
  }
  if (order.hasDigitalItems) {
    order.digitalStatus = 'Available';
  }

  await order.save();

  // Update Payment entity
  await Payment.findOneAndUpdate(
    { orderId: order._id },
    {
      status: 'captured',
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    }
  );

  // Decrement physical stock & grant digital eBook access
  for (const item of order.items) {
    if (item.type === 'physical') {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { 'physical.stock': -item.quantity },
      });
    } else if (item.type === 'ebook') {
      await DigitalPurchase.findOneAndUpdate(
        { userId: order.userId, bookId: item.bookId },
        {
          userId: order.userId,
          bookId: item.bookId,
          orderId: order._id,
          accessStatus: 'active',
          purchasedAt: new Date(),
        },
        { upsert: true }
      );
    }
  }

  // Increment coupon usage
  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { timesUsed: 1 } });
  }

  // Clear customer cart
  await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

  return order;
};

/**
 * 1. POST /api/v1/payment/create-order (and /api/v1/checkout)
 * Validates cart/product and creates server-calculated Razorpay order
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { addressId, couponCode, bookId, quantity = 1 } = req.body;

    let subtotal = 0;
    let hasPhysicalItems = false;
    let hasDigitalItems = false;
    const orderItems: IOrderItem[] = [];

    // Support both direct "Buy Now" (single book) and Cart checkout
    if (bookId) {
      const book = await Book.findById(bookId);
      if (!book || book.status !== 'published') {
        res.status(400).json({ success: false, message: 'Book is currently unavailable.' });
        return;
      }

      if (book.type === 'physical') {
        hasPhysicalItems = true;
        if ((book.physical?.stock ?? 0) < quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for "${book.title}". Available: ${book.physical?.stock || 0}`,
          });
          return;
        }
      } else {
        hasDigitalItems = true;
        const alreadyPurchased = await DigitalPurchase.findOne({
          userId,
          bookId: book._id,
          accessStatus: 'active',
        });
        if (alreadyPurchased) {
          res.status(400).json({
            success: false,
            message: `You already own "${book.title}".`,
          });
          return;
        }
      }

      const itemQty = book.type === 'ebook' ? 1 : quantity;
      const itemSubtotal = book.pricing.price * itemQty;
      subtotal = itemSubtotal;

      orderItems.push({
        bookId: book._id as mongoose.Types.ObjectId,
        title: book.title,
        type: book.type,
        coverImage: book.coverImage,
        price: book.pricing.price,
        quantity: itemQty,
        subtotal: itemSubtotal,
      });
    } else {
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
        return;
      }

      for (const item of cart.items) {
        const book = await Book.findById(item.bookId);
        if (!book || book.status !== 'published') {
          res.status(400).json({
            success: false,
            message: `Book "${book?.title || 'Unknown'}" is unavailable.`,
          });
          return;
        }

        if (book.type === 'physical') {
          hasPhysicalItems = true;
          if ((book.physical?.stock ?? 0) < item.quantity) {
            res.status(400).json({
              success: false,
              message: `Insufficient stock for "${book.title}". Available: ${book.physical?.stock || 0}`,
            });
            return;
          }
        } else {
          hasDigitalItems = true;
          const alreadyPurchased = await DigitalPurchase.findOne({
            userId,
            bookId: book._id,
            accessStatus: 'active',
          });
          if (alreadyPurchased) {
            res.status(400).json({
              success: false,
              message: `You already own "${book.title}". Please remove it from your cart.`,
            });
            return;
          }
        }

        const itemQty = book.type === 'ebook' ? 1 : item.quantity;
        const itemPrice = book.pricing.price;
        const itemSubtotal = itemPrice * itemQty;
        subtotal += itemSubtotal;

        orderItems.push({
          bookId: book._id as mongoose.Types.ObjectId,
          title: book.title,
          type: book.type,
          coverImage: book.coverImage,
          price: itemPrice,
          quantity: itemQty,
          subtotal: itemSubtotal,
        });
      }
    }

    // Physical shipping validation
    let shippingAddressData = undefined;
    if (hasPhysicalItems) {
      if (!addressId) {
        res.status(400).json({
          success: false,
          message: 'Delivery address is required for physical book orders.',
        });
        return;
      }

      const addr = await Address.findOne({ _id: addressId, userId });
      if (!addr) {
        res.status(400).json({ success: false, message: 'Selected delivery address was not found.' });
        return;
      }

      shippingAddressData = {
        fullName: addr.fullName,
        mobile: addr.mobile,
        house: addr.house,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country,
      };
    }

    // Server-side coupon calculation
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (appliedCoupon) {
        if (new Date() > appliedCoupon.expiryDate) {
          res.status(400).json({ success: false, message: 'Coupon code has expired.' });
          return;
        }
        if (appliedCoupon.timesUsed >= appliedCoupon.usageLimit) {
          res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
          return;
        }
        if (subtotal < appliedCoupon.minimumOrder) {
          res.status(400).json({
            success: false,
            message: `Minimum order amount for coupon is ₹${appliedCoupon.minimumOrder}`,
          });
          return;
        }

        if (appliedCoupon.discountType === 'percentage') {
          discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        } else {
          discount = Math.min(subtotal, appliedCoupon.discountValue);
        }
      } else {
        res.status(400).json({ success: false, message: 'Invalid coupon code.' });
        return;
      }
    }

    // Shipping fee calculation (Free above ₹499 for physical)
    const shipping = hasPhysicalItems && subtotal < 500 ? 50 : 0;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
    const finalTotal = Math.max(1, subtotal - discount + shipping + tax); // minimum 1 INR for payment gateway

    // Generate unique receipt & order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt = `rcpt_${orderNumber.replace(/[^a-zA-Z0-9]/g, '_')}`.substring(0, 40);

    // Create Razorpay Order with server-calculated amount in paise
    const amountInPaise = finalTotal * 100;
    const userDoc = await User.findById(userId);

    const razorpayOrder = await createRazorpayOrder(amountInPaise, receipt, {
      userId: String(userId),
      orderNumber,
      userEmail: userDoc?.email || '',
      userName: userDoc?.name || '',
    });

    // Save Order in database with status Pending
    const order = await Order.create({
      orderNumber,
      userId,
      items: orderItems,
      shippingAddress: shippingAddressData,
      pricing: {
        subtotal,
        discount,
        shipping,
        tax,
        finalTotal,
        currency: 'INR',
      },
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      payment: {
        method: 'razorpay',
        status: 'Pending',
        razorpayOrderId: razorpayOrder.id,
      },
      physicalStatus: hasPhysicalItems ? 'Processing' : undefined,
      digitalStatus: hasDigitalItems ? 'Pending' : undefined,
      hasPhysicalItems,
      hasDigitalItems,
    });

    // Save Payment record with status 'created'
    await Payment.create({
      orderId: order._id,
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount: finalTotal,
      currency: 'INR',
      status: 'created',
      receipt,
      notes: {
        orderNumber,
        userId: String(userId),
      },
    });

    res.json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: config.razorpay.keyId,
        user: {
          name: userDoc?.name || '',
          email: userDoc?.email || '',
          mobile: userDoc?.mobile || '',
        },
      },
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};

/**
 * 2. POST /api/v1/payment/verify
 * Validates Razorpay HMAC SHA256 signature using timingSafeEqual
 */
export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters.',
      });
      return;
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Idempotent: If order is already paid, return success immediately
    if (order.payment.status === 'Paid') {
      res.json({
        success: true,
        message: 'Order has already been verified and paid.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentId: order.payment.razorpayPaymentId,
        },
      });
      return;
    }

    // Timing-safe signature check
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      order.payment.status = 'Failed';
      await order.save();
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed', razorpayPaymentId, razorpaySignature }
      );
      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid digital signature.',
      });
      return;
    }

    // Fulfill order
    await fulfillOrder(order._id, razorpayPaymentId, razorpaySignature);

    res.json({
      success: true,
      message: 'Payment verified successfully and order confirmed!',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentId: razorpayPaymentId,
        amount: order.pricing.finalTotal,
      },
    });
  } catch (error: any) {
    console.error('[Verify Payment Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

/**
 * 3. POST /api/v1/payment/webhook
 * Handles Razorpay webhook events idempotently with raw body verification
 */
export const handleWebhook = async (req: any, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      res.status(400).json({ success: false, message: 'Missing X-Razorpay-Signature header' });
      return;
    }

    // Use rawBody buffer attached by express.json({ verify: ... })
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature as string);

    if (!isValid) {
      console.warn('[Webhook Warning]: Invalid Razorpay webhook signature');
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received]: event=${event}`);

    switch (event) {
      case 'payment.captured': {
        const paymentEntity = payload.payment?.entity;
        if (paymentEntity?.order_id) {
          const razorpayOrderId = paymentEntity.order_id;
          const razorpayPaymentId = paymentEntity.id;
          const method = paymentEntity.method;

          const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
          if (order) {
            await fulfillOrder(order._id, razorpayPaymentId, undefined, method);
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payment?.entity;
        if (paymentEntity?.order_id) {
          const razorpayOrderId = paymentEntity.order_id;
          const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
          if (order && order.payment.status !== 'Paid') {
            order.payment.status = 'Failed';
            await order.save();
            await Payment.findOneAndUpdate(
              { razorpayOrderId },
              { status: 'failed', rawPayload: paymentEntity }
            );
          }
        }
        break;
      }

      case 'order.paid': {
        const orderEntity = payload.order?.entity;
        if (orderEntity?.id) {
          const razorpayOrderId = orderEntity.id;
          const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
          if (order) {
            await fulfillOrder(order._id);
          }
        }
        break;
      }

      case 'refund.processed': {
        const refundEntity = payload.refund?.entity;
        if (refundEntity?.payment_id) {
          const razorpayPaymentId = refundEntity.payment_id;
          const order = await Order.findOne({ 'payment.razorpayPaymentId': razorpayPaymentId });
          if (order) {
            order.payment.status = 'Refunded';
            if (order.hasDigitalItems) order.digitalStatus = 'Refunded';
            if (order.hasPhysicalItems) order.physicalStatus = 'Cancelled';
            await order.save();

            await Payment.findOneAndUpdate(
              { razorpayPaymentId },
              { status: 'refunded', refundId: refundEntity.id }
            );
          }
        }
        break;
      }

      default:
        console.log(`[Unhandled Razorpay event]: ${event}`);
    }

    res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Webhook Processing Error]:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed', error: error.message });
  }
};

/**
 * 4. POST /api/v1/payment/refund (Admin Only)
 * Issues refund using Razorpay Payments API
 */
export const processRefund = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, amount, notes } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, message: 'Order ID is required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const paymentId = order.payment.razorpayPaymentId;
    if (!paymentId) {
      res.status(400).json({
        success: false,
        message: 'Order does not have an associated Razorpay Payment ID to refund.',
      });
      return;
    }

    // Amount in paise if partial refund requested
    const amountInPaise = amount ? Math.round(Number(amount) * 100) : undefined;
    const refundResult = await refundRazorpayPayment(paymentId, amountInPaise, notes);

    // Update Order & Payment
    order.payment.status = 'Refunded';
    if (order.hasDigitalItems) order.digitalStatus = 'Refunded';
    if (order.hasPhysicalItems) order.physicalStatus = 'Cancelled';
    await order.save();

    await Payment.findOneAndUpdate(
      { orderId: order._id },
      { status: 'refunded', refundId: refundResult.id }
    );

    // Revoke digital purchases if refunded
    if (order.hasDigitalItems) {
      await DigitalPurchase.updateMany(
        { orderId: order._id },
        { accessStatus: 'revoked' }
      );
    }

    res.json({
      success: true,
      message: 'Refund processed successfully via Razorpay',
      data: {
        refundId: refundResult.id,
        amount: refundResult.amount / 100,
        status: refundResult.status,
      },
    });
  } catch (error: any) {
    console.error('[Refund Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};
