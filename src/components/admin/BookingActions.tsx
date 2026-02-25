"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  currentStatus: string;
  assignments: { employeeId: string; employeeName: string }[];
  employees: { id: string; name: string }[];
}

const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];

export function BookingActions({ bookingId, currentStatus, assignments, employees }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes || undefined }),
    });
    setLoading(false);
    router.refresh();
  }

  async function assignEmployee() {
    if (!selectedEmployee) return;
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: selectedEmployee }),
    });
    setLoading(false);
    setSelectedEmployee("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* STATUS UPDATE */}
      <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-3">Update Status</h3>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] mb-3"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] resize-none mb-3"
        />
        <button
          onClick={updateStatus}
          disabled={loading}
          className="w-full bg-green text-white py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* ASSIGN EMPLOYEE */}
      <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-3">Assign Employee</h3>
        {assignments.length > 0 && (
          <div className="mb-3 space-y-1">
            {assignments.map((a) => (
              <div key={a.employeeId} className="text-[0.85rem] flex items-center gap-2">
                <span className="w-2 h-2 bg-green rounded-full" />
                {a.employeeName}
              </div>
            ))}
          </div>
        )}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] mb-3"
        >
          <option value="">Select employee...</option>
          {employees
            .filter((e) => !assignments.some((a) => a.employeeId === e.id))
            .map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
        </select>
        <button
          onClick={assignEmployee}
          disabled={loading || !selectedEmployee}
          className="w-full bg-gold text-tobacco py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-amber disabled:opacity-50 transition-colors"
        >
          Assign
        </button>
      </div>
    </div>
  );
}
