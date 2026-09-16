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
