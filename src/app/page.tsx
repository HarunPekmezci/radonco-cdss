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
import { ParticleBackground } from '@/components/ui/ParticleBackground';

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
    href: '/prognostic',
    cardKey: 'prognostic',
    icon: Scale,
    accent: 'text-fuchsia-400 bg-fuchsia-400/10 ring-fuchsia-400/20',
  },
  {
    href: '/references',
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
    <main className="relative min-h-screen bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#040711] text-slate-100 overflow-hidden py-12 sm:py-20">
      {/* Particle & Cosmic Ray Background Aura */}
      <ParticleBackground />

      {/* Celestial Orbital Horizon Arc - Cleanly Crowning Above the Title */}
      <div 
        className="absolute -top-[360px] md:-top-[400px] left-1/2 -translate-x-1/2 w-[1500px] md:w-[1800px] h-[480px] rounded-[100%] border-b border-cyan-400/30 shadow-[0_15px_60px_-10px_rgba(34,211,238,0.3)] pointer-events-none z-0 bg-gradient-to-b from-transparent via-cyan-950/15 to-transparent" 
      />

      {/* Top Specular Metallic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[380px] bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.15),transparent_60%)] pointer-events-none z-0" />

      {/* Ethereal Deep-Space Nebula Mesh */}
      <div className="w-[800px] h-[500px] bg-indigo-950/30 rounded-full blur-[160px] top-10 left-1/4 pointer-events-none absolute z-0" />
      <div className="w-[600px] h-[450px] bg-cyan-950/25 rounded-full blur-[170px] top-32 right-10 pointer-events-none absolute z-0" />
      <div className="w-[500px] h-[400px] bg-amber-950/20 rounded-full blur-[160px] top-48 left-10 pointer-events-none absolute z-0" />

      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex flex-col items-center">
        {/* Portal Entrance Header */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl">
          <h1 className="relative z-10 pt-4 text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.2] pb-2 overflow-visible">
            {language === 'tr' ? 'Klinik Karar Desteği & Onkoloji Akademisi' : 'Clinical Decision Support & Oncology Academy'}
          </h1>
        </div>

        <section className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          {/* CDSS Card */}
          <div className="relative group rounded-3xl p-8 bg-slate-950/25 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-300 flex flex-col justify-between">
            {/* CDSS Top Accent */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-500" />
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400 mb-6">
                <Radiation className="h-3.5 w-3.5" aria-hidden="true" />
                {t.hero.cdss.badge}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-3">
                {t.hero.cdss.title.split(' ')[0]} <span className="text-amber-400">{t.hero.cdss.title.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                {language === 'tr' ? 'MDR Kural 11 uyumlu deterministik klinik karar motoru' : 'MDR Rule 11 compliant deterministic clinical decision engine'}
              </p>
              
              {/* Feature Rows */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-amber-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? '25+ Faz III Çalışma' : '25+ Phase III Trials'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'PICO rejimleri & NCCN Kategori 1 kanıtlar' : 'PICO regimens & NCCN Category 1 evidence'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-amber-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? 'Biyo-Eşdeğer Doz' : 'Isoeffective Dose'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'Doğrulanmış EQD2, BED10 ve BED3 LQ algoritması' : 'Verified EQD2, BED10 and BED3 LQ algorithm'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-amber-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? 'Klinik Denetim İzi' : 'Clinical Audit Trace'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'Deterministik MDR Kural 11 izlenebilirliği' : 'Deterministic MDR Rule 11 traceability'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Link
              href="/cdss"
              className="mt-8 w-full py-3.5 px-6 rounded-2xl font-semibold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group-hover:gap-3 z-10"
            >
              {t.hero.cdss.button}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Academy Card */}
          <div className="relative group rounded-3xl p-8 bg-slate-950/25 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-300 flex flex-col justify-between">
            {/* Academy Top Accent */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-6">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                {t.hero.academy.badge}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-3">
                {t.hero.academy.title.split(' ')[0]} <span className="text-emerald-400">{t.hero.academy.title.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                {language === 'tr' ? 'Vaka bazlı soru bankası ve PICO landmark eğitim merkezi' : 'Case-based vignette bank and PICO landmark education center'}
              </p>
              
              {/* Feature Rows */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-emerald-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? 'PICO Vaka Havuzu' : 'PICO Case Pool'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'Tıklanabilir DOI referanslı interaktif senaryolar' : 'Interactive scenarios with clickable DOI references'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-emerald-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? '3D Akıl Kartları' : '3D Flashcards'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'Yüksek verimli sınav ve çalışma kartları' : 'High-yield exam and study flashcards'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="text-emerald-400 shrink-0 select-none mt-0.5">✓</span>
                  <div>
                    <strong className="font-semibold text-slate-100">
                      {language === 'tr' ? 'Radyofizik & Dozimetri' : 'Radiophysics & Dosimetry'}
                    </strong>
                    <span className="text-slate-400">: {language === 'tr' ? 'Linak fiziği, TG-51 ve fraksiyonasyon laboratuvarı' : 'Linac physics, TG-51 and fractionation lab'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Link
              href="/academy"
              className="mt-8 w-full py-3.5 px-6 rounded-2xl font-semibold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group-hover:gap-3 z-10"
            >
              {t.hero.academy.button}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
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
