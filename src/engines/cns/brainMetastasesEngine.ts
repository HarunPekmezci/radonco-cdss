import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult,
  ClinicalCaseInput,
  ClinicalRecommendation,
  Fractionation,
  GuidelineReference,
  JsonSchema,
  OARConstraint,
  SystemicTherapyRecommendation,
  TargetVolume,
  TNMStage,
} from '../../types/cdss';

export type BrainMetastasesSetting = 'newly-diagnosed' | 'postoperative' | 'progressive' | 'leptomeningeal' | 'palliative';
export type BrainMetastasesBurden = 'single' | 'oligometastatic' | 'multiple' | 'diffuse' | 'unknown';
export type BrainMetastasesPrimary = 'NSCLC' | 'breast' | 'melanoma' | 'renal-cell' | 'colorectal' | 'other' | 'unknown';
export type BrainMetastasesMolecularFinding = 'EGFR' | 'ALK' | 'ROS1' | 'HER2' | 'BRAF-V600E' | 'RET' | 'MET' | 'KRAS-G12C' | 'PD-L1-positive' | 'none' | 'unknown';
export type MidlineShift = 'none' | 'less-than-5-mm' | 'at-least-5-mm';
export type NeurologicSymptomStatus = 'asymptomatic' | 'deficit-or-raised-icp';

export interface BrainMetastasesInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'brain-metastases';
  setting: BrainMetastasesSetting;
  stage?: TNMStage;
  metastasisCount?: number;
  burden?: BrainMetastasesBurden;
  largestLesionCm?: number;
  totalIntracranialVolumeCc?: number;
  primary?: BrainMetastasesPrimary;
  molecularFinding?: BrainMetastasesMolecularFinding;
  extracranialDiseaseControlled?: boolean;
  symptomatic?: boolean;
  massEffect?: boolean;
  neurologicDeficit?: boolean;
  leptomeningealDisease?: boolean;
  resectableDominantLesion?: boolean;
  surgeryType?: 'resection' | 'biopsy' | 'none' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  priorWholeBrainRT?: boolean;
  priorSRS?: boolean;
  performanceStatusECOG?: number;
  midlineShift?: MidlineShift;
  symptomStatus?: NeurologicSymptomStatus;
  kps?: number;
  dsGpa?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Central Nervous System Cancers',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1425',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'Radiation Therapy for Brain Metastases: ASTRO Clinical Practice Guideline',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-EANO clinical practice guidance for brain metastases',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'NCCTG N0574: SRS with or without WBRT for limited brain metastases', url: 'https://doi.org/10.1200/JCO.2015.62.6606', evidenceLevel: '1' },
  { organization: 'other', title: 'NCCTG N107C/CEC.3: postoperative SRS versus WBRT after brain metastasis resection', url: 'https://doi.org/10.1016/S1470-2045(16)30414-3', evidenceLevel: '1' },
  { organization: 'other', title: 'QUARTZ: WBRT versus optimal supportive care in NSCLC brain metastases', url: 'https://doi.org/10.1016/S0140-6736(16)30825-X', evidenceLevel: '1' },
  { organization: 'other', title: 'JLGK0901: SRS for patients with multiple brain metastases', url: 'https://doi.org/10.1016/S1470-2045(16)30104-8', evidenceLevel: '2A' },
  { organization: 'other', title: 'N0572: hippocampal avoidance WBRT with memantine', url: 'https://doi.org/10.1016/S1470-2045(19)30140-3', evidenceLevel: '1' },
];

export const BRAIN_METASTASES_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/brain-metastases-input.json',
  title: 'Brain metastases clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['brain-metastases'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'progressive', 'leptomeningeal', 'palliative'] },
    stage: { type: 'object', additionalProperties: true },
    metastasisCount: { type: 'number' },
    burden: { type: 'string', enum: ['single', 'oligometastatic', 'multiple', 'diffuse', 'unknown'] },
    largestLesionCm: { type: 'number' },
    totalIntracranialVolumeCc: { type: 'number' },
    primary: { type: 'string', enum: ['NSCLC', 'breast', 'melanoma', 'renal-cell', 'colorectal', 'other', 'unknown'] },
    molecularFinding: { type: 'string' },
    extracranialDiseaseControlled: { type: 'boolean' },
    symptomatic: { type: 'boolean' },
    massEffect: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
    leptomeningealDisease: { type: 'boolean' },
    resectableDominantLesion: { type: 'boolean' },
    surgeryType: { type: 'string', enum: ['resection', 'biopsy', 'none', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    priorWholeBrainRT: { type: 'boolean' },
    priorSRS: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    midlineShift: { type: 'string', enum: ['none', 'less-than-5-mm', 'at-least-5-mm'] },
    symptomStatus: { type: 'string', enum: ['asymptomatic', 'deficit-or-raised-icp'] },
    kps: { type: 'number' },
    dsGpa: { type: 'number' },
  },
  additionalProperties: true,
};

