"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface HeroVideoProps {
  videoUrl?: string;
  posterUrl?: string;
  fallbackImageUrl?: string;
}

export function HeroVideo({ videoUrl, posterUrl, fallbackImageUrl }: HeroVideoProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection;
    if (connection?.saveData) {
      setIsMobile(true);
    }
  }, []);

  // Mobile or error: show fallback image
  if (isMobile || !videoUrl || videoError) {
    const imgSrc = fallbackImageUrl || posterUrl;
    if (!imgSrc) return null;
    return (
      <div className="absolute inset-0 z-0">
        <Image
          src={imgSrc}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-tobacco/70" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      {!videoLoaded && posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          className="object-cover"
          priority
        />
      )}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl}
        onCanPlay={() => setVideoLoaded(true)}
        onError={() => setVideoError(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-tobacco/60" />
    </div>
  );
}
