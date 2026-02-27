"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatDate, formatStatus } from "@/lib/utils";

interface Job {
  id: string;
  booking: {
    bookingNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
    customerNotes: string | null;
    service: { name: string; icon: string | null };
    customer: { name: string; phone: string | null };
    address: { street: string; unit: string | null; city: string; state: string; zipCode: string } | null;
  };
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/jobs")
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green/10 text-green",
    IN_PROGRESS: "bg-teal/10 text-teal",
    COMPLETED: "bg-green/20 text-green",
    PENDING: "bg-amber/10 text-amber",
  };

  if (loading) return <p className="text-gray-400 text-sm text-center py-8">Loading jobs...</p>;

  return (
    <div>
      <h2 className="font-display text-xl text-tobacco mb-4">My Jobs</h2>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No jobs assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-1.5">
                  <ServiceIcon emoji={j.booking.service.icon} className="w-4 h-4 text-green" />
                  {j.booking.service.name}
                </span>
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[j.booking.status] || "bg-gray-100 text-gray-500"}`}>
                  {formatStatus(j.booking.status)}
                </span>
              </div>

              <div className="text-gray-500 text-[0.82rem] space-y-1">
                <div>{formatDate(j.booking.scheduledDate)} &middot; <span className="capitalize">{j.booking.scheduledTime}</span></div>
                <div>Client: {j.booking.customer.name}{j.booking.customer.phone && ` — ${j.booking.customer.phone}`}</div>
                {j.booking.address && (
                  <div>
                    {j.booking.address.street}{j.booking.address.unit && ` ${j.booking.address.unit}`}, {j.booking.address.city}, {j.booking.address.state} {j.booking.address.zipCode}
                  </div>
                )}
                {j.booking.customerNotes && (
                  <div className="mt-2 bg-ivory rounded-lg px-3 py-2 text-[0.8rem]">
                    <span className="font-medium">Notes:</span> {j.booking.customerNotes}
                  </div>
                )}
              </div>

              {j.booking.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${j.booking.address.street}, ${j.booking.address.city}, ${j.booking.address.state} ${j.booking.address.zipCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block bg-teal text-white px-4 py-2 rounded-lg text-[0.8rem] font-semibold"
                >
                  Open in Maps
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
