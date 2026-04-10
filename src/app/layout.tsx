import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/mobile/AppShell";
import { BackendPrewarmer } from "@/components/BackendPrewarmer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "Sanskriti AI",
  description: "AI-powered heritage education and tourism platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${devanagari.variable}`}>
      <body className="min-h-screen">
        <Providers>
          <BackendPrewarmer />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
