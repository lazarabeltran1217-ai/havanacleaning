import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { JsonLd } from "@/components/website/JsonLd";
import { aggregateRatingSchema, reviewSchema, faqPageSchema } from "@/lib/schema";

// Helper to get content with fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getContent(contentMap: Record<string, unknown>, key: string, fallback: Record<string, unknown>): Record<string, any> {
  return (contentMap[key] ?? fallback) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default async function HomePage() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let allTestimonials: { rating: number; customerName: string; content: string; location: string | null }[] = [];
  let faqs: { question: string; answer: string }[] = [];
  let areaPages: { slug: string; name: string }[] = [];
  const contentMap: Record<string, unknown> = {};

  try {
    [services, testimonials, allTestimonials, faqs, areaPages] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ where: { isApproved: true, isFeatured: true }, take: 3, orderBy: { createdAt: "desc" } }),
      prisma.testimonial.findMany({ where: { isApproved: true }, select: { rating: true, customerName: true, content: true, location: true } }),
      prisma.fAQ.findMany({ where: { isPublished: true, pageType: "general" }, orderBy: { sortOrder: "asc" }, select: { question: true, answer: true }, take: 6 }),
      prisma.areaPage.findMany({ where: { isPublished: true }, select: { slug: true, name: true } }),
    ]);

    // Load editable content
    const contentRows = await prisma.content.findMany({ where: { published: true } });
    for (const row of contentRows) {
      contentMap[row.key] = row.dataEn;
    }
  } catch (error) {
    console.error("Failed to fetch data from database:", error);
  }

  // Editable content with fallbacks
  const heroEyebrow = getContent(contentMap, "hero_eyebrow", { text: "Miami's Premier Cleaning Service" });
  const heroHeadline = getContent(contentMap, "hero_headline", { line1: "Clean Homes,", line2: "Cuban", line3: "Soul." });
  const heroSubtitle = getContent(contentMap, "hero_subtitle", { text: "Family-owned and rooted in the heart of Cuban-American pride. We treat every home like our own — with care, passion, and the kind of clean your abuela would approve of." });
  const heroCta1 = getContent(contentMap, "hero_cta_primary", { text: "Book a Cleaning", href: "/book" });
  const heroCta2 = getContent(contentMap, "hero_cta_secondary", { text: "View Pricing", href: "/pricing" });
  const heroStats = getContent(contentMap, "hero_stats", { items: [{ value: "500+", label: "Homes Cleaned" }, { value: "4.9★", label: "Average Rating" }, { value: "20+", label: "Areas Served" }] });
  const trustBar = getContent(contentMap, "trust_bar", { items: ["Background-Checked Staff", "Same-Day Availability", "Bilingual Team (EN/ES)", "Satisfaction Guaranteed", "Serving All Miami-Dade"] });
  const aboutSection = getContent(contentMap, "about_section", {
    label: "Our Story",
    title: "Born in Havana, Built in Miami.",
    paragraphs: [
      "Havana Cleaning was founded by a family who brought their Cuban heritage and work ethic to Miami. We believe in treating every home like it's our own — with care, pride, and the kind of attention to detail that makes a real difference.",
      "We're not just a cleaning company. We're a family business built on trust, hard work, and the belief that a clean home is the foundation of a happy life.",
      "From Kendall to Coral Gables, from Brickell condos to Pinecrest estates — we bring the same level of care and professionalism to every job. Our team is background-checked and trained to deliver results that would make your abuela proud.",
    ],
  });

  const avgRating = allTestimonials.length > 0
    ? allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length
    : 5;

  return (
    <>
      <JsonLd data={aggregateRatingSchema(Math.round(avgRating * 10) / 10, allTestimonials.length)} />
      {allTestimonials.slice(0, 3).map((t, i) => (
        <JsonLd key={i} data={reviewSchema({ author: t.customerName, content: t.content, rating: t.rating, location: t.location || undefined })} />
      ))}

      {/* HERO */}
      <section className="min-h-screen bg-tobacco flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />

        {/* Left palm tree */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="" className="absolute left-0 bottom-0 hidden md:block md:w-[420px] h-auto pointer-events-none opacity-50" />

        {/* Right palm tree (flipped) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="" className="absolute right-0 bottom-0 hidden md:block md:w-[380px] h-auto pointer-events-none opacity-50 -scale-x-100" />

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
            ✓ {item}
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="services" className="bg-tobacco py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green-light" />What We Do
        </div>
        <h2 className="font-display text-cream mb-4" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>Our Services</h2>
        {allTestimonials.length > 0 && (
          <div className="flex items-center gap-2 mb-12 text-sand text-[0.85rem]">
            <span className="text-gold">★★★★★</span>
            <span>{(Math.round(avgRating * 10) / 10).toFixed(1)} stars from {allTestimonials.length} reviews</span>
          </div>
        )}
        {allTestimonials.length === 0 && <div className="mb-12" />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {services.map((service) => (
            <div key={service.id} className="bg-white/[0.04] border border-gold/15 p-10 hover:bg-green-light/10 hover:border-green-light transition-colors cursor-pointer">
              <span className="text-4xl block mb-4">{service.icon || "✨"}</span>
              <div className="font-display text-lg text-cream mb-2.5">{service.name}</div>
              <p className="text-sand text-[0.88rem] leading-relaxed mb-4">{service.description}</p>
              <div className="text-amber text-[0.85rem] font-medium tracking-wide">
                {service.basePrice > 0 ? `Starting at ${formatCurrency(service.basePrice)}` : "Custom Quote"}
              </div>
            </div>
          ))}
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
                Book a Cleaning Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-ivory py-24 px-6 md:px-20 text-center">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green" />Happy Clients
          </div>
          <h2 className="font-display mb-16" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>What Miami Is Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-tobacco/10 rounded-md p-9 text-left relative">
                <div className="text-gold text-lg mb-3">{"★".repeat(t.rating)}</div>
                <p className="font-serif italic text-[#5a4535] leading-relaxed mb-6">{t.content}</p>
                <div className="font-semibold text-[0.85rem]">{t.customerName}</div>
                <div className="text-green text-[0.78rem]">{t.location}</div>
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
                <span className="w-8 h-px bg-green" />Common Questions
              </div>
              <h2 className="font-display text-center mb-12" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-white border border-tobacco/10 rounded-lg group">
                    <summary className="px-6 py-5 cursor-pointer font-semibold text-[0.95rem] text-tobacco flex items-center justify-between hover:text-green transition-colors">
                      {faq.question}
                      <span className="text-green ml-4 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="px-6 pb-5 text-[#5a4535] text-[0.9rem] leading-relaxed border-t border-tobacco/5 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/faq" className="text-green font-medium hover:underline text-[0.9rem]">
                  View All FAQs →
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* SERVICE AREAS */}
      <section id="areas" className="bg-cream py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green" />Where We Clean
        </div>
        <h2 className="font-display mb-2" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>Serving All of Miami-Dade</h2>
        <p className="text-[#7a6555] max-w-[500px] leading-relaxed mb-10">We proudly serve neighborhoods across Miami-Dade County.</p>
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
            View All Service Areas →
          </Link>
        </div>
      </section>

      {/* FINAL CTA — CRO */}
      <section className="bg-green py-20 px-6 text-center">
        <h2 className="font-display text-white mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Ready for a Spotless Home?
        </h2>
        <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
          Join 500+ Miami families who trust Havana Cleaning. Book in minutes, pay securely online.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/book" className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all">
            Book Now — Free Estimate
          </Link>
          <Link href="/pricing" className="border-[1.5px] border-white/40 text-white px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-white transition-colors">
            View Pricing
          </Link>
        </div>
      </section>
    </>
  );
}
