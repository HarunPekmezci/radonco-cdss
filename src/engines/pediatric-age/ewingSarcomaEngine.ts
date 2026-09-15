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

export type EwingSetting = 'newly-diagnosed' | 'postoperative' | 'localized' | 'metastatic' | 'relapsed' | 'surveillance';
export type EwingRisk = 'localized-favorable' | 'localized-unfavorable' | 'pulmonary-metastatic' | 'bone-metastatic' | 'multifocal' | 'relapsed' | 'unknown';
export type EwingSite = 'extremity' | 'pelvis' | 'chest-wall' | 'spine' | 'paraspinal' | 'head-neck' | 'visceral' | 'other' | 'unknown';
export type EwingSurgery = 'wide-resection' | 'limb-sparing-resection' | 'hemipelvectomy' | 'amputation' | 'biopsy-only' | 'none' | 'unknown';

export interface EwingSarcomaInput extends ClinicalCaseInput {
  organSystem: 'sarcoma';
  disease: 'ewing-sarcoma';
  setting: EwingSetting;
  riskGroup?: EwingRisk;
  stage?: TNMStage;
  primarySite?: EwingSite;
  surgeryType?: EwingSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  tumorVolumeMl?: number;
  metastaticDisease?: boolean;
  pulmonaryMetastases?: boolean;
  boneMetastases?: boolean;
  boneMarrowMetastases?: boolean;
  nodalMetastases?: boolean;
  poorHistologicResponse?: boolean;
  viableTumorPercent?: number;
  positiveMargin?: boolean;
  unresectable?: boolean;
  priorRadiotherapy?: boolean;
  priorChemotherapy?: string[];
  symptomaticDisease?: boolean;
  ageYears?: number;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Bone Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1418',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for pediatric and soft-tissue sarcoma radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO clinical practice and consensus guidance for sarcoma radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'COG AEWS0031: interval-compressed VDC/IE for localized Ewing sarcoma', url: 'https://clinicaltrials.gov/study/NCT00006734', evidenceLevel: '1' },
  { organization: 'other', title: 'EURO-E.W.I.N.G. 99: risk-adapted therapy for Ewing sarcoma', url: 'https://doi.org/10.1016/S0140-6736(12)61704-3', evidenceLevel: '1' },
  { organization: 'other', title: 'COG AEWS1221: targeted and intensified approaches in recurrent/metastatic Ewing sarcoma', url: 'https://clinicaltrials.gov/study/NCT02306161', evidenceLevel: '2A' },
  { organization: 'other', title: 'RTOG 9514: multimodality radiotherapy quality and dose principles for sarcoma', url: 'https://clinicaltrials.gov/study/NCT00002737', evidenceLevel: '2B' },
  { organization: 'other', title: 'International consensus on Ewing sarcoma local control and radiotherapy', url: 'https://doi.org/10.1016/j.ejca.2018.08.013', evidenceLevel: 'B' },
];

