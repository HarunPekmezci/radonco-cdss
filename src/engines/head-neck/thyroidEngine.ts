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

export type ThyroidSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type ThyroidHistology = 'papillary' | 'follicular' | 'poorly-differentiated' | 'medullary' | 'anaplastic' | 'hurthle-cell' | 'other' | 'unknown';
export type ThyroidStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type ThyroidSurgery = 'none' | 'lobectomy' | 'total-thyroidectomy' | 'completion-thyroidectomy' | 'neck-dissection' | 'unknown';
export type ThyroidMolecularFinding = 'BRAF-V600E' | 'RET-fusion' | 'RET-mutation' | 'NTRK-fusion' | 'RAS-altered' | 'TERT-promoter' | 'PD-L1-positive' | 'MSI-H' | 'TMB-high' | 'none' | 'unknown';

export interface ThyroidInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'thyroid-cancer';
  setting: ThyroidSetting;
  stage?: TNMStage;
  stageGroup?: ThyroidStage;
  histology?: ThyroidHistology;
  surgeryType?: ThyroidSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  extrathyroidalExtension?: boolean;
  grossResidualDisease?: boolean;
  recurrentLaryngealNerveInvolvement?: boolean;
  trachealOrEsophagealInvasion?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  iodineAvid?: boolean;
  radioiodineRefractory?: boolean;
  distantMetastases?: string[];
  molecularFinding?: ThyroidMolecularFinding;
  priorNeckRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Thyroid Carcinoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for thyroid and head and neck radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for thyroid and neck target delineation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ATA differentiated thyroid cancer guidelines', url: 'https://doi.org/10.1089/thy.2015.0020', evidenceLevel: 'A' },
  { organization: 'other', title: 'ATA medullary thyroid carcinoma guidelines', url: 'https://doi.org/10.1089/thy.2015.0303', evidenceLevel: 'A' },
  { organization: 'other', title: 'DECISION: sorafenib in radioactive iodine-refractory differentiated thyroid cancer', url: 'https://doi.org/10.1056/NEJMoa1202672', evidenceLevel: '1' },
  { organization: 'other', title: 'SELECT: lenvatinib in radioactive iodine-refractory differentiated thyroid cancer', url: 'https://doi.org/10.1056/NEJMoa1406470', evidenceLevel: '1' },
  { organization: 'other', title: 'LIBRETTO-001: selpercatinib in RET-altered thyroid cancer', url: 'https://doi.org/10.1056/NEJMoa2005651', evidenceLevel: '1' },
];

export const THYROID_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/thyroid-input.json',
  title: 'Thyroid cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['thyroid-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['papillary', 'follicular', 'poorly-differentiated', 'medullary', 'anaplastic', 'hurthle-cell', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorSizeCm: { type: 'number' },
    extrathyroidalExtension: { type: 'boolean' },
    grossResidualDisease: { type: 'boolean' },
    recurrentLaryngealNerveInvolvement: { type: 'boolean' },
    trachealOrEsophagealInvasion: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' },
    iodineAvid: { type: 'boolean' },
    radioiodineRefractory: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    molecularFinding: { type: 'string' },
    priorNeckRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const THYROID_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/thyroid-result.json',
  title: 'Thyroid cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.thyroid'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['head-neck'] },
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

const thyroidTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'Ultrasonografi/CT/MRI/PET ile tanımlanan tiroid yatağı veya nodal nüks.' : 'Tiroid yatağı, makroskopik rezidüel hastalık ve patolojik servikal nodlar.', dose, margin: 'Makroskopik tümör, rezidüel hastalık ve cerrahi klipler' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı ve ilgili boyun nodal alanları; yeniden ışınlamada daraltılmış bireysel hacim.' : 'Tiroid yatağı, trakeoözofageal oluk, santral/lateral boyun risk alanları ve tümör yayılımına göre superior mediastinal alan.', dose, margin: 'Cerrahi, görüntüleme, patoloji ve lenfatik drenaja göre' },
  { name: 'PTV', description: 'Boyun immobilizasyonu, yutkunma hareketi ve günlük IGRT belirsizliği.', dose, margin: 'IGRT ile yaklaşık 3-5 mm' },
];

const thyroidOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Esophagus', metric: 'Dmean', limit: 34, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Neck radiotherapy esophageal objective' },
  { organ: 'Larynx', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Laryngeal edema and aspiration objective' },
  { organ: 'Contralateral parotid', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Salivary gland preservation objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Lower neck nodal irradiation objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class ThyroidDecisionEngine extends BaseDecisionEngine<ThyroidInput> {
  public readonly id = 'head-neck.thyroid';
  public readonly version = '1.0.0';
  public readonly inputSchema = THYROID_INPUT_JSON_SCHEMA;
  public readonly outputSchema = THYROID_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: ThyroidInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const differentiated = input.histology === 'papillary' || input.histology === 'follicular' || input.histology === 'hurthle-cell';
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.grossResidualDisease === true || input.extrathyroidalExtension === true || input.trachealOrEsophagealInvasion === true || input.recurrentLaryngealNerveInvolvement === true || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0);

    if (input.priorNeckRT) warnings.push('Önceki boyun RT mevcut; spinal kord, larenks, özofagus, parotis, brakiyal pleksus ve karotis kümülatif dozları hesaplanmalıdır.');
    if (input.histology === 'anaplastic') warnings.push('Anaplastik tiroid kanseri hızla ilerleyebilir; hava yolu güvenliği, acil doku tanısı/moleküler profil ve cerrahi-radyasyon-medikal onkoloji MDT değerlendirmesi geciktirilmemelidir.');
    if (input.radioiodineRefractory) rationale.push('Radyoaktif iyot refrakter hastalıkta ek RAI beklenen yararı sağlamaz; progresyon, semptom ve moleküler hedeflere göre sistemik tedavi veya lokal RT değerlendirilir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; seçilmiş makroskopik rezidüel/inoperabl hastalıkta IMRT');
      recommendations.push({
        id: 'new-thyroid-cancer',
        label: input.histology === 'anaplastic' ? 'Acil hava yolu/cerrahi değerlendirme + definitif kemoradyoterapi ve moleküler hedefleme' : differentiated ? 'Risk-adapte tiroidektomi/boyun diseksiyonu + seçilmiş RAI ve adjuvan boyun RT' : 'Histolojiye göre cerrahi, sistemik tedavi ve seçilmiş adjuvan/definitif RT',
        indication: highRisk || input.histology === 'anaplastic' ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: highRisk || input.histology === 'anaplastic' ? definitiveDose : undefined,
        targetVolumes: highRisk || input.histology === 'anaplastic' ? thyroidTargets(definitiveDose) : undefined,
        oarConstraints: highRisk || input.histology === 'anaplastic' ? thyroidOars : undefined,
        systemicTherapy: input.histology === 'anaplastic'
          ? [systemic('concurrent', 'Moleküler profile göre kemoradyoterapi ve BRAF/MEK hedefli yaklaşım', ['taxane/platinum', 'dabrafenib + trametinib BRAF V600E durumunda'], 'Acil lokal kontrol ve sistemik hastalık değerlendirmesiyle', '2A')]
          : [systemic('adjuvant', differentiated ? 'Levotiroksin baskılama ve seçilmiş diferansiye hastalıkta radyoaktif iyot' : 'Histolojiye özgü adjuvan sistemik tedavi', differentiated ? ['levothyroxine', 'I-131 uygun hastada'] : ['multidisipliner sistemik tedavi'], 'Cerrahi ve patolojik risk sonrası', 'A')],
        rationale: [
          'Diferansiye tiroid kanserinde temel tedavi risk-adapte lobektomi/total tiroidektomi ve gerekli boyun diseksiyonudur; RAI seçimi histoloji, rezidüel hastalık ve metastaz riskine göre yapılır.',
          'Eksternal RT rutin düşük riskli diferansiye hastalıkta kullanılmaz; gross rezidü, unresectable hastalık, tekrarlayan lokal hastalık veya yüksek riskli mikroskopik hastalıkta seçilmiş endikasyondur.',
          'Anaplastik tiroid kanserinde hava yolu ve cerrahi rezektabilite ile birlikte acil RT, sistemik tedavi ve BRAF/MEK hedefli yaklaşım değerlendirilir.',
          'Elektif boyun/superior mediastinal kapsam tümör yayılımı ve nodal riskine göre bireyselleştirilir; torasik ENI rutin değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = highRisk || input.histology === 'anaplastic' ? 'indicated' : 'conditional';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; tiroid yatağı ± santral/lateral boyun boostu');
      recommendations.push({
        id: 'postoperative-thyroid-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif boyun IMRT' : differentiated ? 'RAI ve patolojik riske göre adjuvan RT veya yakın izlem' : 'Histolojiye göre adjuvan tedavi ve risk-adapte boyun RT',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? thyroidTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? thyroidOars : undefined,
        systemicTherapy: differentiated ? [systemic('adjuvant', 'TSH baskılama ve uygun hastada radyoaktif iyot', ['levothyroxine', 'I-131'], 'Patolojik risk ve iyot aviditesine göre', 'A')] : undefined,
        rationale: [
          'Gross rezidü, pozitif/çok yakın marjin, trakea/özofagus invazyonu, tekrarlayan laringeal sinir tutulumu ve seçilmiş yüksek riskli mikroskopik hastalık postoperatif RT lehinedir.',
          'Diferansiye hastalıkta RAI ile tedavi edilebilen mikroskopik/rezidüel hastalıkta EBRT yerine önce RAI değerlendirilir; RAI refrakter veya anatomik olarak yüksek riskli hastalıkta EBRT öne çıkar.',
          'Medüller tiroid kanserinde RAI etkili değildir; nodal, marjin ve lokal invazyon riskine göre cerrahi ve EBRT planlanır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kritik yapılardan uzak nüks');
      const previouslyIrradiated = input.priorNeckRT === true;
      recommendations.push({
        id: 'recurrent-thyroid-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya hedefli sistemik tedavi' : 'Kompartman cerrahisi ve/veya salvage boyun RT; iyot aviditesine göre RAI',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: thyroidTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: thyroidOars,
        systemicTherapy: [systemic('palliative', 'RAI aviditesine veya moleküler değişikliğe göre I-131, multikinaz/RET/NTRK hedefli tedavi', ['I-131 uygun hastada', 'lenvatinib/sorafenib', 'selpercatinib RET', 'larotrectinib/entrectinib NTRK'], 'Progresyon, semptom ve organ fonksiyonuna göre', '1')],
        rationale: [
          'Rezeke edilebilir lokal nükste kompartman cerrahisi tercih edilebilir; RAI avid diferansiye hastalıkta uygun I-131 lokal tedaviden önce değerlendirilir.',
          'Önceki boyun RT sonrası re-irradiation; trakea/özofagus, spinal kord, karotis ve brakiyal pleksus kümülatif dozları ile fistül/nekroz riski hesaplanmadan uygulanmamalıdır.',
          'RAI refrakter progresyonda lenvatinib/sorafenib veya RET/NTRK gibi hedefli tedaviler, moleküler profil ve klinik çalışmayla birlikte değerlendirilir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-thyroid-cancer',
        label: 'Histoloji/moleküler profile göre sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? thyroidTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? thyroidOars : undefined,
        systemicTherapy: [systemic('palliative', 'RAI, multikinaz, RET/NTRK veya anaplastik hastalıkta BRAF/MEK hedefli tedavi', ['I-131', 'lenvatinib/sorafenib', 'selpercatinib', 'larotrectinib', 'dabrafenib + trametinib'], 'İyot aviditesi, moleküler profil, progresyon ve performansa göre', '1')],
        rationale: [
          'Metastatik tiroid kanserinde sistemik tedavi ana yaklaşımdır; RT ağrı, kanama, hava yolu/özofagus basısı, spinal kord riski veya sınırlı metastaz için kullanılır.',
          'Anaplastik ve medüller histolojilerde hızlı progresyon, hava yolu güvenliği ve moleküler hedefler acil MDT kararını gerektirir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü, iyot aviditesi, semptomlar ve seçilmiş oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'head-neck',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Tiroid kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, ultrasonografi/CT/MRI/PET, iyot aviditesi, moleküler profil ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const thyroidEngine = new ThyroidDecisionEngine();
