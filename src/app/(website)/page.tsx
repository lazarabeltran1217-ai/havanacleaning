import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SERVICE_AREAS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { JsonLd } from "@/components/website/JsonLd";
import { aggregateRatingSchema, reviewSchema } from "@/lib/schema";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true, isFeatured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Aggregate rating from all approved testimonials
  const allTestimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    select: { rating: true, customerName: true, content: true, location: true },
  });
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

        {/* Left palm tree - cartoon style, leaning right */}
        <svg className="absolute left-0 bottom-0 w-[320px] md:w-[460px] h-auto opacity-[0.30] pointer-events-none" viewBox="0 0 600 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk - thick, curved, with segments */}
          <path d="M120 1100 C130 950 160 800 190 680 C215 580 240 500 270 420 C290 365 305 310 310 270" stroke="#8B5E3C" strokeWidth="45" strokeLinecap="round" fill="none"/>
          <path d="M120 1100 C130 950 160 800 190 680 C215 580 240 500 270 420 C290 365 305 310 310 270" stroke="#6B4226" strokeWidth="38" strokeLinecap="round" fill="none"/>
          {/* Trunk segment lines */}
          <path d="M128 1020 Q155 1010 172 1020" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M140 940 Q167 930 180 940" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M155 860 Q180 850 193 860" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M170 780 Q195 770 208 780" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M190 700 Q213 690 225 700" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M210 620 Q232 610 243 620" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M232 540 Q253 530 262 540" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M252 465 Q272 455 280 465" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M270 395 Q288 385 296 395" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M288 335 Q304 325 310 335" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          {/* Coconuts */}
          <circle cx="305" cy="285" r="14" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          <circle cx="322" cy="275" r="12" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          <circle cx="295" cy="272" r="12" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          {/* Frond - up left (big wide leaf) */}
          <path d="M310 265 C260 180 150 100 50 70 C120 80 200 120 260 180 C280 210 300 245 310 265Z" fill="#2D6A4F"/>
          <path d="M310 265 C270 195 170 120 70 80" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <path d="M310 265 C260 180 150 100 50 70" stroke="#52B788" strokeWidth="2" fill="none" opacity="0.5"/>
          {/* Frond - left drooping */}
          <path d="M308 270 C240 230 120 220 10 270 C80 210 160 195 230 215 C270 230 295 255 308 270Z" fill="#40916C"/>
          <path d="M308 270 C240 230 120 225 30 265" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - far left drooping down */}
          <path d="M306 275 C230 260 100 290 -10 350 C60 275 140 248 220 255 C265 262 292 270 306 275Z" fill="#52B788"/>
          <path d="M306 275 C230 260 110 285 10 340" stroke="#2D6A4F" strokeWidth="3" fill="none"/>
          {/* Frond - top center */}
          <path d="M310 260 C305 170 320 80 340 10 C345 70 340 150 330 220 C325 245 318 258 310 260Z" fill="#2D6A4F"/>
          <path d="M310 260 C307 180 320 90 335 20" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - up right */}
          <path d="M315 265 C370 180 470 110 570 90 C500 100 420 135 360 190 C340 215 325 245 315 265Z" fill="#40916C"/>
          <path d="M315 265 C360 195 450 125 550 95" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <path d="M315 265 C370 180 470 110 570 90" stroke="#52B788" strokeWidth="2" fill="none" opacity="0.5"/>
          {/* Frond - right drooping */}
          <path d="M318 270 C380 230 500 225 600 280 C530 215 450 200 380 218 C345 232 328 255 318 270Z" fill="#2D6A4F"/>
          <path d="M318 270 C380 235 490 228 580 275" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - far right drooping down */}
          <path d="M320 275 C390 262 510 295 600 360 C540 280 460 252 385 258 C350 264 332 272 320 275Z" fill="#52B788"/>
          <path d="M320 275 C390 262 500 290 590 350" stroke="#2D6A4F" strokeWidth="3" fill="none"/>
        </svg>

        {/* Right palm tree - cartoon style, leaning left */}
        <svg className="absolute right-0 bottom-0 w-[280px] md:w-[400px] h-auto opacity-[0.30] pointer-events-none" viewBox="0 0 600 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk - thick, curved, with segments */}
          <path d="M480 1000 C470 870 440 720 410 600 C385 510 360 430 335 360 C318 310 305 270 295 240" stroke="#8B5E3C" strokeWidth="42" strokeLinecap="round" fill="none"/>
          <path d="M480 1000 C470 870 440 720 410 600 C385 510 360 430 335 360 C318 310 305 270 295 240" stroke="#6B4226" strokeWidth="35" strokeLinecap="round" fill="none"/>
          {/* Trunk segment lines */}
          <path d="M475 920 Q450 910 438 920" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M463 845 Q440 835 428 845" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M448 770 Q426 760 415 770" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M432 695 Q412 685 402 695" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M415 620 Q397 610 388 620" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M397 548 Q380 538 372 548" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M378 478 Q363 468 356 478" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M358 410 Q345 400 338 410" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          <path d="M340 348 Q328 338 322 348" stroke="#4A2A12" strokeWidth="3" opacity="0.7"/>
          {/* Coconuts */}
          <circle cx="300" cy="255" r="13" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          <circle cx="283" cy="248" r="11" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          <circle cx="310" cy="245" r="11" fill="#6B4226" stroke="#4A2A12" strokeWidth="2"/>
          {/* Frond - up right */}
          <path d="M298 235 C345 155 455 80 560 55 C485 70 405 108 345 160 C325 185 308 215 298 235Z" fill="#2D6A4F"/>
          <path d="M298 235 C340 165 440 95 540 65" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <path d="M298 235 C345 155 455 80 560 55" stroke="#52B788" strokeWidth="2" fill="none" opacity="0.5"/>
          {/* Frond - right drooping */}
          <path d="M300 240 C365 205 485 200 600 245 C525 190 440 175 370 190 C330 205 312 225 300 240Z" fill="#40916C"/>
          <path d="M300 240 C365 208 478 202 585 240" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - far right drooping down */}
          <path d="M302 245 C375 235 505 260 610 320 C545 250 455 222 375 228 C335 235 315 242 302 245Z" fill="#52B788"/>
          <path d="M302 245 C375 235 498 258 600 315" stroke="#2D6A4F" strokeWidth="3" fill="none"/>
          {/* Frond - top center */}
          <path d="M295 230 C290 145 278 60 265 -10 C262 50 268 130 278 195 C284 220 290 230 295 230Z" fill="#2D6A4F"/>
          <path d="M295 230 C291 155 280 70 268 0" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - up left */}
          <path d="M292 235 C240 155 135 85 30 60 C105 75 190 110 250 165 C272 190 285 218 292 235Z" fill="#40916C"/>
          <path d="M292 235 C248 168 150 100 50 70" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <path d="M292 235 C240 155 135 85 30 60" stroke="#52B788" strokeWidth="2" fill="none" opacity="0.5"/>
          {/* Frond - left drooping */}
          <path d="M290 240 C225 208 105 205 -5 248 C75 192 155 178 230 195 C268 208 284 228 290 240Z" fill="#2D6A4F"/>
          <path d="M290 240 C228 210 115 205 10 242" stroke="#1B4332" strokeWidth="3" fill="none"/>
          {/* Frond - far left drooping down */}
          <path d="M288 245 C215 238 85 265 -15 325 C55 255 145 228 225 235 C260 240 280 244 288 245Z" fill="#52B788"/>
          <path d="M288 245 C218 238 95 262 -5 318" stroke="#2D6A4F" strokeWidth="3" fill="none"/>
        </svg>

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
