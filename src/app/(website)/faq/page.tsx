import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { FAQSection } from "@/components/website/FAQSection";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Get answers to common questions about Havana Cleaning services, pricing, scheduling, cancellations, and more. Book with confidence knowing every detail upfront.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const locale = await getLocale();
  const t = await getTranslations("faq");

  let faqs: Awaited<ReturnType<typeof prisma.fAQ.findMany>> = [];
  try {
    faqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
    });
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
  }

  // Group by pageType
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.pageType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // Localize FAQ data for display
  const localizedFaqs = faqs.map((f) => ({
    ...f,
    question: localized(f.question, f.questionEs, locale),
    answer: localized(f.answer, f.answerEs, locale),
  }));

  const allFaqData = localizedFaqs.map((f) => ({ question: f.question, answer: f.answer }));

  const breadcrumbs = [
    { name: t("label") === "Common Questions" ? "Home" : "Inicio", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  const groupLabels: Record<string, string> = {
    general: t("generalQuestions"),
    service: t("servicesAndCleaning"),
    pricing: t("pricingAndPayment"),
    area: t("serviceAreas"),
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <JsonLd data={faqPageSchema(allFaqData)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">{locale === "es" ? "Inicio" : "Home"}</Link>
        {" / "}
        <span className="text-tobacco">FAQ</span>
      </nav>

      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </section>

      {/* FAQs grouped by type */}
      {Object.entries(grouped).map(([type, items]) => {
        const localizedItems = items.map((f) => ({
          ...f,
          question: localized(f.question, f.questionEs, locale),
          answer: localized(f.answer, f.answerEs, locale),
        }));
        return (
          <div key={type} className="mb-8">
            <FAQSection
              faqs={localizedItems}
              title={groupLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
            />
          </div>
        );
      })}

      {faqs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="text-4xl mb-4">❓</div>
          <p className="text-gray-400">{t("beingPrepared")}</p>
        </div>
      )}

      {/* CTA */}
      <section className="bg-green/5 rounded-2xl p-8 text-center mt-8">
        <h2 className="font-display text-xl text-tobacco mb-3">
          {t("stillHaveQuestions")}
        </h2>
        <p className="text-gray-600 mb-4">
          {t("teamHappy")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/book"
            className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
          >
            {t("bookYourCleaning")}
          </Link>
          <Link
            href="/pricing"
            className="inline-block bg-white border border-tobacco/20 text-tobacco px-8 py-3 rounded-xl font-semibold hover:bg-ivory transition-colors"
          >
            {t("viewPricing")}
          </Link>
        </div>
      </section>
    </div>
  );
}
