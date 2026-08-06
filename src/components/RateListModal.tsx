"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type RateRow = { name: string; price: string };

const LADIES_RATES: RateRow[] = [
  { name: "Salwar Suit", price: "₹400" },
  { name: "Kurti Pant", price: "₹500" },
  { name: "Blouse Stitching", price: "₹450" },
  { name: "Half Lining Suit", price: "₹700" },
  { name: "Full Lining Suit", price: "₹800" },
  { name: "Ladies Shirt", price: "₹350" },
  { name: "Ladies Pant", price: "₹450" },
  { name: "Ladies Uniform & Other Stitching", price: "As per requirement" },
];

const GENTS_RATES: RateRow[] = [
  { name: "Shirt Pant", price: "₹800" },
  { name: "Shirt", price: "₹350" },
  { name: "Pant", price: "₹450" },
  { name: "Kurta Pajama", price: "₹600" },
  { name: "Kurta Pant", price: "₹850" },
  { name: "Pathani Suit", price: "₹800" },
  { name: "Sadri", price: "₹1,100" },
  { name: "Coat Pant", price: "₹2,800" },
  { name: "Three Piece Suit", price: "₹3,750" },
  { name: "Gents Uniform & Other Stitching", price: "As per requirement" },
];

function RateTable({ title, rows }: { title: string; rows: RateRow[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-accent">
        {title}
      </h3>
      <div className="divide-y divide-border/60 rounded-lg border border-border/60">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
          >
            <span className="text-foreground">{row.name}</span>
            <span className="whitespace-nowrap font-medium text-ink-muted">
              {row.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RateListModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Rate list"
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-serif text-xl text-foreground">Rate List</h2>
                <p className="text-xs text-ink-muted">
                  Transparent pricing. Premium stitching.
                </p>
              </div>
              <button
                aria-label="Close rate list"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-section hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <RateTable title="Ladies Stitching" rows={LADIES_RATES} />
              <RateTable title="Gents Stitching" rows={GENTS_RATES} />
            </div>

            <div className="border-t border-border px-5 py-4">
              <a
                href="/stitching/new"
                className="flex w-full items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-btn-text transition hover:bg-accent-hover"
              >
                Book Your Tailor
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
