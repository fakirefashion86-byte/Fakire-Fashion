export default function StepFooter({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-xs text-black/40">
      <span className="h-px w-10 bg-black/15" />
      <span>Step {step} of 3</span>
      <span className="h-px w-10 bg-black/15" />
    </div>
  );
}
