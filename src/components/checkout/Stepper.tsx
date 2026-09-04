const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: "Address" },
  { n: 2, label: "Order Summary" },
  { n: 3, label: "Payment" },
];

export default function Stepper({ step }: { step: 1 | 2 | 3 }) {
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
