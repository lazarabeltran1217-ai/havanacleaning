import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { FAQSection } from "@/components/website/FAQSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Get answers to common questions about Havana Cleaning services, pricing, scheduling, and more. Serving all of Miami-Dade County.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
  });

  // Group by pageType
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.pageType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const allFaqData = faqs.map((f) => ({ question: f.question, answer: f.answer }));

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  const groupLabels: Record<string, string> = {
    general: "General Questions",
    service: "Services & Cleaning",
    pricing: "Pricing & Payment",
    area: "Service Areas",
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <JsonLd data={faqPageSchema(allFaqData)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">Home</Link>
        {" / "}
        <span className="text-tobacco">FAQ</span>
      </nav>

      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about Havana Cleaning services. Can&apos;t
          find your answer? Call us at (305) 555-CLEAN.
        </p>
      </section>

      {/* FAQs grouped by type */}
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-8">
          <FAQSection
            faqs={items}
            title={groupLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
          />
        </div>
      ))}

      {faqs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="text-4xl mb-4">❓</div>
          <p className="text-gray-400">FAQs are being prepared. Check back soon!</p>
        </div>
      )}

      {/* CTA */}
      <section className="bg-green/5 rounded-2xl p-8 text-center mt-8">
        <h2 className="font-display text-xl text-tobacco mb-3">
          Still Have Questions?
        </h2>
        <p className="text-gray-600 mb-4">
          Our team is happy to help. Reach out anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/book"
            className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
          >
            Book Your Cleaning
          </Link>
          <a
            href="tel:+13055552532"
            className="inline-block bg-white border border-tobacco/20 text-tobacco px-8 py-3 rounded-xl font-semibold hover:bg-ivory transition-colors"
          >
            Call (305) 555-CLEAN
          </a>
        </div>
      </section>
    </div>
  );
}
