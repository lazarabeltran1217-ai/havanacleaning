import { prisma } from "./prisma";
import { BUSINESS } from "./constants";

interface PriceCalcInput {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  addOnIds?: string[];
}

interface PriceResult {
  basePrice: number;
  addOnsTotal: number;
  subtotal: number;
  tax: number;
  total: number;
}

export async function calculatePrice(input: PriceCalcInput): Promise<PriceResult> {
  // Try to find a pricing rule matching bed/bath count
  const rule = await prisma.pricingRule.findFirst({
    where: {
      serviceId: input.serviceId,
      bedroomsMin: { lte: input.bedrooms },
      bedroomsMax: { gte: input.bedrooms },
      bathroomsMin: { lte: input.bathrooms },
      bathroomsMax: { gte: input.bathrooms },
    },
  });

  let basePrice: number;
  if (rule) {
    basePrice = rule.price;
  } else {
    // Fall back to service base price
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { basePrice: true },
    });
    basePrice = service?.basePrice ?? 0;
  }

  // Calculate add-ons
  let addOnsTotal = 0;
  if (input.addOnIds?.length) {
    const addOns = await prisma.serviceAddOn.findMany({
      where: { id: { in: input.addOnIds }, isActive: true },
      select: { price: true },
    });
    addOnsTotal = addOns.reduce((sum: number, a: { price: number }) => sum + a.price, 0);
  }

  const subtotal = basePrice + addOnsTotal;
  const tax = Math.round(subtotal * BUSINESS.taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { basePrice, addOnsTotal, subtotal, tax, total };
}
