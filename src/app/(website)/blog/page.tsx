import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";

export const metadata: Metadata = {
  title: "Blog — Cleaning Tips & Home Care Guides",
  description:
    "Expert cleaning tips, home care guides, and industry insights from Havana Cleaning. Learn how to maintain a spotless home.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("blog");

  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
  }

  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </section>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">{t("comingSoon")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-green/40 hover:shadow-sm transition-all"
            >
              {post.featuredImage && (
                <div className="relative w-full h-48">
                  <Image src={post.featuredImage} alt={localized(post.title, post.titleEs, locale)} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
                </div>
              )}
              <div className="p-6">
              <h2 className="font-display text-xl text-tobacco mb-2">
                {localized(post.title, post.titleEs, locale)}
              </h2>
              {(post.excerpt || post.excerptEs) && (
                <p className="text-gray-500 text-[0.9rem] line-clamp-2">
                  {localized(post.excerpt, post.excerptEs, locale)}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-[0.78rem] text-gray-400">
                {post.author && <span>{t("by", { author: post.author })}</span>}
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
