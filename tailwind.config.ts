import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primary Brand Blue — #2F80ED
        primary: {
          DEFAULT: "#2F80ED",
          50:  "#EBF4FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#2F80ED",
          600: "#1D6DD4",
          700: "#1558AB",
        },
        // Primary Brand Teal — #2EC4B6
        accent: {
          DEFAULT: "#2EC4B6",
          50:  "#E6FAF8",
          100: "#B8F0EB",
          300: "#5ED8CE",
          400: "#3DCEC1",
          500: "#2EC4B6",
          600: "#25A99D",
        },
        // Accent Green — #6EDC8C
        brand: {
          green:     "#6EDC8C",
          lightblue: "#56CCF2",
          dark:      "#1F2937",
          bg:        "#F7FAFC",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
