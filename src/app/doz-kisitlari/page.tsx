'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, ShieldAlert, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { oarConstraintsData, OAR_PRIORITY_LABELS } from '@/data/oarConstraintsData';
import type { OARFractionation, OARPriority, OARRegion, TumorSite } from '@/types/oar-guide';
import { useLanguage } from '@/context/LanguageContext';

type TumorSiteFilter = 'all' | TumorSite;
type RegionFilter = 'all' | OARRegion | 'pelvis-palliative';
type FractionationFilter = 'all' | 'konvansiyonel' | 'hipofraksiyon' | 'stereotactic';
type UiLanguage = 'tr' | 'en';

const tumorSitesList: { id: TumorSiteFilter; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tüm Sahalar', label_en: 'All Sites' },
  { id: 'head-neck', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
  { id: 'cranial-cns', label_tr: 'Kranial & MSS', label_en: 'Cranial & CNS' },
  { id: 'breast', label_tr: 'Meme', label_en: 'Breast' },
  { id: 'thorax-lung', label_tr: 'Toraks / Akciğer', label_en: 'Thorax / Lung' },
  { id: 'prostate', label_tr: 'Prostat', label_en: 'Prostate' },
  { id: 'cervix', label_tr: 'Serviks', label_en: 'Cervix' },
  { id: 'gynecology', label_tr: 'Jinekoloji', label_en: 'Gynecology' },
  { id: 'stomach', label_tr: 'Mide', label_en: 'Stomach' },
  { id: 'pancreas', label_tr: 'Pankreas', label_en: 'Pancreas' },
  { id: 'esophagus', label_tr: 'Özofagus', label_en: 'Esophagus' },
  { id: 'rectum', label_tr: 'Rektum', label_en: 'Rectum' },
  { id: 'bladder', label_tr: 'Mesane', label_en: 'Bladder' },
  { id: 'parotid', label_tr: 'Parotis', label_en: 'Parotid' },
];

const tumorSiteNamesEn: Record<TumorSite, string> = {
  'head-neck': 'Head & Neck',
  'cranial-cns': 'Cranial & CNS',
  'breast': 'Breast',
  'thorax-lung': 'Thorax / Lung',
  'prostate': 'Prostate',
  'cervix': 'Cervix',
  'gynecology': 'Gynecology',
  'stomach': 'Stomach',
  'pancreas': 'Pancreas',
  'esophagus': 'Esophagus',
  'rectum': 'Rectum',
  'bladder': 'Bladder',
  'parotid': 'Parotid',
  'cervix-gyn': 'Cervix & GYN',
  'stomach-pancreas': 'Stomach & Pancreas',
  'rectum-bladder': 'Rectum & Bladder',
};

const tumorSiteNamesTr: Record<TumorSite, string> = {
  'head-neck': 'Baş-Boyun',
  'cranial-cns': 'Kranial & MSS',
  'breast': 'Meme',
  'thorax-lung': 'Toraks / Akciğer',
  'prostate': 'Prostat',
  'cervix': 'Serviks',
  'gynecology': 'Jinekoloji',
  'stomach': 'Mide',
  'pancreas': 'Pankreas',
  'esophagus': 'Özofagus',
  'rectum': 'Rektum',
  'bladder': 'Mesane',
  'parotid': 'Parotis',
  'cervix-gyn': 'Serviks & Jinekoloji',
  'stomach-pancreas': 'Mide & Pankreas',
  'rectum-bladder': 'Rektum & Mesane',
};

const regions: { id: RegionFilter; label_tr: string; label_en: string }[] = [
  { id: 'all', label_tr: 'Tümü', label_en: 'All' },
  { id: 'kranial', label_tr: 'Kranial & MSS', label_en: 'Cranial & CNS' },
  { id: 'bas-boyun', label_tr: 'Baş-Boyun', label_en: 'Head & Neck' },
  { id: 'toraks', label_tr: 'Toraks', label_en: 'Thorax' },
  { id: 'abdomen', label_tr: 'Abdomen & GİS', label_en: 'Abdomen & GI' },
  { id: 'pelvis', label_tr: 'Pelvis (GÜS & Jinekoloji)', label_en: 'Pelvis (GU & GYN)' },
  { id: 'omurilik', label_tr: 'Omurilik & Kemik', label_en: 'Spine & Bone' },
];


const organNamesEn: Record<string, string> = {
  'Abdominal aort': 'Abdominal aorta',
  'Beyin sapı': 'Brainstem',
  'Bilateral akciğer (GTV hariç)': 'Both lungs (excluding GTV)',
  'Bilateral femur başları': 'Bilateral femoral heads',
  'Brakial pleksus': 'Brachial plexus',
  'Bulbus okuli / Göz küresi': 'Eye / Globe',
  'Böbrekler (Bilateral)': 'Bilateral kidneys',
  'Büyük damarlar & aort': 'Great vessels & aorta',
  'Cilt (Skin)': 'Skin',
  'Dalak': 'Spleen',
  'Duodenum': 'Duodenum',
  'Faringeal konstriktörler (PCM)': 'Pharyngeal constrictors (PCM)',
  'Farinks & servikal özofagus': 'Pharynx & cervical esophagus',
  'Genital organlar / vajina': 'Genital organs / vagina',
  'Geniş ligaman (Broad ligament)': 'Broad ligament',
  'Göğüs duvarı & kaburga': 'Chest wall & ribs',
  'Hipofiz': 'Pituitary gland',
  'Hipofiz bezi': 'Pituitary gland',
  'Hipokampus': 'Hippocampus',
  'Humerus başı': 'Humeral head',
  'Kafa derisi / skalp': 'Scalp / skin',
  'Kalp': 'Heart',
  'Karaciğer (Sağlam karaciğer)': 'Liver (Uninvolved liver)',
  'Karotis arter': 'Carotid artery / Great vessels',
  'Koklea': 'Cochlea',
  'Kontralateral akciğer': 'Contralateral lung',
  'Kontralateral böbrek': 'Contralateral kidney',
  'Kontralateral meme': 'Contralateral breast',
  'Kranial sinirler (CN V, VII, VIII)': 'Cranial nerves (CN V, VII, VIII)',
  'LAD koroner arter': 'LAD coronary artery',
  'Lakrimal bez': 'Lacrimal gland',
  'Larenks': 'Larynx',
  'Larenks & trakea': 'Larynx & trachea',
  'Lens': 'Lens',
  'Mandibula': 'Mandible',
  'Mesane': 'Bladder',
  'Mide': 'Stomach',
  'Normal beyin dokusu (Brain - GTV)': 'Normal brain tissue (Brain - GTV)',
  'Optik kiazma': 'Optic chiasm',
  'Optik sinir': 'Optic nerve',
  'Optik sinirler / kiazma': 'Optic nerves / chiasm',
  'Oral kavite': 'Oral cavity',
  'Parotis bezi': 'Parotid gland',
  'Pelvik kemik iliği': 'Pelvic bone marrow',
  'Penil bulb': 'Penile bulb',
  'Peritoneal boşluk / bowel bag': 'Peritoneal cavity / bowel bag',
  'Proksimal bronşiyal ağaç & ana karina': 'Proximal bronchial tree & main carina',
  'Rektum': 'Rectum',
  'Retina': 'Retina',
  'Sağlam karaciğer (toplam karaciğer - GTV)': 'Uninvolved liver (total liver - GTV)',
  'Servikal özofagus': 'Cervical esophagus',
  'Sigmoid kolon': 'Sigmoid colon',
  'Spinal kord': 'Spinal cord',
  'Spinal kord (Paraaortik alan)': 'Spinal cord (Para-aortic field)',
  'Spinal kord PRV': 'Spinal cord PRV',
  'Submandibular bez': 'Submandibular gland',
  'Temporomandibüler eklem (TMJ)': 'Temporomandibular joint (TMJ)',
  'Tiroid': 'Thyroid gland',
  'Tiroid bezi': 'Thyroid gland',
  'Trakea & ana bronşlar': 'Trachea & main bronchi',
  'Uterus': 'Uterus',
  'Vajina': 'Vagina',
  'Vena kava inferior': 'Inferior vena cava',
  'Özofagus': 'Esophagus',
  'İnce bağırsak (Small bowel)': 'Small bowel',
  'İpsilateral akciğer': 'Ipsilateral lung',
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
  if (filter === 'konvansiyonel') return fractionation === 'konvansiyonel';
  if (filter === 'hipofraksiyon') return fractionation === 'hipofraksiyon';
  if (filter === 'stereotactic') {
    return (
      fractionation === 'sbrt-1fx' ||
      fractionation === 'sbrt-2fx' ||
      fractionation === 'sbrt-3fx' ||
      fractionation === 'sbrt-5fx' ||
      fractionation === 'srs-1fx' ||
      fractionation === 'srs-3fx' ||
      fractionation === 'srs-5fx'
    );
  }
  return filter === fractionation;
};

const fractionationLabel = (fractionation: OARFractionation, language: UiLanguage, region?: OARRegion) => {
  const isCranial = region === 'kranial';
  switch (fractionation) {
    case 'konvansiyonel': return language === 'en' ? 'Conventional (1.8–2 Gy)' : 'Konvansiyonel (1.8–2 Gy)';
    case 'hipofraksiyon': return language === 'en' ? 'Hypofractionation' : 'Hipofraksiyon';
    case 'sbrt-1fx': return 'SBRT · 1 fx';
    case 'sbrt-2fx': return 'SBRT · 2 fx';
    case 'sbrt-3fx': return 'SBRT · 3 fx';
    case 'sbrt-5fx': return 'SBRT · 5 fx';
    case 'srs-1fx': return isCranial ? 'SRS · 1 fx' : 'SBRT · 1 fx';
    case 'srs-3fx': return isCranial ? 'SRS / SRT · 3 fx' : 'SBRT · 3 fx';
    case 'srs-5fx': return isCranial ? 'SRS / SRT · 5 fx' : 'SBRT · 5 fx';
  }
};

type OARFractionationVariant = {
  fractionation: OARFractionation;
  fractionationLabel: string;
  alphaBeta?: number;
  priority: OARPriority;
  endpoint: string;
  context: string;
  source: string;
  sourceUrl?: string;
  metricsList: { metric: string; limit: string; priority?: OARPriority }[];
};

type ConsolidatedOARCard = {
  id: string;
  organ: string;
  region: OARRegion;
  tumorSites: TumorSite[];
  variants: OARFractionationVariant[];
};

const getVariantBucketKey = (fractionation: OARFractionation) => {
  switch (fractionation) {
    case 'konvansiyonel': return 'conv';
    case 'hipofraksiyon': return 'hypo';
    case 'sbrt-1fx':
    case 'srs-1fx': return '1fx';
    case 'sbrt-2fx': return '2fx';
    case 'srs-3fx':
    case 'sbrt-3fx': return '3fx';
    case 'srs-5fx':
    case 'sbrt-5fx': return '5fx';
  }
};

const getFractionationPillLabel = (fractionation: OARFractionation, language: UiLanguage) => {
  const bucket = getVariantBucketKey(fractionation);
  switch (bucket) {
    case 'conv': return language === 'en' ? 'Conventional' : 'Konvansiyonel';
    case 'hypo': return language === 'en' ? 'Hypofractionation' : 'Hipofraksiyon';
    case '1fx': return '1 fx';
    case '2fx': return '2 fx';
    case '3fx': return '3 fx';
    case '5fx': return '5 fx';
    default: return bucket;
  }
};

const bucketSortOrder: Record<string, number> = {
  conv: 1,
  hypo: 2,
  '1fx': 3,
  '2fx': 4,
  '3fx': 5,
  '5fx': 6,
};

const normalizeOrganTitle = (organ: string) => {
  const o = organ.trim();
  if (o === 'Hipofiz bezi') return 'Hipofiz';
  if (o === 'Tiroid bezi') return 'Tiroid';
  return o;
};

function OrganConstraintCard({
  card,
  language,
}: {
  card: ConsolidatedOARCard;
  language: UiLanguage;
}) {
  const [selectedVariant, setSelectedVariant] = useState(0);

  const safeVariantIdx = selectedVariant < card.variants.length ? selectedVariant : 0;
  const activeVariant = card.variants[safeVariantIdx] ?? card.variants[0];

  if (!activeVariant) return null;

  return (
    <article className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 transition hover:border-slate-700 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">{organLabel(card.organ, language)}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex rounded border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200">
                NTCP ceiling
              </span>
              {card.tumorSites && card.tumorSites.length > 0 && (
                card.tumorSites.map(s => (
                  <span key={s} className="inline-flex rounded border border-sky-400/30 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-200">
                    {language === 'en' ? tumorSiteNamesEn[s] : tumorSiteNamesTr[s]}
                  </span>
                ))
              )}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
              {fractionationLabel(activeVariant.fractionation, language, card.region)} · α/β {activeVariant.alphaBeta ?? '—'}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
              activeVariant.priority === 'hard'
                ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
            }`}
          >
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            {OAR_PRIORITY_LABELS[language][activeVariant.priority]}
          </span>
        </div>

        {/* In-Card Interactive Fractionation Segmented Control */}
        {card.variants.length > 1 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800">
            {card.variants.map((v, idx) => (
              <button
                key={v.fractionationLabel}
                type="button"
                onClick={() => setSelectedVariant(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  safeVariantIdx === idx
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {v.fractionationLabel}
              </button>
            ))}
          </div>
        )}

        {/* Clean, High-Contrast Metrics Table Grouping All Metrics for active variant */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#0a0f1d]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3.5 py-2.5">{language === 'en' ? 'Dose Metric' : 'Dozimetrik Kriter'}</th>
                <th className="px-3.5 py-2.5 text-right">
                  <span className="text-rose-300">{language === 'en' ? 'NTCP Ceiling' : 'NTCP Tavan Sınırı'}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeVariant.metricsList.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-3.5 py-2.5 font-semibold text-sky-400">{m.metric}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-100">{m.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-xs leading-5">
          {activeVariant.endpoint && (
            <p>
              <span className="font-semibold text-slate-300">
                {language === 'en' ? 'Clinical endpoint: ' : 'Klinik endpoint: '}
              </span>
              <span className="text-slate-400">{activeVariant.endpoint}</span>
            </p>
          )}
          {activeVariant.context && (
            <p>
              <span className="font-semibold text-slate-300">
                {language === 'en' ? 'Context: ' : 'Bağlam: '}
              </span>
              <span className="text-slate-400">{activeVariant.context}</span>
            </p>
          )}
          {activeVariant.source && (
            <p className="text-slate-400">
              <span className="font-semibold text-slate-300">
                {language === 'en' ? 'Source: ' : 'Kaynak: '}
              </span>
              {activeVariant.sourceUrl ? (
                <a
                  href={activeVariant.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:text-sky-200"
                >
                  {activeVariant.source}
                </a>
              ) : (
                activeVariant.source
              )}
            </p>
          )}
        </div>
      </div>

      <Link
        href={{
          pathname: '/doz-hesaplayici',
          query: {
            organ: card.organ,
            metric: activeVariant.metricsList[0]?.metric ?? '',
            limit: activeVariant.metricsList[0]?.limit ?? '',
            fractionation: activeVariant.fractionation,
          },
        }}
        className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/15"
      >
        {language === 'en' ? 'Calculate in Dose Engine' : 'Doz Motorunda Hesapla'}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function DoseConstraintsPage() {
  const { language } = useLanguage();
  const [selectedSite, setSelectedSite] = useState<TumorSiteFilter>('all');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [fractionation, setFractionation] = useState<FractionationFilter>('all');
  const [query, setQuery] = useState('');

  const handleRegionChange = (nextRegion: RegionFilter) => {
    setRegion(nextRegion);
  };

  const handleSiteChange = (nextSite: TumorSiteFilter) => {
    setSelectedSite(nextSite);
  };

  const isCranial = selectedSite === 'cranial-cns' || region === 'kranial';
  const isExtracranial =
    (selectedSite !== 'all' && selectedSite !== 'cranial-cns') ||
    (region !== 'all' && region !== 'kranial');

  const stereotacticLabel = isCranial
    ? 'SRS / SRT (1–5 fx)'
    : isExtracranial
      ? 'SBRT (1–5 fx)'
      : 'SBRT / SRS (1–5 fx)';

  const visibleFractionations = useMemo(() => [
    { id: 'all' as FractionationFilter, label_tr: 'Tüm şemalar', label_en: 'All Regimens' },
    { id: 'konvansiyonel' as FractionationFilter, label_tr: 'Konvansiyonel', label_en: 'Conventional' },
    { id: 'hipofraksiyon' as FractionationFilter, label_tr: 'Hipofraksiyon', label_en: 'Hypofractionation' },
    { id: 'stereotactic' as FractionationFilter, label_tr: stereotacticLabel, label_en: stereotacticLabel },
  ], [stereotacticLabel]);

  const filteredItems = useMemo(() => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const terms = query.trim().toLocaleLowerCase(locale).split(/\s+/).filter(Boolean);
    return oarConstraintsData.filter(item => {
      if (selectedSite !== 'all') {
        if (!item.tumorSites || !item.tumorSites.includes(selectedSite)) return false;
      }
      if (!regionMatches(region, item.region) || !fractionationMatches(fractionation, item.fractionation)) return false;
      const searchable = [
        item.organ,
        organLabel(item.organ, language),
        item.metric,
        item.limit,
        item.endpoint,
        item.source,
        item.context,
        fractionationLabel(item.fractionation, language, item.region),
        ...(item.tumorSites?.map(s => language === 'en' ? tumorSiteNamesEn[s] : tumorSiteNamesTr[s]) ?? []),
      ].join(' ').toLocaleLowerCase(locale);
      return terms.every(term => searchable.includes(term));
    });
  }, [fractionation, language, query, region, selectedSite]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, ConsolidatedOARCard>();

    for (const item of filteredItems) {
      const canonicalOrgan = normalizeOrganTitle(item.organ);
      const cardKey = canonicalOrgan.toLowerCase();

      if (!map.has(cardKey)) {
        map.set(cardKey, {
          id: `card-${canonicalOrgan.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          organ: canonicalOrgan,
          region: item.region,
          tumorSites: item.tumorSites ? [...item.tumorSites] : [],
          variants: [],
        });
      }

      const card = map.get(cardKey)!;

      // Union tumor sites
      if (item.tumorSites) {
        for (const s of item.tumorSites) {
          if (!card.tumorSites.includes(s)) {
            card.tumorSites.push(s);
          }
        }
      }

      // Find or create variant for this fractionation bucket
      const bucketKey = getVariantBucketKey(item.fractionation);
      let variant = card.variants.find(v => getVariantBucketKey(v.fractionation) === bucketKey);

      if (!variant) {
        variant = {
          fractionation: item.fractionation,
          fractionationLabel: getFractionationPillLabel(item.fractionation, language),
          alphaBeta: item.alphaBeta,
          priority: item.priority,
          endpoint: item.endpoint || '',
          context: item.context || '',
          source: item.source || '',
          sourceUrl: item.sourceUrl,
          metricsList: [{ metric: item.metric, limit: item.limit, priority: item.priority }],
        };
        card.variants.push(variant);
      } else {
        // Metric deduplication and consolidation
        const existingMetricIdx = variant.metricsList.findIndex(
          m => m.metric.trim().toLowerCase() === item.metric.trim().toLowerCase()
        );

        if (existingMetricIdx >= 0) {
          const ex = variant.metricsList[existingMetricIdx];
          const exLimit = ex.limit.trim();
          const newLimit = item.limit.trim();

          if (exLimit !== newLimit) {
            if (exLimit.toLowerCase().includes(newLimit.toLowerCase())) {
              // Existing limit is already comprehensive
            } else if (newLimit.toLowerCase().includes(exLimit.toLowerCase())) {
              variant.metricsList[existingMetricIdx] = {
                metric: item.metric,
                limit: newLimit,
                priority: ex.priority === 'hard' || item.priority === 'hard' ? 'hard' : 'soft',
              };
            } else {
              const exNum = parseFloat(exLimit.replace(/[^0-9.]/g, ''));
              const newNum = parseFloat(newLimit.replace(/[^0-9.]/g, ''));
              if (!isNaN(exNum) && !isNaN(newNum) && exNum !== newNum) {
                const lower = Math.min(exNum, newNum);
                const higher = Math.max(exNum, newNum);
                const unit = exLimit.includes('Gy') ? 'Gy' : exLimit.includes('%') ? '%' : '';
                const ceilWord = language === 'en' ? 'Ceiling' : 'Tavan';
                variant.metricsList[existingMetricIdx] = {
                  metric: item.metric,
                  limit: `< ${lower} ${unit} (${ceilWord}: ${higher} ${unit})`.trim(),
                  priority: 'hard',
                };
              } else {
                variant.metricsList[existingMetricIdx] = {
                  metric: item.metric,
                  limit: `${exLimit} / ${newLimit}`,
                  priority: ex.priority === 'hard' || item.priority === 'hard' ? 'hard' : 'soft',
                };
              }
            }
          }
        } else {
          variant.metricsList.push({ metric: item.metric, limit: item.limit, priority: item.priority });
        }

        if (item.priority === 'hard') {
          variant.priority = 'hard';
        }

        // Clean endpoint deduplication
        if (item.endpoint) {
          const currentEps = variant.endpoint ? variant.endpoint.split(';').map(s => s.trim()) : [];
          const newEp = item.endpoint.trim();
          const isDup = currentEps.some(
            e => e.toLowerCase() === newEp.toLowerCase() ||
                 e.toLowerCase().includes(newEp.toLowerCase()) ||
                 newEp.toLowerCase().includes(e.toLowerCase())
          );
          if (!isDup) {
            variant.endpoint = variant.endpoint ? `${variant.endpoint}; ${newEp}` : newEp;
          }
        }

        // Clean context deduplication
        if (item.context) {
          const currentCtx = variant.context.trim();
          const newCtx = item.context.trim();
          if (!currentCtx.toLowerCase().includes(newCtx.toLowerCase()) && !newCtx.toLowerCase().includes(currentCtx.toLowerCase())) {
            variant.context = currentCtx ? `${currentCtx} ${newCtx}` : newCtx;
          }
        }

        if (item.source && !variant.source.toLowerCase().includes(item.source.toLowerCase())) {
          variant.source = variant.source ? `${variant.source}; ${item.source}` : item.source;
        }

        if (!variant.sourceUrl && item.sourceUrl) {
          variant.sourceUrl = item.sourceUrl;
        }
      }
    }

    // Sort variants inside each card by clinical fractionation order
    for (const card of map.values()) {
      card.variants.sort((a, b) => {
        const orderA = bucketSortOrder[getVariantBucketKey(a.fractionation)] ?? 99;
        const orderB = bucketSortOrder[getVariantBucketKey(b.fractionation)] ?? 99;
        return orderA - orderB;
      });
    }

    return Array.from(map.values());
  }, [filteredItems, language]);

  const sortedConstraints = useMemo(() => {
    return [...groupedItems].sort((a, b) => {
      const nameA = (organLabel(a.organ, language) || a.organ || '').trim();
      const nameB = (organLabel(b.organ, language) || b.organ || '').trim();
      return nameA.localeCompare(nameB, language === 'tr' ? 'tr' : 'en', { sensitivity: 'base' });
    });
  }, [groupedItems, language]);

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {language === 'en' ? 'DOSIMETRY GUIDE' : 'DOZİMETRİ REHBERİ'}
          </div>
          <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {language === 'en' ? 'Organs at Risk (OAR) Dose Constraints' : 'Kritik Organ Doz Kısıtları'}
            <span className="rounded border border-rose-400/40 bg-rose-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200">
              QUANTEC · HyTEC · EMBRACE
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {language === 'en'
              ? 'Institutional hospital clinical practice constraints contextualized by tumor site, organ anatomy, and fractionation. Multiple fractionations and metrics per organ are consolidated into unified interactive cards with in-card regimen switchers.'
              : 'Tümör bölgesi, organ anatomisi ve fraksiyonasyona göre kurumsal hastane klinik protokol standartları. Organ başına tüm fraksiyonasyon şemaları ve metrikler kart içi fraksiyonasyon geçişi ile birleştirilmiştir.'}
          </p>
        </header>

        <section
          className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 shadow-xl sm:p-5"
          aria-label={language === 'en' ? 'OAR filters' : 'OAR filtreleri'}
        >
          <label htmlFor="oar-search" className="sr-only">
            {language === 'en' ? 'Search organs, tumor sites, metrics, or toxicity' : 'Organ, tümör alanı, metrik veya toksisite ara'}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="oar-search"
              type="search"
              value={query ?? ''}
              onChange={event => setQuery(event.target.value)}
              placeholder={language === 'en' ? 'Search organ, tumor site, metric, or toxicity endpoint...' : 'Kritik organ, tümör sahası veya doz metriği ara...'}
              className="w-full rounded-xl border border-slate-700 bg-[#0a0f1d] py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          {/* Tumor Site / Clinical Protocol Filter */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400">
              <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === 'en' ? 'Clinical Tumor Site (Hospital Protocol)' : 'Klinik Tümör Sahası (Hastane Protokolü)'}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tumorSitesList.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSiteChange(item.id)}
                  aria-pressed={selectedSite === item.id}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${selectedSite === item.id ? 'border-sky-500/70 bg-sky-500/20 text-sky-100 shadow-sm shadow-sky-500/20' : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {language === 'en' ? item.label_en : item.label_tr}
                </button>
              ))}
            </div>
          </div>

          {/* Anatomical Region Filter */}
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

          {/* Fractionation Filter */}
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
              ? `Showing ${sortedConstraints.length} organ protocol cards (${filteredItems.length} metric constraints)`
              : `${sortedConstraints.length} organ protokol kartı (${filteredItems.length} doz metriği) gösteriliyor`}
          </p>
        </section>

        {sortedConstraints.length ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {sortedConstraints.map(card => (
              <OrganConstraintCard key={card.id} card={card} language={language} />
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
