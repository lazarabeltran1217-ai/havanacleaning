"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, User, Tag, Clock } from "lucide-react";

type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string | null;
  status: string;
  isRead: boolean;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS = ["NEW", "OPEN", "RESOLVED", "CLOSED"] as const;

const statusColor: Record<string, string> = {
  NEW: "bg-amber/15 text-amber",
  OPEN: "bg-teal/15 text-teal",
  RESOLVED: "bg-green/15 text-green",
  CLOSED: "bg-sand/30 text-sand",
};

const categoryLabel: Record<string, string> = {
  booking: "Booking",
  payment: "Payment",
  account: "Account",
  general: "General",
};

export function SupportDetail({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [adminNote, setAdminNote] = useState(ticket.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (newStatus?: string) => {
    setSaving(true);
    try {
      await fetch(`/api/support/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus || status,
          adminNote,
        }),
      });
      if (newStatus) setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/support"
          prefetch={false}
          className="text-tobacco/60 hover:text-tobacco transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="font-display text-xl">{ticket.subject}</h2>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[0.72rem] font-medium ${statusColor[status] || ""}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-[#ece6d9] p-5 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[0.85rem]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sand" />
            <span className="text-tobacco/60">Name:</span>
            <span className="font-medium">{ticket.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sand" />
            <span className="text-tobacco/60">Email:</span>
            <a href={`mailto:${ticket.email}`} className="font-medium text-green hover:underline">
              {ticket.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-sand" />
            <span className="text-tobacco/60">Category:</span>
            <span className="font-medium">{ticket.category ? categoryLabel[ticket.category] || ticket.category : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sand" />
            <span className="text-tobacco/60">Received:</span>
            <span className="font-medium">{new Date(ticket.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" })}</span>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="bg-white rounded-xl border border-[#ece6d9] p-5 mb-4">
        <h3 className="text-[0.78rem] uppercase tracking-wider text-sand font-medium mb-3">Message</h3>
        <p className="text-[0.9rem] text-tobacco leading-relaxed whitespace-pre-wrap">
          {ticket.message}
        </p>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-xl border border-[#ece6d9] p-5">
        <h3 className="text-[0.78rem] uppercase tracking-wider text-sand font-medium mb-3">Admin Actions</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[0.8rem] font-medium text-tobacco mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-tobacco/15 rounded-lg px-3 py-2 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-green/30 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.8rem] font-medium text-tobacco mb-1.5">Internal Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="w-full border border-tobacco/15 rounded-lg px-3 py-2 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-green/30 resize-none"
              placeholder="Add an internal note..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleUpdate()}
              disabled={saving}
              className="bg-tobacco text-white px-5 py-2 rounded-lg text-[0.82rem] font-medium hover:bg-tobacco/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {status !== "RESOLVED" && (
              <button
                onClick={() => handleUpdate("RESOLVED")}
                disabled={saving}
                className="bg-green text-white px-5 py-2 rounded-lg text-[0.82rem] font-medium hover:bg-green/90 transition-colors disabled:opacity-50"
              >
                Mark Resolved
              </button>
            )}
            {status !== "CLOSED" && (
              <button
                onClick={() => handleUpdate("CLOSED")}
                disabled={saving}
                className="bg-sand/30 text-tobacco px-5 py-2 rounded-lg text-[0.82rem] font-medium hover:bg-sand/40 transition-colors disabled:opacity-50"
              >
                Close Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
