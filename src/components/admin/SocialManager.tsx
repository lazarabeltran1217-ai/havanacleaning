"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Calendar,
  List,
  Clock,
  Sparkles,
  Copy,
  Trash2,
  Edit3,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

/* ─── Types ─── */
interface SocialPost {
  id: string;
  platforms: string[];
  contentType: string;
  content: string;
  contentEs: string | null;
  hashtags: string[] | null;
  imagePrompt: string | null;
  imageUrl: string | null;
  callToAction: string | null;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publishResults: any;
  failureReason: string | null;
  aiModel: string | null;
  aiPromptUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialPosts: SocialPost[];
}

/* ─── Constants ─── */
const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green";
const labelClass = "block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5";

const PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500", textColor: "text-pink-600", bgLight: "bg-pink-50" },
  { id: "tiktok", label: "TikTok", color: "bg-black", textColor: "text-gray-800", bgLight: "bg-gray-100" },
  { id: "google", label: "Google Business", color: "bg-blue-600", textColor: "text-blue-700", bgLight: "bg-blue-50" },
];

const CONTENT_TYPES = [
  { id: "tip", label: "Cleaning Tip", emoji: "💡" },
  { id: "promo", label: "Promotion", emoji: "🎉" },
  { id: "seasonal", label: "Seasonal", emoji: "🌸" },
  { id: "testimonial", label: "Testimonial", emoji: "⭐" },
  { id: "before_after", label: "Before & After", emoji: "✨" },
  { id: "behind_scenes", label: "Behind the Scenes", emoji: "🎬" },
  { id: "educational", label: "Educational", emoji: "📚" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  SCHEDULED: "bg-amber/10 text-amber",
  PUBLISHED: "bg-green/10 text-green",
  FAILED: "bg-red-50 text-red-500",
};

const TONES = [
  { id: "professional", label: "Professional & Warm" },
  { id: "casual", label: "Casual & Friendly" },
  { id: "humorous", label: "Fun & Humorous" },
  { id: "urgent", label: "Urgent / Limited Time" },
];

/* ─── Component ─── */
export function SocialManager({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [view, setView] = useState<"list" | "calendar" | "timeline">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  // Generate modal state
  const [showGenerate, setShowGenerate] = useState(false);
  const [genPlatform, setGenPlatform] = useState("facebook");
  const [genType, setGenType] = useState("tip");
  const [genTopic, setGenTopic] = useState("");
  const [genTone, setGenTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genPreview, setGenPreview] = useState<{
    content: string;
    contentEs: string;
    hashtags: string[];
    imagePrompt: string;
    callToAction: string;
  } | null>(null);

  // Edit modal state
  const [editPost, setEditPost] = useState<SocialPost | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editContentEs, setEditContentEs] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editPlatforms, setEditPlatforms] = useState<string[]>([]);
  const [editType, setEditType] = useState("tip");
  const [editStatus, setEditStatus] = useState("DRAFT");
  const [editSchedule, setEditSchedule] = useState("");
  const [editCallToAction, setEditCallToAction] = useState("");
  const [editImagePrompt, setEditImagePrompt] = useState("");
  const [saving, setSaving] = useState(false);

  // Batch generate state
  const [showBatch, setShowBatch] = useState(false);
  const [batchCount, setBatchCount] = useState(7);
  const [batchPlatforms, setBatchPlatforms] = useState<string[]>(["facebook", "instagram"]);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResult, setBatchResult] = useState<string>("");

  // Publishing state
  const [publishing, setPublishing] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Deleting state
  const [deleting, setDeleting] = useState<string | null>(null);

  /* ─── Filtered posts ─── */
  const filtered = posts.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterPlatform !== "all") {
      const platArr = Array.isArray(p.platforms) ? p.platforms : [];
      if (!platArr.includes(filterPlatform)) return false;
    }
    return true;
  });

  /* ─── Stats ─── */
  const statTotal = posts.length;
  const statDrafts = posts.filter((p) => p.status === "DRAFT").length;
  const statScheduled = posts.filter((p) => p.status === "SCHEDULED").length;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const statPublishedWeek = posts.filter(
    (p) => p.status === "PUBLISHED" && p.publishedAt && new Date(p.publishedAt) >= weekAgo
  ).length;

  /* ─── Handlers ─── */

  async function handleGenerate() {
    setGenerating(true);
    setGenError("");
    setGenPreview(null);

    try {
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: genPlatform,
          contentType: genType,
          topic: genTopic || undefined,
          tone: genTone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || "Generation failed");
        return;
      }

      setGenPreview({
        content: data.content,
        contentEs: data.contentEs,
        hashtags: data.hashtags,
        imagePrompt: data.imagePrompt,
        callToAction: data.callToAction,
      });
    } catch {
      setGenError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveGenerated(status: "DRAFT" | "SCHEDULED") {
    if (!genPreview) return;
    setSaving(true);

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: [genPlatform],
          contentType: genType,
          content: genPreview.content,
          contentEs: genPreview.contentEs,
          hashtags: genPreview.hashtags,
          imagePrompt: genPreview.imagePrompt,
          callToAction: genPreview.callToAction,
          status,
          aiModel: "deepseek-chat",
          aiPromptUsed: genTopic || `${genType} for ${genPlatform}`,
        }),
      });

      if (res.ok) {
        setShowGenerate(false);
        setGenPreview(null);
        setGenTopic("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function openEdit(post: SocialPost) {
    setEditPost(post);
    setEditContent(post.content);
    setEditContentEs(post.contentEs || "");
    setEditHashtags(Array.isArray(post.hashtags) ? post.hashtags.join(", ") : "");
    setEditPlatforms(Array.isArray(post.platforms) ? post.platforms : []);
    setEditType(post.contentType);
    setEditStatus(post.status);
    setEditSchedule(
      post.scheduledFor
        ? new Date(post.scheduledFor).toISOString().slice(0, 16)
        : ""
    );
    setEditCallToAction(post.callToAction || "");
    setEditImagePrompt(post.imagePrompt || "");
  }

  async function handleSaveEdit() {
    if (!editPost) return;
    setSaving(true);

    const hashtags = editHashtags
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    try {
      await fetch(`/api/social/${editPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          contentEs: editContentEs,
          hashtags,
          platforms: editPlatforms,
          contentType: editType,
          status: editStatus,
          scheduledFor: editSchedule || null,
          callToAction: editCallToAction,
          imagePrompt: editImagePrompt,
        }),
      });

      setEditPost(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/social/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
    setDeleting(null);
    router.refresh();
  }

  async function handlePublish(post: SocialPost, platform: string) {
    setPublishing(post.id);
    try {
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, platform }),
      });

      const data = await res.json();
      if (data.manual) {
        // Copy to clipboard for manual platforms
        await navigator.clipboard.writeText(
          post.content +
            (Array.isArray(post.hashtags) ? "\n\n" + post.hashtags.join(" ") : "")
        );
        setCopySuccess(post.id);
        setTimeout(() => setCopySuccess(null), 3000);
      }
      router.refresh();
    } finally {
      setPublishing(null);
    }
  }

  async function handleCopy(post: SocialPost) {
    const text =
      post.content +
      (Array.isArray(post.hashtags) && post.hashtags.length > 0
        ? "\n\n" + post.hashtags.join(" ")
        : "");
    await navigator.clipboard.writeText(text);
    setCopySuccess(post.id);
    setTimeout(() => setCopySuccess(null), 2000);
  }

  async function handleBatchGenerate() {
    setBatchGenerating(true);
    setBatchResult("");

    try {
      const res = await fetch("/api/social/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: batchPlatforms,
          count: batchCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBatchResult(data.error || "Batch generation failed");
      } else {
        setBatchResult(
          `Generated ${data.total} posts. ${data.failed?.length > 0 ? `${data.failed.length} failed.` : ""}`
        );
        router.refresh();
      }
    } catch {
      setBatchResult("Network error. Please try again.");
    } finally {
      setBatchGenerating(false);
    }
  }

  /* ─── Calendar helpers ─── */
  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number) {
    return new Date(year, month, 1).getDay();
  }

  function postsForDay(day: number) {
    return posts.filter((p) => {
      const d = p.scheduledFor ? new Date(p.scheduledFor) : new Date(p.createdAt);
      return d.getDate() === day && d.getMonth() === calMonth && d.getFullYear() === calYear;
    });
  }

  /* ─── Platform badge ─── */
  function PlatformBadge({ id }: { id: string }) {
    const p = PLATFORMS.find((pl) => pl.id === id);
    if (!p) return null;
    return (
      <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-medium ${p.bgLight} ${p.textColor}`}>
        {p.label}
      </span>
    );
  }

  function ContentTypeBadge({ type }: { type: string }) {
    const ct = CONTENT_TYPES.find((c) => c.id === type);
    return (
      <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-ivory text-tobacco/60">
        {ct ? `${ct.emoji} ${ct.label}` : type}
      </span>
    );
  }

  /* ─── Render ─── */
  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Posts", value: statTotal, cls: "text-tobacco" },
          { label: "Drafts", value: statDrafts, cls: "text-gray-500" },
          { label: "Scheduled", value: statScheduled, cls: "text-amber" },
          { label: "Published (7d)", value: statPublishedWeek, cls: "text-green" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#ece6d9] p-4 text-center">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-[0.72rem] text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => {
            setShowGenerate(true);
            setGenPreview(null);
            setGenError("");
            setGenTopic("");
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Post
        </button>
        <button
          onClick={() => {
            setShowBatch(true);
            setBatchResult("");
          }}
          className="bg-green text-white px-5 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Generate Week
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          {(["list", "calendar", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`p-2 rounded-lg text-[0.82rem] transition-colors ${
                view === v
                  ? "bg-green/10 text-green"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={v}
            >
              {v === "list" ? <List className="w-4 h-4" /> : v === "calendar" ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-green/20"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-green/20"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <span className="text-[0.78rem] text-gray-400">
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─── LIST VIEW ─── */}
      {view === "list" && (
        <>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
              <Share2 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No social posts yet. Generate your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post) => {
                const platArr = Array.isArray(post.platforms) ? post.platforms : [];
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-[#ece6d9] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Platform badges + status */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {platArr.map((pl) => (
                            <PlatformBadge key={pl} id={pl} />
                          ))}
                          <ContentTypeBadge type={post.contentType} />
                          <span
                            className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium ${
                              STATUS_COLORS[post.status] || STATUS_COLORS.DRAFT
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>

                        {/* Content preview */}
                        <p className="text-[0.85rem] text-tobacco leading-relaxed line-clamp-3 mb-2">
                          {post.content}
                        </p>

                        {/* Hashtags */}
                        {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(post.hashtags as string[]).slice(0, 6).map((tag) => (
                              <span key={tag} className="text-[0.65rem] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {(post.hashtags as string[]).length > 6 && (
                              <span className="text-[0.65rem] text-gray-400">
                                +{(post.hashtags as string[]).length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Schedule info */}
                        <div className="text-[0.75rem] text-gray-400 flex items-center gap-3">
                          {post.scheduledFor && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(post.scheduledFor).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green" />
                              Published {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {post.failureReason && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => openEdit(post)}
                          className="flex items-center gap-1.5 text-[0.78rem] text-teal hover:underline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleCopy(post)}
                          className="flex items-center gap-1.5 text-[0.78rem] text-gray-400 hover:text-tobacco"
                        >
                          {copySuccess === post.id ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-green" />
                              <span className="text-green">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                        {post.status !== "PUBLISHED" && platArr.length > 0 && (
                          <button
                            onClick={() => handlePublish(post, platArr[0])}
                            disabled={publishing === post.id}
                            className="flex items-center gap-1.5 text-[0.78rem] text-green hover:underline disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {publishing === post.id ? "..." : "Publish"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="flex items-center gap-1.5 text-[0.78rem] text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deleting === post.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── CALENDAR VIEW ─── */}
      {view === "calendar" && (
        <div className="bg-white rounded-xl border border-[#ece6d9] p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                else setCalMonth(calMonth - 1);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-display text-[0.95rem]">
              {new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                else setCalMonth(calMonth + 1);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[0.68rem] uppercase tracking-wider text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: getFirstDayOfMonth(calMonth, calYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}

            {/* Day cells */}
            {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, i) => {
              const day = i + 1;
              const dayPosts = postsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                calMonth === new Date().getMonth() &&
                calYear === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`h-20 rounded-lg border p-1.5 ${
                    isToday
                      ? "border-green bg-green/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`text-[0.72rem] font-medium mb-1 ${isToday ? "text-green" : "text-gray-500"}`}>
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayPosts.slice(0, 3).map((p) => {
                      const plat = Array.isArray(p.platforms) ? p.platforms[0] : "facebook";
                      const platInfo = PLATFORMS.find((pl) => pl.id === plat);
                      return (
                        <div
                          key={p.id}
                          className={`w-2.5 h-2.5 rounded-full ${platInfo?.color || "bg-gray-300"} cursor-pointer`}
                          title={`${plat}: ${p.content.substring(0, 50)}...`}
                          onClick={() => openEdit(p)}
                        />
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <span className="text-[0.6rem] text-gray-400">+{dayPosts.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TIMELINE VIEW ─── */}
      {view === "timeline" && (
        <div className="space-y-6">
          {(() => {
            // Group by date
            const grouped: Record<string, SocialPost[]> = {};
            filtered.forEach((p) => {
              const d = p.scheduledFor || p.createdAt;
              const key = new Date(d).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(p);
            });

            const entries = Object.entries(grouped);
            if (entries.length === 0) {
              return (
                <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No posts in timeline.</p>
                </div>
              );
            }

            return entries.map(([date, dayPosts]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green shrink-0" />
                  <h3 className="font-display text-[0.9rem] text-tobacco">{date}</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="ml-6 space-y-2">
                  {dayPosts.map((post) => {
                    const platArr = Array.isArray(post.platforms) ? post.platforms : [];
                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-lg border border-[#ece6d9] p-3 flex items-center gap-3"
                      >
                        <div className="flex gap-1">
                          {platArr.map((pl) => (
                            <PlatformBadge key={pl} id={pl} />
                          ))}
                        </div>
                        <p className="text-[0.82rem] text-tobacco truncate flex-1">
                          {post.content.substring(0, 80)}...
                        </p>
                        <span
                          className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            STATUS_COLORS[post.status] || STATUS_COLORS.DRAFT
                          }`}
                        >
                          {post.status}
                        </span>
                        <button
                          onClick={() => openEdit(post)}
                          className="text-teal text-[0.78rem] shrink-0 hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ═══ GENERATE MODAL ═══ */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={() => setShowGenerate(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Generate Social Post
              </h3>
              <button onClick={() => setShowGenerate(false)} className="text-gray-400 hover:text-tobacco text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Platform */}
              <div>
                <label className={labelClass}>Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setGenPlatform(p.id)}
                      className={`px-3 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors ${
                        genPlatform === p.id
                          ? `${p.bgLight} ${p.textColor} border-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content type */}
              <div>
                <label className={labelClass}>Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setGenType(ct.id)}
                      className={`px-3 py-2 rounded-lg text-[0.82rem] border transition-colors ${
                        genType === ct.id
                          ? "bg-green/10 text-green border-green/30"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {ct.emoji} {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic (optional) */}
              <div>
                <label className={labelClass}>Topic (optional — AI will choose if blank)</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Spring cleaning tips for Florida homeowners"
                />
              </div>

              {/* Tone */}
              <div>
                <label className={labelClass}>Tone</label>
                <select
                  value={genTone}
                  onChange={(e) => setGenTone(e.target.value)}
                  className={inputClass}
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 text-[0.85rem] font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with DeepSeek AI
                  </>
                )}
              </button>

              {genError && (
                <p className="text-red-500 text-[0.82rem] bg-red-50 rounded-lg p-3">{genError}</p>
              )}

              {generating && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <p className="text-purple-600 text-[0.8rem]">
                    AI is crafting your social media post... This may take 10-20 seconds.
                  </p>
                </div>
              )}

              {/* Preview */}
              {genPreview && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="font-display text-[0.9rem]">Preview</h4>

                  {/* English */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-[0.68rem] uppercase tracking-wider text-gray-400 mb-2">English</div>
                    <p className="text-[0.85rem] text-tobacco whitespace-pre-wrap">{genPreview.content}</p>
                    {genPreview.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {genPreview.hashtags.map((h) => (
                          <span key={h} className="text-[0.72rem] text-blue-500">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Spanish */}
                  {genPreview.contentEs && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-[0.68rem] uppercase tracking-wider text-gray-400 mb-2">Spanish</div>
                      <p className="text-[0.85rem] text-tobacco whitespace-pre-wrap">{genPreview.contentEs}</p>
                    </div>
                  )}

                  {/* Image prompt */}
                  {genPreview.imagePrompt && (
                    <div className="bg-amber/5 rounded-lg p-3">
                      <div className="text-[0.68rem] uppercase tracking-wider text-amber mb-1">Image Suggestion</div>
                      <p className="text-[0.78rem] text-tobacco/80">{genPreview.imagePrompt}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {genPreview.callToAction && (
                    <div className="text-[0.78rem] text-green flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      {genPreview.callToAction}
                    </div>
                  )}

                  {/* Save buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveGenerated("DRAFT")}
                      disabled={saving}
                      className="flex-1 bg-gray-100 text-tobacco px-4 py-2.5 text-[0.85rem] font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save as Draft"}
                    </button>
                    <button
                      onClick={() => handleSaveGenerated("SCHEDULED")}
                      disabled={saving}
                      className="flex-1 bg-green text-white px-4 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save & Schedule"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={() => setEditPost(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display text-lg">Edit Post</h3>
              <button onClick={() => setEditPost(null)} className="text-gray-400 hover:text-tobacco text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Platforms */}
              <div>
                <label className={labelClass}>Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        setEditPlatforms((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((x) => x !== p.id)
                            : [...prev, p.id]
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors ${
                        editPlatforms.includes(p.id)
                          ? `${p.bgLight} ${p.textColor} border-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content type */}
              <div>
                <label className={labelClass}>Content Type</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)} className={inputClass}>
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>{ct.emoji} {ct.label}</option>
                  ))}
                </select>
              </div>

              {/* English content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${labelClass} mb-0`}>Content (English)</label>
                  <span className="text-[0.7rem] text-gray-400">{editContent.length} chars</span>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className={inputClass}
                />
              </div>

              {/* Spanish content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${labelClass} mb-0`}>Content (Spanish)</label>
                  <span className="text-[0.7rem] text-gray-400">{editContentEs.length} chars</span>
                </div>
                <textarea
                  value={editContentEs}
                  onChange={(e) => setEditContentEs(e.target.value)}
                  rows={4}
                  className={inputClass}
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className={labelClass}>Hashtags (comma-separated)</label>
                <input
                  type="text"
                  value={editHashtags}
                  onChange={(e) => setEditHashtags(e.target.value)}
                  className={inputClass}
                  placeholder="#cleaning, #homecleaning, #miami"
                />
              </div>

              {/* CTA */}
              <div>
                <label className={labelClass}>Call to Action</label>
                <input
                  type="text"
                  value={editCallToAction}
                  onChange={(e) => setEditCallToAction(e.target.value)}
                  className={inputClass}
                  placeholder="Book at havanacleaning.com/book"
                />
              </div>

              {/* Image prompt */}
              <div>
                <label className={labelClass}>Image Suggestion</label>
                <textarea
                  value={editImagePrompt}
                  onChange={(e) => setEditImagePrompt(e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder="AI-suggested image description..."
                />
              </div>

              {/* Status + Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputClass}>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Schedule For</label>
                  <input
                    type="datetime-local"
                    value={editSchedule}
                    onChange={(e) => setEditSchedule(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="flex gap-2">
                {editPost.status !== "PUBLISHED" &&
                  (Array.isArray(editPost.platforms) ? editPost.platforms : []).map((pl) => (
                    <button
                      key={pl}
                      onClick={() => handlePublish(editPost, pl)}
                      disabled={publishing === editPost.id}
                      className="flex items-center gap-1 text-[0.78rem] text-green hover:underline disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish to {PLATFORMS.find((p) => p.id === pl)?.label || pl}
                    </button>
                  ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditPost(null)}
                  className="px-5 py-2.5 text-[0.85rem] text-gray-500 hover:text-tobacco"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BATCH GENERATE MODAL ═══ */}
      {showBatch && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={() => setShowBatch(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green" />
                Generate Weekly Content
              </h3>
              <button onClick={() => setShowBatch(false)} className="text-gray-400 hover:text-tobacco text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[0.85rem] text-gray-500">
                AI will generate multiple posts with rotating content types, scheduled for the coming days.
              </p>

              <div>
                <label className={labelClass}>Number of Posts</label>
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={3}>3 posts (3 days)</option>
                  <option value={5}>5 posts (5 days)</option>
                  <option value={7}>7 posts (1 week)</option>
                  <option value={14}>14 posts (2 weeks)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        setBatchPlatforms((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((x) => x !== p.id)
                            : [...prev, p.id]
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors ${
                        batchPlatforms.includes(p.id)
                          ? `${p.bgLight} ${p.textColor} border-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBatchGenerate}
                disabled={batchGenerating || batchPlatforms.length === 0}
                className="w-full bg-green text-white px-6 py-3 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {batchGenerating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating {batchCount} posts... (this takes a while)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {batchCount} Posts
                  </>
                )}
              </button>

              {batchResult && (
                <div className={`rounded-lg p-3 text-[0.82rem] ${
                  batchResult.includes("failed") || batchResult.includes("error")
                    ? "bg-red-50 text-red-600"
                    : "bg-green/10 text-green"
                }`}>
                  {batchResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
