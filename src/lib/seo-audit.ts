import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

// ── Types ──

export interface PageIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  pageUrl: string;
}

export interface PageScores {
  technical: number;
  content: number;
  structuredData: number;
  geo: number;
  aeo: number;
  cro: number;
}

export interface PageResult {
  url: string;
  statusCode: number;
  loadTimeMs: number;
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  h1Count: number;
  h1Text: string | null;
  headings: Record<string, number>;
  wordCount: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinks: number;
  externalLinks: number;
  structuredDataTypes: string[];
  scores: PageScores;
  issues: PageIssue[];
}

export interface AuditResult {
  pages: PageResult[];
  overallScores: PageScores;
  totalPages: number;
  totalIssues: number;
  durationMs: number;
}

// ── URL Discovery ──

async function discoverUrls(baseUrl: string): Promise<string[]> {
  const staticPaths = [
    "/",
    "/services",
    "/pricing",
    "/book",
    "/careers",
    "/commercial",
    "/faq",
    "/about",
    "/reviews",
    "/blog",
  ];

  const urls = staticPaths.map((p) => (p === "/" ? baseUrl : `${baseUrl}${p}`));

  // Dynamic service pages
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  for (const s of services) {
    urls.push(`${baseUrl}/services/${s.slug}`);
  }

  // Dynamic area pages (published only)
  const areas = await prisma.areaPage.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  for (const a of areas) {
    urls.push(`${baseUrl}/areas/${a.slug}`);
  }

  // Dynamic blog posts (published only)
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  for (const p of posts) {
    urls.push(`${baseUrl}/blog/${p.slug}`);
  }

  return urls;
}

// ── HTML Fetching & Parsing ──

async function fetchPage(
  url: string
): Promise<{ html: string; statusCode: number; loadTimeMs: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "HavanaCleaningSEOAudit/1.0",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const loadTimeMs = Date.now() - start;
    return { html, statusCode: res.status, loadTimeMs };
  } catch (err: unknown) {
    const loadTimeMs = Date.now() - start;
    const isAbort =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));
    return {
      html: "",
      statusCode: isAbort ? 408 : 0,
      loadTimeMs,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parsePage(html: string, url: string, baseUrl: string) {
  const $ = cheerio.load(html);

  // Title
  const title = $("title").first().text().trim() || null;
  const titleLength = title ? title.length : 0;

  // Meta description
  const description =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const descriptionLength = description ? description.length : 0;

  // Canonical
  const canonical = $('link[rel="canonical"]').attr("href") || null;

  // Headings
  const headings: Record<string, number> = {};
  for (let i = 1; i <= 6; i++) {
    const tag = `h${i}`;
    headings[tag] = $(tag).length;
  }

  const h1Count = headings["h1"] || 0;
  const h1Text =
    h1Count > 0 ? $("h1").first().text().trim().substring(0, 200) : null;

  // Word count (body text)
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  // Images
  const images = $("img");
  const imageCount = images.length;
  let imagesWithAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt && alt.trim().length > 0) {
      imagesWithAlt++;
    }
  });

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (
      href.startsWith("/") ||
      href.startsWith(baseUrl) ||
      href.startsWith(baseUrl.replace("https://", "http://"))
    ) {
      internalLinks++;
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      externalLinks++;
    }
  });

  // JSON-LD structured data
  const structuredDataTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "");
      extractSchemaTypes(json, structuredDataTypes);
    } catch {
      // ignore malformed JSON-LD
    }
  });

  // Detect lists (ol, ul) in body for AEO scoring
  const hasLists = $("body ol, body ul").length > 0;

  // Detect links to /book
  const hasBookLink =
    $('a[href="/book"], a[href*="/book"]').length > 0 ||
    html.includes('href="/book"');

  // Detect phone/contact links
  const hasPhoneLink =
    $('a[href^="tel:"]').length > 0 || $('a[href*="contact"]').length > 0;

  // Detect trust signals (testimonials, reviews, ratings)
  const hasTrustSignals =
    $('[class*="testimonial"], [class*="review"], [class*="rating"]').length >
      0 ||
    html.toLowerCase().includes("testimonial") ||
    html.toLowerCase().includes("5-star") ||
    html.toLowerCase().includes("reviews");

  // Detect CTA buttons
  const hasCTAButtons =
    $(
      'a.btn, a.button, button[class*="cta"], a[class*="cta"], a[class*="btn"], a[class*="Button"]'
    ).length > 0 ||
    $('a[href="/book"]').length > 0;

  // Detect speakable (schema.org/speakable)
  const hasSpeakable =
    html.includes("speakable") || html.includes("Speakable");

  return {
    title,
    titleLength,
    description,
    descriptionLength,
    canonical,
    h1Count,
    h1Text,
    headings,
    wordCount,
    imageCount,
    imagesWithAlt,
    internalLinks,
    externalLinks,
    structuredDataTypes,
    hasLists,
    hasBookLink,
    hasPhoneLink,
    hasTrustSignals,
    hasCTAButtons,
    hasSpeakable,
  };
}

