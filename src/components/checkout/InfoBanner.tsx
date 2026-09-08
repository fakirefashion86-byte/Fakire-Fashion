import { ShieldIcon, LockIcon } from "@/components/icons";

export default function InfoBanner() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-indigo-50 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-black">Your information is safe with us</p>
          <p className="text-xs text-black/60">We use industry-standard encryption to protect your data.</p>
        </div>
      </div>
      <span className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 sm:flex">
        <LockIcon className="h-5 w-5" />
      </span>
    </div>
  );
}
