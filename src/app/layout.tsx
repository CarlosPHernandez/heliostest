import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: "Helios Nexus",
  description: "Empowering the future of energy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} font-sans`}>
      <body className={GeistSans.className}>
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
