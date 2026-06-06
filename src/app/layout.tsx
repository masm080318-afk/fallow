import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo-icon.png", sizes: "any", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/favicon.ico",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#5c9e2a",
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
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
