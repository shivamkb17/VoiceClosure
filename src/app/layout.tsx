import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "VoiceCloser AI — Your AI Receptionist That Never Sleeps",
  description:
    "VoiceCloser AI is a browser-based AI receptionist that talks to customers naturally, qualifies leads, books appointments, and collects payments automatically using Stripe.",
  keywords: [
    "AI receptionist",
    "voice AI",
    "appointment booking",
    "lead qualification",
    "Stripe payments",
    "conversational AI",
    "dental clinic AI",
    "small business automation",
  ],
  openGraph: {
    title: "VoiceCloser AI — Your AI Receptionist That Never Sleeps",
    description:
      "AI-powered voice receptionist for small businesses. Qualify leads, book appointments, and collect payments — all automatically.",
    type: "website",
    siteName: "VoiceCloser AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "VoiceCloser AI — AI Receptionist for Small Businesses",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
