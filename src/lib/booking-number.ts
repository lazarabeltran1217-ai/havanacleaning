import { prisma } from "./prisma";
import { todayDateStringET } from "./timezone";

/** Generate a booking number like HC-20260225-001 */
export async function generateBookingNumber(): Promise<string> {
  const dateStr = todayDateStringET();

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

/** Generate a handyman booking number like HM-20260305-001 */
export async function generateHandymanBookingNumber(): Promise<string> {
  const dateStr = todayDateStringET();

  const prefix = `HM-${dateStr}`;

  const last = await prisma.handymanInquiry.findFirst({
    where: { bookingNumber: { startsWith: prefix } },
    orderBy: { bookingNumber: "desc" },
    select: { bookingNumber: true },
  });

  let seq = 1;
  if (last) {
    const parts = last.bookingNumber.split("-");
    seq = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}-${String(seq).padStart(3, "0")}`;
}
