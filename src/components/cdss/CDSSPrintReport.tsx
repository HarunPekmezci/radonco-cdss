import React from 'react';

export interface CDSSPrintReportProps {
  lang: 'tr' | 'en';
  printMetadata: { timestamp: string; reportId: string };
  patientId: string;
  patientAgeYears: string | number;
  patientGender: string;
  reportOrganNames: Record<string, string>;
  selectedOrgan: string;
  reportDiagnosis: string;
  reportHistology: string;
  reportMolecular: string;
  isBenign: boolean;
  selectedT: string;
  selectedN: string;
  selectedM: string;
  evaluatedDecision: any;
  activeScheme: any;
  breathingMotion: string;
  radiobiology: any;
  clinicallyRelevantOars: any[];
  tText: (text: any) => string | React.ReactNode;
}

export default function CDSSPrintReport({
  lang,
  printMetadata,
  patientId,
  patientAgeYears,
  patientGender,
  reportOrganNames,
  selectedOrgan,
  reportDiagnosis,
  reportHistology,
  reportMolecular,
  isBenign,
  selectedT,
  selectedN,
  selectedM,
  evaluatedDecision,
  activeScheme,
  breathingMotion,
  radiobiology,
  clinicallyRelevantOars,
  tText
}: CDSSPrintReportProps) {
  return (
    <article id="print-report" className="hidden print:block" aria-label={lang === 'tr' ? 'Multidisipliner tümör konseyi raporu' : 'Multidisciplinary tumor board summary'}>
      <header className="print-report-header">
        <div>
          <div className="font-bold">RadOnc CDSS — {lang === 'tr' ? 'Klinik Karar Destek Platformu' : 'Clinical Decision Support Platform'}</div>
          <div className="text-[8pt]">{lang === 'tr' ? 'Multidisipliner Onkoloji Konsey Raporu' : 'Multidisciplinary Oncology Board Summary'}</div>
        </div>
        <div className="text-right text-[8pt]">
          <div>{printMetadata.timestamp || '—'}</div>
          <div>{lang === 'tr' ? 'Rapor No' : 'Report No'}: {printMetadata.reportId || '—'}</div>
        </div>
      </header>

      <section className="print-report-section">
        <h2>1. {lang === 'tr' ? 'Hasta ve Patolojik Tanı' : 'Patient and Pathologic Diagnosis'}</h2>
        <table className="print-report-table">
          <tbody>
            <tr>
              <th>{lang === 'tr' ? 'T.C. Kimlik No / Hasta No' : 'National ID / Patient MRN'}</th><td>{patientId || '—'}</td>
              <th>{lang === 'tr' ? 'Yaş / Cinsiyet' : 'Age / Gender'}</th><td>{patientAgeYears ? `${patientAgeYears} ${lang === 'tr' ? 'yaş' : 'yo'}` : '—'}{patientGender ? ` / ${patientGender === 'Erkek' ? (lang === 'tr' ? 'Erkek' : 'Male') : patientGender === 'Kadın' ? (lang === 'tr' ? 'Kadın' : 'Female') : (lang === 'tr' ? 'Diğer' : 'Other')}` : ''}</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Anatomik Bölge' : 'Anatomic Site'}</th><td>{reportOrganNames[selectedOrgan]}</td>
              <th>{lang === 'tr' ? 'Tanı / Alt Tip' : 'Diagnosis / Subsite'}</th><td>{reportDiagnosis}</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Histoloji' : 'Histology'}</th><td colSpan={3}>{reportHistology}</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Moleküler / Klinik Parametreler' : 'Molecular / Clinical Parameters'}</th><td colSpan={3}>{reportMolecular}</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Klinik Evre' : 'Clinical Stage'}</th><td colSpan={3}>{isBenign || selectedOrgan === 'emergencies' || selectedOrgan === 'palliative' ? (lang === 'tr' ? 'Uygulanmaz' : 'Not applicable') : `${selectedT} ${selectedN} ${selectedM}`} • {evaluatedDecision?.statusText ? tText(evaluatedDecision.statusText) : ''}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="print-report-section">
        <h2>2. {lang === 'tr' ? 'Endike Radyoterapi ve Fraksiyonasyon Kararı' : 'Radiotherapy and Fractionation Recommendation'}</h2>
        <table className="print-report-table">
          <tbody>
            <tr>
              <th>{lang === 'tr' ? 'Reçete' : 'Prescription'}</th><td>{tText(activeScheme.name)}</td>
              <th>{lang === 'tr' ? 'Doz / Fraksiyon' : 'Dose / Fractions'}</th><td>{activeScheme.totalDoseGy} Gy / {activeScheme.fractionCount} × {activeScheme.fractionDoseGy} Gy</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Teknik' : 'Technique'}</th><td>{tText(activeScheme.technique)}</td>
              <th>{lang === 'tr' ? 'Solunum Yönetimi' : 'Motion Management'}</th><td>{selectedOrgan === 'thorax' || selectedOrgan === 'breast' ? tText(breathingMotion) : '—'}</td>
            </tr>
            <tr>
              <th>BED (α/β = {radiobiology.ab})</th><td>{radiobiology.bed} Gy</td>
              <th>EQD2</th><td>{radiobiology.eqd2} Gy</td>
            </tr>
            <tr>
              <th>{lang === 'tr' ? 'Sistemik Tedavi' : 'Systemic Therapy'}</th><td colSpan={3}>{tText(activeScheme.systemicTherapy || '—')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="print-report-section print-report-tables">
        <div>
          <h2>3a. {lang === 'tr' ? 'TCP Hedef Reçetesi ve Hacimler (ICRU 83)' : 'TCP Target Prescription and Volumes (ICRU 83)'}</h2>
          <table className="print-report-table">
            <thead><tr><th>{lang === 'tr' ? 'Hacim' : 'Volume'}</th><th>{lang === 'tr' ? 'Doz' : 'Dose'}</th><th>{lang === 'tr' ? 'Marjin' : 'Margin'}</th><th>{lang === 'tr' ? 'Anatomi' : 'Anatomy'}</th></tr></thead>
            <tbody>
              {activeScheme.targetVolumes.map((volume: any, index: number) => (
                <tr key={`${volume.name}-${index}`}><td>{tText(volume.name)}</td><td>{volume.doseGy} Gy</td><td>{volume.marginMm}</td><td>{tText(volume.anatomical)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>3b. {lang === 'tr' ? 'OAR NTCP Tolerans Tavanları' : 'OAR NTCP Tolerance Ceilings'}</h2>
          <table className="print-report-table">
            <thead><tr><th>{lang === 'tr' ? 'Organ' : 'Organ'}</th><th>{lang === 'tr' ? 'Ölçüt' : 'Metric'}</th><th>{lang === 'tr' ? 'Sınır' : 'Limit'}</th><th>{lang === 'tr' ? 'Kaynak' : 'Source'}</th></tr></thead>
            <tbody>
                {clinicallyRelevantOars.map((oar: any, index: number) => (
                <tr key={`${oar.organ}-${index}`}><td>{tText(oar.organ)}</td><td>{tText(oar.metric)}{oar.context && <span className="block text-[6pt]">{lang === 'tr' ? oar.context : oar.contextEn || oar.context}</span>}</td><td>{oar.limit}</td><td>{tText(oar.source)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="print-report-section print-report-evidence">
        <h2>4. {lang === 'tr' ? 'Kanıt Düzeyi ve Hekim İmzası' : 'Evidence and Physician Sign-off'}</h2>
        <div><strong>{lang === 'tr' ? 'Kanıt / Kılavuz:' : 'Evidence / Guideline:'}</strong> {tText(activeScheme.evidence)}</div>
        <div className="print-report-signature">
          <div className="signature-line" />
          <strong>{lang === 'tr' ? 'Sorumlu Radyasyon Onkoloğu: Dr. Harun PEKMEZCİ, MD' : 'Attending Radiation Oncologist: Dr. Harun PEKMEZCİ, MD'}</strong>
        </div>
      </section>
      <footer className="print-report-footer">
        {lang === 'tr'
          ? 'Klinik karar destek çıktısıdır; nihai tedavi kararı sorumlu hekim ve multidisipliner konsey değerlendirmesine tabidir.'
          : 'Clinical decision-support output only; final treatment decisions remain subject to physician judgment and multidisciplinary review.'}
      </footer>
    </article>
  );
}
