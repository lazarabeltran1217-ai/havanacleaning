import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Update insured/bonded FAQ
  const faq1 = await prisma.fAQ.findFirst({ where: { question: "Are you licensed and insured?" } });
  if (faq1) {
    await prisma.fAQ.update({
      where: { id: faq1.id },
      data: {
        question: "How do you vet your cleaning staff?",
        answer: "All of our cleaning professionals are background-checked and trained to our high standards before they join a team. We take trust seriously — you can feel confident having our team in your home.",
      },
    });
    console.log("Updated: insured -> vetting");
  }

  // Update eco-friendly FAQ
  const faq2 = await prisma.fAQ.findFirst({ where: { question: "Do you offer eco-friendly or green cleaning?" } });
  if (faq2) {
    await prisma.fAQ.update({
      where: { id: faq2.id },
      data: {
        question: "Can I request specific products or supplies?",
        answer: "Of course! If you have preferences for certain cleaning products or need us to avoid specific chemicals due to allergies or sensitivities, just let us know when you book and we'll accommodate your needs.",
      },
    });
    console.log("Updated: eco-friendly -> product requests");
  }

  // Update supplies FAQ
  const faq3 = await prisma.fAQ.findFirst({ where: { question: "Do you bring your own cleaning supplies and equipment?" } });
  if (faq3) {
    await prisma.fAQ.update({
      where: { id: faq3.id },
      data: {
        answer: "Yes, we bring all necessary cleaning supplies, equipment, and products. We use high-quality, professional-grade products to get the job done right.",
      },
    });
    console.log("Updated: supplies answer");
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
