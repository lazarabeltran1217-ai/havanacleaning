import { prisma } from "./prisma";
import { BUSINESS } from "./constants";

interface PriceCalcInput {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  addOnIds?: string[];
  selectedItemCount?: number;
}

interface PriceResult {
  basePrice: number;
  addOnsTotal: number;
  itemsExtra: number;
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
    // Fall back to service base price + per-room scaling
    // basePrice is calibrated for 2 bed / 2 bath
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { basePrice: true, pricePerBedroom: true, pricePerBathroom: true },
    });
    if (!service) {
      basePrice = 0;
    } else {
      const perBed = service.pricePerBedroom ?? 25;
      const perBath = service.pricePerBathroom ?? 20;
      basePrice = service.basePrice
        + (input.bedrooms - 2) * perBed
        + (input.bathrooms - 2) * perBath;
      basePrice = Math.max(basePrice, 0);
    }
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

  // Calculate extra items cost
  let itemsExtra = 0;
  if (input.selectedItemCount != null && input.selectedItemCount > 0) {
    const svc = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: { includedItems: true, extraItemPrice: true },
    });
    if (svc && svc.includedItems > 0 && input.selectedItemCount > svc.includedItems) {
      itemsExtra = (input.selectedItemCount - svc.includedItems) * svc.extraItemPrice;
    }
  }

  const subtotal = basePrice + addOnsTotal + itemsExtra;
  const tax = Math.round(subtotal * BUSINESS.taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { basePrice, addOnsTotal, itemsExtra, subtotal, tax, total };
}
