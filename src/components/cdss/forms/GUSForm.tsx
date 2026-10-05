import React from 'react';

import { Check } from "lucide-react";

export interface GUSFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  gusSubtype: any;
  tText: any;
  gleasonPrimary: any;
  setGleasonPrimary: any;
  gleasonSecondary: any;
  setGleasonSecondary: any;
  psaLevel: any;
  setPsaLevel: any;
  positiveCorePercent: any;
  setPositiveCorePercent: any;
  hasECE: any;
  setHasECE: any;
  hasSVI: any;
  setHasSVI: any;
  lang: any;
  renalDiseaseSetting: any;
  setRenalDiseaseSetting: any;
  renalTumorSizeCm: any;
  setRenalTumorSizeCm: any;
  bladderTurbtComplete: any;
  setBladderTurbtComplete: any;
  bladderHydronephrosis: any;
  setBladderHydronephrosis: any;
  bladderConcurrentCis: any;
  setBladderConcurrentCis: any;
  selectedT: any;
  setSelectedT: any;
  setSelectedN: any;
  setSelectedM: any;
}

export default function GUSForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, gusSubtype, tText, gleasonPrimary, setGleasonPrimary, gleasonSecondary, setGleasonSecondary, psaLevel, setPsaLevel, positiveCorePercent, setPositiveCorePercent, hasECE, setHasECE, hasSVI, setHasSVI, lang, renalDiseaseSetting, setRenalDiseaseSetting, renalTumorSizeCm, setRenalTumorSizeCm, bladderTurbtComplete, setBladderTurbtComplete, bladderHydronephrosis, setBladderHydronephrosis, bladderConcurrentCis, setBladderConcurrentCis, selectedT, setSelectedT, setSelectedN, setSelectedM }: GUSFormProps) {
  return (
    <>
      {selectedOrgan === 'prostate' && gusSubtype === 'prostate' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Gleason Skoru")}</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={gleasonPrimary}
                        onChange={e => setGleasonPrimary(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-1.5 text-center w-12 text-slate-900"
                      />
                      <span className="text-slate-400">{tText("+")}</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={gleasonSecondary}
                        onChange={e => setGleasonSecondary(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-1.5 text-center w-12 text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("PSA (ng/mL)")}</label>
                    <input
                      type="number"
                      min="0"
                      value={psaLevel}
                      onChange={e => setPsaLevel(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Pozitif biyopsi kor oranı (%)")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={positiveCorePercent}
                    onChange={e => setPositiveCorePercent(e.currentTarget.value)}
                    className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={hasECE}
                    onClick={() => setHasECE((value: any) => !value)}
                    className={`rounded-lg border p-2 ${hasECE ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'}`}
                  >
                    {tText("\n                    Ekstrakapsüler yayılım (ECE)\n                  ")}</button>
                  <button
                    type="button"
                    aria-pressed={hasSVI}
                    onClick={() => setHasSVI((value: any) => !value)}
                    className={`rounded-lg border p-2 ${hasSVI ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'}`}
                  >
                    {tText("\n                    Seminal vezikül invazyonu\n                  ")}</button>
                </div>
                <div className="rounded-lg border border-sky-300 bg-blue-50 p-2 font-semibold text-blue-900">
                  {tText("\n                  Otomatik NCCN risk grubu: ")}{prostateRiskLabel}
                </div>
              </div>
            )}
      {selectedOrgan === 'prostate' && gusSubtype === 'kidney' && (
              <div className="space-y-2 text-xs">
                <label className="block text-slate-300">
                  {lang === 'tr' ? 'RCC tedavi bağlamı' : 'RCC treatment setting'}
                  <select value={renalDiseaseSetting} onChange={event => setRenalDiseaseSetting(event.currentTarget.value as typeof renalDiseaseSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                    <option value="primary-inoperable">{lang === 'tr' ? 'Medikal inoperabl primer RCC' : 'Medically inoperable primary RCC'}</option>
                    <option value="oligometastatic">{lang === 'tr' ? 'Oligometastatik / immünoterapi altında oligoprogresyon' : 'Oligometastatic / oligoprogressive on immunotherapy'}</option>
                  </select>
                </label>
                {renalDiseaseSetting === 'primary-inoperable' && (
                  <>
                    <label className="block text-slate-300">
                      {lang === 'tr' ? 'Primer tümör çapı (cm; FASTRACK II doz seçimi)' : 'Primary tumour diameter (cm; FASTRACK II dose selection)'}
                      <input
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.1"
                        value={renalTumorSizeCm}
                        onChange={event => setRenalTumorSizeCm(event.currentTarget.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100"
                      />
                    </label>
                  <p className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-2 text-[10px] leading-relaxed text-amber-200">
                    {lang === 'tr'
                      ? 'FASTRACK II doz seçimi gerçek tümör çapına göre yapılır: ≤4 cm için 26 Gy × 1; >4–10 cm için 42 Gy / 3 fx. T kategorisi tek başına tümör çapının yerine geçmez.'
                      : 'FASTRACK II dose selection is by actual tumour diameter: ≤4 cm, 26 Gy × 1; >4–10 cm, 42 Gy / 3 fx. T category alone does not replace measured tumour size.'}
                  </p>
                  </>
                )}
              </div>
            )}
      {selectedOrgan === 'prostate' && gusSubtype === 'bladder' && (
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderTurbtComplete} onChange={e => setBladderTurbtComplete(e.currentTarget.checked)} />
                  {tText("\n                  Maksimal TURBT tamamlandı\n                ")}</label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderHydronephrosis} onChange={e => setBladderHydronephrosis(e.currentTarget.checked)} />
                  {tText("\n                  Hidronefroz\n                ")}</label>
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={bladderConcurrentCis} onChange={e => setBladderConcurrentCis(e.currentTarget.checked)} />
                  {tText("\n                  Eşzamanlı CIS\n                ")}</label>
              </div>
            )}
      {selectedOrgan === 'prostate' && gusSubtype === 'testis' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("Seminom evresi")}</label>
                <select
                  value={selectedT}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'I' || value === 'IIA' || value === 'IIB') {
                      setSelectedT(value);
                      setSelectedN(value === 'I' ? 'N0' : value === 'IIA' ? 'N1' : 'N2');
                      setSelectedM('M0');
                    }
                  }}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-slate-900 w-full"
                >
                  <option value="I">{tText("Evre I")}</option>
                  <option value="IIA">{tText("Evre IIA")}</option>
                  <option value="IIB">{tText("Evre IIB")}</option>
                </select>
              </div>
            )}
      {selectedOrgan === 'prostate' && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-amber-300 font-mono">
                            PSA: {psaLevel} • Gleason: {gleasonPrimary}+{gleasonSecondary}
                          </span>
                        </>
                      )}
    </>
  );
}
