import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";
import { BookingActions } from "@/components/admin/BookingActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const { id } = await params;

  const fetchBooking = (id: string) =>
    prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        addOns: { include: { addOn: { select: { name: true } } } },
        assignments: { include: { employee: { select: { id: true, name: true } } } },
        payments: true,
      },
    });

  const fetchEmployees = () =>
    prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

  let booking: Awaited<ReturnType<typeof fetchBooking>> = null;
  let employees: Awaited<ReturnType<typeof fetchEmployees>> = [];
  try {
    booking = await fetchBooking(id);
    if (!booking) notFound();
    employees = await fetchEmployees();
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    notFound();
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber/10 text-amber",
    CONFIRMED: "bg-green/10 text-green",
    IN_PROGRESS: "bg-teal/10 text-teal",
    COMPLETED: "bg-green/20 text-green",
    CANCELLED: "bg-red/10 text-red",
    NO_SHOW: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl">Booking #{booking.bookingNumber}</h2>
          <span className={`inline-block mt-1 text-[0.72rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium ${statusColors[booking.status] || ""}`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-4">Booking Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-[0.85rem]">
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Service</dt>
                <dd className="mt-1 flex items-center gap-1.5"><ServiceIcon emoji={booking.service.icon} className="w-4 h-4 text-green" /> {booking.service.name}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Date / Time</dt>
                <dd className="mt-1">{formatDate(booking.scheduledDate)} &middot; <span className="capitalize">{booking.scheduledTime}</span></dd>
              </div>
              {booking.bedrooms && (
                <div>
                  <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Home Size</dt>
                  <dd className="mt-1">{booking.bedrooms} bed / {booking.bathrooms} bath</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Recurrence</dt>
                <dd className="mt-1 capitalize">{booking.recurrence.toLowerCase()}</dd>
              </div>
            </dl>
            {booking.customerNotes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider mb-1">Customer Notes</dt>
                <dd className="text-[0.85rem]">{booking.customerNotes}</dd>
              </div>
            )}
          </div>

          {/* CUSTOMER */}
          <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-3">Customer</h3>
            <div className="text-[0.9rem] font-medium">{booking.customer.name}</div>
            <div className="text-gray-400 text-[0.82rem]">{booking.customer.email}</div>
            {booking.customer.phone && <div className="text-gray-400 text-[0.82rem]">{booking.customer.phone}</div>}
            {booking.address && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-[0.85rem]">
                {booking.address.street}{booking.address.unit && `, ${booking.address.unit}`}<br />
                {booking.address.city}, {booking.address.state} {booking.address.zipCode}
              </div>
            )}
          </div>

          {/* FINANCIALS */}
          <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-3">Financial Summary</h3>
            <div className="space-y-2 text-[0.85rem]">
              <div className="flex justify-between">
                <span className="text-gray-400">Service Base</span>
                <span>{formatCurrency(booking.subtotal - booking.addOns.reduce((s, a) => s + a.price, 0))}</span>
              </div>
              {booking.addOns.map((a) => (
                <div key={a.id} className="flex justify-between text-gray-500">
                  <span>+ {a.addOn.name}</span>
                  <span>{formatCurrency(a.price)}</span>
                </div>
              ))}
              {booking.discount > 0 && (
                <div className="flex justify-between text-green">
                  <span>Discount</span>
                  <span>-{formatCurrency(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Tax</span>
                <span>{formatCurrency(booking.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green">{formatCurrency(booking.total)}</span>
              </div>
            </div>

            {booking.payments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-[0.75rem] uppercase tracking-wider text-gray-400 mb-2">Payment History</h4>
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-[0.82rem]">
                    <span className="capitalize">{p.method.toLowerCase()} — {p.status.toLowerCase()}</span>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR ACTIONS */}
        <div>
          <BookingActions
            bookingId={booking.id}
            currentStatus={booking.status}
            assignments={booking.assignments.map((a) => ({
              employeeId: a.employee.id,
              employeeName: a.employee.name,
            }))}
            employees={employees}
          />
        </div>
      </div>
    </div>
  );
}
