import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { BlogContent } from "@/components/website/BlogContent";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/i18n-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return {};
    const rawTitle = post.metaTitle || post.title;
    const rawDesc = post.metaDescription || post.excerpt || "";
    return {
      // Use absolute title to avoid the layout template appending " | Havana Cleaning"
      // which pushes long blog titles well past the 60-char recommendation
      title: { absolute: rawTitle.length > 60 ? rawTitle.slice(0, 57) + "..." : rawTitle },
      description: rawDesc.length > 160 ? rawDesc.slice(0, 157) + "..." : rawDesc,
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("blog");
  const tCommon = await getTranslations("common");

  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  if (!post || !post.isPublished) notFound();

  const postTitle = localized(post.title, post.titleEs, locale);
  const postContent = localized(post.content, post.contentEs, locale);
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const breadcrumbs = [
    { name: tCommon("home"), url: "/" },
    { name: t("breadcrumbBlog"), url: "/blog" },
    { name: postTitle, url: `/blog/${post.slug}` },
  ];

  return (
    <article className="max-w-3xl mx-auto px-5 py-16">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">{tCommon("home")}</Link>
        {" / "}
        <Link href="/blog" className="hover:text-teal">{t("breadcrumbBlog")}</Link>
        {" / "}
        <span className="text-tobacco">{postTitle}</span>
      </nav>

      {/* Header */}
      <h1 className="font-display text-4xl text-tobacco mb-4">{postTitle}</h1>
      <div className="flex items-center gap-3 text-gray-400 text-sm mb-8">
        {post.author && <span>{t("by", { author: post.author })}</span>}
        {post.publishedAt && (
          <span>
            {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "America/New_York",
            })}
          </span>
        )}
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-8">
          <Image src={post.featuredImage} alt={postTitle} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        </div>
      )}

      {/* Content */}
      {postContent ? (
        <BlogContent content={postContent} />
      ) : (
        <p className="text-gray-400">{t("contentComingSoon")}</p>
      )}

      {/* CTA */}
      <div className="mt-12 bg-green/5 rounded-2xl p-8 text-center">
        <h2 className="font-display text-xl text-tobacco mb-3">
          {t("needCleaning")}
        </h2>
        <p className="text-gray-600 mb-4">
          {t("needCleaningDesc")}
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          {t("bookYourCleaning")}
        </Link>
      </div>
    </article>
  );
}
