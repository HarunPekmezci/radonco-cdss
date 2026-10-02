'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowUpDown, ArrowUpRight, Calculator, Info, RotateCcw, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type Schedule = {
  totalDose: number;
  fractions: number;
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

const presets = [
  { id: 'acute-tumor', label_tr: 'Akut doku / Tümör (α/β = 10 Gy)', label_en: 'Acute tissue / Tumor (α/β = 10 Gy)', value: 10 },
  { id: 'breast', label_tr: 'Meme Kanseri (α/β = 4.0 Gy)', label_en: 'Breast Cancer (α/β = 4.0 Gy)', value: 4 },
  { id: 'late-oar', label_tr: 'Geç doku / Genel OAR (α/β = 3.0 Gy)', label_en: 'Late tissue / General OAR (α/β = 3.0 Gy)', value: 3 },
  { id: 'rcc', label_tr: 'Böbrek Hücreli / RCC (α/β = 2.6 Gy)', label_en: 'Renal Cell / RCC (α/β = 2.6 Gy)', value: 2.6 },
  { id: 'melanoma', label_tr: 'Melanom (α/β = 2.5 Gy)', label_en: 'Melanoma (α/β = 2.5 Gy)', value: 2.5 },
  { id: 'cns-cord', label_tr: 'MSS / Kord (α/β = 2.0 Gy)', label_en: 'CNS / Cord (α/β = 2.0 Gy)', value: 2 },
  { id: 'prostate', label_tr: 'Prostat Adenokarsinom (α/β = 1.5 Gy)', label_en: 'Prostate Adenocarcinoma (α/β = 1.5 Gy)', value: 1.5 },
  { id: 'lens', label_tr: 'Lens / Katarakt (α/β = 1.2 Gy)', label_en: 'Lens / Cataract (α/β = 1.2 Gy)', value: 1.2 },
  { id: 'colorectal', label_tr: 'Kolorektal Kanser (α/β = 5.0 Gy)', label_en: 'Colorectal AdenoCA (α/β = 5.0 Gy)', value: 5 },
  { id: 'colon-oar', label_tr: 'Kolon & Bağırsak OAR (α/β = 3.0 Gy)', label_en: 'Colon & Bowel OAR (α/β = 3.0 Gy)', value: 3 },
] as const;

const fractionCounts = [1, 3, 5, 8, 10, 15, 20, 25, 28, 30, 35];

