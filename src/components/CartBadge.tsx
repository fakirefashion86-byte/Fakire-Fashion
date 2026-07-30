"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BagIcon } from "./icons";

export default function CartBadge({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        const total = (data.items ?? []).reduce(
          (sum: number, item: { qty: number }) => sum + item.qty,
          0
        );
        setCount(total);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  return (
    <Link href="/cart" className="relative p-1 text-header-text hover:text-gold" aria-label="Cart">
      <BagIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-btn-text">
          {count}
        </span>
      )}
    </Link>
  );
}
