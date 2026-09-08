import type { Metadata } from "next";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { classesDeFonte } from "@/lib/fontes";

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
    <html lang="pt-BR" className={classesDeFonte}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
