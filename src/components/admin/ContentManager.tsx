"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getServiceDefaults } from "@/lib/service-defaults";
import { MediaInput } from "@/components/admin/MediaInput";

interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: Record<string, any>;
  services?: ServiceInfo[];
}

const DEFAULTS = {
  hero_eyebrow: { text: "Professional Home & Business Cleaning" },
  hero_headline: { line1: "Clean Homes,", line2: "Happy", line3: "Families." },
  hero_subtitle: { text: "Family-owned and driven by quality. We treat every home like our own — with care, precision, and the kind of clean you'll notice." },
  hero_cta_primary: { text: "Book a Cleaning", href: "/book" },
  hero_cta_secondary: { text: "View Pricing", href: "/pricing" },
  hero_stats: { items: [{ value: "500+", label: "Homes Cleaned" }, { value: "4.9★", label: "Average Rating" }, { value: "20+", label: "Areas Served" }] },
  trust_bar: { items: ["Background-Checked Staff", "Same-Day Availability", "Bilingual Team (EN/ES)", "Satisfaction Guaranteed", "Serving Clients Nationwide"] },
  about_section: {
    label: "Our Story",
    title: "Family-Owned. Quality-Driven.",
    paragraphs: [
      "Havana Cleaning was founded by a family who believes every home deserves to feel spotless. We bring care, pride, and attention to detail to every job.",
      "We're not just a cleaning company. We're a family business built on trust, hard work, and the belief that a clean home is the foundation of a happy life.",
      "From Florida neighborhoods to homes across the country — we bring the same level of care and professionalism to every job. Our team is background-checked and trained to deliver results you'll love.",
    ],
  },
  about_page: {
    mission: "To deliver families the kind of clean that feels like home — with heart, hustle, and pride.",
    values: [
      { title: "Family First", description: "We treat every home like our own. Our clients are family, and their trust is everything." },
      { title: "Strong Work Ethic", description: "Hard work, dedication, and pride in every detail — that's the Havana way." },
      { title: "Trust & Transparency", description: "Background-checked teams, upfront pricing, and honest communication. Always." },
      { title: "Community Roots", description: "Founded in Florida, growing nationwide. We're proud to serve our communities every single day." },
    ],
  },
  reviews_page: {
    title: "What Our Clients Are Saying",
    subtitle: "Real reviews from real families across the country.",
  },
  hero_media: { videoUrl: "", posterUrl: "", fallbackImageUrl: "" },
  about_page_media: { heroImageUrl: "", storyImageUrl: "" },
  services_page_media: { heroImageUrl: "" },
  commercial_page_media: { heroImageUrl: "" },
  careers_page_media: { heroImageUrl: "" },
  handyman_page_media: { heroImageUrl: "" },
};

