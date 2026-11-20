export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Book {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  categoryId: Category | string;
  publisher: string;
  isbn: string;
  language: string;
  pages: number;
  type: 'physical' | 'ebook';
  coverImage: string;
  pricing: {
    price: number;
    originalPrice: number;
    currency: string;
  };
  physical?: {
    stock: number;
    sku: string;
    weight?: number;
  };
  digital?: {
    fileKey: string;
    fileFormat: 'pdf' | 'epub';
    fileSize: number;
    downloadEnabled: boolean;
  };
  isFeatured: boolean;
  isBestSeller: boolean;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface CartItem {
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string;
    type: 'physical' | 'ebook';
    price: number;
    originalPrice: number;
    stock: number;
  };
  quantity: number;
  subtotal: number;
}

export interface Address {
  _id: string;
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    bookId: string;
    title: string;
    type: 'physical' | 'ebook';
    coverImage: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
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
    method: string;
    status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    paidAt?: string;
    razorpayOrderId?: string;
  };
  physicalStatus?: 'Processing' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingInfo?: {
    courierName?: string;
    trackingNumber?: string;
    updatedAt?: string;
  };
  digitalStatus?: 'Pending' | 'Available' | 'Refunded' | 'Access Revoked';
  hasPhysicalItems: boolean;
  hasDigitalItems: boolean;
  createdAt: string;
}

export interface EbookItem {
  purchaseId: string;
  purchasedAt: string;
  orderNumber: string;
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string;
    format: string;
    size: number;
  };
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}
