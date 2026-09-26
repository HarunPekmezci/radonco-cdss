import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'RadOncCDSS',
  description: 'Radyasyon Onkolojisi Tedavi Karar Destek Platformu',
  icons: {
    // Doğrudan o sarı radyasyon simgesini sekme logosu yapar:
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☢️</text></svg>',
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