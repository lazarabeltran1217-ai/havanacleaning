"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConnectRefreshPage() {
  const params = useSearchParams();
  const accountId = params.get("accountId");
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");

  useEffect(() => {
    if (!accountId) {
      setStatus("error");
      return;
    }

    fetch("/api/stripe/connect/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.url) {
          setStatus("redirecting");
          window.location.href = d.url;
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [accountId]);

  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="bg-white rounded-xl border border-[#ece6d9] p-8">
        {status === "loading" || status === "redirecting" ? (
          <p className="text-gray-500">Generating new onboarding link...</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">
              Could not generate a new onboarding link. Please try again from the employee settings.
            </p>
            <Link
              href="/admin/staff"
              className="inline-block px-6 py-2 bg-green text-white rounded-lg text-sm font-medium hover:bg-green/90"
            >
              Back to Employees
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
