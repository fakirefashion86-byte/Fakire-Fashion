export default function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      <div className="flex flex-col gap-4 text-ink-secondary">{children}</div>
    </div>
  );
}
