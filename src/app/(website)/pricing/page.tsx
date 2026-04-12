import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import { ServiceIcon } from "@/lib/service-icons";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Home Cleaning Prices & Instant Quote — No Hidden Fees",
  description:
    "Get a home cleaning quote in minutes. Transparent pricing for weekly house cleaning, deep clean, move-in/out, and recurring plans. No hidden fees, no contracts.",
  alternates: { canonical: "/pricing" },
};

const fetchPricingData = () =>
  prisma.service.findMany({
    where: { isActive: true },
    include: { pricingRules: { orderBy: [{ bedroomsMin: "asc" }, { bathroomsMin: "asc" }] } },
    orderBy: { sortOrder: "asc" },
  });

export default async function PricingPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  let services: Awaited<ReturnType<typeof fetchPricingData>> = [];
  let addOns: Awaited<ReturnType<typeof prisma.serviceAddOn.findMany>> = [];
  try {
    services = await fetchPricingData();
    addOns = await prisma.serviceAddOn.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch pricing data:", error);
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-20 px-6 md:px-20 text-center">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-light" />
          {t("pricing.label")}
          <span className="w-8 h-px bg-green-light" />
        </div>
        <h1
          className="font-display text-cream mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          {t("pricing.title")}
        </h1>
        <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
          {t("pricing.heroSubtitle")}
        </p>
      </section>

      {/* INTRO TEXT */}
      <section className="bg-cream py-12 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#5a4535] text-[0.95rem] leading-relaxed text-center">
            {t("pricing.introText")}
          </p>
        </div>
      </section>

      {/* SERVICES PRICING */}
      <section className="bg-ivory py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto space-y-10">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-tobacco/10 rounded-lg overflow-hidden"
            >
              <div className="bg-tobacco/[0.03] px-8 py-5 border-b border-tobacco/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon emoji={service.icon || "✨"} className="w-6 h-6 text-green" />
                  <h2 className="font-display text-xl">{localized(service.name, service.nameEs, locale)}</h2>
                </div>
                <Link
                  href={`/book?service=${service.slug}`}
                  className="bg-gold text-tobacco px-5 py-2 text-[0.8rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber transition-colors"
                >
                  {t("pricing.bookNow")}
                </Link>
              </div>

              <div className="p-8">
                {service.pricingRules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-tobacco/10">
                          <th className="pb-3 text-[0.75rem] uppercase tracking-wider text-sand">
                            {t("pricing.bedrooms")}
                          </th>
                          <th className="pb-3 text-[0.75rem] uppercase tracking-wider text-sand">
                            {t("pricing.bathrooms")}
                          </th>
                          <th className="pb-3 text-[0.75rem] uppercase tracking-wider text-sand text-right">
                            {t("pricing.price")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.pricingRules.map((rule) => (
                          <tr
                            key={rule.id}
                            className="border-b border-tobacco/5"
                          >
                            <td className="py-3">
                              {rule.bedroomsMin === rule.bedroomsMax
                                ? `${rule.bedroomsMin} ${t("pricing.bed")}`
                                : `${rule.bedroomsMin}-${rule.bedroomsMax} ${t("pricing.bed")}`}
                            </td>
                            <td className="py-3">
                              {rule.bathroomsMin === rule.bathroomsMax
                                ? `${rule.bathroomsMin} ${t("pricing.bath")}`
                                : `${rule.bathroomsMin}-${rule.bathroomsMax} ${t("pricing.bath")}`}
                            </td>
                            <td className="py-3 text-right font-semibold text-green">
                              {formatCurrency(rule.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-amber text-lg font-semibold">
                      {service.basePrice > 0
                        ? t("services.startingAt", { price: formatCurrency(service.basePrice) })
                        : t("pricing.customQuoteContact")}
                    </span>
                    {service.estimatedHours > 0 && (
                      <p className="text-sand text-[0.85rem] mt-1">
                        {t("services.hoursEstimated", { hours: service.estimatedHours })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="bg-cream py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-display mb-2 text-center"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            {t("pricing.addOns")}
          </h2>
          <p className="text-[#7a6555] text-center mb-10 max-w-md mx-auto">
            {t("pricing.addOnsSubtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon) => (
              <div
                key={addon.id}
                className="bg-white border border-tobacco/10 rounded-lg px-6 py-4 flex items-center justify-between"
              >
                <span className="text-[0.9rem]">{localized(addon.name, addon.nameEs, locale)}</span>
                <span className="text-amber font-semibold text-[0.9rem]">
                  +{formatCurrency(addon.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="bg-ivory py-12 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-center text-xl mb-6">{t("pricing.includedTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              t("pricing.included1"),
              t("pricing.included2"),
              t("pricing.included3"),
              t("pricing.included4"),
              t("pricing.included5"),
              t("pricing.included6"),
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[0.9rem] text-[#5a4535]">
                <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECURRING DISCOUNT */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          {t("pricing.saveRecurring")}
        </h2>
        <p className="text-white/80 mb-3 max-w-lg mx-auto">
          {t("pricing.saveRecurringDesc")}
        </p>
        <div className="flex justify-center gap-8 mt-8 mb-8">
          <div className="text-center">
            <div className="text-white text-2xl font-bold">20%</div>
            <div className="text-green-mint text-[0.8rem]">{t("pricing.weekly")}</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl font-bold">15%</div>
            <div className="text-green-mint text-[0.8rem]">{t("pricing.biWeekly")}</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl font-bold">10%</div>
            <div className="text-green-mint text-[0.8rem]">{t("pricing.monthly")}</div>
          </div>
        </div>
        <Link
          href="/book"
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          {t("pricing.getStarted")}
        </Link>
      </section>
    </>
  );
}
