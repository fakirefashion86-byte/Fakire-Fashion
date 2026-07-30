import { TruckIcon, ScissorsIcon } from "./icons";

export default function AnnouncementBar() {
  return (
    <div className="border-b border-white/10 bg-header-bg px-4 py-2 text-center text-xs text-header-text">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 overflow-x-auto whitespace-nowrap sm:gap-4">
        <span className="flex items-center gap-1.5">
          <TruckIcon className="h-3.5 w-3.5 text-header-text" />
          Free Shipping on orders above ₹1999
        </span>
        <span className="hidden text-header-text-muted sm:inline">|</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <ScissorsIcon className="h-3.5 w-3.5 text-header-text" />
          Custom Tailoring Available
        </span>
      </div>
    </div>
  );
}
