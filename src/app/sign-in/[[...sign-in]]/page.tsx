'use client';

import React, { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Radiation, ShieldCheck, Activity, UserPlus, Globe, Award } from 'lucide-react';

export default function SignInPage() {
  const [lang, setLang] = useState<'en' | 'tr'>('en');

  const t = {
    en: {
      platformSubtitle: 'Clinical Decision Support Platform',
      badge: 'Authorized Oncology Physicians',
      title1: 'Radiation Oncology',
      title2: 'Clinical Decision Support',
      title3: 'Platform',
      subtitle: 'Evidence-based clinical staging, adaptive fractionation, and normal tissue constraints.',
      ptv: 'PTV D95% Coverage',
      oar: 'OAR Tolerance: Safe',
      rxDose: 'Prescription Dose (EQD2)',
      dmax: 'Dmax Limit',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      mobileSubtitle: 'Clinical Decision Support System',
    },
    tr: {
      platformSubtitle: 'Klinik Karar Destek Platformu',
      badge: 'Yetkili Onkoloji Hekimleri İçin',
      title1: 'Radyasyon Onkolojisi',
      title2: 'Tedavi Karar Destek',
      title3: 'Platformu',
      subtitle: 'Kanıta dayalı klinik evreleme, fraksiyonasyon felsefesi ve kritik organ güvenlik kısıtları.',
      ptv: 'PTV D95% Kapsamı',
      oar: 'OAR Toleransı: Güvenli',
      rxDose: 'Reçete Dozu (EQD2)',
      dmax: 'Dmax Limit',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Olun',
      mobileSubtitle: 'Klinik Karar Destek Sistemi',
    }
  }[lang];

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex font-sans relative">
      
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
          1. SOL SÜTUN (MASAÜSTÜ HERO EKRANI)
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

        {/* Orta Başlık & Kılavuz Rozetleri & Dozimetri Grafiği */}
        <div className="my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 mb-6">
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
          <p className="text-slate-300 text-sm mt-4 leading-relaxed font-normal">
            {t.subtitle}
          </p>

          {/* AKADEMİK KILAVUZ STANDARTLARI ROZETLERİ (ICRU / QUANTEC BURADA ŞIKÇA DURUR) */}
          <div className="flex flex-wrap gap-2 mt-5">
            {['NCCN v1.2025', 'ASTRO', 'ESTRO', 'ICRU 83/91', 'QUANTEC'].map((badge) => (
              <span
                key={badge}
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800/80 border border-slate-700/80 text-slate-300 tracking-wide"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Doz-Hacim Eğrisi (DVH Görseli) */}
          <div className="mt-8 p-5 rounded-2xl bg-[#0e1726]/80 border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-mono">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Activity className="w-4 h-4" /> {t.ptv}
              </span>
              <span className="text-emerald-400 font-semibold">{t.oar}</span>
            </div>
            <svg viewBox="0 0 300 60" className="w-full h-14 overflow-visible">
              <path
                d="M 0 10 Q 180 12 220 18 T 260 55 L 300 58"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                className="drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]"
              />
              <path
                d="M 0 35 Q 120 38 180 48 T 260 56 L 300 58"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
              <span>0 Gy</span>
              <span>{t.rxDose}</span>
              <span>{t.dmax}</span>
            </div>
          </div>
        </div>

        {/* SOL ALT İMZA */}
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          RadOnc CDSS • <span className="text-slate-200 font-semibold">Designed by Harun PEKMEZCI, MD</span>
        </div>
      </div>

      {/* ==============================================================
          2. SAĞ SÜTUN (ŞIK KOYU TEMA GİRİŞ KARTI)
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

        {/* Giriş Kartı (Göz Almayan Koyu Cam Şıklığı) */}
        <div className="w-full max-w-[420px] flex flex-col items-center">
          <SignIn
            appearance={{
              elements: {
                socialButtons: '!hidden',
                socialButtonsBlockButton: '!hidden',
                dividerRow: '!hidden',
                footer: '!hidden',
                footerAction: '!hidden',

                // Çiğ beyaz yerine koyu medikal kart:
                card: 'bg-[#0e1726]/95 border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full backdrop-blur-xl',
                headerTitle: 'text-white font-bold text-lg text-center',
                headerSubtitle: 'text-slate-400 text-xs text-center mb-4',
                
                formFieldLabel: 'text-xs font-semibold text-slate-300',
                formFieldInput: 'bg-[#131f33] border border-slate-700 text-white rounded-xl py-2.5 px-3.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all',
              },
            }}
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
            Designed by Harun PEKMEZCI, MD
          </div>
        </div>

      </div>

    </div>
  );
}