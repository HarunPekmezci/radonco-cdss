import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import DynamicClerkProvider from '@/components/providers/DynamicClerkProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.radoncoxia.pro'),
  title: {
    default: 'RadOnco CDSS | Radiation Oncology Clinical Decision Support',
    template: '%s | RadOnco CDSS',
  },
  description:
    'Evidence-based clinical decision support and dosimetry tools for radiation oncology professionals.',
  keywords: [
    'Radyasyon Onkolojisi',
    'Radiation Oncology',
    'CDSS',
    'SBRT',
    'OAR Doz Kısıtları',
    'BED Hesaplama',
    'EQD2',
    'QUANTEC',
    'NCCN',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'RadOnco CDSS | Radiation Oncology Clinical Decision Support',
    description:
      'Evidence-based clinical decision support and dosimetry tools for radiation oncology professionals.',
    url: 'https://www.radoncoxia.pro',
    siteName: 'RadOnco CDSS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RadOnco CDSS Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RadOnco CDSS | Radiation Oncology Clinical Decision Support',
    description:
      'Evidence-based clinical decision support and dosimetry tools for radiation oncology professionals.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark min-h-screen bg-[#070b14]">
      <body className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 antialiased">
        <LanguageProvider>
          <DynamicClerkProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </DynamicClerkProvider>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}