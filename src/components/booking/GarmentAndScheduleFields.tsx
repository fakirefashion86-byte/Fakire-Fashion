import type { BookingFieldErrors } from "./bookingValidation";

type Category = { id: number; name: string; gender: "male" | "female" };

const TIME_SLOTS = ["Morning (9 AM - 12 PM)", "Afternoon (12 PM - 3 PM)", "Evening (3 PM - 6 PM)"];

// Sentinel <option> value for "type your own garment" — never a real category id.
const CUSTOM_GARMENT_VALUE = "custom";

/** Garment gender/type picker plus preferred date and time slot. */
export default function GarmentAndScheduleFields({
  gender,
  onGenderChange,
  categories,
  stitchCategoryId,
  onStitchCategoryChange,
  customGarmentName,
  onCustomGarmentNameChange,
  preferredDate,
  onDateChange,
  preferredTimeSlot,
  onTimeSlotChange,
  errors,
}: {
  gender: "male" | "female";
  onGenderChange: (g: "male" | "female") => void;
  categories: Category[];
  /** "" = nothing picked, "custom" = customer is typing their own garment name below. */
  stitchCategoryId: number | "" | typeof CUSTOM_GARMENT_VALUE;
  onStitchCategoryChange: (id: number | "" | typeof CUSTOM_GARMENT_VALUE) => void;
  customGarmentName: string;
  onCustomGarmentNameChange: (name: string) => void;
  preferredDate: string;
  onDateChange: (date: string) => void;
  preferredTimeSlot: string;
  onTimeSlotChange: (slot: string) => void;
  errors: BookingFieldErrors;
}) {
  const isCustom = stitchCategoryId === CUSTOM_GARMENT_VALUE;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3">Garment For</label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGenderChange(g)}
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
            const value = e.target.value;
            onStitchCategoryChange(value === CUSTOM_GARMENT_VALUE ? value : value === "" ? "" : Number(value));
          }}
          className={`w-full glass-input p-3 rounded-lg ${errors.garment ? "border-error" : ""}`}
        >
          <option value="" disabled>
            Select a garment
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={CUSTOM_GARMENT_VALUE}>Other (type your own)</option>
        </select>
        {isCustom && (
          <input
            type="text"
            required
            autoFocus
            value={customGarmentName}
            onChange={(e) => onCustomGarmentNameChange(e.target.value)}
            placeholder="Type the garment you want stitched"
            maxLength={120}
            className={`mt-2 w-full glass-input p-3 rounded-lg ${errors.garment ? "border-error" : ""}`}
          />
        )}
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
            onChange={(e) => onDateChange(e.target.value)}
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
            onChange={(e) => onTimeSlotChange(e.target.value)}
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
    </>
  );
}
