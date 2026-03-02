import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Populating Spanish translations...\n");

  // ── SERVICES ──
  const serviceTranslations: Record<string, { nameEs: string; descriptionEs: string }> = {
    "residential-cleaning": {
      nameEs: "Limpieza Residencial",
      descriptionEs: "Tu limpieza diaria — baños, cocina, pisos, desempolvado, aspirado. Nos encargamos de toda la casa para que puedas relajarte.",
    },
    "deep-cleaning": {
      nameEs: "Limpieza Profunda",
      descriptionEs: "Una limpieza exhaustiva de arriba a abajo incluyendo electrodomésticos, zócalos, ventiladores de techo, marcos de ventanas y todos los rincones olvidados.",
    },
    "move-in-move-out": {
      nameEs: "Mudanza (Entrada/Salida)",
      descriptionEs: "Empieza limpio o sal impecable. Preparamos hogares para nuevos residentes o te ayudamos a recuperar tu depósito de seguridad.",
    },
    "commercial-cleaning": {
      nameEs: "Limpieza Comercial",
      descriptionEs: "Oficinas, espacios comerciales, salas de espera — mantenemos tu negocio con apariencia profesional e higiénica.",
    },
    "post-construction": {
      nameEs: "Limpieza Post-Construcción",
      descriptionEs: "La construcción deja un desastre — polvo, escombros, residuos. Nos encargamos de la limpieza pesada para que tu espacio esté listo para habitar.",
    },
    "airbnb-turnover": {
      nameEs: "Limpieza Airbnb",
      descriptionEs: "Limpieza rápida y completa entre huéspedes. Cambio de sábanas, reposición, preparación para fotos. Entrega el mismo día.",
    },
    "green-clean": {
      nameEs: "Limpieza Ecológica",
      descriptionEs: "Productos 100% no tóxicos, a base de plantas. Perfecto para familias con niños, mascotas o alergias.",
    },
    "recurring-plans": {
      nameEs: "Planes Recurrentes",
      descriptionEs: "Limpieza semanal, quincenal o mensual programada. Ahorra hasta un 20% con un plan recurrente.",
    },
  };

  for (const [slug, translations] of Object.entries(serviceTranslations)) {
    const result = await prisma.service.updateMany({
      where: { slug },
      data: translations,
    });
    if (result.count > 0) {
      console.log(`  Service "${slug}" -> ${translations.nameEs}`);
    }
  }
  console.log("Services updated.\n");

  // ── ADD-ONS ──
  const addOnTranslations: Record<string, string> = {
    "Interior Windows": "Ventanas Interiores",
    "Laundry & Fold": "Lavandería y Doblado",
    "Upholstery Vacuum": "Aspirado de Tapicería",
    "Oven Deep Clean": "Limpieza Profunda de Horno",
    "Fridge Clean-Out": "Limpieza de Refrigerador",
    "Patio / Balcony": "Patio / Balcón",
    "Cabinet Interior": "Interior de Gabinetes",
    "Pet Hair Treatment": "Tratamiento de Pelo de Mascota",
    "Baseboard & Trim": "Zócalos y Molduras",
    "Garage Sweep": "Barrido de Garaje",
    "Ceiling Fan Cleaning": "Limpieza de Ventilador de Techo",
    "Linen Change & Bed Making": "Cambio de Sábanas y Tendido de Cama",
  };

  for (const [name, nameEs] of Object.entries(addOnTranslations)) {
    const result = await prisma.serviceAddOn.updateMany({
      where: { name },
      data: { nameEs },
    });
    if (result.count > 0) {
      console.log(`  Add-on "${name}" -> ${nameEs}`);
    }
  }
  console.log("Add-ons updated.\n");

  // ── TESTIMONIALS ──
  const testimonialTranslations: Record<string, string> = {
    "Sofia Reyes":
      "Estas señoras son absolutamente increíbles. Mi apartamento nunca había estado tan limpio. Fueron más allá en todo — ¡incluso organizaron mi despensa sin que se lo pidiera!",
    "Marco & Lucia Torres":
      "Usamos Havana Cleaning para la limpieza de mudanza y recuperamos nuestro depósito completo — ¡$2,800! El equipo fue profesional, puntual y minucioso. Valió cada centavo.",
    "Dr. Amanda Chen":
      "He tenido muchos servicios de limpieza a lo largo de los años. Havana Cleaning es, con diferencia, el más detallista y confiable. El plan quincenal es la mejor decisión que he tomado para mi hogar.",
  };

  for (const [customerName, contentEs] of Object.entries(testimonialTranslations)) {
    const result = await prisma.testimonial.updateMany({
      where: { customerName },
      data: { contentEs },
    });
    if (result.count > 0) {
      console.log(`  Testimonial "${customerName}" -> translated`);
    }
  }
  console.log("Testimonials updated.\n");

  console.log("Spanish translations seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
