'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowUpDown, ArrowUpRight, Calculator, Info, RotateCcw, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { OARNTPCeiling } from '@/types/oar-guide';

type NumericInput = number | '';

type AlphaBetaPreset = {
  id: string;
  kind: 'tcp-target' | 'oar-ntcp-ceiling';
  label_tr: string;
  label_en: string;
  value: number;
};

type Schedule = {
  totalDose: NumericInput;
  fractions: NumericInput;
};

type ReverseRegimen = {
  fractions: number;
  dosePerFraction: number;
  totalDose: number;
  bed: number;
  technique: 'sbrt-srs' | 'moderate' | 'conventional';
};

type ReverseSortKey = 'fractions' | 'dosePerFraction' | 'totalDose' | 'bed' | 'technique';
type ViewTab = 'calculator' | 'atlas';
type AtlasView = 'tumor' | 'oar';

const presets = [
  { id: 'acute-tumor', kind: 'tcp-target', label_tr: 'Akut Doku / Standart Tümör (α/β = 10 Gy)', label_en: 'Acute Tissue / Standard Tumor (α/β = 10 Gy)', value: 10 },
  { id: 'late-oar', kind: 'oar-ntcp-ceiling', label_tr: 'Geç doku / Genel OAR (α/β = 3.0 Gy)', label_en: 'Late tissue / General OAR (α/β = 3.0 Gy)', value: 3 },
  { id: 'prostate', kind: 'tcp-target', label_tr: 'Prostat Adenokarsinom (α/β = 1.5 Gy)', label_en: 'Prostate Adenocarcinoma (α/β = 1.5 Gy)', value: 1.5 },
  { id: 'melanoma', kind: 'tcp-target', label_tr: 'Melanom (α/β = 2.5 Gy)', label_en: 'Melanoma (α/β = 2.5 Gy)', value: 2.5 },
  { id: 'rcc', kind: 'tcp-target', label_tr: 'Böbrek Hücreli / RCC (α/β = 2.6 Gy)', label_en: 'Renal Cell / RCC (α/β = 2.6 Gy)', value: 2.6 },
  { id: 'breast', kind: 'tcp-target', label_tr: 'Meme Kanseri (α/β = 4.0 Gy)', label_en: 'Breast Cancer (α/β = 4.0 Gy)', value: 4 },
  { id: 'colorectal', kind: 'tcp-target', label_tr: 'Kolorektal Kanser (α/β = 5.0 Gy)', label_en: 'Colorectal AdenoCA (α/β = 5.0 Gy)', value: 5 },
  { id: 'lens', kind: 'oar-ntcp-ceiling', label_tr: 'Lens / Katarakt (α/β = 1.2 Gy)', label_en: 'Lens / Cataract (α/β = 1.2 Gy)', value: 1.2 },
  { id: 'cns-cord', kind: 'oar-ntcp-ceiling', label_tr: 'MSS / Spinal Kord (α/β = 2.0 Gy)', label_en: 'CNS / Spinal Cord (α/β = 2.0 Gy)', value: 2 },
  { id: 'colon-oar', kind: 'oar-ntcp-ceiling', label_tr: 'Kolon & Bağırsak OAR (α/β = 3.0 Gy)', label_en: 'Colon & Bowel OAR (α/β = 3.0 Gy)', value: 3 },
] satisfies AlphaBetaPreset[];

const baselinePresetIds = new Set(['acute-tumor', 'late-oar']);
const tumorPresetIds = new Set(['prostate', 'melanoma', 'rcc', 'breast', 'colorectal']);
const oarPresetIds = new Set(['lens', 'cns-cord', 'colon-oar']);

const fractionCounts = [1, 3, 5, 8, 10, 15, 20, 25, 28, 30, 35];

type TCPTargetBenchmark = {
  id: string;
  title_tr: string;
  title_en: string;
  benchmark_tr: string;
  benchmark_en: string;
  source: string;
  alphaBeta: number;
  targetEqd2: number;
};

type OARNTPCeilingReference = {
  id: string;
  title_tr: string;
  title_en: string;
  limits_tr: string;
  limits_en: string;
};

