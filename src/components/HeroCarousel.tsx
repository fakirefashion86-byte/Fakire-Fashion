"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ArrowRightIcon, CalendarIcon } from "./icons";

type Slide = {
  id: string;
  heading: string;
  accent: string;
  subheading: string;
  imageUrl: string;
  imageAlt: string;
  tintClassName: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

function buildSlides(heroImageUrl: string, heroHeading: string, heroAccent: string, heroSubheading: string): Slide[] {
  const fallbackImage = "/images/Sherwani_Hero.png";
  const image = heroImageUrl || fallbackImage;

  return [
    {
      id: "sherwani",
      heading: heroHeading || "Ethnic Wear, Tailored For",
      accent: heroAccent || "You",
      subheading: heroSubheading || "Timeless designs. Crafted to perfection. Made for every occasion.",
      imageUrl: image,
      imageAlt: "Model wearing a hand-embroidered sherwani",
      tintClassName: "",
      primaryHref: "/category/men",
      primaryLabel: "Shop Now",
      secondaryHref: "/stitching/new",
      secondaryLabel: "Book an Appointment",
    },
    {
      id: "wedding",
      heading: "Wedding",
      accent: "Collection",
      subheading: "Heirloom craftsmanship for your most celebrated day.",
      imageUrl: image,
      imageAlt: "Model dressed in wedding ethnic wear",
      tintClassName: "bg-[#7a3d3a]/[0.10]",
      primaryHref: "/category/women",
      primaryLabel: "Shop Now",
      secondaryHref: "/stitching/new",
      secondaryLabel: "Book an Appointment",
    },
    {
      id: "kurta",
      heading: "Kurta",
      accent: "Collection",
      subheading: "Everyday elegance, tailored to quiet perfection.",
      imageUrl: image,
      imageAlt: "Model wearing a tailored kurta set",
      tintClassName: "bg-[#5c6b4a]/[0.10]",
      primaryHref: "/category/men",
      primaryLabel: "Shop Now",
      secondaryHref: "/stitching/new",
      secondaryLabel: "Book an Appointment",
    },
    {
      id: "indo-western",
      heading: "Indo-Western",
      accent: "Edit",
      subheading: "Where heritage meets a contemporary silhouette.",
      imageUrl: image,
      imageAlt: "Model wearing an indo-western fusion outfit",
      tintClassName: "bg-black/[0.12]",
      primaryHref: "/category/women",
      primaryLabel: "Shop Now",
      secondaryHref: "/stitching/new",
      secondaryLabel: "Book an Appointment",
    },
  ];
}

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
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const pauseAutoplay = useCallback(() => autoplay.current.stop(), []);
  const resumeAutoplay = useCallback(() => autoplay.current.reset(), []);

  return (
    <section
      className="relative h-[600px] w-full overflow-hidden bg-header-bg sm:h-[640px] lg:h-[680px]"
      onTouchStart={pauseAutoplay}
      onTouchEnd={resumeAutoplay}
    >
      <div className="embla h-full overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative h-full min-w-0 w-full flex-[0_0_100%]" key={slide.id}>
                {/* Model photography — anchored to the right and faded into the dark
                    background on its left edge, so the two zones blend into one scene
                    instead of reading as a hard-edged panel. The model itself sits well
                    clear of the fade, so text (which lives in the flow to its left) can
                    never land on top of them. */}
                <motion.div
                  className="pointer-events-none absolute inset-y-0 right-0 w-[72%] [-webkit-mask-image:linear-gradient(to_right,transparent,black_55%)] [mask-image:linear-gradient(to_right,transparent,black_55%)] sm:w-[70%] sm:[-webkit-mask-image:linear-gradient(to_right,transparent,black_45%)] sm:[mask-image:linear-gradient(to_right,transparent,black_45%)]"
                  animate={{ opacity: isActive ? 1 : 0.85, scale: isActive ? 1 : 1.05 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.imageAlt}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    className="h-full w-full object-cover object-[45%_20%] sm:object-[80%_20%]"
                  />
                  {slide.tintClassName && <div className={`absolute inset-0 ${slide.tintClassName}`} />}
                </motion.div>

                {/* Content — sits directly on the dark background, left of the model */}
                <motion.div
                  className="relative z-10 flex h-full flex-col justify-between px-5 py-8 sm:px-10 sm:py-12 lg:px-14"
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 16 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="max-w-[62%] sm:max-w-[50%]">
                    <h1 className="font-serif text-[1.75rem] font-semibold leading-[0.95] text-header-text min-[420px]:text-3xl sm:text-4xl lg:text-5xl">
                      {slide.heading}
                      <br />
                      <span className="text-gold">{slide.accent}</span>
                    </h1>
                    <p className="mt-4 text-xs leading-relaxed text-header-text-muted sm:text-sm">
                      {slide.subheading}
                    </p>
                  </div>

                  <div className="max-w-[62%] sm:max-w-[50%]">
                    <div className="flex flex-col gap-3">
                      <Link
                        href={slide.primaryHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-center text-xs font-semibold tracking-wide text-header-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold/90 sm:text-sm"
                      >
                        {slide.primaryLabel}
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={slide.secondaryHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/70 px-5 py-3 text-center text-xs font-semibold tracking-wide text-gold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 sm:text-sm"
                      >
                        {slide.secondaryLabel}
                        <CalendarIcon className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      {slides.map((s, i) => (
                        <button
                          key={s.id}
                          aria-label={`Go to slide ${i + 1}`}
                          onClick={() => scrollTo(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === selectedIndex ? "w-6 bg-gold" : "w-1.5 bg-white/25"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop-only arrows — mobile relies on swipe + dots */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-6 sm:flex">
        <button
          aria-label="Previous slide"
          onClick={scrollPrev}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
        >
          ‹
        </button>
        <button
          aria-label="Next slide"
          onClick={scrollNext}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
        >
          ›
        </button>
      </div>
    </section>
  );
}
