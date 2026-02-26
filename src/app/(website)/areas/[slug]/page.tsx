import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { FAQSection } from "@/components/website/FAQSection";

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
      title: area.metaTitle || `${area.name} Cleaning Service | Havana Cleaning`,
      description:
        area.metaDescription ||
        `Professional house cleaning and deep cleaning services in ${area.name}, Miami. Book online with Havana Cleaning.`,
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

  let area = null;
  let faqs: Awaited<ReturnType<typeof prisma.fAQ.findMany>> = [];
  let services: { name: string; slug: string; icon: string | null; basePrice: number }[] = [];

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
        select: { name: true, slug: true, icon: true, basePrice: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch area data:", error);
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Service Areas", url: "/areas" },
    { name: area.name, url: `/areas/${area.slug}` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={faqPageSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">Home</Link>
        {" / "}
        <Link href="/areas" className="hover:text-teal">Service Areas</Link>
        {" / "}
        <span className="text-tobacco">{area.name}</span>
      </nav>

      {/* Hero */}
      <h1 className="font-display text-4xl text-tobacco mb-4">
        {area.title || `Cleaning Services in ${area.name}`}
      </h1>
      <p className="text-gray-600 text-lg mb-8">
        {area.description ||
          `Havana Cleaning provides professional residential and commercial cleaning services throughout ${area.name}, Miami. Book today and experience the difference.`}
      </p>

      {/* Content */}
      {area.content && (
        <div className="prose prose-tobacco max-w-none mb-12 text-gray-600 leading-relaxed whitespace-pre-line">
          {area.content}
        </div>
      )}

      {/* Services Available */}
      <section className="mb-12">
        <h2 className="font-display text-2xl text-tobacco mb-6">
          Services Available in {area.name}
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
                <div className="font-medium text-tobacco">{s.name}</div>
                {s.basePrice > 0 && (
                  <div className="text-green text-sm">From ${s.basePrice}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <FAQSection
        faqs={faqs}
        title={`FAQ — Cleaning in ${area.name}`}
      />

      {/* CTA */}
      <section className="bg-green/5 rounded-2xl p-8 text-center mt-8">
        <h2 className="font-display text-2xl text-tobacco mb-3">
          Ready for a Spotless Home in {area.name}?
        </h2>
        <p className="text-gray-600 mb-6">
          Book your cleaning in under 2 minutes. Same-week availability.
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          Book Now
        </Link>
      </section>
    </div>
  );
}