const tumorTargetAtlas = [
  {
    id: 'lung-sbrt',
    title_tr: 'Erken Evre KHDAK SBRT',
    title_en: 'Early-stage NSCLC SBRT',
    benchmark_tr: 'BED₁₀ ≥ 100 Gy · Onishi et al.; 3 yıllık lokal kontrol >%90',
    benchmark_en: 'BED₁₀ ≥ 100 Gy · Onishi et al.; >90% 3-year local control',
    source: 'Onishi et al.',
    alphaBeta: 10,
    targetEqd2: 100 / (1 + 2 / 10),
  },
  {
    id: 'prostate-definitive',
    title_tr: 'Prostat Adenokarsinom (Definitif)',
    title_en: 'Prostate AdenoCA (Definitive)',
    benchmark_tr: 'EQD2₁.₅ ≥ 78–80 Gy · Doz eskalasyonu çalışmaları',
    benchmark_en: 'EQD2₁.₅ ≥ 78–80 Gy · Dose-escalation trials',
    source: 'Dose-escalation trials',
    alphaBeta: 1.5,
    targetEqd2: 78,
  },
  {
    id: 'cervix-hrctv',
    title_tr: 'Serviks Karsinomu (EBRT + BT HR-CTV)',
    title_en: 'Cervix Carcinoma (EBRT + BT HR-CTV)',
    benchmark_tr: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    benchmark_en: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    source: 'EMBRACE II',
    alphaBeta: 10,
    targetEqd2: 85,
  },
  {
    id: 'breast-adjuvant',
    title_tr: 'Meme Kanseri (Adjuvan)',
    title_en: 'Breast Cancer (Adjuvant)',
    benchmark_tr: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    benchmark_en: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    source: 'FAST-Forward / START-B',
    alphaBeta: 4,
    targetEqd2: 46,
  },
  {
    id: 'head-neck',
    title_tr: 'Baş-Boyun Skuamöz Hücreli Karsinom (Definitif)',
    title_en: 'Head & Neck SCC (Definitive)',
    benchmark_tr: 'EQD2₁₀ ≥ 70 Gy',
    benchmark_en: 'EQD2₁₀ ≥ 70 Gy',
    source: 'Conventional definitive radiotherapy',
    alphaBeta: 10,
    targetEqd2: 70,
  },
  {
    id: 'glioblastoma',
    title_tr: 'Glioblastom (Stupp)',
    title_en: 'Glioblastoma (Stupp)',
    benchmark_tr: 'EQD2₁₀ = 60 Gy · Yaşlılarda hipofraksiyon ≈ 42 Gy',
    benchmark_en: 'EQD2₁₀ = 60 Gy · Elderly hypofractionation ≈ 42 Gy',
    source: 'Stupp regimen',
    alphaBeta: 10,
    targetEqd2: 60,
  },
  {
    id: 'bone-palliation',
    title_tr: 'Kemik Metastazı Palyatif',
    title_en: 'Palliative Bone Metastasis',
    benchmark_tr: '4 Gy × 5: EQD2₁₀ ≈ 23.3 Gy · 8 Gy × 1: EQD2₁₀ = 12 Gy',
    benchmark_en: '4 Gy × 5: EQD2₁₀ ≈ 23.3 Gy · 8 Gy × 1: EQD2₁₀ = 12 Gy',
    source: 'Palliative fractionation schedules',
    alphaBeta: 10,
    targetEqd2: 20,
  },
  {
    id: 'colorectal-short-course',
    title_tr: 'Kolorektal / Rektum Kısa Dönem (RAPIDO)',
    title_en: 'Colorectal / Rectal Short-Course (RAPIDO)',
    benchmark_tr: 'Toplam 25 Gy (5 Gy × 5 fx) · EQD2₅ = 35.7 Gy · BED₅ = 50.0 Gy',
    benchmark_en: 'Total 25 Gy (5 Gy × 5 fx) · EQD2₅ = 35.7 Gy · BED₅ = 50.0 Gy',
    source: 'RAPIDO',
    alphaBeta: 5,
    targetEqd2: 35.7,
  },
  {
    id: 'colorectal-long-course',
    title_tr: 'Rektum Standart Uzun Dönem KRT',
    title_en: 'Rectal Standard Long-Course CRT',
    benchmark_tr: 'Toplam 50.4 Gy (1.8 Gy × 28 fx) · EQD2₁₀ = 49.6 Gy',
    benchmark_en: 'Total 50.4 Gy (1.8 Gy × 28 fx) · EQD2₁₀ = 49.6 Gy',
    source: 'Standard long-course chemoradiotherapy',
    alphaBeta: 10,
    targetEqd2: 49.6,
  },
  {
    id: 'colorectal-oligometastases',
    title_tr: 'Kolorektal Oligometastaz SBRT',
    title_en: 'Colorectal Oligometastasis SBRT',
    benchmark_tr: 'BED₁₀ ≥ 100 Gy · Radyorezistan metastazlarda ablasyon',
    benchmark_en: 'BED₁₀ ≥ 100 Gy · Ablative local control for radioresistant metastases',
    source: 'Colorectal oligometastasis SBRT',
    alphaBeta: 10,
    targetEqd2: 100 / (1 + 2 / 10),
  },
] satisfies readonly TCPTargetBenchmark[];

