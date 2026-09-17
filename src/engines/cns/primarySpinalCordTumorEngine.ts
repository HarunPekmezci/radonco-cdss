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

export type PrimarySpinalCordSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'progressive' | 'palliative';
export type PrimarySpinalCordHistology = 'ependymoma' | 'astrocytoma' | 'subependymoma' | 'hemangioblastoma' | 'schwannoma' | 'meningioma' | 'other' | 'unknown';
export type PrimarySpinalCordCompartment = 'intramedullary' | 'intradural-extramedullary' | 'extradural' | 'conus-cauda-equina' | 'unknown';
export type PrimarySpinalCordGrade = 'WHO-1' | 'WHO-2' | 'WHO-3' | 'WHO-4' | 'unknown';
export type PrimarySpinalCordSurgery = 'gross-total-resection' | 'subtotal-resection' | 'biopsy-only' | 'none' | 'unknown';

export interface PrimarySpinalCordTumorInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'primary-spinal-cord-tumor';
  setting: PrimarySpinalCordSetting;
  stage?: TNMStage;
  histology?: PrimarySpinalCordHistology;
  compartment?: PrimarySpinalCordCompartment;
  grade?: PrimarySpinalCordGrade;
  molecularFinding?: 'H3-K27-altered' | 'NF1' | 'VHL' | 'BRAF-V600E' | 'IDH-mutant' | 'unknown';
  surgeryType?: PrimarySpinalCordSurgery;
  resectionMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  residualTumor?: boolean;
  tumorLengthCm?: number;
  vertebralLevels?: number;
  neurologicDeficit?: boolean;
  pain?: boolean;
  sphincterDysfunction?: boolean;
  priorRadiotherapy?: boolean;
  priorDoseGy?: number;
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
  title: 'ASTRO clinical practice resources for CNS and spinal radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for spinal and stereotactic radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'EANO-EURACAN guideline for ependymal tumors', url: 'https://doi.org/10.1093/neuonc/noab150', evidenceLevel: 'B' },
  { organization: 'other', title: 'RTOG 0631: stereotactic radiosurgery for localized spinal tumors', url: 'https://clinicaltrials.gov/study/NCT00922974', evidenceLevel: '2A' },
  { organization: 'other', title: 'Spinal cord glioma contemporary management review and outcome evidence', url: 'https://doi.org/10.1016/j.wneu.2019.10.124', evidenceLevel: '2B' },
];

