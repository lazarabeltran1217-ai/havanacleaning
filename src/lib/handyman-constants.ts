export const HANDYMAN_SERVICES = [
  { key: "minorRepairs", icon: "Wrench", defaultPrice: 85 },
  { key: "furnitureAssembly", icon: "Package", defaultPrice: 120 },
  { key: "tvShelfMounting", icon: "Tv", defaultPrice: 95 },
  { key: "doorWindowFixes", icon: "DoorOpen", defaultPrice: 110 },
  { key: "lightFixtureInstall", icon: "Lightbulb", defaultPrice: 90 },
  { key: "groutTileRepair", icon: "Grid3x3", defaultPrice: 130 },
  { key: "paintingTouchUps", icon: "Paintbrush", defaultPrice: 100 },
  { key: "gutterCleaning", icon: "Droplets", defaultPrice: 150 },
  { key: "pressureWashing", icon: "Waves", defaultPrice: 175 },
  { key: "smartHomeSetup", icon: "Wifi", defaultPrice: 95 },
  { key: "deckFenceRepair", icon: "Fence", defaultPrice: 160 },
  { key: "closetShelving", icon: "LayoutGrid", defaultPrice: 140 },
] as const;

export const NYC_BOROUGHS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "The Bronx",
  "Staten Island",
] as const;

export const NYC_NEIGHBORHOODS = [
  "Astoria",
  "Williamsburg",
  "Harlem",
  "Park Slope",
  "SoHo",
  "Upper West Side",
  "Upper East Side",
  "Bushwick",
  "Long Island City",
  "Chelsea",
  "Tribeca",
  "Greenpoint",
  "Jackson Heights",
  "Flushing",
  "Bay Ridge",
  "Fordham",
  "Riverdale",
] as const;
