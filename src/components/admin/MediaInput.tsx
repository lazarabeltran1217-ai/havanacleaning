"use client";

import { useState } from "react";

interface MediaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPosterResolved?: (posterUrl: string) => void;
  type?: "image" | "video";
  helpText?: string;
}

function isPexelsUrl(url: string): boolean {
  return url.includes("pexels.com/download/video/") ||
    (url.includes("pexels.com/video/") && !url.includes("video-files"));
}

function getUrlWarning(url: string, type: string): string | null {
  if (!url) return null;
  if (type === "video" && (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com"))) {
    return "Streaming URLs (YouTube, Vimeo) won't work here. Use a Pexels video URL instead.";
  }
  if (type === "image" && url.includes("pexels.com/photo/") && !url.includes("images.pexels.com")) {
    return "This is a Pexels photo page, not a direct image URL. Right-click the image on Pexels and select \"Copy image address\".";
  }
  return null;
}

export function MediaInput({ label, value, onChange, onPosterResolved, type = "image", helpText }: MediaInputProps) {
  const [previewError, setPreviewError] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const urlWarning = getUrlWarning(value, type);
  const showResolve = type === "video" && value && isPexelsUrl(value);

  async function handleResolve() {
    setResolving(true);
    setResolveError("");
    try {
      const res = await fetch("/api/resolve-pexels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResolveError(data.error || "Failed to resolve URL");
        return;
      }
      onChange(data.videoUrl);
      if (data.posterUrl && onPosterResolved) {
        onPosterResolved(data.posterUrl);
      }
      setPreviewError(false);
    } catch {
      setResolveError("Network error. Check your connection.");
    } finally {
      setResolving(false);
    }
  }

  return (
    <div>
      <label className="block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      {helpText && (
        <p className="text-gray-400 text-[0.72rem] mb-1.5">{helpText}</p>
      )}
      <div className={showResolve ? "flex gap-2" : ""}>
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewError(false);
            setResolveError("");
          }}
          className={`${showResolve ? "flex-1" : "w-full"} border rounded-lg px-3 py-2.5 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold ${
            urlWarning ? "border-amber-400" : "border-gray-200"
          }`}
          placeholder={
            type === "video"
              ? "https://www.pexels.com/download/video/..."
              : "https://images.pexels.com/photos/..."
          }
        />
        {showResolve && (
          <button
            type="button"
            onClick={handleResolve}
            disabled={resolving}
            className="bg-green text-white px-4 py-2.5 rounded-lg text-[0.82rem] font-semibold hover:bg-green/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {resolving ? "Resolving..." : "Get Video"}
          </button>
        )}
      </div>
      {showResolve && !resolveError && (
        <p className="text-blue-600 text-[0.72rem] mt-1">
          Click &quot;Get Video&quot; to convert this Pexels URL to a direct video link.
        </p>
      )}
      {resolveError && (
        <p className="text-red-500 text-[0.72rem] mt-1">{resolveError}</p>
      )}
      {urlWarning && (
        <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-amber-700 text-[0.72rem] leading-relaxed">{urlWarning}</p>
        </div>
      )}
      {value && !previewError && !urlWarning && !showResolve && (
        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          {type === "video" ? (
            <video
              src={value}
              muted
              autoPlay
              loop
              playsInline
              className="w-full max-h-36 object-cover"
              onError={() => setPreviewError(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Preview"
              className="w-full max-h-36 object-cover"
              onError={() => setPreviewError(true)}
            />
          )}
        </div>
      )}
      {previewError && !urlWarning && !showResolve && (
        <p className="text-red-400 text-[0.72rem] mt-1">
          Could not load preview. Make sure this is a direct file URL (not a page link).
        </p>
      )}
    </div>
  );
}
