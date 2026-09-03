import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import CartView from "@/components/CartView";
import { ChevronLeftIcon } from "@/components/icons";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/cart");

  return (
    <div className="bg-white pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#8a6d2f] transition hover:text-[#B8860B]"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 text-center">
        <h1 className="font-serif text-4xl font-semibold text-[#1a1a2e]">Your Cart</h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-16 bg-[#C7A03D]" />
          <span className="text-[#C7A03D]">✦</span>
          <span className="h-px w-16 bg-[#C7A03D]" />
        </div>
        <p className="mt-3 text-sm text-[#8a6d2f]">Review your items and proceed to checkout</p>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <CartView />
      </div>
    </div>
  );
}
