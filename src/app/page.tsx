'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Atom,
  Scale,
  HeartPulse,
  Radiation,
  ShieldCheck,
  Target,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type PortalModule = {
  href: string;
  cardKey: 'oar' | 'calculator' | 'contouring' | 'prognostic' | 'references' | 'toxicity';
  icon: LucideIcon;
  accent: string;
};

const modules: PortalModule[] = [
  {
    href: '/doz-kisitlari',
    cardKey: 'oar',
    icon: ShieldCheck,
    accent: 'text-cyan-400 bg-cyan-400/10 ring-cyan-400/20',
  },
  {
    href: '/doz-hesaplayici',
    cardKey: 'calculator',
    icon: Atom,
    accent: 'text-orange-400 bg-orange-400/10 ring-orange-400/20',
  },
  {
    href: '/hedef-hacim',
    cardKey: 'contouring',
    icon: Target,
    accent: 'text-emerald-300 bg-emerald-400/10 ring-emerald-300/20',
  },
  {
    href: '/cdss?tab=prognostic',
    cardKey: 'prognostic',
    icon: Scale,
    accent: 'text-fuchsia-400 bg-fuchsia-400/10 ring-fuchsia-400/20',
  },
  {
    href: '/kaynakca',
    cardKey: 'references',
    icon: BookOpen,
    accent: 'text-amber-300 bg-amber-400/10 ring-amber-300/20',
  },
  {
    href: '/toxicity',
    cardKey: 'toxicity',
    icon: HeartPulse,
    accent: 'text-rose-300 bg-rose-400/10 ring-rose-300/20',
  },
];

export default function PortalPage() {
  const { t, language } = useLanguage();

  return (
    <main className="bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#040711] min-h-screen relative overflow-hidden text-slate-100 py-12 sm:py-20">
      {/* High-End Specular Top Reflection (Rim Light) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.18),transparent_60%)] pointer-events-none" />

      {/* Radiant Lateral Lighting */}
      <div className="pointer-events-none absolute w-[600px] h-[500px] bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-[130px] -top-24 -left-12" />
      <div className="pointer-events-none absolute w-[600px] h-[500px] bg-gradient-to-bl from-emerald-400/20 via-teal-500/10 to-transparent rounded-full blur-[130px] -top-24 -right-12" />

      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex flex-col items-center">
        {/* Portal Entrance Header */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-amber-300 shadow-sm shadow-amber-500/10 mb-6">
            ✨ RADONCO PORTAL
          </div>
          <h1 className="bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            {language === 'tr' ? 'Klinik Karar & Onkoloji Akademisi' : 'Clinical Decision Support & Oncology Academy'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            {t.heroDescription}
          </p>
        </div>

        <section className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          {/* CDSS Card */}
          <div className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-b from-slate-800/80 via-slate-900/80 to-slate-950/95 border border-slate-700/60 border-t-2 border-t-amber-400/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-2xl transition-all duration-300 hover:border-slate-500/60 flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-500" />
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400 mb-6">
                <Radiation className="h-3.5 w-3.5" aria-hidden="true" />
                {t.hero.cdss.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                {t.hero.cdss.title.split(' ')[0]} <span className="text-amber-400">{t.hero.cdss.title.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-base font-medium text-slate-200 mb-4">
                {t.hero.cdss.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-slate-400 mb-6">
                {t.hero.cdss.description}
              </p>
              <ul className="space-y-3 text-sm text-slate-300 mb-10">
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.cdss.bullet1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.cdss.bullet2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.cdss.bullet3}</span>
                </li>
              </ul>
            </div>
            
            <Link
              href="/cdss"
              className="relative z-10 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
            >
              {t.hero.cdss.button}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Academy Card */}
          <div className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-b from-slate-800/80 via-slate-900/80 to-slate-950/95 border border-slate-700/60 border-t-2 border-t-emerald-400/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-2xl transition-all duration-300 hover:border-slate-500/60 flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-6">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                {t.hero.academy.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                {t.hero.academy.title.split(' ')[0]} <span className="text-emerald-400">{t.hero.academy.title.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-base font-medium text-slate-200 mb-4">
                {t.hero.academy.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-slate-400 mb-6">
                {t.hero.academy.description}
              </p>
              <ul className="space-y-3 text-sm text-slate-300 mb-10">
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.academy.bullet1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.academy.bullet2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{t.hero.academy.bullet3}</span>
                </li>
              </ul>
            </div>
            
            <Link
              href="/academy"
              className="relative z-10 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
            >
              {t.hero.academy.button}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="w-full mt-16 sm:mt-24" aria-labelledby="tools-heading">
          <div className="mb-8 text-center">
            <h2 id="tools-heading" className="text-xl font-bold text-white">{t.sectionTitle}</h2>
            <p className="mt-2 text-sm text-slate-400">{t.sectionDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(module => {
              const Icon = module.icon;
              const card = t.cards[module.cardKey];
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group flex min-h-[140px] flex-col backdrop-blur-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 rounded-2xl p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className={`inline-flex rounded-xl p-2.5 border ${module.accent.replace('ring-', 'border-').replace('ring-', 'border-')}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-300" aria-hidden="true" />
                  </div>
                  <h3 className="mt-auto text-base font-semibold leading-snug text-white">{card.title}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="w-full mt-16 border-t border-slate-800/80 pt-16 sm:mt-20" aria-labelledby="rapid-protocols-heading">
          <div className="mb-8 text-center">
            <h2 id="rapid-protocols-heading" className="text-xl font-bold text-white">
              {t.rapidProtocolsTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t.rapidProtocolsDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {t.rapidProtocols.map(protocol => (
              <Link
                key={protocol.quickCaseId}
                href={`/cdss?quickCase=${protocol.quickCaseId}`}
                className="group flex min-h-56 flex-col backdrop-blur-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/20 transition-all duration-300 rounded-2xl p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-300" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold leading-snug text-white mb-2">{protocol.title}</h3>
                <p className="text-2xl font-bold tabular-nums text-sky-400 mb-2">{protocol.dose}</p>
                <p className="flex-1 text-xs leading-relaxed text-slate-400">{protocol.details}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {protocol.tags.slice(1).map(tag => (
                    <span key={tag} className="rounded-md bg-slate-800/50 border border-slate-700/80 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase transition group-hover:text-sky-300">
                    {t.rapidProtocolsLaunch}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-300 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
