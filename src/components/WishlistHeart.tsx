"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "./icons";

type Props = {
  productId: number;
  initialWishlisted?: boolean;
  loggedIn?: boolean;
  className?: string;
};

export default function WishlistHeart({
  productId,
  initialWishlisted = false,
  loggedIn = true,
  className,
}: Props) {
  const router = useRouter();
  const [active, setActive] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (pending) return;

    setPending(true);
    const next = !active;
    setActive(next);

    const res = next
      ? await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
      : await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });

    setPending(false);
    if (!res.ok) {
      setActive(!next);
      return;
    }
    router.refresh();
  }

  return (
    <button
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={toggle}
      disabled={pending}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-card/90 transition disabled:opacity-60 ${className ?? ""}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <HeartIcon
        filled={active}
        className={`h-4 w-4 ${active ? "text-accent" : "text-icon"}`}
      />
    </button>
  );
}
