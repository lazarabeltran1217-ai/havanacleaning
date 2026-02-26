import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Areas — Miami-Dade Cleaning Coverage",
  description:
    "Havana Cleaning serves all of Miami-Dade County. Find professional cleaning services in Brickell, Coral Gables, Kendall, Doral, Miami Beach, and 15+ more neighborhoods.",
  alternates: { canonical: "/areas" },
};

export default async function AreasPage() {
  const areaPages = await prisma.areaPage.findMany({
    where: { isPublished: true },
    orderBy: { name: "asc" },
  });

  const publishedSlugs = new Set(areaPages.map((a) => a.slug));

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          We Clean All of Miami-Dade
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          From Brickell high-rises to Kendall family homes, Havana Cleaning brings
          spotless service to every corner of Miami-Dade County.
        </p>
      </section>

      {/* Area Grid */}
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
                  {areaPage.description}
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
                Professional cleaning services available
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <section className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Don&apos;t see your neighborhood? We likely serve your area too!
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          Book Your Cleaning
        </Link>
      </section>
    </div>
  );
}
