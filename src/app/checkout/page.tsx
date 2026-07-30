import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, mobile: true, address: true },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Checkout</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Payment is not enabled yet — orders are placed as Cash on Delivery for now.
      </p>
      <CheckoutForm
        defaultValues={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          mobile: user?.mobile ?? "",
          address: user?.address ?? "",
        }}
      />
    </div>
  );
}
