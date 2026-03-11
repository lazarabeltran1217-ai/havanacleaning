import { prisma } from "@/lib/prisma";
import { AddCommercialButton } from "@/components/admin/AddCommercialButton";
import { CommercialTable } from "@/components/admin/CommercialTable";

export default async function AdminCommercialPage() {
  const fetchInquiries = () =>
    prisma.commercialInquiry.findMany({
      include: { quotes: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  let inquiries: Awaited<ReturnType<typeof fetchInquiries>> = [];
  try {
    inquiries = await fetchInquiries();
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
  }

  const totalInq = inquiries.length;
  const newInq = inquiries.filter((i) => i.status === "NEW").length;
  const quoteSent = inquiries.filter((i) => i.status === "QUOTE_SENT").length;
  const wonCount = inquiries.filter((i) => i.status === "WON").length;

  const serialized = inquiries.map((inq) => ({
    id: inq.id,
    companyName: inq.companyName,
    contactName: inq.contactName,
    contactEmail: inq.contactEmail,
    industry: inq.industry,
    squareFootage: inq.squareFootage,
    budgetRange: inq.budgetRange,
    status: inq.status,
    spamScore: inq.spamScore,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Commercial Inquiries</h2>
        <AddCommercialButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Inquiries</div>
          <div className="text-2xl font-display text-tobacco">{totalInq}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">New</div>
          <div className="text-2xl font-display text-amber">{newInq}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Quote Sent</div>
          <div className="text-2xl font-display text-teal">{quoteSent}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Won</div>
          <div className="text-2xl font-display text-green">{wonCount}</div>
        </div>
      </div>

      <CommercialTable inquiries={serialized} />
    </div>
  );
}
