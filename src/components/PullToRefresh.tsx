"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const THRESHOLD = 80;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling || refreshing) return;
      const distance = Math.max(0, e.touches[0].clientY - startY.current);
      // Dampen the pull distance
      setPullDistance(Math.min(distance * 0.5, 120));
    },
    [pulling, refreshing]
  );

  const handleTouchEnd = useCallback(() => {
    if (!pulling) return;
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(50);
      router.refresh();
      // Reset after a short delay
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
        setPulling(false);
      }, 1000);
    } else {
      setPullDistance(0);
      setPulling(false);
    }
  }, [pulling, pullDistance, refreshing, router]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center z-10 transition-transform"
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: Math.min(pullDistance / THRESHOLD, 1),
        }}
      >
        <div
          className={`w-8 h-8 border-2 border-tobacco/20 border-t-green rounded-full ${
            refreshing ? "animate-spin" : ""
          }`}
          style={{
            transform: refreshing
              ? undefined
              : `rotate(${(pullDistance / THRESHOLD) * 360}deg)`,
          }}
        />
      </div>

      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
