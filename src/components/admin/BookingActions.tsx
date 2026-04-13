"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  currentStatus: string;
  currentDate: string;
  currentTime: string;
  assignments: { employeeId: string; employeeName: string }[];
  employees: { id: string; name: string }[];
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  customerCanEdit?: boolean;
}

const STATUSES: { value: string; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (8 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 – 5 PM)" },
  { value: "evening", label: "Evening (5 – 8 PM)" },
];

export function BookingActions({ bookingId, currentStatus, currentDate, currentTime, assignments, employees, adminReply: existingReply, adminRepliedAt, customerCanEdit }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(currentDate);
  const [rescheduleTime, setRescheduleTime] = useState(currentTime);
  const [rescheduleSaving, setRescheduleSaving] = useState(false);

  async function sendReply() {
    if (!replyText.trim()) return;
    setReplySending(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminReply: replyText.trim() }),
    });
    setReplySending(false);
    setReplyText("");
    router.refresh();
  }

  async function reschedule() {
    if (rescheduleDate === currentDate && rescheduleTime === currentTime) return;
    setRescheduleSaving(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledDate: rescheduleDate, scheduledTime: rescheduleTime }),
    });
    setRescheduleSaving(false);
    router.refresh();
  }

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

  async function removeEmployee(employeeId: string) {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/assign`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
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
            <option key={s.value} value={s.value}>{s.label}</option>
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

      {/* RESCHEDULE */}
      <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-3">Reschedule</h3>
        <label className="block text-[0.75rem] text-gray-400 uppercase tracking-wider mb-1">Date</label>
        <input
          type="date"
          value={rescheduleDate}
          onChange={(e) => setRescheduleDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] mb-3"
        />
        <label className="block text-[0.75rem] text-gray-400 uppercase tracking-wider mb-1">Time</label>
        <select
          value={rescheduleTime}
          onChange={(e) => setRescheduleTime(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] mb-3"
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={reschedule}
          disabled={rescheduleSaving || (rescheduleDate === currentDate && rescheduleTime === currentTime)}
          className="w-full bg-amber text-white py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-amber/90 disabled:opacity-50 transition-colors"
        >
          {rescheduleSaving ? "Saving..." : "Update Schedule"}
        </button>
      </div>

      {/* ASSIGN EMPLOYEE */}
      <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-3">Assign Employee</h3>
        {assignments.length > 0 && (
          <div className="mb-3 space-y-1">
            {assignments.map((a) => (
              <div key={a.employeeId} className="text-[0.85rem] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green rounded-full" />
                  {a.employeeName}
                </div>
                <button
                  onClick={() => removeEmployee(a.employeeId)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-600 text-[0.75rem] font-medium disabled:opacity-50 transition-colors"
                >
                  Remove
                </button>
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

      {/* REPLY TO CUSTOMER */}
      <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-3">Reply to Customer</h3>
        <p className="text-gray-400 text-[0.75rem] mb-3">
          Send a message to the customer about this booking. This will enable them to edit their order.
        </p>

        {existingReply && (
          <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <div className="text-[0.72rem] text-blue-500 uppercase tracking-wider font-medium mb-1">
              Previous Reply {adminRepliedAt && `— ${new Date(adminRepliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })}`}
            </div>
            <div className="text-[0.85rem] text-blue-800">{existingReply}</div>
            {customerCanEdit && (
              <div className="text-[0.72rem] text-blue-500 mt-1">Customer can currently edit this booking</div>
            )}
          </div>
        )}

        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="e.g., We do not do dog cleaning — please adjust your booking."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem] resize-none mb-3"
        />
        <button
          onClick={sendReply}
          disabled={replySending || !replyText.trim()}
          className="w-full bg-blue-600 text-white py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {replySending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}
