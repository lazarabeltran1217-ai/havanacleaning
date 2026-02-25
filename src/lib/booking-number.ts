import { prisma } from "./prisma";

/** Generate a booking number like HC-20260225-001 */
export async function generateBookingNumber(): Promise<string> {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const prefix = `HC-${dateStr}`;

  const lastBooking = await prisma.booking.findFirst({
    where: { bookingNumber: { startsWith: prefix } },
    orderBy: { bookingNumber: "desc" },
    select: { bookingNumber: true },
  });

  let seq = 1;
  if (lastBooking) {
    const parts = lastBooking.bookingNumber.split("-");
    seq = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}-${String(seq).padStart(3, "0")}`;
}
