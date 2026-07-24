import type { Metadata, Viewport } from "next";
import { Geist, Caveat } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Recettes, nutrition et courses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c41e3a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0a0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} ${caveat.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" sizes="192x192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full antialiased font-sans">{children}</body>
    </html>
  );
}
