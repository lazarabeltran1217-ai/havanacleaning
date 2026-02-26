export interface ServiceContent {
  longDescription: string;
  features: string[];
  benefits: { title: string; text: string }[];
}

export const SERVICE_DEFAULTS: Record<string, ServiceContent> = {
  "residential-cleaning": {
    longDescription:
      "Our residential cleaning service is designed to keep your Miami home spotless week after week. We handle everything from floors to ceilings so you can spend your time enjoying the Magic City instead of scrubbing countertops. Whether you live in a Brickell condo or a Coral Gables family home, our trained team delivers a consistent, thorough clean every visit.",
    features: [
      "Vacuuming and mopping all floors",
      "Dusting all surfaces, shelves, and decor",
      "Full kitchen cleaning — counters, sink, stovetop, appliance exteriors",
      "Bathroom sanitizing — toilets, showers, mirrors, floors",
      "Making beds and changing linens (if requested)",
      "Emptying all trash cans",
      "All cleaning supplies and equipment provided",
    ],
    benefits: [
      { title: "Consistent Quality", text: "The same trained team every visit so they learn your home and your preferences." },
      { title: "Flexible Scheduling", text: "Weekly, bi-weekly, or monthly — pick the schedule that fits your life." },
      { title: "Bilingual Team", text: "Our team speaks English and Spanish fluently. Communicate in whichever language you prefer." },
    ],
  },
  "deep-cleaning": {
    longDescription:
      "A deep clean goes beyond the surface. We tackle the grime that builds up over time — inside appliances, behind furniture, along baseboards, and in every hard-to-reach corner. Perfect as a first-time clean, seasonal refresh, or move-in preparation. Our Miami deep cleaning teams bring commercial-grade equipment and the patience to make your home truly shine.",
    features: [
      "Everything in a standard clean, plus:",
      "Inside oven, microwave, and refrigerator",
      "Baseboards, door frames, and light switches",
      "Ceiling fans and light fixtures",
      "Window sills and blinds",
      "Behind and under furniture",
      "Cabinet exteriors and handles",
      "Deep scrub of tile grout and shower doors",
    ],
    benefits: [
      { title: "Thorough Detail", text: "We clean areas that are often overlooked — behind appliances, inside cabinets, and along every baseboard." },
      { title: "Professional-Grade Products", text: "Commercial equipment and cleaning agents that remove built-up grime safely and effectively." },
      { title: "Perfect First Clean", text: "Ideal for new clients, move-ins, or when your home needs a reset before starting regular service." },
    ],
  },
  "move-in-move-out": {
    longDescription:
      "Moving is stressful enough without worrying about cleaning. Our move-in/move-out service ensures the property is spotless for the next chapter — whether you're handing keys to a landlord, welcoming new tenants, or settling into your new Miami home. We work with homeowners, renters, property managers, and realtors across Miami-Dade County.",
    features: [
      "Complete deep clean of all rooms",
      "Inside all cabinets, closets, and drawers",
      "Interior windows and window tracks",
      "Inside refrigerator, oven, dishwasher, and microwave",
      "Light fixtures and ceiling fans",
      "Baseboards, door frames, and switch plates",
      "Garage sweep (if applicable)",
      "All surfaces sanitized and move-in ready",
    ],
    benefits: [
      { title: "Move-In Ready", text: "Every surface cleaned and sanitized so the home is ready from day one." },
      { title: "Landlord & Realtor Friendly", text: "We help you get your deposit back or prepare listings that impress." },
      { title: "Flexible Timing", text: "We work around your move schedule — even last-minute requests." },
    ],
  },
  "commercial-cleaning": {
    longDescription:
      "Keep your Miami business looking its best with our professional commercial cleaning service. From offices and retail spaces to medical facilities and restaurants, we deliver reliable, thorough cleaning that creates a healthy environment for your employees and customers. We offer customized plans to match your business needs and schedule.",
    features: [
      "Office and workspace cleaning",
      "Lobby and reception area maintenance",
      "Restroom sanitization and restocking",
      "Break room and kitchen cleaning",
      "Floor care — vacuuming, mopping, and polishing",
      "Trash removal and recycling",
      "Window and glass cleaning",
      "Custom cleaning plans for your business",
    ],
    benefits: [
      { title: "After-Hours Available", text: "We clean when your business is closed so there's zero disruption to your operations." },
      { title: "Customized Plans", text: "Daily, weekly, or monthly schedules tailored to your space and budget." },
      { title: "Professional Team", text: "Background-checked, uniformed staff trained for commercial environments." },
    ],
  },
  "post-construction": {
    longDescription:
      "Renovating or building in Miami? Post-construction cleanup is a specialized job that requires the right equipment and expertise. We remove construction dust, debris, adhesive residue, and paint splatters, then deep clean every surface until the space is move-in ready. We work with homeowners, contractors, and property managers across Miami-Dade County.",
    features: [
      "Construction dust and debris removal",
      "Adhesive and sticker residue removal",
      "Paint splatter cleanup",
      "Window and glass cleaning (interior)",
      "Deep cleaning of all surfaces, floors, and fixtures",
      "Cabinet interior and exterior wipe-down",
      "HVAC vent cleaning",
      "Final inspection-ready polish",
    ],
    benefits: [
      { title: "Contractor-Friendly", text: "We coordinate with your construction team to schedule cleanup at the right time." },
      { title: "Move-In Ready Results", text: "From raw construction to a polished, livable space in a single visit." },
      { title: "Specialized Equipment", text: "Industrial vacuums and cleaning tools designed for post-construction messes." },
    ],
  },
  "airbnb-turnover": {
    longDescription:
      "Keep your Miami short-term rental running smoothly with our Airbnb turnover service. We handle the full clean between guests — laundry, restocking, staging, and a thorough cleaning — so your property is always five-star ready. Our team understands the urgency of same-day turnarounds and the importance of guest-ready presentation.",
    features: [
      "Full clean of all rooms between guests",
      "Linen change and laundry service",
      "Restocking essentials (toiletries, paper products)",
      "Kitchen reset — dishes, appliances, counters",
      "Photo-ready staging and styling",
      "Trash removal and recycling",
      "Inspection checklist for every turnover",
    ],
    benefits: [
      { title: "Same-Day Turnaround", text: "Quick turnovers so you never have to delay a guest check-in." },
      { title: "Reliable Scheduling", text: "Automated coordination with your booking calendar for seamless service." },
      { title: "5-Star Reviews", text: "A consistently clean, well-presented rental leads to better guest ratings." },
    ],
  },
  "recurring-plans": {
    longDescription:
      "Save time and money with a recurring cleaning plan. Choose weekly, bi-weekly, or monthly service and enjoy a consistently clean home without having to think about it. Recurring clients get priority scheduling, the same trusted team each visit, and discounted rates compared to one-time bookings.",
    features: [
      "Everything included in a standard residential clean",
      "Priority scheduling — your preferred day and time reserved",
      "Same team assigned to your home every visit",
      "Automatic scheduling — no need to rebook",
      "Easy rescheduling with 24-hour notice",
      "Volume discounts on every clean",
    ],
    benefits: [
      { title: "Save Up to 20%", text: "Recurring plans are priced lower than one-time bookings. The more often, the more you save." },
      { title: "Same Team Every Visit", text: "Your cleaners learn your home, your preferences, and your standards." },
      { title: "Set It and Forget It", text: "Automatic scheduling means one less thing to manage in your busy life." },
    ],
  },
};

export function getServiceDefaults(slug: string): ServiceContent {
  return SERVICE_DEFAULTS[slug] || {
    longDescription: "",
    features: [
      "All cleaning supplies and equipment provided",
      "Background-checked, trained professionals",
      "Professional-grade products and equipment",
      "100% satisfaction guaranteed",
    ],
    benefits: [
      { title: "Professional Service", text: "Trained, background-checked cleaning professionals." },
      { title: "Serving All Miami-Dade", text: "From Aventura to Homestead, we cover the entire county." },
      { title: "Bilingual Team", text: "Fully bilingual team — English and Spanish." },
    ],
  };
}
