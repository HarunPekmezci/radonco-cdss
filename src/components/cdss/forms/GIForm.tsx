import React from 'react';

import { Check } from "lucide-react";

export interface GIFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  gisOrgan: any;
  lang: any;
  gisCrmStatus: any;
  setGisCrmStatus: any;
  liverHistology: any;
  liverBclcStage: any;
  setLiverBclcStage: any;
  setSelectedT: any;
  setSelectedN: any;
  setSelectedM: any;
  breathingMotion: any;
  setBreathingMotion: any;
  biliaryTreatmentSetting: any;
  setBiliaryTreatmentSetting: any;
  biliaryMarginStatus: any;
  setBiliaryMarginStatus: any;
}

export default function GIForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, gisOrgan, lang, gisCrmStatus, setGisCrmStatus, liverHistology, liverBclcStage, setLiverBclcStage, setSelectedT, setSelectedN, setSelectedM, breathingMotion, setBreathingMotion, biliaryTreatmentSetting, setBiliaryTreatmentSetting, biliaryMarginStatus, setBiliaryMarginStatus }: GIFormProps) {
  return (
    <>
      {selectedOrgan === 'gis' && (
              <div className="flex flex-col gap-3 text-xs">
                {gisOrgan === 'Rektum' && (
                  <div>
                    <span className="mb-1 block font-semibold text-slate-300">
                      {lang === 'tr' ? 'MR CRM (Mezorektal Fasya) Durumu' : 'MRI CRM (Mesorectal Fascia) Status'}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'Negatif' as const, label: lang === 'tr' ? 'CRM Negatif (>1 mm)' : 'CRM Negative (>1 mm)' },
                        { value: 'Pozitif' as const, label: lang === 'tr' ? 'CRM Pozitif / Tehlikeli (≤1 mm)' : 'CRM Positive / Threatened (≤1 mm)' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={gisCrmStatus === option.value}
                          onClick={() => setGisCrmStatus(option.value)}
                          className={parameterButtonClass(gisCrmStatus === option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {gisOrgan === 'Karaciger' && (
                  <>
                    {liverHistology === 'hcc' && (
                      <label className="block font-semibold text-slate-300">
                        {lang === 'tr' ? 'BCLC klinik evresi' : 'BCLC clinical stage'}
                        <select
                          value={liverBclcStage}
                          onChange={event => {
                            const stage = event.currentTarget.value as typeof liverBclcStage;
                            setLiverBclcStage(stage);
                            setSelectedT(stage === 'C' ? 'T3' : stage === 'B' ? 'T2' : 'T1a');
                            setSelectedN('N0');
                            setSelectedM('M0');
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100"
                        >
                          <option value="0">BCLC 0 · {lang === 'tr' ? 'Çok erken' : 'Very early'}</option>
                          <option value="A">BCLC A · {lang === 'tr' ? 'Erken' : 'Early'}</option>
                          <option value="B">BCLC B · {lang === 'tr' ? 'Orta' : 'Intermediate'}</option>
                          <option value="C">BCLC C · {lang === 'tr' ? 'İleri / PVTT' : 'Advanced / PVTT'}</option>
                        </select>
                      </label>
                    )}
                    <div>
                      <span className="mb-1 block font-semibold text-slate-300">
                        {lang === 'tr' ? 'Solunum Hareketi Yönetimi (SBRT)' : 'Respiratory Motion Management'}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {[
                          { value: '4D-CT' as const, label: lang === 'tr' ? '4D-CT · Serbest Solunum / ITV' : '4D-CT · Free Breathing / ITV' },
                          { value: 'DIBH' as const, label: lang === 'tr' ? 'DIBH · Nefes Tutma / GTV→PTV' : 'DIBH · Breath-Hold / GTV→PTV' },
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={breathingMotion === option.value}
                            onClick={() => setBreathingMotion(option.value)}
                            className={parameterButtonClass(breathingMotion === option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {gisOrgan === 'SafraYollari' && (
                  <>
                    <label className="block font-semibold text-slate-300">
                      {lang === 'tr' ? 'Tedavi bağlamı' : 'Treatment setting'}
                      <select value={biliaryTreatmentSetting} onChange={event => setBiliaryTreatmentSetting(event.currentTarget.value as typeof biliaryTreatmentSetting)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#131f33] p-2 text-slate-100">
                        <option value="adjuvant">{lang === 'tr' ? 'Postoperatif yüksek risk / adjuvan' : 'Postoperative high-risk / adjuvant'}</option>
                        <option value="unresectable">{lang === 'tr' ? 'İnoperabl lokal ileri' : 'Unresectable locally advanced'}</option>
                      </select>
                    </label>
                    {biliaryTreatmentSetting === 'adjuvant' && (
                      <div>
                        <span className="mb-1 block font-semibold text-slate-300">{lang === 'tr' ? 'Rezeksiyon marjini' : 'Resection margin'}</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['R0', 'R1'] as const).map(value => (
                            <button key={value} type="button" aria-pressed={biliaryMarginStatus === value} onClick={() => setBiliaryMarginStatus(value)} className={parameterButtonClass(biliaryMarginStatus === value)}>{value}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
      {selectedOrgan === 'gis' && gisOrgan === 'Rektum' && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-amber-300 font-mono">
                            CRM: {gisCrmStatus}
                          </span>
                        </>
                      )}
    </>
  );
}
