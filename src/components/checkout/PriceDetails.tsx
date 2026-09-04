export default function PriceDetails({
  mrpTotal,
  shippingCharge,
  discount,
  total,
}: {
  mrpTotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="h-fit rounded-lg border border-black/15 bg-white p-5 lg:sticky lg:top-24">
      <h2 className="mb-4 text-base font-semibold text-black">Price Details</h2>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between text-black/70">
          <span>MRP (incl. of all taxes)</span>
          <span>₹{mrpTotal.toFixed(0)}</span>
        </div>
        {shippingCharge > 0 && (
          <div className="flex justify-between text-black/70">
            <span>Fees</span>
            <span>₹{shippingCharge.toFixed(0)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-black/70">
            <span>Discount</span>
            <span className="font-medium text-green-600">−₹{discount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black/15 pt-3 text-base font-semibold text-black">
          <span>Total Amount</span>
          <span className="text-indigo-700">₹{total.toFixed(0)}</span>
        </div>
      </div>
      {discount > 0 && (
        <p className="mt-4 rounded bg-green-50 py-2 text-center text-sm font-medium text-green-700">
          You will save ₹{discount.toFixed(0)} on this order
        </p>
      )}
    </div>
  );
}
