'use client';

import React, { useState, useId } from 'react';
import {
  X,
  Zap,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import {
  parseClinicalReport,
  ParsedStagingResult,
  ReportModality,
} from '@/engines/clinicalReportParser';
import { OrganId } from '@/data/cdssRules';
import { Language } from '@/lib/translations';

interface AutoStagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onApplyStaging: (result: ParsedStagingResult) => void;
}

const SAMPLE_REPORTS: Record<string, { title_tr: string; title_en: string; text: string }> = {
  lung: {
    title_tr: '🫁 Akciğer Patolojisi (Lobektomi)',
    title_en: '🫁 Lung Pathology (Lobectomy)',
    text: `HASTA ADI: AHMET YILMAZ
TC KİMLİK NO: 12345678901
MATERYAL: Sağ Üst Lobektomi ve Mediastinal Lenf Nodu Diseksiyonu
TANI: Akciğer, Sağ Üst Lob: İnvaziv Adenokarsinom
Tümör Çapı: 2.4 cm (en büyük boyut).
Viseral plevra invazyonu izlenmedi (elastika intakt).
Lenfovasküler invazyon (LVI): Pozitif.
Perinöral invazyon (PNI): Negatif.
Cerrahi sınırlar: Negatif, en yakın bronş cerrahi sınırına mesafe 12 mm.
Lenf Nodları:
İstasyon 10 (Hiler): 0/2 metastaz izlenmedi.
İstasyon 4R (Paratrakeal): 1/3 lenf nodunda metastaz izlendi (en büyük odak 6 mm).
İstasyon 7 (Subkarinal): 0/4 metastaz izlenmedi.
Uzak organ metastazı saptanmadı (M0).`,
  },
  prostate: {
    title_tr: '🎯 Prostat MR (PI-RADS & EPE)',
    title_en: '🎯 Prostate MRI (PI-RADS & EPE)',
    text: `HASTA: MEHMET DEMİR
TCKN: 98765432109
KLİNİK: Serum PSA: 9.2 ng/mL.
PROSTAT MULTİPARAMETRİK MR İNCELEMESİ:
Periferik zon sağ lob posterolateralinde 18 mm boyutunda PI-RADS 5 lezyon izlendi.
Prostat psödokapsülünde fokal kabarıklık ve ekstraprostatik uzanım (EPE) mevcuttur (T3a).
Seminal vezikül invazyonu (SVI) saptanmadı.
Pelvik ve obturator lenf nodlarında patolojik boyut artışı izlenmedi (N0).
Kemik yapılar salimdir (M0).
Biyopsi Histopatolojisi: Asiner Adenokarsinom, Gleason 4+3 = 7.`,
  },
  breast: {
    title_tr: '🎀 Meme Patolojisi (IDC & Reseptörler)',
    title_en: '🎀 Breast Pathology (IDC & Receptors)',
    text: `HASTA ADI: AYŞE KAYA
TC: 55443322110
İŞLEM: Modifiye Radikal Mastektomi ve Aksiller Diseksiyon (Sol Meme).
MAKROSKOPİ: Sol üst dış kadranda 3.2 cm çapında sert kıvamlı kitle.
TANI: İnvaziv Duktal Karsinom (NST), Grade 2.
Cerrahi sınırlar: Cilt ve derin fasya cerrahi sınırları negatif (en yakın mesafe 4 mm).
Lenfovasküler invazyon (LVI): Pozitif.
Aksiller lenf nodları: 2/14 lenf nodunda makrometastaz saptandı.
İMMÜNOHİSTOKİMYA:
Östrojen Reseptörü (ER): %90 Pozitif (kuvvetli).
Progesteron Reseptörü (PR): %60 Pozitif (orta).
HER2/neu: 1+ Negatif.
Ki-67 Proliferasyon İndeksi: %22.`,
  },
  rectum: {
    title_tr: '🔬 Rektum MR (CRM & EMVI)',
    title_en: '🔬 Rectal MRI (CRM & EMVI)',
    text: `REKTUM MULTİDİSİPLİNER MR RAPORU:
Rektum orta-alt yerleşimli tümöral kitle, anal verge'e 4.5 cm mesafede.
Tümör muskularis propriayı aşarak perirektal yağ dokusuna 6 mm derinlikte uzanmaktadır (T3).
Mezorektal Fasya (CRM): Tümörün mezorektal fasyaya en yakın mesafesi 0.5 mm olup CRM Pozitif kabul edildi.
Ekstramural Venöz İnvazyon (EMVI): Pozitif.
Mezorektal alanda 3 adet şüpheli yuvarlak lenf nodu izlenmiştir (N1).
Uzak metastaz bulgusu yoktur (M0).`,
  },
};

