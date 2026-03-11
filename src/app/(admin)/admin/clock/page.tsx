import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/utils";
import { ClockTable } from "@/components/admin/ClockTable";

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

  const serialized = entries.map((e) => ({
    id: e.id,
    clockIn: e.clockIn.toISOString(),
    clockOut: e.clockOut?.toISOString() ?? null,
    hoursWorked: e.hoursWorked,
    notes: e.notes,
    bookingId: e.bookingId,
    employeeName: e.employee.name ?? "",
    jobInfo: e.booking ? `${e.booking.bookingNumber} \u2014 ${e.booking.service.name}` : null,
  }));

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

      <ClockTable entries={serialized} />
    </div>
  );
}
