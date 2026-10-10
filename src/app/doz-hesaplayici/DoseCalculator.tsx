'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpDown,
  ArrowUpRight,
  Calculator,
  CalendarClock,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { OARNTPCeiling } from '@/types/oar-guide';
import {
  presets,
  baselinePresetIds,
  tumorPresetIds,
  oarPresetIds,
  fractionCounts,
  tumorTargetAtlas,
  oarThresholds,
} from '@/data/radiobiologyData';

type NumericInput = number | '';

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

export type OarContext = Pick<OARNTPCeiling, 'organ' | 'metric' | 'limit'> & { fractionation: string };

type ClinicalPreset = {
  id: string;
  label: string;
  tag: string;
  descriptionTr: string;
  descriptionEn: string;
  regA: { totalDose: number; fractions: number };
  regB: { totalDose: number; fractions: number };
};

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: 'breast-fast-forward',
    label: 'Meme: 50 Gy / 25 fx vs 26 Gy / 5 fx (FAST-Forward)',
    tag: 'FAST-Forward',
    descriptionTr: 'FAST-Forward (Lancet 2020): 1-haftalık ultra-hipofraksiyon (5.2 Gy/fx) vs standart 25 fx (2.0 Gy/fx)',
    descriptionEn: 'FAST-Forward Trial (Lancet 2020): 1-week ultra-hypofractionation (5.2 Gy/fx) vs standard 25 fx (2.0 Gy/fx)',
    regA: { totalDose: 50, fractions: 25 },
    regB: { totalDose: 26, fractions: 5 },
  },
  {
    id: 'prostate-chhip',
    label: 'Prostat: 78 Gy / 39 fx vs 60 Gy / 20 fx (CHHiP)',
    tag: 'CHHiP',
    descriptionTr: 'CHHiP (Lancet Oncol 2016): Orta hipofraksiyon (3.0 Gy/fx) vs konvansiyonel eskalasyon (2.0 Gy/fx)',
    descriptionEn: 'CHHiP Trial (Lancet Oncol 2016): Moderate hypofractionation (3.0 Gy/fx) vs conventional escalation (2.0 Gy/fx)',
    regA: { totalDose: 78, fractions: 39 },
    regB: { totalDose: 60, fractions: 20 },
  },
  {
    id: 'thorax-hypo',
    label: 'Toraks: 60 Gy / 30 fx vs 55 Gy / 20 fx',
    tag: 'Toraks Hypo',
    descriptionTr: 'Toraks KHDAK: Standart küratif 60 Gy (2.0 Gy/fx) vs akselere hipofraksiyonel 55 Gy (2.75 Gy/fx)',
    descriptionEn: 'Thoracic NSCLC: Standard curative 60 Gy (2.0 Gy/fx) vs accelerated hypofractionated 55 Gy (2.75 Gy/fx)',
    regA: { totalDose: 60, fractions: 30 },
    regB: { totalDose: 55, fractions: 20 },
  },
];

const calculate = (schedule: Schedule, alphaBeta: number) => {
  const totalDose = typeof schedule.totalDose === 'number' ? schedule.totalDose : 0;
  const fractions = typeof schedule.fractions === 'number' ? schedule.fractions : 0;
  if (
    !Number.isFinite(totalDose) ||
    !Number.isFinite(fractions) ||
    totalDose <= 0 ||
    fractions <= 0 ||
    !Number.isFinite(alphaBeta) ||
    alphaBeta <= 0
  ) {
    return null;
  }
  const dosePerFraction = totalDose / fractions;
  const bed = totalDose * (1 + dosePerFraction / alphaBeta);
  const eqd2 = bed / (1 + 2 / alphaBeta);
  return { dosePerFraction, bed, eqd2 };
};

const solveReverseRegimens = (targetEqd2: number, alphaBeta: number): ReverseRegimen[] => {
  if (!Number.isFinite(targetEqd2) || targetEqd2 <= 0 || !Number.isFinite(alphaBeta) || alphaBeta <= 0) return [];
  return fractionCounts.map(fractions => {
    const dosePerFraction =
      (-alphaBeta + Math.sqrt(alphaBeta ** 2 + (4 * targetEqd2 * (2 + alphaBeta)) / fractions)) / 2;
    const totalDose = fractions * dosePerFraction;
    const bed = totalDose * (1 + dosePerFraction / alphaBeta);
    const technique = fractions <= 5 ? 'sbrt-srs' : fractions <= 20 ? 'moderate' : 'conventional';
    return { fractions, dosePerFraction, totalDose, bed, technique };
  });
};

