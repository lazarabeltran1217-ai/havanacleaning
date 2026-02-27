import { prisma } from "@/lib/prisma";
import { SeoDashboard } from "@/components/admin/SeoDashboard";

const fetchFaqs = () =>
  prisma.fAQ.findMany({ orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }] });
const fetchKeywords = () =>
  prisma.targetKeyword.findMany({ orderBy: { keyword: "asc" } });
const fetchDirectories = () =>
  prisma.directoryListing.findMany({ orderBy: { platform: "asc" } });

export default async function AdminSeoPage() {
  let faqs: Awaited<ReturnType<typeof fetchFaqs>> = [];
  let keywords: Awaited<ReturnType<typeof fetchKeywords>> = [];
  let directories: Awaited<ReturnType<typeof fetchDirectories>> = [];
  let gaId = "";
  let gscConnected = false;

  // Fetch latest completed audit with pages
  let latestAudit: {
    id: string;
    status: string;
    totalPages: number;
    totalIssues: number;
    overallScore: number;
    scores: { technical: number; content: number; structuredData: number; geo: number; aeo: number; cro: number } | null;
    durationMs: number | null;
    createdAt: string;
    pages: {
      id: string;
      pageUrl: string;
      statusCode: number | null;
      title: string | null;
      titleLength: number | null;
      description: string | null;
      descLength: number | null;
      h1Count: number | null;
      h1Text: string | null;
      headings: Record<string, number> | null;
      wordCount: number | null;
      imageCount: number | null;
      imagesWithAlt: number | null;
      internalLinks: number | null;
      externalLinks: number | null;
      hasCanonical: boolean;
      structuredData: string[] | null;
      loadTimeMs: number | null;
      issues: { type: string; severity: string; message: string; pageUrl: string }[] | null;
      scores: { technical: number; content: number; structuredData: number; geo: number; aeo: number; cro: number } | null;
    }[];
  } | null = null;

  let previousAudits: { id: string; overallScore: number; totalIssues: number; createdAt: string }[] = [];

  try {
    const [f, k, d, gaSetting, gscSetting, auditRaw, prevAuditsRaw] = await Promise.all([
      fetchFaqs(),
      fetchKeywords(),
      fetchDirectories(),
      prisma.setting.findUnique({ where: { key: "google_analytics_id" } }),
      prisma.setting.findUnique({ where: { key: "gsc_connected" } }),
      prisma.siteAudit.findFirst({
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        include: { pages: { orderBy: { pageUrl: "asc" } } },
      }),
      prisma.siteAudit.findMany({
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, overallScore: true, totalIssues: true, createdAt: true },
      }),
    ]);

    faqs = f;
    keywords = k;
    directories = d;
    gaId = typeof gaSetting?.value === "string" ? gaSetting.value : "";
    gscConnected = gscSetting?.value === "true" || gscSetting?.value === true;

    if (auditRaw) {
      latestAudit = {
        id: auditRaw.id,
        status: auditRaw.status,
        totalPages: auditRaw.totalPages,
        totalIssues: auditRaw.totalIssues,
        overallScore: auditRaw.overallScore,
        scores: auditRaw.scores as typeof latestAudit extends null ? never : NonNullable<typeof latestAudit>["scores"],
        durationMs: auditRaw.durationMs,
        createdAt: auditRaw.createdAt.toISOString(),
        pages: auditRaw.pages.map((p) => ({
          id: p.id,
          pageUrl: p.pageUrl,
          statusCode: p.statusCode,
          title: p.title,
          titleLength: p.titleLength,
          description: p.description,
          descLength: p.descLength,
          h1Count: p.h1Count,
          h1Text: p.h1Text,
          headings: p.headings as Record<string, number> | null,
          wordCount: p.wordCount,
          imageCount: p.imageCount,
          imagesWithAlt: p.imagesWithAlt,
          internalLinks: p.internalLinks,
          externalLinks: p.externalLinks,
          hasCanonical: p.hasCanonical,
          structuredData: p.structuredData as string[] | null,
          loadTimeMs: p.loadTimeMs,
          issues: p.issues as { type: string; severity: string; message: string; pageUrl: string }[] | null,
          scores: p.scores as { technical: number; content: number; structuredData: number; geo: number; aeo: number; cro: number } | null,
        })),
      };
    }

    previousAudits = prevAuditsRaw.map((a) => ({
      id: a.id,
      overallScore: a.overallScore,
      totalIssues: a.totalIssues,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch SEO data:", error);
  }

  return (
    <SeoDashboard
      latestAudit={latestAudit}
      previousAudits={previousAudits}
      faqs={faqs}
      keywords={keywords}
      directories={directories}
      gaId={gaId}
      gscConnected={gscConnected}
    />
  );
}
