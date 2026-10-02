'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Check, ChevronDown, Radiation } from 'lucide-react';

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

const languages = [
  { code: 'TR', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
] as const;

type LanguageCode = (typeof languages)[number]['code'];

const subscribeToLanguageChanges = (onStoreChange: () => void) => {
  window.addEventListener('languageChange', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('languageChange', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
};

const getLanguageSnapshot = (): LanguageCode => (
  window.localStorage.getItem('language') === 'EN' ? 'EN' : 'TR'
);

const getServerLanguageSnapshot = (): LanguageCode => 'TR';

export default function Navbar() {
  const language = useSyncExternalStore(
    subscribeToLanguageChanges,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageMenuRef.current?.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLanguageMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLanguageMenuOpen]);
  const selectLanguage = (selectedLanguage: LanguageCode) => {
    setIsLanguageMenuOpen(false);
    window.localStorage.setItem('language', selectedLanguage);
    window.dispatchEvent(new Event('languageChange'));
  };

  const activeLanguage = languages.find(item => item.code === language) ?? languages[0];

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
        <div className="relative shrink-0" ref={languageMenuRef}>
          <button
            type="button"
            aria-label={`Dil seçimi: ${activeLanguage.label}`}
            aria-haspopup="menu"
            aria-expanded={isLanguageMenuOpen}
            onClick={() => setIsLanguageMenuOpen(open => !open)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0d1527] px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <span aria-hidden="true">{activeLanguage.flag}</span>
            <span>{activeLanguage.code}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {isLanguageMenuOpen && (
            <div
              role="menu"
              aria-label="Dil seçimi"
              className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-slate-700/80 bg-[#0d1527] p-1.5 shadow-2xl backdrop-blur-xl"
            >
              {languages.map(option => (
                <button
                  key={option.code}
                  type="button"
                  role="menuitem"
                  aria-current={language === option.code ? 'true' : undefined}
                  onClick={() => selectLanguage(option.code)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  <span aria-hidden="true">{option.flag}</span>
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs text-slate-400">{option.code}</span>
                  {language === option.code && <Check className="h-4 w-4 text-sky-300" aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
