import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

import { Providers } from '@/components/providers/Providers'
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Escenia",
  description: "Plataforma de danza folklórica del Perú",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF3E7]">
        <Providers>
        <NavbarWrapper />

        <main className="flex-1 w-full">
          {children}
          <Toaster position="top-center" richColors />
        </main>

        <Footer />
        </Providers>
      </body>
    </html>
  );
}