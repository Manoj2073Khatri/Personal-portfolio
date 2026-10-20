import type { Metadata } from "next";
import { Geist, Geist_Mono, Literata } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import React from "react";
import "./globals.css";
import { ThemeProviderWrapper } from "@/app/components/ThemeProvider/ThemeProvider";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap", style: ["normal", "italic"] });

// Page-level metadata comes from CMS settings in src/app/(site)/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${literata.variable}`}
    >
      <body className="font-sans antialiased">
        <SpeedInsights />
        <Analytics />
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
