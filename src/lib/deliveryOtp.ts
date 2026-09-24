// Delivery-confirmation OTP shared between regular product orders and
// stitching orders. The code is stored in the clear (see the schema comment
// on Order.deliveryOtp / StitchOrder.deliveryOtp) since the customer needs to
// re-read it from their own order page at any time before handing it to
// whoever delivers the item — it's a handoff code, not a credential.

export const OTP_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h — covers same-day and next-day delivery attempts
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 min between regenerations

export function generateDeliveryOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function freshOtpFields() {
  return {
    deliveryOtp: generateDeliveryOtp(),
    deliveryOtpGeneratedAt: new Date(),
    deliveryOtpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    deliveryOtpAttempts: 0,
    deliveryOtpVerifiedAt: null as Date | null,
  };
}

export function clearedOtpFields() {
  return {
    deliveryOtp: null as string | null,
    deliveryOtpGeneratedAt: null as Date | null,
    deliveryOtpExpiresAt: null as Date | null,
    deliveryOtpAttempts: 0,
  };
}

export function canResendOtp(generatedAt: Date | null): boolean {
  if (!generatedAt) return true;
  return Date.now() - generatedAt.getTime() >= OTP_RESEND_COOLDOWN_MS;
}

export function msUntilResend(generatedAt: Date | null): number {
  if (!generatedAt) return 0;
  return Math.max(0, OTP_RESEND_COOLDOWN_MS - (Date.now() - generatedAt.getTime()));
}

type OtpState = {
  deliveryOtp: string | null;
  deliveryOtpExpiresAt: Date | null;
  deliveryOtpAttempts: number;
};

export type OtpCheckResult =
  | { ok: true }
  | { ok: false; reason: "not_generated" | "locked" | "expired" | "mismatch"; remainingAttempts?: number };

export function checkDeliveryOtp(state: OtpState, submitted: string): OtpCheckResult {
  if (!state.deliveryOtp) return { ok: false, reason: "not_generated" };
  if (state.deliveryOtpAttempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "locked" };
  if (!state.deliveryOtpExpiresAt || state.deliveryOtpExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (state.deliveryOtp !== submitted.trim()) {
    const remainingAttempts = Math.max(0, OTP_MAX_ATTEMPTS - (state.deliveryOtpAttempts + 1));
    return { ok: false, reason: "mismatch", remainingAttempts };
  }
  return { ok: true };
}

export const OTP_ERROR_MESSAGES: Record<Exclude<OtpCheckResult, { ok: true }>["reason"], string> = {
  not_generated: "No delivery OTP has been generated for this order yet.",
  locked: "Too many incorrect attempts. Ask the customer to regenerate the OTP before trying again.",
  expired: "This OTP has expired. Ask the customer to regenerate it from their order page.",
  mismatch: "Incorrect OTP.",
};