export function ContentManager({ initialContent, services = [] }: Props) {
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

  // About Page
  const [aboutMission, setAboutMission] = useState(get("about_page").mission || "");
  const [aboutValues, setAboutValues] = useState<{ title: string; description: string }[]>(
    get("about_page").values || DEFAULTS.about_page.values
  );

  // Reviews Page
  const [reviewsTitle, setReviewsTitle] = useState(get("reviews_page").title || "");
  const [reviewsSubtitle, setReviewsSubtitle] = useState(get("reviews_page").subtitle || "");
  const [reviewsHeroImage, setReviewsHeroImage] = useState(get("reviews_page").heroImageUrl || "");

  // Hero Media
  const [heroVideoUrl, setHeroVideoUrl] = useState(get("hero_media").videoUrl || "");
  const [heroPosterUrl, setHeroPosterUrl] = useState(get("hero_media").posterUrl || "");
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(get("hero_media").fallbackImageUrl || "");

  // About Section Image
  const [aboutImageUrl, setAboutImageUrl] = useState(get("about_section").imageUrl || "");

  // Page Hero Images
  const [aboutHeroImage, setAboutHeroImage] = useState(get("about_page_media").heroImageUrl || "");
  const [aboutStoryImage, setAboutStoryImage] = useState(get("about_page_media").storyImageUrl || "");
  const [servicesHeroImage, setServicesHeroImage] = useState(get("services_page_media").heroImageUrl || "");
  const [commercialHeroImage, setCommercialHeroImage] = useState(get("commercial_page_media").heroImageUrl || "");
  const [careersHeroImage, setCareersHeroImage] = useState(get("careers_page_media").heroImageUrl || "");
  const [handymanHeroImage, setHandymanHeroImage] = useState(get("handyman_page_media").heroImageUrl || "");

  // Service page content
  const [selectedService, setSelectedService] = useState(services[0]?.slug || "");
  const [svcLongDesc, setSvcLongDesc] = useState("");
  const [svcFeatures, setSvcFeatures] = useState<string[]>([]);
  const [svcBenefits, setSvcBenefits] = useState<{ title: string; text: string }[]>([]);
  const [svcImageUrl, setSvcImageUrl] = useState("");

  // Load service content when selection changes
  function loadServiceContent(slug: string) {
    setSelectedService(slug);
    const saved = initialContent[`service_${slug}`];
    const defaults = getServiceDefaults(slug);

    setSvcLongDesc(saved?.longDescription || defaults.longDescription);
    setSvcFeatures(
      Array.isArray(saved?.features) && saved.features.length > 0
        ? saved.features
        : defaults.features
    );
    setSvcBenefits(
      Array.isArray(saved?.benefits) && saved.benefits.length > 0
        ? saved.benefits
        : defaults.benefits
    );
    setSvcImageUrl(saved?.imageUrl || "");
  }

  // Initialize on first render if services exist
  if (services.length > 0 && selectedService && svcFeatures.length === 0 && svcLongDesc === "") {
    loadServiceContent(selectedService);
  }

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const items: { key: string; dataEn: Record<string, unknown> }[] = [
      { key: "hero_eyebrow", dataEn: { text: eyebrow } },
      { key: "hero_headline", dataEn: { line1: headline1, line2: headline2, line3: headline3 } },
      { key: "hero_subtitle", dataEn: { text: subtitle } },
      { key: "hero_cta_primary", dataEn: { text: ctaPrimaryText, href: ctaPrimaryHref } },
      { key: "hero_cta_secondary", dataEn: { text: ctaSecondaryText, href: ctaSecondaryHref } },
      { key: "hero_stats", dataEn: { items: stats } },
      { key: "trust_bar", dataEn: { items: trustItems } },
      { key: "about_section", dataEn: { label: aboutLabel, title: aboutTitle, paragraphs: aboutParagraphs, imageUrl: aboutImageUrl } },
      { key: "about_page", dataEn: { mission: aboutMission, values: aboutValues } },
      { key: "reviews_page", dataEn: { title: reviewsTitle, subtitle: reviewsSubtitle, heroImageUrl: reviewsHeroImage } },
      { key: "hero_media", dataEn: { videoUrl: heroVideoUrl, posterUrl: heroPosterUrl, fallbackImageUrl: heroFallbackUrl } },
      { key: "about_page_media", dataEn: { heroImageUrl: aboutHeroImage, storyImageUrl: aboutStoryImage } },
      { key: "services_page_media", dataEn: { heroImageUrl: servicesHeroImage } },
      { key: "commercial_page_media", dataEn: { heroImageUrl: commercialHeroImage } },
      { key: "careers_page_media", dataEn: { heroImageUrl: careersHeroImage } },
      { key: "handyman_page_media", dataEn: { heroImageUrl: handymanHeroImage } },
    ];

    // Include current service content if a service is selected
    if (selectedService) {
      items.push({
        key: `service_${selectedService}`,
        dataEn: {
          longDescription: svcLongDesc,
          features: svcFeatures,
          benefits: svcBenefits,
          imageUrl: svcImageUrl,
        },
      });
    }

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

  async function handleSaveServiceOnly() {
    if (!selectedService) return;
    setLoading(true);
    setSaved(false);

    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{
          key: `service_${selectedService}`,
          dataEn: {
            longDescription: svcLongDesc,
            features: svcFeatures,
            benefits: svcBenefits,
            imageUrl: svcImageUrl,
          },
        }],
      }),
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

      {/* HERO MEDIA */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Hero Background Video</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-blue-800 text-[0.78rem] font-semibold mb-1">How to add a video from Pexels:</p>
          <ol className="text-blue-700 text-[0.72rem] list-decimal list-inside space-y-0.5">
            <li>Find a video on pexels.com</li>
            <li>Copy the page URL (e.g. pexels.com/video/...4109227/) or the download link</li>
            <li>Paste it below and click &quot;Get Video&quot;</li>
            <li>The URL will be automatically converted to a direct video link</li>
          </ol>
        </div>
        <div className="space-y-3">
          <MediaInput label="Video URL" value={heroVideoUrl} onChange={setHeroVideoUrl} onPosterResolved={(url) => { if (!heroPosterUrl) setHeroPosterUrl(url); if (!heroFallbackUrl) setHeroFallbackUrl(url); }} type="video" helpText="Paste any Pexels video URL and click 'Get Video'" />
          <MediaInput label="Poster Image (shown while video loads)" value={heroPosterUrl} onChange={setHeroPosterUrl} />
          <MediaInput label="Mobile Fallback Image" value={heroFallbackUrl} onChange={setHeroFallbackUrl} helpText="Shown on mobile instead of video to save bandwidth" />
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
          <MediaInput label="Section Image (replaces right text column)" value={aboutImageUrl} onChange={setAboutImageUrl} helpText="When set, paragraphs stack on the left and this image fills the right" />
        </div>
      </div>

      {/* ABOUT PAGE */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">About Page</h3>
        <p className="text-gray-400 text-[0.78rem] mb-4">Content for the standalone /about page.</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mission Statement</label>
            <textarea value={aboutMission} onChange={(e) => setAboutMission(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Values</label>
            <div className="space-y-3">
              {aboutValues.map((v, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => { const n = [...aboutValues]; n[i] = { ...n[i], title: e.target.value }; setAboutValues(n); }}
                      className={inputClass}
                      placeholder="Value title"
                    />
                    <button
                      onClick={() => setAboutValues(aboutValues.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={v.description}
                    onChange={(e) => { const n = [...aboutValues]; n[i] = { ...n[i], description: e.target.value }; setAboutValues(n); }}
                    rows={2}
                    className={inputClass}
                    placeholder="Value description"
                  />
                </div>
              ))}
              <button
                onClick={() => setAboutValues([...aboutValues, { title: "", description: "" }])}
                className="text-green text-[0.82rem] font-medium hover:underline"
              >
                + Add Value
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS PAGE */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Reviews Page</h3>
        <p className="text-gray-400 text-[0.78rem] mb-4">Content for the /reviews page header.</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Page Title</label>
            <input type="text" value={reviewsTitle} onChange={(e) => setReviewsTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Page Subtitle</label>
            <textarea value={reviewsSubtitle} onChange={(e) => setReviewsSubtitle(e.target.value)} rows={2} className={inputClass} />
          </div>
          <MediaInput label="Hero Background Image" value={reviewsHeroImage} onChange={setReviewsHeroImage} />
        </div>
      </div>

      {/* PAGE HERO IMAGES */}
      <div className={sectionClass}>
        <h3 className="font-display text-base mb-4">Page Hero Images</h3>
        <p className="text-gray-400 text-[0.78rem] mb-4">
          Background images for each page&apos;s hero section. Leave empty for the default tobacco background.
        </p>
        <div className="space-y-4">
          <MediaInput label="About Page Hero" value={aboutHeroImage} onChange={setAboutHeroImage} />
          <MediaInput label="About Page Story Image" value={aboutStoryImage} onChange={setAboutStoryImage} helpText="Shown alongside the story text on the /about page" />
          <MediaInput label="Services Page Hero" value={servicesHeroImage} onChange={setServicesHeroImage} />
          <MediaInput label="Commercial Page Hero" value={commercialHeroImage} onChange={setCommercialHeroImage} />
          <MediaInput label="Careers Page Hero" value={careersHeroImage} onChange={setCareersHeroImage} />
          <MediaInput label="Handyman Page Hero" value={handymanHeroImage} onChange={setHandymanHeroImage} />
        </div>
      </div>

      {/* SAVE HOMEPAGE CONTENT */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green text-white px-8 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save All Content"}
        </button>
        {saved && <span className="text-green text-[0.85rem]">Content saved!</span>}
      </div>

      {/* SERVICE PAGES */}
      {services.length > 0 && (
        <>
          <div className="border-t border-[#ece6d9] pt-8 mt-8">
            <h2 className="font-display text-xl mb-2">Service Pages</h2>
            <p className="text-gray-400 text-[0.85rem] mb-6">
              Edit the content shown on each individual service page.
            </p>
          </div>

          <div className={sectionClass}>
            <div className="mb-5">
              <label className={labelClass}>Select Service</label>
              <select
                value={selectedService}
                onChange={(e) => loadServiceContent(e.target.value)}
                className={inputClass}
              >
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="space-y-5">
                {/* Service Image */}
                <MediaInput label="Service Image" value={svcImageUrl} onChange={setSvcImageUrl} helpText="Used on the services listing card and as the service detail page hero background" />

                {/* Long Description */}
                <div>
                  <label className={labelClass}>Long Description</label>
                  <textarea
                    value={svcLongDesc}
                    onChange={(e) => setSvcLongDesc(e.target.value)}
                    rows={4}
                    className={inputClass}
                    placeholder="Extended description shown below the hero on the service page..."
                  />
                </div>

                {/* Features */}
                <div>
                  <label className={labelClass}>What&apos;s Included</label>
                  <div className="space-y-2">
                    {svcFeatures.map((feat, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => { const n = [...svcFeatures]; n[i] = e.target.value; setSvcFeatures(n); }}
                          className={inputClass}
                        />
                        <button
                          onClick={() => setSvcFeatures(svcFeatures.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-sm px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setSvcFeatures([...svcFeatures, ""])}
                      className="text-green text-[0.82rem] font-medium hover:underline"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className={labelClass}>Why Choose Us (Benefits)</label>
                  <div className="space-y-3">
                    {svcBenefits.map((b, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={b.title}
                            onChange={(e) => { const n = [...svcBenefits]; n[i] = { ...n[i], title: e.target.value }; setSvcBenefits(n); }}
                            className={inputClass}
                            placeholder="Benefit title"
                          />
                          <button
                            onClick={() => setSvcBenefits(svcBenefits.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 text-sm px-2"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          value={b.text}
                          onChange={(e) => { const n = [...svcBenefits]; n[i] = { ...n[i], text: e.target.value }; setSvcBenefits(n); }}
                          rows={2}
                          className={inputClass}
                          placeholder="Benefit description"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setSvcBenefits([...svcBenefits, { title: "", text: "" }])}
                      className="text-green text-[0.82rem] font-medium hover:underline"
                    >
                      + Add Benefit
                    </button>
                  </div>
                </div>

                {/* Save Service Content */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveServiceOnly}
                    disabled={loading}
                    className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Saving..." : `Save ${services.find(s => s.slug === selectedService)?.name || "Service"} Content`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="pb-10" />
    </div>
  );
}
