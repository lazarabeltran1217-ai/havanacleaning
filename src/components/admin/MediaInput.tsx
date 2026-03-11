"use client";

import { useState } from "react";

interface MediaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "image" | "video";
  helpText?: string;
}

function getUrlWarning(url: string, type: string): string | null {
  if (!url) return null;
  if (type === "video") {
    if (url.includes("pexels.com/download/")) {
      return "This is a Pexels download page, not a direct video URL. Go to the video on Pexels, right-click the playing video, and select \"Copy video address\" to get a URL like: https://videos.pexels.com/video-files/...";
    }
    if (url.includes("pexels.com/video/") && !url.includes("video-files")) {
      return "This is a Pexels video page, not a direct file URL. Right-click the playing video on this page and select \"Copy video address\" to get the direct MP4 link.";
    }
    if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
      return "Streaming URLs (YouTube, Vimeo) won't work here. Use a direct .mp4 video file URL from Pexels or similar.";
    }
  }
  if (type === "image") {
    if (url.includes("pexels.com/photo/") && !url.includes("images.pexels.com")) {
      return "This is a Pexels photo page, not a direct image URL. Right-click the image on Pexels and select \"Copy image address\" to get a URL like: https://images.pexels.com/photos/...";
    }
  }
  return null;
}

export function MediaInput({ label, value, onChange, type = "image", helpText }: MediaInputProps) {
  const [previewError, setPreviewError] = useState(false);
  const urlWarning = getUrlWarning(value, type);

  return (
    <div>
      <label className="block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      {helpText && (
        <p className="text-gray-400 text-[0.72rem] mb-1.5">{helpText}</p>
      )}
      <input
        type="url"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setPreviewError(false);
        }}
        className={`w-full border rounded-lg px-3 py-2.5 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold ${
          urlWarning ? "border-amber-400" : "border-gray-200"
        }`}
        placeholder={
          type === "video"
            ? "https://videos.pexels.com/video-files/..."
            : "https://images.pexels.com/photos/..."
        }
      />
      {urlWarning && (
        <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-amber-700 text-[0.72rem] leading-relaxed">{urlWarning}</p>
        </div>
      )}
      {value && !previewError && !urlWarning && (
        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
          {type === "video" ? (
            <video
              src={value}
              muted
              autoPlay
              loop
              playsInline
              crossOrigin="anonymous"
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
      {previewError && !urlWarning && (
        <p className="text-red-400 text-[0.72rem] mt-1">
          Could not load preview. Make sure this is a direct file URL (not a page link).
        </p>
      )}
    </div>
  );
}
