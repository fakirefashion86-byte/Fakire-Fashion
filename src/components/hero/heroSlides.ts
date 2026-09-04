export type Slide = {
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

/** Builds the fixed set of hero slides, with the first slide's text/image swappable from admin content. */
export function buildSlides(
  heroImageUrl: string,
  heroHeading: string,
  heroAccent: string,
  heroSubheading: string
): Slide[] {
  const fallbackImage = "/images/Sherwani_Hero.webp";
  const image = heroImageUrl || fallbackImage;
  const weddingImage = "/images/Wedding-Collection-Hero.webp";

  return [
    {
      id: "sherwani",
      heading: heroHeading || "Ethnic Wear, Tailored For",
      accent: heroAccent || "You",
      subheading: heroSubheading || "Timeless designs. Crafted to perfection. Made for every occasion.",
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
      tintClassName: "bg-black/[0.10]",
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
      tintClassName: "bg-black/[0.10]",
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
export const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export const priceVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.1 },
  },
};