const oarThresholds = [
  {
    id: 'spinal-cord',
    title_tr: 'Omurilik',
    title_en: 'Spinal Cord',
    limits_tr: 'Konvansiyonel: Dmax < 45–50 Gy · 1 fx SRS: Dmax < 13–14 Gy',
    limits_en: 'Conventional: Dmax < 45–50 Gy · 1 fx SRS: Dmax < 13–14 Gy',
  },
  {
    id: 'brainstem',
    title_tr: 'Beyin Sapı',
    title_en: 'Brainstem',
    limits_tr: 'Konvansiyonel: Dmax < 54 Gy · 1 fx SRS: D0.035cc < 10 Gy',
    limits_en: 'Conventional: Dmax < 54 Gy · 1 fx SRS: D0.035cc < 10 Gy',
  },
  {
    id: 'optic-apparatus',
    title_tr: 'Optik Kiazma / Sinirler',
    title_en: 'Optic Chiasm / Nerves',
    limits_tr: 'Konvansiyonel: Dmax < 54–55 Gy · 1 fx SRS: Dmax < 8–10 Gy',
    limits_en: 'Conventional: Dmax < 54–55 Gy · 1 fx SRS: Dmax < 8–10 Gy',
  },
  {
    id: 'bilateral-lung',
    title_tr: 'Bilateral Akciğer',
    title_en: 'Bilateral Lung',
    limits_tr: 'V20Gy < 30–35% · Ortalama akciğer dozu < 20 Gy',
    limits_en: 'V20Gy < 30–35% · Mean lung dose < 20 Gy',
  },
  {
    id: 'heart',
    title_tr: 'Kalp',
    title_en: 'Heart',
    limits_tr: 'Ortalama doz < 20 Gy (memede < 4–5 Gy) · V30Gy < 45%',
    limits_en: 'Mean dose < 20 Gy (breast: < 4–5 Gy) · V30Gy < 45%',
  },
  {
    id: 'rectum',
    title_tr: 'Rektum',
    title_en: 'Rectum',
    limits_tr: 'V70Gy < 15–20% · V50Gy < 50%',
    limits_en: 'V70Gy < 15–20% · V50Gy < 50%',
  },
  {
    id: 'small-bowel-colon',
    title_tr: 'İnce Bağırsak / Kolon',
    title_en: 'Small Bowel / Colon',
    limits_tr: 'V45Gy < 195 cc · Dmax < 50 Gy',
    limits_en: 'V45Gy < 195 cc · Dmax < 50 Gy',
  },
] satisfies readonly OARNTPCeilingReference[];

export type OarContext = Pick<OARNTPCeiling, 'organ' | 'metric' | 'limit'> & { fractionation: string };

const initialReference: Schedule = { totalDose: 60, fractions: 30 };
const initialAlternative: Schedule = { totalDose: 40, fractions: 15 };

const calculate = (schedule: Schedule, alphaBetaTumorInput: NumericInput, alphaBetaLateInput: NumericInput) => {
  const totalDose = typeof schedule.totalDose === 'number' ? schedule.totalDose : 0;
  const fractions = typeof schedule.fractions === 'number' ? schedule.fractions : 0;
  const alphaBetaTumor = typeof alphaBetaTumorInput === 'number' ? alphaBetaTumorInput : 0;
  const alphaBetaLate = typeof alphaBetaLateInput === 'number' ? alphaBetaLateInput : 0;
  if (
    !Number.isFinite(totalDose)
    || !Number.isFinite(fractions)
    || totalDose <= 0
    || fractions <= 0
    || !Number.isInteger(fractions)
    || !Number.isFinite(alphaBetaTumor) || alphaBetaTumor <= 0
    || !Number.isFinite(alphaBetaLate) || alphaBetaLate <= 0
  ) return null;
  const dosePerFraction = totalDose / fractions;
  const bedTumor = totalDose * (1 + dosePerFraction / alphaBetaTumor);
  const eqd2Tumor = bedTumor / (1 + 2 / alphaBetaTumor);
  const bedLate = totalDose * (1 + dosePerFraction / alphaBetaLate);
  const eqd2Late = bedLate / (1 + 2 / alphaBetaLate);
  return { dosePerFraction, bedTumor, eqd2Tumor, bedLate, eqd2Late };
};

const solveReverseRegimens = (targetEqd2: number, alphaBeta: number): ReverseRegimen[] => {
  if (!Number.isFinite(targetEqd2) || targetEqd2 <= 0 || !Number.isFinite(alphaBeta) || alphaBeta <= 0) return [];
  return fractionCounts.map(fractions => {
    const dosePerFraction = (
      -alphaBeta
      + Math.sqrt(alphaBeta ** 2 + (4 * targetEqd2 * (2 + alphaBeta)) / fractions)
    ) / 2;
    const totalDose = fractions * dosePerFraction;
    const bed = totalDose * (1 + dosePerFraction / alphaBeta);
    const technique = fractions <= 5 ? 'sbrt-srs' : fractions <= 20 ? 'moderate' : 'conventional';
    return { fractions, dosePerFraction, totalDose, bed, technique };
  });
};

