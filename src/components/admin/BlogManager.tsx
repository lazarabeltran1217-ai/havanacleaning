"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags: any;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface Props {
  initialPosts: BlogPost[];
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green";
const labelClass = "block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5";

export function BlogManager({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState("");
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
    setTags("");
    setIsPublished(false);
    setActiveTab("content");
    setGenError("");
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
    setTags(Array.isArray(post.tags) ? (post.tags as string[]).join(", ") : "");
    setIsPublished(post.isPublished);
    setActiveTab("content");
    setGenError("");
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

  async function handleGenerateAI() {
    if (!title.trim()) {
      setGenError("Enter a title first, then click Generate with AI.");
      return;
    }
    setGenerating(true);
    setGenError("");

    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || "Failed to generate content.");
        return;
      }

      setContent(data.content || "");
      setExcerpt(data.excerpt || "");
      setMetaTitle(data.metaTitle || title);
      setMetaDescription(data.metaDescription || "");
      if (Array.isArray(data.tags)) setTags(data.tags.join(", "));
      if (!slug) setSlug(autoSlug(title));
      if (!author) setAuthor("Havana Cleaning Team");
    } catch {
      setGenError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const body = {
      title,
      slug: slug || autoSlug(title),
      content,
      excerpt,
      author,
      metaTitle,
      metaDescription,
      tags: parsedTags,
      isPublished,
    };

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

  // SEO score calculation
  const seoScore = (() => {
    let score = 0;
    if (title.length > 0) score += 15;
    if (content.length > 300) score += 25;
    if (metaTitle.length > 0 && metaTitle.length <= 60) score += 20;
    if (metaDescription.length > 0 && metaDescription.length <= 155) score += 20;
    if (excerpt.length > 0) score += 10;
    if (tags.length > 0) score += 10;
    return score;
  })();

  const seoColor = seoScore >= 80 ? "text-green" : seoScore >= 50 ? "text-amber" : "text-red-500";
  const seoBg = seoScore >= 80 ? "bg-green/10" : seoScore >= 50 ? "bg-amber/10" : "bg-red-50";

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
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
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
                    className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      post.isPublished
                        ? "bg-green/10 text-green"
                        : "bg-amber/10 text-amber"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="text-[0.78rem] text-gray-400 flex items-center gap-3 flex-wrap">
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
                  {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                    <div className="flex gap-1">
                      {(post.tags as string[]).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[0.65rem] bg-ivory px-1.5 py-0.5 rounded text-tobacco/60">
                          {tag}
                        </span>
                      ))}
                    </div>
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
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display text-lg">
                {editing ? "Edit Blog Post" : "New Blog Post"}
              </h3>
              <div className="flex items-center gap-3">
                {/* SEO Score Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${seoBg}`}>
                  <span className={`text-[0.78rem] font-semibold ${seoColor}`}>SEO {seoScore}%</span>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-tobacco text-xl leading-none">&times;</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              <button
                onClick={() => setActiveTab("content")}
                className={`px-4 py-3 text-[0.85rem] font-medium border-b-2 transition-colors ${
                  activeTab === "content"
                    ? "border-green text-green"
                    : "border-transparent text-gray-400 hover:text-tobacco"
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`px-4 py-3 text-[0.85rem] font-medium border-b-2 transition-colors ${
                  activeTab === "seo"
                    ? "border-green text-green"
                    : "border-transparent text-gray-400 hover:text-tobacco"
                }`}
              >
                SEO Settings
              </button>
            </div>

            <div className="p-6">
              {activeTab === "content" && (
                <div className="space-y-4">
                  {/* Title + Generate AI */}
                  <div>
                    <label className={labelClass}>Title</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (!editing) setSlug(autoSlug(e.target.value));
                        }}
                        className={`${inputClass} flex-1`}
                        placeholder="How to Keep Your Miami Home Spotless"
                      />
                      <button
                        onClick={handleGenerateAI}
                        disabled={generating || !title.trim()}
                        className="shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2.5 text-[0.82rem] font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {generating ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>
                    {genError && (
                      <p className="text-red-500 text-[0.78rem] mt-1.5">{genError}</p>
                    )}
                    {generating && (
                      <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <p className="text-purple-600 text-[0.8rem]">
                          AI is writing your SEO-optimized blog post... This may take 15-30 seconds.
                        </p>
                      </div>
                    )}
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
                    <div className="text-[0.7rem] text-gray-400 mt-1">{excerpt.length}/160 characters</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`${labelClass} mb-0`}>Content</label>
                      <span className="text-[0.7rem] text-gray-400">
                        {content.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={16}
                      className={`${inputClass} font-mono text-[0.82rem] leading-relaxed`}
                      placeholder="Write your blog post content here... Use ## for headings and ### for subheadings."
                    />
                    <p className="text-[0.7rem] text-gray-400 mt-1">
                      Supports Markdown: ## Heading, ### Subheading, **bold**, *italic*, - list items
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className={inputClass}
                      placeholder="cleaning tips, miami, home care, deep cleaning"
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
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-5">
                  {/* SEO Score */}
                  <div className={`rounded-lg p-4 ${seoBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.85rem] font-semibold">SEO Score</span>
                      <span className={`text-2xl font-bold ${seoColor}`}>{seoScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          seoScore >= 80 ? "bg-green" : seoScore >= 50 ? "bg-amber" : "bg-red-400"
                        }`}
                        style={{ width: `${seoScore}%` }}
                      />
                    </div>
                    <ul className="mt-3 space-y-1 text-[0.78rem]">
                      <li className={title.length > 0 ? "text-green" : "text-gray-400"}>
                        {title.length > 0 ? "✓" : "○"} Title is set
                      </li>
                      <li className={content.length > 300 ? "text-green" : "text-gray-400"}>
                        {content.length > 300 ? "✓" : "○"} Content has 300+ characters
                      </li>
                      <li className={metaTitle.length > 0 && metaTitle.length <= 60 ? "text-green" : "text-gray-400"}>
                        {metaTitle.length > 0 && metaTitle.length <= 60 ? "✓" : "○"} Meta title (max 60 chars)
                      </li>
                      <li className={metaDescription.length > 0 && metaDescription.length <= 155 ? "text-green" : "text-gray-400"}>
                        {metaDescription.length > 0 && metaDescription.length <= 155 ? "✓" : "○"} Meta description (max 155 chars)
                      </li>
                      <li className={excerpt.length > 0 ? "text-green" : "text-gray-400"}>
                        {excerpt.length > 0 ? "✓" : "○"} Excerpt is set
                      </li>
                      <li className={tags.length > 0 ? "text-green" : "text-gray-400"}>
                        {tags.length > 0 ? "✓" : "○"} Tags are set
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className={labelClass}>Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className={inputClass}
                      placeholder="Leave empty to use post title"
                    />
                    <div className={`text-[0.7rem] mt-1 ${metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                      {metaTitle.length}/60 characters
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={3}
                      className={inputClass}
                      placeholder="Leave empty to use excerpt"
                    />
                    <div className={`text-[0.7rem] mt-1 ${metaDescription.length > 155 ? "text-red-500" : "text-gray-400"}`}>
                      {metaDescription.length}/155 characters
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Focus Keywords / Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className={inputClass}
                      placeholder="cleaning tips, miami, home care"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Canonical URL</label>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-[0.82rem]">havanacleaning.com</span>
                      <input
                        type="text"
                        value={`/blog/${slug || "..."}`}
                        readOnly
                        className={`${inputClass} bg-gray-50 text-gray-500`}
                      />
                    </div>
                  </div>

                  {/* Search Preview */}
                  <div>
                    <label className={labelClass}>Search Preview</label>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-[#1a0dab] text-[1rem] font-medium truncate">
                        {metaTitle || title || "Page Title"}
                      </div>
                      <div className="text-green-700 text-[0.82rem] mt-0.5">
                        havanacleaning.com/blog/{slug || "..."}
                      </div>
                      <div className="text-[0.82rem] text-gray-600 mt-1 line-clamp-2">
                        {metaDescription || excerpt || "Add a meta description to see how this post will appear in search results."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-[0.85rem] text-gray-500 hover:text-tobacco transition-colors"
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
