import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
