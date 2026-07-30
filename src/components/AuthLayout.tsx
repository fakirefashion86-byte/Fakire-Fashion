export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-section px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-semibold text-foreground">Fakire Fashion</p>
          <p className="mt-1 text-[10px] tracking-[0.3em] text-accent">ETHNIC WEAR</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h1 className="mb-1 text-center font-serif text-xl text-foreground">{title}</h1>
          {subtitle && <p className="mb-6 text-center text-sm text-ink-muted">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  );
}
