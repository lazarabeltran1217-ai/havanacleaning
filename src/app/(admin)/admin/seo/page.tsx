import { prisma } from "@/lib/prisma";
import { SeoDashboard } from "@/components/admin/SeoDashboard";

export default async function AdminSeoPage() {
  const [
    services,
    areas,
    posts,
    faqs,
    keywords,
    directories,
    pages,
  ] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
    prisma.areaPage.findMany({ select: { id: true, name: true, slug: true, isPublished: true } }),
    prisma.blogPost.findMany({ select: { id: true, title: true, slug: true, isPublished: true } }),
    prisma.fAQ.findMany({ orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }] }),
    prisma.targetKeyword.findMany({ orderBy: { keyword: "asc" } }),
    prisma.directoryListing.findMany({ orderBy: { platform: "asc" } }),
    prisma.pageSeoConfig.findMany({ orderBy: { pageUrl: "asc" } }),
  ]);

  // Compute simple SEO scores
  const totalPublicPages = services.length + areas.filter((a) => a.isPublished).length + posts.filter((p) => p.isPublished).length + 5;
  const pagesWithMeta = pages.filter((p) => p.metaTitle && p.metaDescription).length;
  const faqCount = faqs.filter((f) => f.isPublished).length;
  const directoryActive = directories.filter((d) => d.status === "active").length;

  const seoScore = Math.round((pagesWithMeta / Math.max(totalPublicPages, 1)) * 100);
  const aeoScore = Math.min(100, Math.round((faqCount / Math.max(totalPublicPages, 1)) * 100));
  const geoScore = Math.round((directoryActive / Math.max(directories.length, 1)) * 100);

  return (
    <SeoDashboard
      scores={{ seo: seoScore, aeo: aeoScore, geo: geoScore }}
      services={services}
      areas={areas}
      posts={posts}
      faqs={faqs}
      keywords={keywords}
      directories={directories}
      pages={pages}
    />
  );
}
