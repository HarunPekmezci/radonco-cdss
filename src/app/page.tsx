'use client';

import {
  Activity, ArrowRight, Baby, Brain, Bone, Check, Clipboard, ClipboardCheck, Download, Droplet, Droplets, ExternalLink,
  HandHeart, Heart, Moon, Radiation, Search, Shield, ShieldCheck, Sparkles, Sun, Target, User, UtensilsCrossed, Wind, Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import type { AlternativeDoseScheme, CDSSResult, Fractionation, GuidelineReference, OrganSystem, OARConstraint, TargetVolume } from '../types/cdss';
import { ENGINE_REGISTRY, getEnginesByOrgan, type CDSSFormField, type RegisteredEngine } from '../engines/registry';

type Icon = typeof Activity;
const ORGAN_OPTIONS: Array<{ id: OrganSystem; label: string; icon: Icon }> = [
  { id: 'thorax', label: 'Toraks', icon: Wind },
  { id: 'gis', label: 'GİS', icon: UtensilsCrossed },
  { id: 'gus', label: 'GÜS', icon: Droplet },
  { id: 'breast', label: 'Meme', icon: Heart },
  { id: 'head-neck', label: 'Baş-Boyun', icon: User },
  { id: 'cns', label: 'MSS', icon: Brain },
  { id: 'gynecology', label: 'Jinekoloji', icon: Sparkles },
  { id: 'bone', label: 'Kemik', icon: Bone },
  { id: 'skin', label: 'Cilt', icon: Shield },
  { id: 'hematologic', label: 'Hematolojik', icon: Droplets },
  { id: 'pediatric-age', label: 'Pediatrik', icon: Baby },
  { id: 'palliative', label: 'Palyatif', icon: HandHeart },
];

const STATUS: Record<CDSSResult['rtIndication'], { label: string; className: string }> = {
  indicated: { label: 'RT ENDİKE', className: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300' },
  consider: { label: 'DÜŞÜNÜLEBİLİR', className: 'border-amber-400/40 bg-amber-400/15 text-amber-300' },
  conditional: { label: 'KOŞULLU', className: 'border-amber-400/40 bg-amber-400/15 text-amber-300' },
  'not-indicated': { label: 'RT ENDİKE DEĞİL', className: 'border-slate-400/30 bg-slate-400/10 text-slate-300' },
  contraindicated: { label: 'KONTRENDİKE', className: 'border-rose-400/40 bg-rose-400/15 text-rose-300' },
};
const INTENT_LABEL: Record<CDSSResult['intent'], string> = {
  curative: 'Küratif', adjuvant: 'Adjuvan', neoadjuvant: 'Neoadjuvan', definitive: 'Definitif',
  palliative: 'Palyatif', prophylactic: 'Profilaktik', salvage: 'Salvage', observation: 'İzlem',
};

const dose = (result: CDSSResult): Fractionation | undefined => result.recommendations.find((item) => item.fractionation)?.fractionation;
const gy = (value: number | undefined): string => value === undefined ? '—' : `${value.toFixed(1)} Gy`;
const asInput = (value: string, field: CDSSFormField): string | number | boolean => {
  if (field.type === 'number') return value === '' ? 0 : Number(value);
  if (field.type === 'boolean') return value === 'true';
  return value;
};

function getNote(result: CDSSResult, regimen?: AlternativeDoseScheme): string {
  const fractionation = regimen?.fractionation ?? dose(result);
  const recommendation = result.recommendations[0];
  return [
    'RADYASYON ONKOLOJİSİ KLİNİK KARAR VE DOZİMETRİ KONSÜLTASYON NOTU',
    `Motor: ${result.engineId} v${result.engineVersion}`,
    `RT kararı: ${STATUS[result.rtIndication].label} | Niyet: ${INTENT_LABEL[result.intent]}`,
    `Özet: ${result.summary}`,
    `Şema: ${regimen?.label ?? 'Motor önerisi'} — ${fractionation ? `${fractionation.totalDoseGy} Gy / ${fractionation.fractions} fx (${fractionation.dosePerFractionGy} Gy/fx), BED ${gy(fractionation.bedGy)}, EQD2${gy(fractionation.eqd2Gy)}` : 'Önerilen RT şeması yok.'}`,
    `Hedef hacimler: ${regimen?.targetDescription ?? ((recommendation?.targetVolumes ?? []).map((target) => `${target.name} (${target.margin ?? 'marjin belirtilmedi'})`).join('; ') || 'Belirtilmedi.')}`,
    `OAR: ${(regimen?.oarProfile ?? recommendation?.oarConstraints ?? []).map((constraint) => `${constraint.organ}${constraint.metric} ${constraint.limit}${constraint.unit}`).join('; ') || 'Belirtilmedi.'}`,
    `Şema kanıtı: ${regimen?.evidence.map((reference) => `${reference.organization} — ${reference.title}:${reference.url}`).join('; ') || 'Motor önerisi.'}`,
    `Klinik gerekçe: ${result.rationale.join(' ')}`,
    `Uyarılar: ${result.warnings?.join(' ') || 'Yok.'}`,
    `Kılavuzlar: ${result.guidelineReferences.map((reference) => `${reference.organization} — ${reference.title}:${reference.url}`).join('\n')}`,
    'Not: Karar destek çıktısıdır; güncel lisanslı kılavuz, planlama görüntüleri, kümülatif doz ve MDT onayı ile doğrulanmalıdır.',
  ].join('\n');
}

function exportDataset(result: CDSSResult, input: Record<string, unknown>, format: 'json' | 'csv', regimen?: AlternativeDoseScheme): string {
  const fractionation = regimen?.fractionation ?? dose(result);
  const row = { exportedAt: new Date().toISOString(), engineId: result.engineId, input, rtIndication: result.rtIndication, intent: result.intent, summary: result.summary, regimenId: regimen?.id ?? null, regimenLabel: regimen?.label ?? null, targetDescription: regimen?.targetDescription ?? null, totalDoseGy: fractionation?.totalDoseGy ?? null, fractions: fractionation?.fractions ?? null, dosePerFractionGy: fractionation?.dosePerFractionGy ?? null, bedGy: fractionation?.bedGy ?? null, eqd2Gy: fractionation?.eqd2Gy ?? null, oarProfile: regimen?.oarProfile ?? null };
  if (format === 'json') return JSON.stringify(row, null, 2);
  return `${Object.keys(row).join(',')}\n${Object.values(row).map((value) => JSON.stringify(typeof value === 'object' ? JSON.stringify(value) : value ?? '')).join(',')}`;
}

function ResultPanel({ result, input }: { result: CDSSResult; input: Record<string, unknown> }): JSX.Element {
  const recommendation = result.recommendations[0];
  const status = STATUS[result.rtIndication];
  const [tab, setTab] = useState<'decision' | 'target' | 'oar' | 'evidence'>('decision');
  const [copied, setCopied] = useState(false);
  const schemes = result.alternativeDoseSchemes?.schemes ?? [];
  const [selectedRegimenId, setSelectedRegimenId] = useState(result.alternativeDoseSchemes?.defaultSchemeId ?? schemes[0]?.id ?? '');
  useEffect(() => {
    setSelectedRegimenId(result.alternativeDoseSchemes?.defaultSchemeId ?? schemes[0]?.id ?? '');
  }, [result.engineId, result.summary, result.alternativeDoseSchemes?.defaultSchemeId, schemes.length]);
  const selectedRegimen = schemes.find((scheme) => scheme.id === selectedRegimenId) ?? schemes[0];
  const fractionation = selectedRegimen?.fractionation ?? dose(result);
  const download = (format: 'json' | 'csv') => {
    const blob = new Blob([exportDataset(result, input, format, selectedRegimen)], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `radonco-arastirma-verisi.${format}`; anchor.click(); URL.revokeObjectURL(url);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(getNote(result, selectedRegimen));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const targets: TargetVolume[] = selectedRegimen
    ? [{ name: 'PTV', description: selectedRegimen.targetDescription }]
    : recommendation?.targetVolumes ?? [];
  const oars: OARConstraint[] = selectedRegimen?.oarProfile ?? recommendation?.oarConstraints ?? [];
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-indigo-950/20 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Klinik karar motoru</p><h2 className="mt-1 text-2xl font-semibold">{result.summary}</h2><p className="mt-2 leading-6 text-slate-400">{result.rationale[0] ?? 'Değerlendirme gerekçesi yok.'}</p></div>
          <span className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold tracking-wide ${status.className}`}>{status.label}</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-indigo-500/10 p-3"><span className="block text-[11px] uppercase text-slate-500">Niyet</span><strong className="mt-1 block text-sm text-indigo-200">{INTENT_LABEL[result.intent]}</strong></div>
          <div className="rounded-2xl bg-white/5 p-3"><span className="block text-[11px] uppercase text-slate-500">Güven</span><strong className="mt-1 block text-sm text-emerald-300">%{Math.round((result.confidence ?? 0) * 100)}</strong></div>
          <div className="rounded-2xl bg-white/5 p-3"><span className="block text-[11px] uppercase text-slate-500">Öneri</span><strong className="mt-1 block text-sm text-slate-200">{result.recommendations.length}</strong></div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Target size={18} className="text-indigo-300" /> Dozimetri özeti</h3>
          {schemes.length ? <div className="mb-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Alternatif radyoterapi rejimleri</p><div className="flex gap-2 overflow-x-auto pb-1">{schemes.map((scheme) => <button key={scheme.id} type="button" onClick={() => setSelectedRegimenId(scheme.id)} className={`min-w-max rounded-xl border px-3 py-2 text-left text-xs transition ${selectedRegimen?.id === scheme.id ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100 shadow-lg shadow-emerald-950/30' : 'border-white/10 bg-[#0b1a2d] text-slate-300 hover:border-indigo-300/50'}`}><strong className="block">{scheme.label}</strong><span className="mt-1 block text-[10px] text-slate-500">{scheme.fractionation.totalDoseGy} Gy · {scheme.fractionation.fractions} fx</span></button>)}</div></div> : null}
          {fractionation ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Toplam', `${fractionation.totalDoseGy} Gy`], ['Doz/fx', `${fractionation.dosePerFractionGy} Gy`], ['Fx', String(fractionation.fractions)], [`BED${fractionation.alphaBetaTumor ?? 10}`, gy(fractionation.bedGy)], ['EQD2', gy(fractionation.eqd2Gy)], ['Teknik', fractionation.technique ?? '—']].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#0b1a2d] p-3"><span className="block text-xs text-slate-500">{label}</span><strong className="mt-2 block text-lg text-slate-100">{value}</strong></div>)}</div> : <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-500">Bu karar dalında doz şeması önerilmedi.</p>}
          {selectedRegimen ? <p className="mt-3 text-xs leading-5 text-slate-400"><strong className="text-indigo-200">{selectedRegimen.label}</strong> · {selectedRegimen.targetDescription}</p> : null}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><h3 className="mb-4 font-semibold">Klinik uyarılar</h3>{result.warnings?.length ? <ul className="space-y-2 text-sm text-amber-200">{result.warnings.map((warning) => <li key={warning} className="rounded-xl bg-amber-400/10 p-3">⚠ {warning}</li>)}</ul> : <p className="flex items-center gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200"><ShieldCheck size={16} /> Kritik uyarı yok.</p>}</div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-2">
        <div className="flex flex-wrap gap-1 border-b border-white/10 p-1">{[['decision', 'Karar'], ['target', 'GTV/CTV/PTV'], ['oar', 'OAR kısıtları'], ['evidence', 'Kanıt & linkler']].map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key as typeof tab)} className={`rounded-xl px-3 py-2 text-sm ${tab === key ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-500 hover:text-slate-200'}`}>{label}</button>)}</div>
        <div className="p-4 sm:p-5">
          {tab === 'decision' && <div className="space-y-3">{result.recommendations.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-medium">{item.label}</h3><span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">{INTENT_LABEL[item.intent]}</span></div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">{item.rationale.map((reason) => <li key={reason}>• {reason}</li>)}</ul>{item.systemicTherapy?.length ? <p className="mt-3 border-t border-white/10 pt-3 text-sm text-indigo-200"><strong>Sistemik:</strong> {item.systemicTherapy.map((therapy) => therapy.regimen).join(' · ')}</p> : null}</article>)}</div>}
          {tab === 'target' && <div className="grid gap-3 md:grid-cols-3">{targets.map((target) => <div key={target.name} className="rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-4"><strong className="text-indigo-200">{target.name}</strong><p className="mt-2 text-sm leading-6 text-slate-300">{target.description ?? 'Tanım motor çıktısında belirtilmedi.'}</p><p className="mt-2 text-xs text-slate-500">Marjin: {target.margin ?? '—'}</p></div>)}</div>}
          {tab === 'oar' && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Organ</th><th className="p-3">Metrik</th><th className="p-3">Limit</th><th className="p-3">Kaynak</th></tr></thead><tbody>{oars.map((oar) => <tr key={`${oar.organ}-${oar.metric}`} className="border-t border-white/10"><td className="p-3 text-slate-200">{oar.organ}</td><td className="p-3 text-slate-300">{oar.metric}</td><td className="p-3 text-emerald-200">{oar.limit} {oar.unit}</td><td className="p-3 text-slate-500">{oar.source}</td></tr>)}</tbody></table>{!oars.length && <p className="p-5 text-sm text-slate-500">Bu öneride OAR kısıtı bulunmuyor.</p>}</div>}
          {tab === 'evidence' && <div className="grid gap-3 md:grid-cols-2">{(selectedRegimen?.evidence ?? result.guidelineReferences).map((reference: GuidelineReference) => <a key={`${reference.organization}-${reference.title}`} href={reference.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-black/10 p-4 hover:border-indigo-300/40"><div className="flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-indigo-300">{reference.organization}</span><ExternalLink size={15} className="text-slate-500 group-hover:text-indigo-200" /></div><p className="mt-2 text-sm text-slate-200">{reference.title}</p><p className="mt-2 text-xs text-slate-500">Kanıt: {reference.evidenceLevel ?? '—'}</p></a>)}</div>}
        </div>
      </section>
      <div className="flex flex-col gap-3 rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-wider text-indigo-300">HBYS / Epikriz</p><h3 className="mt-1 font-semibold">Konsültasyon notunu kopyala</h3></div><button type="button" onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-400">{copied ? <ClipboardCheck size={17} /> : <Clipboard size={17} />}{copied ? 'Kopyalandı' : 'Konsültasyon Notunu Kopyala'}</button></div>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-wider text-slate-500">Araştırma veri seti</p><h3 className="mt-1 font-semibold">Girdi ve hesaplanan doz verisini dışa aktar</h3></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => download('json')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"><Download size={15} /> JSON indir</button><button type="button" onClick={() => download('csv')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"><Download size={15} /> CSV indir</button><button type="button" onClick={() => navigator.clipboard.writeText(exportDataset(result, input, 'json', selectedRegimen))} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"><Clipboard size={15} /> JSON kopyala</button></div></div>
    </div>
  );
}

export default function CDSSDashboard(): JSX.Element {
  const initialOrgan: OrganSystem = 'thorax';
  const engineList = useMemo(() => Object.values(ENGINE_REGISTRY), []);

  const initialEngine = getEnginesByOrgan(initialOrgan)[0] ?? engineList[0];

  const [organ, setOrgan] = useState<OrganSystem>(initialOrgan);
  const [engineId, setEngineId] = useState<string>(initialEngine?.id ?? '');

  const engine = useMemo<RegisteredEngine | undefined>(
    () => {
      const organEngines = getEnginesByOrgan(organ);
      return organEngines.find((item) => item.id === engineId) ?? organEngines[0];
    },
    [engineId, organ]
  );

  const [input, setInput] = useState<Record<string, unknown>>(() => ({
    organSystem: initialOrgan,
    disease: initialEngine?.disease ?? '',
    ...(initialEngine?.defaults ?? {}),
  }));

  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState('');
  const [showTnm, setShowTnm] = useState(false);

  const engines = useMemo(
    () => getEnginesByOrgan(organ).filter((item) => 
      (item?.name || '').toLocaleLowerCase('tr-TR').includes((search || '').toLocaleLowerCase('tr-TR'))
    ),
    [organ, search]
  );

  const evaluation = useMemo(() => {
    try {
      if (!engine) return { result: null, error: null };
      
      if (typeof engine.evaluate !== 'function') {
        return { 
          result: null, 
          error: `Seçili motor eksik tanımlanmış. 'evaluate' fonksiyonu bulunamadı. Lütfen registry.ts dosyasını kontrol edin.` 
        };
      }

      return { result: engine.evaluate(input), error: null };
    } catch (evaluationError) {
      return { result: null, error: evaluationError instanceof Error ? evaluationError.message : 'Motor değerlendirmesi başarısız.' };
    }
  }, [engine, input]);

  const result = evaluation.result;
  const error = evaluation.error;

  const selectOrgan = (nextOrgan: OrganSystem) => {
    const organEngines = getEnginesByOrgan(nextOrgan);
    const firstEngine = organEngines[0];

    setOrgan(nextOrgan);
    if (firstEngine) {
      setEngineId(firstEngine.id);
      setInput({
        organSystem: nextOrgan,
        disease: firstEngine.disease,
        ...firstEngine.defaults,
      });
    } else {
      setEngineId('');
      setInput({ organSystem: nextOrgan, disease: '' });
    }
  };

  const selectEngine = (next: RegisteredEngine) => {
    setEngineId(next.id);
    setInput({
      organSystem: organ,
      disease: next.disease,
      ...next.defaults,
    });
  };

  const update = (field: CDSSFormField, raw: string) => setInput((current) => ({ ...current, [field.key]: asInput(raw, field) }));

  const renderField = (field: CDSSFormField): JSX.Element => {
    if (engine?.id === 'gus.prostate' && (field.key === 'gleasonPrimary' || field.key === 'gleasonSecondary')) {
      return (
        <label key={field.key} className="block text-xs text-slate-400">
          {field.key === 'gleasonSecondary' ? '+ Sekonder Gleason paterni' : field.label}
          <input
            type="number"
            min={1}
            max={5}
            value={String(input[field.key] ?? '')}
            onChange={(event) => update(field, event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"
          />
        </label>
      );
    }
    if (engine?.id === 'breast.primary' && ['erPercent', 'prPercent', 'her2Status'].includes(field.key)) {
      const active = field.key === 'her2Status' ? input.her2Status === 'positive' : Number(input[field.key] ?? 0) > 0;
      return (
        <button key={field.key} type="button" onClick={() => setInput((current) => ({ ...current, [field.key]: field.key === 'her2Status' ? (active ? 'negative' : 'positive') : active ? 0 : 100 }))} className={`rounded-xl border px-3 py-2 text-left text-xs transition ${active ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100' : 'border-white/10 bg-[#0b1a2d] text-slate-400 hover:border-indigo-300/50'}`}>
          {active ? '✓' : '○'} {field.label}
        </button>
      );
    }
    return (
      <label key={field.key} className="block text-xs text-slate-400">
        {field.label}
        {field.description ? <span className="ml-1 text-slate-600">({field.description})</span> : null}
        {field.type === 'boolean' ? (
          <span className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5">
            <input type="checkbox" checked={Boolean(input[field.key])} onChange={(event) => update(field, String(event.target.checked))} className="accent-indigo-500" />
            <span>{input[field.key] ? 'Var' : 'Yok'}</span>
          </span>
        ) : field.type === 'select' ? (
          <select value={String(input[field.key] ?? '')} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400">
            <option value="">Seçiniz</option>
            {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : (
          <input type={field.type} value={String(input[field.key] ?? '')} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400" />
        )}
      </label>
    );
  };

  const visibleFields = engine?.formSchema ? engine.formSchema.filter((field) => !['stageGroup', 'clinicalT', 'nodalStatus', 'metastaticStatus', 'pathologicT', 'pathologicN'].includes(field.key)) : [];

  return (
    <main className={dark ? 'min-h-screen bg-[#07111f] text-slate-100' : 'min-h-screen bg-slate-50 text-slate-900'}>
      <div className="w-full px-4 py-4 lg:px-6">
        <header className="mb-5 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300"><Radiation size={28} /></div>
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">Radyasyon Onkolojisi Klinik Asistan</h1>
              <p className="mt-1 text-xs text-slate-400">Klinik karar · dozimetri · multidisipliner çalışma alanı</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-slate-300">
              <Search size={15} />
              <input aria-label="Hastalık ara" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Hastalık ara..." className="w-28 bg-transparent outline-none placeholder:text-slate-500 sm:w-40" />
            </label>
            <button type="button" onClick={() => setDark((value) => !value)} className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10" aria-label="Tema değiştir">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <section className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045] p-2">
          <div className="flex min-w-max gap-2">
            {ORGAN_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => selectOrgan(id)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${organ === id ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid w-full gap-6 lg:grid-cols-12">
          <aside className="space-y-5 lg:col-span-3">
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <h3 className="mb-3 font-semibold text-slate-200">Karar Motorları ({engines.length})</h3>
              <div className="space-y-1.5">
                {engines.map((item) => (
                  <button key={item?.id || Math.random().toString()} type="button" onClick={() => selectEngine(item)} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${item?.id === engine?.id ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                    {item?.name || `İsimsiz Motor (${item?.id || 'Bilinmeyen ID'})`}
                  </button>
                ))}
              </div>
            </section>

            {visibleFields.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <h3 className="mb-3 font-semibold text-slate-200">Klinik Parametreler</h3>
                <div className="space-y-3">
                  {visibleFields.map(renderField)}
                </div>
              </section>
            )}
          </aside>

          <main className="space-y-5 lg:col-span-9">
            {!engine ? (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
                <h3 className="font-semibold text-lg">Bu Kategori İçin Motor Bulunamadı</h3>
                <p className="mt-1 text-sm text-amber-300/80">
                  Seçilen organ sistemi için henüz kayıtlı bir karar motoru bulunmuyor.
                </p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200">
                <h3 className="font-semibold">Motor Değerlendirme Hatası</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : result ? (
              <ResultPanel result={result} input={input} />
            ) : null}
          </main>
        </div>
      </div>
    </main>
  );
}