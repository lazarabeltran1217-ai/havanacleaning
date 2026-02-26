import { prisma } from "@/lib/prisma";
import { ContentManager } from "@/components/admin/ContentManager";

export default async function AdminContentPage() {
  const content = await prisma.content.findMany({ orderBy: { key: "asc" } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentMap: Record<string, any> = {};
  for (const c of content) {
    contentMap[c.key] = c.dataEn;
  }

  return (
    <div>
      <h1 className="font-display text-xl mb-6">Content Manager</h1>
      <p className="text-gray-500 text-sm mb-8">Edit the homepage content. Changes will appear on the website after saving.</p>
      <ContentManager initialContent={contentMap} />
    </div>
  );
}
