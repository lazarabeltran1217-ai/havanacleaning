import { prisma } from "@/lib/prisma";
import { SocialManager } from "@/components/admin/SocialManager";

export default async function AdminSocialPage() {
  const fetchPosts = () =>
    prisma.socialPost.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  try {
    posts = await fetchPosts();
  } catch (error) {
    console.error("Failed to fetch social posts:", error);
  }

  // Serialize for client component (converts Date → string, JsonValue → plain JS)
  const serialized = JSON.parse(JSON.stringify(posts));

  return (
    <div>
      <h1 className="font-display text-xl mb-6">Social Media Manager</h1>
      <p className="text-gray-500 text-sm mb-8">
        Generate, schedule, and publish social media posts with AI.
      </p>
      <SocialManager initialPosts={serialized} />
    </div>
  );
}
