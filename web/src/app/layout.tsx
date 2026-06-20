import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThinkPlus — Adaptive Assessment Tool",
  description: "Diagnose mathematical knowledge gaps with AI-powered adaptive assessments for Indian school students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
