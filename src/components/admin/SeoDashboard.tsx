"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface PageSeo {
  id: string;
  pageUrl: string;
  metaTitle: string | null;
  metaDescription: string | null;
  wordCount: number | null;
}

interface Props {
  scores: { seo: number; aeo: number; geo: number };
  services: { id: string; name: string; slug: string }[];
  areas: { id: string; name: string; slug: string; isPublished: boolean }[];
  posts: { id: string; title: string; slug: string; isPublished: boolean }[];
  faqs: FAQ[];
  keywords: Keyword[];
  directories: Directory[];
  pages: PageSeo[];
  gaId?: string;
}

const TABS = ["SEO", "AEO", "GEO", "CRO"] as const;

export function SeoDashboard({ scores, services, areas, posts, faqs, keywords, directories, pages, gaId }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("SEO");

  return (
    <div>
      <h2 className="font-display text-xl mb-4">SEO Manager</h2>

      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "SEO Score", value: scores.seo, color: scoreColor(scores.seo) },
          { label: "AEO Score", value: scores.aeo, color: scoreColor(scores.aeo) },
          { label: "GEO Score", value: scores.geo, color: scoreColor(scores.geo) },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-[#ece6d9] text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}%</div>
            <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
        <div className="bg-white rounded-xl p-4 border border-[#ece6d9] text-center">
          {gaId ? (
            <>
              <div className="text-green text-lg font-bold">Connected</div>
              <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mt-1">Google Analytics</div>
              <div className="text-[0.68rem] text-gray-400 font-mono mt-0.5">{gaId}</div>
            </>
          ) : (
            <>
              <div className="text-gray-400 text-lg font-bold">Not Set</div>
              <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mt-1">Google Analytics</div>
              <a href="/admin/settings" className="text-[0.68rem] text-green hover:underline mt-0.5 inline-block">Configure in Settings</a>
            </>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-ivory/50 rounded-lg p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? "bg-white text-tobacco shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "SEO" && <SeoTab services={services} areas={areas} posts={posts} pages={pages} />}
      {tab === "AEO" && <AeoTab faqs={faqs} />}
      {tab === "GEO" && <GeoTab directories={directories} />}
      {tab === "CRO" && <CroTab keywords={keywords} />}
    </div>
  );
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green";
  if (score >= 50) return "text-amber";
  return "text-red";
}

// ─── SEO TAB ───
function SeoTab({
  services,
  areas,
  posts,
  pages,
}: {
  services: Props["services"];
  areas: Props["areas"];
  posts: Props["posts"];
  pages: Props["pages"];
}) {
  const allPages = [
    { url: "/", label: "Homepage" },
    { url: "/services", label: "Services" },
    { url: "/pricing", label: "Pricing" },
    { url: "/book", label: "Book Now" },
    { url: "/careers", label: "Careers" },
    { url: "/commercial", label: "Commercial" },
    ...services.map((s) => ({ url: `/services/${s.slug}`, label: s.name })),
    ...areas.map((a) => ({ url: `/areas/${a.slug}`, label: `Area: ${a.name}` })),
    ...posts.map((p) => ({ url: `/blog/${p.slug}`, label: `Blog: ${p.title}` })),
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <div className="px-4 py-3 bg-ivory/50 border-b border-[#ece6d9] flex items-center justify-between">
          <h3 className="font-display text-sm">All Public Pages ({allPages.length})</h3>
          <span className="text-[0.72rem] text-gray-400">{pages.length} with meta configured</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
          {allPages.map((p) => {
            const config = pages.find((c) => c.pageUrl === p.url);
            return (
              <div key={p.url} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-gray-400 text-[0.75rem] font-mono">{p.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  {config?.metaTitle ? (
                    <span className="text-[0.68rem] bg-green/10 text-green px-2 py-0.5 rounded-full font-medium">Meta</span>
                  ) : (
                    <span className="text-[0.68rem] bg-red/10 text-red px-2 py-0.5 rounded-full font-medium">No Meta</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Active Services" value={services.length} />
        <StatBox label="Area Pages" value={areas.filter((a) => a.isPublished).length} />
        <StatBox label="Blog Posts" value={posts.filter((p) => p.isPublished).length} />
      </div>
    </div>
  );
}

// ─── AEO TAB ───
function AeoTab({ faqs }: { faqs: FAQ[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pageType, setPageType] = useState("general");
  const [saving, setSaving] = useState(false);

  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.pageType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!question || !answer) return;
    setSaving(true);
    await fetch("/api/seo/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, pageType }),
    });
    setSaving(false);
    setAdding(false);
    setQuestion("");
    setAnswer("");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/seo/faqs/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{faqs.length} FAQs across all pages</p>
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
        >
          + Add FAQ
        </button>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="bg-white rounded-xl border border-[#ece6d9]">
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
                    <div className="text-gray-400 text-[0.78rem] mt-1 line-clamp-2">{faq.answer}</div>
                  </div>
                  <button onClick={() => handleDelete(faq.id)} className="text-red text-[0.75rem] hover:underline shrink-0">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {faqs.length === 0 && (
        <div className="bg-white rounded-xl p-8 border border-[#ece6d9] text-center">
          <p className="text-gray-400 text-sm">No FAQs created yet. Add FAQs to boost AEO.</p>
        </div>
      )}

      {/* Add FAQ Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add FAQ</h3>
            <div className="space-y-3">
              <select value={pageType} onChange={(e) => setPageType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="general">General</option>
                <option value="service">Service Page</option>
                <option value="area">Area Page</option>
                <option value="pricing">Pricing</option>
              </select>
              <input placeholder="Question *" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Answer *" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAdding(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !question || !answer} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GEO TAB ───
function GeoTab({ directories }: { directories: Directory[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("unclaimed");
  const [saving, setSaving] = useState(false);

  const statusColors: Record<string, string> = {
    active: "bg-green/10 text-green",
    pending: "bg-amber/10 text-amber",
    claimed: "bg-teal/10 text-teal",
    unclaimed: "bg-gray-100 text-gray-500",
  };

  const handleAdd = async () => {
    if (!platform) return;
    setSaving(true);
    await fetch("/api/seo/directories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, listingUrl: url || null, status }),
    });
    setSaving(false);
    setAdding(false);
    setPlatform("");
    setUrl("");
    setStatus("unclaimed");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {directories.filter((d) => d.status === "active").length}/{directories.length} directories active
        </p>
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
        >
          + Add Listing
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Platform</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">URL</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">NAP</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {directories.map((d) => (
              <tr key={d.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{d.platform}</td>
                <td className="px-4 py-3 text-gray-400 text-[0.78rem] font-mono truncate max-w-[200px]">
                  {d.listingUrl || "—"}
                </td>
                <td className="px-4 py-3">
                  {d.napConsistent ? (
                    <span className="text-green text-sm">Consistent</span>
                  ) : (
                    <span className="text-red text-sm">Check</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[d.status] || ""}`}>
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

      {/* Add Listing Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Directory Listing</h3>
            <div className="space-y-3">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Platform</option>
                <option value="Google Business">Google Business</option>
                <option value="Yelp">Yelp</option>
                <option value="Angi">Angi</option>
                <option value="Thumbtack">Thumbtack</option>
                <option value="HomeAdvisor">HomeAdvisor</option>
                <option value="BBB">BBB</option>
                <option value="Nextdoor">Nextdoor</option>
              </select>
              <input placeholder="Listing URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="unclaimed">Unclaimed</option>
                <option value="claimed">Claimed</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAdding(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !platform} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CRO TAB ───
function CroTab({ keywords }: { keywords: Keyword[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [intent, setIntent] = useState("transactional");
  const [pageUrl, setPageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const intentColors: Record<string, string> = {
    transactional: "bg-green/10 text-green",
    commercial: "bg-teal/10 text-teal",
    local: "bg-amber/10 text-amber",
    informational: "bg-gray-100 text-gray-500",
  };

  const handleAdd = async () => {
    if (!keyword) return;
    setSaving(true);
    await fetch("/api/seo/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, intent, pageUrl: pageUrl || null }),
    });
    setSaving(false);
    setAdding(false);
    setKeyword("");
    setIntent("transactional");
    setPageUrl("");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{keywords.length} target keywords tracked</p>
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
        >
          + Add Keyword
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Keyword</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Intent</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Target Page</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rank</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k) => (
              <tr key={k.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{k.keyword}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${intentColors[k.intent || ""] || ""}`}>
                    {k.intent || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-[0.78rem] font-mono">{k.pageUrl || "—"}</td>
                <td className="px-4 py-3">{k.currentRank || "—"}</td>
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

      {/* Add Keyword Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Target Keyword</h3>
            <div className="space-y-3">
              <input placeholder="Keyword *" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <select value={intent} onChange={(e) => setIntent(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="transactional">Transactional</option>
                <option value="commercial">Commercial</option>
                <option value="local">Local</option>
                <option value="informational">Informational</option>
              </select>
              <input placeholder="Target Page URL (e.g., /services/deep-cleaning)" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAdding(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !keyword} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Keyword"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#ece6d9] p-4 text-center">
      <div className="text-xl font-bold text-tobacco">{value}</div>
      <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
