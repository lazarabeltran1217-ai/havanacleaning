import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/website/BookingWizard";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Professional Cleaners Near Me — Online Scheduling",
  description:
    "Book professional cleaners near you in minutes. Choose house cleaning, deep clean, or move-in/out service, pick a date, and pay securely online. Same-week availability.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const t = await getTranslations("booking");

  let services: { id: string; name: string; nameEs: string | null; slug: string; icon: string | null; basePrice: number; pricePerBedroom: number; pricePerBathroom: number; estimatedHours: number; includedItems: number; extraItemPrice: number; items: { id: string; name: string; nameEs: string | null; icon: string | null }[] }[] = [];
  let addOns: { id: string; name: string; nameEs: string | null; price: number }[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameEs: true,
        slug: true,
        icon: true,
        basePrice: true,
        pricePerBedroom: true,
        pricePerBathroom: true,
        estimatedHours: true,
        includedItems: true,
        extraItemPrice: true,
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, nameEs: true, icon: true },
        },
      },
    });
    addOns = await prisma.serviceAddOn.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameEs: true, price: true },
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

      {/* HOW IT WORKS */}
      <section className="bg-cream py-12 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-center text-xl mb-8">{t("howItWorksTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {([
              { title: t("hiw1Title"), desc: t("hiw1Desc"), num: "1" },
              { title: t("hiw2Title"), desc: t("hiw2Desc"), num: "2" },
              { title: t("hiw3Title"), desc: t("hiw3Desc"), num: "3" },
            ]).map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-green text-white flex items-center justify-center font-bold mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="font-display text-[0.95rem] mb-1.5">{step.title}</h3>
                <p className="text-[#7a6555] text-[0.85rem] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="bg-green py-5 px-6 md:px-20">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-white text-[0.85rem] font-medium">
          {[t("trustItem1"), t("trustItem2"), t("trustItem3"), t("trustItem4")].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" /> {item}
            </div>
          ))}
        </div>
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
