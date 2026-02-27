import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/website/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { BlogContent } from "@/components/website/BlogContent";

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

  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  if (!post || !post.isPublished) notFound();

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <article className="max-w-3xl mx-auto px-5 py-16">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-teal">Home</Link>
        {" / "}
        <Link href="/blog" className="hover:text-teal">Blog</Link>
        {" / "}
        <span className="text-tobacco">{post.title}</span>
      </nav>

      {/* Header */}
      <h1 className="font-display text-4xl text-tobacco mb-4">{post.title}</h1>
      <div className="flex items-center gap-3 text-gray-400 text-sm mb-8">
        {post.author && <span>By {post.author}</span>}
        {post.publishedAt && (
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Content */}
      {post.content ? (
        <BlogContent content={post.content} />
      ) : (
        <p className="text-gray-400">Content coming soon.</p>
      )}

      {/* CTA */}
      <div className="mt-12 bg-green/5 rounded-2xl p-8 text-center">
        <h2 className="font-display text-xl text-tobacco mb-3">
          Need Professional Cleaning?
        </h2>
        <p className="text-gray-600 mb-4">
          Let Havana Cleaning handle it. Book online in under 2 minutes.
        </p>
        <Link
          href="/book"
          className="inline-block bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green/90 transition-colors"
        >
          Book Your Cleaning
        </Link>
      </div>
    </article>
  );
}
