import type { BookingFieldErrors, CustomerValues } from "./bookingValidation";

/** Name/email/mobile floating-label inputs for the booking wizard. */
export default function CustomerFieldsForm({
  customer,
  onChange,
  errors,
}: {
  customer: CustomerValues;
  onChange: <K extends keyof CustomerValues>(key: K, value: CustomerValues[K]) => void;
  errors: BookingFieldErrors;
}) {
  return (
    <div className="space-y-4">
      <div className="floating-label-group">
        <input
          id="name"
          type="text"
          required
          placeholder=" "
          value={customer.customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
          className={`floating-label-input ${errors.customerName ? "border-error" : ""}`}
        />
        <label htmlFor="name" className="floating-label">
          Full Name
        </label>
        {errors.customerName && <p className="mt-1.5 text-xs text-error">{errors.customerName}</p>}
      </div>

      <div className="floating-label-group">
        <input
          id="email"
          type="email"
          required
          placeholder=" "
          value={customer.customerEmail}
          onChange={(e) => onChange("customerEmail", e.target.value)}
          className={`floating-label-input ${errors.customerEmail ? "border-error" : ""}`}
        />
        <label htmlFor="email" className="floating-label">
          Email Address
        </label>
        {errors.customerEmail && <p className="mt-1.5 text-xs text-error">{errors.customerEmail}</p>}
      </div>

      <div className="floating-label-group">
        <input
          id="mobile"
          type="tel"
          required
          placeholder=" "
          value={customer.customerMobile}
          onChange={(e) => onChange("customerMobile", e.target.value)}
          className={`floating-label-input ${errors.customerMobile ? "border-error" : ""}`}
        />
        <label htmlFor="mobile" className="floating-label">
          Mobile Number
        </label>
        {errors.customerMobile && <p className="mt-1.5 text-xs text-error">{errors.customerMobile}</p>}
      </div>
    </div>
  );
}
