import type { Config } from "tailwindcss";

export default {
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
      },
    },
  },
  plugins: [require("daisyui")],
  // daisyui: {
  //   themes: "all", // ✅ Enable all DaisyUI themes
  // },
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "abyss", "valentine", "night", 
      "synthwave", "retro", "nord", "dim", "dracula", "lemonade", "caramellatte"
    ],
  },
} satisfies Config;
