import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/website/BookingWizard";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Book a Cleaning",
  description:
    "Book your professional cleaning in minutes. Choose your service, pick a date and time, and pay securely online. Same-week availability.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const t = await getTranslations("booking");

  let services: { id: string; name: string; slug: string; icon: string | null; basePrice: number; pricePerBedroom: number; pricePerBathroom: number; estimatedHours: number }[] = [];
  let addOns: { id: string; name: string; price: number }[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        basePrice: true,
        pricePerBedroom: true,
        pricePerBathroom: true,
        estimatedHours: true,
      },
    });
    addOns = await prisma.serviceAddOn.findMany({
      where: { isActive: true },
      select: { id: true, name: true, price: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch booking data:", error);
  }

  return (
    <>
      <section className="bg-tobacco pt-36 pb-12 px-6 md:px-20 text-center">
        <h1
          className="font-display text-cream mb-4"
          style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}
        >
          {t("heroTitle")}
        </h1>
        <p className="text-sand max-w-md mx-auto">
          {t("heroSubtitle")}
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
