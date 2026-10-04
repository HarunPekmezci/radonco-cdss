'use client';

import React, { useMemo } from 'react';
import { SignIn } from '@clerk/nextjs';
import { trTR, enUS } from '@clerk/localizations';
import Link from 'next/link';
import { Radiation, ShieldCheck, Activity, UserPlus, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SignInPage() {
  const { language, setLanguage } = useLanguage();

  const t = {
    en: {
      platformSubtitle: 'Clinical Decision Support System',
      badge: 'For Healthcare Professionals',
      mainHeadline1: 'Radiation Oncology',
      mainHeadline2: 'Clinical Decision Support',
      mainHeadline3: 'Platform',
      dvhTitle: 'Dose-Volume Histogram (DVH)',
      ptvLegend: 'PTV (60 Gy)',
      cordLegend: 'Spinal Cord',
      oarLegend: 'Normal Tissue',
      rxDose: '60 Gy (Prescription)',
      criticalThreshold: '30 Gy (Critical Threshold)',
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
      physicianNote: 'For clinical decision support, does not replace medical judgment.',
      signature: 'Designed by Harun PEKMEZCI, MD',
    },
    tr: {
      platformSubtitle: 'Klinik Karar Destek Sistemi',
      badge: 'Sağlık Profesyonelleri İçin',
      mainHeadline1: 'Radyasyon Onkolojisi',
      mainHeadline2: 'Klinik Karar Destek',
      mainHeadline3: 'Platformu',
      dvhTitle: 'Doz-Hacim Histogramı (DVH)',
      ptvLegend: 'PTV (60 Gy)',
      cordLegend: 'Spinal Kord / Medulla',
      oarLegend: 'Normal Doku',
      rxDose: '60 Gy (Reçete)',
      criticalThreshold: '30 Gy (Kritik Eşik)',
      dmax: '66 Gy (Dmax)',
      ciLabel: 'Konformite (CI)',
      hiLabel: 'Homojenite (HI)',
      giLabel: 'Doz Gradyanı (GI)',
      optimal: 'Optimal',
      target: 'Hedef',
      steep: 'Keskin Doz Düşüşü',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Ol',
      mobileSubtitle: 'Klinik Karar Destek Sistemi',
      physicianNote: 'Klinik karar desteği içindir, hekim sorumluluğunun yerini almaz.',
      signature: 'Dr. Harun PEKMEZCİ tarafından dizayn edildi',
    },
  }[language];

  const clerkLocalization = useMemo(() => {
    if (language === 'tr') {
      return {
        ...trTR,
        formButtonPrimary: 'Giriş Yap',
        formFieldLabel__identifier: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__identifier: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__emailAddress_username: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__emailAddress_username: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__emailAddress: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__emailAddress: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__username: 'Kullanıcı adı',
        formFieldInputPlaceholder__username: 'Kullanıcı adı',
        formFieldLabel__password: 'Şifre',
        formFieldInputPlaceholder__password: 'Şifre',
        signIn: {
          ...trTR.signIn,
          start: {
            ...trTR.signIn?.start,
            title: 'Giriş yap',
            subtitle: 'RadOnco CDSS ile devam etmek için',
            actionText: 'Hesabınız yok mu?',
            actionLink: 'Kayıt Ol',
          },
          password: {
            ...trTR.signIn?.password,
            title: 'Şifrenizi girin',
            subtitle: 'RadOnco CDSS ile devam etmek için',
          },
        },
      };
    }
    return {
      ...enUS,
      formButtonPrimary: 'Sign In',
      formFieldLabel__identifier: 'Email address or username',
      formFieldInputPlaceholder__identifier: 'Email address or username',
      formFieldLabel__emailAddress_username: 'Email address or username',
      formFieldInputPlaceholder__emailAddress_username: 'Email address or username',
      formFieldLabel__emailAddress: 'Email address',
      formFieldInputPlaceholder__emailAddress: 'Email address',
      formFieldLabel__username: 'Username',
      formFieldInputPlaceholder__username: 'Username',
      formFieldLabel__password: 'Password',
      formFieldInputPlaceholder__password: 'Password',
      signIn: {
        ...enUS.signIn,
        start: {
          ...enUS.signIn?.start,
          title: 'Sign in to RadOnco CDSS',
          subtitle: 'Welcome back! Please sign in to continue',
          actionText: "Don't have an account?",
          actionLink: 'Sign Up',
        },
        password: {
          ...enUS.signIn?.password,
          title: 'Enter your password',
          subtitle: 'to continue to RadOnco CDSS',
        },
      },
    };
  }, [language]);

  return (
    <div className={`auth-mosaic min-h-screen w-full text-slate-100 font-sans relative overflow-x-hidden ${language === 'en' ? 'en-mode' : 'tr-mode'}`}>
      
      {/* 6 AYRI OTP KUTUSU VE ÖZEL FORM STİLLERİ */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* E-POSTA KİMLİK METNİ */
          .cl-identityPreviewText {
            color: #f8fafc !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
          }
          .cl-identityPreviewEditButtonIcon {
            color: #60a5fa !important;
          }

          /* 6 AYRI OTP DOĞRULAMA KUTUSUNU NETLEŞTİREN DOĞRU KURAL */
          .cl-otpCodeFieldInputs div,
          .cl-otpCodeFieldInputs input,
          .cl-otpCodeFieldInputs span,
          .cl-otpCodeField [class*="segment"],
          .cl-otpCodeField [class*="digit"] {
            background-color: #16253d !important;
            border: 1.5px solid #475569 !important;
            border-radius: 0.75rem !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
          }

          /* KOD TEKRAR GÖNDER LİNKİ (RESEND) */
          .cl-formResendCodeLink,
          button[data-localization-key*="resend"] {
            color: #60a5fa !important;
            font-weight: 600 !important;
          }

          /* ŞİFRE SIFIRLAMA METOT BUTONLARI */
          .cl-alternativeMethodsBlockButton {
            background-color: #131f33 !important;
            border: 1px solid #334155 !important;
          }
          .cl-alternativeMethodsBlockButtonText {
            color: #f8fafc !important;
            font-weight: 600 !important;
          }

          /* YENİ CİHAZ DOĞRULAMA UYARI KUTUSU */
          div[class*="alert"],
          .cl-alert {
            background-color: rgba(245, 158, 11, 0.1) !important;
            border: 1px solid rgba(245, 158, 11, 0.3) !important;
            color: #fde68a !important;
          }
          div[class*="alert"] *,
          .cl-alert * {
            color: #fde68a !important;
          }
        `
      }} />

      {/* ==============================================================
          DİL SEÇİCİ (SAĞ ÜST KÖŞE)
         ============================================================== */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-1 bg-[#0e1726]/90 border border-slate-800 rounded-xl p-1 shadow-xl backdrop-blur-md text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('tr')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'tr'
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
      <main className="mx-auto flex min-h-screen w-full max-w-[1600px] overflow-hidden border-x border-slate-800/40">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-slate-800/80 bg-[#0a101d]/90 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_70%)] relative overflow-hidden">
        
        {/* Ana Başlık */}
        <div className="my-auto py-6 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 mb-5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            {t.badge}
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.mainHeadline1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              {t.mainHeadline2}
            </span> <br />
            {t.mainHeadline3}
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
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> {t.cordLegend}
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
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid çizgileri */}
                <line x1="0" y1="27.5" x2="400" y2="27.5" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" />
                <line x1="0" y1="55" x2="400" y2="55" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" />
                <line x1="0" y1="82.5" x2="400" y2="82.5" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" />
                <line x1="100" y1="0" x2="100" y2="105" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
                <line x1="200" y1="0" x2="200" y2="105" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
                <line x1="300" y1="0" x2="300" y2="105" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />

                <path
                  d="M 0 35 Q 40 70 90 95 T 190 105 L 400 105"
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
                  d="M 0 15 Q 110 30 180 85 T 260 105"
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

                <circle r="3" fill="#38bdf8" filter="url(#neonGlow)">
                  <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" dur="3.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0.8;0" dur="3.8s" repeatCount="indefinite" />
                </circle>

                <circle r="2.2" fill="#93c5fd" filter="url(#neonGlow)">
                  <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0.8;0" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                </circle>

                <circle r="2.5" fill="#fbbf24" filter="url(#neonGlow)">
                  <animateMotion path="M 0 15 Q 110 30 180 85 T 260 105" dur="3.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0.7;0" dur="3.1s" repeatCount="indefinite" />
                </circle>

                <circle cx="160" cy="50" r="2.5" fill="#38bdf8">
                  <animate attributeName="r" values="1;3.5;1" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.1;0.85;0.1" dur="2.4s" repeatCount="indefinite" />
                </circle>

                <circle cx="295" cy="18" r="3" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                <text x="295" y="8" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">D95%</text>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/80">
              <span>0 Gy</span>
              <span>{t.criticalThreshold}</span>
              <span>{t.rxDose}</span>
              <span>{t.dmax}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-center">
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.ciLabel}</span>
                <span className="text-xs font-bold font-mono text-emerald-400">0.98 <span className="text-[10px] text-slate-400 font-normal">{t.optimal}</span></span>
              </div>
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.hiLabel}</span>
                <span className="text-xs font-bold font-mono text-sky-400">1.04 <span className="text-[10px] text-slate-400 font-normal">{t.target}</span></span>
              </div>
              <div className="bg-[#111c2e]/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-mono">{t.giLabel}</span>
                <span className="text-xs font-bold font-mono text-indigo-400">3.2 <span className="text-[10px] text-slate-400 font-normal">{t.steep}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* SOL ALT İMZA VE YASAL UYARI */}
        <div className="flex flex-col gap-1 text-xs text-slate-400 font-medium tracking-wide">
          <p className="text-[11px] text-slate-400 leading-relaxed">{t.physicianNote}</p>
          <span className="text-slate-300 font-semibold">{t.signature}</span>
        </div>
      </div>

      {/* ==============================================================
          2. SAĞ SÜTUN (ŞIK KOYU TEMA CLERK GİRİŞ KARTI)
         ============================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen">
        
        {/* Mobilde Üst Logo */}
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md mb-2.5 nuclear-box">
            <Radiation className="w-7 h-7 nuclear-icon" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">RadOnc CDSS</span>
          <span className="text-xs text-slate-400 mt-0.5">{t.mobileSubtitle}</span>
        </div>

        {/* Giriş Kartı */}
        <div className="w-full max-w-[420px] flex flex-col items-center">
          <SignIn
            key={language}
            {...({ localization: clerkLocalization } as any)}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
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

                card: '!bg-[#0d1527] !border !border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full backdrop-blur-xl',
                headerTitle: '!text-white font-bold text-lg text-center',
                headerSubtitle: '!text-slate-400 text-xs text-center mb-4',
                
                identityPreview: '!bg-[#131f33]/80 !border !border-slate-700/80 !rounded-xl !py-2 !px-3.5 mb-3 flex items-center justify-between',
                identityPreviewText: '!text-white !font-bold text-sm',
                identityPreviewEditButton: '!text-blue-400 hover:!text-blue-300',

                formFieldLabel: '!text-slate-200 text-xs font-semibold',
                formFieldInput: '!bg-slate-800/90 !text-white placeholder:!text-slate-400 !border-slate-700 rounded-xl py-2.5 px-3.5 text-sm font-medium focus:!border-blue-500',
                phoneInputBox: '!bg-slate-800/90 !text-white !border-slate-700 focus-within:!border-blue-500',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all',
              },
            } as any)}
          />

          <p className="mt-3 max-w-[420px] text-center text-[11px] leading-relaxed text-slate-400">
            {t.physicianNote}
          </p>

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
          <div className="lg:hidden mt-6 text-center text-xs text-slate-400 font-medium">
            {t.signature}
          </div>
        </div>

      </div>

      </main>

    </div>
  );
}