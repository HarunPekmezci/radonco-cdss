import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'RadOncCDSS',
  description: 'Radyasyon Onkolojisi Tedavi Karar Destek Platformu',
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
    <ClerkProvider>
      <html lang="tr">
        <body className="antialiased bg-[#f8fafc] text-slate-800">{children}</body>
      </html>
    </ClerkProvider>
  );
}