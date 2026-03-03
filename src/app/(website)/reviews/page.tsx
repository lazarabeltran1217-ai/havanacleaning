import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { buildContentMap, localized } from "@/lib/i18n-content";

export const metadata: Metadata = {
  title: "Customer Reviews & Ratings",
  description:
    "See what families say about Havana Cleaning. Real reviews from real customers — rated 5 stars for quality and reliability.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let contentMap: Record<string, unknown> = {};

  try {
    testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
  }

  try {
    const rows = await prisma.content.findMany({ where: { published: true } });
    contentMap = buildContentMap(rows, locale);
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  const pageContent = (contentMap.reviews_page ?? {}) as {
    title?: string;
    subtitle?: string;
  };

  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 5;

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-20 px-6 md:px-20 text-center">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-light" />
          {t("testimonials.label")}
          <span className="w-8 h-px bg-green-light" />
        </div>
        <h1
          className="font-display text-cream mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          {pageContent.title || t("testimonials.title")}
        </h1>
        <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
          {pageContent.subtitle || t("testimonials.subtitle")}
        </p>
        {testimonials.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-gold text-2xl">★★★★★</span>
            <span className="text-cream text-lg font-semibold">
              {(Math.round(avgRating * 10) / 10).toFixed(1)}
            </span>
            <span className="text-sand text-[0.9rem]">
              {t("testimonials.fromReviews", { count: testimonials.length })}
            </span>
          </div>
        )}
      </section>

      {/* REVIEWS GRID */}
      <section className="bg-ivory py-20 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sand text-[0.9rem]">{t("testimonials.noReviews")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white border border-tobacco/10 rounded-lg p-8"
                >
                  <div className="text-gold text-lg mb-3">
                    {"★".repeat(testimonial.rating)}
                    {"☆".repeat(5 - testimonial.rating)}
                  </div>
                  <p className="font-serif italic text-[#5a4535] text-[0.92rem] leading-relaxed mb-6">
                    &ldquo;{localized(testimonial.content, testimonial.contentEs, locale)}&rdquo;
                  </p>
                  <div className="border-t border-tobacco/10 pt-4">
                    <div className="font-semibold text-[0.85rem]">
                      {testimonial.customerName}
                    </div>
                    {testimonial.location && (
                      <div className="text-green text-[0.78rem]">
                        {testimonial.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          {t("cta.readySpotless")}
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          {t("cta.joinHappy")}
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