function extractSchemaTypes(obj: unknown, types: string[]): void {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractSchemaTypes(item, types);
    }
  } else if (obj && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    if (typeof record["@type"] === "string") {
      if (!types.includes(record["@type"])) {
        types.push(record["@type"]);
      }
    } else if (Array.isArray(record["@type"])) {
      for (const t of record["@type"]) {
        if (typeof t === "string" && !types.includes(t)) {
          types.push(t);
        }
      }
    }
    // Recurse into nested objects (e.g., @graph)
    for (const value of Object.values(record)) {
      if (typeof value === "object" && value !== null) {
        extractSchemaTypes(value, types);
      }
    }
  }
}

// ── Scoring ──

function scoreTechnical(
  page: ReturnType<typeof parsePage>,
  statusCode: number
): number {
  let score = 0;
  if (statusCode === 200) score += 20;
  if (page.title) score += 15;
  if (page.titleLength >= 30 && page.titleLength <= 60) score += 15;
  if (page.description) score += 15;
  if (page.descriptionLength >= 120 && page.descriptionLength <= 160)
    score += 15;
  if (page.h1Count === 1) score += 10;
  if (page.canonical) score += 10;
  return Math.min(score, 100);
}

function scoreContent(page: ReturnType<typeof parsePage>): number {
  let score = 0;
  if (page.wordCount >= 300) score += 30;
  if (page.wordCount >= 500) score += 20;
  if (page.imageCount > 0) score += 10;
  if (page.imageCount > 0 && page.imagesWithAlt === page.imageCount)
    score += 20;
  if ((page.headings["h2"] || 0) > 0) score += 20;
  return Math.min(score, 100);
}

function scoreStructuredData(page: ReturnType<typeof parsePage>): number {
  let score = 0;
  const types = page.structuredDataTypes;
  if (types.length > 0) score += 30;
  if (types.includes("Organization") || types.includes("LocalBusiness"))
    score += 25;
  if (
    types.includes("FAQPage") ||
    types.includes("Service") ||
    types.includes("BreadcrumbList")
  )
    score += 25;
  if (types.length >= 4) score += 20;
  return Math.min(score, 100);
}

function scoreGeo(page: ReturnType<typeof parsePage>): number {
  let score = 0;
  const types = page.structuredDataTypes;
  if (types.includes("LocalBusiness")) score += 40;
  // Check for address presence (we look for PostalAddress type in the schema)
  if (types.includes("PostalAddress") || types.includes("LocalBusiness"))
    score += 30;
  // Check for areaServed — we look for the type or the presence of LocalBusiness
  // which typically includes areaServed for local service businesses
  if (types.includes("LocalBusiness") || types.includes("ServiceArea"))
    score += 30;
  return Math.min(score, 100);
}

function scoreAeo(page: ReturnType<typeof parsePage>): number {
  let score = 0;
  if (page.structuredDataTypes.includes("FAQPage")) score += 30;
  if (page.hasSpeakable) score += 20;
  if (page.wordCount > 300) score += 20;
  if ((page.headings["h2"] || 0) > 0 && (page.headings["h3"] || 0) > 0)
    score += 15;
  if (page.hasLists) score += 15;
  return Math.min(score, 100);
}

function scoreCro(page: ReturnType<typeof parsePage>): number {
  let score = 0;
  if (page.hasBookLink) score += 30;
  if (page.hasPhoneLink) score += 20;
  if (page.hasTrustSignals) score += 20;
  if (page.hasCTAButtons) score += 30;
  return Math.min(score, 100);
}

