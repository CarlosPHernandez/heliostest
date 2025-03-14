import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Roboto } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import Script from 'next/script'
import { Suspense } from 'react'
import { Providers } from './providers'
import Loading from './loading'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import GoogleAnalytics from '@/components/GoogleAnalytics'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
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
    <html lang="en" className={roboto.variable}>
      <head>
        {/* Remove the duplicate Google Maps script */}
      </head>
      <body
        className={`
          min-h-screen bg-background font-sans antialiased
          [--radius:0.5rem]
          [--primary:222.2_47.4%_11.2%]
          [--primary-foreground:210_40%_98%]
          [--secondary:210_40%_96.1%]
          [--secondary-foreground:222.2_47.4%_11.2%]
          [--muted:210_40%_96.1%]
          [--muted-foreground:215.4_16.3%_46.9%]
          [--border:214.3_31.8%_91.4%]
          [--input:214.3_31.8%_91.4%]
          [--ring:222.2_84%_4.9%]
        `}
        suppressHydrationWarning
      >
        <Providers>
          <Suspense fallback={<Loading />}>
            <Header />
            <main className="min-h-screen">
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </Suspense>
        </Providers>
        <Analytics />
        <SpeedInsights />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
