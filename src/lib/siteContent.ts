export type HomepageContent = {
  heroBadge: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroSubheading: string;
  heroImageUrl: string;
  ctaHeading: string;
  ctaButtonText: string;
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadge: "Premium Fabrics. Perfect Fit.",
  heroHeading: "Ethnic Wear, Tailored For",
  heroHeadingAccent: "You",
  heroSubheading:
    "Experience the perfect blend of tradition and style. Custom tailored ethnic wear for every occasion.",
  heroImageUrl: "/images/Sherwani_Hero.webp",
  ctaHeading: "Your Style, Your Fit.\nTailored To Perfection.",
  ctaButtonText: "Book Appointment",
};

export const HOMEPAGE_CONTENT_KEY = "homepage";
