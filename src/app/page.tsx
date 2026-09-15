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
    `Şema: ${regimen?.label ?? 'Motor önerisi'} — ${fractionation ? `${fractionation.totalDoseGy} Gy / ${fractionation.fractions} fx (${fractionation.dosePerFractionGy} Gy/fx), BED ${gy(fractionation.bedGy)}, EQD2 ${gy(fractionation.eqd2Gy)}` : 'Önerilen RT şeması yok.'}`,
    `Hedef hacimler: ${regimen?.targetDescription ?? ((recommendation?.targetVolumes ?? []).map((target) => `${target.name} (${target.margin ?? 'marjin belirtilmedi'})`).join('; ') || 'Belirtilmedi.')}`,
    `OAR: ${(regimen?.oarProfile ?? recommendation?.oarConstraints ?? []).map((constraint) => `${constraint.organ} ${constraint.metric} ${constraint.limit}${constraint.unit}`).join('; ') || 'Belirtilmedi.'}`,
    `Şema kanıtı: ${regimen?.evidence.map((reference) => `${reference.organization} — ${reference.title}: ${reference.url}`).join('; ') || 'Motor önerisi.'}`,
    `Klinik gerekçe: ${result.rationale.join(' ')}`,
    `Uyarılar: ${result.warnings?.join(' ') || 'Yok.'}`,
    `Kılavuzlar: ${result.guidelineReferences.map((reference) => `${reference.organization} — ${reference.title}: ${reference.url}`).join('\n')}`,
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
  const [organ, setOrgan] = useState<OrganSystem>(initialOrgan);
  const [engineId, setEngineId] = useState(getEnginesByOrgan(initialOrgan)[0]?.id ?? ENGINE_REGISTRY[0].id);
  const engine = useMemo<RegisteredEngine>(() => ENGINE_REGISTRY.find((item) => item.id === engineId) ?? getEnginesByOrgan(organ)[0] ?? ENGINE_REGISTRY[0], [engineId, organ]);
  const [input, setInput] = useState<Record<string, unknown>>(engine.defaults);
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState('');
  const [showTnm, setShowTnm] = useState(false);
  const engines = useMemo(() => getEnginesByOrgan(organ).filter((item) => item.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))), [organ, search]);
  const evaluation = useMemo(() => {
    try { return { result: engine.evaluate(input), error: null }; }
    catch (evaluationError) { return { result: null, error: evaluationError instanceof Error ? evaluationError.message : 'Motor değerlendirmesi başarısız.' }; }
  }, [engine, input]);
  const result = evaluation.result;
  const error = evaluation.error;
  const selectOrgan = (nextOrgan: OrganSystem) => { const first = getEnginesByOrgan(nextOrgan)[0]; if (!first) return; setOrgan(nextOrgan); setEngineId(first.id); setInput(first.defaults); };
  const selectEngine = (next: RegisteredEngine) => { setEngineId(next.id); setInput(next.defaults); };
  const update = (field: CDSSFormField, raw: string) => setInput((current) => ({ ...current, [field.key]: asInput(raw, field) }));
  const setStage = (axis: 'T' | 'N' | 'M', value: string) => setInput((current) => ({
    ...current,
    ...(axis === 'T' ? { clinicalT: value, pathologicT: value, tStage: value } : {}),
    ...(axis === 'N' ? { nodalStatus: value, pathologicN: value, nStage: value } : {}),
    ...(axis === 'M' ? { metastaticStatus: value, mStage: value } : {}),
  }));
  const stageValue = (axis: 'T' | 'N' | 'M'): string => {
    const keys = axis === 'T' ? ['clinicalT', 'pathologicT', 'tStage'] : axis === 'N' ? ['nodalStatus', 'pathologicN', 'nStage'] : ['metastaticStatus', 'mStage'];
    return String(keys.map((key) => input[key]).find((value) => value !== undefined) ?? '');
  };
  const stageCards = organ === 'gus'
    ? { T: [['T1c', 'PSA yüksekliği'], ['T2a', 'Lobun yarısı'], ['T2b-c', 'İki lob'], ['T3a', 'Kapsül dışı'], ['T3b', 'Seminal vezikül'], ['T4', 'Komşu organ']], N: [['N0', 'Nodal negatif'], ['N1', 'Bölgesel nodal']], M: [['M0', 'Uzak metastaz yok'], ['M1', 'Uzak metastaz']] }
    : { T: [['T1a', 'Küçük / sınırlı'], ['T1b', 'Erken invazyon'], ['T1c', 'Lokalize tümör'], ['T2', 'Komşu yapı sınırlı'], ['T3', 'İleri lokal uzanım'], ['T4', 'Komşu organ / yapı']], N: [['N0', 'Nodal negatif'], ['N1', 'Bölgesel nodal'], ['N2', 'İleri bölgesel'], ['N3', 'Kontralateral / ileri']], M: [['M0', 'Uzak metastaz yok'], ['M1', 'Uzak metastaz']] };
  const primaryGleason = Number(input.gleasonPrimary ?? 0);
  const secondaryGleason = Number(input.gleasonSecondary ?? 0);
  const gleasonTotal = primaryGleason + secondaryGleason;
  const gradeGroup = gleasonTotal >= 9 ? 5 : gleasonTotal === 8 ? 4 : gleasonTotal === 7 && primaryGleason === 4 ? 3 : gleasonTotal === 7 ? 2 : gleasonTotal === 6 ? 1 : 0;
  const psa = Number(input.psaNgMl ?? 0);
  const riskLabel = input.nodalStatus === 'N1' || input.metastaticStatus === 'M1' ? 'Bölgesel / metastatik' : input.clinicalT === 'T4' || input.clinicalT === 'T3b' || gradeGroup >= 4 || psa > 20 ? 'Yüksek / çok yüksek' : gradeGroup === 3 || psa >= 10 || Number(input.positiveCoresPercent ?? 0) >= 50 ? 'Orta - uygunsuz' : gradeGroup === 2 ? 'Orta - uygun' : 'Düşük';
  const renderField = (field: CDSSFormField): JSX.Element => {
    if (engine.id === 'gus.prostate' && (field.key === 'gleasonPrimary' || field.key === 'gleasonSecondary')) {
      return <label key={field.key} className="block text-xs text-slate-400">{field.key === 'gleasonSecondary' ? '+ Sekonder Gleason paterni' : field.label}<input type="number" min={1} max={5} value={String(input[field.key] ?? '')} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400" /></label>;
    }
    if (engine.id === 'breast.primary' && ['erPercent', 'prPercent', 'her2Status'].includes(field.key)) {
      const active = field.key === 'her2Status' ? input.her2Status === 'positive' : Number(input[field.key] ?? 0) > 0;
      return <button key={field.key} type="button" onClick={() => setInput((current) => ({ ...current, [field.key]: field.key === 'her2Status' ? (active ? 'negative' : 'positive') : active ? 0 : 100 }))} className={`rounded-xl border px-3 py-2 text-left text-xs transition ${active ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100' : 'border-white/10 bg-[#0b1a2d] text-slate-400 hover:border-indigo-300/50'}`}>{active ? '✓' : '○'} {field.label}</button>;
    }
    return <label key={field.key} className="block text-xs text-slate-400">{field.label}{field.description ? <span className="ml-1 text-slate-600">({field.description})</span> : null}{field.type === 'boolean' ? <span className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5"><input type="checkbox" checked={Boolean(input[field.key])} onChange={(event) => update(field, String(event.target.checked))} className="accent-indigo-500" /> <span>{input[field.key] ? 'Var' : 'Yok'}</span></span> : field.type === 'select' ? <select value={String(input[field.key] ?? '')} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400"><option value="">Seçiniz</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.type} value={String(input[field.key] ?? '')} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b1a2d] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-400" />}</label>;
  };
  const visibleFields = engine.formSchema.filter((field) => !['stageGroup', 'clinicalT', 'nodalStatus', 'metastaticStatus', 'pathologicT', 'pathologicN'].includes(field.key));
  const isMeningioma = engine.id === 'cns.meningioma';
  return (
    <main className={dark ? 'min-h-screen bg-[#07111f] text-slate-100' : 'min-h-screen bg-slate-50 text-slate-900'}>
      <div className="w-full px-4 py-4 lg:px-6">
        <header className="mb-5 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300"><Radiation size={28} /></div><div><h1 className="text-xl font-semibold sm:text-2xl">Radyasyon Onkolojisi Klinik Asistan</h1><p className="mt-1 text-xs text-slate-400">Klinik karar · dozimetri · multidisipliner çalışma alanı</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-slate-300"><Search size={15} /><input aria-label="Hastalık ara" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Hastalık ara..." className="w-28 bg-transparent outline-none placeholder:text-slate-500 sm:w-40" /></label><button type="button" onClick={() => setDark((value) => !value)} className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10" aria-label="Tema değiştir">{dark ? <Sun size={17} /> : <Moon size={17} />}</button></div>
        </header>
        <section className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045] p-2"><div className="flex min-w-max gap-2">{ORGAN_OPTIONS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => selectOrgan(id)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${organ === id ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><Icon size={16} />{label}</button>)}</div></section>
        <div className="grid w-full gap-6 lg:grid-cols-12">
          <aside className="space-y-5 lg:col-span-3">
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><p className="text-xs uppercase tracking-[0.2em] text-indigo-300">{organ}</p><h2 className="mt-1 text-lg font-semibold">Hastalık motorları</h2><div className="mt-4 space-y-2">{engines.map((item) => <button key={item.id} type="button" onClick={() => selectEngine(item)} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${engine.id === item.id ? 'border-indigo-400/50 bg-indigo-500/15' : 'border-white/10 bg-black/10 hover:bg-white/10'}`}><span><strong className="block text-sm">{item.name}</strong></span><ArrowRight size={15} className="text-slate-500" /></button>)}</div></section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><h2 className="flex items-center gap-2 font-semibold"><Zap size={18} className="text-amber-300" /> Tek tıkla hazır vaka</h2><div className="mt-4 space-y-2">{engine.presets.map((preset) => <button key={preset.id} type="button" onClick={() => setInput({ ...engine.defaults, ...preset.input })} className="w-full rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-left text-sm text-amber-100 hover:bg-amber-300/20"><strong className="block">{preset.label}</strong><small className="text-amber-200/60">{preset.description}</small></button>)}</div></section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div><h2 className="font-semibold">Vaka parametreleri</h2><p className="mt-1 text-xs text-slate-500">Klinik girdiler ve hızlı değerlendirme alanları</p></div>{engine.id === 'gus.prostate' ? <div className="mt-4 space-y-3"><div className="grid gap-3 sm:grid-cols-2">{visibleFields.slice(0, 2).map(renderField)}</div><div>{visibleFields.slice(2, 3).map(renderField)}</div><div className="grid gap-3 sm:grid-cols-2">{visibleFields.slice(3, 5).map(renderField)}</div><div className="grid gap-3 sm:grid-cols-2">{visibleFields.slice(5).map(renderField)}</div></div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{visibleFields.map(renderField)}</div>}{engine.id === 'gus.prostate' ? <div className="mt-4 rounded-xl border border-indigo-300/20 bg-indigo-500/10 p-3 text-xs text-indigo-100">Gleason: <strong>{gleasonTotal || '—'}</strong>{gradeGroup ? ` (Grade Group ${gradeGroup})` : ''}<span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-200">NCCN: {riskLabel}</span></div> : null}</section>
            {!isMeningioma && <section className="rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-indigo-100">TNM &amp; Evreleme</h2><div className="flex gap-1.5"><a href={result?.guidelineReferences.find((item) => item.organization === 'NCCN')?.url ?? 'https://www.nccn.org/guidelines/category_1'} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-indigo-100">NCCN</a><a href="https://www.astro.org/clinical-practice/guidelines" target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-indigo-100">ASTRO</a><a href="https://www.estro.org/Science/Guidelines" target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-indigo-100">ESTRO</a></div></div>
              {(['T', 'N', 'M'] as const).map((axis) => <div key={axis} className="mt-4"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">{axis} evresi</p><div className="grid grid-cols-2 gap-2">{stageCards[axis].map(([value, description]) => <button key={value} type="button" onClick={() => setStage(axis, value.split(' ')[0])} className={`rounded-xl border px-2.5 py-2 text-left text-[11px] transition ${stageValue(axis) === value.split(' ')[0] ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100' : 'border-white/10 bg-black/10 text-slate-300 hover:border-indigo-300/50'}`}><strong className="block">{value}</strong><span className="text-slate-500">{description}</span></button>)}</div></div>)}
            </section>}
          </aside>
          <section className="lg:col-span-9">{error ? <div className="mb-5 rounded-2xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-200"><strong>Motor değerlendirme hatası:</strong> {error}<p className="mt-1 text-xs text-rose-200/70">Girdileri tamamlayın veya hazır vakalardan birini seçin.</p></div> : null}{result ? <ResultPanel key={result.engineId} result={result} input={input} /> : <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-500">Gerçek motor sonucu için geçerli bir vaka girdisi seçin.</div>}</section>
        </div>
        {showTnm ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-label="TNM ve evreleme kılavuzu"><div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1a2d] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-indigo-300">{engine.name}</p><h2 className="mt-1 text-xl font-semibold">TNM &amp; Evreleme Kılavuzu</h2></div><button type="button" onClick={() => setShowTnm(false)} className="rounded-lg px-3 py-1 text-slate-400 hover:bg-white/10">Kapat</button></div><div className="mt-5 space-y-3 text-sm leading-6 text-slate-300"><p><strong>Mevcut T/N/M girdileri:</strong> {Object.entries(input).filter(([key]) => /stage|clinicalT|nodal|metastatic|pathologic/i.test(key)).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || 'Formda evre girdisi bulunmuyor.'}</p><p>AJCC 8./9. edisyon tanımları ve kurumun lisanslı evreleme tabloları, bu kararın klinik bağlamında doğrulanmalıdır.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{result?.guidelineReferences.slice(0, 4).map((reference) => <a key={`${reference.organization}-${reference.title}`} href={reference.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 p-4 hover:border-indigo-300/40"><span className="text-xs font-bold text-indigo-300">{reference.organization}</span><p className="mt-1 text-sm text-slate-200">{reference.title}</p><ExternalLink size={14} className="mt-2 text-slate-500" /></a>)}</div></div></div> : null}
        <footer className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-slate-500 sm:flex-row sm:justify-between"><span>RadOnco CDSS · Karar destek çıktısı, klinik emrin yerine geçmez.</span><span className="flex items-center gap-1"><Check size={13} /> MDT doğrulaması zorunludur</span></footer>
      </div>
    </main>
  );
}
