/**
 * Holiday & seasonal content calendar for social media auto-generation.
 * Returns content suggestions based on the current date.
 */

interface SeasonalSuggestion {
  contentType: string;
  topic: string;
  hashtags: string[];
}

const HOLIDAYS: { month: number; day: number; name: string; topic: string }[] = [
  { month: 1, day: 1, name: "New Year's Day", topic: "New year, fresh start! Kick off the year with a deep-cleaned home" },
  { month: 1, day: 15, name: "MLK Day (approx)", topic: "Start the year right with a clean, organized home" },
  { month: 2, day: 14, name: "Valentine's Day", topic: "Give your home some love this Valentine's Day with a professional clean" },
  { month: 3, day: 17, name: "St. Patrick's Day", topic: "Lucky you! Spring cleaning season is here" },
  { month: 3, day: 20, name: "First Day of Spring", topic: "Spring cleaning season is officially here! Time for a deep clean" },
  { month: 4, day: 22, name: "Earth Day", topic: "Eco-friendly cleaning tips for a greener home" },
  { month: 5, day: 5, name: "Cinco de Mayo", topic: "Celebra con una casa limpia! Celebrate with a spotless home" },
  { month: 5, day: 11, name: "Mother's Day (approx)", topic: "Give Mom the gift of a clean home this Mother's Day" },
  { month: 5, day: 26, name: "Memorial Day (approx)", topic: "Get your home BBQ-ready for Memorial Day weekend" },
  { month: 6, day: 15, name: "Father's Day (approx)", topic: "Treat Dad to a stress-free weekend with a clean home" },
  { month: 7, day: 4, name: "Independence Day", topic: "Get your home party-ready for the 4th of July" },
  { month: 8, day: 15, name: "Back to School", topic: "Back-to-school season: start fresh with a clean home" },
  { month: 9, day: 1, name: "Labor Day (approx)", topic: "End summer with a deep clean before the fall season" },
  { month: 10, day: 31, name: "Halloween", topic: "Spooky messes? We'll handle the cleanup after Halloween" },
  { month: 11, day: 28, name: "Thanksgiving (approx)", topic: "Get your home guest-ready for Thanksgiving dinner" },
  { month: 12, day: 25, name: "Christmas", topic: "Holiday-ready home: let us handle the pre-holiday deep clean" },
  { month: 12, day: 31, name: "New Year's Eve", topic: "Start the new year with a sparkling clean home" },
];

const SEASONS: { months: number[]; name: string; themes: string[] }[] = [
  {
    months: [3, 4, 5],
    name: "Spring",
    themes: [
      "Spring cleaning deep-dive tips",
      "Allergy-proof your home with a professional clean",
      "Open those windows! Fresh air + clean surfaces",
      "Declutter and deep clean for spring",
    ],
  },
  {
    months: [6, 7, 8],
    name: "Summer",
    themes: [
      "Beat the humidity: cleaning tips for Florida summers",
      "Vacation-ready home cleaning checklist",
      "Keep your home cool and clean this summer",
      "Pool party prep: get your home guest-ready",
    ],
  },
  {
    months: [9, 10, 11],
    name: "Fall",
    themes: [
      "Fall deep cleaning: prepare for the holiday season",
      "Cozy home vibes start with a clean space",
      "Pre-holiday cleaning checklist",
      "Hurricane season prep: clean and organize",
    ],
  },
  {
    months: [12, 1, 2],
    name: "Winter",
    themes: [
      "New year, clean home: fresh start tips",
      "Holiday aftermath cleanup guide",
      "Winter deep cleaning essentials",
      "Indoor air quality matters more in winter",
    ],
  },
];

export function getSeasonalSuggestion(date: Date = new Date()): SeasonalSuggestion {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Check for upcoming holidays (within 5 days)
  const upcomingHoliday = HOLIDAYS.find(
    (h) => h.month === month && Math.abs(h.day - day) <= 5
  );

  if (upcomingHoliday) {
    return {
      contentType: "seasonal",
      topic: upcomingHoliday.topic,
      hashtags: [
        "#cleaning",
        "#homecleaning",
        `#${upcomingHoliday.name.replace(/[^a-zA-Z]/g, "")}`,
        "#havanacleaning",
      ],
    };
  }

  // Fall back to seasonal themes
  const season = SEASONS.find((s) => s.months.includes(month)) || SEASONS[0];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const theme = season.themes[dayOfYear % season.themes.length];

  return {
    contentType: dayOfYear % 3 === 0 ? "tip" : dayOfYear % 3 === 1 ? "seasonal" : "educational",
    topic: theme,
    hashtags: [
      "#cleaning",
      "#homecleaning",
      `#${season.name.toLowerCase()}cleaning`,
      "#havanacleaning",
      "#cleaningtips",
    ],
  };
}

export function getContentTypeForDay(date: Date = new Date()): string {
  const types = ["tip", "promo", "seasonal", "testimonial", "educational", "behind_scenes", "before_after"];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return types[dayOfYear % types.length];
}
