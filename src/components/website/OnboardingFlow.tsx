"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const ONBOARDED_KEY = "havana_onboarded";

const slides = [
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Welcome to\nHavana Cleaning",
    desc: "Professional, family-owned cleaning service bringing warmth and care to every home we touch.",
  },
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Book in\nJust Minutes",
    desc: "Choose your service, pick a date, and get instant pricing. No phone calls needed.",
  },
  {
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Track &\nManage",
    desc: "View upcoming bookings, manage payments, and stay updated with your cleaning schedule.",
  },
];

export function OnboardingFlow() {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    // Only show on mobile-sized screens for first-time visitors
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!onboarded && isMobile) {
      setShow(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    localStorage.setItem(ONBOARDED_KEY, "true");
    setTimeout(() => setShow(false), 300);
  }, []);

  const next = useCallback(() => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      dismiss();
    }
  }, [current, dismiss]);

  const getStarted = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    setExiting(true);
    setTimeout(() => {
      setShow(false);
      router.push("/register");
    }, 300);
  }, [router]);

  if (!show) return null;

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-tobacco flex flex-col transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Skip */}
      <div className="relative z-10 flex justify-end p-6 pt-14">
        <button
          onClick={dismiss}
          className="text-sand/60 text-sm font-medium hover:text-sand transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-gold mb-8">{slide.icon}</div>
        <h2 className="font-display text-3xl font-bold text-amber whitespace-pre-line leading-tight mb-4">
          {slide.title}
        </h2>
        <p className="text-sand/70 text-base max-w-xs">{slide.desc}</p>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-8 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-gold"
                  : "w-2 bg-sand/30"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={getStarted}
            className="w-full bg-gold text-tobacco py-4 rounded-xl font-semibold text-base hover:bg-amber transition-colors"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={next}
            className="w-full bg-gold text-tobacco py-4 rounded-xl font-semibold text-base hover:bg-amber transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
