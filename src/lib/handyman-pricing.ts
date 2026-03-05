const TAX_RATE = 0.07;
export const HANDYMAN_RUSH_FEE = 50;

export interface HandymanPriceEntry {
  key: string;
  basePrice: number;
}

export interface HandymanPriceResult {
  servicesTotal: number;
  rushFee: number;
  subtotal: number;
  tax: number;
  total: number;
}

export function calculateHandymanTotal(
  prices: HandymanPriceEntry[],
  selectedKeys: string[],
  rush: boolean
): HandymanPriceResult {
  const servicesTotal = selectedKeys.reduce((sum, key) => {
    const entry = prices.find((p) => p.key === key);
    return sum + (entry?.basePrice ?? 0);
  }, 0);

  const rushFee = rush ? HANDYMAN_RUSH_FEE : 0;
  const subtotal = servicesTotal + rushFee;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { servicesTotal, rushFee, subtotal, tax, total };
}
