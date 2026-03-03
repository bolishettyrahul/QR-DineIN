import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineBanner } from "@/components/OfflineBanner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "QR-Dine | Smart Restaurant Ordering",
  description: "Scan, Order, Enjoy - QR-based dine-in ordering system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
