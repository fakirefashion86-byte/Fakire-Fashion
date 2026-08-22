"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DeliveryAddressSection, {
  EMPTY_DELIVERY_ADDRESS,
  type DeliveryAddressValue,
} from "@/components/DeliveryAddressSection";

type CustomerValues = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
};

const SERVICE_CITY = "lucknow";

type Category = {
  id: number;
  name: string;
  gender: "male" | "female";
};

const TIME_SLOTS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 3 PM)",
  "Evening (3 PM - 6 PM)",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

type FieldErrors = Partial<
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

export default function BookTailorForm({
  categories,
  defaultValues,
}: {
  categories: Category[];
  defaultValues: CustomerValues;
}) {
  const router = useRouter();

  const [gender, setGender] = useState<"male" | "female">("male");
  const [stitchCategoryId, setStitchCategoryId] = useState<number | "">("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
  const [customer, setCustomer] = useState(defaultValues);
  const [delivery, setDelivery] = useState<DeliveryAddressValue>(EMPTY_DELIVERY_ADDRESS);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.gender === gender),
    [categories, gender]
  );

  function updateCustomer<K extends keyof CustomerValues>(key: K, value: CustomerValues[K]) {
    setCustomer((c) => ({ ...c, [key]: value }));
  }

  function handleGenderChange(next: "male" | "female") {
    setGender(next);
    setStitchCategoryId("");
  }

  // Every required field is checked up front so a blank/invalid one is
  // highlighted right where it is on submit — instead of the old behaviour
  // of silently disabling the button with no indication of what's missing.
  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (stitchCategoryId === "") next.garment = "Please select a garment type";
    if (!preferredDate) next.date = "Please select a preferred date";
    if (!preferredTimeSlot) next.timeSlot = "Please select a time slot";
    if (!customer.customerName.trim()) next.customerName = "Full name is required";
    if (!EMAIL_RE.test(customer.customerEmail.trim())) next.customerEmail = "Enter a valid email address";
    if (!MOBILE_RE.test(customer.customerMobile.trim())) next.customerMobile = "Enter a valid 10-digit mobile number";
    if (!delivery.locationConfirmed) {
      next.location = "Please add your delivery address.";
    } else if (delivery.locationSource === "map" && (delivery.latitude == null || delivery.longitude == null)) {
      next.location = "Please confirm your delivery location on the map.";
    }
    if (!delivery.addressLine.trim()) next.addressLine = "Address is required";
    if (!delivery.city.trim()) next.city = "City is required";
    if (!delivery.state.trim()) next.state = "State is required";
    if (!/^\d{6}$/.test(delivery.pincode.trim())) next.pincode = "Enter a valid 6-digit pincode";
    return next;
  }

  const isLucknow = delivery.city.trim().toLowerCase() === SERVICE_CITY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setError(null);
      return;
    }
    if (!isLucknow) {
      setError("Sorry, home-visit tailor booking is currently available in Lucknow only.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stitch-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stitchCategoryId,
          measurements: {}, // Tailor takes measurements in person
          preferredDate,
          preferredTimeSlot,
          ...customer,
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
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Could not submit your booking. Please try again.");
        return;
      }

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

      router.push("/stitching/my-orders");
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-2xl mx-auto glass-card p-6 md:p-8 rounded-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3">Garment For</label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGenderChange(g)}
              className={`glass-card p-3 rounded-lg text-sm font-medium transition-colors ${
                gender === g ? "glass-card-selected text-gold" : "text-white/80"
              }`}
            >
              {g === "male" ? "Men" : "Women"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="garment" className="block text-sm font-medium text-white/80 mb-3">
          Garment Type
        </label>
        <select
          id="garment"
          required
          value={stitchCategoryId}
          onChange={(e) => {
            setStitchCategoryId(Number(e.target.value));
            if (errors.garment) setErrors((prev) => ({ ...prev, garment: undefined }));
          }}
          className={`w-full glass-input p-3 rounded-lg ${errors.garment ? "border-error" : ""}`}
        >
          <option value="" disabled>
            Select a garment
          </option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.garment && <p className="mt-1.5 text-xs text-error">{errors.garment}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-white/80 mb-3">
            Preferred Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={preferredDate}
            onChange={(e) => {
              setPreferredDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            min={new Date().toISOString().split("T")[0]}
            className={`w-full glass-input p-3 rounded-lg ${errors.date ? "border-error" : ""}`}
          />
          {errors.date && <p className="mt-1.5 text-xs text-error">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="timeSlot" className="block text-sm font-medium text-white/80 mb-3">
            Preferred Time
          </label>
          <select
            id="timeSlot"
            required
            value={preferredTimeSlot}
            onChange={(e) => {
              setPreferredTimeSlot(e.target.value);
              if (errors.timeSlot) setErrors((prev) => ({ ...prev, timeSlot: undefined }));
            }}
            className={`w-full glass-input p-3 rounded-lg ${errors.timeSlot ? "border-error" : ""}`}
          >
            <option value="" disabled>
              Select a time slot
            </option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.timeSlot && <p className="mt-1.5 text-xs text-error">{errors.timeSlot}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="floating-label-group">
          <input
            id="name"
            type="text"
            required
            placeholder=" "
            value={customer.customerName}
            onChange={(e) => {
              updateCustomer("customerName", e.target.value);
              if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }));
            }}
            className={`floating-label-input ${errors.customerName ? "border-error" : ""}`}
          />
          <label htmlFor="name" className="floating-label">Full Name</label>
          {errors.customerName && <p className="mt-1.5 text-xs text-error">{errors.customerName}</p>}
        </div>

        <div className="floating-label-group">
          <input
            id="email"
            type="email"
            required
            placeholder=" "
            value={customer.customerEmail}
            onChange={(e) => {
              updateCustomer("customerEmail", e.target.value);
              if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: undefined }));
            }}
            className={`floating-label-input ${errors.customerEmail ? "border-error" : ""}`}
          />
          <label htmlFor="email" className="floating-label">Email Address</label>
          {errors.customerEmail && <p className="mt-1.5 text-xs text-error">{errors.customerEmail}</p>}
        </div>

        <div className="floating-label-group">
          <input
            id="mobile"
            type="tel"
            required
            placeholder=" "
            value={customer.customerMobile}
            onChange={(e) => {
              updateCustomer("customerMobile", e.target.value);
              if (errors.customerMobile) setErrors((prev) => ({ ...prev, customerMobile: undefined }));
            }}
            className={`floating-label-input ${errors.customerMobile ? "border-error" : ""}`}
          />
          <label htmlFor="mobile" className="floating-label">Mobile Number</label>
          {errors.customerMobile && <p className="mt-1.5 text-xs text-error">{errors.customerMobile}</p>}
        </div>

      </div>

      <div className="rounded-xl bg-white p-4 text-foreground sm:p-5">
        <DeliveryAddressSection value={delivery} onChange={setDelivery} errors={errors} />
        {delivery.city && !isLucknow && (
          <p className="mt-3 rounded border border-error/30 bg-error/10 p-2 text-xs text-error">
            Home-visit tailor booking is currently available in Lucknow only.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="liquid-btn w-full px-8 py-3 rounded-full"
      >
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
    </form>
  );
}
