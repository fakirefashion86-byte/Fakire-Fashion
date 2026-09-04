import type { DeliveryAddressValue } from "@/components/DeliveryAddressSection";

export type CustomerValues = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
};

export type BookingFieldErrors = Partial<
  Record<
    | "garment"
    | "date"
    | "timeSlot"
    | "customerName"
    | "customerEmail"
    | "customerMobile"
    | "addressLine"
    | "city"
    | "state"
    | "pincode"
    | "location",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

// Every required field is checked up front so a blank/invalid one is
// highlighted right where it is on submit — instead of the old behaviour
// of silently disabling the button with no indication of what's missing.
export function validateBooking(
  stitchCategoryId: number | "",
  preferredDate: string,
  preferredTimeSlot: string,
  customer: CustomerValues,
  delivery: DeliveryAddressValue
): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  if (stitchCategoryId === "") errors.garment = "Please select a garment type";
  if (!preferredDate) errors.date = "Please select a preferred date";
  if (!preferredTimeSlot) errors.timeSlot = "Please select a time slot";
  if (!customer.customerName.trim()) errors.customerName = "Full name is required";
  if (!EMAIL_RE.test(customer.customerEmail.trim())) errors.customerEmail = "Enter a valid email address";
  if (!MOBILE_RE.test(customer.customerMobile.trim())) errors.customerMobile = "Enter a valid 10-digit mobile number";
  if (!delivery.locationConfirmed) {
    errors.location = "Please add your delivery address.";
  } else if (delivery.locationSource === "map" && (delivery.latitude == null || delivery.longitude == null)) {
    errors.location = "Please confirm your delivery location on the map.";
  }
  if (!delivery.addressLine.trim()) errors.addressLine = "Address is required";
  if (!delivery.city.trim()) errors.city = "City is required";
  if (!delivery.state.trim()) errors.state = "State is required";
  if (!/^\d{6}$/.test(delivery.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode";
  return errors;
}
