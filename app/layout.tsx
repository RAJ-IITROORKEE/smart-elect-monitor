import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/app-toaster";
import { Suspense } from "react";
import { TopLoader } from "@/components/layout/top-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoltEdge — Smart Electricity Monitoring",
  description:
    "IoT-based electricity monitoring for hostels, institutions, and hotels with real-time visibility and automation-ready controls.",
  keywords: ["electricity monitoring", "IoT", "ESP32", "energy automation", "dashboard"],
  authors: [{ name: "VoltEdge Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
