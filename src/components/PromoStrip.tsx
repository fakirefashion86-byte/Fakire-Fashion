import Link from "next/link";
import { DeliveryVanIcon, BookingCalendarIcon, WhatsAppIcon } from "./icons";

/** Landing-page-only promo strip. Fixed 3-column layout — never scrolls/slides. */
export default function PromoStrip() {
  return (
    <div className="border-b border-black/5 bg-[#f3ede1]">
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-black/10">
        <Link
          href="/stitching/new"
          className="flex items-center justify-center gap-1.5 px-1.5 py-2 text-center hover:opacity-80 sm:gap-3 sm:px-5 sm:py-2.5 sm:text-left"
        >
          <BookingCalendarIcon className="h-4 w-4 shrink-0 text-gold sm:h-6 sm:w-6" />
          <span>
            <span className="block text-[11px] font-semibold leading-tight text-black sm:text-sm">
              Easy &amp; Hassle-Free Tailor Booking
            </span>
            <span className="hidden text-xs text-black/60 sm:block">Book your tailor in a few clicks</span>
          </span>
        </Link>
        <div className="flex items-center justify-center gap-1.5 px-1.5 py-2 text-center sm:gap-3 sm:px-5 sm:py-2.5 sm:text-left">
          <DeliveryVanIcon className="h-4 w-4 shrink-0 text-gold sm:h-6 sm:w-6" />
          <span>
            <span className="block text-[11px] font-semibold leading-tight text-black sm:text-sm">
              Free Pickup &amp; Delivery Service
            </span>
            <span className="hidden text-xs text-black/60 sm:block">Straight to your doorstep</span>
          </span>
        </div>
        <a
          href="https://wa.me/919454282015"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-1.5 py-2 text-center hover:opacity-80 sm:gap-3 sm:px-5 sm:py-2.5 sm:text-left"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0 sm:h-6 sm:w-6" />
          <span>
            <span className="block text-[11px] font-semibold leading-tight text-black sm:text-sm">
              Chat on WhatsApp
            </span>
            <span className="hidden text-xs text-black/60 sm:block">9454282015</span>
          </span>
        </a>
      </div>
    </div>
  );
}
