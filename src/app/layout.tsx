// ============================================================
// ROOT LAYOUT
// ============================================================
// The root layout wraps all pages with:
// - Global CSS
// - Providers (Auth, Query)
// - Metadata for SEO
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nebula | Project Management",
  description: "A futuristic project management platform with 3D visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
