import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Received",
};

interface Props {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/book");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true, icon: true } },
    },
  });

  if (!booking) notFound();

  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 md:px-20">
      <div className="max-w-lg mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green mx-auto mb-6" />
        <h1 className="font-display text-3xl mb-3">Request Received!</h1>
        <p className="text-sand text-[0.85rem] mb-6">
          Booking #{booking.bookingNumber}
        </p>

        <div className="bg-white border border-tobacco/10 rounded-lg p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <ServiceIcon emoji={booking.service.icon} className="w-6 h-6 text-green" />
            <span className="font-display text-lg">{booking.service.name}</span>
          </div>
          <div className="text-[0.9rem] text-[#7a6555] space-y-1">
            <p>{formatDate(booking.scheduledDate)} &middot; <span className="capitalize">{booking.scheduledTime}</span></p>
          </div>
        </div>

        <p className="text-[#5a4535] text-[0.95rem] leading-relaxed mb-8">
          Thank you for your booking request. Our team will review your details
          and reach out to confirm your appointment. You can log in with your
          email and password to track your booking.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?callbackUrl=/account/bookings"
            className="inline-block bg-green text-white px-8 py-3 rounded-[3px] font-semibold text-[0.9rem] hover:bg-green/90 transition-colors"
          >
            Log In to My Account
          </Link>
          <Link
            href="/book"
            className="inline-block border border-tobacco/20 text-tobacco px-8 py-3 rounded-[3px] text-[0.9rem] hover:bg-tobacco/5 transition-colors"
          >
            Book Another Service
          </Link>
        </div>
      </div>
    </section>
  );
}
