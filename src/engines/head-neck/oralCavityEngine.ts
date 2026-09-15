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

export type OralCavitySetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type OralCavityHistology = 'squamous-cell' | 'minor-salivary' | 'verrucous' | 'other' | 'unknown';
export type OralCavityStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type OralCavitySurgery = 'none' | 'wide-local-excision' | 'partial-glossectomy' | 'floor-of-mouth-resection' | 'mandibulectomy' | 'neck-dissection' | 'unknown';
export type OralCavityMolecularFinding = 'PD-L1-positive' | 'HPV-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'HER2-positive' | 'none' | 'unknown';

export interface OralCavityInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'oral-cavity-cancer';
  setting: OralCavitySetting;
  stage?: TNMStage;
  stageGroup?: OralCavityStage;
  histology?: OralCavityHistology;
  subsite?: 'lip' | 'buccal-mucosa' | 'oral-tongue' | 'floor-of-mouth' | 'hard-palate' | 'retromolar-trigone' | 'upper-lower-gingiva' | 'unknown';
  tCategory?: string;
  nCategory?: string;
  tumorSizeCm?: number;
  depthOfInvasionMm?: number;
  boneInvasion?: boolean;
  perineuralInvasion?: boolean;
  lymphovascularSpaceInvasion?: boolean;
  bulkyNeckNodes?: boolean;
  bilateralNeckNodes?: boolean;
  extranodalExtension?: boolean;
  distantMetastases?: string[];
  surgeryType?: OralCavitySurgery;
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
  title: 'ASTRO clinical practice resources for oral cavity and head and neck radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for oral cavity cancer target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 9501: postoperative concurrent chemoradiotherapy for high-risk head and neck cancer', url: 'https://doi.org/10.1200/JCO.2004.07.082', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 22931: postoperative radiotherapy with or without chemotherapy in high-risk head and neck cancer', url: 'https://doi.org/10.1016/S0140-6736(04)17021-9', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 1420: postoperative radiotherapy versus observation in early oral cavity cancer with adverse features', url: 'https://doi.org/10.1016/S0140-6736(23)00395-6', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-048: pembrolizumab for recurrent or metastatic head and neck squamous-cell carcinoma', url: 'https://doi.org/10.1056/NEJMoa1814564', evidenceLevel: '1' },
  { organization: 'other', title: 'GORTEC 2017-01 (TPExtreme): pembrolizumab plus platinum/5-FU and cetuximab in recurrent/metastatic HNSCC', url: 'https://doi.org/10.1016/S0140-6736(19)32514-5', evidenceLevel: '1' },
];

export const ORAL_CAVITY_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oral-cavity-input.json',
  title: 'Oral cavity cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['oral-cavity-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'minor-salivary', 'verrucous', 'other', 'unknown'] },
    subsite: { type: 'string', enum: ['lip', 'buccal-mucosa', 'oral-tongue', 'floor-of-mouth', 'hard-palate', 'retromolar-trigone', 'upper-lower-gingiva', 'unknown'] },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    tumorSizeCm: { type: 'number' },
    depthOfInvasionMm: { type: 'number' },
    boneInvasion: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
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

export const ORAL_CAVITY_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oral-cavity-result.json',
  title: 'Oral cavity cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.oral-cavity'] },
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

const oralCavityTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan oral kavite, mandibula veya servikal nodal nüks.' : 'Primer oral kavite tümörü ve görüntülenebilir servikal nodal hastalık; klinik muayene, endoskopi, MRI/CT ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör ve patolojik nodlar' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı, cerrahi alan ve seçilmiş önceki risk bölgeleri; re-irradiation için daraltılmış hacim.' : 'Primer subsite, cerrahi yatak, kemik/perinöral yayılım riski ve ipsilateral/bilateral servikal nodal seviyeler.', dose, margin: 'Submukozal, perinöral ve lenfatik yayılım ile anatomik bariyerlere göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, ağız/çene hareketi ve günlük IGRT belirsizliği.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; cilt ve ağız boşluğu dozları ayrıca optimize edilir' },
];

const oralCavityOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Oral cavity excluding target', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Oral cavity mucosal toxicity objective' },
  { organ: 'Mandible', metric: 'Dmax', limit: 70, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Head and neck osteoradionecrosis objective' },
  { organ: 'Pharyngeal constrictors', metric: 'Dmean', limit: 50, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Dysphagia mitigation objective' },
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

export class OralCavityDecisionEngine extends BaseDecisionEngine<OralCavityInput> {
  public readonly id = 'head-neck.oral-cavity';
  public readonly version = '1.0.0';
  public readonly inputSchema = ORAL_CAVITY_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ORAL_CAVITY_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: OralCavityInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const locallyAdvanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.tCategory === 'T3' || input.tCategory === 'T4' || input.nCategory === 'N2' || input.nCategory === 'N3';

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; spinal kord, parotisler, oral kavite, mandibula, cilt ve brakiyal pleksus kümülatif dozları hesaplanmalıdır.');
    if (input.boneInvasion) warnings.push('Mandibula/kemik invazyonu mevcut; rezeksiyon, osteoradyonekroz riski ve dental rehabilitasyon planı MDT içinde değerlendirilmelidir.');
    if (input.perineuralInvasion) rationale.push('Perinöral invazyon mevcut; sinir trasesi boyunca CTV uzatımı ve kafa tabanı görüntülemesi değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; seçilmiş inoperabl hastada primer PTV66 ve elektif nodal PTV54-60 ile IMRT');
      recommendations.push({
        id: 'new-oral-cavity-cancer',
        label: locallyAdvanced ? 'Rezeksiyon + boyun diseksiyonu; yüksek riskte postoperatif KRT veya seçilmiş definitif KRT' : 'R0 hedefli cerrahi ve boyun evrelemesi; patolojiye göre adjuvan RT',
        indication: locallyAdvanced ? 'conditional' : 'conditional',
        intent: 'curative',
        fractionation: definitiveDose,
        targetVolumes: oralCavityTargets(definitiveDose),
        oarConstraints: oralCavityOars,
        systemicTherapy: [
          systemic('concurrent', 'Pozitif marjin/ekstranodal yayılım veya seçilmiş inoperabl hastada cisplatin bazlı KRT', ['cisplatin'], 'Postoperatif veya definitif RT ile eşzamanlı; renal/işitme fonksiyonuna göre', '1'),
        ],
        rationale: [
          'Rezektabl oral kavite kanserinde temel yaklaşım R0 hedefli primer cerrahi ve uygun ipsilateral/bilateral boyun diseksiyonudur; tümör derinliği, orta hat ilişkisi ve nodal risk cerrahi kapsamı belirler.',
          'Kemik, derin kas, dil kökü veya yaygın nodal hastalıkta cerrahi morbidite ve fonksiyonel sonuçlar MDT ile tartılmalıdır; seçilmiş inoperabl olguda definitif IMRT düşünülebilir.',
          'Adjuvan RT; pT3/T4, yakın/pozitif marjin, perinöral/lenfovasküler invazyon, çoklu nod veya nodal kapsül dışı yayılım gibi risklere göre planlanır.',
          'Elektif nodal ışınlama tümör subsite ve lateralitesine göre ipsilateral veya bilateral servikal seviyeleri kapsar; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = 'conditional';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; oral kavite cerrahi yatağı ve riskli boyun alanları');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.boneInvasion === true || input.perineuralInvasion === true;
      recommendations.push({
        id: 'postoperative-oral-cavity-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif IMRT + eşzamanlı cisplatin' : 'Patolojiye göre risk-adapte adjuvan oral kavite/boyun RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? oralCavityTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? oralCavityOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Pozitif marjin veya ekstranodal yayılımda postoperatif cisplatin bazlı KRT', ['cisplatin'], 'RT ile eşzamanlı; uygun renal ve işitme fonksiyonunda', '1')] : undefined,
        rationale: [
          'Pozitif marjin, ekstranodal yayılım ve ileri T/nodal hastalıkta postoperatif eşzamanlı KRT lokal-bölgesel kontrolü artırır; RTOG 9501 ve EORTC 22931 temel kanıtlardır.',
          'Perinöral invazyon, LVSI, kemik invazyonu ve yakın marjin CTV/boost kararını ve sinir trasesi boyunca tedavi gereksinimini etkiler.',
          'Düşük riskli R0 rezeksiyonlarda adjuvan RT; tümör derinliği, nodal durum, subsite ve fonksiyonel/dental morbiditeyle birlikte bireyselleştirilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kritik yapılardan uzak nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-oral-cavity-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik tedavi' : 'Salvage cerrahi ve/veya definitive salvage IMRT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: oralCavityTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: oralCavityOars,
        systemicTherapy: [systemic('palliative', 'PD-L1 CPS ve önceki tedaviye göre pembrolizumab veya platin/5-FU/cetuximab', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Nüks, önceki platin ve performans durumuna göre', '1')],
        rationale: [
          'İzole lokal nükste R0 salvage rezeksiyon mümkünse değerlendirilir; daha önce RT uygulanmamış alanda definitive salvage RT seçilmiş hastalarda küratif olabilir.',
          'Önceki RT sonrası yeniden ışınlama; mandibula, karotis, oral kavite, spinal kord, parotis ve brakiyal pleksus kümülatif dozlarıyla birlikte planlanmalıdır.',
          'Küçük ve iyi sınırlı nükslerde SBRT düşünülebilir; ağız tabanı, mandibula veya karotis komşuluğunda fraksiyone tedavi çoğu zaman daha güvenlidir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik oral kavite/boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-oral-cavity-cancer',
        label: 'Sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? oralCavityTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? oralCavityOars : undefined,
        systemicTherapy: [systemic('palliative', 'PD-L1 CPS ve önceki tedaviye göre pembrolizumab veya platin/5-FU/cetuximab', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Performans durumu, organ fonksiyonu ve önceki tedavilere göre', '1')],
        rationale: [
          'Metastatik oral kavite kanserinde sistemik tedavi ana yaklaşımdır; RT ağrı, kanama, disfaji, ülserasyon, enfeksiyon veya sınırlı metastaz için kullanılır.',
          'Dental değerlendirme, beslenme, trismus ve mandibular komplikasyonların önlenmesi palyatif ve lokal tedavinin parçasıdır.',
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
      summary: recommendations[0]?.label ?? 'Oral kavite kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, klinik muayene, dental değerlendirme, MRI/PET-CT ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.83,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const oralCavityEngine = new OralCavityDecisionEngine();
