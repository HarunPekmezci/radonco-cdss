'use client';

import React, { useState, useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Radiation, ShieldCheck, LogIn, Globe } from 'lucide-react';

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
      badge: 'Healthcare Professional Registration',
      physicianNote: 'Platform intended for healthcare professionals and clinical oncologists.',
      hasAccount: 'Already have an account?',
      signIn: 'Sign In',
      signature: 'Designed by Harun PEKMEZCI, MD',
    },
    tr: {
      platformSubtitle: 'Klinik Karar Destek Sistemi',
      badge: 'Sağlık Profesyoneli Kaydı',
      physicianNote: 'Platform, sağlık profesyonelleri ve klinik onkologlar için tasarlanmıştır.',
      hasAccount: 'Zaten bir hesabınız var mı?',
      signIn: 'Giriş Yapın',
      signature: 'Dr. Harun PEKMEZCİ tarafından dizayn edildi',
    }
  }[lang];

  return (
    <div className="auth-mosaic min-h-screen w-full overflow-x-hidden font-sans text-slate-100">
      <div className="fixed right-4 top-4 z-50">
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0e1726]/90 p-1 text-xs font-semibold shadow-xl backdrop-blur-md">
          <Globe className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => setLang('en')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('tr')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              lang === 'tr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
        </div>
      </div>

      <main className="mx-auto flex min-h-screen w-full max-w-[1600px] overflow-hidden border-x border-slate-800/40">
        <section className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-slate-800/80 bg-[#0a101d]/90 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_70%)] p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="nuclear-box rounded-2xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400 shadow-md">
              <Radiation className="nuclear-icon h-7 w-7" />
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-tight text-white">RadOnc CDSS</span>
              <span className="text-[11px] font-medium text-slate-400">{t.platformSubtitle}</span>
            </div>
          </div>

          <div className="my-auto max-w-lg py-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <ShieldCheck className="h-4 w-4" />
              {t.badge}
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              {lang === 'en' ? 'Clinical decisions, grounded in evidence.' : 'Kanıta dayalı klinik kararlar.'}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              {lang === 'en'
                ? 'Create an account to access the radiation oncology clinical decision support platform.'
                : 'Radyasyon onkolojisi klinik karar destek platformuna erişmek için hesabınızı oluşturun.'}
            </p>
          </div>

          <div className="text-xs font-medium tracking-wide text-slate-400">
            <span className="font-semibold text-slate-200">{t.signature}</span>
          </div>
        </section>

        <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#070b14]/75 p-4 sm:p-8 lg:w-1/2">
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <div className="nuclear-box mb-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400 shadow-md">
              <Radiation className="nuclear-icon h-7 w-7" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RadOnc CDSS</span>
            <span className="mt-0.5 text-xs text-slate-400">{t.platformSubtitle}</span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.badge}
            </div>
          </div>

          <div className="flex w-full max-w-[460px] flex-col items-center">
        <SignUp
          appearance={({
            variables: {
              colorBackground: '#0e1726',
              colorInputBackground: '#1e293b',
              colorInputText: '#ffffff',
              colorText: '#f8fafc',
              colorTextSecondary: '#94a3b8',
              colorPrimary: '#3b82f6',
            },
            elements: {
              socialButtons: '!hidden',
              socialButtonsBlockButton: '!hidden',
              dividerRow: '!hidden',
              footer: '!hidden',
              footerAction: '!hidden',

              // Koyu Cam Şıklığında Kart
              card: '!bg-[#0d1527] !border !border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full backdrop-blur-xl',
              headerTitle: '!text-white font-bold text-lg text-center',
              headerSubtitle: '!text-slate-400 text-xs text-center mb-4',
              
              formFieldLabel: '!text-slate-200 text-xs font-semibold',
              formFieldInput: '!bg-slate-800/90 !text-white placeholder:!text-slate-400 !border-slate-700 rounded-xl py-2.5 px-3.5 text-sm font-medium focus:!border-blue-500',
              phoneInputBox: '!bg-slate-800/90 !text-white !border-slate-700 focus-within:!border-blue-500',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />

        <p className="mt-3 max-w-[420px] text-center text-[11px] leading-relaxed text-slate-500">
          {t.physicianNote}
        </p>

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
        <div className="mt-5 text-center text-xs text-slate-400 font-medium lg:hidden">
          <span className="text-slate-300 font-semibold">{t.signature}</span>
        </div>
      </div>

        </section>
      </main>

    </div>
  );
}