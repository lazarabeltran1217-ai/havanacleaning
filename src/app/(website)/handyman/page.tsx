import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Check, MapPin, Wrench, Package, Tv, DoorOpen, Lightbulb, Grid3x3, Paintbrush, Droplets, Waves, Wifi, Fence, LayoutGrid } from "lucide-react";
import { HANDYMAN_SERVICES, NYC_BOROUGHS, NYC_NEIGHBORHOODS } from "@/lib/handyman-constants";
import { HandymanBookingWizard } from "@/components/website/HandymanBookingWizard";
import { prisma } from "@/lib/prisma";
import { buildContentMap } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";
import { JsonLd } from "@/components/website/JsonLd";
import { faqPageSchema } from "@/lib/schema";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Handyman Services in NYC — Havana Cleaning",
  description:
    "Professional handyman services in New York City. Minor repairs, furniture assembly, TV mounting, painting, and more. Get a free quote today.",
  alternates: { canonical: "/handyman" },
};

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Package,
  Tv,
  DoorOpen,
  Lightbulb,
  Grid3x3,
  Paintbrush,
  Droplets,
  Waves,
  Wifi,
  Fence,
  LayoutGrid,
};

export default async function HandymanPage() {
  const locale = await getLocale();
  const t = await getTranslations("handyman");

  let heroImageUrl = "";
  let handymanPrices: { key: string; basePrice: number }[] = [];
  try {
    const contentRows = await prisma.content.findMany({ where: { published: true } });
    const contentMap = buildContentMap(contentRows, locale);
    heroImageUrl = (contentMap.handyman_page_media as { heroImageUrl?: string } | undefined)?.heroImageUrl || "";
  } catch { /* use defaults */ }
  try {
    handymanPrices = await prisma.handymanServicePrice.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { key: true, basePrice: true },
    });
  } catch { /* use defaults */ }
  const priceMap = Object.fromEntries(handymanPrices.map((p) => [p.key, p.basePrice]));

  const trustItems = [t("trust1"), t("trust2"), t("trust3"), t("trust4"), t("trust5")];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
    { q: t("faq5q"), a: t("faq5a") },
    { q: t("faq6q"), a: t("faq6a") },
  ];

  const faqSchema = faqPageSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} />}
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20 text-center relative overflow-hidden">
        {heroImageUrl && <PageHeroImage imageUrl={heroImageUrl} />}
        <div className="relative z-10">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green-light" />
            {t("heroEyebrow")}
            <span className="w-8 h-px bg-green-light" />
          </div>
          <h1
            className="font-display text-cream mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {t("heroTitle")}
          </h1>
          <p className="text-sand max-w-[600px] mx-auto leading-relaxed mb-4">
            {t("heroSubtitle")}
          </p>
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="inline-flex items-center gap-2 bg-green/20 text-green-light px-4 py-2 rounded-full text-[0.8rem] font-medium">
              <MapPin className="w-4 h-4" /> {t("nycBadge")}
            </span>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <a
              href="#book"
              className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all"
            >
              {t("bookHandyman")}
            </a>
            <a
              href="#services"
              className="border-[1.5px] border-cream/30 text-cream px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-cream transition-colors"
            >
              {t("ctaServices")}
            </a>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="bg-green py-6 px-6 md:px-20">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-white text-[0.85rem] font-medium tracking-[0.04em]">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" /> {item}
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING WIZARD */}
      <section id="book" className="bg-ivory py-24 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-display text-tobacco text-center mb-2"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            {t("formTitle")}
          </h2>
          <p className="text-center text-tobacco/60 text-[0.9rem] mb-10">
            {t("formSubtitle")}
          </p>
          <HandymanBookingWizard handymanPrices={handymanPrices} />
        </div>
      </section>

      {/* NYC SERVICE AREAS */}
      <section className="bg-cream py-24 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-green" />{t("nycAreasTitle")}
          </div>
          <h2 className="font-display text-tobacco mb-3" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
            {t("nycAreasTitle")}
          </h2>
          <p className="text-tobacco/60 max-w-[500px] leading-relaxed mb-10">
            {t("nycAreasSubtitle")}
          </p>
          <div className="flex flex-wrap gap-2.5 mb-6">
            {NYC_BOROUGHS.map((borough) => (
              <span
                key={borough}
                className="bg-green text-white px-5 py-2.5 rounded-full text-[0.85rem] font-medium"
              >
                {borough}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {NYC_NEIGHBORHOODS.map((hood) => (
              <span
                key={hood}
                className="bg-white border border-tobacco/10 px-5 py-2.5 rounded-full text-[0.85rem] text-tobacco/70"
              >
                {hood}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory py-24 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green" />{t("faqTitle")}
            <span className="w-8 h-px bg-green" />
          </div>
          <h2 className="font-display text-tobacco text-center mb-12" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white border border-tobacco/10 rounded-lg group">
                <summary className="px-6 py-5 cursor-pointer font-semibold text-[0.95rem] text-tobacco flex items-center justify-between hover:text-green transition-colors">
                  {faq.q}
                  <span className="text-green ml-4 group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <div className="px-6 pb-5 text-tobacco/70 text-[0.9rem] leading-relaxed border-t border-tobacco/5 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section id="services" className="bg-cream py-24 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-green" />{t("servicesTitle")}
          </div>
          <h2 className="font-display text-tobacco mb-3" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
            {t("servicesTitle")}
          </h2>
          <p className="text-tobacco/60 max-w-[500px] leading-relaxed mb-12">
            {t("servicesSubtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HANDYMAN_SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] || Wrench;
              return (
                <div
                  key={service.key}
                  className="bg-white border border-tobacco/10 rounded-lg p-7 hover:shadow-lg hover:border-green/30 transition-all"
                >
                  <Icon className="w-9 h-9 text-green mb-4" />
                  <h3 className="font-display text-tobacco text-lg mb-2">{t(service.key)}</h3>
                  {priceMap[service.key] && (
                    <div className="text-green font-semibold text-[0.82rem] mb-1">
                      {t("startingAt", { price: `$${priceMap[service.key]}` })}
                    </div>
                  )}
                  <p className="text-tobacco/70 text-[0.88rem] leading-relaxed">
                    {t(`${service.key}Desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-green py-20 px-6 text-center">
        <h2 className="font-display text-white mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {t("ctaReady")}
        </h2>
        <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
          {t("ctaReadySubtitle")}
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="#book"
            className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all"
          >
            {t("ctaButton")}
          </a>
          <Link
            href="/"
            className="border-[1.5px] border-white/40 text-white px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
