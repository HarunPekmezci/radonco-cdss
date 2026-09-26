import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: '☢️ RadOncCDSS',
  description: 'Radyasyon Onkolojisi Tedavi Karar Destek Platformu',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230f172a"/><path d="M50 20 L58 35 A18 18 0 0 0 42 35 Z M25 65 L40 57 A18 18 0 0 0 32 44 Z M75 65 L68 44 A18 18 0 0 0 60 57 Z M50 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" fill="%23f59e0b"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="tr">
        <body className="antialiased bg-[#f8fafc] text-slate-800">{children}</body>
      </html>
    </ClerkProvider>
  );
}