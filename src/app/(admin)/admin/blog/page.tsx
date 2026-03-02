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

  const totalPosts = posts.length;
  const published = posts.filter((p) => p.isPublished).length;
  const drafts = posts.filter((p) => !p.isPublished).length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = posts.filter((p) => new Date(p.createdAt) >= monthStart).length;

  return (
    <div>
      <h1 className="font-display text-xl mb-6">Blog Manager</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Posts</div>
          <div className="text-2xl font-display text-tobacco">{totalPosts}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Published</div>
          <div className="text-2xl font-display text-green">{published}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Drafts</div>
          <div className="text-2xl font-display text-amber">{drafts}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">This Month</div>
          <div className="text-2xl font-display text-tobacco">{thisMonth}</div>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-8">Create, edit, and publish blog posts.</p>
      <BlogManager initialPosts={posts} />
    </div>
  );
}