// ── Issue Detection ──

function detectIssues(
  parsed: ReturnType<typeof parsePage>,
  statusCode: number,
  url: string,
  loadTimeMs: number
): PageIssue[] {
  const issues: PageIssue[] = [];

  // Status code issues
  if (statusCode !== 200) {
    issues.push({
      type: "status_code",
      severity: "critical",
      message: `Page returned HTTP ${statusCode}`,
      pageUrl: url,
    });
  }

  // Title issues
  if (!parsed.title) {
    issues.push({
      type: "missing_title",
      severity: "critical",
      message: "Page is missing a <title> tag",
      pageUrl: url,
    });
  } else if (parsed.titleLength < 30) {
    issues.push({
      type: "title_too_short",
      severity: "warning",
      message: `Title is too short (${parsed.titleLength} chars, recommended 30-60)`,
      pageUrl: url,
    });
  } else if (parsed.titleLength > 60) {
    issues.push({
      type: "title_too_long",
      severity: "warning",
      message: `Title is too long (${parsed.titleLength} chars, recommended 30-60)`,
      pageUrl: url,
    });
  }

  // Meta description issues
  if (!parsed.description) {
    issues.push({
      type: "missing_description",
      severity: "critical",
      message: "Page is missing a meta description",
      pageUrl: url,
    });
  } else if (parsed.descriptionLength < 120) {
    issues.push({
      type: "description_too_short",
      severity: "warning",
      message: `Meta description is too short (${parsed.descriptionLength} chars, recommended 120-160)`,
      pageUrl: url,
    });
  } else if (parsed.descriptionLength > 160) {
    issues.push({
      type: "description_too_long",
      severity: "warning",
      message: `Meta description is too long (${parsed.descriptionLength} chars, recommended 120-160)`,
      pageUrl: url,
    });
  }

  // H1 issues
  if (parsed.h1Count === 0) {
    issues.push({
      type: "missing_h1",
      severity: "critical",
      message: "Page is missing an H1 heading",
      pageUrl: url,
    });
  } else if (parsed.h1Count > 1) {
    issues.push({
      type: "multiple_h1",
      severity: "warning",
      message: `Page has ${parsed.h1Count} H1 headings (should have exactly 1)`,
      pageUrl: url,
    });
  }

  // Canonical
  if (!parsed.canonical) {
    issues.push({
      type: "missing_canonical",
      severity: "warning",
      message: "Page is missing a canonical link",
      pageUrl: url,
    });
  }

  // Content length
  if (parsed.wordCount < 300) {
    issues.push({
      type: "thin_content",
      severity: "warning",
      message: `Page has only ${parsed.wordCount} words (recommended 300+)`,
      pageUrl: url,
    });
  }

  // Images without alt
  if (parsed.imageCount > 0 && parsed.imagesWithAlt < parsed.imageCount) {
    const missing = parsed.imageCount - parsed.imagesWithAlt;
    issues.push({
      type: "images_missing_alt",
      severity: "warning",
      message: `${missing} of ${parsed.imageCount} images are missing alt text`,
      pageUrl: url,
    });
  }

  // No structured data
  if (parsed.structuredDataTypes.length === 0) {
    issues.push({
      type: "no_structured_data",
      severity: "warning",
      message: "Page has no JSON-LD structured data",
      pageUrl: url,
    });
  }

  // No heading hierarchy
  if ((parsed.headings["h2"] || 0) === 0) {
    issues.push({
      type: "no_h2_headings",
      severity: "info",
      message: "Page has no H2 headings for content structure",
      pageUrl: url,
    });
  }

  // Slow page
  if (loadTimeMs > 3000) {
    issues.push({
      type: "slow_page",
      severity: "warning",
      message: `Page load time is ${loadTimeMs}ms (recommended under 3000ms)`,
      pageUrl: url,
    });
  }

  // No book link (CRO)
  if (!parsed.hasBookLink) {
    issues.push({
      type: "no_book_cta",
      severity: "info",
      message: "Page has no link to the booking page (/book)",
      pageUrl: url,
    });
  }

  // No FAQPage schema (AEO)
  if (!parsed.structuredDataTypes.includes("FAQPage")) {
    issues.push({
      type: "no_faq_schema",
      severity: "info",
      message:
        "Page has no FAQPage structured data (recommended for AI/voice search)",
      pageUrl: url,
    });
  }

  // No LocalBusiness schema (GEO)
  if (!parsed.structuredDataTypes.includes("LocalBusiness")) {
    issues.push({
      type: "no_local_business_schema",
      severity: "info",
      message: "Page has no LocalBusiness structured data (recommended for local SEO)",
      pageUrl: url,
    });
  }

  return issues;
}

