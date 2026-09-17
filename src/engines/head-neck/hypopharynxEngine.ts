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

export type HypopharynxSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type HypopharynxHistology = 'squamous-cell' | 'adenocarcinoma' | 'other' | 'unknown';
export type HypopharynxStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type HypopharynxSurgery = 'none' | 'transoral-resection' | 'partial-pharyngectomy' | 'laryngopharyngectomy' | 'neck-dissection' | 'unknown';
export type HypopharynxMolecularFinding = 'PD-L1-positive' | 'HPV-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'HER2-positive' | 'none' | 'unknown';

export interface HypopharynxInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'hypopharyngeal-cancer';
  setting: HypopharynxSetting;
  stage?: TNMStage;
  stageGroup?: HypopharynxStage;
  histology?: HypopharynxHistology;
  subsite?: 'pyriform-sinus' | 'postcricoid' | 'posterior-pharyngeal-wall' | 'unknown';
  tCategory?: string;
  nCategory?: string;
  tumorSizeCm?: number;
  laryngealFunctionPreserved?: boolean;
  cartilageInvasion?: boolean;
  esophagealInvasion?: boolean;
  bulkyNeckNodes?: boolean;
  bilateralNeckNodes?: boolean;
  extranodalExtension?: boolean;
  distantMetastases?: string[];
  surgeryType?: HypopharynxSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  positiveNodes?: number;
  priorHeadNeckRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
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
  title: 'ASTRO clinical practice resources for head and neck cancer radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for head and neck target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 91-11: larynx preservation with concurrent chemoradiotherapy', url: 'https://doi.org/10.1016/S0140-6736(03)13938-9', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 9501: postoperative concurrent chemoradiotherapy for high-risk head and neck cancer', url: 'https://doi.org/10.1200/JCO.2004.07.082', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 22931: postoperative radiotherapy with or without chemotherapy in high-risk head and neck cancer', url: 'https://doi.org/10.1016/S0140-6736(04)17021-9', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-048: pembrolizumab for recurrent or metastatic head and neck squamous-cell carcinoma', url: 'https://doi.org/10.1056/NEJMoa1814564', evidenceLevel: '1' },
  { organization: 'other', title: 'GORTEC 2017-01 (TPExtreme): pembrolizumab plus platinum/5-FU and cetuximab in recurrent/metastatic HNSCC', url: 'https://doi.org/10.1016/S0140-6736(19)32514-5', evidenceLevel: '1' },
];

export const HYPOPHARYNX_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/hypopharynx-input.json',
  title: 'Hypopharyngeal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['hypopharyngeal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'other', 'unknown'] },
    subsite: { type: 'string', enum: ['pyriform-sinus', 'postcricoid', 'posterior-pharyngeal-wall', 'unknown'] },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    tumorSizeCm: { type: 'number' },
    laryngealFunctionPreserved: { type: 'boolean' },
    cartilageInvasion: { type: 'boolean' },
    esophagealInvasion: { type: 'boolean' },
    bulkyNeckNodes: { type: 'boolean' },
    bilateralNeckNodes: { type: 'boolean' },
    extranodalExtension: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    positiveNodes: { type: 'number' },
    priorHeadNeckRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const HYPOPHARYNX_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/hypopharynx-result.json',
  title: 'Hypopharyngeal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.hypopharynx'] },
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

const hypopharynxTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan hipofarinks, neofarenks veya nodal nüks.' : 'Primer hipofarinks tümörü ve görüntülenebilir servikal nodal hastalık; endoskopi, kontrastlı CT/MRI ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör ve patolojik nodlar' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı ve önceki risk alanları; re-irradiation için daraltılmış, anatomik ve cerrahi bulgulara göre.' : 'Primer hipofarinks, paraglottik/postcricoid risk alanları, bilateral retropharyngeal ve servikal nodal seviyeler; alt boyun/supraklaviküler alan risk durumuna göre.', dose, margin: 'Submukozal yayılım, perinöral risk ve lenfatik drenaja göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, yutkunma/solunum hareketi ve günlük IGRT belirsizliği.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; adaptif planlama önerilir' },
];

const hypopharynxOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Oral cavity', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Head and neck mucosal toxicity objective' },
  { organ: 'Larynx', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Larynx preservation and edema objective' },
  { organ: 'Constrictor muscles', metric: 'Dmean', limit: 50, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Dysphagia mitigation objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Head and neck nodal irradiation brachial plexus objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class HypopharynxDecisionEngine extends BaseDecisionEngine<HypopharynxInput> {
  public readonly id = 'head-neck.hypopharynx';
  public readonly version = '1.0.0';
  public readonly inputSchema = HYPOPHARYNX_INPUT_JSON_SCHEMA;
  public readonly outputSchema = HYPOPHARYNX_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: HypopharynxInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const advanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.tCategory === 'T3' || input.tCategory === 'T4' || input.nCategory === 'N2' || input.nCategory === 'N3';

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; spinal kord, beyin sapı, parotisler, larenks, farengeal konstriktörler ve brakiyal pleksus kümülatif dozları hesaplanmalıdır.');
    if (input.laryngealFunctionPreserved === false) warnings.push('Larengeal fonksiyon korunmamış; organ koruma yaklaşımı yerine güvenli cerrahi ve hava yolu/yutma rehabilitasyonu önceliklendirilebilir.');
    if (input.esophagealInvasion) rationale.push('Servikal özofagus uzanımı mevcut; alt boyun/supraklaviküler alan ve gastrointestinal/torasik MDT değerlendirmesi gereklidir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(70, 35, 'conventional', '70 Gy / 35 fx; primer PTV70 ve elektif nodal PTV54-60 ile IMRT/VMAT');
      const organPreservationCandidate = input.laryngealFunctionPreserved !== false && input.cartilageInvasion !== true;
      recommendations.push({
        id: 'new-hypopharyngeal-cancer',
        label: advanced && organPreservationCandidate ? 'Organ koruma amacıyla eşzamanlı kemoradyoterapi ± indüksiyon kemoterapisi' : 'Cerrahi rezeksiyon/larengofaringektomi veya definitif RT; MDT ve organ fonksiyonuna göre',
        indication: 'indicated',
        intent: 'curative',
        fractionation: definitiveDose,
        targetVolumes: hypopharynxTargets(definitiveDose),
        oarConstraints: hypopharynxOars,
        systemicTherapy: advanced
          ? [systemic('induction', 'Seçilmiş bulky lokal ileri hastada indüksiyon sistemik tedavi', ['docetaxel', 'cisplatin', '5-FU veya kurum protokolü'], 'Organ koruma ve yanıt değerlendirmesi için KRT öncesi', '2A'), systemic('concurrent', 'Cisplatin bazlı eşzamanlı kemoradyoterapi', ['cisplatin'], 'Haftalık veya 3 haftada bir; renal fonksiyon ve performansa göre', '1')]
          : [systemic('concurrent', 'Seçilmiş yüksek riskli hastada cisplatin bazlı KRT', ['cisplatin'], 'Definitif RT ile eşzamanlı', '2A')],
        rationale: [
          'Hipofarinks kanserinde erken evrede transoral/parsiyel rezeksiyon ve uygun boyun diseksiyonu; ileri evrede ise organ koruma veya total larengofaringektomi arasında fonksiyon, rezektabilite ve hasta tercihine göre seçim yapılır.',
          'Definitif RT planında primer tümör ve makroskopik nodlara yaklaşık 70 Gy, mikroskopik risk alanlarına 54-60 Gy; bilateral servikal ve retropharyngeal drenaj alanları risk-adapte kapsanır.',
          'Lokal ileri ve larengeal fonksiyonu korunmuş seçilmiş hastalarda eşzamanlı cisplatin ile organ koruma yaklaşımı değerlendirilebilir; cerrahi dışı tedavi güvenli rezeksiyon olasılığı ve yutma/solunum fonksiyonlarıyla birlikte kararlaştırılır.',
          'RTOG 91-11 organ koruma stratejilerinde eşzamanlı KRT yaklaşımını; RTOG 9501 ve EORTC 22931 pozitif marjin/ekstranodal yayılım gibi yüksek riskli postoperatif özelliklerde eşzamanlı tedaviyi destekler.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; cerrahi yatak ve riskli boyun alanları');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.bulkyNeckNodes === true;
      recommendations.push({
        id: 'postoperative-hypopharyngeal-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif IMRT + eşzamanlı cisplatin' : 'Patolojiye göre adjuvan boyun/primer yatak RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? hypopharynxTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? hypopharynxOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Pozitif marjin veya ekstranodal yayılımda cisplatin bazlı postoperatif KRT', ['cisplatin'], 'RT ile eşzamanlı; uygun renal ve işitme fonksiyonunda', '1')] : undefined,
        rationale: [
          'Pozitif marjin, ekstranodal yayılım, çoklu pozitif nod, T3/T4 hastalık veya yakın cerrahi yatak yüksek lokal-bölgesel nüks riski taşır.',
          'Postoperatif CTV; primer cerrahi yatak, preoperatif tümör uzanımı, trakeo/özofageal komşuluk ve boyun nodal istasyonlarını cerrahi klipler ve patolojiyle birleştirerek kapsamalıdır.',
          'Düşük riskli R0 rezeksiyonda adjuvan RT kararı tümör boyutu, nodal yük, LVSI, perinöral invazyon ve fonksiyonel morbidite ile bireyselleştirilir.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kritik yapılardan uzak nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-hypopharyngeal-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik tedavi' : 'Salvage cerrahi veya definitive salvage IMRT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: hypopharynxTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: hypopharynxOars,
        systemicTherapy: [systemic('palliative', 'PD-L1 ve klinik duruma göre pembrolizumab veya platin/5-FU/cetuximab', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Nüks, önceki platin ve PD-L1 CPS durumuna göre', '1')],
        rationale: [
          'İzole lokal nükste R0 salvage cerrahi mümkünse değerlendirilir; daha önce RT uygulanmamış alanda definitive salvage RT seçilmiş hastalarda küratif olabilir.',
          'Önceki RT sonrası yeniden ışınlama; larenks, konstriktör kaslar, spinal kord, karotis, brakiyal pleksus ve özofagus kümülatif dozları ile aspirasyon/fistül riskleri hesaplanmadan uygulanmamalıdır.',
          'Küçük, iyi sınırlı nükslerde SBRT düşünülebilir; larenks/özofagus komşuluğunda fraksiyone tedavi ve cerrahi çoğu zaman daha güvenli seçeneklerdir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik hipofarinks/boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-hypopharyngeal-cancer',
        label: 'Sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? hypopharynxTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? hypopharynxOars : undefined,
        systemicTherapy: [systemic('palliative', 'PD-L1 CPS ve önceki tedaviye göre pembrolizumab veya platin/5-FU/cetuximab', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Performans durumu, organ fonksiyonu ve önceki tedavilere göre', '1')],
        rationale: [
          'Metastatik hipofarinks kanserinde sistemik tedavi ana yaklaşımdır; RT kanama, ağrı, disfaji, hava yolu riski veya sınırlı metastaz için kullanılır.',
          'Beslenme, aspirasyon ve hava yolu güvenliği tedavi kararının parçasıdır; gerekirse enteral beslenme ve hava yolu desteği planlanır.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
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
      summary: recommendations[0]?.label ?? 'Hipofarinks kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, endoskopi, MRI/PET-CT, patoloji ve fonksiyonel larenks/yutma değerlendirmesi kurum içinde doğrulanmalıdır.'],
      confidence: 0.83,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const hypopharynxEngine = new HypopharynxDecisionEngine();
