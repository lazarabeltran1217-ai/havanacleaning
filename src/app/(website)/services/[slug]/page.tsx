import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} | Havana Cleaning`,
    description: service.description || `Professional ${service.name} in Miami-Dade County.`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      addOns: { where: { isActive: true } },
      pricingRules: { orderBy: [{ bedroomsMin: "asc" }, { bathroomsMin: "asc" }] },
    },
  });

  if (!service || !service.isActive) notFound();

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

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
            <span className="text-5xl">{service.icon || "✨"}</span>
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

      <section className="bg-ivory py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PRICING TABLE */}
          <div className="md:col-span-2">
            {service.pricingRules.length > 0 && (
              <div className="bg-white border border-tobacco/10 rounded-lg p-8 mb-8">
                <h2 className="font-display text-xl mb-6">Pricing by Home Size</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-tobacco/10">
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">
                          Bedrooms
                        </th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand">
                          Bathrooms
                        </th>
                        <th className="pb-3 text-[0.78rem] uppercase tracking-wider text-sand text-right">
                          Price
                        </th>
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
                <li className="flex items-start gap-2">
                  <span className="text-green mt-0.5">✓</span>
                  All cleaning supplies and equipment provided
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green mt-0.5">✓</span>
                  Background-checked, insured professionals
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green mt-0.5">✓</span>
                  Eco-friendly, non-toxic products available
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green mt-0.5">✓</span>
                  100% satisfaction guaranteed
                </li>
              </ul>
            </div>
          </div>

          {/* SIDEBAR — BOOK + ADD-ONS */}
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
                      <li
                        key={addon.id}
                        className="flex items-center justify-between text-[0.85rem]"
                      >
                        <span>{addon.name}</span>
                        <span className="text-amber font-medium">
                          +{formatCurrency(addon.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Global add-ons (no serviceId) */}
              <div className="mt-4 pt-4 border-t border-tobacco/10">
                <p className="text-[0.78rem] text-sand">
                  Additional add-ons available during booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
