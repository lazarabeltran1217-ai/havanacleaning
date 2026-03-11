import { CommercialForm } from "@/components/website/CommercialForm";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildContentMap } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";

export const metadata: Metadata = {
  title: "Commercial Cleaning",
  description:
    "Professional commercial cleaning services for businesses. Offices, retail, medical, restaurants. Get a custom quote today.",
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

      {/* FORM */}
      <section className="bg-ivory py-16 px-6 md:px-20">
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
