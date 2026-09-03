"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DeliveryAddressSection, {
  EMPTY_DELIVERY_ADDRESS,
  type DeliveryAddressValue,
} from "@/components/DeliveryAddressSection";
import { ShieldIcon, LockIcon, ArrowRightIcon } from "@/components/icons";

type ContactValues = {
  name: string;
  email: string;
  mobile: string;
};

type SummaryItem = {
  id: number;
  productId: number;
  variantId: number | null;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  mrp: number;
  qty: number;
  availableQty: number | null;
};

type Errors = Partial<Record<keyof ContactValues, string>> &
  Partial<Record<"addressLine" | "city" | "state" | "pincode" | "location", string>>;

const MOBILE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indigo accent for actions/progress, green for savings, amber/red for
// warnings. DeliveryAddressSection keeps its own theme colors — it's
// shared with the tailor-booking wizard.
const FIELD_CLASS =
  "w-full rounded-lg border border-black/15 px-3 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const PRIMARY_BTN =
  "rounded-lg bg-gradient-to-r from-[#C7A03D] to-[#B8860B] px-4 py-3 text-sm font-semibold text-[#2b2116] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40";
const OUTLINE_BTN =
  "rounded-lg border border-indigo-500 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-500 hover:text-white";

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

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: "Address" },
  { n: 2, label: "Order Summary" },
  { n: 3, label: "Payment" },
];

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-6 flex items-center justify-center rounded-xl border border-black/10 bg-white py-6">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                s.n < step
                  ? "bg-green-600 text-white"
                  : s.n === step
                    ? "bg-indigo-600 text-white"
                    : "border border-black/20 bg-white text-black/40"
              }`}
            >
              {s.n < step ? "✓" : s.n}
            </span>
            <span
              className={`text-xs ${
                s.n === step ? "font-semibold text-indigo-600" : s.n < step ? "text-green-600" : "text-black/40"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className={`mx-2 mb-5 h-px w-10 sm:w-24 ${s.n < step ? "bg-indigo-500" : "bg-black/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-indigo-50 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-black">Your information is safe with us</p>
          <p className="text-xs text-black/60">Your order will be placed as Cash on Delivery for now.</p>
        </div>
      </div>
      <span className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 sm:flex">
        <LockIcon className="h-5 w-5" />
      </span>
    </div>
  );
}

function StepFooter({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-xs text-black/40">
      <span className="h-px w-10 bg-black/15" />
      <span>Step {step} of 3</span>
      <span className="h-px w-10 bg-black/15" />
    </div>
  );
}

function PriceDetails({
  mrpTotal,
  shippingCharge,
  discount,
  total,
}: {
  mrpTotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="h-fit rounded-lg border border-black/15 bg-white p-5 lg:sticky lg:top-24">
      <h2 className="mb-4 text-base font-semibold text-black">Price Details</h2>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between text-black/70">
          <span>MRP (incl. of all taxes)</span>
          <span>₹{mrpTotal.toFixed(0)}</span>
        </div>
        {shippingCharge > 0 && (
          <div className="flex justify-between text-black/70">
            <span>Fees</span>
            <span>₹{shippingCharge.toFixed(0)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-black/70">
            <span>Discount</span>
            <span className="font-medium text-green-600">−₹{discount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black/15 pt-3 text-base font-semibold text-black">
          <span>Total Amount</span>
          <span className="text-indigo-700">₹{total.toFixed(0)}</span>
        </div>
      </div>
      {discount > 0 && (
        <p className="mt-4 rounded bg-green-50 py-2 text-center text-sm font-medium text-green-700">
          You will save ₹{discount.toFixed(0)} on this order
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({
  defaultValues,
  canSubmit = true,
  summaryItems,
  mrpTotal,
  shippingCharge,
  discount,
  total,
}: {
  defaultValues: ContactValues;
  canSubmit?: boolean;
  summaryItems: SummaryItem[];
  mrpTotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  function handleContinueToSummary(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate(contact, delivery);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setStep(2);
  }

  async function handlePlaceOrder() {
    if (loading || !canSubmit) return;
    setSubmitError(null);
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
      className: `${FIELD_CLASS} ${errors[key] ? "border-black ring-1 ring-black" : ""}`,
    };
  }

  const deliverToLine = [delivery.houseNumber, delivery.addressLine].filter(Boolean).join(", ");

  return (
    <div>
      <Stepper step={step} />

      {step === 1 && <InfoBanner />}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {step === 1 && (
            <form onSubmit={handleContinueToSummary} noValidate className="flex flex-col gap-5">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-black">Contact Details</h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <input placeholder="Full name" {...field("name")} />
                    {errors.name && <p className="mt-1 text-xs text-black">{errors.name}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input placeholder="Mobile number" inputMode="numeric" {...field("mobile")} />
                      {errors.mobile && <p className="mt-1 text-xs text-black">{errors.mobile}</p>}
                    </div>
                    <div>
                      <input placeholder="Email address" type="email" {...field("email")} />
                      {errors.email && <p className="mt-1 text-xs text-black">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <DeliveryAddressSection value={delivery} onChange={setDelivery} errors={errors} />

              <button type="submit" className={`flex items-center justify-center gap-2 ${PRIMARY_BTN}`}>
                Continue <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-black/15 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-black">Deliver to:</p>
                    <p className="font-medium text-black">{contact.name}</p>
                    <p className="text-sm text-black/70">{deliverToLine}</p>
                    {delivery.area && <p className="text-sm text-black/70">{delivery.area}</p>}
                    <p className="text-sm text-black/70">
                      {[delivery.city, delivery.state, delivery.pincode].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-sm text-black/70">{contact.mobile}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="shrink-0 rounded border border-indigo-500 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-500 hover:text-white">
                    Change
                  </button>
                </div>
              </div>

              {!canSubmit && (
                <p className="rounded border border-amber-400 bg-amber-50 p-3 text-sm text-amber-800">
                  Some items in your cart exceed available stock. Please{" "}
                  <a href="/cart" className="underline">
                    update your cart
                  </a>{" "}
                  before continuing.
                </p>
              )}

              <div className="rounded-lg border border-black/15">
                {summaryItems.map((item, idx) => (
                  <div key={item.id} className={`flex gap-4 p-4 ${idx > 0 ? "border-t border-black/15" : ""}`}>
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-black/5">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="mt-0.5 text-xs text-black/60">
                          {item.size}
                          {item.size && item.color ? " / " : ""}
                          {item.color}
                        </p>
                      )}
                      <p className="mt-2 inline-block rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                        Qty: {item.qty}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {item.mrp > item.price && (
                          <>
                            <span className="text-xs text-black/40 line-through">₹{item.mrp.toFixed(0)}</span>
                            <span className="text-xs font-semibold text-green-600">
                              {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off
                            </span>
                          </>
                        )}
                        <span className="text-sm font-semibold text-black">₹{item.price.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" disabled={!canSubmit} onClick={() => setStep(3)} className={PRIMARY_BTN}>
                Continue to Payment
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-black/15 p-5">
                <h2 className="mb-4 text-base font-semibold text-black">Payment Method</h2>
                <label className="flex items-start gap-3 rounded border border-indigo-500 bg-indigo-50 p-4">
                  <input type="radio" checked readOnly className="mt-0.5 accent-indigo-600" />
                  <span>
                    <span className="block text-sm font-semibold text-black">Cash on Delivery</span>
                    <span className="mt-0.5 block text-xs text-black/60">Pay in cash when your order is delivered.</span>
                  </span>
                </label>
                <p className="mt-3 text-xs text-black/50">Online payment gateways aren&apos;t enabled yet.</p>
              </div>

              {submitError && (
                <p className="rounded border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {submitError}
                </p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className={OUTLINE_BTN}>
                  Back
                </button>
                <button type="button" disabled={loading || !canSubmit} onClick={handlePlaceOrder} className={`flex-1 ${PRIMARY_BTN}`}>
                  {loading ? "Placing order…" : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        <PriceDetails mrpTotal={mrpTotal} shippingCharge={shippingCharge} discount={discount} total={total} />
      </div>

      <StepFooter step={step} />
    </div>
  );
}
