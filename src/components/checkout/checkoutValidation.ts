import type { DeliveryAddressValue } from "@/components/DeliveryAddressSection";

export type ContactValues = {
  name: string;
  email: string;
  mobile: string;
};

export type CheckoutErrors = Partial<Record<keyof ContactValues, string>> &
  Partial<Record<"addressLine" | "city" | "state" | "pincode" | "location", string>>;

const MOBILE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckout(contact: ContactValues, delivery: DeliveryAddressValue): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!contact.name.trim()) errors.name = "Full name is required";
  if (!EMAIL_RE.test(contact.email.trim())) errors.email = "Enter a valid email address";
  if (!MOBILE_RE.test(contact.mobile.trim())) errors.mobile = "Enter a valid 10-digit mobile number";

  if (!delivery.locationConfirmed) {
    errors.location = "Please add your delivery address.";
  } else if (delivery.locationSource === "map" && (delivery.latitude == null || delivery.longitude == null)) {
    errors.location = "Please confirm your delivery location on the map.";
  }
  if (!delivery.addressLine.trim()) errors.addressLine = "Address is required";
  if (!delivery.city.trim()) errors.city = "City is required";
  if (!delivery.state.trim()) errors.state = "State is required";
  if (!PINCODE_RE.test(delivery.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode";

  return errors;
}
