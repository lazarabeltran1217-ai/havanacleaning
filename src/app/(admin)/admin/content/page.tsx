import { prisma } from "@/lib/prisma";
import { ContentManager } from "@/components/admin/ContentManager";

export default async function AdminContentPage() {
  const fetchContent = () =>
    prisma.content.findMany({ orderBy: { key: "asc" } });
  let content: Awaited<ReturnType<typeof fetchContent>> = [];
  try {
    content = await fetchContent();
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  // Fetch active services for the service page content editor
  let services: { id: string; name: string; slug: string }[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentMap: Record<string, any> = {};
  for (const c of content) {
    contentMap[c.key] = c.dataEn;
  }

  return (
    <div>
      <h1 className="font-display text-xl mb-6">Content Manager</h1>
      <p className="text-gray-500 text-sm mb-8">Edit the website content. Changes will appear on the website after saving.</p>
      <ContentManager initialContent={contentMap} services={services} />
    </div>
  );
}
