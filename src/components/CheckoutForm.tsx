"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";
import DeliveryAddressSection, {
  EMPTY_DELIVERY_ADDRESS,
  type DeliveryAddressValue,
} from "@/components/DeliveryAddressSection";

type ContactValues = {
  name: string;
  email: string;
  mobile: string;
};

type Errors = Partial<Record<keyof ContactValues, string>> &
  Partial<Record<"addressLine" | "city" | "state" | "pincode" | "location", string>>;

const MOBILE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(contact: ContactValues, delivery: DeliveryAddressValue): Errors {
  const errors: Errors = {};
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

export default function CheckoutForm({
  defaultValues,
  canSubmit = true,
}: {
  defaultValues: ContactValues;
  canSubmit?: boolean;
}) {
  const router = useRouter();
  const [contact, setContact] = useState(defaultValues);
  const [delivery, setDelivery] = useState<DeliveryAddressValue>(EMPTY_DELIVERY_ADDRESS);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // One token per checkout attempt: if the request is retried (double-click,
  // network hiccup + resubmit) the server reuses the same order instead of
  // creating a duplicate. Lazy initializer so the (impure) token generation
  // runs once on mount, not on every render.
  const [clientToken] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  );

  function updateContact<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setContact((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !canSubmit) return;
    setSubmitError(null);

    const validation = validate(contact, delivery);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...contact,
        addressLine: delivery.addressLine,
        houseNumber: delivery.houseNumber,
        area: delivery.area,
        landmark: delivery.landmark,
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode,
        country: delivery.country,
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        clientToken,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setSubmitError(data.error ?? "Could not place order. Please try again.");
      return;
    }

    // Best-effort: persist the address for next time. Never block placing
    // the order on this — the order already carries its own full snapshot.
    if (delivery.saveAs) {
      fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: delivery.saveAs,
          addressLine: delivery.addressLine,
          houseNumber: delivery.houseNumber,
          area: delivery.area,
          landmark: delivery.landmark,
          city: delivery.city,
          state: delivery.state,
          pincode: delivery.pincode,
          country: delivery.country,
          latitude: delivery.latitude,
          longitude: delivery.longitude,
        }),
      }).catch(() => {});
    }

    router.push(`/orders/${data.order.id}?placed=1`);
  }

  function field(key: keyof ContactValues) {
    return {
      value: contact[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateContact(key, e.target.value),
      className: `${INPUT_CLASS} w-full ${errors[key] ? "border-error" : ""}`,
    };
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Contact Details</h2>
        <div className="flex flex-col gap-3">
          <div>
            <input placeholder="Full name" {...field("name")} />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <input placeholder="Mobile number" inputMode="numeric" {...field("mobile")} />
              {errors.mobile && <p className="mt-1 text-xs text-error">{errors.mobile}</p>}
            </div>
            <div>
              <input placeholder="Email address" type="email" {...field("email")} />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
            </div>
          </div>
        </div>
      </div>

      <DeliveryAddressSection value={delivery} onChange={setDelivery} errors={errors} />

      {submitError && <p className="text-sm text-error">{submitError}</p>}

      <button type="submit" disabled={loading || !canSubmit} className={PRIMARY_BUTTON_CLASS}>
        {loading ? "Placing order…" : "Place Order (Cash on Delivery)"}
      </button>
    </form>
  );
}
