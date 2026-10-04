import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "RadOnco CDSS | Radyasyon Onkolojisi Klinik Karar Destek Sistemi",
    template: "%s | RadOnco CDSS",
  },
  description:
    "Radyasyon onkolojisi uzmanları için kanıta dayalı klinik karar desteği, dozimetri araçları, OAR tolerans kısıtları ve radyo-biyoloji hesaplayıcıları.",
  keywords: [
    "Radyasyon Onkolojisi",
    "Radiation Oncology",
    "CDSS",
    "SBRT",
    "OAR Doz Kısıtları",
    "BED Hesaplama",
    "EQD2",
    "QUANTEC",
    "NCCN",
  ],
  metadataBase: new URL("https://radoncoxia.pro"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "RadOnco CDSS | Radiation Oncology Clinical Decision Support",
    description:
      "Evidence-based clinical decision support and dosimetry tools for radiation oncology professionals.",
    url: "https://radoncoxia.pro",
    siteName: "RadOnco CDSS",
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2255%25%22 font-size=%2278%22 text-anchor=%22middle%22 dominant-baseline=%22central%22>🎯</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={trTR}>
      <html lang="tr" className="dark min-h-screen bg-[#0B1120]">
        <body className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 antialiased">
          <LanguageProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </LanguageProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}