export const EWING_SARCOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ewing-sarcoma-input.json',
  title: 'Ewing sarcoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['sarcoma'] },
    disease: { type: 'string', enum: ['ewing-sarcoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'localized', 'metastatic', 'relapsed', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['localized-favorable', 'localized-unfavorable', 'pulmonary-metastatic', 'bone-metastatic', 'multifocal', 'relapsed', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    primarySite: { type: 'string', enum: ['extremity', 'pelvis', 'chest-wall', 'spine', 'paraspinal', 'head-neck', 'visceral', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorSizeCm: { type: 'number' }, tumorVolumeMl: { type: 'number' },
    metastaticDisease: { type: 'boolean' }, pulmonaryMetastases: { type: 'boolean' },
    boneMetastases: { type: 'boolean' }, boneMarrowMetastases: { type: 'boolean' },
    nodalMetastases: { type: 'boolean' }, poorHistologicResponse: { type: 'boolean' },
    viableTumorPercent: { type: 'number' }, positiveMargin: { type: 'boolean' },
    unresectable: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorChemotherapy: { type: 'array', items: { type: 'string' } },
    symptomaticDisease: { type: 'boolean' }, ageYears: { type: 'number' }, performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const EWING_SARCOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ewing-sarcoma-result.json',
  title: 'Ewing sarcoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['pediatric-age.ewing-sarcoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['sarcoma'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
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
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (dose: Fractionation, metastatic = false): TargetVolume[] => [
  { name: 'GTV', description: metastatic ? 'Makroskopik primer, rezidüel hastalık veya seçilmiş akciğer/kemik metastazı.' : 'Başlangıç MRI/PET-CT ile tanımlanan primer tümör ve postoperatif yatak.', dose, margin: 'Tanı öncesi görüntüleme, cerrahi klipler ve tedavi yanıtı ile füzyon' },
  { name: 'CTV', description: 'Primer tümör yatağı, biyopsi yolu ve subklinik mikroskopik yayılım; metastatik odakta ilgili kemik/akciğer çevresi.', dose, margin: 'Başlangıç tümör hacmi ve anatomik bariyerlere göre genellikle 1-2 cm; kemikte longitudinal yayılım dikkate alınır' },
  { name: 'PTV', description: 'Pediatrik immobilizasyon, solunum/hareket ve günlük görüntüleme belirsizliğini içeren planlama hacmi.', dose, margin: 'Genellikle 3-5 mm; toraks lezyonlarında 4D-CT/ITV ve IGRT ile' },
];

const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pediatric sarcoma spine RT objective' },
  { organ: 'Brainstem/optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck Ewing sarcoma objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic sarcoma planning objective' },
  { organ: 'Heart', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric thoracic sarcoma objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Abdominal/pelvic Ewing sarcoma objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic Ewing sarcoma objective' },
  { organ: 'Growth plates', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric growth preservation objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({
  setting, regimen, agents, timing, evidenceLevel,
});
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class EwingSarcomaDecisionEngine extends BaseDecisionEngine<EwingSarcomaInput> {
  public readonly id = 'pediatric-age.ewing-sarcoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = EWING_SARCOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = EWING_SARCOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: EwingSarcomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';
    const metastatic = input.metastaticDisease === true || input.riskGroup === 'pulmonary-metastatic' || input.riskGroup === 'bone-metastatic' || input.riskGroup === 'multifocal';
    const highRiskLocal = input.positiveMargin === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.unresectable === true || input.poorHistologicResponse === true || input.tumorSizeCm !== undefined && input.tumorSizeCm > 8 || input.riskGroup === 'localized-unfavorable';

    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; büyüme plakları, spinal kord, bağırsak, böbrek, kalp ve akciğer kümülatif dozları pediatrik re-irradiation uzmanı tarafından değerlendirilmelidir.');
    if (input.primarySite === 'spine' || input.primarySite === 'paraspinal') warnings.push('Spinal/paraspinal hastalıkta spinal kord, cauda equina ve nörolojik fonksiyon için acil multidisipliner değerlendirme gerekir.');
    if (input.pulmonaryMetastases || input.boneMetastases) warnings.push('Metastatik hastalıkta tüm vücut MRI/PET-CT, toraks BT ve kemik iliği değerlendirmesi; sistemik tedavi yanıtı ile lokal tedavi planı birlikte ele alınmalıdır.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'localized' || input.setting === 'postoperative') {
      const dose = fraction(highRiskLocal ? 55.8 : 45, highRiskLocal ? 31 : 25, 'conventional', highRiskLocal ? '55.8 Gy / 31 fx; yüksek riskli veya rezidüel primer yatak' : '45 Gy / 25 fx; seçilmiş mikroskopik risk alanı');
      recommendations.push({
        id: 'localized-ewing-sarcoma',
        label: highRiskLocal ? 'Neoadjuvan VDC/IE sonrası cerrahi ve/veya postoperatif RT; yüksek risk özelliklerinde lokal kontrol' : 'Neoadjuvan interval-compressed VDC/IE, cerrahi R0 hedefi ve yanıt-temelli lokal tedavi',
        indication: highRiskLocal ? 'indicated' : 'conditional',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRiskLocal ? dose : undefined,
        targetVolumes: highRiskLocal ? targets(dose) : undefined,
        oarConstraints: highRiskLocal ? oars : undefined,
        systemicTherapy: [
          systemic('neoadjuvant', 'Interval-compressed VDC/IE', ['vincristine', 'doxorubicin', 'cyclophosphamide', 'ifosfamide', 'etoposide'], 'Genellikle 2 haftada bir; cerrahi/RT lokal kontrolü ve yanıt değerlendirmesiyle', '1'),
          systemic('adjuvant', 'VDC/IE konsolidasyonu', ['vincristine', 'doxorubicin', 'cyclophosphamide', 'ifosfamide', 'etoposide'], 'Lokal tedavi sonrası protokolü tamamlamak üzere', '1'),
        ],
        rationale: [
          'Ewing sarkomunda sistemik kemoterapi tanıdan hemen sonra başlar; cerrahi mümkünse R0 geniş rezeksiyon ve fonksiyon korunması temel hedeftir.',
          'RT; R1/R2 veya unresectable hastalıkta, cerrahi morbiditesi kabul edilemez anatomik yerleşimde, yetersiz histolojik yanıt/rezidüel tümörde ve seçilmiş büyük/aksiyel tümörlerde lokal kontrol için düşünülür.',
          'RT hacmi başlangıç tümör hacmini, biyopsi yolunu ve cerrahi yatağı temel almalıdır; yalnızca küçülmüş tedavi sonrası hacmi kapsamak yetersiz olabilir.',
          'ACNS veya torasik PACIFIC benzeri konsolidasyon immünoterapisi Ewing sarkomunda standart değildir; klinik çalışma dışında rutin EGFR/ALK hedefli tedavi önerilmez.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[4]),
      });
      rtIndication = highRiskLocal ? 'indicated' : 'conditional';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (metastatic) {
      const dose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; seçilmiş primer/metastatik mikroskopik hastalık');
      const boost = fraction(55.8, 31, 'conventional', '55.8 Gy / 31 fx; makroskopik rezidüel veya seçilmiş metastatik hedef');
      recommendations.push({
        id: 'metastatic-ewing-sarcoma',
        label: 'Metastatik Ewing sarkomunda sistemik VDC/IE, seçilmiş primer/metastaz RT ve akciğer lokal tedavisi',
        indication: input.symptomaticDisease || input.pulmonaryMetastases || input.boneMetastases ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: input.symptomaticDisease ? boost : dose,
        targetVolumes: targets(input.symptomaticDisease ? boost : dose, true),
        oarConstraints: oars,
        systemicTherapy: [systemic('induction', 'Metastatik Ewing sarkomu için yoğun interval-compressed VDC/IE', ['vincristine', 'doxorubicin', 'cyclophosphamide', 'ifosfamide', 'etoposide'], 'Sistemik yanıt, primer ve metastaz lokal kontrolüyle birlikte', '1')],
        rationale: [
          'Metastatik hastalıkta kemoterapi omurgadır; primer tümör ve seçilmiş akciğer/kemik metastazlarına cerrahi ve/veya RT ile agresif lokal kontrol, iyi yanıt veren hastalarda küratif stratejinin parçası olabilir.',
          'Pulmoner metastazlarda tüm akciğer ışınlaması veya fokal SBRT seçimi; yaş, metastaz sayısı, kemoterapi yanıtı ve önceki antrasiklin/akciğer dozlarıyla pediatrik MDT tarafından belirlenmelidir.',
          'Metastatik Ewing için torasik 60-66 Gy eşzamanlı KRT ve konsolidasyon immünoterapisi standart değildir; RTOG protokolleri yalnızca planlama/kalite çerçevesi olarak yorumlanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.symptomaticDisease || input.pulmonaryMetastases || input.boneMetastases ? 'indicated' : 'conditional';
      intent = 'curative';
    } else if (input.setting === 'relapsed') {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; seçilmiş lokal relaps veya semptomatik metastaz');
      recommendations.push({
        id: 'relapsed-ewing-sarcoma',
        label: 'Relaps Ewing sarkomunda kurtarma kemoterapisi/klinik çalışma ve seçilmiş fokal RT',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined,
        targetVolumes: input.symptomaticDisease ? targets(dose, true) : undefined,
        oarConstraints: input.symptomaticDisease ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Relaps için kurtarma tedavisi veya klinik çalışma', ['yüksek doz ifosfamide', 'topotecan + cyclophosphamide', 'irinotecan + temozolomide; protokole göre'], 'Önceki tedavi, organ fonksiyonu ve moleküler/klinik çalışma uygunluğuna göre', '2A')],
        rationale: [
          'Relaps Ewing sarkomunda prognoz kötüdür; yeniden biyopsi, tüm vücut evreleme ve pediatrik sarkom kurulunda klinik çalışma önceliklidir.',
          'RT lokal semptom, nörolojik tehdit, kanama veya sınırlı oligorelaps için seçilebilir; re-irradiation kümülatif dozlarla sınırlıdır.',
          'Metastatik relaps için EGFR/ALK veya immünoterapi rutin standart değildir; moleküler çalışma ve klinik araştırma bağlamında değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      recommendations.push({
        id: 'ewing-surveillance',
        label: 'Tedavi sonrası yapılandırılmış pediatrik sarkom izlemi',
        indication: 'not-indicated',
        intent: 'observation',
        rationale: ['Remisyonda rutin RT yerine primer bölge MRI/BT, toraks görüntüleme, büyüme-gelişme, kardiyak, renal, fertilite ve nörokognitif geç etkiler izlenmelidir.'],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'not-indicated';
      intent = 'observation';
    }
    rationale.push('Bu motor Ewing ailesi tümörlerinde pediatrik sarkom MDT kararını destekler; patoloji/moleküler doğrulama, cerrahi rezeke edilebilirlik, VDC/IE zamanlaması ve lokal kontrol stratejisi birlikte değerlendirilmelidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'sarcoma',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Ewing sarkomu için pediatrik sarkom MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, patoloji, tümör başlangıç hacmi, cerrahi marjin, nekroz/viable tümör oranı, metastatik evre, önceki kemoterapi/RT ve pediatrik protokol uygunluğu doğrulanmalıdır.'],
      confidence: 0.88,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const ewingSarcomaEngine = new EwingSarcomaDecisionEngine();
