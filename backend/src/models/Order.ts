import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  bookId: mongoose.Types.ObjectId;
  title: string;
  type: 'physical' | 'ebook';
  coverImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress?: {
    fullName: string;
    mobile: string;
    house: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    finalTotal: number;
    currency: string;
  };
  couponCode?: string;
  payment: {
    method: 'razorpay' | 'cod' | 'test';
    status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
  };
  physicalStatus?: 'Processing' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingInfo?: {
    courierName?: string;
    trackingNumber?: string;
    updatedAt?: Date;
  };
  digitalStatus?: 'Pending' | 'Available' | 'Refunded' | 'Access Revoked';
  hasPhysicalItems: boolean;
  hasDigitalItems: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['physical', 'ebook'], required: true },
    coverImage: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      mobile: String,
      house: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      finalTotal: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    couponCode: { type: String, default: '' },
    payment: {
      method: { type: String, default: 'razorpay' },
      status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
    physicalStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingInfo: {
      courierName: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      updatedAt: Date,
    },
    digitalStatus: {
      type: String,
      enum: ['Pending', 'Available', 'Refunded', 'Access Revoked'],
      default: 'Pending',
    },
    hasPhysicalItems: { type: Boolean, default: false },
    hasDigitalItems: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
