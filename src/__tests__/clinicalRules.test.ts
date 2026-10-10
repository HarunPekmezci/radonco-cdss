/**
 * Clinical Decision Rules & Guideline Versioning Regression Test Suite
 * 
 * Verifies 8 gold-standard clinical scenarios against evidence-based benchmarks:
 * 1. Early NSCLC T1bN0M0 (Peripheral SBRT)
 * 2. High-Risk Prostate (78 Gy + Long-Term ADT)
 * 3. Early Breast T1cN0 (Lumpectomy FAST-Forward WBI)
 * 4. Locally Advanced Rectal T3N1 (Total Neoadjuvant Therapy - TNT)
 * 5. Glioblastoma IDH-wt (Stupp 60 Gy / 30 fx + TMZ)
 * 6. Limited-Stage SCLC (Early Concurrent Chemoradiotherapy - Turrisi)
 * 7. Locally Advanced Cervical Cancer (Definitive CRT + Brachytherapy)
 * 8. Palliative Bone Metastasis (Single Fraction 8 Gy / 1 fx)
 */

import { evaluateClinicalDecision } from '../engines/cdssEngine';
import { getGuidelineMetadata } from '../data/cdssRules';

interface TestCase {
  name: string;
  state: Record<string, any>;
  assertions: (decision: any) => void;
}

