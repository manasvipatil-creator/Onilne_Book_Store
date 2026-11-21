import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

// Initialize official Razorpay SDK
if (
  config.razorpay.keyId &&
  config.razorpay.keySecret &&
  !config.razorpay.keyId.includes('placeholder') &&
  !config.razorpay.keySecret.includes('placeholder')
) {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

/**
 * Creates an order in Razorpay
 * @param amountInPaise integer amount in paise
 * @param receipt unique receipt identifier
 * @param notes metadata notes
 * @param currency currency code, default INR
 */
export const createRazorpayOrder = async (
  amountInPaise: number,
  receipt: string,
  notes: Record<string, any> = {},
  currency: string = 'INR'
) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay client is not initialized. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return await razorpayInstance.orders.create({
    amount: Math.round(amountInPaise),
    currency,
    receipt,
    notes,
  });
};

/**
 * Verifies Razorpay HMAC SHA256 payment signature using timingSafeEqual
 */
export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  if (!config.razorpay.keySecret) {
    return false;
  }

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(razorpaySignature, 'utf-8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Signature Verification Error]:', err);
    return false;
  }
};

/**
 * Verifies Razorpay Webhook signature using raw payload buffer
 */
export const verifyWebhookSignature = (rawBody: string | Buffer, signature: string): boolean => {
  if (!config.razorpay.webhookSecret) {
    console.warn('[Webhook Warning]: RAZORPAY_WEBHOOK_SECRET is not configured.');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Webhook Signature Error]:', err);
    return false;
  }
};

/**
 * Initiates refund through Razorpay Payments API
 */
export const refundRazorpayPayment = async (
  paymentId: string,
  amountInPaise?: number,
  notes: Record<string, any> = {}
) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay client is not initialized.');
  }

  const payload: any = { notes };
  if (amountInPaise && amountInPaise > 0) {
    payload.amount = Math.round(amountInPaise);
  }

  return await (razorpayInstance.payments as any).refund(paymentId, payload);
};
