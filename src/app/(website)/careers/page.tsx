import { CareerApplication } from "@/components/website/CareerApplication";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Careers — Join Our Team",
  description:
    "Apply to join the Havana Cleaning team. We're hiring professional cleaners. Competitive pay, flexible hours, and a great culture.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const t = await getTranslations("careers");

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
    t("benefit5"),
    t("benefit6"),
  ];

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20 text-center">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-light" />
          {t("heroLabel")}
          <span className="w-8 h-px bg-green-light" />
        </div>
        <h1
          className="font-display text-cream mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          {t("heroTitle")}
        </h1>
        <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
          {t("heroSubtitle")}
        </p>
      </section>

      {/* BENEFITS */}
      <section className="bg-green py-10 px-6 md:px-20">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-10 text-white text-[0.85rem] font-medium">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2">
              ✓ {b}
            </div>
          ))}
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className="bg-ivory py-16 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-display text-center mb-2"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            {t("applyNow")}
          </h2>
          <p className="text-center text-sand text-[0.9rem] mb-10">
            {t("applyDesc")}
          </p>
          <CareerApplication />
        </div>
      </section>
    </>
  );
}
