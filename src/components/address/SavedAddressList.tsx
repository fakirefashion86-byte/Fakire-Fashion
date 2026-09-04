import { HomeIcon, BuildingIcon, PinIcon } from "@/components/icons";
import type { DeliveryAddressValue } from "@/components/DeliveryAddressSection";

export type SavedAddress = Omit<DeliveryAddressValue, "locationConfirmed" | "locationSource" | "saveAs"> & {
  id: number;
  label: string;
};

const LABEL_ICON: Record<string, typeof HomeIcon> = { Home: HomeIcon, Work: BuildingIcon };
const LABEL_BADGE: Record<string, string> = {
  Home: "bg-green-50 text-green-600",
  Work: "bg-indigo-50 text-indigo-600",
};

/** List of the customer's saved addresses, shown as pickable cards. */
export default function SavedAddressList({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: SavedAddress[];
  selectedId: number | null;
  onSelect: (addr: SavedAddress) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {addresses.map((addr) => {
        const Icon = LABEL_ICON[addr.label] ?? PinIcon;
        const selected = selectedId === addr.id;
        return (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${
              selected ? "border-indigo-500 bg-indigo-50/60" : "border-black/10 hover:border-indigo-300"
            }`}
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                LABEL_BADGE[addr.label] ?? "bg-black/5 text-black/60"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-black">{addr.label}</span>
              <span className="block text-black/70">
                {[addr.houseNumber, addr.addressLine].filter(Boolean).join(", ")}
              </span>
              <span className="block text-black/50">
                {[addr.area, addr.city, addr.state].filter(Boolean).join(", ")} {addr.pincode}
              </span>
            </span>
            <span
              className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                selected ? "border-indigo-600" : "border-black/20"
              }`}
            >
              {selected && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
