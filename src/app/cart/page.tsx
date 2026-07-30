import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CartView from "@/components/CartView";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/cart");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>
      <CartView />
    </div>
  );
}
