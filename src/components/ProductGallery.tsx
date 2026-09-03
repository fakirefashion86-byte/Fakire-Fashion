"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[#EAD9B8] bg-[#F6EEDD]">
        <div className="flex h-full items-center justify-center text-[#9c8a63]">No image</div>
      </div>
    );
  }

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex w-16 flex-shrink-0 flex-col gap-2.5">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-[#C7A03D] shadow-[0_0_0_1px_#C7A03D]" : "border-[#E7DAB8]"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-xl border border-[#EAD9B8] bg-[#F6EEDD]">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={images[active]}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 45vw"
            priority
          />
        </div>

        <span className="absolute left-0 top-4 flex items-center gap-1 rounded-r-full bg-gradient-to-r from-[#2b2116] to-[#4a3a24] py-1.5 pl-3 pr-4 text-[11px] font-semibold uppercase tracking-wide text-[#F2D98A] shadow">
          ★ Best Seller
        </span>

        <button
          type="button"
          aria-label="Zoom image"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          <ZoomIcon className="h-4.5 w-4.5" />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
