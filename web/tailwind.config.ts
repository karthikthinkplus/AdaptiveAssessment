import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Aeonik", "Inter", "Segoe UI", "sans-serif"],
      },
      colors: {
        primary: "#A089E6",
        "primary-hover": "#B49CF0",
        "primary-light": "rgba(160, 137, 230, 0.15)",
        secondary: "#271A58",
        surface: "#1C1C1C",
        "bg-dark": "#2C303D",
      },
    },
  },
  plugins: [],
};

export default config;
