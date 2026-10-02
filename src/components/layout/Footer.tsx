'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-transparent">
      <div className="mx-auto max-w-7xl px-3 py-4 text-center text-xs tracking-wide text-slate-500 sm:px-6">
        <p>{language === 'en' ? 'RadOnco CDSS · Clinical decision support for qualified healthcare professionals.' : 'RadOnco CDSS · Yetkili sağlık profesyonelleri için klinik karar desteği.'}</p>
      </div>
    </footer>
  );
}
