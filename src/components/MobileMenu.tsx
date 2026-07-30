"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "./icons";
import LogoutButton from "./LogoutButton";

export default function MobileMenu({
  isLoggedIn,
  userName,
  isStaff,
}: {
  isLoggedIn: boolean;
  userName: string | null;
  isStaff: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button aria-label="Menu" onClick={() => setOpen(true)} className="p-1 text-header-text hover:text-gold">
        <MenuIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
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
              <Link href="/cart" onClick={() => setOpen(false)}>
                Cart
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