const thresholdAtlas = [
  {
    id: 'lung-sbrt',
    title_tr: 'Akciğer SBRT (Ablatif)',
    title_en: 'Lung SBRT (Ablative)',
    benchmark_tr: 'BED₁₀ ≥ 100 Gy · Onishi et al.; 3 yıllık lokal kontrol >%90',
    benchmark_en: 'BED₁₀ ≥ 100 Gy · Onishi et al.; >90% 3-year local control',
    source: 'Onishi et al.',
    alphaBeta: 10,
    targetEqd2: 100 / (1 + 2 / 10),
  },
  {
    id: 'prostate-definitive',
    title_tr: 'Prostat Definitif',
    title_en: 'Prostate Definitive',
    benchmark_tr: 'EQD2₁.₅ ≥ 78–80 Gy · Doz eskalasyonu çalışmaları',
    benchmark_en: 'EQD2₁.₅ ≥ 78–80 Gy · Dose-escalation trials',
    source: 'Dose-escalation trials',
    alphaBeta: 1.5,
    targetEqd2: 78,
  },
  {
    id: 'cervix-hrctv',
    title_tr: 'Serviks HR-CTV (EBRT + Brakiterapi)',
    title_en: 'Cervix HR-CTV (EBRT + Brachytherapy)',
    benchmark_tr: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    benchmark_en: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    source: 'EMBRACE II',
    alphaBeta: 10,
    targetEqd2: 85,
  },
  {
    id: 'breast-adjuvant',
    title_tr: 'Meme Adjuvan',
    title_en: 'Breast Adjuvant',
    benchmark_tr: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    benchmark_en: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    source: 'FAST-Forward / START-B',
    alphaBeta: 4,
    targetEqd2: 46,
  },
  {
    id: 'head-neck',
    title_tr: 'Baş-Boyun Definitif',
    title_en: 'Head & Neck Definitive',
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
    title_tr: 'Kolorektal Kısa Dönem Neoadjuvan (RAPIDO)',
    title_en: 'Rectal / Colon Neoadjuvant Short-Course (RAPIDO)',
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
] as const;

const initialReference: Schedule = { totalDose: 60, fractions: 30 };
const initialAlternative: Schedule = { totalDose: 40, fractions: 15 };

export type OarContext = { organ: string; metric: string; limit: string; fractionation: string };

const calculate = (schedule: Schedule, alphaBeta: number) => {
  if (
    !Number.isFinite(schedule.totalDose)
    || !Number.isFinite(schedule.fractions)
    || schedule.totalDose <= 0
    || schedule.fractions <= 0
    || !Number.isInteger(schedule.fractions)
    || !Number.isFinite(alphaBeta)
    || alphaBeta <= 0
  ) return null;
  const dosePerFraction = schedule.totalDose / schedule.fractions;
  const bed = schedule.totalDose * (1 + dosePerFraction / alphaBeta);
  const eqd2 = bed / (1 + 2 / alphaBeta);
  return { dosePerFraction, bed, eqd2 };
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
  value: number;
  onChange: (value: number) => void;
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
        const next = Number(event.target.value);
        if (Number.isFinite(next)) onChange(next);
      }}
      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400"
    />
  </label>
);

