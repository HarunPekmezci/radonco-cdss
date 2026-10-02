'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-[#0B1120] text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{language === 'en' ? 'RadOnco CDSS · Clinical decision support for qualified healthcare professionals.' : 'RadOnco CDSS · Yetkili sağlık profesyonelleri için klinik karar desteği.'}</p>
        <Link href="/yasal-uyari" className="font-medium text-sky-400 transition hover:text-sky-300">
          {language === 'en' ? 'Medical disclaimer' : 'Tıbbi sorumluluk reddi'}
        </Link>
      </div>
    </footer>
  );
}
