"use client";

import { X, MapPin, Clock, User, Phone, Calendar } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatStatus } from "@/lib/utils";
import Link from "next/link";

interface BookingItem {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number | null;
  status: string;
  service: { name: string; icon: string | null };
  customer: { name: string; phone: string | null };
  address: { street: string; city: string } | null;
  assignments: { employee: { id: string; name: string } }[];
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

export function BookingDetailModal({
  booking,
  onClose,
}: {
  booking: BookingItem;
  onClose: () => void;
}) {
  const dateStr = new Date(booking.scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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
            <div>
              <div className="text-[0.88rem]">{dateStr}</div>
              <div className="text-gray-400 text-[0.78rem] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {TIME_LABELS[booking.scheduledTime] || booking.scheduledTime}
              </div>
              {booking.estimatedHours && (
                <div className="text-gray-400 text-[0.72rem] mt-0.5">~{booking.estimatedHours}h estimated</div>
              )}
            </div>
          </div>

          {/* Address */}
          {booking.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-[0.88rem]">
                {booking.address.street}, {booking.address.city}
              </div>
            </div>
          )}

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
            href={`/admin/bookings/${booking.id}`}
            className="block w-full bg-green text-white text-center py-2.5 rounded-lg text-[0.85rem] font-semibold hover:bg-green/90 transition-colors"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
