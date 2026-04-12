import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupportDetail } from "@/components/admin/SupportDetail";

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) notFound();

  // Mark as read on page load
  if (!ticket.isRead) {
    await prisma.supportTicket.update({
      where: { id },
      data: { isRead: true },
    });
  }

  const serialized = {
    id: ticket.id,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    message: ticket.message,
    category: ticket.category,
    status: ticket.status,
    isRead: true,
    adminNote: ticket.adminNote,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };

  return (
    <div>
      <SupportDetail ticket={serialized} />
    </div>
  );
}
