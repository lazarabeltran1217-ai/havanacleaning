import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";
import { BookingActions } from "@/components/admin/BookingActions";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";

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

  // Fetch first assigned employee's home address
  const firstAssignedId = booking.assignments[0]?.employee.id;
  const employeeAddress = firstAssignedId
    ? await prisma.address.findFirst({
        where: { userId: firstAssignedId },
        select: { street: true, unit: true, city: true, state: true, zipCode: true },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const jobAddress = booking.address;
  const fromStr = employeeAddress
    ? `${employeeAddress.street}${employeeAddress.unit ? ` ${employeeAddress.unit}` : ""}, ${employeeAddress.city}, ${employeeAddress.state} ${employeeAddress.zipCode}`
    : null;
  const toStr = jobAddress
    ? `${jobAddress.street}${jobAddress.unit ? ` ${jobAddress.unit}` : ""}, ${jobAddress.city}, ${jobAddress.state} ${jobAddress.zipCode}`
    : null;
  const mapsUrl =
    fromStr && toStr
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromStr)}&destination=${encodeURIComponent(toStr)}`
      : null;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-teal/10 text-teal",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-[0.82rem] text-gray-400 hover:text-green mb-4 transition-colors">
        <span>←</span> Back to Bookings
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl">Booking #{booking.bookingNumber}</h2>
          <span className={`inline-block mt-1 text-[0.72rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium ${statusColors[booking.status] || ""}`}>
            {formatStatus(booking.status)}
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

          {/* DIRECTIONS */}
          {(fromStr || toStr) && (
            <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
              <h3 className="font-display text-base mb-3">Directions</h3>
              <div className="space-y-3">
                {fromStr && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-0.5">From (Employee)</div>
                      <div className="text-[0.85rem]">{fromStr}</div>
                    </div>
                  </div>
                )}
                {toStr && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <MapPin className="w-3 h-3 text-green" />
                    </div>
                    <div>
                      <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-0.5">To (Job)</div>
                      <div className="text-[0.85rem]">{toStr}</div>
                    </div>
                  </div>
                )}
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 bg-green text-white px-4 py-2 rounded-lg text-[0.82rem] font-semibold hover:bg-green/90 transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              )}
            </div>
          )}

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
            currentDate={booking.scheduledDate.toISOString().slice(0, 10)}
            currentTime={booking.scheduledTime}
            assignments={booking.assignments.map((a) => ({
              employeeId: a.employee.id,
              employeeName: a.employee.name,
            }))}
            employees={employees}
            adminReply={booking.adminReply}
            adminRepliedAt={booking.adminRepliedAt?.toISOString()}
            customerCanEdit={booking.customerCanEdit}
          />
        </div>
      </div>
    </div>
  );
}
