import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/website/BookingWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Cleaning | Havana Cleaning",
  description:
    "Book your professional cleaning in Miami in minutes. Choose your service, pick a time, and pay securely online.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      basePrice: true,
      estimatedHours: true,
    },
  });

  const addOns = await prisma.serviceAddOn.findMany({
    where: { isActive: true },
    select: { id: true, name: true, price: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <section className="bg-tobacco pt-36 pb-12 px-6 md:px-20 text-center">
        <h1
          className="font-display text-cream mb-4"
          style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}
        >
          Book Your Cleaning
        </h1>
        <p className="text-sand max-w-md mx-auto">
          3 simple steps and you&apos;re done. We&apos;ll take it from here.
        </p>
      </section>

      <section className="bg-ivory py-12 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <BookingWizard
            services={services}
            addOns={addOns}
          />
        </div>
      </section>
    </>
  );
}