export const BRAIN_METASTASES_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/brain-metastases-result.json',
  title: 'Brain metastases CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.brain-metastases'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['cns'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: className === 'SRS' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const brainTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: postoperative ? 'Rezeksiyon kavitesi ve varsa rezidüel kontrastlanan metastaz; ince kesit kontrastlı MRI ile.' : 'Kontrastlı ince kesit beyin MRI ile tanımlanan metastatik lezyonlar.',
    dose,
    margin: 'Makroskopik metastaz veya cerrahi kavite',
  },
  {
    name: 'CTV',
    description: 'SRS’de rutin elektif nodal/whole-brain CTV yoktur; kaviteye anatomik ve mikroskopik risk marjı uygulanır.',
    dose,
    margin: postoperative ? 'Kaviteye yaklaşık 1-2 mm; dural temas ve cerrahi trakt klinik bağlama göre' : 'GTV çevresinde 0-2 mm; immobilizasyon ve MRI doğruluğuna göre',
  },
  {
    name: 'PTV',
    description: 'SRS/FSRT için günlük IGRT ve immobilizasyon belirsizliği.',
    dose,
    margin: '1-2 mm SRS; 2-5 mm fraksiyone stereotaktik RT',
  },
];

const brainOars: OARConstraint[] = [
  { organ: 'Optic nerves and chiasm', metric: 'Dmax', limit: 10, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Single-fraction optic pathway tolerance' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 12.5, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Single-fraction brainstem tolerance' },
  { organ: 'Normal brain', metric: 'V12', limit: 5, unit: 'cc', priority: 'optimal', source: 'HyTEC', sourceReference: 'SRS radionecrosis risk objective' },
  { organ: 'Eyes/lenses', metric: 'Dmax', limit: 6, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Single-fraction lens/ocular sparing objective' },
  { organ: 'Hippocampi', metric: 'D100%', limit: 9, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Hippocampal avoidance WBRT planning objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class BrainMetastasesDecisionEngine extends BaseDecisionEngine<BrainMetastasesInput> {
  public readonly id = 'cns.brain-metastases';
  public readonly version = '1.0.0';
  public readonly inputSchema = BRAIN_METASTASES_INPUT_JSON_SCHEMA;
  public readonly outputSchema = BRAIN_METASTASES_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: BrainMetastasesInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'indicated';
    let intent: CDSSResult['intent'] = 'palliative';
    const count = input.metastasisCount ?? 0;
    const effectiveCount = count || (input.burden === 'single' ? 1 : input.burden === 'oligometastatic' ? 4 : input.burden === 'multiple' ? 10 : 11);
    const limited = input.burden === 'single' || input.burden === 'oligometastatic' || (effectiveCount > 0 && effectiveCount <= 4);
    const dsGpa = input.dsGpa ?? Math.max(0, Math.min(4, (input.kps ?? (input.performanceStatusECOG !== undefined ? 100 - input.performanceStatusECOG * 20 : 70)) / 25));

    if (input.symptomatic || input.massEffect || input.neurologicDeficit || input.symptomStatus === 'deficit-or-raised-icp') warnings.push('Belirgin nörolojik defisit/kafa içi basınç artışında deksametazon, nöroşirürji ve acil lokal kontrol değerlendirmesi geciktirilmemelidir.');
    if (input.midlineShift === 'at-least-5-mm') warnings.push('Orta hat şifti ≥5 mm: herniasyon riski açısından acil nöroşirürji, antiedematöz deksametazon ve hava yolu/nörolojik izlem gerekir.');
    if (input.priorWholeBrainRT || input.priorSRS) warnings.push('Önceki kraniyal RT mevcut; kümülatif normal beyin, optik yol ve beyin sapı dozları ile radyonekroz riski değerlendirilmelidir.');
    if (input.leptomeningealDisease) warnings.push('Leptomeningeal hastalıkta nöroaksiyel MRI, BOS değerlendirmesi ve sistemik/intratekal tedavi ile fokal RT birlikte planlanmalıdır.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const srsDose = fraction(input.largestLesionCm !== undefined && input.largestLesionCm <= 2 ? 20 : 18, 1, 'SRS', input.largestLesionCm !== undefined && input.largestLesionCm <= 2 ? '20 Gy / 1 fx; küçük lezyon' : '18 Gy / 1 fx; 2-3 cm lezyon');
      const fsrtDose = fraction(27, 3, 'SRS', '27 Gy / 3 fx; 2-4 cm veya kritik OAR komşuluğu');
      const wbRtDose = fraction(30, 10, 'conventional', '30 Gy / 10 fx; HA-WBRT + memantine uygun hastada');
      const postoperative = input.setting === 'postoperative' || input.surgeryType === 'resection';
      const poorPerformance = (input.kps !== undefined && input.kps < 60) || (input.performanceStatusECOG !== undefined && input.performanceStatusECOG >= 3);
      const useSrs = limited && !poorPerformance && !input.leptomeningealDisease && !input.massEffect && input.midlineShift !== 'at-least-5-mm' && !input.resectableDominantLesion;
      const dose = useSrs ? (input.largestLesionCm !== undefined && input.largestLesionCm > 2 ? fsrtDose : srsDose) : (poorPerformance ? fraction(20, 5, 'conventional', '20 Gy / 5 fx; palyatif WBRT') : wbRtDose);
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (input.molecularFinding === 'EGFR') systemicTherapy.push(systemic('maintenance', 'EGFR hedefli sistemik tedavi', ['osimertinib'], 'Kranial ve ekstrakraniyal kontrol için tümör kurulunda RT ile ardışıklık değerlendirilerek'));
      if (input.molecularFinding === 'ALK') systemicTherapy.push(systemic('maintenance', 'ALK hedefli sistemik tedavi', ['alectinib veya lorlatinib'], 'İntrakraniyal aktivite ve RT zamanlamasına göre'));
      if (input.molecularFinding === 'HER2') systemicTherapy.push(systemic('maintenance', 'HER2 hedefli sistemik tedavi', ['trastuzumab deruxtecan veya güncel rejim'], 'Primer tümör ve intrakraniyal yanıtla birlikte'));
      recommendations.push({
        id: 'new-brain-metastases-local-control',
        label: input.resectableDominantLesion ? 'Dominant semptomatik lezyonda cerrahi + kavite SRS/FSRT' : useSrs ? 'Sınırlı beyin metastazlarında SRS/FSRT' : 'Yaygın beyin metastazlarında HA-WBRT + memantine veya sistemik tedavi',
        indication: 'indicated',
        intent: input.resectableDominantLesion ? 'salvage' : 'palliative',
        fractionation: dose,
        targetVolumes: brainTargets(dose, postoperative),
        oarConstraints: brainOars,
        systemicTherapy: systemicTherapy.length ? systemicTherapy : undefined,
        rationale: [
          input.resectableDominantLesion ? 'Büyük, semptomatik veya kitle etkili dominant metastazda nöroşirürjik rezeksiyon ve ardından kavite SRS/FSRT lokal kontrolü desteklenir.' : useSrs ? 'Sınırlı sayıda/hacimde metastazda SRS veya FSRT, nörokognitif toksisiteyi azaltmak için rutin WBRT’ye tercih edilebilir.' : 'Yaygın intrakraniyal yükte hipokampus kaçınmalı WBRT ve memantine, uygun yaşam beklentisi ve nörokognitif hedeflerde değerlendirilir.',
          `DS-GPA yaklaşık ${dsGpa.toFixed(1)}/4 olarak hesaplandı; primer tümör, KPS, ekstrakraniyal hastalık ve beyin metastazı yükü ile tümör kurulunda doğrulanmalıdır.`,
          'Elektif nodal ışınlama CNS metastazlarında uygulanmaz; her lezyon/kavite MRI tabanlı hedeflenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[4]),
      });
      rtIndication = 'indicated';
      intent = input.resectableDominantLesion ? 'salvage' : 'palliative';
    } else if (input.setting === 'progressive') {
      const salvageDose = fraction(27, 3, 'SRS', '27 Gy / 3 fx; sınırlı progresyon için');
      recommendations.push({
        id: 'progressive-brain-metastases',
        label: 'Progresif beyin metastazında salvage SRS/FSRT, cerrahi veya sistemik tedavi',
        indication: input.priorWholeBrainRT || input.priorSRS ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: brainTargets(salvageDose, false),
        oarConstraints: brainOars,
        rationale: [
          'Oligoprogresif ve küçük lezyonlarda salvage SRS/FSRT; büyük/kitle etkili lezyonda cerrahi; yaygın progresyonda sistemik tedavi veya yeniden WBRT seçilmiş hastada tartışılır.',
          'Radyonekroz ve tümör progresyonu ayrımı için perfüzyon MRI, spektroskopi veya aminoasit PET yardımcı olabilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = input.priorWholeBrainRT || input.priorSRS ? 'consider' : 'indicated';
      intent = 'salvage';
    } else if (input.setting === 'leptomeningeal') {
      const focalDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik fokal alan');
      recommendations.push({
        id: 'leptomeningeal-brain-disease',
        label: 'Leptomeningeal hastalıkta semptomatik fokal RT + sistemik/intratekal yaklaşım',
        indication: 'conditional',
        intent: 'palliative',
        fractionation: focalDose,
        targetVolumes: brainTargets(focalDose, false),
        oarConstraints: brainOars,
        systemicTherapy: [systemic('palliative', 'Primer tümör ve moleküler profile göre CNS-aktif sistemik/intratekal tedavi', ['moleküler hedefli tedavi, intratekal tedavi veya klinik çalışma'], 'BOS, nöroaksiyel MRI, performans ve organ fonksiyonuna göre', '2B')],
        rationale: ['Leptomeningeal hastalıkta fokal RT; ağrı, kraniyal sinir bulgusu, hidrosefali veya kord basısı gibi semptomatik odaklarda kullanılır.', 'Kraniospinal RT veya proton tedavisi seçilmiş iyi performanslı hastada, sistemik/intratekal tedaviyle birlikte MDT’de değerlendirilebilir.'],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
    } else {
      const palliativeDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; kısa yaşam beklentisi veya semptomatik hedef');
      recommendations.push({
        id: 'palliative-brain-metastases',
        label: 'Beyin metastazlarında semptom odaklı kısa RT ve destek tedavisi',
        indication: 'conditional',
        intent: 'palliative',
        fractionation: palliativeDose,
        targetVolumes: brainTargets(palliativeDose, false),
        oarConstraints: brainOars,
        rationale: ['Kısa yaşam beklentisi, kötü performans veya sınırlı tedavi yararı olan hastada kısa RT, kortikosteroid ve erken palyatif bakım birlikte planlanmalıdır.', 'QUARTZ çalışması, seçilmiş kötü prognozlu NSCLC hastalarında WBRT’nin destek tedavisine belirgin üstünlük göstermeyebileceğini ortaya koymuştur.'],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = input.symptomatic ? 'indicated' : 'conditional';
    }

    rationale.push('Beyin metastazı kararı; nöroşirürji, radyasyon onkolojisi, medikal onkoloji, nöroradyoloji ve palyatif bakım konseyinde intrakraniyal yük, semptomlar, primer tümör biyolojisi, ekstrakraniyal kontrol ve hasta hedefleriyle belirlenmelidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'cns',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: input.metastasisCount === undefined || !input.primary || input.extracranialDiseaseControlled === undefined ? ['Metastaz sayısı, primer tümör veya ekstrakraniyal kontrol bilgisi eksik; lokal tedavi seçimi değişebilir.'] : undefined,
      confidence: input.metastasisCount === undefined || !input.primary || input.extracranialDiseaseControlled === undefined ? 0.72 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: BrainMetastasesInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif beyin metastazı: cerrahi, SRS/FSRT, HA-WBRT ve CNS-aktif sistemik tedavinin risk-adapte seçimi.';
    if (input.setting === 'progressive') return 'Progresif beyin metastazı: salvage SRS/FSRT, cerrahi veya moleküler sistemik tedavi.';
    if (input.setting === 'leptomeningeal') return 'Leptomeningeal hastalık: semptomatik fokal RT, nöroaksiyel değerlendirme ve sistemik/intratekal tedavi.';
    return 'Beyin metastazı: yaşam beklentisi ve semptomlara göre kısa palyatif RT ve destek tedavisi.';
  }
}

export const brainMetastasesEngine = new BrainMetastasesDecisionEngine();

export default brainMetastasesEngine;
