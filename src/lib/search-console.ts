import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers to read GSC settings from the DB
// ---------------------------------------------------------------------------

async function getServiceAccountJson(): Promise<string> {
  const setting = await prisma.setting.findUnique({
    where: { key: "google_search_console_key" },
  });
  const val = typeof setting?.value === "string" ? setting.value : "";
  return val;
}

async function getSiteUrl(): Promise<string> {
  const setting = await prisma.setting.findUnique({
    where: { key: "google_search_console_site" },
  });
  const val = typeof setting?.value === "string" ? setting.value : "";
  return val;
}

// ---------------------------------------------------------------------------
// Build an authenticated Search Console client
// ---------------------------------------------------------------------------

async function getSearchConsoleClient() {
  const serviceAccountJson = await getServiceAccountJson();
  const siteUrl = await getSiteUrl();

  if (!serviceAccountJson || !siteUrl) {
    throw new Error(
      "Google Search Console is not configured. Please add your service account key and site URL in settings.",
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(serviceAccountJson),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  return { searchconsole, siteUrl };
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 1); // GSC data has ~2-day lag; use yesterday
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PerformanceRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformance {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  rows: PerformanceRow[];
}

/**
 * Fetch daily search performance (clicks, impressions, CTR, position)
 * for the given number of trailing days.
 */
export async function getSearchPerformance(
  days: number,
): Promise<SearchPerformance> {
  const { searchconsole, siteUrl } = await getSearchConsoleClient();
  const { startDate, endDate } = getDateRange(days);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: days,
    },
  });

  const rows: PerformanceRow[] = (res.data.rows ?? []).map((r) => ({
    date: r.keys?.[0] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));

  const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + r.position, 0) / rows.length
      : 0;

  return { totalClicks, totalImpressions, avgCtr, avgPosition, rows };
}

export interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Fetch the top 20 pages by clicks for the given number of trailing days.
 */
export async function getTopPages(days: number): Promise<PageRow[]> {
  const { searchconsole, siteUrl } = await getSearchConsoleClient();
  const { startDate, endDate } = getDateRange(days);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 20,
    },
  });

  return (res.data.rows ?? []).map((r) => ({
    page: r.keys?.[0] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Fetch the top 20 queries by impressions for the given number of trailing days.
 */
export async function getTopQueries(days: number): Promise<QueryRow[]> {
  const { searchconsole, siteUrl } = await getSearchConsoleClient();
  const { startDate, endDate } = getDateRange(days);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 20,
    },
  });

  return (res.data.rows ?? []).map((r) => ({
    query: r.keys?.[0] ?? "",
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

/**
 * Check whether GSC credentials are configured in the database.
 */
export async function isConnected(): Promise<boolean> {
  try {
    const serviceAccountJson = await getServiceAccountJson();
    const siteUrl = await getSiteUrl();

    if (!serviceAccountJson || !siteUrl) return false;

    // Validate that the JSON is parseable
    JSON.parse(serviceAccountJson);
    return true;
  } catch {
    return false;
  }
}
