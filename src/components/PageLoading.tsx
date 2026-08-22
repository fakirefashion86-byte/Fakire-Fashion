// Shared "instant" loading UI, dropped in as loading.tsx at a few route-group
// boundaries (see src/app/loading.tsx, admin/(protected)/loading.tsx,
// tailor/(protected)/loading.tsx). Next.js prefetches and shows this
// immediately on click, before the destination page's own data has resolved,
// so navigation always gives instant visual feedback instead of an
// unresponsive pause on the old page. See the loading.js file convention
// docs (node_modules/next/dist/docs/.../loading.md) for how this wraps
// page.tsx in a Suspense boundary automatically.
export default function PageLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center py-24">
      <div
        aria-label="Loading"
        role="status"
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground"
      />
    </div>
  );
}