export default function AutoStagerModal({
  isOpen,
  onClose,
  lang,
  onApplyStaging,
}: AutoStagerModalProps) {
  const [selectedModality, setSelectedModality] = useState<ReportModality>('auto');
  const [reportText, setReportText] = useState<string>('');
  const [stagedResult, setStagedResult] = useState<ParsedStagingResult | null>(null);
  const [editedOrgan, setEditedOrgan] = useState<OrganId | ''>('');
  const [editedT, setEditedT] = useState<string>('');
  const [editedN, setEditedN] = useState<string>('');
  const [editedM, setEditedM] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const titleId = useId();

  if (!isOpen) return null;

  const handleStageReport = () => {
    if (!reportText.trim()) return;
    const parsed = parseClinicalReport(reportText, selectedModality);
    setStagedResult(parsed);
    setEditedOrgan(parsed.organ ?? 'thorax');
    setEditedT(parsed.suggestedT);
    setEditedN(parsed.suggestedN);
    setEditedM(parsed.suggestedM);
  };

  const handleApply = () => {
    if (!stagedResult) return;
    const finalResult: ParsedStagingResult = {
      ...stagedResult,
      organ: (editedOrgan || stagedResult.organ) as OrganId,
      suggestedT: editedT || stagedResult.suggestedT,
      suggestedN: editedN || stagedResult.suggestedN,
      suggestedM: editedM || stagedResult.suggestedM,
    };
    onApplyStaging(finalResult);
    onClose();
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_REPORTS[key];
    if (sample) {
      setReportText(sample.text);
      const parsed = parseClinicalReport(sample.text, selectedModality);
      setStagedResult(parsed);
      setEditedOrgan(parsed.organ ?? 'thorax');
      setEditedT(parsed.suggestedT);
      setEditedN(parsed.suggestedN);
      setEditedM(parsed.suggestedM);
    }
  };

  const copyDeidentified = () => {
    if (stagedResult?.deidentifiedText) {
      navigator.clipboard.writeText(stagedResult.deidentifiedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-emerald-500/30 bg-[#0b1220] shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden">
        {/* Top Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-lg font-bold text-white tracking-tight">
                  {lang === 'tr' ? 'Otomatik Evreleyici (Auto-Stager)' : 'Auto-Stager'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  MDR Kural 11 / KVKK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'tr'
                  ? 'Patoloji, PET/BT, MR & USG Rapor Ayrıştırıcı · İstemci Taraflı Deterministik Evreleme'
                  : 'Pathology, PET/CT, MRI & USG Report Parser · Client-Side Deterministic Staging'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Modality Selector Pills & Privacy Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Modalite seçimi">
              {[
                { id: 'auto', label_tr: '✨ Tümü / Otomatik', label_en: '✨ Auto / All' },
                { id: 'pathology', label_tr: '🔬 Patoloji', label_en: '🔬 Pathology' },
                { id: 'pet_ct', label_tr: '☢️ PET-BT', label_en: '☢️ PET-CT' },
                { id: 'mri', label_tr: '🧲 MR', label_en: '🧲 MRI' },
                { id: 'usg', label_tr: '🔊 USG', label_en: '🔊 USG' },
              ].map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModality(mod.id as ReportModality)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    selectedModality === mod.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'tr' ? mod.label_tr : mod.label_en}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-950/30 px-2.5 py-1 text-[11px] font-medium text-teal-300">
              <Lock className="h-3 w-3 text-teal-400" />
              <span>
                {lang === 'tr'
                  ? '100% Cihaz İçi / Sıfır Veri Sızıntısı'
                  : '100% Client-Side / Zero Data Leakage'}
              </span>
            </div>
          </div>

          {/* Quick Sample Load Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {lang === 'tr' ? 'Örnek Rapor Yükle:' : 'Load Sample Report:'}
            </span>
            {Object.entries(SAMPLE_REPORTS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => loadSample(key)}
                className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:text-emerald-200 transition"
              >
                {lang === 'tr' ? item.title_tr : item.title_en}
              </button>
            ))}
          </div>

          {/* Textarea for Report Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="report-text-input" className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                {lang === 'tr' ? 'Klinik Rapor Metni (Patoloji, PET-BT veya MR)' : 'Clinical Report Text (Pathology, PET-CT, or MRI)'}
              </label>
              {stagedResult && stagedResult.redactedCount > 0 && (
                <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  {lang === 'tr'
                    ? `${stagedResult.redactedCount} adet kişisel veri (TCKN / İsim) otomatik gizlendi`
                    : `${stagedResult.redactedCount} personal identifiers (TCKN/Name) auto-redacted`}
                </span>
              )}
            </div>
            <textarea
              id="report-text-input"
              rows={6}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={
                lang === 'tr'
                  ? 'Epikriz, patoloji raporu veya PET-BT / MR rapor metnini buraya yapıştırın...\n(TC Kimlik Numarası ve hasta isimleri tarayıcı içinde otomatik maskelenir).'
                  : 'Paste pathology, PET-CT, or MRI report text here...\n(National IDs and patient names are automatically redacted in-browser).'
              }
              className="w-full rounded-xl border border-slate-700 bg-[#070b14] p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed"
            />
          </div>

          {/* Primary Action 1: Stage Report */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleStageReport}
              disabled={!reportText.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4" />
              <span>{lang === 'tr' ? 'Raporu Evrele' : 'Stage Report'}</span>
            </button>
          </div>

          {/* Results Section */}
          {stagedResult && (
            <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'tr' ? 'Ayrıştırma ve Evreleme Sonucu' : 'Parsing and Staging Results'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={copyDeidentified}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 hover:text-white transition"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{lang === 'tr' ? 'Maskelenmiş Metni Kopyala' : 'Copy Redacted Text'}</span>
                </button>
              </div>

              {/* Staging Parameters Grid with Clinician Overrides */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Organ */}
                <div className="rounded-lg border border-slate-800 bg-[#090e1a] p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {lang === 'tr' ? 'Tespit Edilen Organ' : 'Detected Organ'}
                  </span>
                  <select
                    value={editedOrgan}
                    onChange={(e) => setEditedOrgan(e.target.value as OrganId)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="thorax">Toraks (Akciğer)</option>
                    <option value="prostate">Prostat / GÜS</option>
                    <option value="breast">Meme</option>
                    <option value="gis">GİS (Rektum/Kolon/Mide)</option>
                    <option value="head-neck">Baş-Boyun</option>
                    <option value="cns">MSS / Beyin</option>
                    <option value="gynecology">Jinekoloji</option>
                    <option value="skin">Cilt</option>
                    <option value="bone">Kemik / Sarkom</option>
                  </select>
                </div>

                {/* T-Stage */}
                <div className="rounded-lg border border-slate-800 bg-[#090e1a] p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">T-Evresi</span>
                  <input
                    type="text"
                    value={editedT}
                    onChange={(e) => setEditedT(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                    placeholder="T1c"
                  />
                </div>

                {/* N-Stage */}
                <div className="rounded-lg border border-slate-800 bg-[#090e1a] p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">N-Evresi</span>
                  <input
                    type="text"
                    value={editedN}
                    onChange={(e) => setEditedN(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                    placeholder="N0"
                  />
                </div>

                {/* M-Stage */}
                <div className="rounded-lg border border-slate-800 bg-[#090e1a] p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">M-Evresi</span>
                  <input
                    type="text"
                    value={editedM}
                    onChange={(e) => setEditedM(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-bold font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                    placeholder="M0"
                  />
                </div>
              </div>

              {/* Histology & Dimensions summary */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {stagedResult.histology && (
                  <span className="rounded-md border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-sky-200">
                    🔬 <strong className="font-semibold">{stagedResult.histology}</strong>
                  </span>
                )}
                {stagedResult.tumorSizeMm && (
                  <span className="rounded-md border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-indigo-200">
                    📏 {stagedResult.tumorSizeMm} mm ({stagedResult.tumorSizeCm} cm)
                  </span>
                )}
                {stagedResult.riskFactors.lvi !== undefined && (
                  <span className={`rounded-md border px-2.5 py-1 ${
                    stagedResult.riskFactors.lvi
                      ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300'
                  }`}>
                    LVI: {stagedResult.riskFactors.lvi ? 'Pozitif (+)' : 'Negatif (-)'}
                  </span>
                )}
                {stagedResult.riskFactors.pni !== undefined && (
                  <span className={`rounded-md border px-2.5 py-1 ${
                    stagedResult.riskFactors.pni
                      ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300'
                  }`}>
                    PNI: {stagedResult.riskFactors.pni ? 'Pozitif (+)' : 'Negatif (-)'}
                  </span>
                )}
                {stagedResult.riskFactors.visceralPleura && (
                  <span className={`rounded-md border px-2.5 py-1 ${
                    stagedResult.riskFactors.visceralPleura === 'invaded'
                      ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300'
                  }`}>
                    Viseral Plevra: {stagedResult.riskFactors.visceralPleura === 'invaded' ? 'İnvaze (PL1/PL2)' : 'İntakt'}
                  </span>
                )}
                {stagedResult.riskFactors.crmStatus && (
                  <span className={`rounded-md border px-2.5 py-1 ${
                    stagedResult.riskFactors.crmStatus === 'positive'
                      ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                      : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  }`}>
                    CRM: {stagedResult.riskFactors.crmStatus === 'positive' ? 'Pozitif (≤1 mm)' : 'Negatif (>1 mm)'}
                  </span>
                )}
                {stagedResult.riskFactors.emvi !== undefined && (
                  <span className={`rounded-md border px-2.5 py-1 ${
                    stagedResult.riskFactors.emvi
                      ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300'
                  }`}>
                    EMVI: {stagedResult.riskFactors.emvi ? 'Pozitif (+)' : 'Negatif (-)'}
                  </span>
                )}
                {stagedResult.riskFactors.ece && (
                  <span className="rounded-md border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-amber-300">
                    Prostat EPE / Kapsül Aşımı: Pozitif
                  </span>
                )}
                {stagedResult.riskFactors.svi && (
                  <span className="rounded-md border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 text-rose-300">
                    Seminal Vezikül İnvazyonu (SVI): Pozitif
                  </span>
                )}
                {stagedResult.riskFactors.gleasonPrimary && (
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-emerald-300">
                    Gleason: {stagedResult.riskFactors.gleasonPrimary}+{stagedResult.riskFactors.gleasonSecondary}
                  </span>
                )}
                {stagedResult.riskFactors.psa && (
                  <span className="rounded-md border border-teal-500/30 bg-teal-950/40 px-2.5 py-1 text-teal-300">
                    PSA: {stagedResult.riskFactors.psa} ng/mL
                  </span>
                )}
              </div>

              {/* Full MDR Evidence Quotes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Info className="h-3.5 w-3.5 text-cyan-400" />
                  <span>
                    {lang === 'tr' ? 'MDR Kanıt ve Rapor Alıntıları (Denetlenebilirlik):' : 'MDR Evidence & Verbatim Quotes (Auditability):'}
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {stagedResult.evidenceQuotes.map((ev, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-slate-800 bg-[#070b14] px-2.5 py-1.5 text-[11px] leading-snug flex items-start gap-2"
                    >
                      <span className="shrink-0 font-bold text-emerald-400">{ev.label}:</span>
                      <span className="font-mono text-slate-300 italic">"{ev.quote}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {lang === 'tr' ? 'İptal' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!stagedResult}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 transition hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{lang === 'tr' ? 'Evreyi CDSS\'e Aktar' : 'Apply Staging to CDSS'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
