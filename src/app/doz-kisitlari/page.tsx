'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { oarConstraintsData } from '@/data/oarConstraintsData';
import type { OARFractionation, OARRegion } from '@/types/oar-guide';
import { useLanguage } from '@/context/LanguageContext';

type RegionFilter = 'all' | OARRegion | 'pelvis-palliative';
type FractionationFilter = 'all' | 'konvansiyonel' | 'hipofraksiyon' | 'sbrt' | 'srs';
type UiLanguage = 'tr' | 'en';

const regions: { id: RegionFilter; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tümü', label_en: 'All' },
  { id: 'kranial', label_tr: 'Kranial & MSS', label_en: 'Cranial & CNS' },
  { id: 'bas-boyun', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
  { id: 'toraks', label_tr: 'Toraks', label_en: 'Thorax' },
  { id: 'abdomen', label_tr: 'Abdomen & GİS', label_en: 'Abdomen & GI' },
  { id: 'pelvis', label_tr: 'Pelvis (GÜS & Jinekoloji)', label_en: 'Pelvis (GU & GYN)' },
  { id: 'omurilik', label_tr: 'Omurilik & Kemik', label_en: 'Spine & Bone' },
];

const fractionations: { id: FractionationFilter; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tüm şemalar', label_en: 'All Regimens' },
  { id: 'konvansiyonel', label_tr: 'Konvansiyonel', label_en: 'Conventional' },
  { id: 'hipofraksiyon', label_tr: 'Hipofraksiyon', label_en: 'Hypofractionation' },
  { id: 'sbrt', label_tr: 'SBRT (3–5 fx)', label_en: 'SBRT (3–5 fx)' },
  { id: 'srs', label_tr: 'SRS (1–3 fx)', label_en: 'SRS (1–3 fx)' },
];

const organNamesEn: Record<string, string> = {
  'Beyin sapı': 'Brainstem',
  'Optik sinirler / kiazma': 'Optic nerves / chiasm',
  'Beyin / kritik yapılar': 'Brain / critical structures',
  'Parotis (en az bir bez)': 'Parotid gland (at least one)',
  Koklea: 'Cochlea',
  'Optik yapılar / beyin sapı / mandibula': 'Optic structures / brainstem / mandible',
  'Bilateral akciğer (GTV hariç)': 'Both lungs (excluding GTV)',
  'Kalp / LAD': 'Heart / LAD',
  Özofagus: 'Esophagus',
  'Sağlam karaciğer (toplam karaciğer - GTV)': 'Uninvolved liver (total liver - GTV)',
  'Mide / duodenum': 'Stomach / duodenum',
  'Mide / duodenum / ince bağırsak / santral safra yolları': 'Stomach / duodenum / small bowel / central bile ducts',
  'Kontralateral böbrek': 'Contralateral kidney',
  'Bağırsak / duodenum': 'Bowel / duodenum',
  'Peritoneal boşluk / bowel bag': 'Peritoneal cavity / bowel bag',
  'Tek tek ince bağırsak ansları': 'Individual small-bowel loops',
  Rektum: 'Rectum',
  Mesane: 'Bladder',
  'Spinal kord': 'Spinal cord',
  'Spinal kord / thecal sac': 'Spinal cord / thecal sac',
  'Normal beyin dokusu (Brain - GTV)': 'Normal brain tissue (Brain - GTV)',
  'Lakrimal bez': 'Lacrimal gland',
  'Saçlı deri / skalp': 'Scalp / skin',
  'Spinal kord PRV': 'Spinal cord PRV',
  'Servikal özofagus': 'Cervical esophagus',
  'Brakiyal pleksus': 'Brachial plexus',
  'Temporomandibüler eklem (TMJ)': 'Temporomandibular joint (TMJ)',
  'LAD koroner arter': 'LAD coronary artery',
  'Büyük damarlar / aorta': 'Great vessels / aorta',
  'Duodenum': 'Duodenum',
  'Mide (Stomach)': 'Stomach',
  'Böbrekler (Bilateral)': 'Bilateral kidneys',
  'İpsilateral akciğer': 'Ipsilateral lung',
  'Kontralateral meme': 'Contralateral breast',
  'Kontralateral akciğer': 'Contralateral lung',
  'Humerus başı': 'Humeral head',
  'Bilateral femur başları': 'Bilateral femoral heads',
  'Penil bulb': 'Penile bulb',
  'Genital organlar / vajina / penil bulb': 'Genital organs / vagina / penile bulb',
  'Sigmoid kolon': 'Sigmoid colon',
  'Hipofiz': 'Pituitary gland',
  'Hipokampus (HA-WBRT)': 'Hippocampus (HA-WBRT)',
  'Lens': 'Lens',
  'Retina': 'Retina',
  'Mandibula': 'Mandible',
  'Tiroid': 'Thyroid gland',
  'Oral kavite': 'Oral cavity',
  'Faringeal konstriktörler (PCM)': 'Pharyngeal constrictor muscles (PCM)',
  'Larenks': 'Larynx',
  'Submandibular / parotis bezleri': 'Submandibular / parotid glands',
  'Kalp': 'Heart',
  'Proksimal bronş ağacı': 'Proximal bronchial tree',
  'Göğüs duvarı / kaburga': 'Chest wall / ribs',
};

const organLabel = (organ: string, language: UiLanguage) => (
  language === 'en' ? organNamesEn[organ] ?? organ : organ
);

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

const fractionationLabel = (fractionation: OARFractionation, language: UiLanguage) => {
  switch (fractionation) {
    case 'konvansiyonel': return language === 'en' ? 'Conventional (1.8–2 Gy)' : 'Konvansiyonel (1.8–2 Gy)';
    case 'hipofraksiyon': return language === 'en' ? 'Hypofractionation' : 'Hipofraksiyon';
    case 'sbrt-2fx': return 'SBRT · 2 fx';
    case 'sbrt-3fx': return 'SBRT · 3 fx';
    case 'sbrt-5fx': return 'SBRT · 5 fx';
    case 'srs-1fx': return 'SRS · 1 fx';
    case 'srs-3fx': return 'SRS · 3 fx';
  }
};

export default function DoseConstraintsPage() {
  const { language } = useLanguage();
  const [region, setRegion] = useState<RegionFilter>('all');
  const [fractionation, setFractionation] = useState<FractionationFilter>('all');
  const [query, setQuery] = useState('');

  const handleRegionChange = (nextRegion: RegionFilter) => {
    setRegion(nextRegion);
    if (nextRegion === 'kranial' && fractionation === 'sbrt') {
      setFractionation('all');
    } else if (nextRegion !== 'kranial' && nextRegion !== 'all' && fractionation === 'srs') {
      setFractionation('all');
    }
  };

  const visibleFractionations = fractionations.filter(item => {
    if (region === 'kranial') return item.id !== 'sbrt';
    if (region !== 'all') return item.id !== 'srs';
    return true;
  });

  const filteredItems = useMemo(() => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const terms = query.trim().toLocaleLowerCase(locale).split(/\s+/).filter(Boolean);
    return oarConstraintsData.filter(item => {
      if (!regionMatches(region, item.region) || !fractionationMatches(fractionation, item.fractionation)) return false;
      const searchable = [
        item.organ,
        organLabel(item.organ, language),
        item.metric,
        item.limit,
        item.endpoint,
        item.source,
        item.context,
        fractionationLabel(item.fractionation, language),
      ].join(' ').toLocaleLowerCase(locale);
      return terms.every(term => searchable.includes(term));
    });
  }, [fractionation, language, query, region]);

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {language === 'en' ? 'DOSIMETRY GUIDE' : 'DOZİMETRİ REHBERİ'}
          </div>
          <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {language === 'en' ? 'Organs at Risk (OAR) Dose Constraints' : 'Kritik Organ Doz Kısıtları'}
            <span className="rounded border border-rose-400/40 bg-rose-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200">NTCP ceiling</span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {language === 'en'
              ? 'Explore evidence-based references contextualized by organ, anatomy, and fractionation. Assess clinical endpoint and DVH metrics in conjunction.'
              : 'Organ, anatomi ve fraksiyonasyon bağlamına göre kaynaklandırılmış referansları keşfedin. Her satırdaki klinik bağlam ve kullanılan DVH metriği birlikte değerlendirilmelidir.'}
          </p>
        </header>

        <section
          className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-xl sm:p-5"
          aria-label={language === 'en' ? 'OAR filters' : 'OAR filtreleri'}
        >
          <label htmlFor="oar-search" className="sr-only">
            {language === 'en' ? 'Search organs, metrics, or toxicity' : 'Organ, metrik veya toksisite ara'}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="oar-search"
              type="search"
              value={query ?? ''}
              onChange={event => setQuery(event.target.value)}
              placeholder="Kritik organ veya doz metriği ara..."
              className="w-full rounded-xl border border-slate-700 bg-[#0a0f1d] py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'en' ? 'Anatomical Region' : 'Anatomik Bölge'}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {regions.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRegionChange(item.id)}
                  aria-pressed={region === item.id}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${region === item.id ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {language === 'en' ? item.label_en : item.label_tr}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'en' ? 'Fractionation' : 'Fraksiyonasyon'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleFractionations.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFractionation(item.id)}
                  aria-pressed={fractionation === item.id}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${fractionation === item.id ? 'border-violet-500/60 bg-violet-500/10 text-violet-200' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {language === 'en' ? item.label_en : item.label_tr}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400" aria-live="polite">
            {language === 'en'
              ? `Showing ${filteredItems.length} records`
              : `${filteredItems.length} kayıt gösteriliyor`}
          </p>
        </section>

        {filteredItems.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredItems.map(item => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 transition hover:border-slate-700 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{organLabel(item.organ, language)}</h2>
                    <span className="mt-1 inline-flex rounded border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200">NTCP ceiling</span>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{fractionationLabel(item.fractionation, language)} · α/β {item.alphaBeta ?? '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${item.priority === 'hard' ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}`}>
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    {item.priority === 'hard'
                      ? (language === 'en' ? 'Mandatory · Hard' : 'Zorunlu · Hard')
                      : 'Optimal · Soft'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {language === 'en' ? 'Dose Metric' : 'Dozimetrik Kriter'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-cyan-200">{item.metric}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="text-rose-300">{language === 'en' ? 'NTCP Ceiling' : 'NTCP Tavan Sınırı'}</span>
                    </div>
                    <div className="mt-1 max-w-64 text-sm font-bold text-white">{item.limit}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5">
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Clinical endpoint: ' : 'Klinik endpoint: '}</span>
                    <span className="text-slate-400">{item.endpoint}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Context: ' : 'Bağlam: '}</span>
                    <span className="text-slate-400">{item.context}</span>
                  </p>
                  <p className="text-slate-400">
                    {language === 'en' ? 'Source: ' : 'Kaynak: '}
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
                  {language === 'en' ? 'Calculate in Dose Engine' : 'Doz Motorunda Hesapla'}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-[#0e1726] p-8 text-center text-sm text-slate-400">
            {language === 'en'
              ? 'No dose constraints match the selected filters.'
              : 'Filtrelerle eşleşen bir doz kısıtı bulunamadı.'}
          </div>
        )}

        <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/70">
          {language === 'en'
            ? 'This table is not a universal prescription independent of source and fractionation context. Verify target volume, organ contours, concurrent treatment, prior RT, and current protocol.'
            : 'Bu tablo kaynak ve fraksiyonasyon bağlamından bağımsız evrensel reçete değildir. Hedef hacmi, organ konturu, eşzamanlı tedavi, önceki RT ve güncel protokol doğrulanmalıdır.'}
        </p>
      </div>
    </main>
  );
}