const techniqueLabel = (technique: ReverseRegimen['technique'], language: 'tr' | 'en') => {
  if (technique === 'sbrt-srs') return 'SBRT / SRS';
  if (technique === 'moderate') return language === 'en' ? 'Moderate Hypofractionation' : 'Orta Hipofraksiyon';
  return language === 'en' ? 'Conventional' : 'Konvansiyonel';
};

export default function DoseCalculator({ initialOarContext }: { initialOarContext: OarContext | null }) {
  const { language: lang } = useLanguage();

  // Clinical Regimens
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('breast-fast-forward');
  const [reference, setReference] = useState<Schedule>({ totalDose: 50, fractions: 25 });
  const [alternative, setAlternative] = useState<Schedule>({ totalDose: 26, fractions: 5 });

  // Custom alpha/beta controls
  const [alphaBetaTumor, setAlphaBetaTumor] = useState<NumericInput>(10);
  const [alphaBetaLate, setAlphaBetaLate] = useState<NumericInput>(3);
  const [selectedTissuePresetId, setSelectedTissuePresetId] = useState<string | null>('acute-tumor');
  const [showTissuePresets, setShowTissuePresets] = useState(false);

  // Tab & Atlas
  const [activeTab, setActiveTab] = useState<ViewTab>('calculator');
  const [atlasView, setAtlasView] = useState<AtlasView>('tumor');

  // Treatment Gap Compensation State
  const [gapMissedDays, setGapMissedDays] = useState<number>(3);
  const [gapRemainingFractions, setGapRemainingFractions] = useState<number>(15);
  const [gapDailyLoss, setGapDailyLoss] = useState<number>(0.6);

  // Reverse Solver State
  const [targetEqd2, setTargetEqd2] = useState<NumericInput>(72);
  const [reverseSortKey, setReverseSortKey] = useState<ReverseSortKey>('fractions');
  const [reverseSortDirection, setReverseSortDirection] = useState<'asc' | 'desc'>('asc');

  // Apply Quick Clinical Preset
  const applyPreset = (preset: ClinicalPreset) => {
    setSelectedPresetId(preset.id);
    setReference({ totalDose: preset.regA.totalDose, fractions: preset.regA.fractions });
    setAlternative({ totalDose: preset.regB.totalDose, fractions: preset.regB.fractions });
  };

  // Calculations for Regimen A & Regimen B
  const resA10 = useMemo(() => calculate(reference, 10), [reference]);
  const resA3 = useMemo(() => calculate(reference, 3), [reference]);
  const resB10 = useMemo(() => calculate(alternative, 10), [alternative]);
  const resB3 = useMemo(() => calculate(alternative, 3), [alternative]);

  // Deltas
  const eqd2Delta10 = resA10 && resB10 ? resB10.eqd2 - resA10.eqd2 : 0;
  const bedDelta10 = resA10 && resB10 ? resB10.bed - resA10.bed : 0;
  const eqd2Delta3 = resA3 && resB3 ? resB3.eqd2 - resA3.eqd2 : 0;
  const bedDelta3 = resA3 && resB3 ? resB3.bed - resA3.bed : 0;

  // Gap Compensation Math
  const plannedDosePerFx =
    typeof reference.totalDose === 'number' && typeof reference.fractions === 'number' && reference.fractions > 0
      ? reference.totalDose / reference.fractions
      : 2.0;
  const gapDoseDeficit = gapMissedDays * gapDailyLoss;
  const gapExtraDosePerFx = gapRemainingFractions > 0 ? gapDoseDeficit / gapRemainingFractions : 0;
  const gapCompensatedDosePerFx = plannedDosePerFx + gapExtraDosePerFx;

  // Reverse Solver Math
  const effectiveAlphaBetaTumor = typeof alphaBetaTumor === 'number' ? alphaBetaTumor : 10;
  const effectiveTarget = typeof targetEqd2 === 'number' ? targetEqd2 : 0;
  const reverseRegimens = useMemo(
    () => solveReverseRegimens(effectiveTarget, effectiveAlphaBetaTumor),
    [effectiveAlphaBetaTumor, effectiveTarget],
  );
  const sortedReverseRegimens = useMemo(() => {
    return [...reverseRegimens].sort((left, right) => {
      const comparison =
        reverseSortKey === 'technique'
          ? techniqueLabel(left.technique, lang).localeCompare(techniqueLabel(right.technique, lang))
          : left[reverseSortKey] - right[reverseSortKey];
      return reverseSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lang, reverseRegimens, reverseSortDirection, reverseSortKey]);

  const sortReverseRegimens = (key: ReverseSortKey) => {
    if (reverseSortKey === key) {
      setReverseSortDirection(direction => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setReverseSortKey(key);
      setReverseSortDirection('asc');
    }
  };

  const applyReverseRegimen = (regimen: ReverseRegimen) => {
    setSelectedPresetId(null);
    setAlternative({ totalDose: Number(regimen.totalDose.toFixed(1)), fractions: regimen.fractions });
    window.requestAnimationFrame(() => {
      document.getElementById('comparator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const renderTissuePresetPill = (preset: (typeof presets)[number]) => (
    <button
      key={preset.id}
      type="button"
      aria-pressed={selectedTissuePresetId === preset.id}
      onClick={() => {
        if (preset.kind === 'tcp-target') setAlphaBetaTumor(preset.value);
        else setAlphaBetaLate(preset.value);
        setSelectedTissuePresetId(preset.id);
      }}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        selectedTissuePresetId === preset.id
          ? preset.kind === 'tcp-target'
            ? 'ring-1 ring-emerald-400 border-emerald-400/70 bg-emerald-500/10 text-emerald-100'
            : 'ring-1 ring-rose-400 border-rose-400/70 bg-rose-500/10 text-rose-100'
          : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
      }`}
    >
      <span
        className={`mr-1 rounded px-1 py-0.5 text-[9px] font-bold ${
          preset.kind === 'tcp-target' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'
        }`}
      >
        {preset.kind === 'tcp-target' ? 'TCP' : 'NTCP'}
      </span>
      {lang === 'en' ? preset.label_en : preset.label_tr}
    </button>
  );

  return (
    <main className="min-h-full bg-[#060b14] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              {lang === 'en' ? 'Live Radiobiological Workstation' : 'Canlı Radyobiyolojik Dozimetri & Hesaplayıcı'}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {lang === 'en' ? 'Radiobiological Regimen Comparator' : 'Radyobiyolojik Şema Karşılaştırıcı & Dozimetri'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
              {lang === 'en'
                ? 'Dynamic side-by-side comparison of standard vs hypofractionated regimens (LQ Model, BED, EQD2) with treatment gap compensation.'
                : 'Lineer-kuadratik model (LQ) ile standart ve hipofraksiyonel şemaların canlı BED/EQD2 karşılaştırması ve seans arası telafi motoru.'}
            </p>
          </div>

          <div
            className="flex rounded-xl border border-slate-800 bg-[#0c1322] p-1 text-xs"
            role="tablist"
            aria-label="Navigation tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'calculator'}
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition ${
                activeTab === 'calculator'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              {lang === 'en' ? 'Dose Calculator & Comparator' : 'Şema Karşılaştırıcı & Telafi'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'atlas'}
              onClick={() => setActiveTab('atlas')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition ${
                activeTab === 'atlas'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="h-4 w-4 text-sky-400" />
              {lang === 'en' ? 'Curative & OAR Atlas' : 'Terapötik Doz Eşik Atlası'}
            </button>
          </div>
        </header>

        {/* Optional OAR Tolerance Ceiling Context */}
        {initialOarContext && (
          <aside
            className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm"
            aria-label={lang === 'en' ? 'Selected OAR NTCP ceiling' : 'Seçili OAR NTCP tolerans tavanı'}
          >
            <div className="flex flex-wrap items-center gap-2 font-semibold text-rose-100">
              <span>{lang === 'en' ? 'OAR tolerance context received' : 'OAR tolerans bağlamı aktarıldı'}</span>
              <span className="rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-200">
                NTCP ceiling
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {initialOarContext.organ} · {initialOarContext.metric}: <strong>{initialOarContext.limit}</strong> ·{' '}
              {initialOarContext.fractionation}
            </p>
          </aside>
        )}

        {activeTab === 'calculator' ? (
          <div className="space-y-8">
            {/* 1. Flagship Live Radiobiological Regimen Comparator */}
            <section id="comparator-section" className="space-y-6">
              {/* Presets Bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {lang === 'en' ? '1-Click Landmark Clinical Presets' : '1-Tık Hızlı Klinik Şema Şablonları'}
                  </div>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {lang === 'en' ? 'Select a landmark trial comparison' : 'Seçili faz III landmark çalışma şablonu'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {CLINICAL_PRESETS.map(preset => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`text-left rounded-xl border p-3 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-500/60 bg-cyan-950/30 text-white ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                            : 'border-slate-800 bg-[#0c1322] text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {preset.tag}
                          </span>
                          {isSelected && <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                        </div>
                        <div className="text-xs font-bold text-white leading-snug">{preset.label}</div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {lang === 'en' ? preset.descriptionEn : preset.descriptionTr}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two-Column Regimen Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Regimen A */}
                <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 to-[#0c1322] p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-sky-400 animate-pulse"></div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                        {lang === 'en' ? 'Standard Regimen (A)' : 'Standart Şema (A)'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(null);
                        setReference({ totalDose: 50, fractions: 25 });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                    >
                      <RotateCcw className="h-3 w-3" /> {lang === 'en' ? 'Reset' : 'Sıfırla'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Total Dose (Gy)' : 'Toplam Doz (Gy)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        value={reference.totalDose}
                        onChange={e => {
                          setSelectedPresetId(null);
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setReference(prev => ({ ...prev, totalDose: val }));
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-3 text-lg font-bold text-white font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Fractions (n)' : 'Fraksiyon Sayısı (n)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={reference.fractions}
                        onChange={e => {
                          setSelectedPresetId(null);
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setReference(prev => ({ ...prev, fractions: val }));
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-3 text-lg font-bold text-white font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-300">
                      {lang === 'en' ? 'Dose per fraction (d):' : 'Fraksiyon başına doz (d):'}
                    </span>
                    <span className="text-xl font-bold font-mono text-sky-300">
                      {resA10 ? resA10.dosePerFraction.toFixed(2) : '—'}{' '}
                      <span className="text-xs text-sky-400 font-sans">Gy/fx</span>
                    </span>
                  </div>
                </div>

                {/* Regimen B */}
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-[#0c1322] p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                        {lang === 'en' ? 'Alternative Regimen (B)' : 'Alternatif Şema (B)'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(null);
                        setAlternative({ totalDose: 26, fractions: 5 });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                    >
                      <RotateCcw className="h-3 w-3" /> {lang === 'en' ? 'Reset' : 'Sıfırla'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Total Dose (Gy)' : 'Toplam Doz (Gy)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        value={alternative.totalDose}
                        onChange={e => {
                          setSelectedPresetId(null);
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setAlternative(prev => ({ ...prev, totalDose: val }));
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-3 text-lg font-bold text-white font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Fractions (n)' : 'Fraksiyon Sayısı (n)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={alternative.fractions}
                        onChange={e => {
                          setSelectedPresetId(null);
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setAlternative(prev => ({ ...prev, fractions: val }));
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-3 text-lg font-bold text-white font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-300">
                      {lang === 'en' ? 'Dose per fraction (d):' : 'Fraksiyon başına doz (d):'}
                    </span>
                    <span className="text-xl font-bold font-mono text-amber-300">
                      {resB10 ? resB10.dosePerFraction.toFixed(2) : '—'}{' '}
                      <span className="text-xs text-amber-400 font-sans">Gy/fx</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Dynamic Comparison Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-[#080d19]">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#0b1324] border-b border-slate-700/80 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-5 py-4 sm:px-8 sm:py-5">
                        {lang === 'en' ? 'Effect / Parameter' : 'Etki / Biyolojik Parametre'}
                      </th>
                      <th className="px-5 py-4 sm:px-8 sm:py-5 text-right text-sky-400">
                        {lang === 'en' ? 'Regimen A (Standard)' : 'Şema A (Standart)'}
                      </th>
                      <th className="px-5 py-4 sm:px-8 sm:py-5 text-right text-amber-400">
                        {lang === 'en' ? 'Regimen B (Alternative)' : 'Şema B (Alternatif)'}
                      </th>
                      <th className="px-5 py-4 sm:px-8 sm:py-5 text-center bg-slate-900/60">
                        {lang === 'en' ? 'Δ Difference (B − A)' : 'Δ Fark (B − A)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {/* Acute/Tumor Effect (alpha/beta = 10) */}
                    <tr className="hover:bg-slate-900/40 transition duration-200">
                      <td className="px-5 py-5 sm:px-8 sm:py-6">
                        <div className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                          <Target className="w-4 h-4 text-sky-400 shrink-0" />
                          {lang === 'en' ? 'Tumor Control / Acute Effect' : 'Tümör Kontrolü & Akut Etki (TCP)'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono font-semibold tracking-wider">
                          α/β = 10 (BED₁₀ / EQD2₁₀)
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-right font-mono">
                        <div className="text-sky-400 text-lg sm:text-xl font-bold mb-0.5">
                          {resA10 ? resA10.bed.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">Gy₁₀</span>
                        </div>
                        <div className="text-slate-300 text-sm sm:text-base font-semibold">
                          {resA10 ? resA10.eqd2.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">EQD2</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-right font-mono">
                        <div className="text-amber-400 text-lg sm:text-xl font-bold mb-0.5">
                          {resB10 ? resB10.bed.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">Gy₁₀</span>
                        </div>
                        <div className="text-slate-300 text-sm sm:text-base font-semibold">
                          {resB10 ? resB10.eqd2.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">EQD2</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-center font-mono bg-slate-900/40">
                        {resA10 && resB10 ? (
                          <div>
                            <div
                              className={`text-base sm:text-lg font-bold ${
                                eqd2Delta10 > 0.05
                                  ? 'text-emerald-400'
                                  : eqd2Delta10 < -0.05
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {eqd2Delta10 > 0 ? '+' : ''}
                              {eqd2Delta10.toFixed(1)} <span className="text-xs font-sans">Gy EQD2</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Δ BED: {bedDelta10 > 0 ? '+' : ''}
                              {bedDelta10.toFixed(1)} Gy₁₀
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Late Normal Tissue Effect (alpha/beta = 3) */}
                    <tr className="hover:bg-slate-900/40 transition duration-200">
                      <td className="px-5 py-5 sm:px-8 sm:py-6">
                        <div className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                          {lang === 'en' ? 'Late Normal Tissue Toxicity' : 'Geç Normal Doku Toksisitesi (NTCP)'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono font-semibold tracking-wider">
                          α/β = 3 (BED₃ / EQD2₃)
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-right font-mono">
                        <div className="text-sky-400 text-lg sm:text-xl font-bold mb-0.5">
                          {resA3 ? resA3.bed.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">Gy₃</span>
                        </div>
                        <div className="text-slate-300 text-sm sm:text-base font-semibold">
                          {resA3 ? resA3.eqd2.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">EQD2</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-right font-mono">
                        <div className="text-amber-400 text-lg sm:text-xl font-bold mb-0.5">
                          {resB3 ? resB3.bed.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">Gy₃</span>
                        </div>
                        <div className="text-slate-300 text-sm sm:text-base font-semibold">
                          {resB3 ? resB3.eqd2.toFixed(1) : '—'} <span className="text-xs text-slate-500 font-sans">EQD2</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 sm:px-8 sm:py-6 text-center font-mono bg-slate-900/40">
                        {resA3 && resB3 ? (
                          <div>
                            <div
                              className={`text-base sm:text-lg font-bold ${
                                eqd2Delta3 > 0.05
                                  ? 'text-rose-400'
                                  : eqd2Delta3 < -0.05
                                  ? 'text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {eqd2Delta3 > 0 ? '+' : ''}
                              {eqd2Delta3.toFixed(1)} <span className="text-xs font-sans">Gy EQD2</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Δ BED: {bedDelta3 > 0 ? '+' : ''}
                              {bedDelta3.toFixed(1)} Gy₃
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 px-1">
                <span className="font-mono text-[11px]">
                  BED = D × (1 + d / (α/β)) · EQD2 = BED / (1 + 2 / (α/β))
                </span>
                <button
                  type="button"
                  onClick={() => setShowTissuePresets(prev => !prev)}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium text-xs"
                >
                  {showTissuePresets
                    ? (lang === 'en' ? 'Hide tissue α/β presets' : 'Doku α/β referanslarını gizle')
                    : (lang === 'en' ? 'Custom tissue α/β values' : 'Özel doku α/β referanslarını göster')}
                </button>
              </div>

              {/* Optional Expandable Tissue Presets Panel */}
              {showTissuePresets && (
                <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      {lang === 'en' ? 'Organ and Tumor Specific Presets' : 'Organ ve Tümöre Özgü Değerler'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">TCP / NTCP α/β Presets</span>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Baseline Presets' : 'Temel Referanslar'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {presets.filter(preset => baselinePresetIds.has(preset.id)).map(renderTissuePresetPill)}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Specific Tumors' : 'Tümöre Özgü'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {presets.filter(preset => tumorPresetIds.has(preset.id)).map(renderTissuePresetPill)}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Specific OARs / Critical Structures' : 'Özgül OAR / Kritik Yapılar'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {presets.filter(preset => oarPresetIds.has(preset.id)).map(renderTissuePresetPill)}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Treatment Gap / Missed Treatment Compensation Tool */}
            <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#171206]/80 to-[#0c1322] p-5 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-500/20 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'en' ? 'Treatment Gap & Missed Treatment Compensation' : 'Tedavi Arası / Kaçırılan Doz Telafisi'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'en'
                        ? 'Withers accelerated tumor repopulation model (0.6 Gy/day) and dose recovery calculation'
                        : 'Withers akselere tümör repopülasyon modeli (0.6 Gy/gün) ve seans telafi dozu hesabı'}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-amber-300">
                  WITHERS KİNETİĞİ · T_LAG ≈ 21-28 GÜN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'en' ? 'Missed Days / Gaps (k)' : 'Kaçırılan Gün / Seans (k)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={gapMissedDays}
                    onChange={e => setGapMissedDays(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 font-mono transition"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3, 5].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setGapMissedDays(days)}
                        className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition"
                      >
                        +{days} {lang === 'en' ? 'd' : 'gün'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGapMissedDays(0)}
                      className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-white transition"
                    >
                      {lang === 'en' ? 'Reset' : 'Sıfırla'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'en' ? 'Remaining Fractions (n_rem)' : 'Kalan Fraksiyon Sayısı (n_kalan)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    value={gapRemainingFractions}
                    onChange={e => setGapRemainingFractions(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 font-mono transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">
                    {lang === 'en' ? 'Remaining scheduled fractions to distribute dose' : 'Doz telafisinin dağıtılacağı seanslar'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'en' ? 'Daily Loss Rate (Gy/day)' : 'Günlük Doz Kaybı Oranı (Gy/gün)'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={gapDailyLoss}
                    onChange={e => setGapDailyLoss(Math.max(0.1, Number(e.target.value) || 0.6))}
                    className="w-full rounded-xl border border-slate-700 bg-[#060b14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 font-mono transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">
                    {lang === 'en' ? 'Standard Withers rate = 0.6 Gy/day' : 'Standart Withers oranı = 0.6 Gy/gün'}
                  </p>
                </div>
              </div>

              {/* Calculated Gap Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {lang === 'en' ? 'Biologic Dose Deficit (ΔD)' : 'Hesaplanan Doz Kaybı (ΔD)'}
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-amber-200">
                    {gapDoseDeficit.toFixed(2)} <span className="text-xs font-sans font-normal text-amber-400/80">Gy</span>
                  </div>
                  <div className="text-[10px] text-amber-300/70 mt-1 font-mono">
                    {gapMissedDays} {lang === 'en' ? 'days' : 'gün'} × {gapDailyLoss.toFixed(2)} Gy/gün
                  </div>
                </div>

                <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    {lang === 'en' ? 'Extra Dose Per Remaining Fx (Δd)' : 'Kalan Fx Başına İlave Doz (Δd)'}
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-sky-200">
                    +{gapExtraDosePerFx.toFixed(2)} <span className="text-xs font-sans font-normal text-sky-400/80">Gy/fx</span>
                  </div>
                  <div className="text-[10px] text-sky-300/70 mt-1 font-mono">
                    ΔD / {gapRemainingFractions} fx
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {lang === 'en' ? 'Compensated Fraction Dose' : 'Düzeltilmiş Yeni Fraksiyon Dozu'}
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-200">
                    {gapCompensatedDosePerFx.toFixed(2)} <span className="text-xs font-sans font-normal text-emerald-400/80">Gy/fx</span>
                  </div>
                  <div className="text-[10px] text-emerald-300/70 mt-1 font-mono">
                    {plannedDosePerFx.toFixed(2)} + {gapExtraDosePerFx.toFixed(2)} Gy
                  </div>
                </div>
              </div>

              {/* Clinical Advisory */}
              <div className="mt-4 rounded-xl border border-slate-700/80 bg-[#060b14] p-3 text-xs leading-relaxed text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">
                    {lang === 'en' ? 'Clinical Advisory & Strategies:' : 'Klinik Öneri & Stratejiler:'}
                  </strong>{' '}
                  {lang === 'en'
                    ? 'Unscheduled treatment gaps in rapidly proliferating mucosal squamous tumors lead to accelerated clonogen repopulation (requiring ~0.6 Gy/day prolongation compensation). Alternative strategies include twice-daily treatments (BID, ≥6h separation to preserve late normal-tissue repair) or weekend treatments. Any modification must respect critical late-tissue OAR limits.'
                    : 'Hızlı prolifere olan mukozal skuamöz karsinomlarda plansız tedavi araları akselere repopülasyona neden olur (uzayan her gün için ~0.6 Gy telafi gerekir). Alternatif telafi stratejileri: hafta sonu tedavisi eklenmesi veya günde iki seans (BID, geç normal doku onarımı için seanslar arası ≥6 saat ara ile). Herhangi bir doz artışında seri kritik organ (omurilik vb.) kısıtları mutlaka yeniden doğrulanmalıdır.'}
                </div>
              </div>
            </section>

            {/* 3. Reverse Target EQD2 Solver */}
            <section className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 sm:p-7 shadow-xl">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-sky-400" />
                    {lang === 'en' ? 'Reverse Target EQD2 Solver' : 'Hedef Dozdan Rejim Türetici (Ters Çözücü)'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Derive dose per fraction, total dose, and BED for standard fraction counts (1–35 fx).'
                      : 'Standart fraksiyon sayıları için gereken seans dozunu, toplam dozu ve BED değerini hesaplayın.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="block w-full sm:w-44 text-xs font-medium text-slate-300">
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
                      className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060b14] px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label className="block w-28 text-xs font-medium text-slate-300">
                    α/β (Gy)
                    <input
                      type="number"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={alphaBetaTumor}
                      onChange={e => {
                        const raw = e.currentTarget.value;
                        if (raw === '') setAlphaBetaTumor('');
                        else {
                          const val = Number.parseFloat(raw);
                          if (Number.isFinite(val) && val > 0) setAlphaBetaTumor(val);
                        }
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060b14] px-3 py-2 text-sm text-white font-mono outline-none focus:border-cyan-400"
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto w-full rounded-xl border border-slate-800 bg-[#060b14]">
                <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                  <thead className="bg-[#0b1324] text-slate-300 border-b border-slate-800">
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
                          className="whitespace-nowrap px-4 py-3 font-semibold"
                        >
                          <button
                            type="button"
                            onClick={() => sortReverseRegimens(column.key)}
                            className="inline-flex items-center gap-1.5 hover:text-white"
                          >
                            {column.label}
                            <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          </button>
                        </th>
                      ))}
                      <th scope="col" className="px-4 py-3 font-semibold text-right">
                        {lang === 'en' ? 'Action' : 'İşlem'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sortedReverseRegimens.length ? (
                      sortedReverseRegimens.map(row => (
                        <tr key={row.fractions} className="hover:bg-slate-900/50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-white">{row.fractions}</td>
                          <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">{row.dosePerFraction.toFixed(2)} Gy</td>
                          <td className="px-4 py-3 font-mono text-slate-200">{row.totalDose.toFixed(2)} Gy</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{row.bed.toFixed(2)} Gy</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                row.technique === 'sbrt-srs'
                                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                  : row.technique === 'moderate'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {techniqueLabel(row.technique, lang)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => applyReverseRegimen(row)}
                              className="whitespace-nowrap rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/20"
                            >
                              {lang === 'en' ? 'Use as Regimen B' : 'Alternatif Şema Olarak Kullan'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
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
          </div>
        ) : (
          /* Atlas Tab */
          <div className="space-y-6">
            <header className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">
                {lang === 'en' ? 'Curative & Normal Tissue Dose Benchmark Atlas' : 'Terapötik Doz & OAR Eşik Rehberi'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {lang === 'en'
                  ? 'Tumor targets are minimum floor doses for local control (≥); OAR constraints are maximum tolerance ceilings (≤).'
                  : 'Tümör hedefleri lokal kontrol için gereken asgari doz tabanlarını (≥), OAR kısıtları ise aşılmaması gereken azami tolerans tavanlarını (≤) gösterir.'}
              </p>
              <div
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
                role="tablist"
                aria-label="Atlas tabs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlasView === 'tumor'}
                  onClick={() => setAtlasView('tumor')}
                  className={`rounded-xl border px-4 py-3 text-left text-xs font-bold transition ${
                    atlasView === 'tumor'
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-[#060b14] text-slate-400 hover:text-white'
                  }`}
                >
                  🎯 {lang === 'en' ? 'Tumor Target Doses (TCP Floor)' : 'Tümör Hedef Dozları (TCP Tabanı)'}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlasView === 'oar'}
                  onClick={() => setAtlasView('oar')}
                  className={`rounded-xl border px-4 py-3 text-left text-xs font-bold transition ${
                    atlasView === 'oar'
                      ? 'border-rose-500/50 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/40'
                      : 'border-slate-800 bg-[#060b14] text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ {lang === 'en' ? 'Critical Organ Constraints (NTCP Ceilings)' : 'Kritik Organ Kısıtları (NTCP Tavanı)'}
                </button>
              </div>
            </header>

            {atlasView === 'tumor' ? (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 sm:p-6">
                <header className="mb-5">
                  <h3 className="text-sm font-bold text-emerald-300">
                    🎯 TÜMÖR HEDEF DOZLARI / CURATIVE TARGET BENCHMARKS
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    {lang === 'en'
                      ? 'Minimum floor dose benchmarks for curative intent and local control (≥). Select a benchmark to load its EQD2 target into the Reverse Solver.'
                      : 'Küratif amaç ve lokal kontrol için gereken asgari doz eşikleri (≥). EQD2 hedefini ters çözücüye aktarmak için bir eşik seçin.'}
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {tumorTargetAtlas.map(item => (
                    <article key={item.id} className="flex flex-col rounded-xl border border-emerald-500/20 bg-[#0c1322] p-4">
                      <h4 className="text-sm font-semibold text-white">{lang === 'en' ? item.title_en : item.title_tr}</h4>
                      <p className="mt-2 flex-1 text-xs leading-5 text-emerald-100/80">
                        {lang === 'en' ? item.benchmark_en : item.benchmark_tr}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-medium text-slate-400">
                          {lang === 'en' ? 'Reference: ' : 'Referans: '}
                          {item.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAlphaBetaTumor(item.alphaBeta);
                            setTargetEqd2(item.targetEqd2);
                            setActiveTab('calculator');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-500/20"
                        >
                          {lang === 'en' ? 'Load to Solver' : 'Çözücüye Aktar'}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 sm:p-6">
                <header className="mb-5">
                  <h3 className="text-sm font-bold text-rose-300">
                    🛡️ KRİTİK ORGAN TOLERANS SINIRLARI / OAR SAFETY CONSTRAINTS
                  </h3>
                  <p className="mt-1 text-xs text-rose-100/70">
                    {lang === 'en'
                      ? 'Maximum ceiling doses that should not be exceeded to reduce normal-tissue toxicity risk (≤).'
                      : 'Normal doku toksisite riskini azaltmak için aşılmaması gereken azami doz tavanları (≤).'}
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {oarThresholds.map(item => (
                    <article key={item.id} className="rounded-xl border border-rose-500/20 bg-[#0c1322] p-4">
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

        {/* Global Footer & Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0c1322] p-4 text-xs leading-5 text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p>
            {lang === 'en'
              ? 'Educational & clinical decision support aid. LQ equivalent models do not independently model clinical tissue recovery kinetics or chemotherapy radiosensitization. Reconcile all fractions with the treating radiation oncologist and medical physicist.'
              : 'Eğitim ve klinik karar destek aracıdır. Lineer-kuadratik biyolojik eşdeğerlik modelleri eşzamanlı kemoterapi duyarlılığını veya hastaya özgü repopülasyonu tek başına modelleyemez. Her fraksiyonasyon değişikliğini sorumlu radyasyon onkoloğu ve medikal fizik uzmanı ile doğrulayın.'}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs">
          <Link href="/doz-kisitlari" className="text-cyan-400 hover:text-cyan-300 font-medium">
            {lang === 'en' ? '← View OAR Dose Constraints' : '← OAR Doz Kısıtlarına Git'}
          </Link>
          <Link href="/academy" className="text-cyan-400 hover:text-cyan-300 font-medium">
            {lang === 'en' ? 'Go to RadOnco Academy →' : 'RadOnco Akademiye Git →'}
          </Link>
        </div>
      </div>
    </main>
  );
}
