'use client';

import React, { useMemo } from 'react';
import { SignUp } from '@clerk/nextjs';
import { trTR, enUS } from '@clerk/localizations';
import Link from 'next/link';
import { Activity, LogIn, Globe, ShieldCheck, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SignUpPage() {
  const { language, setLanguage } = useLanguage();

  const t = {
    en: {
      badge: 'For Healthcare Professionals',
      headline1: 'Radiation Oncology',
      headline2: 'Clinical Decision Support Platform',
      chip1: 'Dual α/β Dosimetry & Differential EQD2 Engine',
      chip2: 'QUANTEC, HyTEC & TG-101 Tolerance Atlas',
      chip3: 'NCCN, ASTRO & ESTRO Evidence-Based Decision Matrix',
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
      hasAccount: 'Already have an account?',
      signIn: 'Sign In',
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
      chip3: 'NCCN, ASTRO & ESTRO Kanıt Entegrasyonu',
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
      hasAccount: 'Zaten hesabınız var mı?',
      signIn: 'Giriş Yap',
      mobileSubtitle: 'Klinik Karar Destek Sistemi',
      physicianNote: 'Klinik karar desteği içindir, hekim sorumluluğunun yerini almaz.',
      signature: 'Dr. Harun PEKMEZCİ tarafından dizayn edildi',
    },
  }[language];

  const clerkLocalization = useMemo(() => {
    if (language === 'tr') {
      return {
        ...trTR,
        formButtonPrimary: 'Kayıt Ol',
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
        signUp: {
          ...trTR.signUp,
          start: {
            ...trTR.signUp?.start,
            title: 'Kayıt ol',
            subtitle: 'RadOnco CDSS ile başlamak için',
            actionText: 'Zaten hesabınız var mı?',
            actionLink: 'Giriş Yap',
          },
        },
      };
    }
    return {
      ...enUS,
      formButtonPrimary: 'Sign Up',
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
      signUp: {
        ...enUS.signUp,
        start: {
          ...enUS.signUp?.start,
          title: 'Create your RadOnco CDSS Account',
          subtitle: 'Welcome! Please sign up to get started',
          actionText: 'Already have an account?',
          actionLink: 'Sign In',
        },
      },
    };
  }, [language]);

  return (
    <div className={`auth-mosaic min-h-screen w-full text-slate-100 font-sans relative overflow-x-hidden ${language === 'en' ? 'en-mode' : 'tr-mode'}`}>

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
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 shadow-xl shadow-black/40 backdrop-blur-md text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('tr')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'tr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
        </div>
      </div>

      {/* ── SPLIT-SCREEN LAYOUT ─────────────────────────────────────────── */}
      <main className="flex min-h-screen w-full">

        {/* ════════════════════════════════════════════════════════════════
            LEFT HERO PANE
           ════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-slate-800/60 relative overflow-hidden">
          {/* Subtle left-pane inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_10%_20%,rgba(14,165,233,0.07),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_90%_85%,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />

          {/* ── HEADLINE BLOCK ────────────────────────────────────────── */}
          <div className="my-auto py-6 max-w-lg relative z-10">

            {/* Emerald clinical badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
              <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              {t.badge}
            </div>

            {/* Main headline */}
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              <span className="text-white">{t.headline1}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                {t.headline2}
              </span>
            </h1>

            {/* Feature value-prop chips */}
            <div className="flex flex-col gap-2.5 mb-8">
              {/* Chip 1 — Dosimetry */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sky-500/8 border border-sky-500/18 backdrop-blur-sm hover:border-sky-400/30 transition-colors">
                <span className="text-base leading-none">⚡</span>
                <p className="text-xs font-medium text-slate-300 leading-snug">{t.chip1}</p>
              </div>
              {/* Chip 2 — Tolerance Atlas */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-500/8 border border-violet-500/18 backdrop-blur-sm hover:border-violet-400/30 transition-colors">
                <span className="text-base leading-none">🛡️</span>
                <p className="text-xs font-medium text-slate-300 leading-snug">{t.chip2}</p>
              </div>
              {/* Chip 3 — Evidence Matrix */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/18 backdrop-blur-sm hover:border-emerald-400/30 transition-colors">
                <span className="text-base leading-none">📚</span>
                <BookOpen className="hidden w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs font-medium text-slate-300 leading-snug">{t.chip3}</p>
              </div>
            </div>

            {/* ── DVH CONSOLE ─────────────────────────────────────────── */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700/50 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl relative overflow-hidden">
              {/* Card inner glow */}
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* DVH header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
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

              {/* SVG DVH chart — unique IDs for sign-up to avoid conflicts */}
              <div className="relative w-full h-28 my-1">
                <svg viewBox="0 0 400 110" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="su-ptvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="su-cordGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="su-neon" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="su-ptvGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid */}
                  {[27.5, 55, 82.5].map(y => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.45" />
                  ))}
                  {[100, 200, 300].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="105" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
                  ))}

                  {/* OAR — dashed emerald */}
                  <path d="M 0 35 Q 40 70 90 95 T 190 105 L 400 105"
                    fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Spinal cord — amber with fill */}
                  <path d="M 0 15 Q 110 30 180 85 T 260 105 L 400 105 L 0 105 Z" fill="url(#su-cordGrad)" />
                  <path d="M 0 15 Q 110 30 180 85 T 260 105"
                    fill="none" stroke="#f59e0b" strokeWidth="2.5"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.55))' }} />

                  {/* PTV — neon cyan with fill and strong glow */}
                  <path d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105 L 400 105 L 0 105 Z" fill="url(#su-ptvGrad)" />
                  <path d="M 0 10 L 260 10 Q 295 12 315 70 T 330 105 L 400 105"
                    fill="none" stroke="#38bdf8" strokeWidth="3"
                    filter="url(#su-ptvGlow)"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }} />

                  {/* Animated tracer dots */}
                  <circle r="3" fill="#38bdf8" filter="url(#su-neon)">
                    <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" dur="3.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0.8;0" dur="3.8s" repeatCount="indefinite" />
                  </circle>
                  <circle r="2.2" fill="#93c5fd" filter="url(#su-neon)">
                    <animateMotion path="M 0 10 L 260 10 Q 295 12 315 70 T 330 105" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0.8;0" begin="1.9s" dur="3.8s" repeatCount="indefinite" />
                  </circle>
                  <circle r="2.5" fill="#fbbf24" filter="url(#su-neon)">
                    <animateMotion path="M 0 15 Q 110 30 180 85 T 260 105" dur="3.1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0.7;0" dur="3.1s" repeatCount="indefinite" />
                  </circle>

                  {/* D95% annotation */}
                  <circle cx="295" cy="18" r="3" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                  <text x="295" y="8" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">D95%</text>
                </svg>
              </div>

              {/* Dose axis labels */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-700/60">
                <span>0 Gy</span>
                <span>{t.criticalThreshold}</span>
                <span>{t.rxDose}</span>
                <span>{t.dmax}</span>
              </div>

              {/* CI / HI / GI metrics */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/50 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-mono">{t.ciLabel}</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">0.98 <span className="text-[10px] text-slate-400 font-normal">{t.optimal}</span></span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-mono">{t.hiLabel}</span>
                  <span className="text-xs font-bold font-mono text-sky-400">1.04 <span className="text-[10px] text-slate-400 font-normal">{t.target}</span></span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-mono">{t.giLabel}</span>
                  <span className="text-xs font-bold font-mono text-indigo-400">3.2 <span className="text-[10px] text-slate-400 font-normal">{t.steep}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CLINICIAN SIGNATURE FOOTER ────────────────────────────── */}
          <div className="flex flex-col gap-1 text-xs text-slate-500 relative z-10">
            <p className="text-[11px] leading-relaxed">{t.physicianNote}</p>
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{t.signature}</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT AUTH PANE
           ════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen relative">
          {/* Right-pane subtle glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.04),transparent_70%)] pointer-events-none" />

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-3">
              <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400" />
              {t.badge}
            </div>
            <span className="text-xl font-bold text-white tracking-tight">RadOnco CDSS</span>
            <span className="text-xs text-slate-400 mt-0.5">{t.mobileSubtitle}</span>
          </div>

          {/* ── GLASSMORPHISM FORM CARD ──────────────────────────────── */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center relative z-10">
            <div className="w-full backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 shadow-2xl shadow-cyan-950/30 rounded-2xl p-1 overflow-hidden">
              <SignUp
                key={language}
                {...({ localization: clerkLocalization } as any)}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                appearance={({
                  variables: {
                    colorBackground: '#0d1527',
                    colorInputBackground: '#1e293b',
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

                    card: '!bg-transparent !border-0 !shadow-none rounded-2xl p-6 sm:p-8 w-full',
                    headerTitle: '!text-white font-bold text-lg text-center',
                    headerSubtitle: '!text-slate-400 text-xs text-center mb-4',

                    formFieldLabel: '!text-slate-200 text-xs font-semibold',
                    formFieldInput: '!bg-slate-800/80 !text-white placeholder:!text-slate-500 !border-slate-700/80 rounded-xl py-2.5 px-3.5 text-sm font-medium focus:!border-sky-500 focus:!ring-1 focus:!ring-sky-500/30',
                    formButtonPrimary: '!bg-gradient-to-r !from-sky-500 !to-blue-600 hover:!from-sky-400 hover:!to-blue-500 !text-white font-semibold py-3 rounded-xl text-sm !shadow-lg !shadow-sky-600/20 w-full mt-2 normal-case transition-all',
                  },
                } as any)}
              />
            </div>

            <p className="mt-3 max-w-md text-center text-[11px] leading-relaxed text-slate-500">
              {t.physicianNote}
            </p>

            {/* Sign in link */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 w-full text-center flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>{t.hasAccount}</span>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t.signIn}
              </Link>
            </div>

            {/* Mobile signature */}
            <div className="lg:hidden mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.signature}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}