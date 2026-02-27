"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";

/* ──────────────────────────────────────────────────────────────────────────── *
 *  TYPES
 * ──────────────────────────────────────────────────────────────────────────── */

interface PageAuditData {
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
}

interface AuditSummary {
  id: string;
  overallScore: number;
  totalIssues: number;
  createdAt: string;
}

interface FAQ {
  id: string;
  pageType: string;
  pageId: string | null;
  question: string;
  questionEs: string | null;
  answer: string;
  answerEs: string | null;
  sortOrder: number;
  isPublished: boolean;
}

interface Keyword {
  id: string;
  keyword: string;
  keywordEs: string | null;
  pageUrl: string | null;
  searchVolume: number | null;
  difficulty: number | null;
  currentRank: number | null;
  intent: string | null;
}

interface Directory {
  id: string;
  platform: string;
  listingUrl: string | null;
  status: string;
  napConsistent: boolean;
  lastVerified: Date | string | null;
}

interface Props {
  latestAudit: {
    id: string;
    status: string;
    totalPages: number;
    totalIssues: number;
    overallScore: number;
    scores: { technical: number; content: number; structuredData: number; geo: number; aeo: number; cro: number } | null;
    durationMs: number | null;
    createdAt: string;
    pages: PageAuditData[];
  } | null;
  previousAudits: AuditSummary[];
  faqs: FAQ[];
  keywords: Keyword[];
  directories: Directory[];
  gaId: string;
  gscConnected: boolean;
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  HELPERS
 * ──────────────────────────────────────────────────────────────────────────── */

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = Math.max(0, now - then);
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green";
  if (score >= 50) return "text-amber";
  return "text-red";
}

function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green";
  if (score >= 50) return "bg-amber";
  return "bg-red";
}

function severityBg(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red/10 text-red";
    case "warning":
      return "bg-amber/10 text-amber";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function avgPageScore(page: PageAuditData): number {
  if (!page.scores) return 0;
  const s = page.scores;
  return Math.round((s.technical + s.content + s.structuredData + s.geo + s.aeo + s.cro) / 6);
}

function pageIssueCount(page: PageAuditData): number {
  return page.issues?.length ?? 0;
}

function getAllIssues(pages: PageAuditData[]) {
  const all: { type: string; severity: string; message: string; pageUrl: string }[] = [];
  for (const p of pages) {
    if (p.issues) {
      for (const issue of p.issues) {
        all.push(issue);
      }
    }
  }
  return all;
}

const SCORE_HEX_GREEN = "#2D6A4F";
const SCORE_HEX_AMBER = "#E8A820";
const SCORE_HEX_RED = "#DC2626";
const SCORE_HEX_GRAY = "#9CA3AF";

function scoreHex(score: number): string {
  if (score >= 80) return SCORE_HEX_GREEN;
  if (score >= 50) return SCORE_HEX_AMBER;
  return SCORE_HEX_RED;
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  SHARED SUB-COMPONENTS
 * ──────────────────────────────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#ece6d9] ${className}`}>
      {children}
    </div>
  );
}

