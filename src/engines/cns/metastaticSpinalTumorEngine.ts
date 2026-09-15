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

export type MetastaticSpinalSetting = 'newly-diagnosed' | 'postoperative' | 'progressive' | 'reirradiation' | 'palliative';
export type SpinalTumorPrimary = 'breast' | 'prostate' | 'NSCLC' | 'renal-cell' | 'thyroid' | 'multiple-myeloma' | 'other' | 'unknown';
export type ESCCGrade = '0' | '1a' | '1b' | '1c' | '2' | '3' | 'unknown';
export type SINSCategory = 'stable' | 'potentially-unstable' | 'unstable' | 'unknown';
export type SpinalLevel = 'cervical' | 'thoracic' | 'thoracolumbar' | 'lumbar' | 'sacral' | 'multilevel' | 'unknown';

export interface MetastaticSpinalTumorInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'metastatic-spinal-tumor';
  setting: MetastaticSpinalSetting;
  stage?: TNMStage;
  primary?: SpinalTumorPrimary;
  spinalLevel?: SpinalLevel;
  esccGrade?: ESCCGrade;
  sinsCategory?: SINSCategory;
  involvedVertebrae?: number;
  epiduralDisease?: boolean;
  spinalCordCompression?: boolean;
  caudaEquinaCompression?: boolean;
  neurologicDeficit?: boolean;
  bowelBladderDysfunction?: boolean;
  mechanicalPain?: boolean;
  pathologicFracture?: boolean;
  instability?: boolean;
  priorSpinalRT?: boolean;
  priorDoseGy?: number;
  surgeryPerformed?: boolean;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  instrumentation?: boolean;
  extracranialDiseaseControlled?: boolean;
  molecularFinding?: 'EGFR' | 'ALK' | 'HER2' | 'BRAF-V600E' | 'HR-positive' | 'none' | 'unknown';
  performanceStatusECOG?: number;
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
  title: 'ASTRO guideline: Palliative radiation therapy for bone metastases',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for spine stereotactic body radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'SC.24: 24 Gy in 2 fractions versus 20 Gy in 5 fractions for painful spinal metastases', url: 'https://doi.org/10.1016/S1470-2045(21)00096-0', evidenceLevel: '1' },
  { organization: 'other', title: 'SINS: Spinal Instability Neoplastic Score validation', url: 'https://doi.org/10.1097/BRS.0b013e3181e16ae2', evidenceLevel: 'B' },
  { organization: 'other', title: 'Patchell randomized trial: surgery plus RT versus RT alone for metastatic spinal cord compression', url: 'https://doi.org/10.1056/NEJM200502173520703', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0631: stereotactic radiosurgery for localized vertebral metastases', url: 'https://clinicaltrials.gov/study/NCT00922974', evidenceLevel: '2A' },
];

export const METASTATIC_SPINAL_TUMOR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/metastatic-spinal-tumor-input.json',
  title: 'Metastatic spinal tumor clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['metastatic-spinal-tumor'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'progressive', 'reirradiation', 'palliative'] },
    stage: { type: 'object', additionalProperties: true },
    primary: { type: 'string', enum: ['breast', 'prostate', 'NSCLC', 'renal-cell', 'thyroid', 'multiple-myeloma', 'other', 'unknown'] },
    spinalLevel: { type: 'string', enum: ['cervical', 'thoracic', 'thoracolumbar', 'lumbar', 'sacral', 'multilevel', 'unknown'] },
    esccGrade: { type: 'string', enum: ['0', '1a', '1b', '1c', '2', '3', 'unknown'] },
    sinsCategory: { type: 'string', enum: ['stable', 'potentially-unstable', 'unstable', 'unknown'] },
    involvedVertebrae: { type: 'number' },
    epiduralDisease: { type: 'boolean' },
    spinalCordCompression: { type: 'boolean' },
    caudaEquinaCompression: { type: 'boolean' },
    neurologicDeficit: { type: 'boolean' },
    bowelBladderDysfunction: { type: 'boolean' },
    mechanicalPain: { type: 'boolean' },
    pathologicFracture: { type: 'boolean' },
    instability: { type: 'boolean' },
    priorSpinalRT: { type: 'boolean' },
    priorDoseGy: { type: 'number' },
    surgeryPerformed: { type: 'boolean' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    instrumentation: { type: 'boolean' },
    extracranialDiseaseControlled: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const METASTATIC_SPINAL_TUMOR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/metastatic-spinal-tumor-result.json',
  title: 'Metastatic spinal tumor CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.metastatic-spinal-tumor'] },
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
  technique: className === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const spinalTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: postoperative ? 'Postoperatif vertebrektomi/laminektomi yatağı, rezidüel epidural veya paraspinal tümör.' : 'MRI/BT/PET ile belirlenen vertebral, epidural ve paraspinal metastatik hastalık.',
    dose,
    margin: 'Makroskopik kemik ve epidural hastalık',
  },
  {
    name: 'CTV',
    description: 'İlgili vertebra ve riskli epidural/paraspinal uzanım; rutin tüm omurga veya elektif nodal ışınlama yoktur.',
    dose,
    margin: postoperative ? 'Cerrahi yatak ve riskli vertebral anatomiyi içerecek şekilde yaklaşık 5-10 mm' : 'İlgili vertebra(lar), pedikül/lamina ve epidural risk alanına göre',
  },
  {
    name: 'PTV',
    description: 'Spinal immobilizasyon, solunum ve günlük IGRT belirsizliği.',
    dose,
    margin: 'Konvansiyonel RT için 5-10 mm; SBRT için yaklaşık 2-5 mm',
  },
];

const spinalOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 25.3, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Spine SBRT cord maximum dose objective' },
  { organ: 'Spinal cord', metric: 'D0.03cc', limit: 30, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Spine SBRT cord PRV objective' },
  { organ: 'Cauda equina', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Spine SBRT cauda equina objective' },
  { organ: 'Esophagus', metric: 'Dmax', limit: 35, unit: 'Gy', priority: 'optimal', source: 'HyTEC', sourceReference: 'Thoracic spine SBRT esophageal objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Spinal/upper abdominal RT renal objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MetastaticSpinalTumorDecisionEngine extends BaseDecisionEngine<MetastaticSpinalTumorInput> {
  public readonly id = 'cns.metastatic-spinal-tumor';
  public readonly version = '1.0.0';
  public readonly inputSchema = METASTATIC_SPINAL_TUMOR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = METASTATIC_SPINAL_TUMOR_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: MetastaticSpinalTumorInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'indicated';
    let intent: CDSSResult['intent'] = 'palliative';
    const emergency = Boolean(input.spinalCordCompression || input.caudaEquinaCompression || input.bowelBladderDysfunction || input.neurologicDeficit);
    const unstable = input.sinsCategory === 'unstable' || input.instability || input.pathologicFracture;
    const highGradeESCC = input.esccGrade === '2' || input.esccGrade === '3';

    if (emergency) warnings.push('Kord/kauda basısı veya nörolojik defisit onkolojik acildir; steroid, acil MRI, nöroşirürji ve radyasyon onkolojisi değerlendirmesi geciktirilmemelidir.');
    if (input.priorSpinalRT) warnings.push('Önceki spinal RT mevcut; kümülatif spinal kord/kauda ekina dozu ve yeniden ışınlama miyelopati riski hesaplanmalıdır.');
    if (input.spinalLevel === 'cervical' || input.spinalLevel === 'thoracic') warnings.push('Servikal/torasik lezyonlarda spinal kord ve özofagus dozları, immobilizasyon ve günlük IGRT ile sıkı biçimde korunmalıdır.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const conventionalDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; kord basısı veya yaygın ağrılı hastalık');
      const shortDose = fraction(8, 1, 'single-fraction', '8 Gy / 1 fx; seçilmiş kısa yaşam beklentisi/palyasyon');
      const sbrtDose = fraction(24, 2, 'SBRT', '24 Gy / 2 fx; seçilmiş stabil, sınırlı ve korddan güvenli mesafedeki hastalık');
      const postoperative = input.setting === 'postoperative' || input.surgeryPerformed;
      const surgicalNeed = unstable || highGradeESCC;
      const dose = input.performanceStatusECOG !== undefined && input.performanceStatusECOG >= 3 ? shortDose : (input.extracranialDiseaseControlled && !surgicalNeed ? sbrtDose : conventionalDose);
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (input.primary === 'breast' && input.molecularFinding === 'HER2') systemicTherapy.push(systemic('maintenance', 'HER2 hedefli sistemik tedavi', ['trastuzumab deruxtecan veya güncel HER2 rejimi'], 'Ekstrakraniyal kontrol ve RT ile ardışıklık MDT’de'));
      if (input.primary === 'NSCLC' && input.molecularFinding === 'EGFR') systemicTherapy.push(systemic('maintenance', 'EGFR hedefli tedavi', ['osimertinib'], 'Sistemik kontrol ve lokal RT zamanlamasına göre'));
      if (input.primary === 'NSCLC' && input.molecularFinding === 'ALK') systemicTherapy.push(systemic('maintenance', 'ALK hedefli tedavi', ['alectinib veya lorlatinib'], 'Moleküler doğrulama ve performansa göre'));
      if (input.primary === 'prostate') systemicTherapy.push(systemic('maintenance', 'Androjen reseptör hedefli tedavi', ['ADT ± abiraterone/enzalutamide'], 'Yaygınlık, kastrasyon durumu ve sistemik kılavuza göre'));
      recommendations.push({
        id: 'initial-metastatic-spinal-management',
        label: surgicalNeed ? 'Acil nöroşirürji/stabilizasyon veya dekompresyon + postoperatif RT' : input.extracranialDiseaseControlled ? 'Stabil sınırlı spinal metastazda SBRT ve sistemik tedavi' : 'Palyatif spinal RT ve sistemik tedavi',
        indication: 'indicated',
        intent: surgicalNeed ? 'salvage' : 'palliative',
        fractionation: dose,
        targetVolumes: spinalTargets(dose, postoperative),
        oarConstraints: spinalOars,
        systemicTherapy: systemicTherapy.length ? systemicTherapy : undefined,
        rationale: [
          surgicalNeed ? 'Yüksek dereceli ESCC, instabilite, patolojik kırık veya nörolojik defisitte dekompresyon/stabilizasyon ve ardından erken postoperatif RT değerlendirilir.' : 'Stabil, sınırlı vertebral hastalıkta SBRT; ağrı kontrolü ve seçilmiş olguda uzun süreli lokal kontrol için düşünülebilir.',
          'SINS, ESCC derecesi, mekanik ağrı, vertebral kollaps, epidural uzanım ve sistemik prognoz cerrahi/RT sıralamasını belirler.',
          'Rutin elektif nodal veya tüm omurga ışınlaması yerine ilgili vertebra, epidural ve paraspinal risk alanı hedeflenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'indicated';
      intent = surgicalNeed ? 'salvage' : 'palliative';
    } else if (input.setting === 'reirradiation' || input.setting === 'progressive') {
      const reirradiationDose = fraction(24, 2, 'SBRT', '24 Gy / 2 fx; önceki RT sonrası seçilmiş düşük hacimli progresyon');
      recommendations.push({
        id: 'reirradiation-metastatic-spinal-management',
        label: 'Progresif/nüks spinal metastazda kümülatif doz kontrollü yeniden RT',
        indication: input.priorSpinalRT ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: reirradiationDose,
        targetVolumes: spinalTargets(reirradiationDose, Boolean(input.surgeryPerformed)),
        oarConstraints: spinalOars,
        rationale: [
          'Yeniden RT yalnızca önceki planların füzyonu, kümülatif spinal kord dozu, tedavi aralığı, hedef hacmi ve beklenen klinik yarar kabul edilebilir olduğunda düşünülür.',
          'Kord basısı, instabilite veya yeni nörolojik defisitte yeniden RT tek başına yeterli olmayabilir; cerrahi/stabilizasyon ve steroid değerlendirilmelidir.',
          'SC.24, uygun seçilmiş ağrılı spinal metastazlarda ablative SBRT’nin ağrı yanıtını artırabileceğini destekler; hasta seçimi ve OAR güvenliği esastır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.priorSpinalRT ? 'consider' : 'indicated';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; kısa palyatif spinal RT');
      recommendations.push({
        id: 'palliative-metastatic-spinal-management',
        label: 'Spinal metastazda kısa palyatif RT ve destek tedavisi',
        indication: emergency || input.mechanicalPain ? 'indicated' : 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: spinalTargets(palliativeDose),
        oarConstraints: spinalOars,
        rationale: [
          'Ağrı, mekanik instabilite veya nörolojik bulguda kısa RT; analjezi, steroid, ortoz, rehabilitasyon ve erken palyatif bakım ile birlikte planlanır.',
          'Çok kötü performans veya kısa yaşam beklentisinde 8 Gy tek fraksiyon gibi daha kısa şema seçilmiş hastada uygundur.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = emergency || input.mechanicalPain ? 'indicated' : 'conditional';
    }

    rationale.push('Metastatik spinal kord tümörü kararı; nöroşirürji, radyasyon/medikal onkoloji, nöroradyoloji, ortopedi ve palyatif bakım ekipleriyle MRI, ESCC, SINS, sistemik prognoz ve hasta hedefleri üzerinden verilmelidir.');
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
      uncertainties: input.esccGrade === undefined || input.sinsCategory === undefined || !input.primary ? ['ESCC, SINS veya primer tümör bilgisi eksik; cerrahi ve RT sıralaması değişebilir.'] : undefined,
      confidence: input.esccGrade === undefined || input.sinsCategory === undefined || !input.primary ? 0.72 : 0.89,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: MetastaticSpinalTumorInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif spinal metastaz: ESCC, SINS ve nörolojik duruma göre cerrahi/stabilizasyon ve RT.';
    if (input.setting === 'progressive' || input.setting === 'reirradiation') return 'Progresif/nüks spinal metastaz: kümülatif doz kontrollü salvage RT ve cerrahi değerlendirmesi.';
    return 'Metastatik spinal kord hastalığı: acil nörolojik değerlendirme, kısa palyatif RT ve destek tedavisi.';
  }
}

export const metastaticSpinalTumorEngine = new MetastaticSpinalTumorDecisionEngine();

export default metastaticSpinalTumorEngine;
