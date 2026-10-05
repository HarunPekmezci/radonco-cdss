import React from 'react';

import { Check } from "lucide-react";

export interface HeadNeckFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  hnSubsite: any;
  tText: any;
  hnLarynxSubsite: any;
  setHnLarynxSubsite: any;
  setSelectedT: any;
  setSelectedN: any;
  setSelectedM: any;
  hnCrossesMidline: any;
  setHnCrossesMidline: any;
  hnDistanceFromMidlineCm: any;
  setHnDistanceFromMidlineCm: any;
  hnTumorSizeCm: any;
  setHnTumorSizeCm: any;
  hnDoiMm: any;
  setHnDoiMm: any;
  hnENE: any;
  setHnENE: any;
  hnPositiveMargin: any;
  setHnPositiveMargin: any;
}

export default function HeadNeckForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, hnSubsite, tText, hnLarynxSubsite, setHnLarynxSubsite, setSelectedT, setSelectedN, setSelectedM, hnCrossesMidline, setHnCrossesMidline, hnDistanceFromMidlineCm, setHnDistanceFromMidlineCm, hnTumorSizeCm, setHnTumorSizeCm, hnDoiMm, setHnDoiMm, hnENE, setHnENE, hnPositiveMargin, setHnPositiveMargin }: HeadNeckFormProps) {
  return (
    <>
      {selectedOrgan === 'head-neck' && (
              <div className="space-y-2 text-xs">
                {hnSubsite === 'larynx' && (
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Larinks klinik senaryosu")}</label>
                    <select
                      value={hnLarynxSubsite}
                      onChange={e => {
                        const value = e.currentTarget.value;
                        if (value === 'Erken_Glottik_T1_T2' || value === 'Lokal_Ileri_T3_T4') {
                          setHnLarynxSubsite(value);
                          setSelectedT(value === 'Erken_Glottik_T1_T2' ? 'T1a/b' : 'T3');
                          setSelectedN('N0');
                          setSelectedM('M0');
                        }
                      }}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-slate-900 w-full"
                    >
                      <option value="Erken_Glottik_T1_T2">{tText("Erken glottik T1-T2 N0 (yalnız vokal kord, 63 Gy/28 fx)")}</option>
                      <option value="Lokal_Ileri_T3_T4">{tText("Lokal ileri supraglottik/glottik T3-T4")}</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" checked={hnCrossesMidline} onChange={e => setHnCrossesMidline(e.currentTarget.checked)} />
                    {tText("\n                    Orta hattı geçiyor\n                  ")}</label>
                  <label className="text-slate-600">
                    {tText("\n                    Orta hatta uzaklık (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDistanceFromMidlineCm} onChange={e => setHnDistanceFromMidlineCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    Tümör çapı (cm)\n                    ")}<input type="number" min="0" step="0.1" value={hnTumorSizeCm} onChange={e => setHnTumorSizeCm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                  <label className="text-slate-600">
                    {tText("\n                    Derin invazyon (DOI, mm)\n                    ")}<input type="number" min="0" step="0.1" value={hnDoiMm} onChange={e => setHnDoiMm(e.currentTarget.value)} className="mt-1 bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full" />
                  </label>
                </div>
                {(hnSubsite === 'oral-cavity' || hnSubsite === 'maxillary-sinus') && (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnENE} onChange={e => setHnENE(e.currentTarget.checked)} />
                      {tText("\n                      Ekstranodal yayılım (ENE)\n                    ")}</label>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={hnPositiveMargin} onChange={e => setHnPositiveMargin(e.currentTarget.checked)} />
                      {tText("\n                      Pozitif cerrahi sınır (R1)\n                    ")}</label>
                  </div>
                )}
              </div>
            )}
    </>
  );
}
