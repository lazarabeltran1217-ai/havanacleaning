import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { JsonLd } from "@/components/website/JsonLd";
import { aggregateRatingSchema, reviewSchema, faqPageSchema } from "@/lib/schema";
import { Check } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { getTranslations, getLocale } from "next-intl/server";
import { buildContentMap, localized } from "@/lib/i18n-content";

// Helper to get content with fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getContent(contentMap: Record<string, unknown>, key: string, fallback: Record<string, unknown>): Record<string, any> {
  return (contentMap[key] ?? fallback) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations();

  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let allTestimonials: { rating: number; customerName: string; content: string; contentEs: string | null; location: string | null }[] = [];
  let faqs: { question: string; questionEs: string | null; answer: string; answerEs: string | null }[] = [];
  let areaPages: { slug: string; name: string }[] = [];
  let contentMap: Record<string, unknown> = {};

  try {
    [services, testimonials, allTestimonials, faqs, areaPages] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ where: { isApproved: true, isFeatured: true }, take: 3, orderBy: { createdAt: "desc" } }),
      prisma.testimonial.findMany({ where: { isApproved: true }, select: { rating: true, customerName: true, content: true, contentEs: true, location: true } }),
      prisma.fAQ.findMany({ where: { isPublished: true, pageType: "general" }, orderBy: { sortOrder: "asc" }, select: { question: true, questionEs: true, answer: true, answerEs: true }, take: 6 }),
      prisma.areaPage.findMany({ where: { isPublished: true }, select: { slug: true, name: true } }),
    ]);

    // Load editable content (locale-aware)
    const contentRows = await prisma.content.findMany({ where: { published: true } });
    contentMap = buildContentMap(contentRows, locale);
  } catch (error) {
    console.error("Failed to fetch data from database:", error);
  }

  // Editable content with fallbacks
  const heroEyebrow = getContent(contentMap, "hero_eyebrow", { text: t("hero.eyebrow") });
  const heroHeadline = getContent(contentMap, "hero_headline", { line1: t("hero.title1"), line2: t("hero.title2"), line3: t("hero.title3") });
  const heroSubtitle = getContent(contentMap, "hero_subtitle", { text: t("hero.subtitle") });
  const heroCta1 = getContent(contentMap, "hero_cta_primary", { text: t("hero.bookCta"), href: "/book" });
  const heroCta2 = getContent(contentMap, "hero_cta_secondary", { text: t("hero.pricingCta"), href: "/pricing" });
  const heroStats = getContent(contentMap, "hero_stats", { items: [{ value: "500+", label: t("hero.homesCleaned") }, { value: "4.9★", label: t("hero.avgRating") }, { value: "20+", label: t("hero.areasServed") }] });
  const trustBar = getContent(contentMap, "trust_bar", { items: [t("trust.background"), t("trust.sameDay"), t("trust.bilingual"), t("trust.guaranteed"), t("trust.nationwide")] });
  const aboutSection = getContent(contentMap, "about_section", {
    label: t("about.label"),
    title: t("about.title"),
    paragraphs: [t("about.p1"), t("about.p2"), t("about.p3")],
  });

  const avgRating = allTestimonials.length > 0
    ? allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length
    : 5;

  return (
    <>
      <JsonLd data={aggregateRatingSchema(Math.round(avgRating * 10) / 10, allTestimonials.length)} />
      {allTestimonials.slice(0, 3).map((testimonial, i) => (
        <JsonLd key={i} data={reviewSchema({ author: testimonial.customerName, content: testimonial.content, rating: testimonial.rating, location: testimonial.location || undefined })} />
      ))}

      {/* HERO */}
      <section className="min-h-screen bg-tobacco flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />

        {/* Left palm tree */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="Decorative palm tree silhouette" className="absolute left-0 bottom-0 hidden md:block md:w-[420px] h-auto pointer-events-none opacity-50" />

        {/* Right palm tree (flipped) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="Decorative palm tree silhouette" className="absolute right-0 bottom-0 hidden md:block md:w-[380px] h-auto pointer-events-none opacity-50 -scale-x-100" />

        <div className="max-w-[800px] relative z-10 text-center px-6 pt-36 pb-20 mx-auto">
          <div className="text-[0.75rem] tracking-[0.25em] uppercase text-green-light mb-6 flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-green-light" />
            {heroEyebrow.text}
            <span className="w-10 h-px bg-green-light" />
          </div>
          <h1 className="font-display text-cream mb-7 leading-none" style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}>
            {heroHeadline.line1}<br />
            <em className="text-amber">{heroHeadline.line2}</em><br />
            <span className="text-green-light">{heroHeadline.line3}</span>
          </h1>
          <p className="text-sand text-lg leading-relaxed max-w-[500px] mx-auto mb-12">
            {heroSubtitle.text}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href={heroCta1.href || "/book"} className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all">
              {heroCta1.text}
            </Link>
            <Link href={heroCta2.href || "/pricing"} className="border-[1.5px] border-cream/30 text-cream px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-cream transition-colors">
              {heroCta2.text}
            </Link>
          </div>
          <div className="flex gap-12 mt-12 pt-10 border-t border-cream/[0.12] justify-center">
            {(heroStats.items as { value: string; label: string }[]).map((stat: { value: string; label: string }, i: number) => (
              <div key={i}>
                <div className="font-display text-3xl font-black text-amber">{stat.value}</div>
                <div className="text-sand text-[0.75rem] tracking-[0.1em] mt-1.5 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-gradient-to-r from-green to-teal py-5 px-6 md:px-20 flex items-center justify-evenly gap-10 flex-wrap">
        {(trustBar.items as string[]).map((item: string) => (
          <div key={item} className="flex items-center gap-2.5 text-white text-[0.85rem] font-medium tracking-[0.06em] uppercase">
            <Check className="w-4 h-4 shrink-0" /> {item}
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="services" className="bg-tobacco py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green-light" />{t("services.label")}
        </div>
        <h2 className="font-display text-cream mb-4" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>{t("services.title")}</h2>
        {allTestimonials.length > 0 && (
          <div className="flex items-center gap-2 mb-12 text-sand text-[0.85rem]">
            <span className="text-gold">★★★★★</span>
            <span>{(Math.round(avgRating * 10) / 10).toFixed(1)} {t("testimonials.fromReviews", { count: allTestimonials.length })}</span>
          </div>
        )}
        {allTestimonials.length === 0 && <div className="mb-12" />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.slug}`} className="bg-white/[0.04] border border-gold/15 p-10 hover:bg-green-light/10 hover:border-green-light transition-colors">
              <ServiceIcon emoji={service.icon || "✨"} className="w-10 h-10 text-green-light mb-4" />
              <div className="font-display text-lg text-cream mb-2.5">{localized(service.name, service.nameEs, locale)}</div>
              <p className="text-sand text-[0.88rem] leading-relaxed mb-4">{localized(service.description, service.descriptionEs, locale)}</p>
              <div className="text-amber text-[0.85rem] font-medium tracking-wide">
                {service.basePrice > 0 ? t("services.startingAt", { price: formatCurrency(service.basePrice) }) : t("services.customQuote")}
              </div>
            </Link>
          ))}
          {services.length % 4 !== 0 && (
            <Link href="/book" className="bg-green-light/[0.06] border border-gold/15 p-10 flex flex-col items-center justify-center text-center hover:bg-green-light/10 hover:border-green-light transition-colors">
              <div className="font-display text-xl text-cream mb-3">{t("services.customClean")}</div>
              <p className="text-sand text-[0.88rem] leading-relaxed mb-4">{t("services.customCleanDesc")}</p>
              <span className="text-amber text-[0.85rem] font-medium tracking-wide">{t("services.freeQuote")}</span>
            </Link>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-cream py-24 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-green" />{aboutSection.label}
          </div>
          <h2 className="font-display mb-10" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
            {aboutSection.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              {(aboutSection.paragraphs as string[]).slice(0, 2).map((p: string, i: number) => (
                <p key={i} className="text-[#5a4535] text-[0.95rem] leading-relaxed">{p}</p>
              ))}
            </div>
            <div className="space-y-5">
              {(aboutSection.paragraphs as string[]).slice(2).map((p: string, i: number) => (
                <p key={i} className="text-[#5a4535] text-[0.95rem] leading-relaxed">{p}</p>
              ))}
              <Link href="/book" className="inline-block bg-green text-white px-8 py-3.5 text-[0.88rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green-light hover:text-tobacco transition-colors">
                {t("about.bookToday")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-ivory py-24 px-6 md:px-20 text-center">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green" />{t("testimonials.label")}
          </div>
          <h2 className="font-display mb-16" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>{t("testimonials.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white border border-tobacco/10 rounded-md p-9 text-left relative">
                <div className="text-gold text-lg mb-3">{"★".repeat(testimonial.rating)}</div>
                <p className="font-serif italic text-[#5a4535] leading-relaxed mb-6">{localized(testimonial.content, testimonial.contentEs, locale)}</p>
                <div className="font-semibold text-[0.85rem]">{testimonial.customerName}</div>
                <div className="text-green text-[0.78rem]">{testimonial.location}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — AEO */}
      {faqs.length > 0 && (
        <>
          <JsonLd data={faqPageSchema(faqs.map(f => ({ question: f.question, answer: f.answer })))} />
          <section id="faq" className="bg-ivory py-24 px-6 md:px-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-green" />{t("faq.label")}
              </div>
              <h2 className="font-display text-center mb-12" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
                {t("faq.title")}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-white border border-tobacco/10 rounded-lg group">
                    <summary className="px-6 py-5 cursor-pointer font-semibold text-[0.95rem] text-tobacco flex items-center justify-between hover:text-green transition-colors">
                      {localized(faq.question, faq.questionEs, locale)}
                      <span className="text-green ml-4 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="px-6 pb-5 text-[#5a4535] text-[0.9rem] leading-relaxed border-t border-tobacco/5 pt-4">
                      {localized(faq.answer, faq.answerEs, locale)}
                    </div>
                  </details>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/faq" className="text-green font-medium hover:underline text-[0.9rem]">
                  {t("faq.viewAll")}
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* SERVICE AREAS */}
      <section id="areas" className="bg-cream py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green" />{t("areas.label")}
        </div>
        <h2 className="font-display mb-2" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>{t("areas.title")}</h2>
        <p className="text-[#7a6555] max-w-[500px] leading-relaxed mb-10">{t("areas.bodySubtitle")}</p>
        <div className="flex flex-wrap gap-2.5">
          {SERVICE_AREAS.map((area) => {
            const slug = area.toLowerCase().replace(/\s+/g, "-");
            const hasPage = areaPages.some((a) => a.slug === slug || a.slug === `${slug}-cleaning`);
            const matchedSlug = areaPages.find((a) => a.slug === slug || a.slug === `${slug}-cleaning`)?.slug;

            return hasPage ? (
              <Link
                key={area}
                href={`/areas/${matchedSlug}`}
                className="bg-white border border-tobacco/10 px-5 py-2.5 rounded-full text-[0.85rem] text-tobacco hover:bg-green hover:text-white hover:border-green transition-all"
              >
                {area}
              </Link>
            ) : (
              <span
                key={area}
                className="bg-white border border-tobacco/10 px-5 py-2.5 rounded-full text-[0.85rem] text-tobacco/70"
              >
                {area}
              </span>
            );
          })}
        </div>
        <div className="mt-6">
          <Link href="/areas" className="text-green font-medium hover:underline text-[0.9rem]">
            {t("areas.viewAll")}
          </Link>
        </div>
      </section>

      {/* FINAL CTA — CRO */}
      <section className="bg-green py-20 px-6 text-center">
        <h2 className="font-display text-white mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {t("cta.readySpotless")}
        </h2>
        <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
          {t("cta.joinFamilies")}
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/book" className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all">
            {t("cta.bookNowEstimate")}
          </Link>
          <Link href="/pricing" className="border-[1.5px] border-white/40 text-white px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-white transition-colors">
            {t("cta.viewPricing")}
          </Link>
        </div>
      </section>
    </>
  );
}
