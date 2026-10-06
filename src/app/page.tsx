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

const SUBTYPE_DISPLAY_MAP: Record<string, string> = {
  nsclc: 'NSCLC (KHDAK)',
  sclc: 'SCLC (KHAK)',
  thymoma: 'Timoma',
  mesothelioma: 'Mezotelyoma',
  'cns-mets': 'Beyin Metastazı',
  gbm: 'Glioblastom (GBM)',
  meningioma: 'Menenjiyom',
  Serviks: 'Serviks Uteri',
  Endometriyum: 'Endometriyum',
  Yumusak_Doku: 'Yumuşak Doku Sarkomu',
  Osteosarkom: 'Osteosarkom',
};

const NCCN_GUIDELINE_MAP: Record<string, { url: string; title: string; hint: string }> = {
  'thorax-nsclc': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
    title: 'NCCN Non-Small Cell Lung Cancer',
    hint: 'NSCL-C: Principles of Radiation Therapy',
  },
  'thorax-sclc': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1462',
    title: 'NCCN Small Cell Lung Cancer',
    hint: 'SCLC: Limited-Stage & PCI',
  },
  'thorax-thymoma': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1472',
    title: 'NCCN Thymomas and Thymic Carcinomas',
    hint: 'Thymoma: Postop RT / PORT',
  },
  'thorax-mesothelioma': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1443',
    title: 'NCCN Malignant Pleural Mesothelioma',
    hint: 'Mesothelioma: Radiation Principles',
  },
  'prostate-prostate': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
    title: 'NCCN Prostate Cancer',
    hint: 'PROS: Risk-Adapted Radiation & ADT',
  },
  breast: {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1419',
    title: 'NCCN Invasive Breast Cancer',
    hint: 'BINV: Radiation Therapy Principles',
  },
  'gis-Rektum': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1461',
    title: 'NCCN Rectal Cancer',
    hint: 'REC: SCRT vs Long-Course TNT',
  },
  'gis-Mide': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1434',
    title: 'NCCN Gastric Cancer',
    hint: 'Principles of Radiation Therapy (GAST-C)',
  },
  'cns-mets': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
    title: 'NCCN Central Nervous System Cancers',
    hint: 'BRAIN: Stereotactic Radiosurgery (SRS)',
  },
  'gynecology-Serviks': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1422',
    title: 'NCCN Cervical Cancer',
    hint: 'CERV: Definitive CRT + Brachytherapy',
  },
  'bone-sarcoma-Yumusak_Doku': {
    url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1464',
    title: 'NCCN Soft Tissue Sarcoma',
    hint: 'SARC: Preop vs Postop RT Principles',
  },
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
  const { t } = useLanguage();

  const titleSeparator = t.heroTitle.lastIndexOf(' ');
  const selectedSubtype = 'nsclc';
    const selectedOrgan = 'thorax';
  const selectedSubtypeKey = `${selectedOrgan}-${selectedSubtype}`;
  const nccnTarget = NCCN_GUIDELINE_MAP[selectedSubtypeKey] || NCCN_GUIDELINE_MAP[selectedOrgan] || {
    url: 'https://www.nccn.org/guidelines/category_1',
    title: 'NCCN Guidelines',
    hint: 'General Cancer Guidelines',
  };

  return (
    <main className="relative overflow-hidden bg-[#050811] min-h-screen text-slate-100 py-12 sm:py-20">
      {/* High-Impact Ambient Lighting & Mesh Aura */}
      <div className="pointer-events-none absolute w-[650px] h-[550px] bg-gradient-to-br from-amber-500/18 via-orange-600/8 to-transparent rounded-full blur-[140px] -top-32 -left-20 z-0" />
      <div className="pointer-events-none absolute w-[650px] h-[550px] bg-gradient-to-bl from-emerald-500/18 via-teal-600/8 to-transparent rounded-full blur-[140px] -top-32 -right-20 z-0" />
      <div className="pointer-events-none absolute w-[800px] h-[350px] bg-sky-500/5 rounded-full blur-[160px] top-64 left-1/2 -translate-x-1/2 z-0" />
      
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex flex-col items-center">
        {/* Hero Section Header & Slogan */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-amber-300 shadow-sm shadow-amber-500/10 mb-6">
            ✨ {t.heroBadge}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {t.heroDescription}
          </p>
        </div>

        <section className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          {/* CDSS Card */}
          <div className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-amber-500/30 shadow-[0_0_50px_-15px_rgba(245,158,11,0.2)] hover:border-amber-400/60 hover:shadow-[0_0_60px_-10px_rgba(245,158,11,0.3)] transition-all duration-500 flex flex-col">
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
              className="relative z-10 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-auto"
            >
              {t.hero.cdss.button}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Academy Card */}
          <div className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-emerald-500/30 shadow-[0_0_50px_-15px_rgba(16,185,129,0.2)] hover:border-emerald-400/60 hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.3)] transition-all duration-500 flex flex-col">
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
              className="relative z-10 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-auto"
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
