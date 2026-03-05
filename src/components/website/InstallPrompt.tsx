"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "havana_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't show if already dismissed or already installed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone);

    if (isStandalone) return;

    // Android/Chrome: intercept beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari detection
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
        setVisible(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm animate-in slide-in-from-bottom-4">
      <div className="bg-white border border-tobacco/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-tobacco flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 500 500" fill="currentColor">
              <path d="M236.38,125.98c0,0-41.82,165.77,0,362.2h45.82c0,0-64.41-156.52-20.81-362.2H236.38z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-tobacco text-sm">
              Add Havana Cleaning
            </p>
            {showIOSPrompt ? (
              <p className="text-tobacco/60 text-xs mt-1">
                Tap the share button, then &quot;Add to Home Screen&quot; for
                the best experience.
              </p>
            ) : (
              <p className="text-tobacco/60 text-xs mt-1">
                Install our app for quick access to bookings and your account.
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-tobacco/30 hover:text-tobacco/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showIOSPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 bg-gold text-tobacco py-2.5 rounded-xl text-sm font-semibold hover:bg-amber transition-colors"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
