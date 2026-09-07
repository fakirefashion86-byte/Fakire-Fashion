"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DeliveryAddressSection, {
  EMPTY_DELIVERY_ADDRESS,
  type DeliveryAddressValue,
} from "@/components/DeliveryAddressSection";
import GarmentAndScheduleFields from "@/components/booking/GarmentAndScheduleFields";
import CustomerFieldsForm from "@/components/booking/CustomerFieldsForm";
import { validateBooking, type BookingFieldErrors, type CustomerValues } from "@/components/booking/bookingValidation";

const SERVICE_CITY = "lucknow";

type Category = { id: number; name: string; gender: "male" | "female" };

export default function BookTailorForm({
  categories,
  defaultValues,
}: {
  categories: Category[];
  defaultValues: CustomerValues;
}) {
  const router = useRouter();

  const [gender, setGender] = useState<"male" | "female">("male");
  const [stitchCategoryId, setStitchCategoryId] = useState<number | "" | "custom">("");
  const [customGarmentName, setCustomGarmentName] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
  const [customer, setCustomer] = useState(defaultValues);
  const [delivery, setDelivery] = useState<DeliveryAddressValue>(EMPTY_DELIVERY_ADDRESS);

  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = useMemo(() => categories.filter((c) => c.gender === gender), [categories, gender]);

  function clearError(key: keyof BookingFieldErrors) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function updateCustomer<K extends keyof CustomerValues>(key: K, value: CustomerValues[K]) {
    setCustomer((c) => ({ ...c, [key]: value }));
    clearError(key);
  }

  function handleGenderChange(next: "male" | "female") {
    setGender(next);
    setStitchCategoryId("");
    setCustomGarmentName("");
  }

  const isLucknow = delivery.city.trim().toLowerCase() === SERVICE_CITY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateBooking(
      stitchCategoryId,
      customGarmentName,
      preferredDate,
      preferredTimeSlot,
      customer,
      delivery
    );
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
          stitchCategoryId: stitchCategoryId === "custom" || stitchCategoryId === "" ? undefined : stitchCategoryId,
          customGarmentName: stitchCategoryId === "custom" ? customGarmentName.trim() : undefined,
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
      <GarmentAndScheduleFields
        gender={gender}
        onGenderChange={handleGenderChange}
        categories={filteredCategories}
        stitchCategoryId={stitchCategoryId}
        onStitchCategoryChange={(id) => {
          setStitchCategoryId(id);
          if (id !== "custom") setCustomGarmentName("");
          clearError("garment");
        }}
        customGarmentName={customGarmentName}
        onCustomGarmentNameChange={(name) => {
          setCustomGarmentName(name);
          clearError("garment");
        }}
        preferredDate={preferredDate}
        onDateChange={(date) => {
          setPreferredDate(date);
          clearError("date");
        }}
        preferredTimeSlot={preferredTimeSlot}
        onTimeSlotChange={(slot) => {
          setPreferredTimeSlot(slot);
          clearError("timeSlot");
        }}
        errors={errors}
      />

      <CustomerFieldsForm customer={customer} onChange={updateCustomer} errors={errors} />

      <div className="rounded-xl bg-white p-4 text-foreground sm:p-5">
        <DeliveryAddressSection value={delivery} onChange={setDelivery} errors={errors} />
        {delivery.city && !isLucknow && (
          <p className="mt-3 rounded border border-error/30 bg-error/10 p-2 text-xs text-error">
            Home-visit tailor booking is currently available in Lucknow only.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button type="submit" disabled={loading} className="liquid-btn w-full px-8 py-3 rounded-full">
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
    </form>
  );
}