export const PRIMARY_SPINAL_CORD_TUMOR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/primary-spinal-cord-tumor-input.json',
  title: 'Primary spinal cord tumor clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['primary-spinal-cord-tumor'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'progressive', 'palliative'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['ependymoma', 'astrocytoma', 'subependymoma', 'hemangioblastoma', 'schwannoma', 'meningioma', 'other', 'unknown'] },
    compartment: { type: 'string', enum: ['intramedullary', 'intradural-extramedullary', 'extradural', 'conus-cauda-equina', 'unknown'] },
    grade: { type: 'string', enum: ['WHO-1', 'WHO-2', 'WHO-3', 'WHO-4', 'unknown'] },
    molecularFinding: { type: 'string' },
    surgeryType: { type: 'string', enum: ['gross-total-resection', 'subtotal-resection', 'biopsy-only', 'none', 'unknown'] },
    resectionMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    residualTumor: { type: 'boolean' },
    tumorLengthCm: { type: 'number' },
    vertebralLevels: { type: 'number' },
    neurologicDeficit: { type: 'boolean' },
    pain: { type: 'boolean' },
    sphincterDysfunction: { type: 'boolean' },
    priorRadiotherapy: { type: 'boolean' },
    priorDoseGy: { type: 'number' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const PRIMARY_SPINAL_CORD_TUMOR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/primary-spinal-cord-tumor-result.json',
  title: 'Primary spinal cord tumor CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['cns.primary-spinal-cord-tumor'] },
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

const spinalTargets = (dose: Fractionation, postoperative: boolean): TargetVolume[] => [
  { name: 'GTV', description: postoperative ? 'Postoperatif intramedüller/ekstramedüller rezidü ve cerrahi yatak, kontrastlı spinal MRI ile.' : 'Kontrastlı spinal MRI ile belirlenen primer spinal tümör.', dose, margin: 'Görüntülenebilir tümör veya rezeksiyon kavitesi' },
  { name: 'CTV', description: 'Tümör yatağı ve mikroskopik yayılım riski taşıyan spinal segment; rutin tüm omurga/elektif nodal ışınlama yoktur.', dose, margin: postoperative ? 'Cerrahi yatağı ve riskli anatomiyi kapsayacak yaklaşık 5-10 mm' : 'Tümör uzunluğu ve anatomik bariyerlere göre 5-15 mm' },
  { name: 'PTV', description: 'Spinal immobilizasyon ve günlük IGRT belirsizliği.', dose, margin: 'Konvansiyonel RT 5-10 mm; stereotaktik RT 2-5 mm' },
];

const spinalOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Conventional fractionation spinal cord tolerance' },
  { organ: 'Spinal cord', metric: 'D0.03cc', limit: 25.3, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Spine SBRT spinal cord objective' },
  { organ: 'Cauda equina', metric: 'Dmax', limit: 32, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Spine SBRT cauda equina objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Spinal/upper abdominal RT renal objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2B'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class PrimarySpinalCordTumorDecisionEngine extends BaseDecisionEngine<PrimarySpinalCordTumorInput> {
  public readonly id = 'cns.primary-spinal-cord-tumor';
  public readonly version = '1.0.0';
  public readonly inputSchema = PRIMARY_SPINAL_CORD_TUMOR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = PRIMARY_SPINAL_CORD_TUMOR_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: PrimarySpinalCordTumorInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highGrade = input.grade === 'WHO-3' || input.grade === 'WHO-4';
    const deficit = Boolean(input.neurologicDeficit || input.sphincterDysfunction);

    if (deficit) warnings.push('Nörolojik veya sfinkter defisiti spinal kord basısı/ilerleyici tümör açısından acildir; spinal MRI ve nöroşirürjik değerlendirme geciktirilmemelidir.');
    if (input.priorRadiotherapy) warnings.push('Önceki spinal RT mevcut; kümülatif spinal kord/kauda ekina dozu ve yeniden ışınlama miyelopati riski hesaplanmalıdır.');
    if (input.tumorLengthCm !== undefined && input.tumorLengthCm > 5) warnings.push('Uzun intramedüller tümörde cerrahi sınırlar ve nörolojik fonksiyon korunumu özellikle dikkatle değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const conventionalDose = fraction(50.4, 28, 'conventional', '50.4 Gy / 28 fx; seçilmiş rezidüel veya yüksek riskli primer spinal tümör');
      const highGradeDose = fraction(54, 30, 'conventional', '54 Gy / 30 fx; seçilmiş yüksek grade glial/ependimal tümör');
      const stereotacticDose = fraction(24, 2, 'SBRT', '24 Gy / 2 fx; küçük, fokal, ekstramedüller ve spinal korddan güvenli mesafede');
      const postoperative = input.setting === 'postoperative' || input.surgeryType === 'gross-total-resection' || input.surgeryType === 'subtotal-resection';
      const needsRT = Boolean(input.residualTumor || input.resectionMargin === 'R1' || input.resectionMargin === 'R2' || highGrade);
      const useSBRT = input.compartment === 'intradural-extramedullary' && !input.residualTumor && !deficit && input.tumorLengthCm !== undefined && input.tumorLengthCm <= 3;
      const dose = useSBRT ? stereotacticDose : highGrade ? highGradeDose : conventionalDose;
      recommendations.push({
        id: 'initial-primary-spinal-tumor',
        label: needsRT ? 'Maksimal güvenli rezeksiyon + risk-adapte postoperatif RT' : 'Maksimal güvenli rezeksiyon ve MRI sürveyansı',
        indication: needsRT ? 'indicated' : 'not-indicated',
        intent: 'curative',
        fractionation: needsRT ? dose : undefined,
        targetVolumes: needsRT ? spinalTargets(dose, postoperative) : undefined,
        oarConstraints: needsRT ? spinalOars : undefined,
        rationale: [
          'Primer spinal tümörlerde maksimal güvenli rezeksiyon, histolojik/moleküler tanı ve nörolojik fonksiyonun korunması temel hedeftir.',
          needsRT ? 'Rezidüel tümör, R1/R2 marjin, yüksek grade veya progresyon riski yüksek hastalıkta postoperatif fraksiyone RT lokal kontrol için değerlendirilir.' : 'WHO grade 1, R0 rezeksiyonlu ve nörolojik olarak stabil hastada rutin adjuvan RT yerine seri kontrastlı spinal MRI sürveyansı çoğu durumda uygundur.',
          'SRS/SBRT yalnız küçük, iyi sınırlı ve ekstramedüller lezyonda; spinal kord toleransı kesinlikle korunarak seçilmiş bir seçenektir. İntramedüller tümörde rutin SBRT önerilmez.',
          'Rutin elektif nodal veya tüm omurga ışınlaması primer spinal kord tümörlerinde uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = needsRT ? 'indicated' : 'not-indicated';
    } else if (input.setting === 'recurrent' || input.setting === 'progressive') {
      const salvageDose = fraction(24, 3, 'SBRT', '24 Gy / 3 fx; seçilmiş fokal nüks ve kümülatif kord dozuna göre');
      recommendations.push({
        id: 'recurrent-primary-spinal-tumor',
        label: 'Nüks/progresif primer spinal tümörde yeniden cerrahi veya seçilmiş salvage RT',
        indication: input.priorRadiotherapy ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: spinalTargets(salvageDose, Boolean(input.surgeryType && input.surgeryType !== 'none')),
        oarConstraints: spinalOars,
        systemicTherapy: [systemic('palliative', 'Moleküler profile göre klinik çalışma/ hedefli tedavi', ['histolojiye göre hedefli tedavi veya klinik çalışma'], 'Özellikle ilerleyici yüksek grade veya cerrahi/RT dışı hastalıkta', '2B')],
        rationale: [
          'Lokalize nükste yeniden cerrahi; küçük ve korddan güvenli mesafedeki ekstramedüller nükste seçilmiş stereotaktik RT düşünülebilir.',
          'Önceden RT alan hastada yeniden ışınlama, kümülatif spinal kord/kauda dozu ve miyelopati riski ile sınırlıdır.',
          'İntramedüller nükste radyasyon miyelopatisi riski nedeniyle SBRT yerine daha konservatif fraksiyone yaklaşım veya cerrahi/klinik çalışma değerlendirilir.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2]),
      });
      rtIndication = input.priorRadiotherapy ? 'consider' : 'indicated';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; semptomatik spinal hedef');
      recommendations.push({
        id: 'palliative-primary-spinal-tumor',
        label: 'Primer spinal tümörde semptom odaklı kısa RT ve destek tedavisi',
        indication: deficit || input.pain ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: palliativeDose,
        targetVolumes: spinalTargets(palliativeDose, false),
        oarConstraints: spinalOars,
        rationale: [
          'Ağrı, nörolojik defisit veya sfinkter bozukluğunda kısa RT; steroid, analjezi, rehabilitasyon ve nöroşirürji ile birlikte planlanır.',
          'Tedavi amacı semptom kontrolü ve nörolojik fonksiyonun korunmasıdır; RT alanı MRI ile sınırlı tutulur.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = deficit || input.pain ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    rationale.push('Primer spinal kord tümörü kararı; nöroşirürji, radyasyon onkolojisi, nöro-onkoloji, nöroradyoloji ve nöropatoloji konseyinde tümör kompartımanı, grade, MRI, rezeksiyon kapsamı ve nörolojik hedeflerle verilmelidir.');
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
      uncertainties: !input.histology || !input.compartment || !input.grade || !input.surgeryType ? ['Histoloji, kompartıman, grade veya cerrahi kapsamı eksik; cerrahi ve RT seçimi değişebilir.'] : undefined,
      confidence: !input.histology || !input.compartment || !input.grade || !input.surgeryType ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: PrimarySpinalCordTumorInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif primer spinal kord tümörü: maksimal güvenli rezeksiyon, grade/kompartıman uyumlu RT veya MRI sürveyansı.';
    if (input.setting === 'recurrent' || input.setting === 'progressive') return 'Nüks/progresif primer spinal kord tümörü: yeniden cerrahi, kümülatif doz güvenli salvage RT ve klinik çalışma.';
    return 'Primer spinal kord tümörü: semptom odaklı kısa RT, nörolojik koruma ve destek tedavisi.';
  }
}

export const primarySpinalCordTumorEngine = new PrimarySpinalCordTumorDecisionEngine();

export default primarySpinalCordTumorEngine;
