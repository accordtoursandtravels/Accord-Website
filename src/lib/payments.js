/**
 * Placeholder payment layer. Booking.payment already has the fields a
 * gateway needs (status, amount, gatewayOrderId, gatewayPaymentId). Wire
 * Razorpay in here when ready - createOrder() is the only thing bookings
 * need to call; everything else (verifying signatures, webhooks) plugs in
 * behind this same interface.
 */
export const PAYMENTS_ENABLED = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

export async function createOrder({ amount, currency = "INR", receipt }) {
  if (!PAYMENTS_ENABLED) {
    return { skipped: true, reason: "Payment gateway not configured yet" };
  }
  // Example once enabled:
  // const Razorpay = (await import("razorpay")).default;
  // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // return instance.orders.create({ amount: amount * 100, currency, receipt });
  throw new Error("createOrder() not implemented - install the razorpay package first");
}
