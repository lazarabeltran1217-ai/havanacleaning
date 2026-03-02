import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/utils";
import { ClockEditButton } from "@/components/admin/ClockEditButton";

export default async function AdminClockPage() {
  const fetchEntries = () =>
    prisma.timeEntry.findMany({
      include: {
        employee: { select: { name: true } },
        booking: { select: { bookingNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { clockIn: "desc" },
      take: 50,
    });
  let entries: Awaited<ReturnType<typeof fetchEntries>> = [];
  try {
    entries = await fetchEntries();
  } catch (error) {
    console.error("Failed to fetch time entries:", error);
  }

  // Currently clocked in
  const activeClocks = entries.filter((e) => !e.clockOut);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayEntries = entries.filter((e) => new Date(e.clockIn) >= today).length;
  const weekHours = entries
    .filter((e) => new Date(e.clockIn) >= weekAgo && e.hoursWorked)
    .reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
  const completedEntries = entries.filter((e) => e.hoursWorked);
  const avgHours = completedEntries.length > 0
    ? completedEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0) / completedEntries.length
    : 0;

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Time Clock</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Active Now</div>
          <div className="text-2xl font-display text-green">{activeClocks.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Today&apos;s Entries</div>
          <div className="text-2xl font-display text-tobacco">{todayEntries}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Hours This Week</div>
          <div className="text-2xl font-display text-tobacco">{weekHours.toFixed(1)}h</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Avg per Entry</div>
          <div className="text-2xl font-display text-tobacco">{avgHours.toFixed(1)}h</div>
        </div>
      </div>

      {/* ACTIVE CLOCKS */}
      {activeClocks.length > 0 && (
        <div className="bg-green/5 border border-green/20 rounded-xl p-5 mb-6">
          <h3 className="text-[0.82rem] font-semibold text-green uppercase tracking-wider mb-3">Currently Clocked In</h3>
          <div className="space-y-2">
            {activeClocks.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[0.85rem]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
                  <span className="font-medium">{e.employee.name}</span>
                </div>
                <span className="text-gray-500">Since {formatTime(e.clockIn)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{e.employee.name}</span>
              {!e.clockOut && <span className="text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">Active</span>}
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-gray-500">{formatDate(e.clockIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Clock In</span>
                <span>{formatTime(e.clockIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Clock Out</span>
                <span>{e.clockOut ? formatTime(e.clockOut) : <span className="text-green font-medium">Active</span>}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Hours</span>
                <span className="font-medium">{e.hoursWorked ? `${e.hoursWorked.toFixed(1)}h` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Job</span>
                <span className="text-gray-500">{e.booking ? `${e.booking.bookingNumber} — ${e.booking.service.name}` : "—"}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <ClockEditButton entry={{
                  id: e.id,
                  employeeName: e.employee.name,
                  clockIn: e.clockIn.toISOString(),
                  clockOut: e.clockOut?.toISOString() || null,
                  hoursWorked: e.hoursWorked,
                  notes: e.notes,
                  bookingId: e.bookingId,
                }} />
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No time entries yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Employee</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Clock In</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Clock Out</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Hours</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Job</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{e.employee.name}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(e.clockIn)}</td>
                <td className="px-4 py-3">{formatTime(e.clockIn)}</td>
                <td className="px-4 py-3">{e.clockOut ? formatTime(e.clockOut) : <span className="text-green font-medium">Active</span>}</td>
                <td className="px-4 py-3 font-medium">{e.hoursWorked ? `${e.hoursWorked.toFixed(1)}h` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {e.booking ? `${e.booking.bookingNumber} — ${e.booking.service.name}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <ClockEditButton entry={{
                    id: e.id,
                    employeeName: e.employee.name,
                    clockIn: e.clockIn.toISOString(),
                    clockOut: e.clockOut?.toISOString() || null,
                    hoursWorked: e.hoursWorked,
                    notes: e.notes,
                    bookingId: e.bookingId,
                  }} />
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No time entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
