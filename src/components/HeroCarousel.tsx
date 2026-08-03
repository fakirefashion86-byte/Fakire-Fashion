"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ScissorsIcon } from "./icons";

type Slide = {
  id: string;
  heading: string;
  accent: string;
  subheading: string;
  imageUrl: string;
  imageAlt: string;
  tintClassName: string;
  startingPriceLabel?: string;
  startingPrice?: string;
  ctaHref: string;
  ctaLabel: string;
};

/* ── Slide data builder ── */
function buildSlides(
  heroImageUrl: string,
  heroHeading: string,
  heroAccent: string,
  heroSubheading: string,
): Slide[] {
  const fallbackImage = "/images/Sherwani_Hero.webp";
  const image = heroImageUrl || fallbackImage;
  const weddingImage = "/images/Wedding-Collection-Hero.webp";

  return [
    {
      id: "sherwani",
      heading: heroHeading || "Ethnic Wear, Tailored For",
      accent: heroAccent || "You",
      subheading:
        heroSubheading ||
        "Timeless designs. Crafted to perfection. Made for every occasion.",
      imageUrl: "/images/Pathani-Suit.png",
      imageAlt: "Model wearing a tailored Pathani suit",
      tintClassName: "",
      startingPriceLabel: "Pathani Suit",
      startingPrice: "₹800",
      ctaHref: "/stitching/new",
      ctaLabel: "Book Tailor",
    },
    {
      id: "wedding",
      heading: "Wedding",
      accent: "Collection",
      subheading: "Heirloom craftsmanship for your most celebrated day.",
      imageUrl: weddingImage,
      imageAlt: "Model dressed in wedding ethnic wear",
      tintClassName: "bg-[#7a3d3a]/[0.10]",
      startingPriceLabel: "Coat Pant",
      startingPrice: "₹2,800",
      ctaHref: "/stitching/new",
      ctaLabel: "Book Tailor",
    },
    {
      id: "kurta",
      heading: "Kurta",
      accent: "Collection",
      subheading: "Everyday elegance, tailored to quiet perfection.",
      imageUrl: "/images/Kurtaset-Hero.png",
      imageAlt: "Model wearing a tailored kurta set",
      tintClassName: "bg-[#5c6b4a]/[0.10]",
      startingPriceLabel: "Kurta Set",
      startingPrice: "₹1,200",
      ctaHref: "/stitching/new",
      ctaLabel: "Book Tailor",
    },
    {
      id: "indo-western",
      heading: "Indo-Western",
      accent: "Edit",
      subheading: "Where heritage meets a contemporary silhouette.",
      imageUrl: image,
      imageAlt: "Model wearing an indo-western fusion outfit",
      tintClassName: "bg-black/[0.12]",
      startingPriceLabel: "Indo-Western",
      startingPrice: "₹4,500",
      ctaHref: "/stitching/new",
      ctaLabel: "Book Tailor",
    },
  ];
}

/* ── Stagger variants for text blocks ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const priceVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.1 },
  },
};

/* ── Main component ── */
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
  const autoplay = useRef(
    Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    autoplay.current,
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  /* ── Progress bar (auto-advance timer visual) ── */
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const AUTOPLAY_DELAY = 5500;

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

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );
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
      <div className="pointer-events-none absolute left-[-20%] top-[-30%] h-[600px] w-[600px] rounded-full opacity-[0.07]"
           style={{ background: "radial-gradient(circle, #c6a664 0%, transparent 70%)" }} />

      <div className="embla h-full overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                className="relative h-full min-w-0 w-full flex-[0_0_100%]"
                key={slide.id}
              >
                {/* ── Background image ── */}
                <motion.div
                  className="pointer-events-none absolute inset-y-0 right-0 w-[65%] sm:w-[70%] lg:w-[60%]"
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1 : 1.08,
                  }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.imageAlt}
                    fill
                    priority={index === 0}
                    quality={80}
                    sizes="(max-width: 640px) 65vw, 70vw"
                    className="object-cover object-[46%_8%] brightness-[1.15] contrast-[1.03] sm:object-[55%_10%] lg:object-[65%_12%]"
                  />
                  {/* Colour tint overlay per slide */}
                  {slide.tintClassName && (
                    <div
                      className={`absolute inset-0 opacity-20 ${slide.tintClassName}`}
                    />
                  )}
                </motion.div>

                {/* ── Cinematic gradient overlays ── */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: [
                      "linear-gradient(90deg, rgba(10,8,6,0.55) 0%, rgba(10,8,6,0.3) 30%, rgba(10,8,6,0.08) 58%, rgba(10,8,6,0.02) 100%)",
                      "linear-gradient(180deg, rgba(10,8,6,0.05) 0%, rgba(10,8,6,0.02) 35%, rgba(10,8,6,0.8) 100%)",
                    ].join(", "),
                  }}
                />
                {/* Vignette edges */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow: "inset 0 0 90px 40px rgba(10,8,6,0.25)",
                  }}
                />

                {/* ── Text content ── */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={slide.id}
                      className="relative z-10 flex h-full flex-col justify-end px-5 pb-4 sm:px-10 sm:pb-6 lg:px-16"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {/* Bottom bar: name/price + CTA */}
                      <div className="flex w-full flex-col items-start gap-3">
                        {slide.startingPrice && (
                          <motion.div variants={priceVariants}>
                            <p className="mb-0.5 font-sans text-[10px] font-semibold uppercase tracking-[2.5px] text-gold/90 sm:text-[11px]">
                              {slide.startingPriceLabel}
                            </p>
                            <p className="mb-0.5 font-sans text-[11px] font-medium tracking-wide text-white/55 sm:text-[12px]">
                              Starting at
                            </p>
                            <p className="font-serif text-[clamp(1.4rem,5vw,2.2rem)] font-bold leading-none text-gold">
                              {slide.startingPrice}
                            </p>
                          </motion.div>
                        )}

                        <motion.div variants={itemVariants} className="shrink-0">
                          <Link
                            href={slide.ctaHref}
                            className="hero-cta-btn group inline-flex h-[42px] w-[160px] items-center justify-center gap-2.5 rounded-lg font-sans text-[13px] font-semibold tracking-wide text-[#0a0806] transition-all duration-300 sm:h-[50px] sm:w-[190px] sm:text-[14px]"
                          >
                            <ScissorsIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-15deg]" />
                            {slide.ctaLabel}
                          </Link>
                        </motion.div>
                      </div>

                      {/* Progress dots */}
                      <motion.div
                        variants={itemVariants}
                        className="mt-3 flex items-center gap-2.5 sm:mt-4"
                      >
                        {slides.map((s, i) => (
                          <button
                            key={s.id}
                            aria-label={`Go to slide ${i + 1}`}
                            onClick={() => scrollTo(i)}
                            className="group relative flex h-4 items-center"
                          >
                            <span
                              className={`block rounded-full transition-all duration-500 ${
                                i === selectedIndex
                                  ? "h-[6px] w-7 bg-gold shadow-[0_0_10px_rgba(198,166,100,0.5)]"
                                  : "h-[5px] w-[5px] bg-white/20 group-hover:bg-white/40"
                              }`}
                            />
                            {/* Active dot progress fill */}
                            {i === selectedIndex && (
                              <span
                                className="absolute left-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-white/30"
                                style={{ width: `${progress}%`, maxWidth: "28px" }}
                              />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop navigation arrows ── */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-6 sm:flex">
        <button
          aria-label="Previous slide"
          onClick={scrollPrev}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-black/50 hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Next slide"
          onClick={scrollNext}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-black/50 hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Bottom decorative line ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
