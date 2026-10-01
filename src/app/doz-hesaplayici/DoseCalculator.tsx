'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Calculator, Info, RotateCcw } from 'lucide-react';

type Schedule = {
  totalDose: number;
  fractions: number;
};

const presets = [
  { label: 'Akut doku / tümör', value: 10 },
  { label: 'Geç doku / OAR', value: 3 },
  { label: 'MSS / kord', value: 2 },
  { label: 'Prostat', value: 1.5 },
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
  const [alphaBeta, setAlphaBeta] = useState(10);
  const [reference, setReference] = useState(initialReference);
  const [alternative, setAlternative] = useState(initialAlternative);

  const referenceResult = useMemo(() => calculate(reference, alphaBeta), [alphaBeta, reference]);
  const alternativeResult = useMemo(() => calculate(alternative, alphaBeta), [alphaBeta, alternative]);
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

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Linear-quadratic radiobiology
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">BED / EQD2 Dose Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Compare fractionation schedules using the linear-quadratic model.</p>
        </header>

        {initialOarContext && (
          <aside className="mb-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 text-sm" aria-label="Selected OAR constraint">
            <div className="font-semibold text-cyan-100">OAR constraint context received</div>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {initialOarContext.organ} · {initialOarContext.metric}: <strong>{initialOarContext.limit}</strong> · {initialOarContext.fractionation}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">This reference value is contextual information only. LQ calculations below use the entered prescription dose.</p>
          </aside>
        )}

        <section className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-white">Tissue α/β preset</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map(preset => (
              <button
                key={preset.value}
                type="button"
                aria-pressed={alphaBeta === preset.value}
                onClick={() => setAlphaBeta(preset.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${alphaBeta === preset.value ? 'border-violet-400/70 bg-violet-400/10 text-violet-100' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
              >
                {preset.label} <span className="ml-1 text-slate-500">α/β {preset.value}</span>
              </button>
            ))}
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
            Custom α/β (Gy)
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={alphaBeta}
              onChange={event => {
                const next = Number(event.target.value);
                if (Number.isFinite(next) && next > 0) setAlphaBeta(next);
              }}
              className="w-24 rounded-lg border border-slate-700 bg-[#0a0f1d] px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-400"
            />
          </label>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {([
            { id: 'reference' as const, title: 'Reference schedule', schedule: reference, result: referenceResult, setter: setReference },
            { id: 'alternative' as const, title: 'Alternative / hypofractionated schedule', schedule: alternative, result: alternativeResult, setter: setAlternative },
          ]).map(card => (
            <section key={card.id} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">{card.title}</h2>
                <button
                  type="button"
                  onClick={() => card.setter(card.id === 'reference' ? initialReference : initialAlternative)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumberField label="Total dose D (Gy)" value={card.schedule.totalDose} min={0} max={200} step={0.1} onChange={value => updateSchedule(card.id, 'totalDose', value)} />
                <NumberField label="Number of fractions n" value={card.schedule.fractions} min={1} max={100} step={1} onChange={value => updateSchedule(card.id, 'fractions', value)} />
              </div>
              <div className="mt-3 rounded-lg border border-slate-800 bg-[#0a0f1d] p-3 text-xs text-slate-400">
                Dose per fraction d: <strong className="text-white">{card.result?.dosePerFraction.toFixed(2) ?? '—'} Gy</strong>
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
              ) : <p role="alert" className="mt-3 text-xs text-rose-300">Enter a positive total dose and an integer fraction count.</p>}
            </section>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ArrowLeftRight className="h-4 w-4 text-violet-300" aria-hidden="true" />
            Schedule comparison
          </div>
          {bedDelta !== null && eqd2Delta !== null ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Delta label={`Δ BED${alphaBeta}`} value={bedDelta} />
              <Delta label={`Δ EQD2${alphaBeta}`} value={eqd2Delta} />
            </div>
          ) : (
            <p role="alert" className="mt-3 text-xs text-rose-300">Enter a positive dose and an integer number of fractions for both schedules.</p>
          )}
          <p className="mt-4 rounded-lg bg-slate-900/70 p-3 text-[11px] leading-5 text-slate-400">
            BED = n × d × (1 + d / α/β); EQD2 = BED / (1 + 2 / α/β). Model estimates do not account for repopulation, repair kinetics, treatment time, concurrent systemic therapy, or patient-specific biology.
          </p>
        </section>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/70">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Educational calculation aid only. Verify prescription, α/β assumptions and clinical interpretation with the treating radiation oncologist and medical physicist.</p>
        </div>
        <Link href="/doz-kisitlari" className="mt-4 inline-flex text-xs font-medium text-sky-300 hover:text-sky-200">← Return to OAR constraints</Link>
      </div>
    </main>
  );
}

function Delta({ label, value }: { label: string; value: number }) {
  const sign = value > 0 ? '+' : '';
  const color = value > 0 ? 'text-amber-200' : value < 0 ? 'text-emerald-200' : 'text-slate-200';
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label} · alternative − reference</div>
      <div className={`mt-1 text-lg font-bold ${color}`}>{sign}{value.toFixed(2)} Gy</div>
    </div>
  );
}
