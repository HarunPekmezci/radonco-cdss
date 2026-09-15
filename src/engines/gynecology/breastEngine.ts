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

export type BreastSetting = 'newly-diagnosed' | 'postoperative' | 'neoadjuvant' | 'recurrent' | 'metastatic';
export type BreastLaterality = 'left' | 'right' | 'bilateral' | 'unknown';
export type BreastSubtype = 'hormone-receptor-positive' | 'HER2-positive' | 'triple-negative' | 'unknown';
export type BreastSurgery = 'none' | 'lumpectomy' | 'mastectomy' | 'reconstruction' | 'unknown';
export type BreastMolecularFinding = 'ER-positive' | 'PR-positive' | 'HER2-positive' | 'HER2-low' | 'BRCA1/2' | 'germline-PALB2' | 'PD-L1-positive' | 'none' | 'unknown';
export type BreastMenopause = 'premenopausal' | 'postmenopausal';
export type BreastPathologicT = 'pT1a-c' | 'pT2' | 'pT3' | 'pT4a-d';
export type BreastPathologicN = 'pN0' | 'pN1a' | 'pN2a' | 'pN3a';

export interface BreastInput extends ClinicalCaseInput {
  organSystem: 'breast';
  disease: 'breast-cancer';
  setting: BreastSetting;
  stage?: TNMStage;
  laterality?: BreastLaterality;
  subtype?: BreastSubtype;
  molecularFinding?: BreastMolecularFinding;
  surgeryType?: BreastSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  grade?: 1 | 2 | 3;
  lymphovascularSpaceInvasion?: boolean;
  axillaryNodePositive?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  sentinelNodePositive?: boolean;
  inflammatoryBreastCancer?: boolean;
  skinOrChestWallInvasion?: boolean;
  reconstructionPlanned?: boolean;
  priorBreastRT?: boolean;
  distantMetastases?: string[];
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  menopause?: BreastMenopause;
  pathologicT?: BreastPathologicT;
  pathologicN?: BreastPathologicN;
  erPercent?: number;
  prPercent?: number;
  her2Status?: 'positive' | 'negative';
  ki67Percent?: number;
  marginStatus?: 'negative' | 'positive' | 'close';
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Breast Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1419',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO Clinical Practice Guideline: Whole Breast Irradiation and Partial Breast Irradiation',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus recommendations for breast radiotherapy and target delineation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'EBCTCG: effects of radiotherapy after breast-conserving surgery', url: 'https://doi.org/10.1016/S0140-6736(11)61629-2', evidenceLevel: '1' },
  { organization: 'other', title: 'FAST-Forward: five-fraction adjuvant breast radiotherapy', url: 'https://doi.org/10.1016/S0140-6736(20)30932-6', evidenceLevel: '1' },
  { organization: 'other', title: 'ACOSOG Z0011: sentinel-node surgery in breast-conserving treatment', url: 'https://doi.org/10.1001/jama.2011.1880', evidenceLevel: '1' },
  { organization: 'other', title: 'AMAROS: axillary radiotherapy versus axillary lymph-node dissection', url: 'https://doi.org/10.1016/S0140-6736(14)61688-8', evidenceLevel: '1' },
  { organization: 'other', title: 'NSABP B-51/RTOG 1304: regional nodal irradiation after neoadjuvant response', url: 'https://doi.org/10.1056/NEJMoa2313488', evidenceLevel: '1' },
];

