'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-transparent text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{language === 'en' ? 'RadOnco CDSS · Clinical decision support for qualified healthcare professionals.' : 'RadOnco CDSS · Yetkili sağlık profesyonelleri için klinik karar desteği.'}</p>
        <nav aria-label={language === 'en' ? 'Footer navigation' : 'Alt bilgi bağlantıları'} className="flex flex-wrap items-center gap-x-4 gap-y-2 font-medium">
          <Link href="/yasal-uyari" className="text-sky-400 transition hover:text-sky-300">
            {language === 'en' ? 'Medical disclaimer' : 'Yasal Uyarı'}
          </Link>
          <Link href="/iletisim" className="text-sky-400 transition hover:text-sky-300">
            {language === 'en' ? 'Contact & Contribute' : 'İletişim ve Katkı'}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
