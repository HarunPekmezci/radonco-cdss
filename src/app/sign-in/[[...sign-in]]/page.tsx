'use client';

import React, { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Radiation, ShieldCheck, Activity, UserPlus, Globe } from 'lucide-react';

export default function SignInPage() {
  const [lang, setLang] = useState<'en' | 'tr'>('en');

  const t = {
    en: {
      platformSubtitle: 'Clinical Decision Support Platform',
      badge: 'Authorized Oncology Physicians',
      title1: 'Radiation Oncology',
      title2: 'Clinical Decision Support',
      title3: 'Platform',
      dvhTitle: 'Dose-Volume Histogram (DVH)',
      ptvLegend: 'PTV (60 Gy)',
      cordLegend: 'Spinal Cord',
      oarLegend: 'Normal Tissue',
      rxDose: '60 Gy (Prescription)',
      dmax: '66 Gy (Dmax)',
      ciLabel: 'Conformity (CI)',
      hiLabel: 'Homogeneity (HI)',
      giLabel: 'Gradient (GI)',
      optimal: 'Optimal',
      target: 'Target',
      steep: 'Steep Fall-off',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      mobileSubtitle: 'Clinical Decision Support System',
      signature: 'Designed by Harun PEKMEZCI, MD',
    },
    tr: {
      platformSubtitle: 'Klinik Karar Destek Platformu',
      badge: 'Yetkili Onkoloji Hekimleri İçin',
      title1: 'Radyasyon Onkolojisi',
      title2: 'Tedavi Karar Destek',
      title3: 'Platformu',
      dvhTitle: 'Doz-Hacim Histogramı (DVH)',
      ptvLegend: 'PTV (60 Gy)',
      cordLegend: 'Spinal Kord',
      oarLegend: 'Normal Doku',
      rxDose: '60 Gy (Reçete)',
      dmax: '66 Gy (Dmax)',
      ciLabel: 'Konformite (CI)',
      hiLabel: 'Homojenite (HI)',
      giLabel: 'Doz Gradyanı (GI)',
      optimal: 'Optimal',
      target: 'Hedef',
      steep: 'Keskin Düşüş',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Olun',
      mobileSubtitle: 'Klinik Karar Destek Sistemi',
      signature: 'Dr. Harun PEKMEZCİ tarafından dizayn edildi',
    }
  }[lang];

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex font-sans relative">
      
      {/* İNGİLİZCE BUTON METNİNİ DİNAMİK YAPAN STİL ENJEKSİYONU */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .cl-formButtonPrimary.en-btn,
          .cl-formButtonPrimary.en-btn * {
            font-size: 0 !important;
          }
          .cl-formButtonPrimary.en-btn::after {
            content: "Sign In →" !important;
            font-size: 0.875rem !important;
            font-weight: 600 !important;
            color: #ffffff !important;
            display: inline-block !important;
            line-height: 1.25rem !important;
          }
        `
      }} />

      {/* ==============================================================
          DİL SEÇİCİ (SAĞ ÜST KÖŞE - EN VARSAYILAN)
         ============================================================== */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-1 bg-[#0e1726]/90 border border-slate-800 rounded-xl p-1 shadow-xl backdrop-blur-md text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('tr')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              lang === 'tr'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
        </div>
      </div>

      {/* ==============================================================
          1. SOL SÜTUN (HERO + DVH KONSOLU)
         ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-slate-800/80 bg-[#0a101d] bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_70%)] relative overflow-hidden">
        
        {/* Üst Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
            <Radiation className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block">RadOnc CDSS</span>
            <span className="text-[11px] text-slate-400 font-medium">{t.platformSubtitle}</span>
          </div>
        </div>

        {/* Ana Başlık */}
        <div className="my-auto py-6 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 mb-5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            {t.badge}
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              {t.title2}
            </span> <br />
            {t.title3}
          </h1>

          {/* DOZ-HACİM HİSTOGRAMI (DVH KONSOLU) */}
          <div className="mt-8 p-5 rounded-3xl bg-[#0e1726]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="font-bold text-white tracking-wide">{t.dvhTitle}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" /> {t.ptvLegend}
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-" /> {t.cordLegend}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> {t.oarLegend}
                </span>
              </div>
            </div>

            <div className="relative w-full h-28 my-1">
              <svg viewBox="0 0 400 110" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="ptvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="cordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="25" x2="400" y2="25" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="55" x2="400" y2="55" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="85" x2="400" y2="85" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="100" y1="0" x2="100" y2="105" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="200" y1="0" x2="200" y2="105" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="300" y1="0" x2="300" y2="105" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

                <path
                  d="M 0 45 Q 80 75 160 95 T 320 105 L 400 105"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                <path
                  d="M 0 15 Q 110 30 180 85 T 260 105 L 400 105 L 0 105 Z"
                  fill="url(#cordGradient)"
                />
                <path
                  d="M 0 15 Q 110 30 180 85 T 260 105 L 400 105"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />

                <path
                  d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105 L 400 105 L 400 105 L 0 105 Z"
                  fill="url(#ptvGradient)"
                />
                <path
                  d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105 L 400 105"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                />

                <circle cx="295" cy="18" r="4.5" fill="#38bdf8" className="animate-ping opacity-75" />
                <circle cx="295" cy="18" r="3" fill="#ffffff" />
                <text x="295" y="8" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">D95%</text>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/80">
              <span>0 Gy</span>
              <span>30 Gy (Kritik Eşik)</span>
              <span>{t.rxDose}</span>
              <span>{t.dmax}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-center">
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.ciLabel}</span>
                <span className="text-xs font-bold font-mono text-emerald-400">0.98 <span className="text-[10px] text-slate-500 font-normal">{t.optimal}</span></span>
              </div>
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.hiLabel}</span>
                <span className="text-xs font-bold font-mono text-sky-400">1.04 <span className="text-[10px] text-slate-500 font-normal">{t.target}</span></span>
              </div>
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.giLabel}</span>
                <span className="text-xs font-bold font-mono text-indigo-400">3.2 <span className="text-[10px] text-slate-500 font-normal">{t.steep}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* SOL ALT İMZA */}
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          <span className="text-slate-200 font-semibold">{t.signature}</span>
        </div>
      </div>

      {/* ==============================================================
          2. SAĞ SÜTUN (DİLE GÖRE DİNAMİK BUTONLU CLERK KARTI)
         ============================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen">
        
        {/* Mobilde Üst Logo */}
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md mb-2.5">
            <Radiation className="w-7 h-7 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">RadOnc CDSS</span>
          <span className="text-xs text-slate-400 mt-0.5">{t.mobileSubtitle}</span>
        </div>

        {/* Giriş Kartı */}
        <div className="w-full max-w-[420px] flex flex-col items-center">
          <SignIn
            appearance={({
              variables: {
                colorBackground: '#0e1726',
                colorInputBackground: '#131f33',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#94a3b8',
                colorPrimary: '#2563eb',
              },
              elements: {
                socialButtons: '!hidden',
                socialButtonsBlockButton: '!hidden',
                dividerRow: '!hidden',
                footer: '!hidden',
                footerAction: '!hidden',

                card: '!bg-[#0e1726] !border !border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full backdrop-blur-xl',
                headerTitle: '!text-white font-bold text-lg text-center',
                headerSubtitle: '!text-slate-400 text-xs text-center mb-4',
                
                formFieldLabel: '!text-slate-300 text-xs font-semibold',
                formFieldInput: '!bg-[#131f33] !border-slate-700 !text-white rounded-xl py-2.5 px-3.5 text-sm focus:!border-blue-500',
                
                // DİL EN İSE en-btn SINIFI İLE "Sign In →" YAPILIR
                formButtonPrimary: `bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all ${
                  lang === 'en' ? 'en-btn' : ''
                }`,
              },
            } as any)}
          />

          {/* Kayıt Ol Bağlantısı */}
          <div className="mt-5 p-3.5 rounded-2xl bg-[#0e1726]/80 border border-slate-800/80 w-full text-center flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>{t.noAccount}</span>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t.signUp}
            </Link>
          </div>

          {/* Mobilde Alt İmza */}
          <div className="lg:hidden mt-6 text-center text-xs text-slate-500 font-medium">
            {t.signature}
          </div>
        </div>

      </div>

    </div>
  );
}