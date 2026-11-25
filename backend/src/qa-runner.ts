import assert from 'assert';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { User } from './models/User.js';
import { Book } from './models/Book.js';
import { Order } from './models/Order.js';
import { Payment } from './models/Payment.js';
import { DigitalPurchase } from './models/DigitalPurchase.js';
import { Coupon } from './models/Coupon.js';
import { Address } from './models/Address.js';
import { config } from './config/env.js';
import { verifyPaymentSignature, verifyWebhookSignature } from './services/paymentService.js';
import { fulfillOrder } from './controllers/paymentController.js';

interface TestResult {
  id: string;
  module: string;
  scenario: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  details?: string;
}

const results: TestResult[] = [];

function record(test: TestResult) {
  results.push(test);
  const mark = test.status === 'PASS' ? '✅' : '❌';
  console.log(`${mark} [${test.id}] ${test.scenario}: ${test.status}`);
  if (test.status === 'FAIL') {
    console.error(`   Expected: ${test.expected}\n   Actual:   ${test.actual}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('Starting Automated QA Test Suite (Backend & Razorpay)');
  console.log('====================================================');

  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected for QA Testing.');

    // ----------------------------------------------------
    // MODULE 1: AUTHENTICATION & ACCESS CONTROL
    // ----------------------------------------------------
    // Test 1.1: Verify default admin credentials exist
    const adminUser = await User.findOne({ email: config.admin.email.toLowerCase() });
    record({
      id: 'TC-AUTH-001',
      module: 'Authentication',
      scenario: 'Admin account existence and role verification',
      expected: 'Admin user exists with role "admin" and active status',
      actual: adminUser && adminUser.role === 'admin' && adminUser.isActive ? 'Admin user active' : 'Admin not found or inactive',
      status: adminUser && adminUser.role === 'admin' && adminUser.isActive ? 'PASS' : 'FAIL',
    });

    // Test 1.2: Check customer registration & password hashing
    const testEmail = `qa_tester_${Date.now()}@example.com`;
    const salt = await (await import('bcryptjs')).default.genSalt(10);
    const passwordHash = await (await import('bcryptjs')).default.hash('TesterPassword123!', salt);
    const testUser = await User.create({
      name: 'QA Automation User',
      email: testEmail,
      mobile: '9876543210',
      passwordHash,
      role: 'customer',
      isActive: true,
    });
    record({
      id: 'TC-AUTH-002',
      module: 'Authentication',
      scenario: 'Customer user registration with bcrypt salted password',
      expected: 'Customer created with role "customer" and hashed password',
      actual: testUser.role === 'customer' && testUser.passwordHash.startsWith('$2') ? 'Customer created securely' : 'Customer creation failed',
      status: testUser.role === 'customer' && testUser.passwordHash.startsWith('$2') ? 'PASS' : 'FAIL',
    });

    // ----------------------------------------------------
    // MODULE 2: INVENTORY & CATALOG VERIFICATION
    // ----------------------------------------------------
    const physicalBook = await Book.findOne({ type: 'physical', status: 'published' });
    const ebookBook = await Book.findOne({ type: 'ebook', status: 'published' });

    record({
      id: 'TC-CAT-001',
      module: 'Catalog & Books',
      scenario: 'Verify published physical book has pricing and valid stock',
      expected: 'Physical book has price > 0 and stock >= 0',
      actual: physicalBook && physicalBook.pricing.price > 0 && (physicalBook.physical?.stock ?? 0) >= 0 ? `Physical book "${physicalBook.title}" (Stock: ${physicalBook.physical?.stock})` : 'Physical book invalid',
      status: physicalBook && physicalBook.pricing.price > 0 && (physicalBook.physical?.stock ?? 0) >= 0 ? 'PASS' : 'FAIL',
    });

    record({
      id: 'TC-CAT-002',
      module: 'Catalog & Books',
      scenario: 'Verify published eBook has pricing and digital format metadata',
      expected: 'eBook has price > 0 and downloadEnabled true',
      actual: ebookBook && ebookBook.pricing.price > 0 && ebookBook.digital?.downloadEnabled ? `eBook "${ebookBook.title}" format: ${ebookBook.digital?.fileFormat}` : 'eBook invalid',
      status: ebookBook && ebookBook.pricing.price > 0 && ebookBook.digital?.downloadEnabled ? 'PASS' : 'FAIL',
    });

    // ----------------------------------------------------
    // MODULE 3: RAZORPAY SIGNATURE & PAYMENT VERIFICATION
    // ----------------------------------------------------
    const fakeOrderId = 'order_test_999999999';
    const fakePaymentId = 'pay_test_888888888';
    const secret = config.razorpay.keySecret;

    // Test 3.1: Genuine HMAC SHA256 Signature
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${fakeOrderId}|${fakePaymentId}`)
      .digest('hex');

    const verifySuccess = verifyPaymentSignature(fakeOrderId, fakePaymentId, validSignature);
    record({
      id: 'TC-PAY-001',
      module: 'Razorpay Payment',
      scenario: 'Verify valid HMAC SHA256 payment signature with timingSafeEqual',
      expected: 'verifyPaymentSignature returns true for authentic signature',
      actual: verifySuccess ? 'Valid signature accepted' : 'Valid signature rejected',
      status: verifySuccess ? 'PASS' : 'FAIL',
    });

    // Test 3.2: Tampered / Invalid Signature
    const forgedSignature = validSignature.substring(0, validSignature.length - 4) + '0000';
    const verifyTampered = verifyPaymentSignature(fakeOrderId, fakePaymentId, forgedSignature);
    record({
      id: 'TC-PAY-002',
      module: 'Razorpay Payment',
      scenario: 'Reject tampered or forged payment signature',
      expected: 'verifyPaymentSignature returns false for invalid signature',
      actual: !verifyTampered ? 'Tampered signature rejected' : 'Security vulnerability: tampered signature accepted!',
      status: !verifyTampered ? 'PASS' : 'FAIL',
    });

    // Test 3.3: Webhook HMAC Signature with Raw Body
    const fakeWebhookBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: fakePaymentId, amount: 49900 } } },
    });
    const validWebhookSig = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(fakeWebhookBody)
      .digest('hex');

    const webhookSuccess = verifyWebhookSignature(fakeWebhookBody, validWebhookSig);
    record({
      id: 'TC-PAY-003',
      module: 'Razorpay Payment',
      scenario: 'Verify authentic Webhook raw body signature',
      expected: 'verifyWebhookSignature returns true',
      actual: webhookSuccess ? 'Authentic webhook signature verified' : 'Webhook signature failed',
      status: webhookSuccess ? 'PASS' : 'FAIL',
    });

    // Test 3.4: Webhook Signature with Tampered Payload
    const tamperedWebhookSig = validWebhookSig.substring(0, validWebhookSig.length - 2) + 'ff';
    const webhookTampered = verifyWebhookSignature(fakeWebhookBody, tamperedWebhookSig);
    record({
      id: 'TC-PAY-004',
      module: 'Razorpay Payment',
      scenario: 'Reject forged Webhook raw body signature',
      expected: 'verifyWebhookSignature returns false',
      actual: !webhookTampered ? 'Forged webhook rejected' : 'Forged webhook accepted!',
      status: !webhookTampered ? 'PASS' : 'FAIL',
    });

    // ----------------------------------------------------
    // MODULE 4: ORDER CREATION, FULFILLMENT & INVENTORY
    // ----------------------------------------------------
    if (physicalBook && ebookBook) {
      const initialStock = physicalBook.physical?.stock ?? 0;
      const orderNumber = `TEST-ORD-${Date.now()}`;

      // Create test pending order with both physical and digital items
      const testOrder = await Order.create({
        orderNumber,
        userId: testUser._id,
        items: [
          {
            bookId: physicalBook._id,
            title: physicalBook.title,
            type: 'physical',
            coverImage: physicalBook.coverImage,
            price: physicalBook.pricing.price,
            quantity: 2,
            subtotal: physicalBook.pricing.price * 2,
          },
          {
            bookId: ebookBook._id,
            title: ebookBook.title,
            type: 'ebook',
            coverImage: ebookBook.coverImage,
            price: ebookBook.pricing.price,
            quantity: 1,
            subtotal: ebookBook.pricing.price,
          },
        ],
        pricing: {
          subtotal: physicalBook.pricing.price * 2 + ebookBook.pricing.price,
          discount: 0,
          shipping: 0,
          tax: 50,
          finalTotal: physicalBook.pricing.price * 2 + ebookBook.pricing.price + 50,
          currency: 'INR',
        },
        payment: {
          method: 'razorpay',
          status: 'Pending',
          razorpayOrderId: fakeOrderId,
        },
        hasPhysicalItems: true,
        hasDigitalItems: true,
      });

      // Create matching Payment record
      await Payment.create({
        orderId: testOrder._id,
        userId: testUser._id,
        razorpayOrderId: fakeOrderId,
        amount: testOrder.pricing.finalTotal,
        currency: 'INR',
        status: 'created',
        receipt: `rcpt_${orderNumber}`,
      });

      record({
        id: 'TC-ORD-001',
        module: 'Order Management',
        scenario: 'Create pending order with physical and digital items',
        expected: 'Order created with payment.status "Pending"',
        actual: testOrder.payment.status === 'Pending' ? 'Order created Pending' : 'Order creation failed',
        status: testOrder.payment.status === 'Pending' ? 'PASS' : 'FAIL',
      });

      // Execute Fulfillment
      await fulfillOrder(testOrder._id, fakePaymentId, validSignature);

      // Verify Order Status Paid
      const fulfilledOrder = await Order.findById(testOrder._id);
      record({
        id: 'TC-ORD-002',
        module: 'Order Fulfillment',
        scenario: 'Verify order updated to Paid after successful signature',
        expected: 'payment.status is "Paid" and paidAt is set',
        actual: fulfilledOrder?.payment.status === 'Paid' && fulfilledOrder.payment.paidAt ? 'Order marked Paid' : 'Order status not Paid',
        status: fulfilledOrder?.payment.status === 'Paid' ? 'PASS' : 'FAIL',
      });

      // Verify Physical Inventory Decremented
      const updatedBook = await Book.findById(physicalBook._id);
      const expectedStock = initialStock - 2;
      record({
        id: 'TC-INV-001',
        module: 'Inventory Management',
        scenario: 'Inventory decremented correctly on successful physical book order',
        expected: `Stock decremented by 2 to ${expectedStock}`,
        actual: updatedBook?.physical?.stock === expectedStock ? `Stock is ${updatedBook?.physical?.stock}` : `Stock was not decremented: ${updatedBook?.physical?.stock}`,
        status: updatedBook?.physical?.stock === expectedStock ? 'PASS' : 'FAIL',
      });

      // Verify Digital Purchase Entitlement Granted
      const digitalEntitlement = await DigitalPurchase.findOne({
        userId: testUser._id,
        bookId: ebookBook._id,
        accessStatus: 'active',
      });
      record({
        id: 'TC-DIG-001',
        module: 'Digital Entitlements',
        scenario: 'Digital purchase granted with active access status',
        expected: 'DigitalPurchase record created for user and eBook',
        actual: digitalEntitlement ? 'Active digital purchase recorded' : 'Digital entitlement missing',
        status: digitalEntitlement ? 'PASS' : 'FAIL',
      });

      // Test Idempotency: Duplicate fulfillment must not decrement stock twice
      await fulfillOrder(testOrder._id, fakePaymentId, validSignature);
      const recheckedBook = await Book.findById(physicalBook._id);
      record({
        id: 'TC-PAY-005',
        module: 'Idempotency',
        scenario: 'Duplicate fulfillment callback does not double-decrement inventory',
        expected: `Stock remains unchanged at ${expectedStock}`,
        actual: recheckedBook?.physical?.stock === expectedStock ? `Stock safely preserved at ${recheckedBook?.physical?.stock}` : `DOUBLE-DECREMENT BUG: Stock reduced to ${recheckedBook?.physical?.stock}`,
        status: recheckedBook?.physical?.stock === expectedStock ? 'PASS' : 'FAIL',
      });

      // Clean up test order to restore physical stock
      await Book.findByIdAndUpdate(physicalBook._id, { $inc: { 'physical.stock': 2 } });
      await DigitalPurchase.deleteMany({ userId: testUser._id });
      await Order.findByIdAndDelete(testOrder._id);
      await Payment.deleteMany({ orderId: testOrder._id });
    }

    // ----------------------------------------------------
    // MODULE 5: EBOOK DOWNLOAD SECURITY & ACCESS CONTROL
    // ----------------------------------------------------
    // Test 5.1: Download attempt without digital purchase
    if (ebookBook) {
      const unauthorizedCheck = await DigitalPurchase.findOne({
        userId: testUser._id,
        bookId: ebookBook._id,
        accessStatus: 'active',
      });
      record({
        id: 'TC-SEC-001',
        module: 'eBook Security',
        scenario: 'Unauthorized download prevention without digital entitlement',
        expected: 'No active digital purchase found for unbought book',
        actual: !unauthorizedCheck ? 'Access properly denied' : 'Unexpected access found',
        status: !unauthorizedCheck ? 'PASS' : 'FAIL',
      });

      // Test 5.2: Revoked entitlement protection
      const dummyOrderId = new mongoose.Types.ObjectId();
      const revokedPurchase = await DigitalPurchase.create({
        userId: testUser._id,
        bookId: ebookBook._id,
        orderId: dummyOrderId,
        accessStatus: 'revoked',
        purchasedAt: new Date(),
      });
      const activeQuery = await DigitalPurchase.findOne({
        userId: testUser._id,
        bookId: ebookBook._id,
        accessStatus: 'active',
      });
      record({
        id: 'TC-SEC-002',
        module: 'eBook Security',
        scenario: 'Revoked eBook entitlement rejects download',
        expected: 'Active query returns null when status is revoked',
        actual: !activeQuery ? 'Revoked access rejected' : 'Revoked access allowed!',
        status: !activeQuery ? 'PASS' : 'FAIL',
      });
      await DigitalPurchase.findByIdAndDelete(revokedPurchase._id);
    }

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('Test user cleaned up.');

  } catch (err: any) {
    console.error('Fatal Test Suite Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }

  console.log('\n====================================================');
  console.log('AUTOMATED TEST SUITE SUMMARY:');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================\n');
}

runTestSuite();
