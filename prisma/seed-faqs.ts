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
    questionEs: "¿Qué áreas de Miami atienden?",
    answer: "We serve all of Miami-Dade County including Brickell, Coral Gables, Kendall, Doral, Hialeah, Miami Beach, Wynwood, Coconut Grove, Little Havana, Homestead, Pinecrest, Aventura, Key Biscayne, Palmetto Bay, South Miami, North Miami, Miami Lakes, Cutler Bay, Sweetwater, and Westchester.",
    answerEs: "Servimos todo el condado de Miami-Dade incluyendo Brickell, Coral Gables, Kendall, Doral, Hialeah, Miami Beach, Wynwood, Coconut Grove, Little Havana, Homestead, Pinecrest, Aventura, Key Biscayne, Palmetto Bay, South Miami, North Miami, Miami Lakes, Cutler Bay, Sweetwater y Westchester.",
    sortOrder: 1,
  },
  {
    pageType: "general",
    question: "How do you vet your cleaning staff?",
    questionEs: "¿Cómo verifican a su personal de limpieza?",
    answer: "All of our cleaning professionals are background-checked and trained to our high standards before they join a team. We take trust seriously — you can feel confident having our team in your home.",
    answerEs: "Todos nuestros profesionales de limpieza pasan por verificación de antecedentes y son capacitados según nuestros altos estándares antes de unirse al equipo. Nos tomamos la confianza en serio — puede sentirse seguro con nuestro equipo en su hogar.",
    sortOrder: 2,
  },
  {
    pageType: "general",
    question: "Do I need to be home during the cleaning?",
    questionEs: "¿Necesito estar en casa durante la limpieza?",
    answer: "No, you don't need to be home. Many of our clients provide entry instructions (lockbox code, doorman, etc.) when they book. You can add special access notes during the booking process.",
    answerEs: "No, no necesita estar en casa. Muchos de nuestros clientes proporcionan instrucciones de acceso (código de cerradura, portero, etc.) al reservar. Puede agregar notas especiales de acceso durante el proceso de reserva.",
    sortOrder: 3,
  },
  {
    pageType: "general",
    question: "Do you bring your own cleaning supplies and equipment?",
    questionEs: "¿Traen sus propios productos y equipos de limpieza?",
    answer: "Yes, we bring all necessary cleaning supplies, equipment, and products. We use high-quality, professional-grade products to get the job done right.",
    answerEs: "Sí, traemos todos los productos, equipos y suministros de limpieza necesarios. Usamos productos de alta calidad y grado profesional para hacer el trabajo bien.",
    sortOrder: 4,
  },
  {
    pageType: "general",
    question: "Do you offer services in Spanish?",
    questionEs: "¿Ofrecen servicios en español?",
    answer: "Yes! We're a Cuban-American family-owned business and our team is fully bilingual in English and Spanish. Our website and booking system are also available in Spanish.",
    answerEs: "¡Sí! Somos un negocio familiar cubano-americano y nuestro equipo es completamente bilingüe en inglés y español. Nuestro sitio web y sistema de reservas también están disponibles en español.",
    sortOrder: 5,
  },

  // Services
  {
    pageType: "service",
    question: "What's included in a standard residential cleaning?",
    questionEs: "¿Qué incluye una limpieza residencial estándar?",
    answer: "Our residential cleaning covers all rooms: vacuuming, mopping, dusting, bathroom sanitizing, kitchen cleaning (counters, sink, stovetop, exterior of appliances), making beds, and taking out trash. We clean your entire home top to bottom.",
    answerEs: "Nuestra limpieza residencial cubre todas las habitaciones: aspirado, trapeado, desempolvado, desinfección de baños, limpieza de cocina (encimeras, fregadero, estufa, exterior de electrodomésticos), tender camas y sacar la basura. Limpiamos toda su casa de arriba a abajo.",
    sortOrder: 1,
  },
  {
    pageType: "service",
    question: "What's the difference between a regular clean and a deep clean?",
    questionEs: "¿Cuál es la diferencia entre una limpieza regular y una limpieza profunda?",
    answer: "A regular clean covers everyday maintenance — surfaces, floors, bathrooms, and kitchen. A deep clean goes further: inside appliances (oven, fridge), baseboards, ceiling fans, window sills, light fixtures, behind furniture, and all those hard-to-reach areas that build up grime over time.",
    answerEs: "Una limpieza regular cubre el mantenimiento diario — superficies, pisos, baños y cocina. Una limpieza profunda va más allá: interior de electrodomésticos (horno, refrigerador), zócalos, ventiladores de techo, marcos de ventanas, lámparas, detrás de muebles y todas esas áreas difíciles de alcanzar que acumulan suciedad con el tiempo.",
    sortOrder: 2,
  },
  {
    pageType: "service",
    question: "What is your Airbnb turnover service?",
    questionEs: "¿Qué es el servicio de rotación de Airbnb?",
    answer: "Our Airbnb turnover service is a quick, thorough clean between guests. It includes full cleaning, linen change, restocking essentials, and staging the property to be photo-ready. We offer same-day turnarounds so you never have to delay a guest check-in.",
    answerEs: "Nuestro servicio de rotación de Airbnb es una limpieza rápida y completa entre huéspedes. Incluye limpieza completa, cambio de sábanas, reabastecimiento de esenciales y preparación de la propiedad para fotos. Ofrecemos entregas el mismo día para que nunca tenga que retrasar el check-in de un huésped.",
    sortOrder: 3,
  },
  {
    pageType: "service",
    question: "Can I request specific products or supplies?",
    questionEs: "¿Puedo solicitar productos o suministros específicos?",
    answer: "Of course! If you have preferences for certain cleaning products or need us to avoid specific chemicals due to allergies or sensitivities, just let us know when you book and we'll accommodate your needs.",
    answerEs: "¡Por supuesto! Si tiene preferencias por ciertos productos de limpieza o necesita que evitemos químicos específicos por alergias o sensibilidades, solo avísenos al reservar y nos adaptaremos a sus necesidades.",
    sortOrder: 4,
  },
  {
    pageType: "service",
    question: "Can you handle post-construction cleanup?",
    questionEs: "¿Pueden hacer limpieza post-construcción?",
    answer: "Yes! Post-construction cleaning is one of our specialties. We remove construction dust, debris, adhesive residue, and do a thorough deep clean to make the space move-in ready. We work with homeowners, contractors, and property managers across Miami-Dade.",
    answerEs: "¡Sí! La limpieza post-construcción es una de nuestras especialidades. Removemos polvo de construcción, escombros, residuos de adhesivo y hacemos una limpieza profunda completa para dejar el espacio listo para habitar. Trabajamos con propietarios, contratistas y administradores de propiedades en todo Miami-Dade.",
    sortOrder: 5,
  },

  // Pricing
  {
    pageType: "pricing",
    question: "How much does a cleaning cost?",
    questionEs: "¿Cuánto cuesta una limpieza?",
    answer: "Pricing depends on the size of your home, the type of service, and any add-ons you choose. Our residential cleaning starts at $120 for smaller homes. You can get an instant quote by using our online booking tool — just enter your home details and we'll show you the price upfront.",
    answerEs: "El precio depende del tamaño de su hogar, el tipo de servicio y los extras que elija. Nuestra limpieza residencial comienza en $120 para hogares más pequeños. Puede obtener una cotización instantánea usando nuestra herramienta de reservas en línea — solo ingrese los detalles de su hogar y le mostraremos el precio por adelantado.",
    sortOrder: 1,
  },
  {
    pageType: "pricing",
    question: "Do you offer discounts for recurring cleanings?",
    questionEs: "¿Ofrecen descuentos por limpiezas recurrentes?",
    answer: "Yes! We offer savings for recurring plans. Weekly, bi-weekly, and monthly clients enjoy discounted rates compared to one-time bookings. The more frequently you book, the more you save. Check our pricing page for details.",
    answerEs: "¡Sí! Ofrecemos ahorros en planes recurrentes. Los clientes semanales, quincenales y mensuales disfrutan de tarifas con descuento comparadas con reservas únicas. Mientras más frecuente reserve, más ahorra. Consulte nuestra página de precios para más detalles.",
    sortOrder: 2,
  },
  {
    pageType: "pricing",
    question: "What payment methods do you accept?",
    questionEs: "¿Qué métodos de pago aceptan?",
    answer: "We accept all major credit cards, debit cards, and cash. Payment is processed securely online when you book. For recurring plans, your card is charged automatically after each cleaning.",
    answerEs: "Aceptamos todas las tarjetas de crédito principales, tarjetas de débito y efectivo. El pago se procesa de forma segura en línea al reservar. Para planes recurrentes, su tarjeta se cobra automáticamente después de cada limpieza.",
    sortOrder: 3,
  },
  {
    pageType: "pricing",
    question: "Is there a cancellation fee?",
    questionEs: "¿Hay algún cargo por cancelación?",
    answer: "We understand plans change. You can cancel or reschedule for free with at least 24 hours' notice. Cancellations within 24 hours of the scheduled cleaning may be subject to a cancellation fee.",
    answerEs: "Entendemos que los planes cambian. Puede cancelar o reprogramar gratis con al menos 24 horas de anticipación. Las cancelaciones dentro de las 24 horas de la limpieza programada pueden estar sujetas a un cargo por cancelación.",
    sortOrder: 4,
  },

  // Service Areas
  {
    pageType: "area",
    question: "Do you serve Miami Beach and the islands?",
    questionEs: "¿Atienden Miami Beach y las islas?",
    answer: "Yes! We serve Miami Beach, South Beach, Key Biscayne, Fisher Island, and surrounding island communities. Our teams are experienced with condo buildings and high-rise properties common in these areas.",
    answerEs: "¡Sí! Servimos Miami Beach, South Beach, Key Biscayne, Fisher Island y comunidades insulares cercanas. Nuestros equipos tienen experiencia con edificios de condominios y propiedades de gran altura comunes en estas áreas.",
    sortOrder: 1,
  },
  {
    pageType: "area",
    question: "How far south do you go?",
    questionEs: "¿Hasta qué punto al sur llegan?",
    answer: "We cover all of Miami-Dade County from Aventura in the north to Homestead and Florida City in the south. This includes Cutler Bay, Palmetto Bay, Pinecrest, and all communities in between.",
    answerEs: "Cubrimos todo el condado de Miami-Dade desde Aventura en el norte hasta Homestead y Florida City en el sur. Esto incluye Cutler Bay, Palmetto Bay, Pinecrest y todas las comunidades intermedias.",
    sortOrder: 2,
  },
  {
    pageType: "area",
    question: "Do you clean commercial properties outside of Miami-Dade?",
    questionEs: "¿Limpian propiedades comerciales fuera de Miami-Dade?",
    answer: "Currently, we focus on Miami-Dade County for both residential and commercial services. If you're in Broward County or nearby, reach out through our booking page and we'll let you know if we can accommodate your location.",
    answerEs: "Actualmente, nos enfocamos en el condado de Miami-Dade para servicios residenciales y comerciales. Si está en el condado de Broward o cerca, comuníquese a través de nuestra página de reservas y le informaremos si podemos atender su ubicación.",
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding FAQs...");

  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (exists) {
      await prisma.fAQ.update({
        where: { id: exists.id },
        data: { questionEs: faq.questionEs, answerEs: faq.answerEs },
      });
    } else {
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
