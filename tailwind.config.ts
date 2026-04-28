import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: "#8B5E3C",
          dark: "#3D1F0D",
          red: "#C0392B",
          cream: "#F5F0EB",
          black: "#1c1c1c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
