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

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) return { title: "Service Not Found" };
    return {
      title: `${service.name} in Miami | Havana Cleaning`,
      description: service.description || `Professional ${service.name} in Miami-Dade County. Book online today.`,
      alternates: { canonical: `/services/${slug}` },
    };
  } catch {
    return { title: "Service Not Found" };
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

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
    if (contentRecord?.dataEn) {
      const data = contentRecord.dataEn as Record<string, unknown>;
      content = {
        longDescription: (data.longDescription as string) || defaults.longDescription,
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features as string[] : defaults.features,
        benefits: Array.isArray(data.benefits) && data.benefits.length > 0 ? data.benefits as ServiceContent["benefits"] : defaults.benefits,
      };
    }
  } catch {
    // Use defaults
  }

  // Fetch service-related FAQs
  let faqs: { id: string; question: string; answer: string }[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      where: { pageType: "service", isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
      select: { id: true, question: true, answer: true },
    });
  } catch {
    // No FAQs
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {faqs.length > 0 && <JsonLd data={faqPageSchema(faqs)} />}

      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/services"
            className="text-sand text-[0.82rem] hover:text-cream transition-colors mb-6 inline-block"
          >
            ← Back to Services
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <ServiceIcon emoji={service.icon || "✨"} className="w-12 h-12 text-green-light" />
            <h1
              className="font-display text-cream"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}
            >
              {service.name}
            </h1>
          </div>
          <p className="text-sand text-lg leading-relaxed max-w-2xl">
            {service.description}
          </p>
          <div className="mt-6 flex items-center gap-6">
            <span className="text-amber text-xl font-semibold">
              {service.basePrice > 0
                ? `Starting at ${formatCurrency(service.basePrice)}`
                : "Custom Quote"}
            </span>
            {service.estimatedHours > 0 && (
              <span className="text-sand text-[0.85rem]">
                ~{service.estimatedHours} hours estimated
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
                <h2 className="font-display text-xl mb-6">Pricing by Home Size</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-tobacco/10">
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">Bedrooms</th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">Bathrooms</th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand text-right">Price</th>
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
              <h2 className="font-display text-xl mb-4">What&apos;s Included</h2>
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
                <h2 className="font-display text-xl mb-5">Why Choose Havana Cleaning</h2>
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
              <h3 className="font-display text-lg mb-4">Book This Service</h3>
              <Link
                href={`/book?service=${service.slug}`}
                className="block w-full bg-gold text-tobacco text-center py-3.5 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber transition-colors mb-6"
              >
                Book Now
              </Link>

              {service.addOns.length > 0 && (
                <>
                  <h4 className="text-[0.78rem] uppercase tracking-wider text-sand mb-3">
                    Available Add-Ons
                  </h4>
                  <ul className="space-y-2">
                    {service.addOns.map((addon) => (
                      <li key={addon.id} className="flex items-center justify-between text-[0.85rem]">
                        <span>{addon.name}</span>
                        <span className="text-amber font-medium">+{formatCurrency(addon.price)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-tobacco/10">
                <p className="text-[0.78rem] text-sand">
                  Additional add-ons available during booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE FAQs */}
      {faqs.length > 0 && (
        <section className="bg-cream py-16 px-6 md:px-20">
          <div className="max-w-3xl mx-auto">
            <FAQSection faqs={faqs} title={`${service.name} FAQ`} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          Ready to Book Your {service.name}?
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Book online in minutes. Pick your time and we handle the rest.
        </p>
        <Link
          href={`/book?service=${service.slug}`}
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          Book Now
        </Link>
      </section>
    </>
  );
}
