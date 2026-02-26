import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { JsonLd } from "@/components/website/JsonLd";
import { aggregateRatingSchema, reviewSchema } from "@/lib/schema";

export default async function HomePage() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let allTestimonials: { rating: number; customerName: string; content: string; location: string | null }[] = [];

  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true, isFeatured: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    // Aggregate rating from all approved testimonials
    allTestimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      select: { rating: true, customerName: true, content: true, location: true },
    });
  } catch (error) {
    console.error("Failed to fetch data from database:", error);
  }

  const avgRating = allTestimonials.length > 0
    ? allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length
    : 5;

  return (
    <>
      <JsonLd data={aggregateRatingSchema(Math.round(avgRating * 10) / 10, allTestimonials.length)} />
      {allTestimonials.slice(0, 3).map((t, i) => (
        <JsonLd key={i} data={reviewSchema({ author: t.customerName, content: t.content, rating: t.rating, location: t.location || undefined })} />
      ))}

      {/* HERO */}
      <section className="min-h-screen bg-tobacco flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />

        {/* Left palm tree */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="" className="absolute left-0 bottom-0 hidden md:block md:w-[420px] h-auto pointer-events-none opacity-50" />

        {/* Right palm tree (flipped) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/palm-tree.svg" alt="" className="absolute right-0 bottom-0 hidden md:block md:w-[380px] h-auto pointer-events-none opacity-50 -scale-x-100" />

        <div className="max-w-[800px] relative z-10 text-center px-6 pt-36 pb-20 mx-auto">
          <div className="text-[0.75rem] tracking-[0.25em] uppercase text-green-light mb-6 flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-green-light" />
            Miami&apos;s Premier Cleaning Service
            <span className="w-10 h-px bg-green-light" />
          </div>
          <h1 className="font-display text-cream mb-7 leading-none" style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}>
            Clean Homes,<br />
            <em className="text-amber">Cuban</em><br />
            <span className="text-green-light">Soul.</span>
          </h1>
          <p className="text-sand text-lg leading-relaxed max-w-[500px] mx-auto mb-12">
            Family-owned and rooted in the heart of Cuban-American pride.
            We treat every home like our own — with care, passion, and the kind of clean
            your abuela would approve of.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="#booking" className="bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber hover:-translate-y-0.5 transition-all">
              Book a Cleaning
            </Link>
            <Link href="#pricing" className="border-[1.5px] border-cream/30 text-cream px-9 py-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase rounded-[3px] hover:border-cream transition-colors">
              View Pricing
            </Link>
          </div>
          <div className="flex gap-12 mt-12 pt-10 border-t border-cream/[0.12] justify-center">
            <div>
              <div className="font-display text-3xl font-black text-amber">500+</div>
              <div className="text-sand text-[0.75rem] tracking-[0.1em] mt-1.5 uppercase">Homes Cleaned</div>
            </div>
            <div>
              <div className="font-display text-3xl font-black text-amber">4.9★</div>
              <div className="text-sand text-[0.75rem] tracking-[0.1em] mt-1.5 uppercase">Average Rating</div>
            </div>
            <div>
              <div className="font-display text-3xl font-black text-amber">100%</div>
              <div className="text-sand text-[0.75rem] tracking-[0.1em] mt-1.5 uppercase">Eco-Friendly</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-gradient-to-r from-green to-teal py-5 px-6 md:px-20 flex items-center justify-evenly gap-10 flex-wrap">
        {["Fully Insured & Bonded", "Background-Checked Staff", "Same-Day Availability", "Eco-Friendly Products", "Satisfaction Guaranteed"].map((item) => (
          <div key={item} className="flex items-center gap-2.5 text-white text-[0.85rem] font-medium tracking-[0.06em] uppercase">
            ✓ {item}
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="services" className="bg-tobacco py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green-light" />What We Do
        </div>
        <h2 className="font-display text-cream mb-16" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {services.map((service) => (
            <div key={service.id} className="bg-white/[0.04] border border-gold/15 p-10 hover:bg-green-light/10 hover:border-green-light transition-colors cursor-pointer">
              <span className="text-4xl block mb-4">{service.icon || "✨"}</span>
              <div className="font-display text-lg text-cream mb-2.5">{service.name}</div>
              <p className="text-sand text-[0.88rem] leading-relaxed mb-4">{service.description}</p>
              <div className="text-amber text-[0.85rem] font-medium tracking-wide">
                {service.basePrice > 0 ? `Starting at ${formatCurrency(service.basePrice)}` : "Custom Quote"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-ivory py-24 px-6 md:px-20 text-center">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green" />Happy Clients
          </div>
          <h2 className="font-display mb-16" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>What Miami Is Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-tobacco/10 rounded-md p-9 text-left relative">
                <div className="text-gold text-lg mb-3">{"★".repeat(t.rating)}</div>
                <p className="font-serif italic text-[#5a4535] leading-relaxed mb-6">{t.content}</p>
                <div className="font-semibold text-[0.85rem]">{t.customerName}</div>
                <div className="text-green text-[0.78rem]">{t.location}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SERVICE AREAS */}
      <section id="areas" className="bg-cream py-24 px-6 md:px-20">
        <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-green" />Where We Clean
        </div>
        <h2 className="font-display mb-2" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>Serving All of Miami-Dade</h2>
        <p className="text-[#7a6555] max-w-[500px] leading-relaxed mb-10">Click an area to see local pricing and availability.</p>
        <div className="flex flex-wrap gap-2.5">
          {SERVICE_AREAS.map((area) => (
            <Link
              key={area}
              href={`/areas/${area.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-white border border-tobacco/10 px-5 py-2.5 rounded-full text-[0.85rem] text-tobacco hover:bg-green hover:text-white hover:border-green transition-all"
            >
              {area}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
