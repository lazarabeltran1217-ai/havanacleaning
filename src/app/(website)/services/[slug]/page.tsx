import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import { ServiceIcon } from "@/lib/service-icons";
import { Check } from "lucide-react";
import { JsonLd } from "@/components/website/JsonLd";
import { serviceSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { getServiceDefaults, type ServiceContent } from "@/lib/service-defaults";
import { FAQSection } from "@/components/website/FAQSection";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) return { title: "Service Not Found" };
    const baseDesc = service.description || "";
    // Ensure description is within the recommended 120-160 char range
    const description =
      baseDesc.length >= 120
        ? baseDesc
        : `Professional ${service.name.toLowerCase()} services. ${baseDesc || "Trusted by local families and businesses."} Book online with Havana Cleaning today.`;
    return {
      title: `Professional ${service.name} Services`,
      description: description.slice(0, 160),
      alternates: { canonical: `/services/${slug}` },
    };
  } catch {
    return { title: "Service Not Found" };
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations();

  let service = null;
  try {
    service = await prisma.service.findUnique({
      where: { slug },
      include: {
        addOns: { where: { isActive: true } },
        pricingRules: { orderBy: [{ bedroomsMin: "asc" }, { bathroomsMin: "asc" }] },
      },
    });
  } catch (error) {
    console.error("Failed to fetch service:", error);
  }

  if (!service || !service.isActive) notFound();

  // Fetch admin-managed content for this service
  const defaults = getServiceDefaults(slug);
  let content: ServiceContent = defaults;
  try {
    const contentRecord = await prisma.content.findUnique({ where: { key: `service_${slug}` } });
    if (contentRecord) {
      // Pick locale-aware content
      const data = (locale === "es" && contentRecord.dataEs != null
        ? contentRecord.dataEs
        : contentRecord.dataEn) as Record<string, unknown>;
      if (data) {
        content = {
          longDescription: (data.longDescription as string) || defaults.longDescription,
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features as string[] : defaults.features,
          benefits: Array.isArray(data.benefits) && data.benefits.length > 0 ? data.benefits as ServiceContent["benefits"] : defaults.benefits,
          imageUrl: (data.imageUrl as string) || "",
        };
      }
    }
  } catch {
    // Use defaults
  }

  // Fetch service-related FAQs
  let faqs: Awaited<ReturnType<typeof prisma.fAQ.findMany>> = [];
  try {
    faqs = await prisma.fAQ.findMany({
      where: { pageType: "service", isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
    });
  } catch {
    // No FAQs
  }

  const serviceName = localized(service.name, service.nameEs, locale);
  const serviceDesc = localized(service.description, service.descriptionEs, locale);

  const breadcrumbs = [
    { name: locale === "es" ? "Inicio" : "Home", url: "/" },
    { name: t("services.title"), url: "/services" },
    { name: serviceName, url: `/services/${service.slug}` },
  ];

  // Localize FAQs for display
  const localizedFaqs = faqs.map((f) => ({
    ...f,
    question: localized(f.question, f.questionEs, locale),
    answer: localized(f.answer, f.answerEs, locale),
  }));

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {faqs.length > 0 && <JsonLd data={faqPageSchema(faqs)} />}

      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20 relative overflow-hidden">
        {content.imageUrl && <PageHeroImage imageUrl={content.imageUrl} />}
        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            href="/services"
            className="text-sand text-[0.82rem] hover:text-cream transition-colors mb-6 inline-block"
          >
            {t("services.backToServices")}
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <ServiceIcon emoji={service.icon || "✨"} className="w-12 h-12 text-green-light" />
            <h1
              className="font-display text-cream"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}
            >
              {serviceName}
            </h1>
          </div>
          <p className="text-sand text-lg leading-relaxed max-w-2xl">
            {serviceDesc}
          </p>
          <div className="mt-6 flex items-center gap-6">
            <span className="text-amber text-xl font-semibold">
              {service.basePrice > 0
                ? t("services.startingAt", { price: formatCurrency(service.basePrice) })
                : t("services.customQuote")}
            </span>
            {service.estimatedHours > 0 && (
              <span className="text-sand text-[0.85rem]">
                {t("services.hoursEstimated", { hours: service.estimatedHours })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* LONG DESCRIPTION */}
      {content.longDescription && (
        <section className="bg-cream py-14 px-6 md:px-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#5a4535] text-[1rem] leading-relaxed">
              {content.longDescription}
            </p>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <section className="bg-ivory py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* PRICING TABLE */}
            {service.pricingRules.length > 0 && (
              <div className="bg-white border border-tobacco/10 rounded-lg p-8">
                <h2 className="font-display text-xl mb-6">{t("services.pricingBySize")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-tobacco/10">
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">{t("pricing.bedrooms")}</th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">{t("pricing.bathrooms")}</th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand text-right">{t("pricing.price")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.pricingRules.map((rule) => (
                        <tr key={rule.id} className="border-b border-tobacco/5">
                          <td className="py-3">
                            {rule.bedroomsMin === rule.bedroomsMax
                              ? rule.bedroomsMin
                              : `${rule.bedroomsMin}-${rule.bedroomsMax}`}
                          </td>
                          <td className="py-3">
                            {rule.bathroomsMin === rule.bathroomsMax
                              ? rule.bathroomsMin
                              : `${rule.bathroomsMin}-${rule.bathroomsMax}`}
                          </td>
                          <td className="py-3 text-right font-semibold text-green">
                            {formatCurrency(rule.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WHAT'S INCLUDED */}
            <div className="bg-white border border-tobacco/10 rounded-lg p-8">
              <h2 className="font-display text-xl mb-4">{t("services.whatsIncluded")}</h2>
              <ul className="space-y-3 text-[0.9rem] text-[#5a4535]">
                {content.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* WHY CHOOSE US */}
            {content.benefits.length > 0 && (
              <div>
                <h2 className="font-display text-xl mb-5">{t("services.whyChoose")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {content.benefits.map((benefit, i) => (
                    <div key={i} className="bg-white border border-tobacco/10 rounded-lg p-5">
                      <h3 className="font-display text-[0.95rem] mb-2">{benefit.title}</h3>
                      <p className="text-[#7a6555] text-[0.85rem] leading-relaxed">{benefit.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div>
            <div className="bg-white border border-tobacco/10 rounded-lg p-6 sticky top-28">
              <h3 className="font-display text-lg mb-4">{t("services.bookThisService")}</h3>
              <Link
                href={`/book?service=${service.slug}`}
                className="block w-full bg-gold text-tobacco text-center py-3.5 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber transition-colors mb-6"
              >
                {t("cta.bookNow")}
              </Link>

              {service.addOns.length > 0 && (
                <>
                  <h4 className="text-[0.78rem] uppercase tracking-wider text-sand mb-3">
                    {t("services.availableAddOns")}
                  </h4>
                  <ul className="space-y-2">
                    {service.addOns.map((addon) => (
                      <li key={addon.id} className="flex items-center justify-between text-[0.85rem]">
                        <span>{localized(addon.name, addon.nameEs, locale)}</span>
                        <span className="text-amber font-medium">+{formatCurrency(addon.price)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-tobacco/10">
                <p className="text-[0.78rem] text-sand">
                  {t("services.addOnsNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE FAQs */}
      {localizedFaqs.length > 0 && (
        <section className="bg-cream py-16 px-6 md:px-20">
          <div className="max-w-3xl mx-auto">
            <FAQSection faqs={localizedFaqs} title={t("services.serviceFaq", { service: serviceName })} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          {t("services.readyToBook", { service: serviceName })}
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          {t("services.bookOnline")}
        </p>
        <Link
          href={`/book?service=${service.slug}`}
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          {t("cta.bookNow")}
        </Link>
      </section>
    </>
  );
}
