"use client";

export type RazorpayOrderInfo = { keyId: string; orderId: string; amount: number; currency: string };
export type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function waitForRazorpay(timeoutMs = 10000): Promise<RazorpayConstructor> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(interval);
        resolve(window.Razorpay);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("Payment gateway failed to load. Please check your connection and try again."));
      }
    }, 150);
  });
}

/** Opens Razorpay Checkout; resolves with the payment result on success, rejects if the
 *  gateway fails to load or the customer closes the modal without paying. */
export async function openRazorpayCheckout(
  info: RazorpayOrderInfo,
  prefill: { name: string; email: string; contact: string }
): Promise<RazorpayResult> {
  const Razorpay = await waitForRazorpay();
  return new Promise((resolve, reject) => {
    const rzp = new Razorpay({
      key: info.keyId,
      order_id: info.orderId,
      amount: info.amount,
      currency: info.currency,
      name: "Fakire Fashion",
      prefill,
      theme: { color: "#B8860B" },
      handler: (response: RazorpayResult) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled")),
      },
    });
    rzp.open();
  });
}

export async function verifyRazorpayPayment(result: RazorpayResult) {
  const res = await fetch("/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpayOrderId: result.razorpay_order_id,
      razorpayPaymentId: result.razorpay_payment_id,
      razorpaySignature: result.razorpay_signature,
    }),
  });
  return res.ok;
}
