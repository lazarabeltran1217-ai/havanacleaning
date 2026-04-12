import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import { ServiceIcon } from "@/lib/service-icons";
import { getTranslations, getLocale } from "next-intl/server";
import { localized, buildContentMap } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";

export const metadata: Metadata = {
  title: "Professional Cleaning Services — House, Deep Clean, Move-In & More",
  description:
    "Best house cleaning services in Miami. Residential, deep cleaning, move-in/out, recurring cleaning, spring cleaning service, commercial, Airbnb turnover, and more. Book online today.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let contentMap: Record<string, unknown> = {};
  try {
    const [svcResult, contentRows] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.content.findMany({ where: { published: true } }),
    ]);
    services = svcResult;
    contentMap = buildContentMap(contentRows, locale);
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  const servicesPageMedia = (contentMap.services_page_media ?? {}) as { heroImageUrl?: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getServiceContent(slug: string): Record<string, any> {
    return (contentMap[`service_${slug}`] ?? {}) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-20 px-6 md:px-20 text-center relative overflow-hidden">
        {servicesPageMedia.heroImageUrl && <PageHeroImage imageUrl={servicesPageMedia.heroImageUrl} />}
        <div className="relative z-10">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green-light" />
            {t("services.label")}
            <span className="w-8 h-px bg-green-light" />
          </div>
          <h1
            className="font-display text-cream mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {t("services.title")}
          </h1>
          <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
            {locale === "es"
              ? "Desde limpiezas diarias hasta sanitización profunda — manejamos todo tipo de hogar y espacio comercial."
              : "From everyday cleans to deep sanitization — we handle every type of home and business space."}
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="bg-ivory py-20 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const svcContent = getServiceContent(service.slug);
            return (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="bg-white border border-tobacco/10 rounded-lg overflow-hidden hover:shadow-lg hover:border-green/30 transition-all group"
              >
                {svcContent.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image src={svcContent.imageUrl} alt={localized(service.name, service.nameEs, locale)} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-start gap-5">
                    <ServiceIcon emoji={service.icon || "✨"} className="w-10 h-10 text-green shrink-0" />
                    <div className="flex-1">
                      <h2 className="font-display text-xl mb-2 group-hover:text-green transition-colors">
                        {localized(service.name, service.nameEs, locale)}
                      </h2>
                      <p className="text-[#7a6555] text-[0.9rem] leading-relaxed mb-4">
                        {localized(service.description, service.descriptionEs, locale)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber font-semibold text-[0.9rem]">
                          {service.basePrice > 0
                            ? t("services.startingAt", { price: formatCurrency(service.basePrice) })
                            : t("services.customQuote")}
                        </span>
                        <span className="text-green text-[0.8rem] font-medium group-hover:translate-x-1 transition-transform">
                          {t("services.learnMore")}
                        </span>
                      </div>
                      {service.estimatedHours > 0 && (
                        <div className="text-sand text-[0.78rem] mt-2">
                          {t("services.hoursEstimated", { hours: service.estimatedHours })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          {services.length % 2 !== 0 && (
            <Link
              href="/book"
              className="bg-white border border-tobacco/10 rounded-lg p-8 hover:shadow-lg hover:border-green/30 transition-all group flex flex-col items-center justify-center text-center"
            >
              <h2 className="font-display text-xl mb-2 group-hover:text-green transition-colors">
                {t("services.customClean")}
              </h2>
              <p className="text-[#7a6555] text-[0.9rem] leading-relaxed mb-4">
                {t("services.customCleanDesc")}
              </p>
              <span className="text-green text-[0.85rem] font-medium group-hover:translate-x-1 transition-transform">
                {t("services.freeQuote")}
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          {t("cta.readySpotless")}
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          {locale === "es"
            ? "Reserve en línea en minutos. Elija su servicio, escoja un horario y nosotros nos encargamos del resto."
            : "Book online in minutes. Pick your service, choose a time, and we handle the rest."}
        </p>
        <Link
          href="/book"
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          {t("cta.bookCleaning")}
        </Link>
      </section>
    </>
  );
}
