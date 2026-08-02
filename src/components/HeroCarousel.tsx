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

/* ── Decorative diamond-line divider ── */
function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 10"
      className={`h-2.5 w-[120px] ${className}`}
      aria-hidden="true"
    >
      <line x1="0" y1="5" x2="48" y2="5" stroke="#C8A35F" strokeWidth="1.2" />
      <rect
        x="52"
        y="1"
        width="7"
        height="7"
        transform="rotate(45 55.5 4.5)"
        fill="#C8A35F"
      />
      <rect
        x="60"
        y="1"
        width="7"
        height="7"
        transform="rotate(45 63.5 4.5)"
        fill="none"
        stroke="#C8A35F"
        strokeWidth="0.8"
      />
      <line x1="72" y1="5" x2="120" y2="5" stroke="#C8A35F" strokeWidth="1.2" />
    </svg>
  );
}

/* ── Slide data builder ── */
function buildSlides(
  heroImageUrl: string,
  heroHeading: string,
  heroAccent: string,
  heroSubheading: string,
): Slide[] {
  const fallbackImage = "/images/Sherwani_Hero.png";
  const image = heroImageUrl || fallbackImage;
  const weddingImage = "/images/Wedding-Collection-Hero.png";

  return [
    {
      id: "sherwani",
      heading: heroHeading || "Ethnic Wear, Tailored For",
      accent: heroAccent || "You",
      subheading:
        heroSubheading ||
        "Timeless designs. Crafted to perfection. Made for every occasion.",
      imageUrl: image,
      imageAlt: "Model wearing a hand-embroidered sherwani",
      tintClassName: "",
      startingPriceLabel: "Sherwani",
      startingPrice: "₹3,500",
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
      imageUrl: image,
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
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.6 },
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
                    className="object-cover object-[85%_15%] sm:object-[80%_15%]"
                  />
                  {/* Colour tint overlay per slide */}
                  {slide.tintClassName && (
                    <div
                      className={`absolute inset-0 opacity-40 ${slide.tintClassName}`}
                    />
                  )}
                </motion.div>

                {/* ── Cinematic gradient overlays ── */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: [
                      "linear-gradient(90deg, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.78) 30%, rgba(10,8,6,0.35) 58%, rgba(10,8,6,0.08) 100%)",
                      "linear-gradient(180deg, rgba(10,8,6,0.25) 0%, rgba(10,8,6,0.05) 40%, rgba(10,8,6,0.55) 100%)",
                    ].join(", "),
                  }}
                />
                {/* Vignette edges */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow: "inset 0 0 120px 60px rgba(10,8,6,0.4)",
                  }}
                />

                {/* ── Text content ── */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={slide.id}
                      className="relative z-10 flex h-full flex-col justify-between px-5 pb-8 pt-14 sm:px-10 sm:pb-12 sm:pt-16 lg:px-16"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {/* Top content block */}
                      <div className="max-w-[52%] sm:max-w-[46%] lg:max-w-[42%]">
                        <motion.h1
                          variants={itemVariants}
                          className="font-serif text-[clamp(2.2rem,7vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-white"
                        >
                          {slide.heading}
                        </motion.h1>

                        <motion.p
                          variants={itemVariants}
                          className="mt-1 font-serif text-[clamp(2.2rem,7vw,3.5rem)] font-semibold italic leading-[1.05] text-gold"
                        >
                          {slide.accent}
                        </motion.p>

                        <motion.div variants={itemVariants} className="mt-6">
                          <SectionDivider />
                        </motion.div>

                        <motion.p
                          variants={itemVariants}
                          className="mt-6 max-w-[280px] font-sans text-[15px] font-normal leading-[1.75] text-white/75 sm:text-base lg:max-w-[320px]"
                        >
                          {slide.subheading}
                        </motion.p>

                        {/* Price block */}
                        {slide.startingPrice && (
                          <motion.div
                            variants={priceVariants}
                            className="mt-10 sm:mt-14"
                          >
                            <div className="mb-4 h-px w-10 bg-gold/40" />
                            <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[2.5px] text-gold/90">
                              {slide.startingPriceLabel}
                            </p>
                            <p className="mb-1 font-sans text-[13px] font-medium tracking-wide text-white/55">
                              Starting at
                            </p>
                            <p className="font-serif text-[clamp(2.5rem,8vw,3.8rem)] font-bold leading-none text-gold">
                              {slide.startingPrice}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Bottom: CTA + dots */}
                      <div className="max-w-[52%] sm:max-w-[46%] lg:max-w-[42%]">
                        <motion.div variants={itemVariants}>
                          <Link
                            href={slide.ctaHref}
                            className="hero-cta-btn group inline-flex h-[54px] w-[210px] items-center justify-center gap-2.5 rounded-lg font-sans text-[15px] font-semibold tracking-wide text-[#0a0806] transition-all duration-300"
                          >
                            <ScissorsIcon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-[-15deg]" />
                            {slide.ctaLabel}
                          </Link>
                        </motion.div>

                        {/* Progress dots */}
                        <motion.div
                          variants={itemVariants}
                          className="mt-6 flex items-center gap-2.5"
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
                      </div>
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
