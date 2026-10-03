'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Radiation } from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useLanguage } from '@/context/LanguageContext';

const navigation = [
  { href: '/cdss', labelKey: 'cdss' },
  { href: '/doz-kisitlari', labelKey: 'constraints' },
  { href: '/doz-hesaplayici', labelKey: 'calculator' },
  { href: '/kaynakca', labelKey: 'references' },
  { href: '/yasal-uyari', labelKey: 'disclaimer' },
  { href: '/gizlilik', labelKey: 'privacy' },
  { href: '/iletisim', labelKey: 'contact' },
] as const;

function FlagTR() {
  return (
    <svg className="h-3 w-4 shrink-0 rounded-[2px] shadow-sm" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#e30a17" />
      <circle cx="7.2" cy="7" r="4.1" fill="white" />
      <circle cx="8.7" cy="6.2" r="3.3" fill="#e30a17" />
      <path d="m13.2 4.1.72 1.83 1.97.1-1.53 1.24.52 1.9-1.68-1.05-1.67 1.05.52-1.9-1.53-1.24 1.97-.1z" fill="white" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg className="h-3 w-4 shrink-0 rounded-[2px] shadow-sm" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0 20 14M20 0 0 14" stroke="white" strokeWidth="3.2" />
      <path d="M0 0 20 14M20 0 0 14" stroke="#c8102e" strokeWidth="1.4" />
      <path d="M10 0v14M0 7h20" stroke="white" strokeWidth="4.6" />
      <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="2.4" />
    </svg>
  );
}

const languages = [
  { code: 'tr', Flag: FlagTR },
  { code: 'en', Flag: FlagGB },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { language: currentLang, setLanguage, t } = useLanguage();
  const [isLanguageMenuOpen, setLangOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageMenuRef.current?.contains(event.target)) {
        setLangOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLangOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLanguageMenuOpen]);
  const selectLanguage = (selectedLanguage: typeof currentLang) => {
    setLangOpen(false);
    setLanguage(selectedLanguage);
  };

  const activeLanguage = languages.find(item => item.code === currentLang) ?? languages[0];

  return (
    <header className="sticky top-0 z-[60] bg-[#0B1120] text-slate-100">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-4 px-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-white">
          <span className="nuclear-box flex shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xl text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.24)]">
            <Radiation className="h-5 w-5 nuclear-icon" aria-hidden="true" />
          </span>
          <span>RadOnco Portal</span>
        </Link>
        <nav aria-label={t.nav.mainNavigation} className="relative z-50 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigation.map(item => {
            if (item.href === '/cdss' && !pathname.startsWith('/cdss')) return null;
            const isActive = item.href === '/cdss' && pathname.startsWith('/cdss');
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 rounded-lg px-2.5 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {t.nav[item.labelKey]}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button type="button" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white">
                {currentLang === 'tr' ? 'Giriş yap' : 'Sign in'}
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button type="button" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">
                {currentLang === 'tr' ? 'Kayıt ol' : 'Sign up'}
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <div className="relative shrink-0" ref={languageMenuRef}>
            <button
              type="button"
              aria-label={`${t.nav.languagePicker}: ${t.languageNames[currentLang]}`}
              aria-haspopup="menu"
              aria-expanded={isLanguageMenuOpen}
              onClick={() => setLangOpen(open => !open)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0d1527] px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <activeLanguage.Flag />
              <span>{activeLanguage.code.toUpperCase()}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {isLanguageMenuOpen && (
              <div
                role="menu"
                aria-label={t.nav.languagePicker}
                className="absolute right-0 top-full z-[100] mt-2 w-44 rounded-xl border border-slate-700/80 bg-[#0d1527] p-1.5 shadow-2xl backdrop-blur-xl"
              >
                {languages.map(option => (
                  <button
                    key={option.code}
                    type="button"
                    role="menuitem"
                    aria-current={currentLang === option.code ? 'true' : undefined}
                    onClick={() => selectLanguage(option.code)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                  >
                    <option.Flag />
                    <span className="flex-1">{t.languageNames[option.code]}</span>
                    {currentLang === option.code && (
                      <Check
                        className={`h-4 w-4 ${option.code === 'tr' ? 'text-amber-300' : 'text-sky-300'}`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
