import React from 'react';

import { Check } from "lucide-react";

export interface CNSFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  cnsSubtype: any;
  tText: any;
  cnsMidlineShift: any;
  setCnsMidlineShift: any;
  cnsSymptoms: any;
  setCnsSymptoms: any;
  cnsMetCount: any;
  setCnsMetCount: any;
  cnsMaxDiameter: any;
  setCnsMaxDiameter: any;
  cnsResection: any;
  setCnsResection: any;
  cnsKps: any;
  setCnsKps: any;
  gbmPerformance: any;
  setGbmPerformance: any;
  lang: any;
  gliomaGrade: any;
  setGliomaGrade: any;
  gliomaRiskFactors: any;
  setGliomaRiskFactors: any;
  meningiomaGrade: any;
  setMeningiomaGrade: any;
  setSelectedT: any;
  meningiomaSimpson: any;
  setMeningiomaSimpson: any;
}

export default function CNSForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, cnsSubtype, tText, cnsMidlineShift, setCnsMidlineShift, cnsSymptoms, setCnsSymptoms, cnsMetCount, setCnsMetCount, cnsMaxDiameter, setCnsMaxDiameter, cnsResection, setCnsResection, cnsKps, setCnsKps, gbmPerformance, setGbmPerformance, lang, gliomaGrade, setGliomaGrade, gliomaRiskFactors, setGliomaRiskFactors, meningiomaGrade, setMeningiomaGrade, setSelectedT, meningiomaSimpson, setMeningiomaSimpson }: CNSFormProps) {
  return (
    <>
      {selectedOrgan === 'cns' && cnsSubtype === 'mets' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Orta Hat Şifti (Herniasyon)")}</label>
                  <select
                    value={cnsMidlineShift}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Yok' || value === '<5mm' || value === '>=5mm') setCnsMidlineShift(value);
                    }}
                    className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Yok">{tText("Şift yok")}</option>
                    <option value="<5mm">{tText("Hafif şift (<5 mm)")}</option>
                    <option value=">=5mm">{tText('Kritik Şift (≥5 mm - Acil Dekompresyon)')}</option>
                  </select>
                </div>
                <label className="text-slate-600">
                  {tText("\n                  Semptom durumu\n                  ")}<select
                    value={cnsSymptoms}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Asimptomatik' || value === 'Semptomatik') setCnsSymptoms(value);
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Asimptomatik">{tText("Asemptomatik")}</option>
                    <option value="Semptomatik">{tText("Semptomatik (ödem / defisit / kitle etkisi)")}</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Metastaz Sayısı")}</label>
                    <input
                      type="number"
                      min="1"
                      value={cnsMetCount}
                      onChange={e => setCnsMetCount(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md p-1.5 text-center text-slate-900 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Maks Çap (cm)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={cnsMaxDiameter}
                      onChange={e => setCnsMaxDiameter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md p-1.5 text-center text-slate-900 w-full"
                    />
                  </div>
                </div>
                <label className="text-slate-600">
                  {tText("\n                  Cerrahi / rezeksiyon\n                  ")}<select
                    value={cnsResection}
                    onChange={e => {
                      const value = e.currentTarget.value;
                      if (value === 'Yok' || value === 'GTR' || value === 'STR' || value === 'Biyopsi') setCnsResection(value);
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                  >
                    <option value="Yok">{tText("Cerrahi yok")}</option>
                    <option value="GTR">{tText("Gross total rezeksiyon (GTR)")}</option>
                    <option value="STR">{tText("Subtotal rezeksiyon (STR)")}</option>
                    <option value="Biyopsi">{tText("Biyopsi")}</option>
                  </select>
                </label>
                <label className="text-slate-600">
                  {tText("\n                  KPS\n                  ")}<input type="number" min="0" max="100" step="10" value={cnsKps} onChange={e => setCnsKps(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-md p-1.5 text-slate-900 w-full" />
                </label>
              </div>
            )}
      {selectedOrgan === 'cns' && cnsSubtype === 'gbm' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("Performans / tedavi uygunluğu")}</label>
                <select
                  value={gbmPerformance}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Iyi_ECOG_0_1' || value === 'Duskun_Yasli') setGbmPerformance(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Iyi_ECOG_0_1">{tText("İyi performans (ECOG 0-1): Stupp")}</option>
                  <option value="Duskun_Yasli">{tText("Yaşlı / düşkün: Perry hipofraksiyone KRT")}</option>
                </select>
                <label className="text-slate-600">{tText("KPS: ")}{cnsKps}
                  <input type="range" min="0" max="100" step="10" value={cnsKps} onChange={e => setCnsKps(e.currentTarget.value)} className="block w-full" />
                </label>
              </div>
            )}
      {selectedOrgan === 'cns' && cnsSubtype === 'glioma' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'WHO Grade' : 'WHO Grade'}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Grade_1', 'Grade_2', 'Grade_3', 'Grade_4'] as const).map(grade => (
                      <button
                        key={grade}
                        type="button"
                        aria-pressed={gliomaGrade === grade}
                        onClick={() => setGliomaGrade(grade)}
                        className={parameterButtonClass(gliomaGrade === grade)}
                      >
                        {grade.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Pignatti / RTOG 9802 Yüksek Risk Kriterleri' : 'Pignatti / RTOG 9802 High-Risk Criteria'}</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {([
                      { key: 'age40', label: lang === 'tr' ? 'Yaş ≥ 40' : 'Age ≥ 40' },
                      { key: 'subtotalResection', label: lang === 'tr' ? 'Subtotal rezeksiyon / biyopsi (STR)' : 'Subtotal resection / biopsy (STR)' },
                      { key: 'largeOrCrossing', label: lang === 'tr' ? 'Çap ≥ 5 cm veya korpus kallozum geçişi' : 'Diameter ≥ 5 cm or corpus callosum crossing' },
                      { key: 'neurologicSymptoms', label: lang === 'tr' ? 'Nörolojik defisit / semptom' : 'Neurological deficit / symptoms' },
                      { key: 'molecularHighRisk', label: lang === 'tr' ? 'Moleküler yüksek risk (IDH-wt, CDKN2A/B del, TERT mut)' : 'Molecular high risk (IDH-wt, CDKN2A/B del, TERT mut)' },
                    ] as const).map(item => (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={gliomaRiskFactors[item.key]}
                        onClick={() => setGliomaRiskFactors((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={parameterButtonClass(gliomaRiskFactors[item.key])}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
      {selectedOrgan === 'cns' && cnsSubtype === 'meningioma' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 block">{tText("WHO derece")}</label>
                <select
                  value={meningiomaGrade}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Grade_1' || value === 'Grade_2' || value === 'Grade_3') setMeningiomaGrade(value);
                    setSelectedT(value.replace('_', '-'));
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Grade_1">{tText("WHO Grade 1")}</option>
                  <option value="Grade_2">{tText("WHO Grade 2")}</option>
                  <option value="Grade_3">{tText("WHO Grade 3")}</option>
                </select>
                <label className="text-slate-600 block">{tText("Rezeksiyon derecesi / cerrahi sınır")}</label>
                <select
                  value={cnsResection}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'Yok' || value === 'GTR' || value === 'STR' || value === 'Biyopsi') setCnsResection(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="Yok">{tText("Cerrahi yapılmadı")}</option>
                  <option value="GTR">{tText("Gross total rezeksiyon (GTR)")}</option>
                  <option value="STR">{tText("Subtotal rezeksiyon (STR)")}</option>
                  <option value="Biyopsi">{tText("Biyopsi")}</option>
                </select>
                <label className="text-slate-600 block">{tText("Simpson derecesi")}</label>
                <select
                  value={meningiomaSimpson}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    if (value === 'I-III' || value === 'IV-V') setMeningiomaSimpson(value);
                  }}
                  className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                >
                  <option value="I-III">{tText("Simpson I-III (GTR)")}</option>
                  <option value="IV-V">{tText("Simpson IV-V (STR / rezidü)")}</option>
                </select>
                <label className="text-slate-600">{tText("Maksimum çap (cm)\n                  ")}<input type="number" min="0" step="0.1" value={cnsMaxDiameter} onChange={e => setCnsMaxDiameter(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-md p-1.5 text-slate-900 w-full" />
                </label>
              </div>
            )}
    </>
  );
}
