import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const faqs = [
  // General
  {
    pageType: "general",
    question: "What areas in Miami do you serve?",
    answer: "We serve all of Miami-Dade County including Brickell, Coral Gables, Kendall, Doral, Hialeah, Miami Beach, Wynwood, Coconut Grove, Little Havana, Homestead, Pinecrest, Aventura, Key Biscayne, Palmetto Bay, South Miami, North Miami, Miami Lakes, Cutler Bay, Sweetwater, and Westchester.",
    sortOrder: 1,
  },
  {
    pageType: "general",
    question: "How do you vet your cleaning staff?",
    answer: "All of our cleaning professionals are background-checked and trained to our high standards before they join a team. We take trust seriously — you can feel confident having our team in your home.",
    sortOrder: 2,
  },
  {
    pageType: "general",
    question: "Do I need to be home during the cleaning?",
    answer: "No, you don't need to be home. Many of our clients provide entry instructions (lockbox code, doorman, etc.) when they book. You can add special access notes during the booking process.",
    sortOrder: 3,
  },
  {
    pageType: "general",
    question: "Do you bring your own cleaning supplies and equipment?",
    answer: "Yes, we bring all necessary cleaning supplies, equipment, and products. We use high-quality, professional-grade products to get the job done right.",
    sortOrder: 4,
  },
  {
    pageType: "general",
    question: "Do you offer services in Spanish?",
    answer: "Yes! We're a Cuban-American family-owned business and our team is fully bilingual in English and Spanish. Our website and booking system are also available in Spanish.",
    sortOrder: 5,
  },

  // Services
  {
    pageType: "service",
    question: "What's included in a standard residential cleaning?",
    answer: "Our residential cleaning covers all rooms: vacuuming, mopping, dusting, bathroom sanitizing, kitchen cleaning (counters, sink, stovetop, exterior of appliances), making beds, and taking out trash. We clean your entire home top to bottom.",
    sortOrder: 1,
  },
  {
    pageType: "service",
    question: "What's the difference between a regular clean and a deep clean?",
    answer: "A regular clean covers everyday maintenance — surfaces, floors, bathrooms, and kitchen. A deep clean goes further: inside appliances (oven, fridge), baseboards, ceiling fans, window sills, light fixtures, behind furniture, and all those hard-to-reach areas that build up grime over time.",
    sortOrder: 2,
  },
  {
    pageType: "service",
    question: "What is your Airbnb turnover service?",
    answer: "Our Airbnb turnover service is a quick, thorough clean between guests. It includes full cleaning, linen change, restocking essentials, and staging the property to be photo-ready. We offer same-day turnarounds so you never have to delay a guest check-in.",
    sortOrder: 3,
  },
  {
    pageType: "service",
    question: "Can I request specific products or supplies?",
    answer: "Of course! If you have preferences for certain cleaning products or need us to avoid specific chemicals due to allergies or sensitivities, just let us know when you book and we'll accommodate your needs.",
    sortOrder: 4,
  },
  {
    pageType: "service",
    question: "Can you handle post-construction cleanup?",
    answer: "Yes! Post-construction cleaning is one of our specialties. We remove construction dust, debris, adhesive residue, and do a thorough deep clean to make the space move-in ready. We work with homeowners, contractors, and property managers across Miami-Dade.",
    sortOrder: 5,
  },

  // Pricing
  {
    pageType: "pricing",
    question: "How much does a cleaning cost?",
    answer: "Pricing depends on the size of your home, the type of service, and any add-ons you choose. Our residential cleaning starts at $120 for smaller homes. You can get an instant quote by using our online booking tool — just enter your home details and we'll show you the price upfront.",
    sortOrder: 1,
  },
  {
    pageType: "pricing",
    question: "Do you offer discounts for recurring cleanings?",
    answer: "Yes! We offer savings for recurring plans. Weekly, bi-weekly, and monthly clients enjoy discounted rates compared to one-time bookings. The more frequently you book, the more you save. Check our pricing page for details.",
    sortOrder: 2,
  },
  {
    pageType: "pricing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and cash. Payment is processed securely online when you book. For recurring plans, your card is charged automatically after each cleaning.",
    sortOrder: 3,
  },
  {
    pageType: "pricing",
    question: "Is there a cancellation fee?",
    answer: "We understand plans change. You can cancel or reschedule for free with at least 24 hours' notice. Cancellations within 24 hours of the scheduled cleaning may be subject to a cancellation fee.",
    sortOrder: 4,
  },

  // Service Areas
  {
    pageType: "area",
    question: "Do you serve Miami Beach and the islands?",
    answer: "Yes! We serve Miami Beach, South Beach, Key Biscayne, Fisher Island, and surrounding island communities. Our teams are experienced with condo buildings and high-rise properties common in these areas.",
    sortOrder: 1,
  },
  {
    pageType: "area",
    question: "How far south do you go?",
    answer: "We cover all of Miami-Dade County from Aventura in the north to Homestead and Florida City in the south. This includes Cutler Bay, Palmetto Bay, Pinecrest, and all communities in between.",
    sortOrder: 2,
  },
  {
    pageType: "area",
    question: "Do you clean commercial properties outside of Miami-Dade?",
    answer: "Currently, we focus on Miami-Dade County for both residential and commercial services. If you're in Broward County or nearby, reach out through our booking page and we'll let you know if we can accommodate your location.",
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding FAQs...");

  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!exists) {
      await prisma.fAQ.create({
        data: { ...faq, isPublished: true },
      });
    }
  }

  console.log(`Done! Seeded ${faqs.length} FAQs.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
