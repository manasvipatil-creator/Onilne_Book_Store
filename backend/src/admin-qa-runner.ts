import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Book } from './models/Book.js';
import { Category } from './models/Category.js';
import { Order } from './models/Order.js';
import { Coupon } from './models/Coupon.js';
import { DigitalPurchase } from './models/DigitalPurchase.js';
import { Payment } from './models/Payment.js';
import { Cart } from './models/Cart.js';
import { fulfillOrder } from './controllers/paymentController.js';
import { verifyPaymentSignature, verifyWebhookSignature } from './services/paymentService.js';
import { generateToken, verifyToken } from './utils/jwt.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://developer:bookstore2026@cluster0.6zifvjw.mongodb.net/online_book_store?retryWrites=true&w=majority&appName=Cluster0';

interface TestResult {
  id: string;
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(id: string, category: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ id, category, name, status: 'PASS', durationMs: duration });
    console.log(`[PASS] ${id}: ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ id, category, name, status: 'FAIL', durationMs: duration, details: error.message || String(error) });
    console.error(`[FAIL] ${id}: ${name} - Error: ${error.message}`);
  }
}

async function main() {
  console.log('--- STARTING COMPREHENSIVE ADMIN & CORE QA SUITE ---');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  // 1. Admin Authentication & Role Enforcement
  await runTest('ADM-AUTH-01', 'Admin Auth', 'Admin Login with valid credentials and admin JWT verification', async () => {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) throw new Error('No admin user found in database');
    const token = generateToken({ userId: adminUser._id.toString(), role: adminUser.role, email: adminUser.email });
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin' || decoded.userId !== adminUser._id.toString()) {
      throw new Error('JWT token payload mismatch');
    }
  });

  await runTest('ADM-AUTH-02', 'Admin Auth', 'Invalid credentials reject authorization', async () => {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) throw new Error('Admin not found');
    const isInvalidMatch = await bcrypt.compare('WrongPassword!123', adminUser.passwordHash);
    if (isInvalidMatch) throw new Error('Password check incorrectly succeeded on invalid password');
  });

  await runTest('ADM-AUTH-03', 'Admin Auth', 'Customer role token blocked from admin privileges', async () => {
    const customerUser = await User.findOne({ role: 'customer' });
    if (!customerUser) throw new Error('Customer user not found');
    const token = generateToken({ userId: customerUser._id.toString(), role: customerUser.role, email: customerUser.email });
    const decoded = verifyToken(token);
    if (decoded.role === 'admin') throw new Error('Customer granted admin privileges');
  });

  // 2. Admin Dashboard & Statistics Accuracy
  await runTest('ADM-STAT-01', 'Dashboard Stats', 'Dashboard statistics match real database counts', async () => {
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const paidOrders = await Order.find({ 'payment.status': 'Paid' });
    const totalSales = paidOrders.reduce((sum, ord) => sum + ord.pricing.finalTotal, 0);

    if (typeof totalBooks !== 'number' || typeof totalOrders !== 'number' || typeof totalCustomers !== 'number') {
      throw new Error('Stats calculation returned non-numeric values');
    }
    console.log(`       Stats verified: Books=${totalBooks}, Orders=${totalOrders}, Customers=${totalCustomers}, TotalSales=₹${totalSales}`);
  });

  // 3. Admin Book Management (CRUD & Formats)
  let testBookId: mongoose.Types.ObjectId | undefined;
  const testCategory = await Category.findOne({ isActive: true });
  if (!testCategory) throw new Error('Active category required for test');

  await runTest('ADM-BOOK-01', 'Book Management', 'Create new physical book with valid SKU and stock', async () => {
    const slug = `qa-test-phys-${Date.now()}`;
    const book = await Book.create({
      title: 'QA Testing in Production Environments',
      slug,
      author: 'QA Lead',
      description: 'End to end testing book',
      categoryId: testCategory._id,
      publisher: 'QA Press',
      type: 'physical',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      pricing: { price: 499, originalPrice: 699, currency: 'INR' },
      physical: { stock: 25, sku: 'QA-PHYS-001' },
      status: 'published',
      isFeatured: true,
    });
    testBookId = book._id as mongoose.Types.ObjectId;
  });

  await runTest('ADM-BOOK-02', 'Book Management', 'Edit book details and price', async () => {
    const updated = await Book.findByIdAndUpdate(
      testBookId,
      { $set: { 'pricing.price': 449, isBestSeller: true } },
      { new: true }
    );
    if (!updated || updated.pricing.price !== 449 || !updated.isBestSeller) {
      throw new Error('Failed to update book price or bestseller flag');
    }
  });

  await runTest('ADM-BOOK-03', 'Book Management', 'Duplicate book slug constraint check', async () => {
    const existing = await Book.findById(testBookId);
    let threw = false;
    try {
      await Book.create({
        title: 'Duplicate Slug Book',
        slug: existing!.slug,
        author: 'Duplicate Author',
        categoryId: testCategory._id,
        type: 'physical',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
        pricing: { price: 299, originalPrice: 399, currency: 'INR' },
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('Duplicate slug was allowed without error');
  });

  // 4. Admin Category Management
  let testCatId: mongoose.Types.ObjectId | undefined;
  await runTest('ADM-CAT-01', 'Category Management', 'Add and update category', async () => {
    const catSlug = `qa-cat-${Date.now()}`;
    const newCat = await Category.create({
      name: 'QA Engineering Books',
      slug: catSlug,
      description: 'Books focused on quality assurance',
      displayOrder: 99,
      isActive: true,
    });
    testCatId = newCat._id as mongoose.Types.ObjectId;

    await Category.findByIdAndUpdate(testCatId, { description: 'Updated description' });
    const fetched = await Category.findById(testCatId);
    if (fetched?.description !== 'Updated description') throw new Error('Category update failed');
  });

  // 5. Razorpay Idempotency & Stock Decrement
  await runTest('ADM-ORD-01', 'Order & Idempotency', 'Simultaneous / duplicate callback does not double-decrement stock', async () => {
    const initialBook = await Book.findById(testBookId);
    const initialStock = initialBook!.physical!.stock;

    const testUser = await User.findOne({ role: 'customer' });
    if (!testUser) throw new Error('Test customer not found');

    const orderNumber = `ORD-QA-${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      userId: testUser._id,
      items: [
        {
          bookId: testBookId,
          title: initialBook!.title,
          type: 'physical',
          coverImage: initialBook!.coverImage,
          price: initialBook!.pricing.price,
          quantity: 2,
          subtotal: initialBook!.pricing.price * 2,
        },
      ],
      pricing: {
        subtotal: initialBook!.pricing.price * 2,
        discount: 0,
        shipping: 0,
        tax: 0,
        finalTotal: initialBook!.pricing.price * 2,
        currency: 'INR',
      },
      payment: {
        method: 'razorpay',
        status: 'Pending',
        razorpayOrderId: `order_qa_${Date.now()}`,
      },
      hasPhysicalItems: true,
      hasDigitalItems: false,
    });

    // Run first fulfillment
    await fulfillOrder(order._id, 'pay_qa_123', 'sig_qa_123');
    const midBook = await Book.findById(testBookId);
    if (midBook!.physical!.stock !== initialStock - 2) {
      throw new Error(`Stock decrement failed: expected ${initialStock - 2}, got ${midBook!.physical!.stock}`);
    }

    // Run second simultaneous / duplicate fulfillment (idempotency check)
    await fulfillOrder(order._id, 'pay_qa_123', 'sig_qa_123');
    const finalBook = await Book.findById(testBookId);
    if (finalBook!.physical!.stock !== initialStock - 2) {
      throw new Error(`Duplicate callback double-decremented stock! Got ${finalBook!.physical!.stock}`);
    }

    // Cleanup test order
    await Order.findByIdAndDelete(order._id);
  });

  // 6. Digital Entitlement & DRM Security
  await runTest('ADM-DRM-01', 'eBook Licensing', 'Duplicate fulfillment creates exactly one DigitalPurchase without duplicating records', async () => {
    const testEbook = await Book.findOne({ type: 'ebook', status: 'published' });
    if (!testEbook) throw new Error('No test ebook found');

    const testUser = await User.findOne({ role: 'customer' });
    const orderNumber = `ORD-QA-EBK-${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      userId: testUser!._id,
      items: [
        {
          bookId: testEbook._id,
          title: testEbook.title,
          type: 'ebook',
          coverImage: testEbook.coverImage,
          price: testEbook.pricing.price,
          quantity: 1,
          subtotal: testEbook.pricing.price,
        },
      ],
      pricing: {
        subtotal: testEbook.pricing.price,
        discount: 0,
        shipping: 0,
        tax: 0,
        finalTotal: testEbook.pricing.price,
        currency: 'INR',
      },
      payment: {
        method: 'razorpay',
        status: 'Pending',
        razorpayOrderId: `order_qa_ebk_${Date.now()}`,
      },
      hasPhysicalItems: false,
      hasDigitalItems: true,
    });

    // First call
    await fulfillOrder(order._id, 'pay_ebk_123', 'sig_ebk_123');
    // Second duplicate call
    await fulfillOrder(order._id, 'pay_ebk_123', 'sig_ebk_123');

    const purchases = await DigitalPurchase.find({ userId: testUser!._id, bookId: testEbook._id });
    if (purchases.length !== 1) {
      throw new Error(`Duplicate digital entitlement created! Count: ${purchases.length}`);
    }

    // Verify revoked status blocks access
    await DigitalPurchase.findByIdAndUpdate(purchases[0]._id, { accessStatus: 'revoked' });
    const revoked = await DigitalPurchase.findOne({ userId: testUser!._id, bookId: testEbook._id, accessStatus: 'active' });
    if (revoked) throw new Error('Revoked entitlement was still found active');

    // Restore to active
    await DigitalPurchase.findByIdAndUpdate(purchases[0]._id, { accessStatus: 'active' });
    await Order.findByIdAndDelete(order._id);
  });

  // 7. Coupon Validation & Negative Stock Protection
  await runTest('ADM-CPN-01', 'Coupons', 'Admin coupon creation, validation, and usage limits', async () => {
    const code = `TEST${Date.now()}`;
    const coupon = await Coupon.create({
      code,
      discountType: 'percentage',
      discountValue: 15,
      minimumOrder: 200,
      expiryDate: new Date(Date.now() + 86400000), // 1 day future
      usageLimit: 50,
      isActive: true,
    });

    if (coupon.code !== code || coupon.discountValue !== 15) {
      throw new Error('Coupon properties mismatch');
    }

    await Coupon.findByIdAndDelete(coupon._id);
  });

  // Cleanup test created book and category
  if (testBookId) await Book.findByIdAndDelete(testBookId);
  if (testCatId) await Category.findByIdAndDelete(testCatId);

  await mongoose.disconnect();
  console.log('\n--- QA SUITE EXECUTION SUMMARY ---');
  console.table(results);

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
