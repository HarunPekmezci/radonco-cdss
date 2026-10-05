import React from 'react';

import { Check } from "lucide-react";

export interface BreastFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  tText: any;
  breastMenopause: any;
  setBreastMenopause: any;
  breastSurgery: any;
  parseOption: any;
  setBreastSurgery: any;
  breastMargin: any;
  setBreastMargin: any;
  breastHistology: any;
  phyllodesMarginCm: any;
  setPhyllodesMarginCm: any;
  phyllodesHighGrade: any;
  setPhyllodesHighGrade: any;
  breastBoost: any;
  setBreastBoost: any;
  breastER: any;
  setBreastER: any;
  breastPR: any;
  setBreastPR: any;
  breastHER2: any;
  setBreastHER2: any;
  breastKi67: any;
  setBreastKi67: any;
  breastGrade: any;
  setBreastGrade: any;
}

export default function BreastForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, tText, breastMenopause, setBreastMenopause, breastSurgery, parseOption, setBreastSurgery, breastMargin, setBreastMargin, breastHistology, phyllodesMarginCm, setPhyllodesMarginCm, phyllodesHighGrade, setPhyllodesHighGrade, breastBoost, setBreastBoost, breastER, setBreastER, breastPR, setBreastPR, breastHER2, setBreastHER2, breastKi67, setBreastKi67, breastGrade, setBreastGrade }: BreastFormProps) {
  return (
    <>
      {selectedOrgan === 'breast' && (
              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">{tText("Menopoz durumu")}</label>
                  <div role="group" aria-label="Menopoz durumu" className="grid grid-cols-2 gap-1.5">
                    {(['Premenopozal', 'Postmenopozal'] as const).map(value => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={breastMenopause === value}
                        onClick={() => setBreastMenopause(value)}
                        className={parameterButtonClass(breastMenopause === value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Cerrahi")}</label>
                    <select
                      value={breastSurgery}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['MKC', 'Mastektomi'] as const);
                        if (value) setBreastSurgery(value);
                      }}
                      className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                    >
                      <option value="MKC">{tText("MKC (Lumpektomi)")}</option>
                      <option value="Mastektomi">{tText("Mastektomi")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{tText("Cerrahi Sınır")}</label>
                    <select
                      value={breastMargin}
                      onChange={e => {
                        const value = parseOption(e.currentTarget.value, ['Negatif', 'Yakin', 'Pozitif'] as const);
                        if (value) setBreastMargin(value);
                      }}
                      className="bg-white border border-slate-300 rounded-md p-2 text-slate-900 w-full"
                    >
                      <option value="Negatif">{tText("Negatif (≥2 mm)")}</option>
                      <option value="Yakin">{tText("Yakın (<2 mm)")}</option>
                      <option value="Pozitif">{tText("Pozitif (R1)")}</option>
                    </select>
                  </div>
                </div>
                {breastHistology === 'Malign Filloides Tümörü' ? (
                  <div className="space-y-2">
                    <label className="text-slate-600 block">{tText("En yakın cerrahi marjin (cm)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={phyllodesMarginCm}
                      onChange={e => setPhyllodesMarginCm(e.currentTarget.value)}
                      className="bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 w-full"
                    />
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={phyllodesHighGrade} onChange={e => setPhyllodesHighGrade(e.currentTarget.checked)} />
                      {tText("\n                      Yüksek dereceli stromal aşırı büyüme\n                    ")}</label>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" checked={breastBoost} onChange={e => setBreastBoost(e.currentTarget.checked)} />
                      {tText("\n                      Tümör yatağı boostu (10-16 Gy) uygula\n                    ")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'ER', value: breastER, setter: setBreastER },
                        { label: 'PR', value: breastPR, setter: setBreastPR },
                        { label: 'HER2', value: breastHER2, setter: setBreastHER2 },
                      ].map(marker => (
                        <button
                            key={marker.label}
                            type="button"
                            aria-pressed={marker.value}
                            aria-label={`${marker.label} ${marker.value ? 'pozitif' : 'negatif'}`}
                            onClick={() => marker.setter(!marker.value)}
                            className={parameterButtonClass(marker.value)}
                          >
                            {marker.value && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {marker.label}{marker.value ? '+' : '-'}
                        </button>
                      ))}
                      <div role="group" aria-label="Ki-67" className="col-span-2 grid grid-cols-2 gap-1.5">
                        {[
                          { label: '<20%', value: 'Low' },
                          { label: '≥20%', value: 'High' },
                        ].map(option => {
                          const selected = (Number.parseFloat(breastKi67) >= 20) === (option.value === 'High');
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setBreastKi67(option.value === 'High' ? '20' : '19')}
                              className={parameterButtonClass(selected)}
                            >
                              {tText("\n                              Ki-67 ")}{tText(option.label)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block text-slate-600">
                      {tText("\n                      Histolojik Grade\n                      ")}<select
                        value={breastGrade}
                        onChange={e => {
                          const value = parseOption(e.currentTarget.value, ['1', '2', '3'] as const);
                          if (value) setBreastGrade(value);
                        }}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900"
                      >
                        <option value="1">{tText("Grade 1")}</option>
                        <option value="2">{tText("Grade 2")}</option>
                        <option value="3">{tText("Grade 3")}</option>
                      </select>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {tText("\n                      Biyobelirteçler sistemik tedavi kararında onkoloji ekibiyle birlikte yorumlanır.\n                    ")}</p>
                  </>
                )}
              </div>
            )}
    </>
  );
}
