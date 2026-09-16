import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-subtle": "rgb(var(--surface-subtle) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-strong": "rgb(var(--brand-strong) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
      },
      // Etapa 26: Inter vira a fonte padrao de toda a interface (o
      // preflight do Tailwind aplica fontFamily.sans no <html>, entao
      // isso sozinho ja cobre o app inteiro sem tocar em componente).
      fontFamily: {
        sans: [
          "var(--fonte-interface)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        glass: "var(--radius-glass)",
      },
      transitionTimingFunction: {
        glass: "var(--ease-glass)",
      },
      transitionDuration: {
        glass: "250ms",
      },
    },
  },
  plugins: [],
};

export default config;
