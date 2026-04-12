import { prisma } from "@/lib/prisma";
import { SupportTable } from "@/components/admin/SupportTable";

export default async function AdminSupportPage() {
  const fetchTickets = () =>
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

  let tickets: Awaited<ReturnType<typeof fetchTickets>> = [];
  try {
    tickets = await fetchTickets();
  } catch (error) {
    console.error("Failed to fetch support tickets:", error);
  }

  const total = tickets.length;
  const unread = tickets.filter((t) => !t.isRead).length;
  const open = tickets.filter((t) => t.status === "OPEN").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length;

  const serialized = tickets.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    subject: t.subject,
    message: t.message,
    category: t.category,
    status: t.status,
    isRead: t.isRead,
    adminNote: t.adminNote,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Support Tickets</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total</div>
          <div className="text-2xl font-display text-tobacco">{total}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Unread</div>
          <div className="text-2xl font-display text-amber">{unread}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Open</div>
          <div className="text-2xl font-display text-teal">{open}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Resolved</div>
          <div className="text-2xl font-display text-green">{resolved}</div>
        </div>
      </div>

      <SupportTable tickets={serialized} />
    </div>
  );
}
