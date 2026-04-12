import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS, NYC_SERVICE_AREAS } from "@/lib/constants";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";

export const metadata: Metadata = {
  title: "Service Areas — Cleaning Coverage",
  description:
    "Havana Cleaning serves neighborhoods across Florida and beyond. Find professional cleaning services in Brickell, Coral Gables, Kendall, Doral, Miami Beach, and more.",
  alternates: { canonical: "/areas" },
};

export default async function AreasPage() {
  const locale = await getLocale();
  const t = await getTranslations("areas");

  let areaPages: Awaited<ReturnType<typeof prisma.areaPage.findMany>> = [];
  try {
    areaPages = await prisma.areaPage.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch area pages:", error);
  }

  const publishedSlugs = new Set(areaPages.map((a) => a.slug));

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          {t("heroTitle")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
      </section>

      {/* Miami / South Florida */}
      <h2 className="font-display text-2xl text-tobacco mb-4">{t("miamiHeading")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SERVICE_AREAS.map((area) => {
          const slug = area.toLowerCase().replace(/\s+/g, "-") + "-cleaning";
          const hasPage = publishedSlugs.has(slug);
          const areaPage = areaPages.find((a) => a.slug === slug);

          return hasPage ? (
            <Link
              key={area}
              href={`/areas/${slug}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green/40 hover:shadow-sm transition-all text-center group"
            >
              <div className="font-display text-lg text-tobacco group-hover:text-green transition-colors">
                {area}
              </div>
              {areaPage?.description && (
                <p className="text-gray-400 text-[0.78rem] mt-1 line-clamp-2">
                  {localized(areaPage.description, areaPage.descriptionEs, locale)}
                </p>
              )}
            </Link>
          ) : (
            <div
              key={area}
              className="bg-white rounded-xl border border-gray-100 p-5 text-center"
            >
              <div className="font-display text-lg text-tobacco">{area}</div>
              <p className="text-gray-400 text-[0.78rem] mt-1">
                {t("professionalAvailable")}
              </p>
            </div>
          );
        })}
      </div>

      {/* New York City */}
      <h2 className="font-display text-2xl text-tobacco mt-12 mb-4">{t("nycHeading")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {NYC_SERVICE_AREAS.map((borough) => (
          <div
            key={borough}
            className="bg-white rounded-xl border border-gray-100 p-5 text-center"
          >
            <div className="font-display text-lg text-tobacco">{borough}</div>
            <p className="text-gray-400 text-[0.78rem] mt-1">
              {t("handymanAvailable")}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/handyman#book"
          className="inline-block bg-tobacco text-white px-8 py-3 rounded-xl font-semibold hover:bg-tobacco/90 transition-colors"
        >
          {locale === "es" ? "Reserve Su Handyman" : "Book a Handyman"}
        </Link>
      </div>

      {/* CTA */}
      <section className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          {t("dontSeeArea")}
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          {locale === "es" ? "Reserve Su Limpieza" : "Book Your Cleaning"}
        </Link>
      </section>
    </div>
  );
}
