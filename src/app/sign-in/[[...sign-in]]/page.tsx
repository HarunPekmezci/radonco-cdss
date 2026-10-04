'use client';

import React, { useMemo } from 'react';
import { SignIn } from '@clerk/nextjs';
import { trTR, enUS } from '@clerk/localizations';
import Link from 'next/link';
import { Activity, UserPlus, Globe, ShieldCheck, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SignInPage() {
  const { language, setLanguage } = useLanguage();

  const t = {
    en: {
      badge: 'For Healthcare Professionals',
      headline1: 'Radiation Oncology',
      headline2: 'Clinical Decision Support Platform',
      chip1: 'Dual α/β Dosimetry & Differential EQD2 Engine',
      chip2: 'QUANTEC, HyTEC & TG-101 Tolerance Atlas',
      chip3: 'International Treatment Guidelines (NCCN, ASTRO, ESTRO)',
      dvhTitle: 'Dose-Volume Histogram (DVH)',
      ptvLegend: 'PTV (60 Gy)',
      cordLegend: 'Spinal Cord',
      oarLegend: 'Normal Tissue',
      rxDose: '60 Gy (Rx)',
      criticalThreshold: '30 Gy (Constraint)',
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
      physicianNote: 'For clinical decision support. Does not replace physician judgment.',
      signature: 'Designed by Harun PEKMEZCI, MD',
    },
    tr: {
      badge: 'Sağlık Profesyonelleri İçin',
      headline1: 'Radyasyon Onkolojisi',
      headline2: 'Klinik Karar Destek Platformu',
      chip1: 'Çift α/β Dozimetri & Diferansiyel EQD2',
      chip2: 'QUANTEC, HyTEC & TG-101 Tolerans Atlası',
      chip3: 'Uluslararası Tedavi Kılavuzları (NCCN, ASTRO, ESTRO)',
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
    <div className={`auth-mosaic min-h-screen w-full text-slate-100 font-sans relative overflow-x-hidden flex flex-col ${language === 'en' ? 'en-mode' : 'tr-mode'}`}>

      {/* ── CLERK OTP & FORM OVERRIDES ─────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .cl-identityPreviewText { color:#f8fafc!important; font-weight:600!important; font-size:0.875rem!important; }
          .cl-identityPreviewEditButtonIcon { color:#60a5fa!important; }
          .cl-otpCodeFieldInputs div,
          .cl-otpCodeFieldInputs input,
          .cl-otpCodeFieldInputs span,
          .cl-otpCodeField [class*="segment"],
          .cl-otpCodeField [class*="digit"] {
            background-color:#16253d!important;
            border:1.5px solid #475569!important;
            border-radius:0.75rem!important;
            color:#ffffff!important;
            font-weight:700!important;
            box-shadow:0 2px 4px rgba(0,0,0,0.3)!important;
          }
          .cl-formResendCodeLink, button[data-localization-key*="resend"] {
            color:#60a5fa!important; font-weight:600!important;
          }
          .cl-alternativeMethodsBlockButton {
            background-color:#131f33!important; border:1px solid #334155!important;
          }
          .cl-alternativeMethodsBlockButtonText { color:#f8fafc!important; font-weight:600!important; }
          div[class*="alert"], .cl-alert {
            background-color:rgba(245,158,11,0.1)!important;
            border:1px solid rgba(245,158,11,0.3)!important;
            color:#fde68a!important;
          }
          div[class*="alert"] *, .cl-alert * { color:#fde68a!important; }
        `
      }} />

      {/* ── LANGUAGE TOGGLE ─────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 4xl:top-8 4xl:right-8 z-50">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl 4xl:rounded-2xl p-1 4xl:p-1.5 shadow-xl shadow-black/40 backdrop-blur-md text-xs 2xl:text-sm 4xl:text-base font-semibold">
          <Globe className="w-3.5 h-3.5 4xl:w-4.5 4xl:h-4.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 4xl:px-3.5 4xl:py-1.5 rounded-lg 4xl:rounded-xl transition-all ${
              language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('tr')}
            className={`px-2.5 py-1 4xl:px-3.5 4xl:py-1.5 rounded-lg 4xl:rounded-xl transition-all ${
              language === 'tr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
        </div>
      </div>

      {/* ── CENTERED WORKSTATION COMPOSITION ────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center w-full px-6 lg:px-12 2xl:px-16 4xl:px-24 py-12 4xl:py-20">
        <div className="w-full mx-auto max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1700px] 4xl:max-w-[2200px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 3xl:gap-16 4xl:gap-24 items-center">

          {/* ════════════════════════════════════════════════════════════
              LEFT HERO PANE  (7 / 12 cols on desktop)
             ════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-6 4xl:gap-8 relative">
            {/* Ambient glow behind hero */}
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_70%_60%_at_10%_30%,rgba(14,165,233,0.07),transparent_60%)] pointer-events-none" />
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_50%_50%_at_90%_80%,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              {/* Emerald clinical badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 4xl:px-4 4xl:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs 2xl:text-sm 4xl:text-base font-semibold text-emerald-400 mb-5 4xl:mb-8 shadow-sm">
                <span className="animate-pulse w-2 h-2 4xl:w-2.5 4xl:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                {t.badge}
              </div>

              {/* Main headline */}
              <h1 className="text-3xl lg:text-4xl 2xl:text-5xl 3xl:text-6xl 4xl:text-7xl font-extrabold tracking-tight leading-tight mb-6 4xl:mb-8">
                <span className="text-white">{t.headline1}</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                  {t.headline2}
                </span>
              </h1>

              {/* Feature value-prop chips */}
              <div className="flex flex-col gap-2.5 4xl:gap-3.5 mb-7 4xl:mb-9">
                <div className="flex items-center gap-3 4xl:gap-4 px-4 py-2.5 4xl:px-5 4xl:py-3.5 rounded-xl 4xl:rounded-2xl bg-sky-500/[0.07] border border-sky-500/[0.15] hover:border-sky-400/30 transition-colors">
                  <span className="text-base 4xl:text-xl leading-none flex-shrink-0">⚡</span>
                  <p className="text-xs 2xl:text-sm 4xl:text-base font-medium text-slate-300 leading-snug">{t.chip1}</p>
                </div>
                <div className="flex items-center gap-3 4xl:gap-4 px-4 py-2.5 4xl:px-5 4xl:py-3.5 rounded-xl 4xl:rounded-2xl bg-violet-500/[0.07] border border-violet-500/[0.15] hover:border-violet-400/30 transition-colors">
                  <span className="text-base 4xl:text-xl leading-none flex-shrink-0">🛡️</span>
                  <p className="text-xs 2xl:text-sm 4xl:text-base font-medium text-slate-300 leading-snug">{t.chip2}</p>
                </div>
                <div className="flex items-center gap-3 4xl:gap-4 px-4 py-2.5 4xl:px-5 4xl:py-3.5 rounded-xl 4xl:rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/[0.15] hover:border-emerald-400/30 transition-colors">
                  <span className="text-base 4xl:text-xl leading-none flex-shrink-0">📚</span>
                  <BookOpen className="hidden w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs 2xl:text-sm 4xl:text-base font-medium text-slate-300 leading-snug">{t.chip3}</p>
                </div>
              </div>

              {/* ── DVH CONSOLE ─────────────────────────────────────── */}
              <div className="p-5 2xl:p-6 4xl:p-8 rounded-2xl 4xl:rounded-3xl bg-slate-900/70 border border-slate-700/50 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* DVH header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 4xl:mb-4 text-xs 2xl:text-sm 4xl:text-base">
                  <div className="flex items-center gap-2 4xl:gap-2.5">
                    <Activity className="w-4 h-4 4xl:w-5 4xl:h-5 text-sky-400 animate-pulse" />
                    <span className="font-bold text-white tracking-wide">{t.dvhTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 4xl:gap-4 text-[11px] 2xl:text-xs 4xl:text-sm font-mono">
                    <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                      <span className="w-2 h-2 4xl:w-2.5 4xl:h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" /> {t.ptvLegend}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="w-2 h-2 4xl:w-2.5 4xl:h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> {t.cordLegend}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 4xl:w-2.5 4xl:h-2.5 rounded-full bg-emerald-400" /> {t.oarLegend}
                    </span>
                  </div>
                </div>

                {/* SVG DVH chart */}
                <div className="relative w-full h-28 2xl:h-32 3xl:h-36 4xl:h-44 my-1 4xl:scale-110 4xl:origin-top-left">
                  <svg viewBox="0 0 400 110" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="si-ptvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="si-cordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="si-neon" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="si-ptvGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    {[27.5, 55, 82.5].map(y => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.45" />
                    ))}
                    {[100, 200, 300].map(x => (
                      <line key={x} x1={x} y1="0" x2={x} y2="105" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
                    ))}
                    <path d="M 0 35 Q 40 70 90 95 T 190 105 L 400 105" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 0 15 Q 110 30 180 85 T 260 105 L 400 105 L 0 105 Z" fill="url(#si-cordGrad)" />
                    <path d="M 0 15 Q 110 30 180 85 T 260 105" fill="none" stroke="#f59e0b" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.55))' }} />
                    <path d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105 L 400 105 L 0 105 Z" fill="url(#si-ptvGrad)" />
                    <path d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" fill="none" stroke="#38bdf8" strokeWidth="3" filter="url(#si-ptvGlow)" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }} />
                    <circle r="3" fill="#38bdf8" filter="url(#si-neon)">
                      <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" dur="3.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0.8;0" dur="3.8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="2.2" fill="#93c5fd" filter="url(#si-neon)">
                      <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0.8;0" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="2.5" fill="#fbbf24" filter="url(#si-neon)">
                      <animateMotion path="M 0 15 Q 110 30 180 85 T 260 105" dur="3.1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0.7;0" dur="3.1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="295" cy="18" r="3" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                    <text x="295" y="8" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">D95%</text>
                  </svg>
                </div>

                {/* Dose axis */}
                <div className="flex justify-between text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 font-mono pt-1.5 4xl:pt-2.5 border-t border-slate-700/60">
                  <span>0 Gy</span>
                  <span>{t.criticalThreshold}</span>
                  <span>{t.rxDose}</span>
                  <span>{t.dmax}</span>
                </div>

                {/* CI / HI / GI */}
                <div className="grid grid-cols-3 gap-2 4xl:gap-4 mt-3 4xl:mt-5 pt-3 4xl:pt-5 border-t border-slate-700/50 text-center">
                  <div className="bg-slate-900/80 p-2 2xl:p-2.5 4xl:p-4 rounded-xl 4xl:rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 block font-mono">{t.ciLabel}</span>
                    <span className="text-xs 2xl:text-sm 4xl:text-base font-bold font-mono text-emerald-400">0.98 <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 font-normal">{t.optimal}</span></span>
                  </div>
                  <div className="bg-slate-900/80 p-2 2xl:p-2.5 4xl:p-4 rounded-xl 4xl:rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 block font-mono">{t.hiLabel}</span>
                    <span className="text-xs 2xl:text-sm 4xl:text-base font-bold font-mono text-sky-400">1.04 <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 font-normal">{t.target}</span></span>
                  </div>
                  <div className="bg-slate-900/80 p-2 2xl:p-2.5 4xl:p-4 rounded-xl 4xl:rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 block font-mono">{t.giLabel}</span>
                    <span className="text-xs 2xl:text-sm 4xl:text-base font-bold font-mono text-indigo-400">3.2 <span className="text-[10px] 2xl:text-xs 4xl:text-sm text-slate-400 font-normal">{t.steep}</span></span>
                  </div>
                </div>
              </div>

              {/* Clinician signature */}
              <div className="flex flex-col gap-1 mt-6 4xl:mt-10 text-xs 2xl:text-sm 4xl:text-base text-slate-500">
                <p className="text-[11px] 2xl:text-xs 4xl:text-sm leading-relaxed">{t.physicianNote}</p>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs 2xl:text-sm 4xl:text-base">
                  <ShieldCheck className="w-3.5 h-3.5 4xl:w-4.5 4xl:h-4.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.signature}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              RIGHT AUTH PANE  (5 / 12 cols on desktop)
             ════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 w-full flex flex-col items-center">

            {/* Mobile logo — only visible below lg */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-3">
                <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400" />
                {t.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">RadOnco CDSS</h2>
              <span className="text-xs sm:text-sm text-slate-400 mt-0.5">{t.mobileSubtitle}</span>
            </div>

            {/* ── SINGLE GLASSMORPHISM CARD ─────────────────────────── */}
            <div className="w-full max-w-md 2xl:max-w-lg 4xl:max-w-xl backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 shadow-2xl shadow-cyan-950/20 rounded-2xl 4xl:rounded-3xl overflow-hidden">

              {/* Clerk form — transparent inside, no competing card */}
              <div className="p-6 sm:p-8 4xl:p-12">
                <SignIn
                  key={language}
                  {...({ localization: clerkLocalization } as any)}
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  appearance={({
                    variables: {
                      colorBackground: 'transparent',
                      colorInputBackground: '#1e2d45',
                      colorInputText: '#ffffff',
                      colorText: '#f8fafc',
                      colorTextSecondary: '#94a3b8',
                      colorPrimary: '#0ea5e9',
                      borderRadius: '0.75rem',
                    },
                    elements: {
                      socialButtons: '!hidden',
                      socialButtonsBlockButton: '!hidden',
                      dividerRow: '!hidden',
                      footer: '!hidden',
                      footerAction: '!hidden',

                      rootBox: 'w-full',
                      card: '!bg-transparent !shadow-none !border-0 !p-0 w-full',
                      headerTitle: '!text-white font-bold text-lg 2xl:text-xl 4xl:text-2xl text-center',
                      headerSubtitle: '!text-slate-400 text-xs 2xl:text-sm 4xl:text-base text-center mb-4 4xl:mb-6',

                      identityPreview: '!bg-slate-800/80 !border !border-slate-700/80 !rounded-xl 4xl:!rounded-2xl !py-2 4xl:!py-3 !px-3.5 4xl:!px-5 mb-3 4xl:mb-4',
                      identityPreviewText: '!text-white !font-bold text-sm 2xl:text-base 4xl:text-lg',
                      identityPreviewEditButton: '!text-sky-400 hover:!text-sky-300',

                      formFieldLabel: '!text-slate-200 text-xs 2xl:text-sm 4xl:text-base font-semibold',
                      formFieldInput: '!bg-slate-800/70 !text-white placeholder:!text-slate-500 !border-slate-700/80 rounded-xl 4xl:rounded-2xl py-2.5 4xl:py-3.5 px-3.5 4xl:px-5 text-sm 2xl:text-base 4xl:text-lg font-medium focus:!border-sky-500 focus:!ring-1 focus:!ring-sky-500/30',
                      formButtonPrimary: '!bg-gradient-to-r !from-sky-500 !to-blue-600 hover:!from-sky-400 hover:!to-blue-500 !text-white font-semibold py-3 4xl:py-4 rounded-xl 4xl:rounded-2xl text-sm 2xl:text-base 4xl:text-lg !shadow-lg !shadow-sky-600/20 w-full mt-2 4xl:mt-4 normal-case transition-all',
                    },
                  } as any)}
                />
              </div>

              {/* Seamless footer link — merged inside the single card */}
              <div className="px-6 sm:px-8 4xl:px-12 py-4 4xl:py-5 border-t border-slate-800/70 flex items-center justify-center gap-2 text-xs 2xl:text-sm 4xl:text-base text-slate-400">
                <span>{t.noAccount}</span>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 4xl:w-4.5 4xl:h-4.5" />
                  {t.signUp}
                </Link>
              </div>
            </div>

            {/* Physician note */}
            <p className="mt-3 4xl:mt-5 text-center text-[11px] 2xl:text-xs 4xl:text-sm leading-relaxed text-slate-500 px-2">
              {t.physicianNote}
            </p>

            {/* Mobile signature */}
            <div className="lg:hidden mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.signature}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}