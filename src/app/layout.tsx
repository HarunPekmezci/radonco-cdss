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
      <html lang="tr" className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100">
        <body className="min-h-screen antialiased bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100">
          <LanguageProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </LanguageProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}