"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeliveryAddressSection, {
  EMPTY_DELIVERY_ADDRESS,
  type DeliveryAddressValue,
} from "@/components/DeliveryAddressSection";
import { ArrowRightIcon } from "@/components/icons";
import Stepper from "@/components/checkout/Stepper";
import InfoBanner from "@/components/checkout/InfoBanner";
import StepFooter from "@/components/checkout/StepFooter";
import PriceDetails from "@/components/checkout/PriceDetails";
import OrderSummaryList, { type SummaryItem } from "@/components/checkout/OrderSummaryList";
import { validateCheckout, type ContactValues } from "@/components/checkout/checkoutValidation";

// Indigo accent for actions/progress, green for savings, amber/red for
// warnings. DeliveryAddressSection keeps its own theme colors — it's
// shared with the tailor-booking wizard.
const FIELD_CLASS =
  "w-full rounded-lg border border-black/15 px-3 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const PRIMARY_BTN =
  "rounded-lg bg-gradient-to-r from-[#C7A03D] to-[#B8860B] px-4 py-3 text-sm font-semibold text-[#2b2116] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40";
const OUTLINE_BTN =
  "rounded-lg border border-indigo-500 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-500 hover:text-white";

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
  const [errors, setErrors] = useState<ReturnType<typeof validateCheckout>>({});
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
    const validation = validateCheckout(contact, delivery);
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

              <OrderSummaryList items={summaryItems} />

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