// ── Main Audit Runner ──

async function auditPage(url: string, baseUrl: string): Promise<PageResult> {
  const { html, statusCode, loadTimeMs } = await fetchPage(url);

  if (!html || statusCode === 0 || statusCode === 408) {
    // Connection failed or timed out
    const issues: PageIssue[] = [
      {
        type: "fetch_failed",
        severity: "critical",
        message:
          statusCode === 408
            ? "Page request timed out after 10 seconds"
            : "Failed to fetch page",
        pageUrl: url,
      },
    ];

    return {
      url,
      statusCode,
      loadTimeMs,
      title: null,
      titleLength: 0,
      description: null,
      descriptionLength: 0,
      canonical: null,
      h1Count: 0,
      h1Text: null,
      headings: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      wordCount: 0,
      imageCount: 0,
      imagesWithAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      structuredDataTypes: [],
      scores: {
        technical: 0,
        content: 0,
        structuredData: 0,
        geo: 0,
        aeo: 0,
        cro: 0,
      },
      issues,
    };
  }

  const parsed = parsePage(html, url, baseUrl);

  const scores: PageScores = {
    technical: scoreTechnical(parsed, statusCode),
    content: scoreContent(parsed),
    structuredData: scoreStructuredData(parsed),
    geo: scoreGeo(parsed),
    aeo: scoreAeo(parsed),
    cro: scoreCro(parsed),
  };

  const issues = detectIssues(parsed, statusCode, url, loadTimeMs);

  return {
    url,
    statusCode,
    loadTimeMs,
    title: parsed.title,
    titleLength: parsed.titleLength,
    description: parsed.description,
    descriptionLength: parsed.descriptionLength,
    canonical: parsed.canonical,
    h1Count: parsed.h1Count,
    h1Text: parsed.h1Text,
    headings: parsed.headings,
    wordCount: parsed.wordCount,
    imageCount: parsed.imageCount,
    imagesWithAlt: parsed.imagesWithAlt,
    internalLinks: parsed.internalLinks,
    externalLinks: parsed.externalLinks,
    structuredDataTypes: parsed.structuredDataTypes,
    scores,
    issues,
  };
}

export async function runSiteAudit(baseUrl: string): Promise<AuditResult> {
  const auditStart = Date.now();

  // Discover all public URLs
  const urls = await discoverUrls(baseUrl);

  // Audit pages sequentially with a short pause between fetches.
  // Each fetch triggers SSR on Vercel which opens a DB connection;
  // the 200ms pause + 1s idle timeout in prisma.ts ensures previous
  // connections release before new ones are needed.
  const pages: PageResult[] = [];
  for (let i = 0; i < urls.length; i++) {
    const result = await auditPage(urls[i], baseUrl);
    pages.push(result);
    if (i < urls.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Calculate overall scores (average across all pages per category)
  const categories: (keyof PageScores)[] = [
    "technical",
    "content",
    "structuredData",
    "geo",
    "aeo",
    "cro",
  ];

  const overallScores: PageScores = {
    technical: 0,
    content: 0,
    structuredData: 0,
    geo: 0,
    aeo: 0,
    cro: 0,
  };

  if (pages.length > 0) {
    for (const category of categories) {
      const sum = pages.reduce((acc, p) => acc + p.scores[category], 0);
      overallScores[category] = Math.round(sum / pages.length);
    }
  }

  const totalIssues = pages.reduce((acc, p) => acc + p.issues.length, 0);
  const durationMs = Date.now() - auditStart;

  return {
    pages,
    overallScores,
    totalPages: pages.length,
    totalIssues,
    durationMs,
  };
}
