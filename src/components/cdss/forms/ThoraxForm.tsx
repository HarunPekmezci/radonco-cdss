import React from 'react';

import { Check } from "lucide-react";

export interface ThoraxFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  thoraxSubtype: any;
  lang: any;
  parseOption: any;
  setThoraxCentrality: any;
  thoraxCentrality: any;
  tText: any;
  thoraxSurgeryStatus: any;
  setThoraxSurgeryStatus: any;
  selectedM: any;
  selectedN: any;
  selectedT: any;
  breathingMotion: any;
  setBreathingMotion: any;
  thymicHistology: any;
  setThymicHistology: any;
  thymomaStage: any;
  setThymomaStage: any;
  thymomaMargin: any;
  setThymomaMargin: any;
  setMesoIntent: any;
  mesoIntent: any;
  setSclcStage: any;
  sclcStage: any;
  sclcTiming: any;
  setSclcTiming: any;
}

export default function ThoraxForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, thoraxSubtype, lang, parseOption, setThoraxCentrality, thoraxCentrality, tText, thoraxSurgeryStatus, setThoraxSurgeryStatus, selectedM, selectedN, selectedT, breathingMotion, setBreathingMotion, thymicHistology, setThymicHistology, thymomaStage, setThymomaStage, thymomaMargin, setThymomaMargin, setMesoIntent, mesoIntent, setSclcStage, sclcStage, sclcTiming, setSclcTiming }: ThoraxFormProps) {
  return (
    <>
      {selectedOrgan === 'thorax' && thoraxSubtype === 'nsclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tümör Yerleşimi (Santralite)' : 'Tumor Centrality / Location'}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Peripheral', label: lang === 'tr' ? 'Periferik' : 'Peripheral' },
                      { id: 'Central', label: lang === 'tr' ? 'Santral' : 'Central' },
                      { id: 'UltraCentral', label: lang === 'tr' ? 'Ultrasantral' : 'Ultracentral' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const value = parseOption(item.id, ['Peripheral', 'Central', 'UltraCentral'] as const);
                          if (value) setThoraxCentrality(value);
                        }}
                        className={parameterButtonClass(thoraxCentrality === item.id)}
                      >
                        {tText(item.label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Cerrahi / Operabilite Durumu' : 'Surgical / Operability Status'}</label>
                  <select
                    value={thoraxSurgeryStatus}
                    onChange={e => {
                      const value = parseOption(e.currentTarget.value, ['Inoperable', 'Operable', 'Postop_R0', 'Postop_R1_R2'] as const);
                      if (value) setThoraxSurgeryStatus(value);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                  >
                    <option value="Inoperable">{lang === 'tr' ? 'Medikal İnoperabl / Cerrahi Red' : 'Medically Inoperable / Surgical Refusal'}</option>
                    <option value="Operable">{lang === 'tr' ? 'Medikal Operabl' : 'Medically Operable'}</option>
                    <option value="Postop_R0">{lang === 'tr' ? 'Postoperatif R0 Rezeksiyon' : 'Postoperative R0 Resection'}</option>
                    <option value="Postop_R1_R2">{lang === 'tr' ? 'Postoperatif R1 / R2 Rezeksiyon' : 'Postoperative R1 / R2 Resection'}</option>
                  </select>
                </div>
                {selectedM === 'M0' && selectedN === 'N0' && (selectedT.startsWith('T1') || selectedT === 'T2') && (
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
                )}
              </div>
            )}
      {selectedOrgan === 'thorax' && thoraxSubtype === 'thymoma' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="mb-1 block font-semibold text-slate-300">
                    {lang === 'tr' ? 'Histolojik Alt Tip' : 'Histologic Subtype'}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {[
                      { value: 'thymoma' as const, label: lang === 'tr' ? 'Timoma · WHO A–B3' : 'Thymoma · WHO A–B3' },
                      { value: 'thymic-carcinoma' as const, label: lang === 'tr' ? 'Timik Karsinom · Tip C' : 'Thymic Carcinoma · Type C' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={thymicHistology === option.value}
                        onClick={() => setThymicHistology(option.value)}
                        className={`rounded-lg border p-2 text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          thymicHistology === option.value
                            ? 'border-blue-400 bg-blue-600 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {thymicHistology === 'thymoma' && (
                  <>
                    <label className="font-medium text-slate-300">
                      {lang === 'tr' ? 'Masaoka-Koga Evresi' : 'Masaoka-Koga Stage'}
                      <select
                        value={thymomaStage}
                        onChange={event => setThymomaStage(event.currentTarget.value as typeof thymomaStage)}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100"
                      >
                        <option value="Masaoka_I">Evre I</option>
                        <option value="Masaoka_II">Evre II</option>
                        <option value="Masaoka_III">Evre III</option>
                        <option value="Masaoka_IV">Evre IV</option>
                      </select>
                    </label>
                    <label className="font-medium text-slate-300">
                      {lang === 'tr' ? 'Cerrahi Sınır' : 'Surgical Margin'}
                      <select
                        value={thymomaMargin}
                        onChange={event => setThymomaMargin(event.currentTarget.value as typeof thymomaMargin)}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100"
                      >
                        <option value="R0">R0 — Negatif</option>
                        <option value="R1">R1 — Mikroskobik Pozitif</option>
                        <option value="R2">R2 — Makroskobik Rezidü</option>
                      </select>
                    </label>
                  </>
                )}
              </div>
            )}
      {selectedOrgan === 'thorax' && thoraxSubtype === 'mesothelioma' && (
              <div className="flex flex-col gap-2 text-xs">
                <label className="text-slate-600 block mb-1">{lang === 'tr' ? 'Tedavi Amacı / Cerrahi Durum' : 'Treatment Intent / Surgical Status'}</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'Palyatif', label: lang === 'tr' ? 'Palyatif Semptom Kontrolü (30 Gy/10 fx)' : 'Palliative Symptom Control (30 Gy/10 fx)' },
                    { id: 'Hemitorasik_Postop', label: lang === 'tr' ? 'Adjuvan Hemitorasik RT (P/D veya EPD Sonrası)' : 'Adjuvant Hemithoracic RT (post P/D or EPD)' },
                    { id: 'Dren_Yeri', label: lang === 'tr' ? 'Girişim / Dren Yeri Profilaksisi (21 Gy/3 fx)' : 'Procedure / Drain Tract Prophylaxis (21 Gy/3 fx)' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const value = parseOption(item.id, ['Palyatif', 'Hemitorasik_Postop', 'Dren_Yeri'] as const);
                        if (value) setMesoIntent(value);
                      }}
                      className={parameterButtonClass(mesoIntent === item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
      {selectedOrgan === 'thorax' && thoraxSubtype === 'sclc' && (
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("KHAK Klinik Evresi")}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'Sinirli', label: 'Sınırlı Evre (LS-SCLC)' },
                      { id: 'Yaygin', label: 'Yaygın Evre (ES-SCLC)' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const value = parseOption(item.id, ['Sinirli', 'Yaygin'] as const);
                          if (value) setSclcStage(value);
                        }}
                        className={parameterButtonClass(sclcStage === item.id)}
                      >
                        {tText(item.label)}
                      </button>
                    ))}
                  </div>
                </div>
                {sclcStage === 'Sinirli' && (
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Fraksiyonasyon Rejimi")}</label>
                    <select
                      value={sclcTiming}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['Erken_BID_45Gy', 'Standart_QD_60Gy'] as const);
                        if (value) setSclcTiming(value);
                      }}
                      className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                    >
                      <option value="Erken_BID_45Gy">{tText("45 Gy / 30 fx (Günde 2x1.5 Gy - Turrisi Altın Standart)")}</option>
                      <option value="Standart_QD_60Gy">{tText("60 Gy / 30 fx (Günde tek 2.0 Gy - CONVERT)")}</option>
                    </select>
                  </div>
                )}
              </div>
            )}
      {selectedOrgan === 'thorax' && thoraxCentrality && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-amber-300 font-mono">
                            {thoraxCentrality}
                          </span>
                        </>
                      )}
    </>
  );
}
