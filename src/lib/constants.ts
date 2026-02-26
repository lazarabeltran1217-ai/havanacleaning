export const BUSINESS = {
  name: "Havana Cleaning",
  address: "Miami, FL",
  hours: "Mon-Sat 7AM - 7PM",
  taxRate: 0.07, // 7% Florida sales tax
} as const;

export const SERVICE_AREAS = [
  "Brickell",
  "Coral Gables",
  "Kendall",
  "Doral",
  "Hialeah",
  "Miami Beach",
  "Wynwood",
  "Coconut Grove",
  "Little Havana",
  "Homestead",
  "Pinecrest",
  "Aventura",
  "Key Biscayne",
  "Palmetto Bay",
  "South Miami",
  "North Miami",
  "Miami Lakes",
  "Cutler Bay",
  "Sweetwater",
  "Westchester",
] as const;

export const TIME_SLOTS = [
  { label: "Morning (8am - 11am)", value: "morning" },
  { label: "Midday (11am - 2pm)", value: "midday" },
  { label: "Afternoon (2pm - 5pm)", value: "afternoon" },
] as const;

export const LOCALES = ["en", "es"] as const;
export const DEFAULT_LOCALE = "en" as const;
