import Link from 'next/link';
import { Radiation } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Portal' },
  { href: '/cdss', label: 'CDSS' },
  { href: '/doz-kisitlari', label: 'Doz Kısıtları' },
  { href: '/doz-hesaplayici', label: 'Doz Hesaplayıcı' },
  { href: '/ai-asistan', label: 'AI Asistan' },
  { href: '/kaynakca', label: 'Kaynakça' },
  { href: '/yasal-uyari', label: 'Yasal Uyarı' },
  { href: '/iletisim', label: 'İletişim' },
] as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0a0f1d]/95 text-slate-100 shadow-lg shadow-black/10 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-4 px-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-white">
          <Radiation className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <span>RadOnco <span className="text-sky-400">Portal</span></span>
        </Link>
        <nav aria-label="Ana navigasyon" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigation.slice(1).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-2.5 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
