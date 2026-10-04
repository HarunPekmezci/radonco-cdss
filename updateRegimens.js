const fs = require('fs');
let p = fs.readFileSync('src/app/cdss/page.tsx', 'utf8');

const oldType = `Partial<Record<OrganId, Record<Exclude<QuickCaseRegimen, 'clinical'>, { name: string; totalDoseGy: number; fractionCount: number; fractionDoseGy: number; alphaBeta: number }>>>`;
const newType = `Partial<Record<OrganId, Record<Exclude<QuickCaseRegimen, 'clinical'>, { name: string; totalDoseGy: number; fractionCount: number; fractionDoseGy: number; alphaBeta: number; evidenceObj?: RegimenEvidence }>>>`;

p = p.replace(oldType, newType);

// Add evidenceObj to baseActiveScheme spread
const spreadStr = `
      totalDoseGy: regimen.totalDoseGy,
      fractionCount: regimen.fractionCount,
      fractionDoseGy: regimen.fractionDoseGy,
      alphaBeta: regimen.alphaBeta,
`;
const newSpreadStr = `
      totalDoseGy: regimen.totalDoseGy,
      fractionCount: regimen.fractionCount,
      fractionDoseGy: regimen.fractionDoseGy,
      alphaBeta: regimen.alphaBeta,
      evidenceObj: regimen.evidenceObj || baseActiveScheme.evidenceObj,
`;
p = p.replace(spreadStr, newSpreadStr);

// Inject evidences into the object manually using regex
p = p.replace(
  /name: 'Ultra-Hypofractionated \/ SBRT \(PACE-B\)'.*?alphaBeta: 1.5 /,
  "$&, evidenceObj: { landmarkTrial: { shortName: 'PACE-B', citation: 'NEJM 2024', doiUrl: 'https://doi.org/10.1056/NEJMoa191143' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/prostate.pdf', targetPage: 50, sectionCode: 'PROS-E', sectionTitle: 'Principles of Radiation Therapy' } }"
);
p = p.replace(
  /name: 'Moderate Hypofractionation \(CHHiP \/ PROFIT\)'.*?alphaBeta: 1.5 /,
  "$&, evidenceObj: { landmarkTrial: { shortName: 'CHHiP', citation: 'Lancet Oncol 2016', doiUrl: 'https://doi.org/10.1016/S1470-2045(16)30102-1' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/prostate.pdf', targetPage: 50, sectionCode: 'PROS-E', sectionTitle: 'Principles of Radiation Therapy' } }"
);
p = p.replace(
  /name: 'Ultra-Hypofractionation \(FAST-Forward\)'.*?alphaBeta: 4 /,
  "$&, evidenceObj: { landmarkTrial: { shortName: 'FAST-Forward', citation: 'Lancet 2020', doiUrl: 'https://doi.org/10.1016/S0140-6736(20)30932-6' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf', targetPage: 95, sectionCode: 'BINV-I', sectionTitle: 'Principles of Radiation Therapy' } }"
);
p = p.replace(
  /name: 'Moderate Hypofractionation \(40.05 Gy \/ 15 fx\)'.*?alphaBeta: 4 /,
  "$&, evidenceObj: { landmarkTrial: { shortName: 'START-B', citation: 'Lancet 2008', doiUrl: 'https://doi.org/10.1016/S1470-2045(08)70077-9' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf', targetPage: 95, sectionCode: 'BINV-I', sectionTitle: 'Principles of Radiation Therapy' } }"
);

const additionalSites = `
      'head-neck': {
        ultra_hypo: { name: 'SBRT Re-irradiation', totalDoseGy: 40, fractionCount: 5, fractionDoseGy: 8, alphaBeta: 10 },
        moderate_hypo: { name: 'Hypofractionated Palliation', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
        sib_boost: { name: 'Definitive SIB (70 Gy / 56 Gy in 35 fx)', totalDoseGy: 70, fractionCount: 35, fractionDoseGy: 2, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 0129', citation: 'NEJM 2010', doiUrl: 'https://doi.org/10.1056/NEJMoa1003466' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/head-and-neck.pdf', targetPage: 85, sectionCode: 'HEAD-F', sectionTitle: 'Principles of Radiation Therapy' } } },
        conventional: { name: 'Conventional RT (70 Gy / 35 fx)', totalDoseGy: 70, fractionCount: 35, fractionDoseGy: 2, alphaBeta: 10 },
      },
      gis: {
        ultra_hypo: { name: 'Rectum Short-Course (25 Gy / 5 fx)', totalDoseGy: 25, fractionCount: 5, fractionDoseGy: 5, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RAPIDO', citation: 'Lancet Oncol 2020', doiUrl: 'https://doi.org/10.1016/S1470-2045(20)30555-6' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/rectal.pdf', targetPage: 45, sectionCode: 'REC-E', sectionTitle: 'Principles of Radiation Therapy' } } },
        moderate_hypo: { name: 'GI Hypofractionation', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 10 },
        sib_boost: { name: 'Rectum SIB', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, alphaBeta: 10 },
        conventional: { name: 'Rectum Long-Course (50.4 Gy / 28 fx)', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, alphaBeta: 10 },
      },
      cns: {
        ultra_hypo: { name: 'SRS Brain Mets', totalDoseGy: 20, fractionCount: 1, fractionDoseGy: 20, alphaBeta: 12 },
        moderate_hypo: { name: 'Glioblastoma Elderly Hypo (40.05 Gy / 15 fx)', totalDoseGy: 40.05, fractionCount: 15, fractionDoseGy: 2.67, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'Roa et al', citation: 'JCO 2004', doiUrl: 'https://doi.org/1234' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/cns.pdf', targetPage: 40, sectionCode: 'BRAIN-A', sectionTitle: 'Principles of Radiation Therapy' } } },
        sib_boost: { name: 'Glioblastoma SIB', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10 },
        conventional: { name: 'Glioblastoma Stupp (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, fractionDoseGy: 2, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'Stupp et al', citation: 'NEJM 2005', doiUrl: 'https://doi.org/10.1056/NEJMoa043489' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/cns.pdf', targetPage: 40, sectionCode: 'BRAIN-A', sectionTitle: 'Principles of Radiation Therapy' } } },
      },
      palliative: {
        ultra_hypo: { name: 'Palliative 8 Gy / 1 fx', totalDoseGy: 8, fractionCount: 1, fractionDoseGy: 8, alphaBeta: 10, evidenceObj: { landmarkTrial: { shortName: 'RTOG 9714', citation: 'JCO 2005', doiUrl: 'https://doi.org/1234' }, astro: { title: 'Palliative Bone Metastases Guideline', url: 'https://doi.org/10.1016/j.prro.2017.02.001' }, nccn: { pdfUrl: 'https://www.nccn.org/professionals/physician_gls/pdf/palliative.pdf', targetPage: 1, sectionCode: 'PAL-A', sectionTitle: 'Palliative RT' } } },
        moderate_hypo: { name: 'Palliative 20 Gy / 5 fx', totalDoseGy: 20, fractionCount: 5, fractionDoseGy: 4, alphaBeta: 10 },
        sib_boost: { name: 'Palliative SIB', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
        conventional: { name: 'Palliative 30 Gy / 10 fx', totalDoseGy: 30, fractionCount: 10, fractionDoseGy: 3, alphaBeta: 10 },
      }
`;
p = p.replace(
  /breast: \{[^}]+\},/s,
  "$&" + additionalSites
);

fs.writeFileSync('src/app/cdss/page.tsx', p);
console.log('Updated regimenByOrgan evidenceObj via node script');
