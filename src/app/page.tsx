'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Mail,
  Radiation,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type PortalModule = {
  href: string;
  cardKey: 'oar' | 'calculator' | 'references' | 'disclaimer' | 'contact';
  icon: LucideIcon;
  accent: string;
};

const modules: PortalModule[] = [
  {
    href: '/doz-kisitlari',
    cardKey: 'oar',
    icon: Activity,
    accent: 'text-cyan-300 bg-cyan-400/10 ring-cyan-300/20',
  },
  {
    href: '/doz-hesaplayici',
    cardKey: 'calculator',
    icon: Calculator,
    accent: 'text-violet-300 bg-violet-400/10 ring-violet-300/20',
  },
  {
    href: '/kaynakca',
    cardKey: 'references',
    icon: BookOpen,
    accent: 'text-amber-300 bg-amber-400/10 ring-amber-300/20',
  },
  {
    href: '/yasal-uyari',
    cardKey: 'disclaimer',
    icon: ShieldAlert,
    accent: 'text-rose-300 bg-rose-400/10 ring-rose-300/20',
  },
  {
    href: '/iletisim',
    cardKey: 'contact',
    icon: Mail,
    accent: 'text-sky-300 bg-sky-400/10 ring-sky-300/20',
  },
];

export default function PortalPage() {
  const { t } = useLanguage();
  const titleSeparator = t.heroTitle.lastIndexOf(' ');

  return (
    <main className="min-h-screen bg-[#0B1120] px-3 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#111c2e] via-[#0e1726] to-[#0B1120] p-6 shadow-2xl shadow-black/20 sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
              <Radiation className="h-3.5 w-3.5" aria-hidden="true" />
              {t.heroBadge}
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {t.heroTitle.slice(0, titleSeparator)}{' '}
              <span className="text-sky-400">{t.heroTitle.slice(titleSeparator + 1)}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              {t.heroDescription}
            </p>
            <Link
              href="/cdss"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-950/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              {t.heroAction}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-10 sm:mt-12" aria-labelledby="tools-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="tools-heading" className="text-lg font-semibold text-white">{t.sectionTitle}</h2>
              <p className="mt-1 text-xs text-slate-400">{t.sectionDescription}</p>
            </div>
            <span className="hidden rounded-full border border-slate-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:inline-flex">
              {t.portalBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const card = t.cards[module.cardKey];
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={`group flex min-h-48 flex-col rounded-2xl border border-slate-800 bg-[#0e1726] p-5 transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-[#111c2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 lg:col-span-2 ${index === 3 ? 'lg:col-start-2' : ''} ${index === 4 ? 'sm:col-span-2 sm:w-1/2 sm:justify-self-center lg:col-start-4 lg:w-auto' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex rounded-xl p-2.5 ring-1 ${module.accent}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-300" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-slate-400">{card.description}</p>
                  <span className="mt-4 w-fit rounded-md border border-slate-700/80 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-300">
                    {card.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
