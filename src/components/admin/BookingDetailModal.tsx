"use client";

import { useState } from "react";
import { X, MapPin, Clock, User, Phone, Calendar, Navigation, Pencil } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatStatus } from "@/lib/utils";
import Link from "next/link";

interface BookingItem {
  id: string;
  isHandyman?: boolean;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number | null;
  status: string;
  service: { name: string; icon: string | null };
  customer: { name: string; phone: string | null };
  address: { street: string; city: string } | null;
  assignments: { employee: { id: string; name: string; addresses?: { street: string; city: string; state: string; zipCode: string }[] } }[];
}

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 – 5 PM)",
  evening: "Evening (5 – 8 PM)",
};

const statusBadgeColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (8 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 – 5 PM)" },
  { value: "evening", label: "Evening (5 – 8 PM)" },
];

export function BookingDetailModal({
  booking,
  onClose,
  onUpdate,
}: {
  booking: BookingItem;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const currentDateVal = new Date(booking.scheduledDate).toISOString().slice(0, 10);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(currentDateVal);
  const [editTime, setEditTime] = useState(booking.scheduledTime);
  const [saving, setSaving] = useState(false);

  async function saveReschedule() {
    if (editDate === currentDateVal && editTime === booking.scheduledTime) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const url = booking.isHandyman
      ? `/api/handyman/${booking.id}`
      : `/api/bookings/${booking.id}`;
    const body = booking.isHandyman
      ? { preferredDate: editDate, preferredTime: editTime }
      : { scheduledDate: editDate, scheduledTime: editTime };
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setEditing(false);
    onUpdate?.();
  }

  const dateStr = new Date(booking.scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ServiceIcon emoji={booking.service.icon} className="w-6 h-6 text-green" />
            <div>
              <h3 className="font-display text-lg">{booking.service.name}</h3>
              <span className="text-gray-400 text-[0.78rem]">#{booking.bookingNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-tobacco transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="px-5 pt-4">
          <span className={`inline-block text-[0.72rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium ${statusBadgeColors[booking.status] || "bg-gray-100 text-gray-500"}`}>
            {formatStatus(booking.status)}
          </span>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[0.88rem] font-medium">{booking.customer.name}</div>
              {booking.customer.phone && (
                <div className="text-gray-400 text-[0.78rem] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {booking.customer.phone}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[0.85rem]"
                  />
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[0.85rem]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={saveReschedule}
                      disabled={saving}
                      className="flex-1 bg-green text-white py-2 rounded-lg text-[0.82rem] font-semibold hover:bg-green/90 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditDate(currentDateVal); setEditTime(booking.scheduledTime); }}
                      className="flex-1 border border-gray-200 py-2 rounded-lg text-[0.82rem] font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[0.88rem]">{dateStr}</div>
                    <div className="text-gray-400 text-[0.78rem] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {TIME_LABELS[booking.scheduledTime] || booking.scheduledTime}
                    </div>
                    {booking.estimatedHours && (
                      <div className="text-gray-400 text-[0.72rem] mt-0.5">~{booking.estimatedHours}h estimated</div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-gray-400 hover:text-green transition-colors p-1"
                    title="Edit date/time"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* From / To Addresses */}
          {(() => {
            const empAddr = booking.assignments[0]?.employee.addresses?.[0];
            const fromStr = empAddr ? `${empAddr.street}, ${empAddr.city}, ${empAddr.state} ${empAddr.zipCode}` : null;
            const toStr = booking.address ? `${booking.address.street}, ${booking.address.city}` : null;
            const mapsUrl = fromStr && toStr
              ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromStr)}&destination=${encodeURIComponent(toStr)}`
              : null;
            return (
              <>
                {fromStr && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-[0.68rem] uppercase tracking-wider">From</div>
                      <div className="text-[0.85rem]">{fromStr}</div>
                    </div>
                  </div>
                )}
                {toStr && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-green" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-[0.68rem] uppercase tracking-wider">To</div>
                      <div className="text-[0.85rem]">{toStr}</div>
                    </div>
                  </div>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.78rem] text-green font-medium hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Get Directions
                  </a>
                )}
              </>
            );
          })()}

          {/* Assigned Employees */}
          {booking.assignments.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-2">Assigned</div>
              <div className="flex flex-wrap gap-2">
                {booking.assignments.map((a) => (
                  <span key={a.employee.id} className="text-[0.78rem] bg-green/10 text-green px-2.5 py-1 rounded-full font-medium">
                    {a.employee.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Link
            href={booking.isHandyman ? `/admin/handyman/${booking.id}` : `/admin/bookings/${booking.id}`}
            className="block w-full bg-green text-white text-center py-2.5 rounded-lg text-[0.85rem] font-semibold hover:bg-green/90 transition-colors"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
