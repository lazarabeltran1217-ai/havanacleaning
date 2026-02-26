import { prisma } from "@/lib/prisma";
import { BlogManager } from "@/components/admin/BlogManager";

export default async function AdminBlogPage() {
  const fetchPosts = () =>
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  try {
    posts = await fetchPosts();
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
  }

  return (
    <div>
      <h1 className="font-display text-xl mb-6">Blog Manager</h1>
      <p className="text-gray-500 text-sm mb-8">Create, edit, and publish blog posts.</p>
      <BlogManager initialPosts={posts} />
    </div>
  );
}
