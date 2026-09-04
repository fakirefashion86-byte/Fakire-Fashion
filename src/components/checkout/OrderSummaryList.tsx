import Image from "next/image";

export type SummaryItem = {
  id: number;
  productId: number;
  variantId: number | null;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  mrp: number;
  qty: number;
  availableQty: number | null;
};

/** One row per cart item, shown on the "Order Summary" checkout step. */
export default function OrderSummaryList({ items }: { items: SummaryItem[] }) {
  return (
    <div className="rounded-lg border border-black/15">
      {items.map((item, idx) => (
        <div key={item.id} className={`flex gap-4 p-4 ${idx > 0 ? "border-t border-black/15" : ""}`}>
          <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-black/5">
            {item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-black">{item.name}</p>
            {(item.size || item.color) && (
              <p className="mt-0.5 text-xs text-black/60">
                {item.size}
                {item.size && item.color ? " / " : ""}
                {item.color}
              </p>
            )}
            <p className="mt-2 inline-block rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
              Qty: {item.qty}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {item.mrp > item.price && (
                <>
                  <span className="text-xs text-black/40 line-through">₹{item.mrp.toFixed(0)}</span>
                  <span className="text-xs font-semibold text-green-600">
                    {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off
                  </span>
                </>
              )}
              <span className="text-sm font-semibold text-black">₹{item.price.toFixed(0)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
