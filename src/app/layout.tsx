import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "./components/registerSW";
import Header from "./components/header";

// Font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />

        {/* Tell iOS this is a standalone web app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Icon for “Add to Home Screen” on iOS */}
        <link
          rel="apple-touch-icon"
          href="/icons/logo-180.png"
          sizes="180x180"
        />

        {/* Theme color for the status bar (used on Android too) */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <RegisterSW />

        <Header />
        {children}
        </body>
    </html>
  );
}