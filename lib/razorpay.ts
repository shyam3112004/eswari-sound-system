import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dev';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dev_secret';

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});

/**
 * Creates a Razorpay order for the 25% booking advance
 */
export async function createPaymentOrder(params: {
  amountInPaise: number;
  receiptId: string;
  notes?: Record<string, string>;
}) {
  // If test placeholder keys, generate deterministic mock order
  if (key_id === 'rzp_test_dev' || key_secret === 'dev_secret') {
    return {
      id: `order_mock_${Date.now()}`,
      entity: 'order',
      amount: params.amountInPaise,
      amount_paid: 0,
      amount_due: params.amountInPaise,
      currency: 'INR',
      receipt: params.receiptId,
      status: 'created',
      notes: params.notes || {},
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
  }

  return await razorpay.orders.create({
    amount: params.amountInPaise,
    currency: 'INR',
    receipt: params.receiptId,
    notes: params.notes,
  });
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  // Allow test simulator signature in development
  if (params.signature.startsWith('mock_sig_') && key_id === 'rzp_test_dev') {
    return true;
  }

  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(`${params.orderId}|${params.paymentId}`);
  const generatedSignature = hmac.digest('hex');

  const expectedBuffer = Buffer.from(generatedSignature);
  const signatureBuffer = Buffer.from(params.signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
