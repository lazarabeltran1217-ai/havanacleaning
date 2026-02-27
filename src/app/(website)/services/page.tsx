import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import { ServiceIcon } from "@/lib/service-icons";

export const metadata: Metadata = {
  title: "Our Services | Havana Cleaning",
  description:
    "Professional cleaning services in Miami-Dade: residential, deep clean, move-in/out, commercial, post-construction, Airbnb turnover, and recurring plans.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-20 px-6 md:px-20 text-center">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-light" />
          What We Do
          <span className="w-8 h-px bg-green-light" />
        </div>
        <h1
          className="font-display text-cream mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Our Services
        </h1>
        <p className="text-sand max-w-[600px] mx-auto leading-relaxed">
          From everyday cleans to deep sanitization — we handle every type of
          home and business space in Miami-Dade County.
        </p>
      </section>

      {/* SERVICES GRID */}
      <section className="bg-ivory py-20 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="bg-white border border-tobacco/10 rounded-lg p-8 hover:shadow-lg hover:border-green/30 transition-all group"
            >
              <div className="flex items-start gap-5">
                <ServiceIcon emoji={service.icon || "✨"} className="w-10 h-10 text-green shrink-0" />
                <div className="flex-1">
                  <h2 className="font-display text-xl mb-2 group-hover:text-green transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-[#7a6555] text-[0.9rem] leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber font-semibold text-[0.9rem]">
                      {service.basePrice > 0
                        ? `Starting at ${formatCurrency(service.basePrice)}`
                        : "Custom Quote"}
                    </span>
                    <span className="text-green text-[0.8rem] font-medium group-hover:translate-x-1 transition-transform">
                      Learn More →
                    </span>
                  </div>
                  {service.estimatedHours > 0 && (
                    <div className="text-sand text-[0.78rem] mt-2">
                      ~{service.estimatedHours} hours estimated
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {services.length % 2 !== 0 && (
            <Link
              href="/book"
              className="bg-white border border-tobacco/10 rounded-lg p-8 hover:shadow-lg hover:border-green/30 transition-all group flex flex-col items-center justify-center text-center"
            >
              <h2 className="font-display text-xl mb-2 group-hover:text-green transition-colors">
                Need a Custom Clean?
              </h2>
              <p className="text-[#7a6555] text-[0.9rem] leading-relaxed mb-4">
                Tell us what you need and we&apos;ll create a plan just for you.
              </p>
              <span className="text-green text-[0.85rem] font-medium group-hover:translate-x-1 transition-transform">
                Get a Free Quote →
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          Ready for a Spotless Home?
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Book online in minutes. Pick your service, choose a time, and we
          handle the rest.
        </p>
        <Link
          href="/book"
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          Book a Cleaning
        </Link>
      </section>
    </>
  );
}
