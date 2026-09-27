'use client';

import React, { useState, useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Radiation, ShieldCheck, LogIn, Globe, AlertCircle, Building2 } from 'lucide-react';

export default function SignUpPage() {
  const [lang, setLang] = useState<'en' | 'tr'>('en');

  // Kayıt sayfasındaki butonu "Sign Up" / "Kayıt Ol" yapan native efekt
  useEffect(() => {
    const updateButtonText = () => {
      const btn = document.querySelector<HTMLButtonElement>('.cl-formButtonPrimary');
      if (btn) {
        const expectedText = lang === 'en' ? 'Sign Up' : 'Kayıt Ol';
        if (btn.innerText !== expectedText) {
          btn.innerText = expectedText;
        }
      }
    };
    updateButtonText();
    const interval = setInterval(updateButtonText, 100);
    return () => clearInterval(interval);
  }, [lang]);

  const t = {
    en: {
      platformSubtitle: 'Clinical Decision Support System',
      badge: 'Institutional & Academic Registration',
      institutionalNoticeTitle: 'Institutional Email Required',
      institutionalNoticeText: 'Please register with your university (.edu, .edu.tr) or verified hospital email. Personal email domains (gmail, yahoo, etc.) are restricted.',
      hasAccount: 'Already have an account?',
      signIn: 'Sign In',
      signature: 'Designed by Harun PEKMEZCI, MD',
    },
    tr: {
      platformSubtitle: 'Klinik Karar Destek Sistemi',
      badge: 'Kurumsal & Akademik Erişim Kaydı',
      institutionalNoticeTitle: 'Kurumsal E-Posta Zorunluluğu',
      institutionalNoticeText: 'Lütfen üniversite (.edu, .edu.tr) veya onaylı hastane e-postanız ile kaydolun. Kişisel e-posta adresleri (gmail, hotmail vb.) onaylanmamaktadır.',
      hasAccount: 'Zaten bir hesabınız var mı?',
      signIn: 'Giriş Yapın',
      signature: 'Dr. Harun PEKMEZCİ tarafından dizayn edildi',
    }
  }[lang];

  return (
    <div className="min-h-screen w-full bg-[#070b14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),transparent_70%)] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative">
      
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
          ÜST KURUMSAL LOGO VE BAŞLIK
         ============================================================== */}
      <div className="w-full max-w-[460px] mb-4 flex flex-col items-center text-center">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md mb-2.5">
          <Radiation className="w-8 h-8 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          RadOnc CDSS
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          {t.platformSubtitle}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[11px] font-semibold text-blue-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          {t.badge}
        </div>
      </div>

      {/* ==============================================================
          KURUMSAL / AKADEMİK E-POSTA ZORUNLULUĞU BİLGİ KUTUSU
         ============================================================== */}
      <div className="w-full max-w-[460px] mb-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 flex items-start gap-2.5 text-xs shadow-sm">
        <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            {t.institutionalNoticeTitle}
          </span>
          <span className="text-[11px] text-amber-200/90 leading-relaxed block font-medium">
            {t.institutionalNoticeText}
          </span>
        </div>
      </div>

      {/* ==============================================================
          KOYU TEMA CLERK KAYIT KARTI (SIGN-UP)
         ============================================================== */}
      <div className="w-full max-w-[460px] flex flex-col items-center">
        <SignUp
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

              // Koyu Cam Şıklığında Kart
              card: '!bg-[#0e1726] !border !border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full backdrop-blur-xl',
              headerTitle: '!text-white font-bold text-lg text-center',
              headerSubtitle: '!text-slate-400 text-xs text-center mb-4',
              
              formFieldLabel: '!text-slate-300 text-xs font-semibold',
              formFieldInput: '!bg-[#131f33] !border-slate-700 !text-white rounded-xl py-2.5 px-3.5 text-sm focus:!border-blue-500',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all',
            },
          } as any)}
        />

        {/* Zaten Hesabınız Var mı? -> Giriş Yap Bağlantısı */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#0e1726]/80 border border-slate-800/80 w-full text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>{t.hasAccount}</span>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            {t.signIn}
          </Link>
        </div>

        {/* ALT İMZA */}
        <div className="mt-5 text-center text-xs text-slate-400 font-medium">
          <span className="text-slate-300 font-semibold">{t.signature}</span>
        </div>
      </div>

    </div>
  );
}