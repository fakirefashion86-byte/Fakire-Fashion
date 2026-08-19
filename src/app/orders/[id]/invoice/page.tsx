import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PrintInvoiceButton from "@/components/PrintInvoiceButton";

type Props = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order || (order.userId !== session.userId && session.role !== "admin")) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/orders/${order.id}`} className="text-sm text-ink-secondary underline underline-offset-2">
          ← Back to order
        </Link>
        <PrintInvoiceButton />
      </div>

      <div className="rounded-lg border border-border p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h1 className="font-serif text-xl font-semibold">Fakire Fashion</h1>
            <p className="text-xs text-ink-muted">Ethnic Wear &amp; Custom Tailoring</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">Invoice</h2>
            <p className="text-sm text-ink-muted">#{order.orderNumber}</p>
            <p className="text-sm text-ink-muted">{order.createdAt.toDateString()}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Billed To</p>
            <p className="mt-1 text-sm font-medium">{order.name}</p>
            <p className="text-sm text-ink-secondary">
              {[order.houseNumber, order.addressLine || order.address].filter(Boolean).join(", ")}
            </p>
            {order.area && <p className="text-sm text-ink-secondary">{order.area}</p>}
            {order.landmark && <p className="text-sm text-ink-secondary">Landmark: {order.landmark}</p>}
            {(order.city || order.state || order.pincode) && (
              <p className="text-sm text-ink-secondary">
                {[order.city, order.state, order.pincode].filter(Boolean).join(", ")}
              </p>
            )}
            {order.country && <p className="text-sm text-ink-secondary">{order.country}</p>}
            <p className="mt-1 text-sm text-ink-secondary">
              {order.email} · {order.mobile}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Payment</p>
            <p className="mt-1 text-sm">Method: Cash on Delivery</p>
            <p className="text-sm capitalize">Status: {order.paymentStatus}</p>
            <p className="text-sm capitalize">Order Status: {order.status}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="py-2">Item</th>
              <th className="py-2">Variant</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-divider">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-ink-muted">
                  {item.size} {item.color && `/ ${item.color}`}
                </td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">₹{Number(item.price).toFixed(0)}</td>
                <td className="py-2 text-right">₹{(Number(item.price) * item.qty).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">Subtotal</span>
            <span>₹{Number(order.totalAmount).toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Shipping</span>
            <span>{Number(order.shippingCharges) === 0 ? "Free" : `₹${Number(order.shippingCharges).toFixed(0)}`}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Discount</span>
              <span>−₹{Number(order.discountAmount).toFixed(0)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span>₹{Number(order.netAmount).toFixed(0)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          This is a system-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
}
