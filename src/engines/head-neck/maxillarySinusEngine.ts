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

export type MaxillarySetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type MaxillaryHistology = 'squamous-cell' | 'adenocarcinoma' | 'adenoid-cystic' | 'mucosal-melanoma' | 'olfactory-neuroblastoma' | 'other' | 'unknown';
export type MaxillaryStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type MaxillarySurgery = 'none' | 'endoscopic-resection' | 'partial-maxillectomy' | 'total-maxillectomy' | 'craniofacial-resection' | 'neck-dissection' | 'unknown';
export type MaxillaryMolecularFinding = 'NTRK-fusion' | 'HER2-positive' | 'EGFR-altered' | 'BRAF-altered' | 'PD-L1-positive' | 'MSI-H' | 'TMB-high' | 'none' | 'unknown';

export interface MaxillarySinusInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'maxillary-sinus-cancer';
  setting: MaxillarySetting;
  stage?: TNMStage;
  stageGroup?: MaxillaryStage;
  histology?: MaxillaryHistology;
  surgeryType?: MaxillarySurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tCategory?: string;
  nCategory?: string;
  tumorSizeCm?: number;
  orbitalInvasion?: boolean;
  orbitalApexInvolvement?: boolean;
  skullBaseInvasion?: boolean;
  cavernousSinusInvolvement?: boolean;
  perineuralInvasion?: boolean;
  namedNerveInvasion?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  distantMetastases?: string[];
  priorHeadNeckRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: MaxillaryMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Head and Neck Cancers',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1437',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for sinonasal and head and neck radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for sinonasal cancer target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 9501: postoperative concurrent chemoradiotherapy for high-risk head and neck cancer', url: 'https://doi.org/10.1200/JCO.2004.07.082', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 22931: postoperative radiotherapy with or without chemotherapy in high-risk head and neck cancer', url: 'https://doi.org/10.1016/S0140-6736(04)17021-9', evidenceLevel: '1' },
  { organization: 'other', title: 'PARADIGM: induction chemotherapy and chemoradiotherapy in locally advanced head and neck cancer', url: 'https://doi.org/10.1016/S0140-6736(13)61683-6', evidenceLevel: '2A' },
  { organization: 'other', title: 'RTOG 0912: proton therapy for sinonasal malignancies', url: 'https://clinicaltrials.gov/study/NCT01236547', evidenceLevel: '2B' },
  { organization: 'other', title: 'Larotrectinib in NTRK fusion-positive solid tumors', url: 'https://doi.org/10.1056/NEJMoa1812624', evidenceLevel: '1' },
];

export const MAXILLARY_SINUS_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/maxillary-sinus-input.json',
  title: 'Maxillary sinus cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['maxillary-sinus-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'adenoid-cystic', 'mucosal-melanoma', 'olfactory-neuroblastoma', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    tumorSizeCm: { type: 'number' },
    orbitalInvasion: { type: 'boolean' },
    orbitalApexInvolvement: { type: 'boolean' },
    skullBaseInvasion: { type: 'boolean' },
    cavernousSinusInvolvement: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    namedNerveInvasion: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    priorHeadNeckRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const MAXILLARY_SINUS_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/maxillary-sinus-result.json',
  title: 'Maxillary sinus cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.maxillary-sinus'] },
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

const maxillaryTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan maksiller sinüs, orbital/skull-base veya nodal nüks.' : 'Primer maksiller sinüs tümörü ve görüntülenebilir nodal hastalık; sinonazal endoskopi, MRI/CT ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör ve patolojik nodlar' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı, cerrahi alan ve ilgili perinöral/skull-base risk yolu; re-irradiation için daraltılmış hacim.' : 'Maksiller sinüs, komşu sinonazal/kemik risk alanları, orbital/skull-base yayılım ve seçilmiş servikal nodal seviyeler.', dose, margin: 'Kemik, perinöral ve mukozal yayılım ile cerrahi bulgulara göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, sinonazal hareket ve günlük IGRT belirsizliği.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; proton/IMRT ve adaptif planlama değerlendirilebilir' },
];

const maxillaryOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Sinonasal brainstem objective' },
  { organ: 'Optic nerves/chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Optic pathway objective' },
  { organ: 'Globe', metric: 'Dmean', limit: 35, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Sinonasal globe preservation objective' },
  { organ: 'Lens', metric: 'Dmax', limit: 10, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Sinonasal lens objective' },
  { organ: 'Contralateral parotid', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Salivary gland preservation objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Head and neck nodal irradiation brachial plexus objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MaxillarySinusDecisionEngine extends BaseDecisionEngine<MaxillarySinusInput> {
  public readonly id = 'head-neck.maxillary-sinus';
  public readonly version = '1.0.0';
  public readonly inputSchema = MAXILLARY_SINUS_INPUT_JSON_SCHEMA;
  public readonly outputSchema = MAXILLARY_SINUS_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: MaxillarySinusInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const advanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.tCategory === 'T3' || input.tCategory === 'T4' || input.nCategory === 'N2' || input.nCategory === 'N3';
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.perineuralInvasion === true || input.namedNerveInvasion === true || input.orbitalApexInvolvement === true || input.skullBaseInvasion === true || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0);

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; optik yollar, göz, beyin sapı, spinal kord, karotis ve beyin kümülatif dozları hesaplanmalıdır.');
    if (input.orbitalApexInvolvement || input.cavernousSinusInvolvement) warnings.push('Orbital apeks/kavernöz sinüs tutulumu mevcut; nöro-oftalmolojik değerlendirme, yüksek çözünürlüklü MRI ve optik yapı doz optimizasyonu zorunludur.');
    if (input.namedNerveInvasion) rationale.push('Adlandırılmış sinir/perinöral yayılım mevcut; ilgili sinir trasesi ve kafa tabanı foramenleri CTV’ye eklenmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; seçilmiş inoperabl hastada sinonazal primer PTV66 ve risk alanları');
      recommendations.push({
        id: 'new-maxillary-sinus-cancer',
        label: advanced ? 'Kraniofasiyal/endoskopik rezeksiyon + risk-adapte postoperatif RT veya seçilmiş definitif IMRT' : 'R0 hedefli maksillektomi/endoskopik rezeksiyon ve histolojiye göre adjuvan RT',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: definitiveDose,
        targetVolumes: maxillaryTargets(definitiveDose),
        oarConstraints: maxillaryOars,
        systemicTherapy: [systemic('concurrent', 'Seçilmiş yüksek riskli veya inoperabl hastada platin bazlı eşzamanlı KRT; rutin histoloji bağımlıdır', ['cisplatin veya carboplatin'], 'MDT, histoloji ve renal/işitme fonksiyonuna göre', '2B')],
        rationale: [
          'Maksiller sinüs kanserinde temel yaklaşım, orbit ve skull-base ilişkisini dikkate alan R0 hedefli endoskopik/parsiyel-total maksillektomi veya kraniofasiyal rezeksiyondur.',
          'Pozitif marjin, orbital apeks/skull-base invazyonu, adlandırılmış sinir tutulumu, perinöral yayılım, nodal hastalık ve yüksek derece histoloji postoperatif RT lehinedir.',
          'Postoperatif CTV primer cerrahi yatağı, tümörün preoperatif uzanımı, kemik/orbit risk alanları ve varsa sinir trasesini kapsamalıdır.',
          'Sinonazal tümörlerde proton/IMRT, optik yollar ve göz dozlarını azaltmak için teknik seçeneklerdir; RTOG 0912 proton tabanlı yaklaşım için önemli bir çalışmadır.',
          'Elektif boyun tedavisi histoloji, T/N evresi ve subsite riskine göre seçilir; rutin torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; maksiller sinüs cerrahi yatağı ± perinöral/skull-base boost');
      recommendations.push({
        id: 'postoperative-maxillary-sinus-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif sinonazal IMRT/proton tedavisi' : 'Risk-adapte postoperatif maksiller sinüs yatağı RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? maxillaryTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? maxillaryOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Seçilmiş yüksek riskli hastada platin bazlı eşzamanlı tedavi', ['cisplatin veya carboplatin'], 'Pozitif marjin/nodal hastalıkta; histoloji ve organ fonksiyonuna göre', '2B')] : undefined,
        rationale: [
          'Pozitif/çok yakın marjin, perinöral veya adlandırılmış sinir tutulumu, orbital/skull-base invazyonu ve nodal hastalık postoperatif RT endikasyonunu güçlendirir.',
          'Optik sinir/kiazma, retina, lens, göz ve beyin dozları ile hedef kapsamı arasında yüksek hassasiyetli IMRT/proton optimizasyonu gerekir.',
          'Adenoid kistik karsinomda sinir trasesi boyunca kafa tabanına uzanan CTV, lokal kontrol için özellikle önemlidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve optik yapılardan uzak fokal nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-maxillary-sinus-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik hedefli tedavi' : 'Salvage cerrahi ve/veya definitive sinonazal IMRT/proton',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: maxillaryTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: maxillaryOars,
        systemicTherapy: [systemic('palliative', 'Histoloji ve moleküler değişikliğe göre hedefli tedavi veya klinik çalışma', ['NTRK hedefli tedavi', 'PD-1 inhibitörü', 'platin bazlı tedavi'], 'Progresyon, semptom ve biyobelirteçlere göre', '2A')],
        rationale: [
          'İzole lokal nükste yeniden rezeksiyon ve/veya daha önce ışınlanmamış alanda salvage RT seçilmiş hastalarda küratif olabilir.',
          'Önceki RT sonrası re-irradiation; optik sinir/kiazma, göz, beyin, beyin sapı, karotis ve kemik nekrozu riskleriyle birlikte planlanmalıdır.',
          'Optik yapılara yakın nükslerde SBRT yerine fraksiyone yaklaşım veya cerrahi daha güvenli olabilir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik sinonazal veya metastatik odak');
      recommendations.push({
        id: 'metastatic-maxillary-sinus-cancer',
        label: 'Histoloji/moleküler profile göre sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? maxillaryTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? maxillaryOars : undefined,
        systemicTherapy: [systemic('palliative', 'NTRK/PD-1/platin bazlı veya histolojiye özgü sistemik tedavi', ['larotrectinib/entrectinib', 'PD-1 inhibitor', 'platinum-based therapy'], 'Biyobelirteç, performans ve önceki tedavilere göre', '2A')],
        rationale: [
          'Metastatik maksiller sinüs kanserinde sistemik tedavi ve klinik çalışma ana seçeneklerdir; RT ağrı, kanama, görme/kraniyal sinir semptomu veya sınırlı metastaz için kullanılır.',
          'Sinonazal melanom, adenoid kistik karsinom ve adenokarsinom gibi histolojiler farklı sistemik ve lokal tedavi stratejileri gerektirir.',
        ],
        guidelineReferences: references(TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü, semptomlar ve seçilmiş oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'head-neck',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Maksiller sinüs kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, sinonazal endoskopi, MRI/PET-CT, göz/nöro-oftalmolojik değerlendirme ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.81,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const maxillarySinusEngine = new MaxillarySinusDecisionEngine();
