import { CommercialForm } from "@/components/website/CommercialForm";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildContentMap } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";
import { JsonLd } from "@/components/website/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Commercial Cleaning Services — Office & Business Cleaning",
  description:
    "Professional commercial cleaning services for offices, retail spaces, medical facilities, and restaurants in Miami. Insured, vetted teams. Get a free custom quote today.",
  alternates: { canonical: "/commercial" },
};

export default async function CommercialPage() {
  const locale = await getLocale();
  const t = await getTranslations("commercial");

  let heroImageUrl = "";
  try {
    const contentRows = await prisma.content.findMany({ where: { published: true } });
    const contentMap = buildContentMap(contentRows, locale);
    heroImageUrl = (contentMap.commercial_page_media as { heroImageUrl?: string } | undefined)?.heroImageUrl || "";
  } catch { /* use default */ }

  const trustItems = [
    t("trust1"),
    t("trust2"),
    t("trust3"),
    t("trust4"),
    t("trust5"),
  ];

  return (
    <>
      <JsonLd data={serviceSchema({ name: "Commercial Cleaning", description: "Professional commercial cleaning services for offices, retail, medical facilities, and restaurants. Insured and vetted teams.", basePrice: 0, slug: "commercial-cleaning" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Commercial Cleaning", url: "/commercial" }])} />
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20 text-center relative overflow-hidden">
        {heroImageUrl && <PageHeroImage imageUrl={heroImageUrl} />}
        <div className="relative z-10">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green-light" />
            {t("label")}
            <span className="w-8 h-px bg-green-light" />
          </div>
          <h1
            className="font-display text-cream mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {t("title")}
          </h1>
          <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="bg-green py-8 px-6 md:px-20">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-10 text-white text-[0.85rem] font-medium">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              ✓ {item}
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES WE SERVE */}
      <section className="bg-cream py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-center mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
            {t("industriesTitle")}
          </h2>
          <p className="text-center text-[#7a6555] text-[0.9rem] mb-10">
            {t("industriesSubtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {([
              { title: t("industry1Title"), desc: t("industry1Desc") },
              { title: t("industry2Title"), desc: t("industry2Desc") },
              { title: t("industry3Title"), desc: t("industry3Desc") },
              { title: t("industry4Title"), desc: t("industry4Desc") },
              { title: t("industry5Title"), desc: t("industry5Desc") },
            ]).map((ind, i) => (
              <div key={i} className="bg-white border border-tobacco/10 rounded-lg p-6">
                <h3 className="font-display text-[0.95rem] mb-2">{ind.title}</h3>
                <p className="text-[#7a6555] text-[0.85rem] leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUSINESSES CHOOSE US */}
      <section className="bg-ivory py-12 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-center mb-8 text-xl">{t("whyBusinessTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[t("whyBiz1"), t("whyBiz2"), t("whyBiz3"), t("whyBiz4"), t("whyBiz5")].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[0.9rem] text-[#5a4535]">
                <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="bg-cream py-16 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-display text-center mb-2"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            {t("requestQuote")}
          </h2>
          <p className="text-center text-sand text-[0.9rem] mb-10">
            {t("requestQuoteDesc")}
          </p>
          <CommercialForm />
        </div>
      </section>
    </>
  );
}
