import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ScissorsIcon } from "@/components/icons";
import { containerVariants, itemVariants, priceVariants, type Slide } from "./heroSlides";

/** One slide of the hero carousel: background image, gradient overlays, and (if active) its text + CTA + progress dots. */
export default function HeroSlide({
  slide,
  slides,
  isFirst,
  isActive,
  selectedIndex,
  progress,
  onDotClick,
  onViewPricing,
}: {
  slide: Slide;
  slides: Slide[];
  isFirst: boolean;
  isActive: boolean;
  selectedIndex: number;
  progress: number;
  onDotClick: (index: number) => void;
  onViewPricing: () => void;
}) {
  return (
    <div className="relative h-full min-w-0 w-full flex-[0_0_100%]">
      {/* ── Background image ── */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 w-[65%] sm:w-[70%] lg:w-[60%]"
        animate={{ opacity: isActive ? 1 : 0.7, scale: isActive ? 1 : 1.08 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <Image
          src={slide.imageUrl}
          alt={slide.imageAlt}
          fill
          priority={isFirst}
          quality={80}
          sizes="(max-width: 640px) 65vw, 70vw"
          className="object-cover object-[46%_8%] brightness-[1.15] contrast-[1.03] sm:object-[55%_10%] lg:object-[65%_12%]"
        />
        {/* Colour tint overlay per slide */}
        {slide.tintClassName && <div className={`absolute inset-0 opacity-20 ${slide.tintClassName}`} />}
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
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 90px 40px rgba(10,8,6,0.25)" }} />

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

              <motion.div variants={itemVariants} className="flex shrink-0 flex-col items-start gap-2.5">
                <Link
                  href={slide.ctaHref}
                  className="hero-cta-btn group inline-flex h-[42px] w-[160px] items-center justify-center gap-2.5 rounded-lg font-sans text-[13px] font-semibold tracking-wide text-[#0a0806] transition-all duration-300 sm:h-[50px] sm:w-[190px] sm:text-[14px]"
                >
                  <ScissorsIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-15deg]" />
                  {slide.ctaLabel}
                </Link>
                <button
                  type="button"
                  onClick={onViewPricing}
                  className="inline-flex h-[42px] w-[160px] items-center justify-center gap-2 rounded-lg border border-white/25 bg-black/20 font-sans text-[13px] font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:bg-black/40 hover:text-gold sm:h-[50px] sm:w-[190px] sm:text-[14px]"
                >
                  View Pricing
                </button>
              </motion.div>
            </div>

            {/* Progress dots */}
            <motion.div variants={itemVariants} className="mt-3 flex items-center gap-2.5 sm:mt-4">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => onDotClick(i)}
                  className="group relative flex h-4 items-center"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      i === selectedIndex
                        ? "h-[6px] w-7 bg-gold shadow-[0_0_10px_rgba(255,255,255,0.5)]"
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
}
