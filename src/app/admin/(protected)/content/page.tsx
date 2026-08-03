export default function AdminContentPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Site Content</h1>
      <p className="text-sm text-ink-muted">
        Homepage content editing is coming in the next phase.
      </p>
    </div>
  );
}

// Disabled for this phase — site content editing returns next phase.
// import { prisma } from "@/lib/prisma";
// import { DEFAULT_HOMEPAGE_CONTENT, HOMEPAGE_CONTENT_KEY, HomepageContent } from "@/lib/siteContent";
// import ContentEditorForm from "@/components/admin/ContentEditorForm";
//
// export default async function AdminContentPage() {
//   const row = await prisma.siteContent.findUnique({ where: { key: HOMEPAGE_CONTENT_KEY } });
//   const content: HomepageContent = {
//     ...DEFAULT_HOMEPAGE_CONTENT,
//     ...((row?.data as Partial<HomepageContent>) ?? {}),
//   };
//
//   return (
//     <div>
//       <h1 className="mb-2 text-2xl font-semibold">Site Content</h1>
//       <p className="mb-6 text-sm text-ink-muted">
//         Edit the homepage hero and call-to-action section without touching code. Changes go live
//         immediately.
//       </p>
//       <ContentEditorForm initial={content} />
//     </div>
//   );
// }
