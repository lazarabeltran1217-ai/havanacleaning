import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tobacco: "#1a1410",
        rum: "#5C2E00",
        gold: "#C9941A",
        amber: "#E8A820",
        teal: "#1A7A6E",
        caribbean: "#23A99A",
        green: {
          DEFAULT: "#2D6A4F",
          light: "#52B788",
          mint: "#D8F3DC",
        },
        cream: "#F5EDD8",
        ivory: "#FAF6ED",
        sand: "#D4B896",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
        serif: ["Libre Baskerville", "serif"],
      },
    },
  },
  plugins: [typography],
};
export default config;
