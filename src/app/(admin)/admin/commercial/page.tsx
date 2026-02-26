import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { AddCommercialButton } from "@/components/admin/AddCommercialButton";

export default async function AdminCommercialPage() {
  const inquiries = await prisma.commercialInquiry.findMany({
    include: { quotes: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-amber/10 text-amber",
    CONTACTED: "bg-teal/10 text-teal",
    QUOTE_SENT: "bg-blue-50 text-blue-600",
    NEGOTIATING: "bg-purple-50 text-purple-600",
    WON: "bg-green/20 text-green",
    LOST: "bg-red/10 text-red",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Commercial Inquiries</h2>
        <AddCommercialButton />
      </div>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.85rem] min-w-[750px]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Company</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Contact</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Industry</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Sq Ft</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Budget</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Received</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{inq.companyName}</td>
                <td className="px-4 py-3">
                  <div>{inq.contactName}</div>
                  <div className="text-gray-400 text-[0.78rem]">{inq.contactEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{inq.industry || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{inq.squareFootage || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{inq.budgetRange || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(inq.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[inq.status] || ""}`}>
                    {inq.status.replace(/_/g, " ")}
                  </span>
                  {inq.spamScore > 2 && (
                    <span className="ml-1 text-[0.65rem] text-red">⚠ Spam?</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/commercial/${inq.id}`} className="text-green text-[0.78rem] hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No commercial inquiries yet.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
