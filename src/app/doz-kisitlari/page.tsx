'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { oarConstraintsData } from '@/data/oarConstraintsData';
import type { OARFractionation, OARRegion } from '@/types/oar-guide';

type RegionFilter = 'all' | OARRegion | 'pelvis-palliative';
type FractionationFilter = 'all' | 'konvansiyonel' | 'hipofraksiyon' | 'sbrt' | 'srs';

const regions: { id: RegionFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'kranial', label: 'Kranial & MSS' },
  { id: 'bas-boyun', label: 'Baş-Boyun' },
  { id: 'toraks', label: 'Toraks' },
  { id: 'abdomen', label: 'Abdomen & GİS' },
  { id: 'pelvis', label: 'Pelvis (GÜS & Jinekoloji)' },
  { id: 'omurilik', label: 'Omurilik & Kemik' },
];

const fractionations: { id: FractionationFilter; label: string }[] = [
  { id: 'all', label: 'Tüm şemalar' },
  { id: 'konvansiyonel', label: 'Konvansiyonel' },
  { id: 'hipofraksiyon', label: 'Hipofraksiyon' },
  { id: 'sbrt', label: 'SBRT (3–5 fx)' },
  { id: 'srs', label: 'SRS (1–3 fx)' },
];

const regionMatches = (filter: RegionFilter, region: OARRegion) => {
  if (filter === 'all') return true;
  if (filter === 'pelvis-palliative') return region === 'pelvis' || region === 'omurilik';
  return filter === region;
};

const fractionationMatches = (filter: FractionationFilter, fractionation: OARFractionation) => {
  if (filter === 'all') return true;
  if (filter === 'sbrt') return fractionation === 'sbrt-2fx' || fractionation === 'sbrt-3fx' || fractionation === 'sbrt-5fx';
  if (filter === 'srs') return fractionation === 'srs-1fx' || fractionation === 'srs-3fx';
  return filter === fractionation;
};

const fractionationLabel = (fractionation: OARFractionation) => {
  switch (fractionation) {
    case 'konvansiyonel': return 'Konvansiyonel (1.8–2 Gy)';
    case 'hipofraksiyon': return 'Hipofraksiyon';
    case 'sbrt-2fx': return 'SBRT · 2 fx';
    case 'sbrt-3fx': return 'SBRT · 3 fx';
    case 'sbrt-5fx': return 'SBRT · 5 fx';
    case 'srs-1fx': return 'SRS · 1 fx';
    case 'srs-3fx': return 'SRS · 3 fx';
  }
};

export default function DoseConstraintsPage() {
  const [region, setRegion] = useState<RegionFilter>('all');
  const [fractionation, setFractionation] = useState<FractionationFilter>('all');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase('tr-TR').split(/\s+/).filter(Boolean);
    return oarConstraintsData.filter(item => {
      if (!regionMatches(region, item.region) || !fractionationMatches(fractionation, item.fractionation)) return false;
      const searchable = [
        item.organ,
        item.metric,
        item.limit,
        item.endpoint,
        item.source,
        item.context,
        fractionationLabel(item.fractionation),
      ].join(' ').toLocaleLowerCase('tr-TR');
      return terms.every(term => searchable.includes(term));
    });
  }, [fractionation, query, region]);

  const visibleFractionations = fractionations.filter(item => (
    !(region === 'kranial' && item.id === 'sbrt')
    && !(region !== 'all' && region !== 'kranial' && item.id === 'srs')
  ));

  const selectRegion = (nextRegion: RegionFilter) => {
    setRegion(nextRegion);
    if ((nextRegion === 'kranial' && fractionation === 'sbrt')
      || (nextRegion !== 'all' && nextRegion !== 'kranial' && fractionation === 'srs')) {
      setFractionation('all');
    }
  };

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Dozimetri rehberi
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Kritik Organ Doz Kısıtları</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Organ, anatomi ve fraksiyonasyon bağlamına göre kaynaklandırılmış referansları keşfedin. Her satırdaki klinik bağlam ve kullanılan DVH metriği birlikte değerlendirilmelidir.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-xl sm:p-5" aria-label="OAR filtreleri">
          <label htmlFor="oar-search" className="sr-only">Organ, metrik veya toksisite ara</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="oar-search"
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Organ, Dmax, V20Gy veya toksisite ara..."
              className="w-full rounded-xl border border-slate-700 bg-[#0a0f1d] py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Anatomik bölge</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {regions.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectRegion(item.id)}
                  aria-pressed={region === item.id}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${region === item.id ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Fraksiyonasyon</h2>
            <div className="flex flex-wrap gap-2">
              {visibleFractionations.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFractionation(item.id)}
                  aria-pressed={fractionation === item.id}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${fractionation === item.id ? 'border-violet-500/60 bg-violet-500/10 text-violet-200' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500" aria-live="polite">
            {filteredItems.length} {filteredItems.length === 1 ? 'kayıt' : 'kayıt'} gösteriliyor
          </p>
        </section>

        {filteredItems.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredItems.map(item => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 transition hover:border-slate-700 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{item.organ}</h2>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{fractionationLabel(item.fractionation)} · α/β {item.alphaBeta ?? '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${item.priority === 'hard' ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}`}>
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    {item.priority === 'hard' ? 'Zorunlu · Hard' : 'Optimal · Soft'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dozimetrik kriter</div>
                    <div className="mt-1 text-sm font-semibold text-cyan-200">{item.metric}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Referans sınır</div>
                    <div className="mt-1 max-w-64 text-sm font-bold text-white">{item.limit}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5">
                  <p><span className="font-semibold text-slate-300">Klinik endpoint: </span><span className="text-slate-400">{item.endpoint}</span></p>
                  <p><span className="font-semibold text-slate-300">Bağlam: </span><span className="text-slate-400">{item.context}</span></p>
                  <p className="text-slate-500">
                    Kaynak:{' '}
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:text-sky-200">{item.source}</a>
                    ) : item.source}
                  </p>
                </div>

                <Link
                  href={{
                    pathname: '/doz-hesaplayici',
                    query: { organ: item.organ, metric: item.metric, limit: item.limit, fractionation: item.fractionation },
                  }}
                  className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/15"
                >
                  Doz Motorunda Hesapla
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-[#0e1726] p-8 text-center text-sm text-slate-400">
            Filtrelerle eşleşen bir doz kısıtı bulunamadı.
          </div>
        )}

        <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/70">
          Bu tablo kaynak ve fraksiyonasyon bağlamından bağımsız evrensel reçete değildir. Hedef hacmi, organ konturu, eşzamanlı tedavi, önceki RT ve güncel protokol doğrulanmalıdır.
        </p>
      </div>
    </main>
  );
}
