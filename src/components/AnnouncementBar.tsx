import { ScissorsIcon } from "./icons";

export default function AnnouncementBar() {
  return (
    <div className="border-b border-white/10 bg-header-bg px-4 py-2 text-center text-xs text-header-text">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <ScissorsIcon className="h-3.5 w-3.5 text-header-text" />
          Custom Tailoring Available
        </span>
      </div>
    </div>
  );
}
