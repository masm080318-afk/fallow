import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Landing-page typeset (scoped to the marketing landing page, not the app).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soilify Labs — Smart Soil Monitoring",
  description:
    "Where agriculture meets innovation. Real-time soil monitoring, AI-powered irrigation guidance, and SMS alerts for modern farms.",
  applicationName: "Soilify Labs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Soilify Labs",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo-icon.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/logo-icon.png",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2E6B1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${bricolage.variable} ${hanken.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
