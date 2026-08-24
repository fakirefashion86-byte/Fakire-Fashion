import Image from "next/image";

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
    <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden px-4 py-10 sm:py-16">
      <Image
        src="/images/auth-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl border border-[#d4af6a]/40 bg-black/70 p-6 backdrop-blur-md sm:p-8"
          style={{ boxShadow: "0 0 50px rgba(212, 175, 106, 0.12)" }}
        >
          <h1 className="mb-1 text-center font-serif text-2xl text-white sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mb-6 text-center text-[11px] tracking-[0.25em] text-white/60 uppercase sm:mb-8">
              {subtitle}
            </p>
          )}
          {!subtitle && <div className="mb-6 sm:mb-8" />}
          {children}
        </div>
      </div>
    </div>
  );
}
