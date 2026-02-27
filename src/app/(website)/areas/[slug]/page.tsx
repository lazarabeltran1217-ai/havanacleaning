import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { FAQSection } from "@/components/website/FAQSection";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const area = await prisma.areaPage.findUnique({ where: { slug } });
    if (!area) return {};
    return {
      title: area.metaTitle || `Cleaning Service in ${area.name}`,
      description:
        area.metaDescription ||
        `Professional house cleaning and deep cleaning services in ${area.name}. Trusted by local families. Book online with Havana Cleaning today.`,
    };
  } catch {
    return {};
  }
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations();

  let area = null;
  let faqs: Awaited<ReturnType<typeof prisma.fAQ.findMany>> = [];
  let services: { name: string; nameEs: string | null; slug: string; icon: string | null; basePrice: number }[] = [];

  try {
    area = await prisma.areaPage.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Failed to fetch area page:", error);
  }

  if (!area || !area.isPublished) notFound();

  try {
    [faqs, services] = await Promise.all([
      prisma.fAQ.findMany({
        where: { pageType: "area", pageId: area.id, isPublished: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.service.findMany({
        where: { isActive: true, isFeatured: true },
        select: { name: true, nameEs: true, slug: true, icon: true, basePrice: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch area data:", error);
  }

  const areaName = localized(area.name, area.nameEs, locale);
  const areaTitle = localized(area.title, area.titleEs, locale);
  const areaDescription = localized(area.description, area.descriptionEs, locale);
  const areaContent = localized(area.content, area.contentEs, locale);

  // Localize FAQs
  const localizedFaqs = faqs.map((f) => ({
    ...f,
    question: localized(f.question, f.questionEs, locale),
    answer: localized(f.answer, f.answerEs, locale),
  }));

  const breadcrumbs = [
    { name: t("areas.home"), url: "/" },
    { name: t("areas.serviceAreas"), url: "/areas" },
    { name: areaName, url: `/areas/${area.slug}` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={faqPageSchema(localizedFaqs.map((f) => ({ question: f.question, answer: f.answer })))}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">{t("areas.home")}</Link>
        {" / "}
        <Link href="/areas" className="hover:text-teal">{t("areas.serviceAreas")}</Link>
        {" / "}
        <span className="text-tobacco">{areaName}</span>
      </nav>

      {/* Hero */}
      <h1 className="font-display text-4xl text-tobacco mb-4">
        {areaTitle || (locale === "es" ? `Servicios de Limpieza en ${areaName}` : `Cleaning Services in ${areaName}`)}
      </h1>
      <p className="text-gray-600 text-lg mb-8">
        {areaDescription ||
          (locale === "es"
            ? `Havana Cleaning ofrece servicios profesionales de limpieza residencial y comercial en ${areaName}. Reserve hoy y experimente la diferencia.`
            : `Havana Cleaning provides professional residential and commercial cleaning services throughout ${areaName}. Book today and experience the difference.`)}
      </p>

      {/* Content */}
      {areaContent && (
        <div className="prose prose-tobacco max-w-none mb-12 text-gray-600 leading-relaxed whitespace-pre-line">
          {areaContent}
        </div>
      )}

      {/* Services Available */}
      <section className="mb-12">
        <h2 className="font-display text-2xl text-tobacco mb-6">
          {t("areas.servicesAvailable", { area: areaName })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green/40 transition-all flex items-center gap-4"
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="font-medium text-tobacco">{localized(s.name, s.nameEs, locale)}</div>
                {s.basePrice > 0 && (
                  <div className="text-green text-sm">{locale === "es" ? "Desde" : "From"} ${s.basePrice}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <FAQSection
        faqs={localizedFaqs}
        title={t("areas.faqTitle", { area: areaName })}
      />

      {/* CTA */}
      <section className="bg-green/5 rounded-2xl p-8 text-center mt-8">
        <h2 className="font-display text-2xl text-tobacco mb-3">
          {t("areas.readyCta", { area: areaName })}
        </h2>
        <p className="text-gray-600 mb-6">
          {t("areas.bookDesc")}
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          {t("cta.bookNow")}
        </Link>
      </section>
    </div>
  );
}
