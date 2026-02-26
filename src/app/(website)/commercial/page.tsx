import { CommercialForm } from "@/components/website/CommercialForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Cleaning | Havana Cleaning",
  description:
    "Professional commercial cleaning services for Miami businesses. Offices, retail, medical, restaurants. Get a custom quote today.",
  alternates: { canonical: "/commercial" },
};

export default function CommercialPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-16 px-6 md:px-20 text-center">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-light" />
          For Businesses
          <span className="w-8 h-px bg-green-light" />
        </div>
        <h1
          className="font-display text-cream mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Commercial Cleaning
        </h1>
        <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
          Offices, retail spaces, medical facilities, restaurants — we keep your
          business looking professional and hygienic. Tell us about your space
          and we&apos;ll put together a custom plan.
        </p>
      </section>

      {/* TRUST SIGNALS */}
      <section className="bg-green py-8 px-6 md:px-20">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-10 text-white text-[0.85rem] font-medium">
          {[
            "Professional-Grade Cleaning",
            "Flexible Scheduling",
            "Custom Plans Available",
            "Background-Checked Staff",
            "Green Products Available",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              ✓ {item}
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section className="bg-ivory py-16 px-6 md:px-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-display text-center mb-2"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            Request a Quote
          </h2>
          <p className="text-center text-sand text-[0.9rem] mb-10">
            Fill out the form below and we&apos;ll get back to you within 24 hours
            with a custom quote.
          </p>
          <CommercialForm />
        </div>
      </section>
    </>
  );
}
