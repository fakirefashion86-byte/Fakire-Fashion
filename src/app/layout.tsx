import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdZone from "@/components/AdZone";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fakire Fashion — Ethnic Wear & Custom Tailoring",
  description: "Shop ethnic wear and order custom-stitched outfits from Fakire Fashion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head></head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Script src="https://adsbender.onrender.com/assets/publisher_tag.js" strategy="afterInteractive" />
        <Header />
        <main className="flex-1">
          {children}
          <AdZone />
        </main>
        <Footer />
      </body>
    </html>
  );
}
