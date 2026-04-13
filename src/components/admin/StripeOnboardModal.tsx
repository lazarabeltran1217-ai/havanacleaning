"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ConnectComponentsProvider,
  ConnectAccountManagement,
  ConnectPayouts,
} from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { X, Loader2 } from "lucide-react";

interface Props {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export function StripeOnboardModal({ employeeId, employeeName, onClose }: Props) {
  const [tab, setTab] = useState<"payouts" | "account">("account");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stripeInstance, setStripeInstance] = useState<ReturnType<typeof loadConnectAndInitialize> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/stripe/connect/onboard-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Failed to start onboarding");
          return;
        }

        if (cancelled) return;

        const instance = loadConnectAndInitialize({
          publishableKey: data.publishableKey,
          fetchClientSecret: async () => data.clientSecret,
          appearance: {
            variables: {
              colorPrimary: "#2D6A4F",
              fontFamily: "DM Sans, sans-serif",
              borderRadius: "8px",
            },
          },
        });

        if (!cancelled) {
          setStripeInstance(instance);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setError("Failed to start onboarding");
      }
    }

    init();
    return () => { cancelled = true; };
  }, [employeeId]);

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-display text-lg">Bank Account & Payouts</h3>
            <p className="text-gray-400 text-[0.78rem]">for {employeeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          <button
            onClick={() => setTab("payouts")}
            className={`px-4 py-2.5 text-[0.85rem] font-medium border-b-2 -mb-px transition-colors ${
              tab === "payouts" ? "border-green text-green" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Payouts
          </button>
          <button
            onClick={() => setTab("account")}
            className={`px-4 py-2.5 text-[0.85rem] font-medium border-b-2 -mb-px transition-colors ${
              tab === "account" ? "border-green text-green" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red text-sm mb-2">{error}</p>
              <button onClick={onClose} className="text-green text-sm hover:underline">Close</button>
            </div>
          ) : loading || !stripeInstance ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-green animate-spin" />
              <span className="ml-2 text-gray-400 text-sm">Loading...</span>
            </div>
          ) : (
            <ConnectComponentsProvider connectInstance={stripeInstance}>
              {tab === "payouts" ? (
                <ConnectPayouts />
              ) : (
                <ConnectAccountManagement />
              )}
            </ConnectComponentsProvider>
          )}
        </div>
      </div>
    </div>
  );
}
