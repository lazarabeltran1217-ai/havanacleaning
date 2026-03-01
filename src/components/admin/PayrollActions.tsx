"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayrollActions() {
  const router = useRouter();
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  // Default to current bi-weekly period
  const setDefaultPeriod = () => {
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(start.getDate() - 13); // 14-day period
    setPeriodStart(start.toISOString().split("T")[0]);
    setPeriodEnd(end.toISOString().split("T")[0]);
  };

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) return;
    setGenerating(true);
    setResult("");
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodStart, periodEnd }),
    });
    const data = await res.json();
    setGenerating(false);
    if (res.ok) {
      setResult(data.message);
      router.refresh();
    } else {
      setResult(data.error || "Failed to generate");
    }
  };

  return (
    <>
      <button
        onClick={() => { setShowGenerate(true); setDefaultPeriod(); }}
        className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
      >
        Generate Payroll
      </button>

      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowGenerate(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-2">Generate Payroll</h3>
            <p className="text-gray-400 text-sm mb-4">
              Auto-calculate pay from employee time entries for the selected period.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Period Start</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Period End</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            {result && (
              <p className={`mt-3 text-sm ${result.includes("Failed") ? "text-red" : "text-green"}`}>
                {result}
              </p>
            )}
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowGenerate(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">
                Close
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !periodStart || !periodEnd}
                className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface PayrollButtonProps {
  id: string;
  status: string;
  netPay: number;
  stripeConnectOnboarded?: boolean;
  paidVia?: string | null;
}

export function PayrollStatusButtonClient({ id, status, netPay, stripeConnectOnboarded, paidVia }: PayrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // PAID — show payment method badge
  if (status === "PAID") {
    if (paidVia === "STRIPE_CONNECT") {
      return <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-teal/10 text-teal">Stripe</span>;
    }
    return null;
  }

  // DRAFT → Approve
  if (status === "DRAFT") {
    const handleApprove = async () => {
      setLoading(true);
      await fetch(`/api/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      setLoading(false);
      router.refresh();
    };

    return (
      <button
        onClick={handleApprove}
        disabled={loading}
        className="text-teal text-[0.78rem] font-medium hover:underline disabled:opacity-50"
      >
        {loading ? "..." : "Approve"}
      </button>
    );
  }

  // APPROVED — Pay via Stripe or Mark Paid manually
  const handleStripePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/payroll/${id}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Transfer failed");
        return;
      }
    } catch {
      setError("Transfer failed");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    await fetch(`/api/payroll/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID", paidVia: "MANUAL" }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {stripeConnectOnboarded ? (
        <button
          onClick={handleStripePay}
          disabled={loading}
          className="px-3 py-1 bg-green text-white text-[0.78rem] font-medium rounded-lg hover:bg-green/90 disabled:opacity-50"
        >
          {loading ? "Paying..." : `Pay $${netPay.toFixed(2)}`}
        </button>
      ) : (
        <button
          onClick={handleMarkPaid}
          disabled={loading}
          className="text-green text-[0.78rem] font-medium hover:underline disabled:opacity-50"
        >
          {loading ? "..." : "Mark Paid"}
        </button>
      )}
      {error && <span className="text-[0.72rem] text-red">{error}</span>}
    </div>
  );
}
