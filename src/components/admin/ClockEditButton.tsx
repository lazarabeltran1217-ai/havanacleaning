"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EntryData {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut: string | null;
  hoursWorked: number | null;
  notes: string | null;
  bookingId: string | null;
}

interface BookingOption {
  id: string;
  bookingNumber: string;
  service: { name: string };
}

export function ClockEditButton({ entry }: { entry: EntryData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const formatForInput = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16);
  };

  const [clockIn, setClockIn] = useState(formatForInput(entry.clockIn));
  const [clockOut, setClockOut] = useState(entry.clockOut ? formatForInput(entry.clockOut) : "");
  const [notes, setNotes] = useState(entry.notes || "");
  const [bookingId, setBookingId] = useState(entry.bookingId || "");
  const [bookings, setBookings] = useState<BookingOption[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/bookings?limit=50")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {});
  }, [open]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/clock/entry/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clockIn: new Date(clockIn).toISOString(),
        clockOut: clockOut ? new Date(clockOut).toISOString() : null,
        notes: notes || null,
        bookingId: bookingId || null,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to save");
      return;
    }

    setMessage("Saved!");
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      router.refresh();
    }, 800);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-green text-[0.78rem] hover:underline">
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-1">Edit Time Entry</h3>
            <p className="text-gray-400 text-[0.78rem] mb-4">{entry.employeeName}</p>

            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Job</label>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">No job assigned</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} — {b.service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Clock In</label>
                <input type="datetime-local" value={clockIn} onChange={(e) => setClockIn(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Clock Out</label>
                <input type="datetime-local" value={clockOut} onChange={(e) => setClockOut(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Reason for edit..." />
              </div>
            </div>

            {message && (
              <div className={`mt-3 text-[0.82rem] px-3 py-2 rounded-lg ${message.includes("Failed") ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !clockIn} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
