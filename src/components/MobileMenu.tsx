"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "./icons";
import LogoutButton from "./LogoutButton";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  // { href: "/admin/products", label: "Products" }, // disabled — next phase
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/stitch-orders", label: "Stitch Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/tailors", label: "Tailors" },
  // { href: "/admin/content", label: "Site Content" }, // disabled — next phase
  { href: "/admin/settings", label: "Settings" },
];

export default function MobileMenu({
  isLoggedIn,
  userName,
  isStaff,
  isAdmin,
}: {
  isLoggedIn: boolean;
  userName: string | null;
  isStaff: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        const total = (data.items ?? []).reduce(
          (sum: number, item: { qty: number }) => sum + item.qty,
          0
        );
        setCartCount(total);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  return (
    <div className="md:hidden">
      <button aria-label="Menu" onClick={() => setOpen(true)} className="p-1 text-header-text hover:text-header-text/60">
        <MenuIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative mr-auto flex h-full w-72 flex-col overflow-y-auto bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-lg font-semibold text-foreground">Menu</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-icon hover:text-icon-hover">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-sm text-foreground">
              <Link href="/" onClick={() => setOpen(false)}>
                Home
              </Link>
              <Link href="/category/women" onClick={() => setOpen(false)}>
                Women
              </Link>
              <Link href="/category/men" onClick={() => setOpen(false)}>
                Men
              </Link>
              <Link href="/stitching/new" onClick={() => setOpen(false)}>
                Custom Stitching
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)}>
                Contact
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2">
                Cart
                {cartCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-btn-text">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="my-2 border-t border-border" />
              {isLoggedIn ? (
                <>
                  {!isStaff && (
                    <>
                      <Link href="/orders" onClick={() => setOpen(false)}>
                        My Orders
                      </Link>
                      <Link href="/stitching/my-orders" onClick={() => setOpen(false)}>
                        My Stitching Orders
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</p>
                      {ADMIN_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="pl-2">
                          {link.label}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-border" />
                    </>
                  )}
                  {isStaff && !isAdmin && (
                    <>
                      <Link href="/tailor" onClick={() => setOpen(false)}>
                        Tailor Dashboard
                      </Link>
                      <div className="my-1 border-t border-border" />
                    </>
                  )}
                  <Link href="/account" onClick={() => setOpen(false)}>
                    {userName}
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="font-medium text-accent">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
