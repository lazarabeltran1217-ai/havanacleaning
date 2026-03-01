"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConnectCompletePage() {
  const params = useSearchParams();
  const accountId = params.get("accountId");
  const [status, setStatus] = useState<"checking" | "ready" | "pending">("checking");

  useEffect(() => {
    if (!accountId) return;
    fetch(`/api/stripe/connect/status?accountId=${accountId}`)
      .then((r) => r.json())
      .then((d) => setStatus(d.onboarded ? "ready" : "pending"))
      .catch(() => setStatus("pending"));
  }, [accountId]);

  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="bg-white rounded-xl border border-[#ece6d9] p-8">
        {status === "checking" ? (
          <p className="text-gray-500">Checking account status...</p>
        ) : status === "ready" ? (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-xl mb-2">Payout Setup Complete</h2>
            <p className="text-gray-500 text-sm mb-6">
              This contractor can now receive payments via Stripe.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
              </svg>
            </div>
            <h2 className="font-display text-xl mb-2">Onboarding Incomplete</h2>
            <p className="text-gray-500 text-sm mb-6">
              The contractor still needs to finish setting up their account with Stripe.
            </p>
          </>
        )}
        <Link
          href="/admin/staff"
          className="inline-block px-6 py-2 bg-green text-white rounded-lg text-sm font-medium hover:bg-green/90"
        >
          Back to Employees
        </Link>
      </div>
    </div>
  );
}
