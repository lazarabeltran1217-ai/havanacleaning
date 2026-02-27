import { prisma } from "@/lib/prisma";
import { SeoDashboard } from "@/components/admin/SeoDashboard";

const fetchServices = () =>
  prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } });
const fetchAreas = () =>
  prisma.areaPage.findMany({ select: { id: true, name: true, slug: true, isPublished: true } });
const fetchPosts = () =>
  prisma.blogPost.findMany({ select: { id: true, title: true, slug: true, isPublished: true } });
const fetchFaqs = () =>
  prisma.fAQ.findMany({ orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }] });
const fetchKeywords = () =>
  prisma.targetKeyword.findMany({ orderBy: { keyword: "asc" } });
const fetchDirectories = () =>
  prisma.directoryListing.findMany({ orderBy: { platform: "asc" } });
const fetchPageConfigs = () =>
  prisma.pageSeoConfig.findMany({ orderBy: { pageUrl: "asc" } });

export default async function AdminSeoPage() {
  let services: Awaited<ReturnType<typeof fetchServices>> = [];
  let areas: Awaited<ReturnType<typeof fetchAreas>> = [];
  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  let faqs: Awaited<ReturnType<typeof fetchFaqs>> = [];
  let keywords: Awaited<ReturnType<typeof fetchKeywords>> = [];
  let directories: Awaited<ReturnType<typeof fetchDirectories>> = [];
  let pages: Awaited<ReturnType<typeof fetchPageConfigs>> = [];

  let gaId = "";

  try {
    const [s, a, p, f, k, d, pg, gaSetting] = await Promise.all([
      fetchServices(),
      fetchAreas(),
      fetchPosts(),
      fetchFaqs(),
      fetchKeywords(),
      fetchDirectories(),
      fetchPageConfigs(),
      prisma.setting.findUnique({ where: { key: "google_analytics_id" } }),
    ]);
    services = s;
    areas = a;
    posts = p;
    faqs = f;
    keywords = k;
    directories = d;
    pages = pg;
    gaId = typeof gaSetting?.value === "string" ? gaSetting.value : "";
  } catch (error) {
    console.error("Failed to fetch SEO data:", error);
  }

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
      gaId={gaId}
    />
  );
}
