import Image from "next/image";

// Fixed site header height (see Header.tsx: h-[72px] at every breakpoint).
// Footer never renders on /login or /register (Footer.tsx hides itself off
// the homepage), so the only chrome to subtract is the header.
const HEADER_H = "72px";

export default function GoldAuthLayout({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden px-7 py-8 sm:px-4 sm:py-16"
      style={{ minHeight: `calc(100dvh - ${HEADER_H})` }}
    >
      <Image
        src="/images/auth-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={80}
        className="object-cover object-center"
      />
      {/* Darken only enough for text contrast — keep the boutique background visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />

      <div className="relative w-full max-w-sm">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#e3c17a]/60 bg-black/50 p-5 backdrop-blur-md sm:p-8"
          style={{ boxShadow: "0 0 60px rgba(212, 175, 106, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
          {/* Glossy diagonal sheen, like the reference mock's glass-card highlight */}
          <div
            className="pointer-events-none absolute -inset-1 opacity-60"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(227,193,122,0.12) 50%, transparent 65%)",
            }}
          />
          {/* Thin gold edge-light along the top/left border */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(227,193,122,0.35) 0%, transparent 18%)",
            }}
          />

          <div className="relative">
            <h1 className="mb-1 text-center font-serif text-2xl text-white sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mb-5 text-center text-[11px] tracking-[0.25em] text-white/60 uppercase sm:mb-8">
                {subtitle}
              </p>
            )}
            {!subtitle && <div className="mb-5 sm:mb-8" />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