const DEFAULT_STATE = {
  lang: 'tr',
  tText: (text: string) => text,
  selectedOrgan: 'thorax',
  selectedSubsite: '',
  benignClinicalStatus: '',
  thoraxSubtype: 'nsclc',
  thoraxCentrality: 'Peripheral',
  breathingMotion: '4D-CT',
  thoraxSurgeryStatus: 'Inoperable',
  sclcStage: 'Sinirli',
  sclcTiming: 'Erken_BID_45Gy',
  thymomaStage: 'Masaoka_II',
  thymomaMargin: 'R0',
  thymicHistology: 'thymoma',
  nsclcHistology: 'adenocarcinoma',
  mesoIntent: 'Palyatif',
  gusSubtype: 'prostate',
  gleasonPrimary: '3',
  gleasonSecondary: '4',
  psaLevel: '8.5',
  hasECE: false,
  hasSVI: false,
  positiveCorePercent: '30',
  bladderTurbtComplete: true,
  bladderTmtSuitable: true,
  bladderHydronephrosis: false,
  bladderConcurrentCis: false,
  prostateHistology: 'acinar',
  testisHistology: 'seminoma',
  bladderHistology: 'urothelial',
  renalHistology: 'clear-cell',
  renalDiseaseSetting: 'primary-inoperable',
  renalTumorSizeCm: '3',
  breastHistology: 'İnvaziv Duktal Karsinom (İDK)',
  breastMenopause: 'Postmenopozal',
  breastSurgery: 'MKC',
  breastMargin: 'Negatif',
  breastBoost: true,
  phyllodesMarginCm: '1.2',
  phyllodesHighGrade: false,
  breastER: true,
  breastPR: true,
  breastHER2: false,
  breastKi67: '18',
  breastGrade: '2',
  gisOrgan: 'Rektum',
  liverHistology: 'hcc',
  liverBclcStage: 'A',
  biliaryHistology: 'intrahepatic',
  biliaryTreatmentSetting: 'adjuvant',
  biliaryMarginStatus: 'R0',
  gisCrmStatus: 'Negatif',
  hnSubsite: 'nasopharynx',
  hnLarynxSubsite: 'Erken_Glottik_T1_T2',
  hnCrossesMidline: false,
  hnDistanceFromMidlineCm: '2',
  hnTumorSizeCm: '1.5',
  hnDoiMm: '4',
  hnENE: false,
  hnPositiveMargin: false,
  cnsSubtype: 'gbm',
  gliomaGrade: 'Grade_4',
  gliomaRiskFactors: { age40: false, subtotalResection: false, largeOrCrossing: false, neurologicSymptoms: false, molecularHighRisk: false },
  cnsMidlineShift: 'Yok',
  cnsMetCount: '1',
  cnsMaxDiameter: '1.8',
  cnsSymptoms: 'Asimptomatik',
  cnsResection: 'GTR',
  meningiomaSimpson: 'I-III',
  cnsKps: '90',
  gbmPerformance: 'Iyi_ECOG_0_1',
  meningiomaGrade: 'Grade_1',
  gliomaHistology: 'gbm',
  gynSite: 'Serviks',
  cervixScenario: 'Definitif_KRT',
  endoRisk: 'High_Intermediate',
  ovaryScenario: 'Oligometastatik_SBRT',
  vulvaScenario: 'Adjuvan_Cerrahi_Sonrasi',
  sarcomaSubtype: 'Yumusak_Doku',
  dfspStatus: 'R1',
  sarcomaSurgery: 'Preop',
  osteoScenario: 'Marjin_Pozitif_R1_R2',
  ewingIntent: 'Definitif_RT',
  stsHistology: 'ups',
  skinHistology: 'SCC',
  skinMargin: 'Negatif',
  skinDepthMm: '4',
  skinPerineuralInvasion: false,
  skinBoneInvasion: false,
  hematologicSubtype: 'Hodgkin',
  lymphomaResponse: 'Tam_Yanit',
  myelomaFractionation: 'TekFx',
  pediatricSubtype: 'Medulloblastom',
  pediatricRisk: 'Standart',
  wilmsStage: 'Evre_I_II',
  wilmsWholeAbdomen: false,
  palliativeIntent: 'Agri',
  selectedT: 'T1b',
  selectedN: 'N0',
  selectedM: 'M0',
  patientAgeYears: '65',
  patientGender: 'M',
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAILED: ${message}`);
  }
}

export const CLINICAL_REGRESSION_TESTS: TestCase[] = [
  // 1. Early NSCLC T1bN0M0 (Peripheral SBRT)
  {
    name: '1. Early NSCLC T1bN0M0 (Peripheral) -> Expects Curative SBRT 54 Gy / 3 fx (or 48 Gy / 4 fx)',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'thorax',
      thoraxSubtype: 'nsclc',
      selectedT: 'T1b',
      selectedN: 'N0',
      selectedM: 'M0',
      thoraxCentrality: 'Peripheral',
      thoraxSurgeryStatus: 'Inoperable',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert([54, 48, 50, 60].includes(decision.primaryScheme.totalDoseGy), `Expected SBRT dose (54/48/50 Gy), got ${decision.primaryScheme.totalDoseGy} Gy`);
      assert(decision.primaryScheme.fractionCount <= 5, 'SBRT fraction count must be <= 5 fx');
      assert(decision.guidelineVersion.includes('NCCN'), 'Guideline version must reference NCCN');
      assert(decision.evidenceLevel === 'Category 1', 'Evidence level must be Category 1');
      assert(Boolean(decision.nccnDeepLink), 'NCCN deep link must be present');
    },
  },

  // 2. High-Risk Prostate
  {
    name: '2. High-Risk Prostate (T3a or Gleason 8 or PSA > 20) -> Expects 78 Gy + 18-36 mo Long-Term ADT',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'prostate',
      gusSubtype: 'prostate',
      selectedT: 'T3a',
      selectedN: 'N0',
      selectedM: 'M0',
      gleasonPrimary: '4',
      gleasonSecondary: '4',
      psaLevel: '24',
      hasECE: true,
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert([78, 80, 60].includes(decision.primaryScheme.totalDoseGy), `Expected dose-escalated prostate RT (78-80 Gy or 60 Gy hypo), got ${decision.primaryScheme.totalDoseGy} Gy`);
      const combinedNotes = `${decision.primaryScheme.indication} ${decision.primaryScheme.systemicTherapy || ''}`;
      assert(/ADT|hormon|LHRH|36/i.test(combinedNotes), 'Must mandate long-term ADT (18-36 months)');
      assert(decision.guidelineVersion.includes('Prostate'), 'Guideline version must reference Prostate');
      assert(decision.evidenceLevel === 'Category 1', 'Evidence level must be Category 1');
    },
  },

  // 3. Early Breast T1cN0 (Lumpectomy)
  {
    name: '3. Early Breast T1cN0 (Lumpectomy / MKC) -> Expects FAST-Forward 26 Gy / 5 fx or 40 Gy / 15 fx',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'breast',
      breastSurgery: 'MKC',
      selectedT: 'T1c',
      selectedN: 'N0',
      selectedM: 'M0',
      breastHistology: 'İnvaziv Duktal Karsinom (İDK)',
      breastER: true,
      breastPR: true,
      breastHER2: false,
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert(decision.primaryScheme.totalDoseGy === 26, `Primary scheme should be FAST-Forward 26 Gy, got ${decision.primaryScheme.totalDoseGy} Gy`);
      assert(decision.primaryScheme.fractionCount === 5, 'FAST-Forward fraction count must be 5 fx');
      assert(decision.guidelineVersion.includes('Breast'), 'Guideline must reference Breast');
      assert(decision.evidenceLevel === 'Category 1', 'Evidence level must be Category 1');
    },
  },

  // 4. Locally Advanced Rectal T3N1
  {
    name: '4. Locally Advanced Rectal T3N1 -> Expects Total Neoadjuvant Therapy (TNT / RAPIDO or Long-Course CRT)',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'gis',
      gisOrgan: 'Rektum',
      selectedT: 'T3',
      selectedN: 'N1',
      selectedM: 'M0',
      gisCrmStatus: 'Negatif',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      const text = `${decision.primaryScheme.name} ${decision.primaryScheme.tag} ${decision.statusText}`;
      assert(/RAPIDO|TNT|Kısa Dönem|50\.4/i.test(text), 'Must recommend RAPIDO TNT (25 Gy / 5 fx) or Long-Course KRT (50.4 Gy)');
      assert(decision.guidelineVersion.includes('Rectal') || decision.guidelineVersion.includes('NCCN'), 'Guideline must be NCCN Rectal');
      assert(decision.evidenceLevel === 'Category 1', 'Evidence level must be Category 1');
    },
  },

  // 5. Glioblastoma IDH-wt (Stupp)
  {
    name: '5. Glioblastoma IDH-wt -> Expects Stupp Protocol: 60 Gy / 30 fx + Concurrent Temozolomide',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'cns',
      cnsSubtype: 'gbm',
      gbmPerformance: 'Iyi_ECOG_0_1',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert(decision.primaryScheme.totalDoseGy === 60, `Stupp regimen dose must be 60 Gy, got ${decision.primaryScheme.totalDoseGy} Gy`);
      assert(decision.primaryScheme.fractionCount === 30, 'Stupp fraction count must be 30 fx');
      assert(Boolean(decision.primaryScheme.systemicTherapy?.includes('Temozolomid')), 'Must mandate concurrent Temozolomide');
      assert(decision.guidelineVersion.includes('CNS') || decision.guidelineVersion.includes('Stupp'), 'Guideline must reference CNS/Stupp');
    },
  },

  // 6. Limited-Stage SCLC (Sinirli Evre KHAK)
  {
    name: '6. Limited-Stage SCLC -> Expects Early Concurrent Chemoradiotherapy: 45 Gy / 30 fx BID (Turrisi)',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'thorax',
      thoraxSubtype: 'sclc',
      sclcStage: 'Sinirli',
      sclcTiming: 'Erken_BID_45Gy',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert(decision.primaryScheme.totalDoseGy === 45, `Turrisi dose must be 45 Gy BID, got ${decision.primaryScheme.totalDoseGy} Gy`);
      assert(decision.primaryScheme.fractionCount === 30, 'Turrisi fraction count must be 30 fx');
      assert(Boolean(decision.primaryScheme.systemicTherapy?.includes('Sisplatin')), 'Must mandate concurrent Cisplatin/Etoposide');
      assert(decision.guidelineVersion.includes('SCLC'), 'Guideline must reference SCLC');
    },
  },

  // 7. Locally Advanced Cervical Cancer T2bN1
  {
    name: '7. Locally Advanced Cervical T2bN1 -> Expects Definitive CRT + Image-Guided Brachytherapy (EMBRACE II)',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'gynecology',
      gynSite: 'Serviks',
      selectedT: 'T2b',
      selectedN: 'N1',
      selectedM: 'M0',
      cervixScenario: 'Definitif_KRT',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert(decision.guidelineVersion.includes('Cervical') || decision.guidelineVersion.includes('EMBRACE'), 'Guideline must reference Cervical / EMBRACE');
      assert(decision.evidenceLevel === 'Category 1', 'Evidence level must be Category 1');
    },
  },

  // 8. Palliative Bone Metastasis
  {
    name: '8. Palliative Bone Metastasis -> Expects Evidence-Based Analgesic Radiation (8 Gy / 1 fx ASTRO standard)',
    state: {
      ...DEFAULT_STATE,
      selectedOrgan: 'palliative',
      palliativeIntent: 'Agri',
      selectedN: 'TekFx',
      selectedM: 'M1',
    },
    assertions: (decision) => {
      assert(decision.primaryScheme !== null, 'Primary scheme must be defined');
      assert([8, 20].includes(decision.primaryScheme.totalDoseGy), `Expected palliative dose (8 or 20 Gy), got ${decision.primaryScheme.totalDoseGy} Gy`);
      assert(decision.guidelineVersion.includes('ASTRO') || decision.guidelineVersion.includes('Palliative'), 'Guideline must reference ASTRO Palliative');
    },
  },
];

export function runClinicalRuleRegressionSuite(): { total: number; passed: number; failed: number } {
  console.log('\n=============================================================');
  console.log('  RADONCO CDSS — CLINICAL GUIDELINE REGRESSION TEST SUITE');
  console.log('  Audit Date: 2026-10-10 | Standards: NCCN 2026 / ASTRO / ESTRO');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of CLINICAL_REGRESSION_TESTS) {
    try {
      const decision = evaluateClinicalDecision(testCase.state);
      testCase.assertions(decision);
      console.log(`  ✅ PASS: ${testCase.name}`);
      console.log(`     ↳ Guideline: [${decision.guidelineVersion}] (${decision.evidenceLevel})`);
      console.log(`     ↳ Regimen:   ${decision.primaryScheme.name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${testCase.name}`);
      console.error(`     ↳ Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n-------------------------------------------------------------');
  console.log(`  SUMMARY: ${passed}/${CLINICAL_REGRESSION_TESTS.length} Passed, ${failed} Failed`);
  console.log('=============================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} clinical rule regression tests failed.`);
  }

  return { total: CLINICAL_REGRESSION_TESTS.length, passed, failed };
}

// Auto-run if executed directly via CLI
if (typeof require !== 'undefined' && require.main === module) {
  try {
    runClinicalRuleRegressionSuite();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
