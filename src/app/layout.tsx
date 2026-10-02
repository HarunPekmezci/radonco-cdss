import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'RadOncCDSS',
  description: 'Radiation Oncology Clinical Decision Support Platform',
  icons: {
    // 4 kenardan dengelenmiş, kesilme yapmayan kusursuz ortalanmış simge:
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2255%25%22 font-size=%2278%22 text-anchor=%22middle%22 dominant-baseline=%22central%22>☢️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={{
        locale: 'en-US',
        formButtonPrimary: 'Sign in',
      }}
    >
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