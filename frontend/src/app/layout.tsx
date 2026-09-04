import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encarte Gerador",
  description: "Gerador de encartes promocionais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
