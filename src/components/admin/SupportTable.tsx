"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

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
};

const STATUS_FILTERS = ["All", "Unread", "NEW", "OPEN", "RESOLVED", "CLOSED"] as const;

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function SupportTable({ tickets }: { tickets: Ticket[] }) {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = tickets.filter((t) => {
    if (filter === "Unread" && t.isRead) return false;
    if (filter !== "All" && filter !== "Unread" && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#ece6d9] flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${
                filter === f
                  ? "bg-tobacco text-white"
                  : "bg-tobacco/5 text-tobacco/70 hover:bg-tobacco/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-tobacco/10 rounded-lg text-[0.82rem] w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-green/30"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-[#ece6d9] text-left">
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium w-8"></th>
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium">Subject</th>
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium">From</th>
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium">Category</th>
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-sand font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sand text-[0.85rem]">
                  No tickets found
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/support/${t.id}`}
                  prefetch={false}
                  className={`table-row border-b border-[#ece6d9]/50 hover:bg-ivory/50 transition-colors cursor-pointer ${
                    !t.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    {!t.isRead && (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}
                  </td>
                  <td className={`px-4 py-3 ${!t.isRead ? "font-bold text-tobacco" : "text-tobacco/80"}`}>
                    {t.subject}
                  </td>
                  <td className={`px-4 py-3 ${!t.isRead ? "font-semibold" : "text-tobacco/70"}`}>
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-tobacco/60">
                    {t.category ? categoryLabel[t.category] || t.category : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[0.72rem] font-medium ${statusColor[t.status] || ""}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-tobacco/60">
                    {timeAgo(t.createdAt)}
                  </td>
                </Link>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-[#ece6d9]/50">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sand text-[0.85rem]">No tickets found</div>
        ) : (
          filtered.map((t) => (
            <Link
              key={t.id}
              href={`/admin/support/${t.id}`}
              prefetch={false}
              className={`block p-4 hover:bg-ivory/50 transition-colors ${!t.isRead ? "bg-blue-50/40" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {!t.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  <span className={`text-[0.85rem] ${!t.isRead ? "font-bold" : ""}`}>{t.subject}</span>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[0.68rem] font-medium ${statusColor[t.status] || ""}`}>
                  {t.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[0.78rem] text-tobacco/60">
                <span>{t.name}</span>
                <span>{timeAgo(t.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
