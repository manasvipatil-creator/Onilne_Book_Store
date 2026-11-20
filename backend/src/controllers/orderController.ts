import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Book } from '../models/Book.js';
import { Order, IOrderItem } from '../models/Order.js';
import { Address } from '../models/Address.js';
import { Coupon } from '../models/Coupon.js';
import { Payment } from '../models/Payment.js';
import { DigitalPurchase } from '../models/DigitalPurchase.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/paymentService.js';
import { config } from '../config/env.js';

export const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { addressId, couponCode } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart is empty' });
      return;
    }

    // Step 1: Validate cart items and fresh database prices
    let subtotal = 0;
    let hasPhysicalItems = false;
    let hasDigitalItems = false;
    const orderItems: IOrderItem[] = [];

    for (const item of cart.items) {
      const book = await Book.findById(item.bookId);
      if (!book || book.status !== 'published') {
        res.status(400).json({
          success: false,
          message: `Book "${book?.title || 'Unknown'}" is currently unavailable.`,
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
        // Verify customer doesn't already own this eBook
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

    // Step 2: Shipping address requirement check
    let shippingAddressData = undefined;
    if (hasPhysicalItems) {
      if (!addressId) {
        res.status(400).json({
          success: false,
          message: 'Delivery address is required for physical books.',
        });
        return;
      }

      const addr = await Address.findOne({ _id: addressId, userId });
      if (!addr) {
        res.status(400).json({ success: false, message: 'Selected delivery address not found.' });
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

    // Step 3: Coupon validation & discount recalculation
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
          res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
          return;
        }
        if (subtotal < appliedCoupon.minimumOrder) {
          res.status(400).json({
            success: false,
            message: `Minimum order amount for this coupon is ₹${appliedCoupon.minimumOrder}`,
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

    // Physical shipping fee (free above ₹499)
    const shipping = hasPhysicalItems && subtotal < 500 ? 50 : 0;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST on books/services
    const finalTotal = Math.max(0, subtotal - discount + shipping + tax);

    // Step 4: Create Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Step 5: Initiate Razorpay Order
    const razorpayOrder = await createRazorpayOrder(finalTotal * 100, orderNumber, 'INR');

    // Step 6: Create Pending Order in Database
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

    // Step 7: Record Payment record
    await Payment.create({
      orderId: order._id,
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount: finalTotal,
      currency: 'INR',
      status: 'created',
    });

    res.json({
      success: true,
      message: 'Checkout initialized successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: finalTotal * 100,
        currency: 'INR',
        keyId: config.razorpay.keyId || 'rzp_test_bookstore_placeholder',
        isSimulated: (razorpayOrder as any).isSimulated || false,
      },
    });
  } catch (error: any) {
    console.error('[Checkout Error]:', error);
    res.status(500).json({ success: false, message: 'Checkout initialization failed', error: error.message });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.payment.status === 'Paid') {
      res.json({ success: true, message: 'Order has already been verified and paid.' });
      return;
    }

    // Verify signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      order.payment.status = 'Failed';
      await order.save();
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed', razorpayPaymentId, razorpaySignature }
      );
      res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
      return;
    }

    // Payment Success: Update order
    order.payment.status = 'Paid';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();

    if (order.hasPhysicalItems) {
      order.physicalStatus = 'Confirmed';
    }
    if (order.hasDigitalItems) {
      order.digitalStatus = 'Available';
    }

    await order.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'captured', razorpayPaymentId, razorpaySignature }
    );

    // Atomically decrement physical stock & create digital purchase records
    for (const item of order.items) {
      if (item.type === 'physical') {
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: { 'physical.stock': -item.quantity },
        });
      } else if (item.type === 'ebook') {
        await DigitalPurchase.findOneAndUpdate(
          { userId, bookId: item.bookId },
          {
            userId,
            bookId: item.bookId,
            orderId: order._id,
            accessStatus: 'active',
            purchasedAt: new Date(),
          },
          { upsert: true }
        );
      }
    }

    // Increment coupon usage if used
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { timesUsed: 1 } });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.json({
      success: true,
      message: 'Payment verified successfully and order placed!',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
  }
};

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

export const handleRazorpayWebhook = async (req: any, res: Response): Promise<void> => {
  // Webhook handler endpoint for asynchronous events from Razorpay
  res.json({ status: 'ok' });
};
