import type { Metadata } from "next";

import { AuthProvider } from "@/components/providers/AuthProvider";

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