export const BREAST_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/breast-input.json',
  title: 'Breast cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['breast'] },
    disease: { type: 'string', enum: ['breast-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'neoadjuvant', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    laterality: { type: 'string', enum: ['left', 'right', 'bilateral', 'unknown'] },
    subtype: { type: 'string', enum: ['hormone-receptor-positive', 'HER2-positive', 'triple-negative', 'unknown'] },
    molecularFinding: { type: 'string' },
    surgeryType: { type: 'string', enum: ['none', 'lumpectomy', 'mastectomy', 'reconstruction', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorSizeCm: { type: 'number' },
    grade: { type: 'number' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    axillaryNodePositive: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' },
    sentinelNodePositive: { type: 'boolean' },
    inflammatoryBreastCancer: { type: 'boolean' },
    skinOrChestWallInvasion: { type: 'boolean' },
    reconstructionPlanned: { type: 'boolean' },
    priorBreastRT: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    menopause: { type: 'string', enum: ['premenopausal', 'postmenopausal'] },
    pathologicT: { type: 'string', enum: ['pT1a-c', 'pT2', 'pT3', 'pT4a-d'] },
    pathologicN: { type: 'string', enum: ['pN0', 'pN1a', 'pN2a', 'pN3a'] },
    erPercent: { type: 'number' }, prPercent: { type: 'number' },
    her2Status: { type: 'string', enum: ['positive', 'negative'] }, ki67Percent: { type: 'number' },
    marginStatus: { type: 'string', enum: ['negative', 'positive', 'close'] },
  },
  additionalProperties: true,
};

export const BREAST_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/breast-result.json',
  title: 'Breast cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['breast.primary'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['breast'] },
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
  alphaBetaTumor: 4,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 4),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 4) / 8),
});

const breastTargets = (dose: Fractionation, regionalNodes = false): TargetVolume[] => [
  { name: 'GTV', description: 'Görüntülenebilir meme tümörü, cerrahi kavite/klipler veya makroskopik nodal hastalık.', dose, margin: 'Kavite, rezidüel tümör ve pozitif nod' },
  { name: 'CTV', description: regionalNodes ? 'Meme/göğüs duvarı ve seçilmiş aksiller, supraklaviküler ± internal mammary nodal risk alanları.' : 'Tüm meme veya göğüs duvarı ve cerrahi yatak; parsiyel meme RT seçilmiş düşük riskli hastada düşünülebilir.', dose, margin: 'Cerrahi klipler, görüntüleme ve anatomik bariyerlere göre' },
  { name: 'PTV', description: 'Solunum hareketi ve günlük kurulum belirsizliği; sol taraf için derin inspirasyon nefes tutma (DIBH) değerlendirilmeli.', dose, margin: 'IGRT ile yaklaşık 5-10 mm; boost kavitesinde kurum protokolüne göre' },
];

