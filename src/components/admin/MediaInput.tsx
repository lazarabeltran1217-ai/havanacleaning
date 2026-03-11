"use client";

import { useState } from "react";

interface MediaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "image" | "video";
  helpText?: string;
}

export function MediaInput({ label, value, onChange, type = "image", helpText }: MediaInputProps) {
  const [previewError, setPreviewError] = useState(false);

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
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
        placeholder={
          type === "video"
            ? "https://videos.pexels.com/..."
            : "https://images.pexels.com/..."
        }
      />
      {value && !previewError && (
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
      {previewError && (
        <p className="text-red-400 text-[0.72rem] mt-1">
          Could not load preview. Check the URL.
        </p>
      )}
    </div>
  );
}