export default function DoseCalculator({ initialOarContext }: { initialOarContext: OarContext | null }) {
  const { language: lang } = useLanguage();
  const [alphaBeta, setAlphaBeta] = useState(10);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('acute-tumor');
  const [reference, setReference] = useState(initialReference);
  const [alternative, setAlternative] = useState(initialAlternative);
  const [activeTab, setActiveTab] = useState<ViewTab>('calculator');
  const [targetEqd2, setTargetEqd2] = useState(72);
  const [reverseSortKey, setReverseSortKey] = useState<ReverseSortKey>('fractions');
  const [reverseSortDirection, setReverseSortDirection] = useState<'asc' | 'desc'>('asc');

  const referenceResult = useMemo(() => calculate(reference, alphaBeta), [alphaBeta, reference]);
  const alternativeResult = useMemo(() => calculate(alternative, alphaBeta), [alphaBeta, alternative]);
  const reverseRegimens = useMemo(() => solveReverseRegimens(targetEqd2, alphaBeta), [alphaBeta, targetEqd2]);
  const sortedReverseRegimens = useMemo(() => [...reverseRegimens].sort((left, right) => {
    const comparison = reverseSortKey === 'technique'
      ? techniqueLabel(left.technique, lang).localeCompare(techniqueLabel(right.technique, lang))
      : left[reverseSortKey] - right[reverseSortKey];
    return reverseSortDirection === 'asc' ? comparison : -comparison;
  }), [lang, reverseRegimens, reverseSortDirection, reverseSortKey]);
  const validSchedules = [reference, alternative].every(schedule =>
    Number.isFinite(schedule.totalDose)
    && Number.isFinite(schedule.fractions)
    && schedule.totalDose > 0
    && schedule.fractions > 0
    && Number.isInteger(schedule.fractions)
  );
  const bedDelta = validSchedules && referenceResult && alternativeResult ? alternativeResult.bed - referenceResult.bed : null;
  const eqd2Delta = validSchedules && referenceResult && alternativeResult ? alternativeResult.eqd2 - referenceResult.eqd2 : null;

  const updateSchedule = (key: 'reference' | 'alternative', field: keyof Schedule, value: number) => {
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
            className="mb-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 text-sm"
            aria-label={lang === 'en' ? 'Selected OAR constraint' : 'Seçili OAR doz kısıtı'}
          >
            <div className="font-semibold text-cyan-100">
              {lang === 'en' ? 'OAR constraint context received' : 'OAR kısıt bağlamı alındı'}
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
            <section className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-white">
                {lang === 'en' ? 'Tissue α/β presets' : 'Doku α/β hazır değerleri'}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={selectedPresetId === preset.id}
                    onClick={() => {
                      setAlphaBeta(preset.value);
                      setSelectedPresetId(preset.id);
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selectedPresetId === preset.id ? 'border-violet-400/70 bg-violet-400/10 text-violet-100' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                  >
                    {lang === 'en' ? preset.label_en : preset.label_tr}
                  </button>
                ))}
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                {lang === 'en' ? 'Custom α/β (Gy)' : 'Özel α/β (Gy)'}
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={alphaBeta}
                  onChange={event => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next) && next > 0) {
                      setAlphaBeta(next);
                      setSelectedPresetId(null);
                    }
                  }}
                  className="w-24 rounded-lg border border-slate-700 bg-[#0a0f1d] px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>
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
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">BED{alphaBeta}</div>
                        <div className="mt-1 text-xl font-bold text-white">{card.result.bed.toFixed(2)} <span className="text-xs font-normal text-slate-400">Gy</span></div>
                      </div>
                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">EQD2{alphaBeta}</div>
                        <div className="mt-1 text-xl font-bold text-white">{card.result.eqd2.toFixed(2)} <span className="text-xs font-normal text-slate-400">Gy</span></div>
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
                  <Delta label={`Δ BED${alphaBeta}`} value={bedDelta} language={lang} />
                  <Delta label={`Δ EQD2${alphaBeta}`} value={eqd2Delta} language={lang} />
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
                      const next = Number(event.currentTarget.value);
                      if (Number.isFinite(next) && next > 0) setTargetEqd2(next);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0a0f1d] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400"
                  />
                </label>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
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
                    {sortedReverseRegimens.map(row => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6" aria-labelledby="threshold-atlas-heading">
            <header className="mb-4">
              <h2 id="threshold-atlas-heading" className="text-lg font-bold text-white">
                {lang === 'en' ? 'Curative & Ablative Threshold Atlas' : 'Terapötik Doz Eşik Rehberi'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {lang === 'en'
                  ? 'Reference benchmarks from representative regimens and trials. Select a row to transfer its EQD2 target and α/β to the reverse solver.'
                  : 'Örnek tedavi şemaları ve çalışmalardan doz eşikleri. EQD2 hedefini ve α/β değerini ters çözücüye aktarmak için bir satır seçin.'}
              </p>
            </header>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {thresholdAtlas.map(item => (
                <article key={item.id} className="flex flex-col rounded-xl border border-slate-800 bg-[#0a0f1d] p-4">
                  <h3 className="text-sm font-semibold text-white">{lang === 'en' ? item.title_en : item.title_tr}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-slate-300">
                    {lang === 'en' ? item.benchmark_en : item.benchmark_tr}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-500">
                      {lang === 'en' ? 'Reference: ' : 'Referans: '}{item.source}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAlphaBeta(item.alphaBeta);
                        setSelectedPresetId(presets.find(preset => preset.value === item.alphaBeta)?.id ?? null);
                        setTargetEqd2(item.targetEqd2);
                        setActiveTab('calculator');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-[11px] font-semibold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-400/20"
                    >
                      {lang === 'en' ? 'Send to Reverse Solver' : 'Hedef Dozu Çözücüye Aktar'}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/70">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            {lang === 'en'
              ? 'Educational calculation aid only. Verify prescription, α/β assumptions and clinical interpretation with the treating radiation oncologist and medical physicist.'
              : 'Yalnızca eğitim amaçlı hesaplama aracıdır. Reçeteyi, α/β varsayımlarını ve klinik yorumu tedavi radyasyon onkoloğu ve medikal fizik uzmanıyla doğrulayın.'}
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
