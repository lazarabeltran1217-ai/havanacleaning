"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "NEW", "UNDER_REVIEW", "PHONE_SCREEN", "INTERVIEW",
  "BACKGROUND_CHECK", "HIRED", "REJECTED",
];

interface Props {
  applicationId: string;
  currentStatus: string;
  reviewNotes: string;
}

export function ApplicantActions({ applicationId, currentStatus, reviewNotes: initialNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNotes: notes }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to save");
      return;
    }

    if (data.employeeCreated) {
      setMessage(`Saved! Employee account created for ${data.employeeName}.`);
    } else {
      setMessage("Saved successfully!");
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9] sticky top-28 space-y-4">
      <h3 className="font-display text-base">Review Actions</h3>

      <div>
        <label className="block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5">Review Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Interview notes, observations..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] resize-none"
        />
      </div>

      {message && (
        <div className={`text-[0.82rem] px-3 py-2 rounded-lg ${
          message.includes("Failed") ? "bg-red/10 text-red" : "bg-green/10 text-green"
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-green text-white py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
