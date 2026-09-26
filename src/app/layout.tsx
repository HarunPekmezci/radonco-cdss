import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'RadOncCDSS',
  description: 'Radyasyon Onkolojisi Tedavi Karar Destek Platformu',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f59e0b"/><circle cx="50" cy="50" r="42" fill="%230f172a"/><path d="M50 18 L58 36 A20 20 0 0 0 41 36 Z M22 66 L39 56 A20 20 0 0 0 30 41 Z M78 66 L69 41 A20 20 0 0 0 61 56 Z M50 50 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0" fill="%23f59e0b"/></svg>',
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