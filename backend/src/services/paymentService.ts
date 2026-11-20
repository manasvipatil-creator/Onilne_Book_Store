import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

// Only initialize real Razorpay SDK if valid credentials are provided (not placeholders)
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

export const createRazorpayOrder = async (
  amountInPenceOrPaise: number,
  receipt: string,
  currency: string = 'INR'
) => {
  if (!razorpayInstance) {
    // If Razorpay test keys are not configured yet, generate a structured simulation ID
    return {
      id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      amount: amountInPenceOrPaise,
      currency,
      receipt,
      status: 'created',
      isSimulated: true,
    };
  }

  return await razorpayInstance.orders.create({
    amount: Math.round(amountInPenceOrPaise),
    currency,
    receipt,
  });
};

export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  if (razorpayOrderId.startsWith('order_sim_')) {
    // Simulated order signature validation for developer testing mode
    return razorpaySignature === `sim_sig_${razorpayOrderId}`;
  }

  if (!config.razorpay.keySecret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

export const verifyWebhookSignature = (body: string, signature: string): boolean => {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(body)
    .digest('hex');
  return expected === signature;
};
