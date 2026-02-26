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

        {/* Left coconut palm tree */}
        <svg className="absolute left-0 bottom-0 w-[300px] md:w-[420px] h-auto opacity-[0.35] pointer-events-none" viewBox="0 0 500 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk - curved, leaning slightly right */}
          <path d="M160 1000 Q150 750 170 600 Q185 480 200 380 Q210 310 220 260" stroke="#6B4226" strokeWidth="22" strokeLinecap="round" fill="none"/>
          {/* Trunk texture marks */}
          <path d="M158 900Q175 895 185 900M155 830Q172 825 182 830M157 760Q174 755 184 760M162 690Q179 685 189 690M168 620Q185 615 195 620M175 550Q192 545 202 550M182 480Q199 475 209 480M190 410Q207 405 217 410M197 350Q214 345 224 350M205 300Q220 295 230 300" stroke="#8B5E3C" strokeWidth="2" opacity="0.6"/>
          {/* Coconut cluster */}
          <circle cx="215" cy="268" r="10" fill="#5C8A3C"/>
          <circle cx="228" cy="260" r="9" fill="#4A7A2E"/>
          <circle cx="205" cy="258" r="9" fill="#4A7A2E"/>
          {/* Frond 1 - drooping left far */}
          <path d="M220 255 Q160 200 60 240 Q100 190 160 180 Q190 190 220 255Z" fill="#52B788"/>
          <path d="M220 255 Q155 210 80 235" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 2 - drooping left */}
          <path d="M218 250 Q140 170 30 190 Q90 140 155 145 Q190 165 218 250Z" fill="#40916C"/>
          <path d="M218 250 Q145 175 55 188" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 3 - up-left */}
          <path d="M215 248 Q160 130 80 80 Q130 100 170 130 Q200 170 215 248Z" fill="#52B788"/>
          <path d="M215 248 Q165 140 95 90" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 4 - top center */}
          <path d="M220 245 Q215 130 230 50 Q240 100 240 160 Q235 210 220 245Z" fill="#52B788"/>
          <path d="M220 245 Q218 145 228 65" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 5 - up-right */}
          <path d="M225 248 Q290 130 370 90 Q320 115 280 145 Q245 180 225 248Z" fill="#52B788"/>
          <path d="M225 248 Q285 140 355 95" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 6 - drooping right */}
          <path d="M228 250 Q310 175 420 200 Q360 148 295 150 Q255 168 228 250Z" fill="#40916C"/>
          <path d="M228 250 Q305 180 395 198" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 7 - drooping right far */}
          <path d="M225 255 Q300 210 400 260 Q350 200 290 195 Q255 205 225 255Z" fill="#52B788"/>
          <path d="M225 255 Q295 215 380 250" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 8 - drooping back-left */}
          <path d="M215 252 Q120 220 20 280 Q80 225 140 215 Q180 220 215 252Z" fill="#2D6A4F"/>
          {/* Frond 9 - drooping back-right */}
          <path d="M230 252 Q330 225 440 290 Q370 230 310 220 Q265 222 230 252Z" fill="#2D6A4F"/>
        </svg>

        {/* Right coconut palm tree */}
        <svg className="absolute right-0 bottom-0 w-[260px] md:w-[370px] h-auto opacity-[0.35] pointer-events-none" viewBox="0 0 500 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk - curved, leaning slightly left */}
          <path d="M340 900 Q350 680 330 540 Q315 430 300 340 Q290 280 280 230" stroke="#6B4226" strokeWidth="20" strokeLinecap="round" fill="none"/>
          {/* Trunk texture marks */}
          <path d="M342 820Q325 815 315 820M340 750Q323 745 313 750M337 680Q320 675 310 680M332 610Q315 605 305 610M325 540Q308 535 298 540M318 470Q301 465 291 470M310 400Q293 395 283 400M302 340Q288 335 278 340M295 290Q281 285 271 290" stroke="#8B5E3C" strokeWidth="2" opacity="0.6"/>
          {/* Coconut cluster */}
          <circle cx="285" cy="238" r="9" fill="#5C8A3C"/>
          <circle cx="273" cy="230" r="8" fill="#4A7A2E"/>
          <circle cx="295" cy="230" r="8" fill="#4A7A2E"/>
          {/* Frond 1 - drooping right far */}
          <path d="M280 225 Q340 175 440 210 Q400 165 340 155 Q310 162 280 225Z" fill="#52B788"/>
          <path d="M280 225 Q340 178 415 205" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 2 - drooping right */}
          <path d="M282 220 Q360 145 470 160 Q410 115 345 115 Q310 130 282 220Z" fill="#40916C"/>
          <path d="M282 220 Q358 150 445 158" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 3 - up-right */}
          <path d="M285 218 Q340 105 420 55 Q370 75 330 105 Q300 140 285 218Z" fill="#52B788"/>
          <path d="M285 218 Q335 110 405 60" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 4 - top center */}
          <path d="M280 215 Q275 105 270 25 Q262 75 260 135 Q265 180 280 215Z" fill="#52B788"/>
          <path d="M280 215 Q276 115 271 40" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 5 - up-left */}
          <path d="M275 218 Q210 105 130 60 Q180 80 220 110 Q255 145 275 218Z" fill="#52B788"/>
          <path d="M275 218 Q215 110 145 68" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 6 - drooping left */}
          <path d="M272 220 Q190 148 80 165 Q140 118 205 118 Q245 132 272 220Z" fill="#40916C"/>
          <path d="M272 220 Q195 152 105 163" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 7 - drooping left far */}
          <path d="M275 225 Q200 180 100 220 Q150 170 210 165 Q245 172 275 225Z" fill="#52B788"/>
          <path d="M275 225 Q205 182 120 215" stroke="#2D6A4F" strokeWidth="1.5" fill="none"/>
          {/* Frond 8 - back fronds */}
          <path d="M285 222 Q380 195 460 255 Q395 200 335 190 Q305 192 285 222Z" fill="#2D6A4F"/>
          <path d="M270 222 Q170 198 60 260 Q135 205 195 198 Q240 200 270 222Z" fill="#2D6A4F"/>
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