/** Wrapper that defers chart rendering to the client to avoid recharts SSR hydration errors */
function ChartWrap({ children, height }: { children: React.ReactNode; height: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div style={{ width: "100%", height, minWidth: 0 }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      ) : (
        <div style={{ width: "100%", height }} />
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card className="p-4 text-center">
      <div className={`text-2xl font-bold ${color || "text-tobacco"}`}>{value}</div>
      <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mt-1">{label}</div>
      {sub && <div className="text-[0.68rem] text-gray-400 mt-0.5">{sub}</div>}
    </Card>
  );
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || scoreBgColor(value);
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium text-left">
      {children}
    </th>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  TABS
 * ──────────────────────────────────────────────────────────────────────────── */

const TABS = [
  "Overview",
  "Pages",
  "Technical",
  "Content",
  "GEO",
  "AEO",
  "CRO",
  "Search Console",
  "Recommendations",
] as const;
type TabName = (typeof TABS)[number];

/* ──────────────────────────────────────────────────────────────────────────── *
 *  MAIN COMPONENT
 * ──────────────────────────────────────────────────────────────────────────── */

export function SeoDashboard({
  latestAudit,
  previousAudits,
  faqs,
  keywords,
  directories,
  gaId: _gaId,
  gscConnected,
}: Props) {
  void _gaId; // reserved for future use
  const router = useRouter();
  const [tab, setTab] = useState<TabName>("Overview");
  const [running, setRunning] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const allIssues = useMemo(() => {
    if (!latestAudit) return [];
    return getAllIssues(latestAudit.pages);
  }, [latestAudit]);

  const criticalCount = useMemo(() => allIssues.filter((i) => i.severity === "critical").length, [allIssues]);

  const handleRunAudit = async () => {
    setRunning(true);
    setAuditError(null);
    try {
      const res = await fetch("/api/seo/audit", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Audit failed" }));
        setAuditError(data.error || "Audit failed");
      } else {
        router.refresh();
      }
    } catch {
      setAuditError("Network error — could not start audit.");
    } finally {
      setRunning(false);
    }
  };

  const recommendationCount = allIssues.length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Search &amp; AI Optimization</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Audit, monitor, and optimize your site for search engines and AI models.
          </p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={running}
          className="px-5 py-2.5 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90 disabled:opacity-50 shrink-0"
        >
          {running ? "Running Audit..." : "Run Audit"}
        </button>
      </div>

      {auditError && (
        <div className="bg-red/10 text-red text-sm rounded-lg px-4 py-3">{auditError}</div>
      )}

      {/* ── No audit empty state ── */}
      {!latestAudit && (
        <Card className="py-16 px-6 text-center">
          <div className="text-4xl mb-4 text-gray-300">&#128269;</div>
          <p className="text-gray-400 text-sm">
            No audits yet. Run your first audit to see SEO analytics.
          </p>
        </Card>
      )}

      {latestAudit && (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Overall Score"
              value={`${latestAudit.overallScore}/100`}
              color={scoreColor(latestAudit.overallScore)}
            />
            <StatCard label="Pages Audited" value={latestAudit.totalPages} />
            <StatCard
              label="Total Issues"
              value={latestAudit.totalIssues}
              sub={criticalCount === 0 ? "no critical issues" : `${criticalCount} critical`}
              color={criticalCount > 0 ? "text-red" : "text-green"}
            />
            <StatCard
              label="Last Audit"
              value={hydrated ? timeAgo(latestAudit.createdAt) : "—"}
              sub={latestAudit.durationMs ? `took ${(latestAudit.durationMs / 1000).toFixed(1)}s` : undefined}
            />
          </div>

          {/* ── Tab bar ── */}
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex gap-1 bg-ivory/50 rounded-lg p-1 min-w-max">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative py-2 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    tab === t
                      ? "bg-white text-tobacco shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t}
                  {t === "Recommendations" && recommendationCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[0.65rem] font-bold bg-red text-white rounded-full px-1">
                      {recommendationCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab content ── */}
          {tab === "Overview" && (
            <OverviewTab audit={latestAudit} previousAudits={previousAudits} allIssues={allIssues} />
          )}
          {tab === "Pages" && <PagesTab pages={latestAudit.pages} />}
          {tab === "Technical" && <TechnicalTab pages={latestAudit.pages} totalPages={latestAudit.totalPages} />}
          {tab === "Content" && <ContentTab pages={latestAudit.pages} totalPages={latestAudit.totalPages} />}
          {tab === "GEO" && <GeoTab pages={latestAudit.pages} directories={directories} />}
          {tab === "AEO" && <AeoTab pages={latestAudit.pages} faqs={faqs} />}
          {tab === "CRO" && <CroTab pages={latestAudit.pages} keywords={keywords} />}
          {tab === "Search Console" && <SearchConsoleTab gscConnected={gscConnected} />}
          {tab === "Recommendations" && <RecommendationsTab allIssues={allIssues} />}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  OVERVIEW TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function OverviewTab({
  audit,
  previousAudits,
  allIssues,
}: {
  audit: NonNullable<Props["latestAudit"]>;
  previousAudits: AuditSummary[];
  allIssues: ReturnType<typeof getAllIssues>;
}) {
  const scores = audit.scores;
  const overallScore = audit.overallScore;

  const gaugeData = [{ name: "score", value: overallScore, fill: scoreHex(overallScore) }];

  const categories = scores
    ? [
        { label: "Technical", key: "technical", score: scores.technical },
        { label: "Content", key: "content", score: scores.content },
        { label: "Structured Data", key: "structuredData", score: scores.structuredData },
        { label: "GEO Readiness", key: "geo", score: scores.geo },
        { label: "AEO Readiness", key: "aeo", score: scores.aeo },
        { label: "CRO Readiness", key: "cro", score: scores.cro },
      ]
    : [];

  // Score trend data
  const trendData = useMemo(() => {
    const items = [...previousAudits].reverse().map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: a.overallScore,
    }));
    return items;
  }, [previousAudits]);

  // Issues distribution
  const issueCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const issue of allIssues) {
      if (issue.severity === "critical") counts.critical++;
      else if (issue.severity === "warning") counts.warning++;
      else counts.info++;
    }
    return counts;
  }, [allIssues]);

  const pieData = [
    { name: "Critical", value: issueCounts.critical, color: SCORE_HEX_RED },
    { name: "Warning", value: issueCounts.warning, color: SCORE_HEX_AMBER },
    { name: "Info", value: issueCounts.info, color: SCORE_HEX_GRAY },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Score gauge + category cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: RadialBar gauge */}
        <Card className="p-6 flex flex-col items-center justify-center">
          <h3 className="font-display text-sm mb-2 self-start">Overall Score</h3>
          <ChartWrap height={240}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                data={gaugeData}
                barSize={16}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: "#f3f4f6" }}
                  cornerRadius={8}
                />
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-tobacco"
                  style={{ fontSize: 40, fontWeight: 700 }}
                >
                  {overallScore}
                </text>
                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 13, fill: "#9CA3AF" }}
                >
                  out of 100
                </text>
              </RadialBarChart>
          </ChartWrap>
        </Card>

        {/* Right: category score cards */}
        <Card className="p-6">
          <h3 className="font-display text-sm mb-4">Category Scores</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="bg-ivory/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.78rem] font-medium text-tobacco">{cat.label}</span>
                  <span className={`text-sm font-bold ${scoreColor(cat.score)}`}>{cat.score}</span>
                </div>
                <ProgressBar value={cat.score} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Score Trend */}
      {trendData.length >= 2 && (
        <Card className="p-6">
          <h3 className="font-display text-sm mb-4">Score Trend</h3>
          <ChartWrap height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#999" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#999" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={SCORE_HEX_GREEN}
                  strokeWidth={2}
                  dot={{ r: 4, fill: SCORE_HEX_GREEN }}
                />
              </LineChart>
          </ChartWrap>
        </Card>
      )}

      {/* Issues distribution */}
      {pieData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display text-sm mb-4">Issues Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div style={{ width: 200 }}>
              <ChartWrap height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
                  />
                </PieChart>
              </ChartWrap>
            </div>
            <div className="flex flex-col gap-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-600">
                    {d.name}: {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  PAGES TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function PagesTab({ pages }: { pages: PageAuditData[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
        <h3 className="font-display text-sm">All Audited Pages ({pages.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="border-b border-[#ece6d9]">
              <TableHeader>URL</TableHeader>
              <TableHeader>Score</TableHeader>
              <TableHeader>Issues</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const score = avgPageScore(page);
              const issues = pageIssueCount(page);
              const isExpanded = expanded === page.id;

              return (
                <Fragment key={page.id}>
                  <tr
                    className="border-b border-gray-50 cursor-pointer hover:bg-ivory/30 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : page.id)}
                  >
                    <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[300px] truncate">
                      {page.pageUrl}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${scoreColor(score)}`}>{score}</span>
                    </td>
                    <td className="px-4 py-3">
                      {issues > 0 ? (
                        <span className="text-amber font-medium">{issues}</span>
                      ) : (
                        <span className="text-green font-medium">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {page.statusCode === 200 ? (
                        <span className="text-[0.68rem] bg-green/10 text-green px-2 py-0.5 rounded-full font-medium">
                          {page.statusCode}
                        </span>
                      ) : (
                        <span className="text-[0.68rem] bg-red/10 text-red px-2 py-0.5 rounded-full font-medium">
                          {page.statusCode ?? "N/A"}
                        </span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && page.scores && (
                    <tr className="border-b border-gray-50">
                      <td colSpan={4} className="px-4 py-4 bg-ivory/30">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {(
                            [
                              ["Technical", page.scores.technical],
                              ["Content", page.scores.content],
                              ["Structured Data", page.scores.structuredData],
                              ["GEO", page.scores.geo],
                              ["AEO", page.scores.aeo],
                              ["CRO", page.scores.cro],
                            ] as [string, number][]
                          ).map(([label, val]) => (
                            <div key={label} className="text-center">
                              <div className={`text-lg font-bold ${scoreColor(val)}`}>{val}</div>
                              <div className="text-[0.68rem] uppercase tracking-wider text-gray-400">
                                {label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No pages audited.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Need Fragment import
import { Fragment } from "react";

/* ──────────────────────────────────────────────────────────────────────────── *
 *  TECHNICAL TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function TechnicalTab({ pages, totalPages }: { pages: PageAuditData[]; totalPages: number }) {
  const pages200 = pages.filter((p) => p.statusCode === 200).length;
  const pagesCanonical = pages.filter((p) => p.hasCanonical).length;
  const loadTimes = pages.map((p) => p.loadTimeMs).filter((t): t is number => t !== null);
  const avgLoad = loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Pages with 200 Status"
          value={`${pages200}/${totalPages}`}
          color={pages200 === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard
          label="Pages with Canonical"
          value={`${pagesCanonical}/${totalPages}`}
          color={pagesCanonical === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard
          label="Avg Load Time"
          value={`${avgLoad}ms`}
          color={avgLoad < 1000 ? "text-green" : avgLoad < 3000 ? "text-amber" : "text-red"}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
          <h3 className="font-display text-sm">Technical Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-[#ece6d9]">
                <TableHeader>URL</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Canonical</TableHeader>
                <TableHeader>Load Time</TableHeader>
                <TableHeader>Score</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[250px] truncate">
                    {page.pageUrl}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium ${
                        page.statusCode === 200 ? "bg-green/10 text-green" : "bg-red/10 text-red"
                      }`}
                    >
                      {page.statusCode ?? "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {page.hasCanonical ? (
                      <span className="text-green text-sm">Yes</span>
                    ) : (
                      <span className="text-red text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {page.loadTimeMs !== null ? `${page.loadTimeMs}ms` : "--"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(page.scores?.technical ?? 0)}`}>
                      {page.scores?.technical ?? "--"}
                    </span>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No technical data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  CONTENT TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function ContentTab({ pages, totalPages }: { pages: PageAuditData[]; totalPages: number }) {
  const pagesWithTitle = pages.filter((p) => p.title).length;
  const pagesWithDesc = pages.filter((p) => p.description).length;
  const pagesProperH1 = pages.filter((p) => p.h1Count === 1).length;
  const wordCounts = pages.map((p) => p.wordCount).filter((w): w is number => w !== null);
  const avgWordCount = wordCounts.length > 0 ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
  const totalImages = pages.reduce((sum, p) => sum + (p.imageCount ?? 0), 0);
  const totalAlt = pages.reduce((sum, p) => sum + (p.imagesWithAlt ?? 0), 0);
  const altCoverage = totalImages > 0 ? Math.round((totalAlt / totalImages) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Pages with Title"
          value={`${pagesWithTitle}/${totalPages}`}
          color={pagesWithTitle === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard
          label="Pages with Description"
          value={`${pagesWithDesc}/${totalPages}`}
          color={pagesWithDesc === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard
          label="Proper H1 (exactly 1)"
          value={`${pagesProperH1}/${totalPages}`}
          color={pagesProperH1 === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard label="Avg Word Count" value={avgWordCount} />
        <StatCard
          label="Alt Text Coverage"
          value={`${altCoverage}%`}
          color={scoreColor(altCoverage)}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
          <h3 className="font-display text-sm">Content Analysis</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          {pages.map((page) => {
            const titleLen = page.titleLength ?? 0;
            const descLen = page.descLength ?? 0;
            const headings = page.headings as Record<string, number> | null;

            return (
              <div key={page.id} className="px-4 py-4 space-y-3">
                <div className="font-mono text-[0.78rem] text-gray-600 truncate">{page.pageUrl}</div>

                {/* Title length bar */}
                <div>
                  <div className="flex justify-between text-[0.72rem] text-gray-400 mb-1">
                    <span>Title Length: {titleLen} chars</span>
                    <span className="text-[0.68rem]">green zone: 30-60</span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    {/* Green zone indicator */}
                    <div
                      className="absolute top-0 h-full bg-green/15"
                      style={{ left: "30%", width: "30%" }}
                    />
                    {/* Current position */}
                    <div
                      className={`absolute top-0 h-full rounded-full ${
                        titleLen >= 30 && titleLen <= 60 ? "bg-green" : titleLen > 0 ? "bg-amber" : "bg-red"
                      }`}
                      style={{ width: `${Math.min(100, titleLen)}%` }}
                    />
                  </div>
                </div>

                {/* Description length bar */}
                <div>
                  <div className="flex justify-between text-[0.72rem] text-gray-400 mb-1">
                    <span>Description Length: {descLen} chars</span>
                    <span className="text-[0.68rem]">green zone: 120-160</span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 h-full bg-green/15"
                      style={{ left: `${(120 / 250) * 100}%`, width: `${((160 - 120) / 250) * 100}%` }}
                    />
                    <div
                      className={`absolute top-0 h-full rounded-full ${
                        descLen >= 120 && descLen <= 160 ? "bg-green" : descLen > 0 ? "bg-amber" : "bg-red"
                      }`}
                      style={{ width: `${Math.min(100, (descLen / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Heading hierarchy + stats */}
                <div className="flex flex-wrap gap-4 text-[0.78rem]">
                  {headings && (
                    <div className="flex gap-2">
                      {["h1", "h2", "h3", "h4", "h5", "h6"].map((h) =>
                        headings[h] !== undefined && headings[h] > 0 ? (
                          <span key={h} className="bg-ivory/50 px-2 py-0.5 rounded text-gray-600">
                            {h}: {headings[h]}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 text-gray-400">
                    <span>{page.wordCount ?? 0} words</span>
                    <span>{page.imageCount ?? 0} images</span>
                    <span>{page.internalLinks ?? 0} internal / {page.externalLinks ?? 0} external links</span>
                  </div>
                </div>
              </div>
            );
          })}
          {pages.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No content data available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  GEO TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function GeoTab({ pages, directories }: { pages: PageAuditData[]; directories: Directory[] }) {
  const router = useRouter();
  const [addingDir, setAddingDir] = useState(false);
  const [dirPlatform, setDirPlatform] = useState("");
  const [dirUrl, setDirUrl] = useState("");
  const [dirStatus, setDirStatus] = useState("unclaimed");
  const [savingDir, setSavingDir] = useState(false);

  // Score cards
  const pagesWithSchema = pages.filter((p) => p.structuredData && p.structuredData.length > 0).length;
  const schemaCoverage = pages.length > 0 ? Math.round((pagesWithSchema / pages.length) * 100) : 0;
  const avgContentScore =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + (p.scores?.content ?? 0), 0) / pages.length)
      : 0;
  const avgAeoScore =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + (p.scores?.aeo ?? 0), 0) / pages.length)
      : 0;
  const avgAllScores =
    pages.length > 0
      ? Math.round(
          pages.reduce((s, p) => {
            if (!p.scores) return s;
            return (
              s +
              (p.scores.technical + p.scores.content + p.scores.structuredData + p.scores.geo + p.scores.aeo + p.scores.cro) /
                6
            );
          }, 0) / pages.length
        )
      : 0;

  // Schema types coverage radar
  const SCHEMA_TYPES = ["Organization", "LocalBusiness", "WebSite", "FAQPage", "Service", "BreadcrumbList"];
  const schemaRadar = SCHEMA_TYPES.map((type) => {
    const count = pages.filter((p) => p.structuredData?.includes(type)).length;
    return { type, coverage: pages.length > 0 ? Math.round((count / pages.length) * 100) : 0 };
  });

  const statusColors: Record<string, string> = {
    active: "bg-green/10 text-green",
    pending: "bg-amber/10 text-amber",
    claimed: "bg-teal/10 text-teal",
    unclaimed: "bg-gray-100 text-gray-500",
  };

  const handleAddDir = async () => {
    if (!dirPlatform) return;
    setSavingDir(true);
    await fetch("/api/seo/directories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: dirPlatform, listingUrl: dirUrl || null, status: dirStatus }),
    });
    setSavingDir(false);
    setAddingDir(false);
    setDirPlatform("");
    setDirUrl("");
    setDirStatus("unclaimed");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg">AI Crawlability Assessment</h3>
        <p className="text-gray-400 text-sm mt-0.5">
          How well your site is structured for AI models and generative search.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Structured Data Coverage"
          value={`${schemaCoverage}%`}
          color={scoreColor(schemaCoverage)}
        />
        <StatCard
          label="Avg Content Clarity"
          value={avgContentScore}
          color={scoreColor(avgContentScore)}
        />
        <StatCard
          label="Avg Answerability"
          value={avgAeoScore}
          color={scoreColor(avgAeoScore)}
        />
        <StatCard
          label="Avg Citation Worthiness"
          value={avgAllScores}
          color={scoreColor(avgAllScores)}
        />
      </div>

      {/* Radar Chart */}
      <Card className="p-6">
        <h3 className="font-display text-sm mb-4">Schema Types Coverage</h3>
        <ChartWrap height={300}>
            <RadarChart data={schemaRadar}>
              <PolarGrid stroke="#ece6d9" />
              <PolarAngleAxis dataKey="type" tick={{ fontSize: 11, fill: "#999" }} />
              <Radar
                name="Coverage"
                dataKey="coverage"
                stroke={SCORE_HEX_GREEN}
                fill={SCORE_HEX_GREEN}
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
              />
            </RadarChart>
        </ChartWrap>
      </Card>

      {/* Per-page GEO scores */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
          <h3 className="font-display text-sm">Per-Page GEO Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-[#ece6d9]">
                <TableHeader>URL</TableHeader>
                <TableHeader>GEO Score</TableHeader>
                <TableHeader>Schema Types</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[250px] truncate">
                    {page.pageUrl}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(page.scores?.geo ?? 0)}`}>
                      {page.scores?.geo ?? "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {page.structuredData && page.structuredData.length > 0
                        ? page.structuredData.map((s) => (
                            <span
                              key={s}
                              className="text-[0.68rem] bg-teal/10 text-teal px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))
                        : <span className="text-gray-400 text-[0.78rem]">None</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No GEO data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Directory Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm">Directory Listings</h3>
            <p className="text-gray-400 text-[0.78rem]">
              {directories.filter((d) => d.status === "active").length}/{directories.length} directories active
            </p>
          </div>
          <button
            onClick={() => setAddingDir(true)}
            className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
          >
            + Add Listing
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.85rem]">
              <thead>
                <tr className="bg-ivory/50 border-b border-[#ece6d9]">
                  <TableHeader>Platform</TableHeader>
                  <TableHeader>URL</TableHeader>
                  <TableHeader>NAP</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {directories.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{d.platform}</td>
                    <td className="px-4 py-3 text-gray-400 text-[0.78rem] font-mono truncate max-w-[200px]">
                      {d.listingUrl || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      {d.napConsistent ? (
                        <span className="text-green text-sm">Consistent</span>
                      ) : (
                        <span className="text-red text-sm">Check</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                          statusColors[d.status] || ""
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {directories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No directory listings tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Directory Modal */}
      {addingDir && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setAddingDir(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-4">Add Directory Listing</h3>
            <div className="space-y-3">
              <select
                value={dirPlatform}
                onChange={(e) => setDirPlatform(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Select Platform</option>
                <option value="Google Business">Google Business</option>
                <option value="Yelp">Yelp</option>
                <option value="Angi">Angi</option>
                <option value="Thumbtack">Thumbtack</option>
                <option value="HomeAdvisor">HomeAdvisor</option>
                <option value="BBB">BBB</option>
                <option value="Nextdoor">Nextdoor</option>
              </select>
              <input
                placeholder="Listing URL"
                value={dirUrl}
                onChange={(e) => setDirUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <select
                value={dirStatus}
                onChange={(e) => setDirStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="unclaimed">Unclaimed</option>
                <option value="claimed">Claimed</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setAddingDir(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDir}
                disabled={savingDir || !dirPlatform}
                className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {savingDir ? "Adding..." : "Add Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  AEO TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function AeoTab({ pages, faqs }: { pages: PageAuditData[]; faqs: FAQ[] }) {
  const router = useRouter();
  const [addingFaq, setAddingFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqPageType, setFaqPageType] = useState("general");
  const [savingFaq, setSavingFaq] = useState(false);

  // Score cards
  const pagesWithRichSchema = pages.filter(
    (p) => p.structuredData && p.structuredData.length >= 3
  ).length;
  const schemaRichness = pages.length > 0 ? Math.round((pagesWithRichSchema / pages.length) * 100) : 0;
  const pagesWithFaqSchema = pages.filter(
    (p) => p.structuredData?.includes("FAQPage")
  ).length;
  const faqCoverage = pages.length > 0 ? Math.round((pagesWithFaqSchema / pages.length) * 100) : 0;
  const avgAeo =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + (p.scores?.aeo ?? 0), 0) / pages.length)
      : 0;

  // AEO Radar dimensions
  const radarData = [
    {
      dimension: "FAQ Schema",
      value: faqCoverage,
    },
    {
      dimension: "Schema Richness",
      value: schemaRichness,
    },
    {
      dimension: "Content Quality",
      value: pages.length > 0
        ? Math.round(pages.reduce((s, p) => s + (p.scores?.content ?? 0), 0) / pages.length)
        : 0,
    },
    {
      dimension: "AEO Score",
      value: avgAeo,
    },
    {
      dimension: "Structured Data",
      value: pages.length > 0
        ? Math.round(pages.reduce((s, p) => s + (p.scores?.structuredData ?? 0), 0) / pages.length)
        : 0,
    },
  ];

  // FAQ grouping
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.pageType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const handleAddFaq = async () => {
    if (!faqQuestion || !faqAnswer) return;
    setSavingFaq(true);
    await fetch("/api/seo/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: faqQuestion, answer: faqAnswer, pageType: faqPageType }),
    });
    setSavingFaq(false);
    setAddingFaq(false);
    setFaqQuestion("");
    setFaqAnswer("");
    router.refresh();
  };

  const handleDeleteFaq = async (id: string) => {
    await fetch(`/api/seo/faqs/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg">Answer Engine Optimization</h3>
        <p className="text-gray-400 text-sm mt-0.5">
          Optimize your content to be featured in AI-generated answers and voice search results.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Schema Richness"
          value={`${schemaRichness}%`}
          sub={`${pagesWithRichSchema} pages with 3+ schema types`}
          color={scoreColor(schemaRichness)}
        />
        <StatCard
          label="FAQ Coverage"
          value={`${faqCoverage}%`}
          sub={`${pagesWithFaqSchema} pages with FAQPage schema`}
          color={scoreColor(faqCoverage)}
        />
        <StatCard
          label="Direct Answer Readiness"
          value={avgAeo}
          sub="avg AEO score"
          color={scoreColor(avgAeo)}
        />
      </div>

      {/* AEO Radar */}
      <Card className="p-6">
        <h3 className="font-display text-sm mb-4">AEO Dimensions</h3>
        <ChartWrap height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ece6d9" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#999" }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke={SCORE_HEX_GREEN}
                fill={SCORE_HEX_GREEN}
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
              />
            </RadarChart>
        </ChartWrap>
      </Card>

      {/* Per-page AEO scores */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
          <h3 className="font-display text-sm">Per-Page AEO Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-[#ece6d9]">
                <TableHeader>URL</TableHeader>
                <TableHeader>AEO Score</TableHeader>
                <TableHeader>FAQ Schema</TableHeader>
                <TableHeader>Schema Count</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[250px] truncate">
                    {page.pageUrl}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(page.scores?.aeo ?? 0)}`}>
                      {page.scores?.aeo ?? "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {page.structuredData?.includes("FAQPage") ? (
                      <span className="text-green text-sm">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {page.structuredData?.length ?? 0}
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No AEO data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FAQ Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm">FAQ Management</h3>
            <p className="text-gray-400 text-[0.78rem]">{faqs.length} FAQs across all pages</p>
          </div>
          <button
            onClick={() => setAddingFaq(true)}
            className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
          >
            + Add FAQ
          </button>
        </div>

        {Object.entries(grouped).map(([type, items]) => (
          <Card key={type}>
            <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
              <span className="font-display text-sm capitalize">{type}</span>
              <span className="text-gray-400 text-[0.75rem] ml-2">({items.length})</span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((faq) => (
                <div key={faq.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{faq.question}</div>
                      <div className="text-gray-400 text-[0.78rem] mt-1 line-clamp-2">
                        {faq.answer}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-red text-[0.75rem] hover:underline shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {faqs.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-400 text-sm">No FAQs created yet. Add FAQs to boost AEO.</p>
          </Card>
        )}
      </div>

      {/* Add FAQ Modal */}
      {addingFaq && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setAddingFaq(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-4">Add FAQ</h3>
            <div className="space-y-3">
              <select
                value={faqPageType}
                onChange={(e) => setFaqPageType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="general">General</option>
                <option value="service">Service Page</option>
                <option value="area">Area Page</option>
                <option value="pricing">Pricing</option>
              </select>
              <input
                placeholder="Question *"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <textarea
                placeholder="Answer *"
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setAddingFaq(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaq}
                disabled={savingFaq || !faqQuestion || !faqAnswer}
                className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {savingFaq ? "Adding..." : "Add FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  CRO TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function CroTab({ pages, keywords }: { pages: PageAuditData[]; keywords: Keyword[] }) {
  const router = useRouter();
  const [addingKw, setAddingKw] = useState(false);
  const [kwKeyword, setKwKeyword] = useState("");
  const [kwIntent, setKwIntent] = useState("transactional");
  const [kwPageUrl, setKwPageUrl] = useState("");
  const [savingKw, setSavingKw] = useState(false);

  const avgCro =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + (p.scores?.cro ?? 0), 0) / pages.length)
      : 0;

  // Funnel data: pages with CTAs (internal links > 0 as proxy), pages with /book links
  const totalPages = pages.length;
  const pagesWithCTA = pages.filter(
    (p) => (p.internalLinks ?? 0) > 0
  ).length;
  const pagesWithBookLink = pages.filter(
    (p) => p.pageUrl.includes("/book") || (p.internalLinks ?? 0) > 2
  ).length;

  const engagePct = totalPages > 0 ? Math.round((pagesWithCTA / totalPages) * 100) : 0;
  const convertPct = totalPages > 0 ? Math.round((pagesWithBookLink / totalPages) * 100) : 0;

  const funnelData = [
    { stage: "Visit", pct: 100 },
    { stage: "Engage", pct: engagePct },
    { stage: "Convert", pct: convertPct },
  ];

  const intentColors: Record<string, string> = {
    transactional: "bg-green/10 text-green",
    commercial: "bg-teal/10 text-teal",
    local: "bg-amber/10 text-amber",
    informational: "bg-gray-100 text-gray-500",
  };

  const handleAddKw = async () => {
    if (!kwKeyword) return;
    setSavingKw(true);
    await fetch("/api/seo/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: kwKeyword, intent: kwIntent, pageUrl: kwPageUrl || null }),
    });
    setSavingKw(false);
    setAddingKw(false);
    setKwKeyword("");
    setKwIntent("transactional");
    setKwPageUrl("");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Average CRO Score"
          value={avgCro}
          color={scoreColor(avgCro)}
        />
        <StatCard
          label="Pages with CTAs"
          value={`${pagesWithCTA}/${totalPages}`}
          color={pagesWithCTA === totalPages ? "text-green" : "text-amber"}
        />
        <StatCard
          label="Conversion Paths"
          value={`${pagesWithBookLink}/${totalPages}`}
          color={scoreColor(convertPct)}
        />
      </div>

      {/* Conversion Readiness Funnel */}
      <Card className="p-6">
        <h3 className="font-display text-sm mb-4">Conversion Readiness Funnel</h3>
        <ChartWrap height={200}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#999" }} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 13, fill: "#666" }} width={70} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value}%`, "Rate"]}
              />
              <Bar dataKey="pct" fill={SCORE_HEX_GREEN} radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
        </ChartWrap>
      </Card>

      {/* Per-page CRO scores */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
          <h3 className="font-display text-sm">Per-Page CRO Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-[#ece6d9]">
                <TableHeader>URL</TableHeader>
                <TableHeader>CRO Score</TableHeader>
                <TableHeader>Internal Links</TableHeader>
                <TableHeader>External Links</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[250px] truncate">
                    {page.pageUrl}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${scoreColor(page.scores?.cro ?? 0)}`}>
                      {page.scores?.cro ?? "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{page.internalLinks ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{page.externalLinks ?? 0}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No CRO data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Keywords Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm">Keywords Management</h3>
            <p className="text-gray-400 text-[0.78rem]">{keywords.length} target keywords tracked</p>
          </div>
          <button
            onClick={() => setAddingKw(true)}
            className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
          >
            + Add Keyword
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.85rem]">
              <thead>
                <tr className="bg-ivory/50 border-b border-[#ece6d9]">
                  <TableHeader>Keyword</TableHeader>
                  <TableHeader>Intent</TableHeader>
                  <TableHeader>Target Page</TableHeader>
                  <TableHeader>Rank</TableHeader>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{k.keyword}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                          intentColors[k.intent || ""] || ""
                        }`}
                      >
                        {k.intent || "\u2014"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[0.78rem] font-mono">
                      {k.pageUrl || "\u2014"}
                    </td>
                    <td className="px-4 py-3">{k.currentRank || "\u2014"}</td>
                  </tr>
                ))}
                {keywords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No target keywords added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Keyword Modal */}
      {addingKw && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setAddingKw(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-4">Add Target Keyword</h3>
            <div className="space-y-3">
              <input
                placeholder="Keyword *"
                value={kwKeyword}
                onChange={(e) => setKwKeyword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <select
                value={kwIntent}
                onChange={(e) => setKwIntent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="transactional">Transactional</option>
                <option value="commercial">Commercial</option>
                <option value="local">Local</option>
                <option value="informational">Informational</option>
              </select>
              <input
                placeholder="Target Page URL (e.g., /services/deep-cleaning)"
                value={kwPageUrl}
                onChange={(e) => setKwPageUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setAddingKw(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKw}
                disabled={savingKw || !kwKeyword}
                className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {savingKw ? "Adding..." : "Add Keyword"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  SEARCH CONSOLE TAB
 * ──────────────────────────────────────────────────────────────────────────── */

interface GscPerformanceRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function SearchConsoleTab({ gscConnected }: { gscConnected: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<{
    totals: { clicks: number; impressions: number; ctr: number; position: number };
    rows: GscPerformanceRow[];
  } | null>(null);
  const [topPages, setTopPages] = useState<GscPageRow[]>([]);
  const [topQueries, setTopQueries] = useState<GscQueryRow[]>([]);

  const fetchGscData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [perfRes, pagesRes, queriesRes] = await Promise.all([
        fetch("/api/seo/search-console?type=performance"),
        fetch("/api/seo/search-console?type=pages"),
        fetch("/api/seo/search-console?type=queries"),
      ]);

      if (!perfRes.ok) {
        const data = await perfRes.json().catch(() => ({ error: "Failed to fetch" }));
        setError(data.error || "Failed to fetch Search Console data");
        return;
      }

      const perfData = await perfRes.json();
      setPerformance({
        totals: {
          clicks: perfData.totalClicks ?? 0,
          impressions: perfData.totalImpressions ?? 0,
          ctr: perfData.avgCtr ?? 0,
          position: perfData.avgPosition ?? 0,
        },
        rows: perfData.rows ?? [],
      });

      if (pagesRes.ok) {
        const pData = await pagesRes.json();
        setTopPages(pData.pages || []);
      }

      if (queriesRes.ok) {
        const qData = await queriesRes.json();
        setTopQueries(qData.queries || []);
      }
    } catch {
      setError("Network error fetching Search Console data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gscConnected) {
      fetchGscData();
    }
  }, [gscConnected, fetchGscData]);

  if (!gscConnected) {
    return (
      <Card className="py-16 px-6 text-center">
        <div className="text-4xl mb-4 text-gray-300">&#128279;</div>
        <h3 className="font-display text-lg mb-2">Connect Google Search Console</h3>
        <p className="text-gray-400 text-sm mb-4">
          Link your Google Search Console account to view search performance data.
        </p>
        <a
          href="/admin/settings"
          className="inline-block px-5 py-2.5 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
        >
          Go to Settings
        </a>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="py-16 px-6 text-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading Search Console data...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="py-8 px-6 text-center">
        <div className="text-red text-sm">{error}</div>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card className="py-8 px-6 text-center">
        <div className="text-gray-400 text-sm">No Search Console data available.</div>
      </Card>
    );
  }

  const { totals, rows } = performance;

  const trendData = rows.map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  return (
    <div className="space-y-6">
      {/* Performance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Clicks" value={totals.clicks.toLocaleString()} color="text-green" />
        <StatCard label="Total Impressions" value={totals.impressions.toLocaleString()} />
        <StatCard
          label="Avg CTR"
          value={`${(totals.ctr * 100).toFixed(1)}%`}
          color={scoreColor(totals.ctr * 100 > 5 ? 80 : totals.ctr * 100 > 2 ? 60 : 30)}
        />
        <StatCard
          label="Avg Position"
          value={totals.position.toFixed(1)}
          color={totals.position < 10 ? "text-green" : totals.position < 30 ? "text-amber" : "text-red"}
        />
      </div>

      {/* Trend chart */}
      {trendData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display text-sm mb-4">Search Performance Trend</h3>
          <ChartWrap height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#999" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#999" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #ece6d9", fontSize: 13 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  stroke={SCORE_HEX_GREEN}
                  strokeWidth={2}
                  dot={false}
                  name="Clicks"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="impressions"
                  stroke={SCORE_HEX_AMBER}
                  strokeWidth={2}
                  dot={false}
                  name="Impressions"
                />
              </LineChart>
          </ChartWrap>
          <div className="flex gap-4 mt-2 justify-center text-[0.78rem]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: SCORE_HEX_GREEN }} />
              <span className="text-gray-500">Clicks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: SCORE_HEX_AMBER }} />
              <span className="text-gray-500">Impressions</span>
            </div>
          </div>
        </Card>
      )}

      {/* Top Pages */}
      {topPages.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
            <h3 className="font-display text-sm">Top Pages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-[#ece6d9]">
                  <TableHeader>Page</TableHeader>
                  <TableHeader>Clicks</TableHeader>
                  <TableHeader>Impressions</TableHeader>
                  <TableHeader>CTR</TableHeader>
                  <TableHeader>Position</TableHeader>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-600 max-w-[300px] truncate">
                      {p.page}
                    </td>
                    <td className="px-4 py-3 font-medium text-green">{p.clicks}</td>
                    <td className="px-4 py-3 text-gray-600">{p.impressions}</td>
                    <td className="px-4 py-3 text-gray-600">{(p.ctr * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-600">{p.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Top Queries */}
      {topQueries.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9]">
            <h3 className="font-display text-sm">Top Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-[#ece6d9]">
                  <TableHeader>Query</TableHeader>
                  <TableHeader>Clicks</TableHeader>
                  <TableHeader>Impressions</TableHeader>
                  <TableHeader>CTR</TableHeader>
                  <TableHeader>Position</TableHeader>
                </tr>
              </thead>
              <tbody>
                {topQueries.map((q, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{q.query}</td>
                    <td className="px-4 py-3 font-medium text-green">{q.clicks}</td>
                    <td className="px-4 py-3 text-gray-600">{q.impressions}</td>
                    <td className="px-4 py-3 text-gray-600">{(q.ctr * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-600">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 *  RECOMMENDATIONS TAB
 * ──────────────────────────────────────────────────────────────────────────── */

function RecommendationsTab({
  allIssues,
}: {
  allIssues: { type: string; severity: string; message: string; pageUrl: string }[];
}) {
  const grouped = useMemo(() => {
    const critical = allIssues.filter((i) => i.severity === "critical");
    const warning = allIssues.filter((i) => i.severity === "warning");
    const info = allIssues.filter((i) => i.severity !== "critical" && i.severity !== "warning");
    return { critical, warning, info };
  }, [allIssues]);

  if (allIssues.length === 0) {
    return (
      <Card className="py-16 px-6 text-center">
        <div className="text-4xl mb-4 text-green">&#9989;</div>
        <p className="text-gray-400 text-sm">No issues found. Your site looks great!</p>
      </Card>
    );
  }

  const sections = [
    { label: "Critical Issues", items: grouped.critical, severity: "critical" },
    { label: "Warnings", items: grouped.warning, severity: "warning" },
    { label: "Info", items: grouped.info, severity: "info" },
  ];

  return (
    <div className="space-y-6">
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <Card key={section.label} className="overflow-hidden">
              <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9] flex items-center justify-between">
                <h3 className="font-display text-sm">{section.label}</h3>
                <span className="text-[0.72rem] text-gray-400">{section.items.length} issues</span>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((issue, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span
                      className={`shrink-0 text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium mt-0.5 ${severityBg(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{issue.message}</div>
                      <div className="text-gray-400 text-[0.75rem] font-mono truncate mt-0.5">
                        {issue.pageUrl}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
      )}
    </div>
  );
}
