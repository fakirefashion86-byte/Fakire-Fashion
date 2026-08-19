"use client";

export default function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-btn px-4 py-2 text-sm font-semibold text-btn-text transition hover:bg-btn-hover print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
