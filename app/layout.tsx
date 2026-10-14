import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BA Tracker — Suivi des activités",
  description:
    "Plateforme de suivi hebdomadaire des activités, livrables et objectifs des Business Analysts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
