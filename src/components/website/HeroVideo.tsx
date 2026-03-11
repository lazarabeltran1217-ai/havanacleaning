"use client";

import { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection;
    if (connection?.saveData) {
      setIsMobile(true);
    }
  }, []);

  // Try to play video after it loads (some browsers need explicit play call)
  useEffect(() => {
    if (videoRef.current && !isMobile && videoUrl && !videoError) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — not an error, video will show but not play
      });
    }
  }, [videoUrl, isMobile, videoError]);

  if (!videoUrl) return null;

  // Mobile or error: show fallback image
  if (isMobile || videoError) {
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
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl}
        crossOrigin="anonymous"
        onCanPlay={() => setVideoLoaded(true)}
        onError={() => setVideoError(true)}
        src={videoUrl}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-tobacco/60" />
    </div>
  );
}
