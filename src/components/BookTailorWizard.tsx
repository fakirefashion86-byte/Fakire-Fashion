"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CustomerValues = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
};

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

  const canSubmit =
    stitchCategoryId !== "" &&
    !!preferredDate &&
    !!preferredTimeSlot &&
    !!customer.customerName &&
    !!customer.customerMobile &&
    !!customer.customerAddress;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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
        }),
      });

      setLoading(false);

      if (!res.ok) {
        setError("Could not submit your booking. Please try again.");
        return;
      }

      router.push("/stitching/my-orders");
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto glass-card p-6 md:p-8 rounded-2xl space-y-6">
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
          onChange={(e) => setStitchCategoryId(Number(e.target.value))}
          className="w-full glass-input p-3 rounded-lg"
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
            onChange={(e) => setPreferredDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full glass-input p-3 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="timeSlot" className="block text-sm font-medium text-white/80 mb-3">
            Preferred Time
          </label>
          <select
            id="timeSlot"
            required
            value={preferredTimeSlot}
            onChange={(e) => setPreferredTimeSlot(e.target.value)}
            className="w-full glass-input p-3 rounded-lg"
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
            onChange={(e) => updateCustomer("customerName", e.target.value)}
            className="floating-label-input"
          />
          <label htmlFor="name" className="floating-label">Full Name</label>
        </div>

        <div className="floating-label-group">
          <input
            id="email"
            type="email"
            required
            placeholder=" "
            value={customer.customerEmail}
            onChange={(e) => updateCustomer("customerEmail", e.target.value)}
            className="floating-label-input"
          />
          <label htmlFor="email" className="floating-label">Email Address</label>
        </div>

        <div className="floating-label-group">
          <input
            id="mobile"
            type="tel"
            required
            placeholder=" "
            value={customer.customerMobile}
            onChange={(e) => updateCustomer("customerMobile", e.target.value)}
            className="floating-label-input"
          />
          <label htmlFor="mobile" className="floating-label">Mobile Number</label>
        </div>

        <div className="floating-label-group">
          <textarea
            id="address"
            required
            placeholder=" "
            rows={3}
            value={customer.customerAddress}
            onChange={(e) => updateCustomer("customerAddress", e.target.value)}
            className="floating-label-input resize-none"
          />
          <label htmlFor="address" className="floating-label">Visit Address</label>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="liquid-btn w-full px-8 py-3 rounded-full"
      >
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
    </form>
  );
}
