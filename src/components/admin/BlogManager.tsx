"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleEs: string | null;
  content: string | null;
  contentEs: string | null;
  excerpt: string | null;
  excerptEs: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  author: string | null;
  featuredImage: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface Props {
  initialPosts: BlogPost[];
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem]";
const labelClass = "block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5";

export function BlogManager({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setAuthor("");
    setMetaTitle("");
    setMetaDescription("");
    setIsPublished(false);
    setCreating(true);
  }

  function openEdit(post: BlogPost) {
    setCreating(false);
    setEditing(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content || "");
    setExcerpt(post.excerpt || "");
    setAuthor(post.author || "");
    setMetaTitle(post.metaTitle || "");
    setMetaDescription(post.metaDescription || "");
    setIsPublished(post.isPublished);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSave() {
    setSaving(true);
    const body = { title, slug: slug || autoSlug(title), content, excerpt, author, metaTitle, metaDescription, isPublished };

    if (editing) {
      await fetch(`/api/blog/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    closeModal();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
    setDeleting(null);
    router.refresh();
  }

  async function togglePublish(post: BlogPost) {
    await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    router.refresh();
  }

  return (
    <>
      {/* Action bar */}
      <div className="mb-6">
        <button
          onClick={openCreate}
          className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 transition-colors"
        >
          + New Blog Post
        </button>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-400">No blog posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-[#ece6d9] p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-[0.95rem] truncate">{post.title}</h3>
                  <span
                    className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium ${
                      post.isPublished
                        ? "bg-green/10 text-green"
                        : "bg-amber/10 text-amber"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="text-[0.78rem] text-gray-400 flex items-center gap-3">
                  <span>/{post.slug}</span>
                  {post.author && <span>by {post.author}</span>}
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
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className="text-[0.78rem] text-gray-400 hover:text-tobacco transition-colors"
                >
                  {post.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEdit(post)}
                  className="text-teal text-[0.78rem] font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="text-red-400 text-[0.78rem] hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === post.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {(creating || editing) && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-5">
              {editing ? "Edit Blog Post" : "New Blog Post"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editing) setSlug(autoSlug(e.target.value));
                  }}
                  className={inputClass}
                  placeholder="How to Keep Your Miami Home Spotless"
                />
              </div>

              <div>
                <label className={labelClass}>Slug (URL)</label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.82rem]">/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={inputClass}
                    placeholder="how-to-keep-your-miami-home-spotless"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Excerpt (short description)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder="A brief summary shown in blog listings and social shares..."
                />
              </div>

              <div>
                <label className={labelClass}>Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className={inputClass}
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={inputClass}
                    placeholder="Havana Cleaning Team"
                  />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={isPublished ? "published" : "draft"}
                    onChange={(e) => setIsPublished(e.target.value === "published")}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-3">SEO Settings</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className={inputClass}
                      placeholder="Leave empty to use post title"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={2}
                      className={inputClass}
                      placeholder="Leave empty to use excerpt"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-5 py-2 text-[0.85rem] text-gray-500 hover:text-tobacco transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
