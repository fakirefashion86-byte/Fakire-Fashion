/** Left/right arrow buttons for the hero carousel, shown on desktop only. */
export default function CarouselArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-6 sm:flex">
      <button
        aria-label="Previous slide"
        onClick={onPrev}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-black/50 hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        aria-label="Next slide"
        onClick={onNext}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-black/50 hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
