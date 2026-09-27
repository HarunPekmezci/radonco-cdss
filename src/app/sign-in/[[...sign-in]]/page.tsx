'use client';

import React, { useState, useEffect } from 'react';
import { SignIn } from '@clerk/nextjs';
import { Radiation, Globe, Moon, Sun } from 'lucide-react';

export default function SignInPage() {
  const [lang, setLang] = useState<'tr' | 'en'>(() => {
    if (typeof window === 'undefined') return 'tr';
    const saved = window.localStorage.getItem('radonco-lang');
    return saved === 'en' || saved === 'tr' ? saved : 'tr';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('radonco-theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  // Tarayıcıdaki son dil tercihini hatırla
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleLang = (newLang: 'tr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('radonco-lang', newLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('radonco-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <div className="auth-screen min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* SAĞ ÜST KÖŞE: ULUSLARARASI DİL DEĞİŞTİRME BUTONU */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 p-1 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
        <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} className="rounded-full p-1.5 text-amber-500 transition hover:bg-slate-100 dark:text-blue-300 dark:hover:bg-slate-800">
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
        <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 dark:text-slate-300" />
        <div className="flex items-center gap-0.5 text-xs font-semibold">
          <button
            onClick={() => toggleLang('tr')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              lang === 'tr'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => toggleLang('en')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* ========================================================
          SOL PANEL: MİNİMALİST MEDİKAL VİTRİN (7 Kolon)
      ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 xl:p-20 relative">
        
        {/* Zarif & Aydınlık Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <Radiation className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            RadOncCDSS
          </span>
        </div>

        {/* Dinamik Başlık ve Açıklama (TR / EN) */}
        <div className="max-w-md my-auto">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] mb-4">
            {lang === 'tr' ? (
              <>
                Radyasyon Onkolojisi <br />
                <span className="text-blue-600 dark:text-blue-400 font-bold">Tedavi Karar Destek Platformu</span>
              </>
            ) : (
              <>
                Radiation Oncology <br />
                <span className="text-blue-600 dark:text-blue-400 font-bold">Clinical Decision Support</span>
              </>
            )}
          </h1>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {lang === 'tr'
              ? 'Klinik evreleme, fraksiyonasyon ve dozimetrik güvenlik kısıtları.'
              : 'Evidence-based staging, fractionation regimens, and dosimetric safety constraints.'}
          </p>

          {/* Saç Teli İnceliğinde Minimalist Dozimetre Eğrisi */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-sm">
            <div className="h-14 w-full">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 60">
                <path
                  d="M 0,5 Q 230,5 250,22 T 270,58 L 300,60"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M 0,18 Q 80,32 160,45 T 260,58 L 300,60"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-2">
              <span>{lang === 'tr' ? 'PTV D95% Kapsamı' : 'PTV D95% Coverage'}</span>
              <span>{lang === 'tr' ? 'OAR Toleransı' : 'OAR Tolerance'}</span>
            </div>
          </div>
        </div>

        {/* Alt Kurumsal İmza */}
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {lang === 'tr'
            ? 'Yalnızca yetkili sağlık profesyonelleri içindir.'
            : 'Strictly for authorized healthcare professionals and oncologists.'}
        </div>
      </div>

      {/* ========================================================
          SAĞ PANEL: CLERK GİRİŞ ALANI (5 Kolon)
      ======================================================== */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 lg:border-l lg:border-slate-200 dark:lg:border-slate-800">
        
        {/* Mobil Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Radiation className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">RadOncCDSS</span>
        </div>

        {/* Giriş Kartı */}
        <div className="w-full max-w-[380px]">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: '#2563eb',
                colorBackground: theme === 'dark' ? '#0f172a' : '#ffffff',
              },
            }}
          />
        </div>
      </div>

    </div>
  );
}