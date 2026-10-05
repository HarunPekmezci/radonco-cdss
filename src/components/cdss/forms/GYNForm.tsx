import React from 'react';

import { Check } from "lucide-react";

export interface GYNFormProps {
  parameterButtonClass: any;
  prostateRiskLabel?: any;
  selectedOrgan: any;
  gynSite: any;
  tText: any;
  cervixScenario: any;
  parseOption: any;
  setCervixScenario: any;
  endoRisk: any;
  setEndoRisk: any;
  ovaryScenario: any;
  setOvaryScenario: any;
  vulvaScenario: any;
  setVulvaScenario: any;
}

export default function GYNForm({ parameterButtonClass, prostateRiskLabel, selectedOrgan, gynSite, tText, cervixScenario, parseOption, setCervixScenario, endoRisk, setEndoRisk, ovaryScenario, setOvaryScenario, vulvaScenario, setVulvaScenario }: GYNFormProps) {
  return (
    <>
      {selectedOrgan === 'gynecology' && gynSite === 'Serviks' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Klinik Senaryo")}</label>
                <select
                  value={cervixScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Definitif_KRT', 'Adjuvan_Peters', 'Adjuvan_Sedlis'] as const);
                    if (value) setCervixScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Definitif_KRT">{tText("Definitif KRT + 3D IGABT (Lokal İleri)")}</option>
                  <option value="Adjuvan_Peters">{tText("Cerrahi Sonrası Yüksek Risk (Peters: R1/LN+/Parametrium)")}</option>
                  <option value="Adjuvan_Sedlis">{tText("Cerrahi Sonrası Orta Risk (Sedlis: LVSI/Derin İnvazyon)")}</option>
                </select>
              </div>
            )}
      {selectedOrgan === 'gynecology' && gynSite === 'Endometriyum' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Endometriyum Risk Grubu (PORTEC)")}</label>
                <select
                  value={endoRisk}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Low', 'Intermediate', 'High_Intermediate', 'High'] as const);
                    if (value) setEndoRisk(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full font-medium"
                >
                  <option value="Low">{tText("Düşük Risk (Evre IA G1-2, LVSI yok - İzlem)")}</option>
                  <option value="Intermediate">{tText("Orta Risk (Evre IB G1-2 veya IA G3)")}</option>
                  <option value="High_Intermediate">{tText("Yüksek-Orta Risk (PORTEC-2: Yalnızca VCB Brakiterapisi)")}</option>
                  <option value="High">{tText("Yüksek Risk (Evre III / Seröz / Derin İnvazyon - PORTEC-3 KRT)")}</option>
                </select>
              </div>
            )}
      {selectedOrgan === 'gynecology' && gynSite === 'Over_Tuba' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Radyoterapi Amacı")}</label>
                <select
                  value={ovaryScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Oligometastatik_SBRT', 'Palyatif_Kitle_Agri'] as const);
                    if (value) setOvaryScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Oligometastatik_SBRT">{tText("Oligometastatik Nüks SBRT (1-3 odak ablasyonu)")}</option>
                  <option value="Palyatif_Kitle_Agri">{tText("Palyatif Pelvik Kitle / Hemostaz RT")}</option>
                </select>
              </div>
            )}
      {selectedOrgan === 'gynecology' && gynSite === 'Vulva' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <label className="text-slate-600 block mb-1">{tText("Klinik Evre / Cerrahi")}</label>
                <select
                  value={vulvaScenario}
                  onChange={e => {
                    const value = parseOption(e.currentTarget.value, ['Adjuvan_Cerrahi_Sonrasi', 'Inoperabl_Lokal_Ileri'] as const);
                    if (value) setVulvaScenario(value);
                  }}
                  className="bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-900 w-full"
                >
                  <option value="Adjuvan_Cerrahi_Sonrasi">{tText("Cerrahi Sonrası Adjuvan (<8 mm sınır veya Kasık LN+ / ENE)")}</option>
                  <option value="Inoperabl_Lokal_Ileri">{tText("İnoperabl / Lokal İleri Definitif KRT")}</option>
                </select>
              </div>
            )}
    </>
  );
}