const techniqueLabel = (technique: ReverseRegimen['technique'], language: 'tr' | 'en') => {
  if (technique === 'sbrt-srs') return language === 'en' ? 'SBRT / SRS' : 'SBRT / SRS';
  if (technique === 'moderate') return language === 'en' ? 'Moderate Hypofractionation' : 'Orta Hipofraksiyon';
  return language === 'en' ? 'Conventional' : 'Konvansiyonel';
};

const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: NumericInput;
  onChange: (value: NumericInput) => void;
  min: number;
  max: number;
  step: number;
}) => (
  <label className="block text-xs font-medium text-slate-300">
    {label}
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={event => {
        const raw = event.currentTarget.value;
        if (raw === '') {
          onChange('');
          return;
        }
        const next = Number.parseFloat(raw);
        if (Number.isFinite(next)) onChange(next);
      }}
      className="mt-1.5 w-full [appearance:textfield] rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  </label>
);

export default function DoseCalculator({ initialOarContext }: { initialOarContext: OarContext | null }) {
  const { language: lang } = useLanguage();
  const [alphaBetaTumor, setAlphaBetaTumor] = useState<NumericInput>(10);
  const [alphaBetaLate, setAlphaBetaLate] = useState<NumericInput>(3);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('acute-tumor');
  const [reference, setReference] = useState(initialReference);
  const [alternative, setAlternative] = useState(initialAlternative);
  const [activeTab, setActiveTab] = useState<ViewTab>('calculator');
  const [atlasView, setAtlasView] = useState<AtlasView>('tumor');
  const [targetEqd2, setTargetEqd2] = useState<NumericInput>(72);
  const [reverseSortKey, setReverseSortKey] = useState<ReverseSortKey>('fractions');
  const [reverseSortDirection, setReverseSortDirection] = useState<'asc' | 'desc'>('asc');

  const effectiveAlphaBetaTumor = typeof alphaBetaTumor === 'number' ? alphaBetaTumor : 0;
  const effectiveAlphaBetaLate = typeof alphaBetaLate === 'number' ? alphaBetaLate : 0;
  const effectiveTarget = typeof targetEqd2 === 'number' ? targetEqd2 : 0;
  const alphaBetaTumorDisplay = alphaBetaTumor === '' ? '?' : alphaBetaTumor;
  const alphaBetaLateDisplay = alphaBetaLate === '' ? '?' : alphaBetaLate;
  const referenceResult = useMemo(() => calculate(reference, effectiveAlphaBetaTumor, effectiveAlphaBetaLate), [effectiveAlphaBetaTumor, effectiveAlphaBetaLate, reference]);
  const alternativeResult = useMemo(() => calculate(alternative, effectiveAlphaBetaTumor, effectiveAlphaBetaLate), [alternative, effectiveAlphaBetaTumor, effectiveAlphaBetaLate]);
  const reverseRegimens = useMemo(
    () => solveReverseRegimens(effectiveTarget, effectiveAlphaBetaTumor),
    [effectiveAlphaBetaTumor, effectiveTarget],
  );
  const sortedReverseRegimens = useMemo(() => [...reverseRegimens].sort((left, right) => {
    const comparison = reverseSortKey === 'technique'
      ? techniqueLabel(left.technique, lang).localeCompare(techniqueLabel(right.technique, lang))
      : left[reverseSortKey] - right[reverseSortKey];
    return reverseSortDirection === 'asc' ? comparison : -comparison;
  }), [lang, reverseRegimens, reverseSortDirection, reverseSortKey]);
  const bedDelta = referenceResult && alternativeResult ? alternativeResult.bedTumor - referenceResult.bedTumor : null;
  const eqd2Delta = referenceResult && alternativeResult ? alternativeResult.eqd2Tumor - referenceResult.eqd2Tumor : null;

  const updateSchedule = (key: 'reference' | 'alternative', field: keyof Schedule, value: NumericInput) => {
    const setter = key === 'reference' ? setReference : setAlternative;
    setter(previous => ({ ...previous, [field]: value }));
  };

  const sortReverseRegimens = (key: ReverseSortKey) => {
    if (reverseSortKey === key) {
      setReverseSortDirection(direction => direction === 'asc' ? 'desc' : 'asc');
    } else {
      setReverseSortKey(key);
      setReverseSortDirection('asc');
    }
  };

  const applyReverseRegimen = (regimen: ReverseRegimen) => {
    setAlternative({ totalDose: regimen.totalDose, fractions: regimen.fractions });
    window.requestAnimationFrame(() => {
      document.getElementById('alternative-schedule-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const renderPresetPill = (preset: (typeof presets)[number]) => (
    <button
      key={preset.id}
      type="button"
      aria-pressed={selectedPresetId === preset.id}
      onClick={() => {
          if (preset.kind === 'tcp-target') setAlphaBetaTumor(preset.value);
          else setAlphaBetaLate(preset.value);
          setSelectedPresetId(preset.id);
        }}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        selectedPresetId === preset.id
          ? preset.kind === 'tcp-target'
            ? 'ring-1 ring-emerald-400 border-emerald-400/70 bg-emerald-500/10 text-emerald-100'
            : 'ring-1 ring-rose-400 border-rose-400/70 bg-rose-500/10 text-rose-100'
          : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
      }`}
    >
      <span className={`mr-1 rounded px-1 py-0.5 text-[9px] font-bold ${preset.kind === 'tcp-target' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
        {preset.kind === 'tcp-target' ? 'TCP' : 'NTCP'}
      </span>
      {lang === 'en' ? preset.label_en : preset.label_tr}
    </button>
  );

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {lang === 'en' ? 'Linear-quadratic radiobiology' : 'Lineer-kuadratik radyobiyoloji'}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {lang === 'en' ? 'BED / EQD2 Dose Calculator' : 'BED / EQD2 Doz Hesaplayıcı'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {lang === 'en'
              ? 'Compare fractionation schedules using the linear-quadratic model.'
              : 'Lineer-kuadratik modeli kullanarak fraksiyonasyon şemalarını karşılaştırın.'}
          </p>
        </header>

        {initialOarContext && (
          <aside
            className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm"
            aria-label={lang === 'en' ? 'Selected OAR NTCP ceiling' : 'Seçili OAR NTCP tolerans tavanı'}
          >
            <div className="flex flex-wrap items-center gap-2 font-semibold text-rose-100">
              <span>{lang === 'en' ? 'OAR tolerance context received' : 'OAR tolerans bağlamı alındı'}</span>
              <span className="rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-200">NTCP ceiling</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {initialOarContext.organ} · {initialOarContext.metric}: <strong>{initialOarContext.limit}</strong> · {initialOarContext.fractionation}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              {lang === 'en'
                ? 'This reference value is contextual information only. LQ calculations below use the entered prescription dose.'
                : 'Bu referans değeri yalnızca bağlam bilgisi sağlar. Aşağıdaki LQ hesaplamaları girilen reçete dozunu kullanır.'}
            </p>
          </aside>
        )}

        <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-[#0e1726] p-1.5 sm:grid-cols-2" role="tablist" aria-label={lang === 'en' ? 'Radiobiology calculator sections' : 'Radyobiyoloji hesaplayıcı bölümleri'}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'calculator'}
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${activeTab === 'calculator' ? 'bg-violet-500/15 text-violet-100' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {lang === 'en' ? 'Dose Calculator' : 'Doz Hesaplayıcı'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'atlas'}
            onClick={() => setActiveTab('atlas')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${activeTab === 'atlas' ? 'bg-violet-500/15 text-violet-100' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <Target className="h-4 w-4" aria-hidden="true" />
            {lang === 'en' ? 'Curative & Ablative Threshold Atlas' : 'Terapötik Doz Eşik Rehberi'}
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <>
            <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {lang === 'en' ? 'General / Baseline Presets' : 'Temel Radyobiyolojik Referanslar'}
                </h2>
                <span className="w-fit rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[9px] font-bold tracking-wide text-amber-200">
                  ⚡ GENEL STANDARTLAR / BASELINE PRESETS
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {presets.filter(preset => baselinePresetIds.has(preset.id)).map(renderPresetPill)}
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0a0f1d]/70 px-3 py-2 text-xs font-medium text-slate-300">
                    {lang === 'en' ? 'Tumor α/β' : 'Tümör α/β'}
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={alphaBetaTumor}
                      onChange={event => {
                        const raw = event.currentTarget.value;
                        if (raw === '') {
                          setAlphaBetaTumor('');
                          setSelectedPresetId(null);
                          return;
                        }
                        const next = Number.parseFloat(raw);
                        if (Number.isFinite(next) && next > 0) {
                          setAlphaBetaTumor(next);
                          setSelectedPresetId(null);
                        }
                      }}
                      className="w-16 [appearance:textfield] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-white outline-none focus:border-violet-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0a0f1d]/70 px-3 py-2 text-xs font-medium text-slate-300">
                    {lang === 'en' ? 'Late OAR α/β' : 'Geç OAR α/β'}
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={alphaBetaLate}
                      onChange={event => {
                        const raw = event.currentTarget.value;
                        if (raw === '') {
                          setAlphaBetaLate('');
                          return;
                        }
                        const next = Number.parseFloat(raw);
                        if (Number.isFinite(next) && next > 0) {
                          setAlphaBetaLate(next);
                        }
                      }}
                      className="w-16 [appearance:textfield] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-white outline-none focus:border-violet-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </label>
              </div>
            </section>

            <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {lang === 'en' ? 'Organ and Tumor Specific Presets' : 'Organ ve Tümöre Özgü Değerler'}
                </h2>
                <span className="w-fit rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-[9px] font-bold tracking-wide text-violet-200">
                  🧬 ORGAN & TÜMÖR SPESİFİK / SPECIFIC TISSUES
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? 'Specific Tumors' : 'Tümöre Özgü'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {presets.filter(preset => tumorPresetIds.has(preset.id)).map(renderPresetPill)}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? 'Specific OARs / Critical Structures' : 'Özgül OAR / Kritik Yapılar'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {presets.filter(preset => oarPresetIds.has(preset.id)).map(renderPresetPill)}
                  </div>
                </div>
              </div>
            </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {([
          {
                  id: 'reference' as const,
                  title: lang === 'en' ? 'Reference Schedule' : 'Referans Şeması',
                  schedule: reference,
                  result: referenceResult,
                  setter: setReference,
                },
                {
                  id: 'alternative' as const,
                  title: lang === 'en' ? 'Alternative Schedule' : 'Alternatif Şema',
                  schedule: alternative,
                  result: alternativeResult,
                  setter: setAlternative,
                },
              ]).map(card => (
                <section
                  key={card.id}
                  id={card.id === 'alternative' ? 'alternative-schedule-card' : undefined}
                  className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-white">{card.title}</h2>
                    <button
                      type="button"
                      onClick={() => card.setter(card.id === 'reference' ? initialReference : initialAlternative)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" /> {lang === 'en' ? 'Reset' : 'Sıfırla'}
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <NumberField
                      label={lang === 'en' ? 'Total dose D (Gy)' : 'Toplam doz D (Gy)'}
                      value={card.schedule.totalDose}
                      min={0}
                      max={200}
                      step={0.1}
                      onChange={value => updateSchedule(card.id, 'totalDose', value)}
                    />
                    <NumberField
                      label={lang === 'en' ? 'Number of fractions n' : 'Fraksiyon sayısı n'}
                      value={card.schedule.fractions}
                      min={1}
                      max={100}
                      step={1}
                      onChange={value => updateSchedule(card.id, 'fractions', value)}
                    />
                  </div>
                  <div className="mt-3 rounded-lg border border-slate-800 bg-[#0a0f1d] p-3 text-xs text-slate-400">
                    {lang === 'en' ? 'Dose per fraction d:' : 'Fraksiyon başına doz d:'}{' '}
                    <strong className="text-white">{card.result?.dosePerFraction.toFixed(2) ?? '—'} Gy</strong>
                  </div>
                  {card.result ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">EQD2 (Tumor Control / Akut)</div>
                          <div className="mt-1 text-xl font-bold text-white">{card.result.eqd2Tumor.toFixed(2)} <span className="text-xs font-normal text-slate-400">Gy</span></div>
                          <div className="mt-1 text-[10px] text-sky-300/70">BED: {card.result.bedTumor.toFixed(2)} Gy</div>
                        </div>
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">EQD2 (Late Tissue Toxicity / OAR)</div>
                          <div className="mt-1 text-xl font-bold text-white">{card.result.eqd2Late.toFixed(2)} <span className="text-xs font-normal text-slate-400">Gy</span></div>
                          <div className="mt-1 text-[10px] text-rose-300/70">BED: {card.result.bedLate.toFixed(2)} Gy</div>
                        </div>
                      </div>
                    ) : (
                    <p role="alert" className="mt-3 text-xs text-rose-300">
                      {lang === 'en'
                        ? 'Enter a positive total dose and an integer fraction count.'
                        : 'Pozitif bir toplam doz ve tam sayı fraksiyon sayısı girin.'}
                    </p>
                  )}
                </section>
              ))}
            </div>

            <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ArrowLeftRight className="h-4 w-4 text-violet-300" aria-hidden="true" />
                {lang === 'en' ? 'Schedule Comparison' : 'Şema Karşılaştırması'}
              </div>
              {bedDelta !== null && eqd2Delta !== null ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Delta label={`Δ EQD2 (Tumor)`} value={bedDelta} language={lang} />
                    <Delta label={`Δ EQD2 (Late OAR)`} value={eqd2Delta} language={lang} />
                  </div>
              ) : (
                <p role="alert" className="mt-3 text-xs text-rose-300">
                  {lang === 'en'
                    ? 'Enter a positive dose and an integer number of fractions for both schedules.'
                    : 'Her iki şema için pozitif doz ve tam sayı fraksiyon sayısı girin.'}
                </p>
              )}
              <p className="mt-4 rounded-lg bg-slate-900/70 p-3 text-[11px] leading-5 text-slate-400">
                BED = n × d × (1 + d / α/β); EQD2 = BED / (1 + 2 / α/β).{' '}
                {lang === 'en'
                  ? 'Model estimates do not account for repopulation, repair kinetics, treatment time, concurrent systemic therapy, or patient-specific biology.'
                  : 'Model tahminleri repopülasyonu, onarım kinetiğini, tedavi süresini, eşzamanlı sistemik tedaviyi veya hastaya özgü biyolojiyi hesaba katmaz.'}
              </p>
            </section>

            <section className="mt-4 rounded-2xl border border-violet-500/20 bg-[#0e1726] p-4 sm:p-5" aria-labelledby="reverse-solver-heading">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id="reverse-solver-heading" className="text-sm font-semibold text-white">
                    {lang === 'en' ? 'Reverse Target EQD2 Solver' : 'Hedef Dozdan Rejim Türetici'}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {lang === 'en'
                      ? 'Derive dose per fraction, total dose, and BED for standard fraction counts.'
                      : 'Standart fraksiyon sayıları için fraksiyon dozunu, toplam dozu ve BED değerini hesaplayın.'}
                  </p>
                </div>
                <label className="block w-full text-xs font-medium text-slate-300 sm:max-w-52">
                  {lang === 'en' ? 'Target EQD2 (Gy)' : 'Hedef EQD2 (Gy)'}
                  <input
                    type="number"
                    min="0.1"
                    max="250"
                    step="0.1"
                    value={targetEqd2}
                    onChange={event => {
                      const raw = event.currentTarget.value;
                      if (raw === '') {
                        setTargetEqd2('');
                        return;
                      }
                      const next = Number.parseFloat(raw);
                      if (Number.isFinite(next) && next >= 0) setTargetEqd2(next);
                    }}
                    className="mt-1.5 w-full [appearance:textfield] rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </label>
              </div>
              <div className="overflow-x-auto w-full rounded-xl border border-slate-800">
                <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-300">
                    <tr>
                      {([
                        { key: 'fractions', label: lang === 'en' ? 'Fractions (n)' : 'Fraksiyon (n)' },
                        { key: 'dosePerFraction', label: lang === 'en' ? 'Dose / fx (d Gy)' : 'Doz / fx (d Gy)' },
                        { key: 'totalDose', label: lang === 'en' ? 'Total Dose (D Gy)' : 'Toplam Doz (D Gy)' },
                        { key: 'bed', label: 'BED' },
                        { key: 'technique', label: lang === 'en' ? 'Technique Tag' : 'Teknik Etiketi' },
                      ] as { key: ReverseSortKey; label: string }[]).map(column => (
                        <th
                          key={column.key}
                          scope="col"
                          aria-sort={reverseSortKey === column.key
                            ? reverseSortDirection === 'asc' ? 'ascending' : 'descending'
                            : 'none'}
                          className="whitespace-nowrap px-3 py-2.5 font-semibold"
                        >
                          <button
                            type="button"
                            onClick={() => sortReverseRegimens(column.key)}
                            className="inline-flex items-center gap-1.5 hover:text-white"
                          >
                            {column.label}
                            <ArrowUpDown className="h-3 w-3 text-slate-500" aria-hidden="true" />
                          </button>
                        </th>
                      ))}
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        {lang === 'en' ? 'Action' : 'İşlem'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#0a0f1d]">
                    {sortedReverseRegimens.length ? sortedReverseRegimens.map(row => (
                      <tr key={row.fractions} className="text-slate-200">
                        <td className="px-3 py-2.5 font-mono">{row.fractions}</td>
                        <td className="px-3 py-2.5 font-mono">{row.dosePerFraction.toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-mono">{row.totalDose.toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-mono">{row.bed.toFixed(2)}</td>
                        <td className="px-3 py-2.5">{techniqueLabel(row.technique, lang)}</td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => applyReverseRegimen(row)}
                            className="whitespace-nowrap rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/20"
                          >
                            {lang === 'en' ? 'Use as Alternative Schedule' : 'Alternatif Şema Olarak Kullan'}
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-xs text-slate-500">
                          {lang === 'en'
                            ? 'Enter a positive target EQD2 and α/β value to derive schedules.'
                            : 'Şema türetmek için pozitif bir hedef EQD2 ve α/β değeri girin.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-4">
            <header className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <h2 className="text-lg font-bold text-white">
                {lang === 'en' ? 'Dose Benchmark Atlas' : 'Doz Eşik Rehberi'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {lang === 'en'
                  ? 'Tumor targets are minimum floor doses; OAR constraints are maximum tolerance ceilings. They are kept in separate views.'
                  : 'Tümör hedefleri asgari doz tabanlarını, OAR kısıtları ise azami tolerans tavanlarını gösterir. İki grup ayrı sunulur.'}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="tablist" aria-label={lang === 'en' ? 'Dose benchmark categories' : 'Doz eşik kategorileri'}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlasView === 'tumor'}
                  onClick={() => setAtlasView('tumor')}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                    atlasView === 'tumor'
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                      : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  🎯 {lang === 'en' ? 'Tumor Target Doses (TCP)' : 'Tümör Hedef Dozları (TCP)'}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlasView === 'oar'}
                  onClick={() => setAtlasView('oar')}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                    atlasView === 'oar'
                      ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                      : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ {lang === 'en' ? 'Critical Organ Constraints (NTCP)' : 'Kritik Organ Kısıtları (NTCP)'}
                </button>
              </div>
            </header>

            {atlasView === 'tumor' ? (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-6" aria-labelledby="tumor-target-benchmarks-heading">
                <header className="mb-4">
                  <h3 id="tumor-target-benchmarks-heading" className="text-sm font-bold text-emerald-300">
                    🎯 TÜMÖR HEDEF DOZLARI / CURATIVE TARGET BENCHMARKS
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-emerald-100/70">
                    {lang === 'en'
                      ? 'Minimum floor dose benchmarks for curative intent and local control (≥). Select a benchmark to load its EQD2 target into the Reverse Solver.'
                      : 'Küratif amaç ve lokal kontrol için gereken asgari doz eşikleri (≥). EQD2 hedefini ters çözücüye aktarmak için bir eşik seçin.'}
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {tumorTargetAtlas.map(item => (
                    <article key={item.id} className="flex flex-col rounded-xl border border-emerald-500/20 bg-[#0a0f1d]/70 p-4">
                      <h4 className="text-sm font-semibold text-white">{lang === 'en' ? item.title_en : item.title_tr}</h4>
                      <p className="mt-2 flex-1 text-xs leading-5 text-emerald-100/80">
                        {lang === 'en' ? item.benchmark_en : item.benchmark_tr}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-400">
                          {lang === 'en' ? 'Reference: ' : 'Referans: '}{item.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAlphaBetaTumor(item.alphaBeta);
                            setSelectedPresetId(presets.find(preset => preset.value === item.alphaBeta)?.id ?? null);
                            setTargetEqd2(item.targetEqd2);
                            setActiveTab('calculator');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-500/20"
                        >
                          {lang === 'en' ? 'Send to Reverse Solver' : 'Hedef Dozu Çözücüye Aktar'}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-6" aria-labelledby="oar-safety-constraints-heading">
                <header className="mb-4">
                  <h3 id="oar-safety-constraints-heading" className="text-sm font-bold text-rose-300">
                    🛡️ KRİTİK ORGAN TOLERANS SINIRLARI / OAR SAFETY CONSTRAINTS
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-rose-100/70">
                    {lang === 'en'
                      ? 'Maximum ceiling doses that should not be exceeded to reduce normal-tissue toxicity risk (≤).'
                      : 'Normal doku toksisite riskini azaltmak için aşılmaması gereken azami doz tavanları (≤).'}
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {oarThresholds.map(item => (
                    <article key={item.id} className="rounded-xl border border-rose-500/20 bg-[#0a0f1d]/70 p-4">
                      <h4 className="text-sm font-semibold text-white">{lang === 'en' ? item.title_en : item.title_tr}</h4>
                      <p className="mt-2 text-xs leading-5 text-rose-100/80">
                        {lang === 'en' ? item.limits_en : item.limits_tr}
                      </p>
                      <span className="mt-3 inline-flex rounded-full border border-rose-400/20 bg-rose-400/5 px-2.5 py-1 text-[10px] font-semibold text-rose-200">
                        {lang === 'en' ? 'Reference ceiling · Not an EQD2 target' : 'Referans üst sınır · EQD2 hedefi değildir'}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/70">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            {lang === 'en'
              ? 'Educational calculation aid only. EQD2 equivalence does not estimate TCP or establish an NTCP ceiling. Verify prescription, α/β assumptions and clinical interpretation with the treating radiation oncologist and medical physicist.'
              : 'Yalnızca eğitim amaçlı hesaplama aracıdır. EQD2 eşdeğerliği TCP tahmini yapmaz veya NTCP tavanı oluşturmaz. Reçeteyi, α/β varsayımlarını ve klinik yorumu tedavi radyasyon onkoloğu ve medikal fizik uzmanıyla doğrulayın.'}
          </p>
        </div>
        <Link href="/doz-kisitlari" className="mt-4 inline-flex text-xs font-medium text-sky-300 hover:text-sky-200">
          {lang === 'en' ? '← Return to OAR constraints' : '← OAR doz kısıtlarına dön'}
        </Link>
      </div>
    </main>
  );
}

function Delta({ label, value, language }: { label: string; value: number; language: 'tr' | 'en' }) {
  const sign = value > 0 ? '+' : '';
  const color = value > 0 ? 'text-amber-200' : value < 0 ? 'text-emerald-200' : 'text-slate-200';
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label} · {language === 'en' ? 'alternative − reference' : 'alternatif − referans'}
      </div>
      <div className={`mt-1 text-lg font-bold ${color}`}>{sign}{value.toFixed(2)} Gy</div>
    </div>
  );
}
