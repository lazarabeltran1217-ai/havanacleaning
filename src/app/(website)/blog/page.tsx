import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Cleaning Tips & Home Care Guides",
  description:
    "Expert cleaning tips, home care guides, and industry insights from Havana Cleaning. Learn how to maintain a spotless home in Miami.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <section className="text-center mb-12">
        <h1 className="font-display text-4xl text-tobacco mb-4">
          Cleaning Tips & Guides
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice from our cleaning professionals. Learn how to keep your
          Miami home spotless between professional cleanings.
        </p>
      </section>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-400">Blog posts coming soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl border border-gray-100 p-6 hover:border-green/40 hover:shadow-sm transition-all"
            >
              <h2 className="font-display text-xl text-tobacco mb-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-gray-500 text-[0.9rem] line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-[0.78rem] text-gray-400">
                {post.author && <span>By {post.author}</span>}
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