const breastOars: OARConstraint[] = [
  { organ: 'Heart', metric: 'Dmean', limit: 4, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Modern breast RT heart mean-dose objective' },
  { organ: 'Ipsilateral lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Breast/chest-wall lung objective' },
  { organ: 'Ipsilateral lung', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Breast/chest-wall lung mean-dose objective' },
  { organ: 'Contralateral breast', metric: 'Dmean', limit: 3, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Contralateral breast dose objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Regional nodal irradiation spinal cord objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class BreastDecisionEngine extends BaseDecisionEngine<BreastInput> {
  public readonly id = 'breast.primary';
  public readonly version = '1.0.0';
  public readonly inputSchema = BREAST_INPUT_JSON_SCHEMA;
  public readonly outputSchema = BREAST_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: BreastInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorBreastRT) warnings.push('Önceki meme RT öyküsü mevcut; yeniden ışınlamada kümülatif kalp, ipsilateral akciğer, cilt ve brakiyal pleksus dozları değerlendirilmelidir.');
    if (input.laterality === 'left') rationale.push('Sol taraflı tedavide DIBH ve modern kalp koruma teknikleri kalp ve LAD dozunu azaltmak için değerlendirilmelidir.');
    if (input.reconstructionPlanned) warnings.push('Mastektomi sonrası rekonstrüksiyon planı mevcut; PMRT kararı implant/otolog rekonstrüksiyon komplikasyonlarıyla birlikte multidisipliner verilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const wholeBreast = fraction(40.05, 15, 'moderate-hypofractionation', '40.05 Gy / 15 fx; tüm meme/göğüs duvarı');
      const fastForward = fraction(26, 5, 'moderate-hypofractionation', '26 Gy / 5 fx; FAST-Forward uygun hastada');
      const boost = fraction(10, 5, 'moderate-hypofractionation', '10 Gy / 5 fx; seçilmiş tümör yatağı boostu');
      const regional = fraction(40.05, 15, 'moderate-hypofractionation', '40.05 Gy / 15 fx; meme/göğüs duvarı ve bölgesel nodlar');
      const postMastectomy = input.surgeryType === 'mastectomy';
      const regionalRisk = input.axillaryNodePositive === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.pathologicN === 'pN2a' || input.pathologicN === 'pN3a' || input.skinOrChestWallInvasion === true || input.inflammatoryBreastCancer === true;
      const postMastectomyIndicated = postMastectomy && (regionalRisk || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.marginStatus === 'positive');
      const breastConservation = input.surgeryType === 'lumpectomy';
      const indicated = postMastectomy ? postMastectomyIndicated : breastConservation || regionalRisk;
      const dose = postMastectomy || regionalRisk ? regional : (input.menopause ? wholeBreast : fastForward);
      const subtype = input.subtype ?? (input.her2Status === 'positive' ? 'HER2-positive' : input.erPercent !== undefined && input.erPercent >= 1 ? (input.prPercent !== undefined && input.prPercent >= 1 ? 'hormone-receptor-positive' : 'hormone-receptor-positive') : 'triple-negative');
      recommendations.push({
        id: 'adjuvant-breast-radiotherapy',
        label: postMastectomy
          ? (postMastectomyIndicated ? 'Postmastektomi göğüs duvarı ve bölgesel nodal RT' : 'Patolojiye göre postmastektomi RT veya izlem')
          : (breastConservation ? 'Meme koruyucu cerrahi sonrası adjuvan tüm meme RT ± boost' : 'Cerrahi sonrası meme/göğüs duvarı ve nodal risk-adapte RT'),
        indication: indicated ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: indicated ? dose : undefined,
        targetVolumes: indicated ? [...breastTargets(dose, regionalRisk || postMastectomyIndicated), ...(breastConservation ? [{ name: 'Boost', description: 'Yüksek lokal nüks riskinde cerrahi tümör yatağı boostu.', dose: boost, margin: 'Klipler ve cerrahi kaviteye göre' }] : [])] : undefined,
        oarConstraints: indicated ? breastOars : undefined,
        systemicTherapy: [
          systemic('adjuvant', 'Moleküler alt tipe göre adjuvan sistemik tedavi', subtype === 'HER2-positive' ? ['trastuzumab ± pertuzumab', 'kemoterapi'] : subtype === 'hormone-receptor-positive' ? ['endokrin tedavi'] : subtype === 'triple-negative' ? ['kemoterapi'] : ['multidisipliner sistemik tedavi'], 'RT sıralaması kemoterapi, anti-HER2 ve endokrin tedavi planına göre belirlenir'),
        ],
        rationale: [
          'Meme koruyucu cerrahi sonrası RT lokal nüksü ve meme kanseri mortalitesini azaltır; EBCTCG verileri adjuvan RT yararını destekler.',
          'Postmastektomi RT; T3/T4 hastalık, pozitif marjin, nodal hastalık, inflamatuvar hastalık veya yüksek bölgesel nüks riskinde göğüs duvarı ve riskli nodal alanları kapsar.',
          'FAST-Forward 26 Gy/5 fraksiyon, uygun erken evre hastalarda tüm meme tedavisi için kabul gören bir hipofraksiyonasyon seçeneğidir; bölgesel nodal tedavide kurum/protokol uyumu gerekir.',
          'Sentinel nod pozitifliğinde aksiller diseksiyon ile bölgesel nodal RT arasındaki seçim Z0011 ve AMAROS verileri, neoadjuvan yanıt sonrası bölgesel RT kararı ise NSABP B-51 ile birlikte değerlendirilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3], TRIALS[4]),
      });
      rtIndication = indicated ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'neoadjuvant') {
      const neoadjuvantDose = fraction(40.05, 15, 'moderate-hypofractionation', 'Cerrahi öncesi RT rutin değildir; seçilmiş lokal ileri olguda 40.05 Gy / 15 fx');
      recommendations.push({
        id: 'neoadjuvant-breast-cancer',
        label: 'Neoadjuvan sistemik tedavi sonrası cerrahi; RT patolojik yanıt ve başlangıç evresine göre',
        indication: input.inflammatoryBreastCancer || input.skinOrChestWallInvasion ? 'conditional' : 'not-indicated',
        intent: 'neoadjuvant',
        fractionation: input.inflammatoryBreastCancer || input.skinOrChestWallInvasion ? neoadjuvantDose : undefined,
        targetVolumes: input.inflammatoryBreastCancer || input.skinOrChestWallInvasion ? breastTargets(neoadjuvantDose, true) : undefined,
        oarConstraints: input.inflammatoryBreastCancer || input.skinOrChestWallInvasion ? breastOars : undefined,
        systemicTherapy: [
          systemic('neoadjuvant', 'Alt tipe göre neoadjuvan kemoterapi ± anti-HER2 tedavi', input.subtype === 'HER2-positive' ? ['kemoterapi', 'trastuzumab ± pertuzumab'] : ['kemoterapi'], 'Cerrahi öncesi; rezidüel hastalık ve patolojik yanıt sonrası adjuvan plan güncellenir'),
        ],
        rationale: [
          'Meme kanserinde neoadjuvan yaklaşımın temeli sistemik tedavidir; RT çoğunlukla cerrahi sonrasına bırakılır.',
          'İnflamatuvar veya cilt/göğüs duvarı tutulumu olan seçilmiş, inoperabl lokal ileri hastalarda RT ve sistemik tedavi sıralaması MDT ile bireyselleştirilir.',
          'Neoadjuvan tedavi sonrası başlangıç nodal evresi ve patolojik yanıt, postmastektomi/bölgesel nodal RT kararında birlikte değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[4]),
      });
      rtIndication = input.inflammatoryBreastCancer || input.skinOrChestWallInvasion ? 'conditional' : 'not-indicated';
      intent = 'neoadjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş fokal oligorekürens');
      recommendations.push({
        id: 'recurrent-breast-cancer',
        label: input.priorBreastRT ? 'Önceki RT sonrası seçilmiş fokal re-irradiation/SBRT veya sistemik tedavi' : 'İzole lokal nükste salvage cerrahi ve yeniden adjuvan/definitif RT değerlendirmesi',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: input.symptomaticRecurrence ? salvageDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? breastTargets(salvageDose, input.axillaryNodePositive === true) : undefined,
        oarConstraints: input.symptomaticRecurrence ? breastOars : undefined,
        systemicTherapy: [systemic('palliative', 'Reseptör ve HER2 durumuna göre endokrin, anti-HER2, kemoterapi veya immünoterapi', ['endokrin/anti-HER2/kemoterapi seçenekleri'], 'Önceki tedavi ve metastatik yük ile birlikte', '2A')],
        rationale: [
          'İzole göğüs duvarı veya meme nüksünde rezeksiyon ve daha önce ışınlanmamış alanda RT; önceki RT sonrası seçilmiş yeniden ışınlama ile birlikte değerlendirilebilir.',
          'Yeniden ışınlama kalp, akciğer, cilt, brakiyal pleksus ve kaburga kümülatif dozları hesaplanmadan uygulanmamalıdır.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik meme/göğüs duvarı veya metastatik odak');
      recommendations.push({
        id: 'metastatic-breast-cancer',
        label: 'Sistemik tedavi ve semptomatik/metastatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? breastTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? breastOars : undefined,
        systemicTherapy: [
          systemic('palliative', 'Moleküler alt tipe göre metastatik sistemik tedavi', ['endokrin tedavi', 'anti-HER2 tedavi', 'kemoterapi', 'immünoterapi'], 'Performans durumu, organ fonksiyonu ve önceki tedavilere göre', '1'),
        ],
        rationale: [
          'Metastatik meme kanserinde sistemik tedavi ana tedavidir; RT ağrı, kanama, ülserasyon, nörolojik bası veya lokal progresyon için kullanılır.',
          'Oligometastatik hastalıkta seçilmiş ablativ RT kararı tümör biyolojisi, sistemik kontrol ve hedef güvenliği ile birlikte verilmelidir.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü ve semptomlarla birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'breast',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Meme kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, patoloji, biyobelirteçler ve görüntüleme kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const breastEngine = new BreastDecisionEngine();
