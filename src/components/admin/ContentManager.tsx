"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: Record<string, any>;
}

const DEFAULTS = {
  hero_eyebrow: { text: "Miami's Premier Cleaning Service" },
  hero_headline: { line1: "Clean Homes,", line2: "Cuban", line3: "Soul." },
  hero_subtitle: { text: "Family-owned and rooted in the heart of Cuban-American pride. We treat every home like our own — with care, passion, and the kind of clean your abuela would approve of." },
  hero_cta_primary: { text: "Book a Cleaning", href: "/book" },
  hero_cta_secondary: { text: "View Pricing", href: "/pricing" },
  hero_stats: { items: [{ value: "500+", label: "Homes Cleaned" }, { value: "4.9★", label: "Average Rating" }, { value: "20+", label: "Areas Served" }] },
  trust_bar: { items: ["Background-Checked Staff", "Same-Day Availability", "Bilingual Team (EN/ES)", "Satisfaction Guaranteed", "Serving All Miami-Dade"] },
  about_section: {
    label: "Our Story",
    title: "Born in Havana, Built in Miami.",
    paragraphs: [
      "Havana Cleaning was founded by a family who brought their Cuban heritage and work ethic to Miami. We believe in treating every home like it's our own — with care, pride, and the kind of attention to detail that makes a real difference.",
      "We're not just a cleaning company. We're a family business built on trust, hard work, and the belief that a clean home is the foundation of a happy life.",
      "From Kendall to Coral Gables, from Brickell condos to Pinecrest estates — we bring the same level of care and professionalism to every job. Our team is background-checked and trained to deliver results that would make your abuela proud.",
    ],
  },
};

export function ContentManager({ initialContent }: Props) {
  const router = useRouter();

  // Merge defaults with saved content
  function get(key: string) {
    return initialContent[key] ?? DEFAULTS[key as keyof typeof DEFAULTS] ?? {};
  }

  // Hero fields
  const [eyebrow, setEyebrow] = useState(get("hero_eyebrow").text || "");
  const [headline1, setHeadline1] = useState(get("hero_headline").line1 || "");
  const [headline2, setHeadline2] = useState(get("hero_headline").line2 || "");
  const [headline3, setHeadline3] = useState(get("hero_headline").line3 || "");
  const [subtitle, setSubtitle] = useState(get("hero_subtitle").text || "");
  const [ctaPrimaryText, setCtaPrimaryText] = useState(get("hero_cta_primary").text || "");
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState(get("hero_cta_primary").href || "");
  const [ctaSecondaryText, setCtaSecondaryText] = useState(get("hero_cta_secondary").text || "");
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(get("hero_cta_secondary").href || "");

  // Stats
  const [stats, setStats] = useState<{ value: string; label: string }[]>(
    get("hero_stats").items || DEFAULTS.hero_stats.items
  );

  // Trust bar
  const [trustItems, setTrustItems] = useState<string[]>(
    get("trust_bar").items || DEFAULTS.trust_bar.items
  );

  // About
  const [aboutLabel, setAboutLabel] = useState(get("about_section").label || "");
  const [aboutTitle, setAboutTitle] = useState(get("about_section").title || "");
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(
    get("about_section").paragraphs || DEFAULTS.about_section.paragraphs
  );

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const items = [
      { key: "hero_eyebrow", dataEn: { text: eyebrow } },
      { key: "hero_headline", dataEn: { line1: headline1, line2: headline2, line3: headline3 } },
      { key: "hero_subtitle", dataEn: { text: subtitle } },
      { key: "hero_cta_primary", dataEn: { text: ctaPrimaryText, href: ctaPrimaryHref } },
      { key: "hero_cta_secondary", dataEn: { text: ctaSecondaryText, href: ctaSecondaryHref } },
      { key: "hero_stats", dataEn: { items: stats } },
      { key: "trust_bar", dataEn: { items: trustItems } },
      { key: "about_section", dataEn: { label: aboutLabel, title: aboutTitle, paragraphs: aboutParagraphs } },
    ];

    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem]";
  const labelClass = "block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5";
  const sectionClass = "bg-white rounded-xl p-6 border border-[#ece6d9]";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* HERO SECTION */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Hero Section</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Eyebrow Text</label>
            <input type="text" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Headline Line 1</label>
            <input type="text" value={headline1} onChange={(e) => setHeadline1(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Headline Line 2 (italic accent)</label>
            <input type="text" value={headline2} onChange={(e) => setHeadline2(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Headline Line 3 (green accent)</label>
            <input type="text" value={headline3} onChange={(e) => setHeadline3(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} className={inputClass} />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Call-to-Action Buttons</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Primary Button Text</label>
            <input type="text" value={ctaPrimaryText} onChange={(e) => setCtaPrimaryText(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Primary Button Link</label>
            <input type="text" value={ctaPrimaryHref} onChange={(e) => setCtaPrimaryHref(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Text</label>
            <input type="text" value={ctaSecondaryText} onChange={(e) => setCtaSecondaryText(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Link</label>
            <input type="text" value={ctaSecondaryHref} onChange={(e) => setCtaSecondaryHref(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Hero Stats</h3>
        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Value (e.g. 500+)</label>
                <input type="text" value={stat.value} onChange={(e) => { const n = [...stats]; n[i] = { ...n[i], value: e.target.value }; setStats(n); }} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Label (e.g. Homes Cleaned)</label>
                <input type="text" value={stat.label} onChange={(e) => { const n = [...stats]; n[i] = { ...n[i], label: e.target.value }; setStats(n); }} className={inputClass} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST BAR */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Trust Bar</h3>
        <div className="space-y-2">
          {trustItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={item} onChange={(e) => { const n = [...trustItems]; n[i] = e.target.value; setTrustItems(n); }} className={inputClass} />
              <button onClick={() => setTrustItems(trustItems.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
            </div>
          ))}
          <button onClick={() => setTrustItems([...trustItems, ""])} className="text-green text-[0.82rem] font-medium hover:underline">+ Add Item</button>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">About Section</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Section Label</label>
            <input type="text" value={aboutLabel} onChange={(e) => setAboutLabel(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} className={inputClass} />
          </div>
          {aboutParagraphs.map((p, i) => (
            <div key={i}>
              <label className={labelClass}>Paragraph {i + 1}</label>
              <textarea value={p} onChange={(e) => { const n = [...aboutParagraphs]; n[i] = e.target.value; setAboutParagraphs(n); }} rows={3} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* SAVE */}
      <div className="flex items-center gap-3 pb-10">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green text-white px-8 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save All Content"}
        </button>
        {saved && <span className="text-green text-[0.85rem]">Content saved!</span>}
      </div>
    </div>
  );
}
