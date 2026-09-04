"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import RateListModal from "./RateListModal";
import HeroSlide from "./hero/HeroSlide";
import CarouselArrows from "./hero/CarouselArrows";
import { buildSlides } from "./hero/heroSlides";

const AUTOPLAY_DELAY = 5500;

export default function HeroCarousel({
  heroImageUrl,
  heroHeading,
  heroAccent,
  heroSubheading,
}: {
  heroImageUrl: string;
  heroHeading: string;
  heroAccent: string;
  heroSubheading: string;
}) {
  const slides = buildSlides(heroImageUrl, heroHeading, heroAccent, heroSubheading);
  const autoplay = useRef(Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rateListOpen, setRateListOpen] = useState(false);

  /* ── Progress bar (auto-advance timer visual) ── */
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startProgress = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = performance.now();
    setProgress(0);
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    startProgress();
  }, [emblaApi, startProgress]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const pauseAutoplay = useCallback(() => {
    autoplay.current.stop();
    cancelAnimationFrame(rafRef.current);
  }, []);
  const resumeAutoplay = useCallback(() => {
    autoplay.current.reset();
    startProgress();
  }, [startProgress]);

  return (
    <section
      className="hero-section relative w-full overflow-hidden bg-[#0a0806]"
      onTouchStart={pauseAutoplay}
      onTouchEnd={resumeAutoplay}
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute left-[-20%] top-[-30%] h-[600px] w-[600px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
      />

      <div className="embla h-full overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => (
            <HeroSlide
              key={slide.id}
              slide={slide}
              slides={slides}
              isFirst={index === 0}
              isActive={index === selectedIndex}
              selectedIndex={selectedIndex}
              progress={progress}
              onDotClick={scrollTo}
              onViewPricing={() => setRateListOpen(true)}
            />
          ))}
        </div>
      </div>

      <CarouselArrows onPrev={scrollPrev} onNext={scrollNext} />

      {/* ── Bottom decorative line ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <RateListModal open={rateListOpen} onClose={() => setRateListOpen(false)} />
    </section>
  );
}
