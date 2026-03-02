import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── OWNER USER ──
  const ownerPassword = await hash("admin123", 12);
  const owner = await prisma.user.upsert({
    where: { email: "admin@havanacleaning.com" },
    update: {},
    create: {
      email: "admin@havanacleaning.com",
      password: ownerPassword,
      role: "OWNER",
      name: "Admin Owner",
      phone: "(305) 555-2526",
      locale: "en",
    },
  });
  console.log("✅ Owner user created:", owner.email);

  // ── EMPLOYEE USER ──
  const empPassword = await hash("employee123", 12);
  const employee = await prisma.user.upsert({
    where: { email: "lidia@havanacleaning.com" },
    update: {},
    create: {
      email: "lidia@havanacleaning.com",
      password: empPassword,
      role: "EMPLOYEE",
      name: "Lidia Rodriguez",
      phone: "(305) 555-0101",
      hourlyRate: 20,
      hireDate: new Date("2025-01-15"),
      locale: "es",
    },
  });
  console.log("✅ Employee user created:", employee.email);

  // ── CUSTOMER USER ──
  const custPassword = await hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "sofia@example.com" },
    update: {},
    create: {
      email: "sofia@example.com",
      password: custPassword,
      role: "CUSTOMER",
      name: "Sofia Reyes",
      phone: "(305) 555-0200",
      locale: "en",
    },
  });
  console.log("✅ Customer user created:", customer.email);

  // ── SERVICES ──
  const services = [
    { name: "Residential Cleaning", nameEs: "Limpieza Residencial", slug: "residential-cleaning", description: "Your everyday clean — bathrooms, kitchen, floors, dusting, vacuuming. We tackle the whole house so you can relax.", descriptionEs: "Tu limpieza diaria — baños, cocina, pisos, desempolvado, aspirado.", icon: "🏠", basePrice: 120, estimatedHours: 2.5, sortOrder: 1, isFeatured: true },
    { name: "Deep Clean", nameEs: "Limpieza Profunda", slug: "deep-cleaning", description: "A thorough top-to-bottom scrub including inside appliances, baseboards, ceiling fans, window sills and all the forgotten corners.", descriptionEs: "Una limpieza profunda de arriba a abajo.", icon: "✨", basePrice: 220, estimatedHours: 4, sortOrder: 2, isFeatured: true },
    { name: "Move-In / Move-Out", nameEs: "Mudanza", slug: "move-in-move-out", description: "Start fresh or leave spotless. We prepare homes for new residents or help you get that security deposit back.", descriptionEs: "Empieza limpio o sal impecable.", icon: "📦", basePrice: 280, estimatedHours: 5, sortOrder: 3, isFeatured: true },
    { name: "Commercial Cleaning", nameEs: "Limpieza Comercial", slug: "commercial-cleaning", description: "Offices, retail spaces, waiting rooms — we keep your business looking professional and hygienic.", descriptionEs: "Oficinas, tiendas, salas de espera.", icon: "🏢", basePrice: 0, estimatedHours: 3, sortOrder: 4 },
    { name: "Post-Construction", nameEs: "Limpieza Post-Construcción", slug: "post-construction", description: "Construction leaves a mess — dust, debris, residue. We handle the heavy-duty cleanup so your space is move-in ready.", descriptionEs: "La construcción deja un desastre — nosotros lo limpiamos.", icon: "🔨", basePrice: 350, estimatedHours: 6, sortOrder: 5 },
    { name: "Airbnb Turnover", nameEs: "Limpieza Airbnb", slug: "airbnb-turnover", description: "Quick, thorough turnover cleans between guests. Linen change, restock, photo-ready staging. Same-day turnaround.", descriptionEs: "Limpieza rápida entre huéspedes.", icon: "🏠", basePrice: 150, estimatedHours: 2, sortOrder: 6 },
    { name: "Green Clean", nameEs: "Limpieza Ecológica", slug: "green-clean", description: "100% non-toxic, plant-based products. Perfect for families with kids, pets, or allergies.", descriptionEs: "Productos 100% no tóxicos, a base de plantas.", icon: "🌿", basePrice: 140, estimatedHours: 2.5, sortOrder: 7 },
    { name: "Recurring Plans", nameEs: "Planes Recurrentes", slug: "recurring-plans", description: "Weekly, bi-weekly, or monthly scheduled cleans. Save up to 20% with a recurring plan.", descriptionEs: "Limpieza semanal, quincenal o mensual. Ahorra hasta 20%.", icon: "🔄", basePrice: 100, estimatedHours: 2, sortOrder: 8 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { nameEs: s.nameEs, descriptionEs: s.descriptionEs },
      create: { ...s, isActive: true, isFeatured: s.isFeatured ?? false },
    });
  }
  console.log("✅ Services seeded:", services.length);

  // ── ADD-ONS ──
  const addOns = [
    { name: "Interior Windows", nameEs: "Ventanas Interiores", price: 40 },
    { name: "Laundry & Fold", nameEs: "Lavandería y Doblado", price: 35 },
    { name: "Upholstery Vacuum", nameEs: "Aspirado de Tapicería", price: 25 },
    { name: "Oven Deep Clean", nameEs: "Limpieza Profunda de Horno", price: 45 },
    { name: "Fridge Clean-Out", nameEs: "Limpieza de Refrigerador", price: 35 },
    { name: "Patio / Balcony", nameEs: "Patio / Balcón", price: 50 },
    { name: "Cabinet Interior", nameEs: "Interior de Gabinetes", price: 55 },
    { name: "Pet Hair Treatment", nameEs: "Tratamiento de Pelo de Mascota", price: 30 },
    { name: "Baseboard & Trim", nameEs: "Zócalos y Molduras", price: 30 },
    { name: "Garage Sweep", nameEs: "Barrido de Garaje", price: 40 },
    { name: "Ceiling Fan Cleaning", nameEs: "Limpieza de Ventilador", price: 20 },
    { name: "Linen Change & Bed Making", nameEs: "Cambio de Sábanas", price: 20 },
  ];

  for (const a of addOns) {
    const exists = await prisma.serviceAddOn.findFirst({ where: { name: a.name } });
    if (exists) {
      await prisma.serviceAddOn.update({ where: { id: exists.id }, data: { nameEs: a.nameEs } });
    } else {
      await prisma.serviceAddOn.create({ data: { ...a, isActive: true } });
    }
  }
  console.log("✅ Add-ons seeded:", addOns.length);

  // ── TESTIMONIALS ──
  const testimonials = [
    { customerName: "Sofia Reyes", content: "These ladies are absolutely incredible. My apartment has never been this clean. They went above and beyond on everything — even organized my pantry without being asked!", contentEs: "Estas señoras son absolutamente increíbles. Mi apartamento nunca había estado tan limpio. Fueron más allá en todo — ¡incluso organizaron mi despensa sin que se lo pidiera!", rating: 5, location: "Brickell, Miami", isApproved: true, isFeatured: true },
    { customerName: "Marco & Lucia Torres", content: "We used Havana Cleaning for our move-out clean and got our full deposit back — $2,800! The team was professional, on time, and thorough. Worth every penny.", contentEs: "Usamos Havana Cleaning para la limpieza de mudanza y recuperamos nuestro depósito completo — ¡$2,800! El equipo fue profesional, puntual y minucioso. Valió cada centavo.", rating: 5, location: "Coral Gables, Miami", isApproved: true, isFeatured: true },
    { customerName: "Dr. Amanda Chen", content: "I've had many cleaning services over the years. Havana Cleaning is by far the most detail-oriented and trustworthy. The bi-weekly plan is the best decision I've made for my home.", contentEs: "He tenido muchos servicios de limpieza a lo largo de los años. Havana Cleaning es, con diferencia, el más detallista y confiable. El plan quincenal es la mejor decisión que he tomado para mi hogar.", rating: 5, location: "Kendall, Miami", isApproved: true, isFeatured: true },
  ];

  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { customerName: t.customerName } });
    if (exists) {
      await prisma.testimonial.update({ where: { id: exists.id }, data: { contentEs: t.contentEs } });
    } else {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log("✅ Testimonials seeded:", testimonials.length);

  // ── INVENTORY ITEMS ──
  const inventory = [
    { name: "All-Purpose Cleaner", sku: "APC-001", category: "Cleaning Solutions", unit: "bottle", currentStock: 24, minStock: 10, costPerUnit: 8.50, supplier: "EcoClean Supply" },
    { name: "Glass Cleaner", sku: "GC-001", category: "Cleaning Solutions", unit: "bottle", currentStock: 18, minStock: 8, costPerUnit: 6.25, supplier: "EcoClean Supply" },
    { name: "Disinfectant Spray", sku: "DS-001", category: "Cleaning Solutions", unit: "bottle", currentStock: 30, minStock: 12, costPerUnit: 9.00, supplier: "EcoClean Supply" },
    { name: "Microfiber Cloths", sku: "MC-001", category: "Supplies", unit: "pack", currentStock: 40, minStock: 15, costPerUnit: 4.50, supplier: "CleanPro Miami" },
    { name: "Sponges (Multi-Pack)", sku: "SP-001", category: "Supplies", unit: "pack", currentStock: 20, minStock: 8, costPerUnit: 5.00, supplier: "CleanPro Miami" },
    { name: "Trash Bags (Large)", sku: "TB-001", category: "Supplies", unit: "box", currentStock: 15, minStock: 5, costPerUnit: 12.00, supplier: "CleanPro Miami" },
    { name: "Mop Head Refills", sku: "MH-001", category: "Equipment", unit: "each", currentStock: 10, minStock: 4, costPerUnit: 7.50, supplier: "CleanPro Miami" },
    { name: "Toilet Bowl Cleaner", sku: "TBC-001", category: "Cleaning Solutions", unit: "bottle", currentStock: 22, minStock: 10, costPerUnit: 5.75, supplier: "EcoClean Supply" },
    { name: "Latex Gloves (Box)", sku: "LG-001", category: "Protective", unit: "box", currentStock: 12, minStock: 5, costPerUnit: 11.00, supplier: "SafetyFirst Supply" },
    { name: "Vacuum Bags", sku: "VB-001", category: "Equipment", unit: "pack", currentStock: 8, minStock: 3, costPerUnit: 15.00, supplier: "CleanPro Miami" },
  ];

  for (const item of inventory) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: { ...item, isActive: true },
    });
  }
  console.log("✅ Inventory seeded:", inventory.length);

  // ── SETTINGS ──
  const settings = [
    { key: "company_name", value: "Havana Cleaning" },
    { key: "company_phone", value: "(305) 555-CLEAN" },
    { key: "company_email", value: "hello@havanacleaning.com" },
    { key: "company_address", value: "Miami, FL" },
    { key: "business_hours", value: "Mon-Sat 7AM - 7PM" },
    { key: "tax_rate", value: 0.07 },
    { key: "social_facebook", value: "" },
    { key: "social_instagram", value: "" },
    { key: "social_tiktok", value: "" },
    { key: "social_yelp", value: "" },
    { key: "social_google", value: "" },
    { key: "social_nextdoor", value: "" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as any },
    });
  }
  console.log("✅ Settings seeded:", settings.length);

  console.log("\n🎉 Seed complete!");
  console.log("📧 Owner: admin@havanacleaning.com / admin123");
  console.log("📧 Employee: lidia@havanacleaning.com / employee123");
  console.log("📧 Customer: sofia@example.com / customer123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
