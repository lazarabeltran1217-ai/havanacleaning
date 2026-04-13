import { prisma } from "@/lib/prisma";
import { Zap } from "lucide-react";
import { HandymanTable } from "@/components/admin/HandymanTable";

export default async function AdminHandymanPage() {
  const fetchInquiries = () =>
    prisma.handymanInquiry.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        payments: { select: { status: true }, where: { status: "SUCCEEDED" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

  let inquiries: Awaited<ReturnType<typeof fetchInquiries>> = [];
  let clockedInInquiryIds: string[] = [];
  try {
    inquiries = await fetchInquiries();
    const activeClocks = await prisma.timeEntry.findMany({
      where: { clockOut: null, handymanInquiryId: { not: null } },
      select: { handymanInquiryId: true },
    });
    clockedInInquiryIds = activeClocks.map((c) => c.handymanInquiryId!);
  } catch (error) {
    console.error("Failed to fetch handyman inquiries:", error);
  }

  const total = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "PENDING").length;
  const confirmedCount = inquiries.filter((i) => i.status === "CONFIRMED").length;
  const rushCount = inquiries.filter((i) => i.rush).length;

  const serialized = inquiries.map((inq) => {
    const price = inq.quotedPrice ?? inq.estimatedTotal ?? null;
    return {
      id: inq.id,
      bookingNumber: inq.bookingNumber,
      status: inq.status,
      rush: inq.rush,
      preferredDate: inq.preferredDate?.toISOString() ?? null,
      preferredTime: inq.preferredTime,
      address: inq.address,
      projectDescription: inq.projectDescription,
      quotedPrice: inq.quotedPrice,
      estimatedTotal: inq.estimatedTotal,
      serviceCategories: (Array.isArray(inq.serviceCategories) ? inq.serviceCategories : []) as string[],
      customerName: inq.user?.name || inq.fullName,
      customerEmail: inq.user?.email || inq.email,
      customerPhone: inq.user?.phone || inq.phone,
      isPaid: inq.payments.length > 0,
      isClockedIn: clockedInInquiryIds.includes(inq.id),
      price,
    };
  });

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Handyman Bookings</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Inquiries</div>
          <div className="text-2xl font-display text-tobacco">{total}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Pending</div>
          <div className="text-2xl font-display text-amber">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Confirmed</div>
          <div className="text-2xl font-display text-green">{confirmedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Rush</div>
          <div className="text-2xl font-display text-amber flex items-center gap-1">
            <Zap className="w-5 h-5" /> {rushCount}
          </div>
        </div>
      </div>

      <HandymanTable inquiries={serialized} />
    </div>
  );
}
