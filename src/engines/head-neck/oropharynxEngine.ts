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

export type OropharynxSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type OropharynxHistology = 'squamous-cell' | 'adenocarcinoma' | 'other' | 'unknown';
export type OropharynxStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type OropharynxSurgery = 'none' | 'transoral-robotic-resection' | 'transoral-laser-resection' | 'tonsillectomy' | 'base-of-tongue-resection' | 'neck-dissection' | 'unknown';
export type OropharynxMolecularFinding = 'HPV-positive' | 'HPV-negative' | 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'none' | 'unknown';

export interface OropharynxInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'oropharyngeal-cancer';
  setting: OropharynxSetting;
  stage?: TNMStage;
  stageGroup?: OropharynxStage;
  histology?: OropharynxHistology;
  subsite?: 'tonsil' | 'base-of-tongue' | 'soft-palate' | 'posterior-pharyngeal-wall' | 'unknown';
  hpvStatus?: 'positive' | 'negative' | 'unknown';
  p16Status?: 'positive' | 'negative' | 'unknown';
  tCategory?: string;
  nCategory?: string;
  tumorSizeCm?: number;
  tongueBaseInvasion?: boolean;
  mandibularInvasion?: boolean;
  bulkyNeckNodes?: boolean;
  bilateralNeckNodes?: boolean;
  extranodalExtension?: boolean;
  distantMetastases?: string[];
  surgeryType?: OropharynxSurgery;
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
  title: 'ASTRO clinical practice resources for HPV-associated and head and neck cancer radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for oropharyngeal cancer target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 1016: radiotherapy with cetuximab or cisplatin for HPV-positive oropharyngeal cancer', url: 'https://doi.org/10.1056/NEJMoa1719933', evidenceLevel: '1' },
  { organization: 'other', title: 'De-ESCALaTE HPV: reduced-intensity treatment for HPV-positive oropharyngeal cancer', url: 'https://doi.org/10.1016/S0140-6736(18)32752-1', evidenceLevel: '1' },
  { organization: 'other', title: 'ECOG 3311: risk-adapted adjuvant therapy after transoral surgery', url: 'https://doi.org/10.1200/JCO.21.01791', evidenceLevel: '2A' },
  { organization: 'other', title: 'RTOG 9501: postoperative concurrent chemoradiotherapy for high-risk head and neck cancer', url: 'https://doi.org/10.1200/JCO.2004.07.082', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-048: pembrolizumab for recurrent or metastatic head and neck squamous-cell carcinoma', url: 'https://doi.org/10.1056/NEJMoa1814564', evidenceLevel: '1' },
];

export const OROPHARYNX_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oropharynx-input.json',
  title: 'Oropharyngeal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['oropharyngeal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'other', 'unknown'] },
    subsite: { type: 'string', enum: ['tonsil', 'base-of-tongue', 'soft-palate', 'posterior-pharyngeal-wall', 'unknown'] },
    hpvStatus: { type: 'string', enum: ['positive', 'negative', 'unknown'] },
    p16Status: { type: 'string', enum: ['positive', 'negative', 'unknown'] },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    tumorSizeCm: { type: 'number' },
    tongueBaseInvasion: { type: 'boolean' },
    mandibularInvasion: { type: 'boolean' },
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

export const OROPHARYNX_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/oropharynx-result.json',
  title: 'Oropharyngeal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.oropharynx'] },
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

const oropharynxTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan orofarenks veya servikal nodal nüks.' : 'Primer orofarenks tümörü ve görüntülenebilir servikal nodal hastalık; endoskopi, MRI/CT ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör ve patolojik nodlar' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı ve seçilmiş önceki risk alanları; re-irradiation için daraltılmış hacim.' : 'Tonsil veya dil kökü primeri, parapharyngeal/retrofaryngeal risk alanları ve lateraliteye göre tek/bilateral servikal nodal seviyeler.', dose, margin: 'Submukozal yayılım, perinöral risk ve lenfatik drenaja göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, yutkunma hareketi ve günlük IGRT belirsizliği.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; adaptif planlama değerlendirilebilir' },
];

const oropharynxOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Oral cavity', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Head and neck mucosal toxicity objective' },
  { organ: 'Pharyngeal constrictors', metric: 'Dmean', limit: 50, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Dysphagia mitigation objective' },
  { organ: 'Larynx', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Laryngeal edema and aspiration objective' },
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

export class OropharynxDecisionEngine extends BaseDecisionEngine<OropharynxInput> {
  public readonly id = 'head-neck.oropharynx';
  public readonly version = '1.0.0';
  public readonly inputSchema = OROPHARYNX_INPUT_JSON_SCHEMA;
  public readonly outputSchema = OROPHARYNX_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: OropharynxInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const hpvPositive = input.hpvStatus === 'positive' || input.p16Status === 'positive';
    const locallyAdvanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.tCategory === 'T3' || input.tCategory === 'T4' || input.nCategory === 'N2' || input.nCategory === 'N3';

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; spinal kord, beyin sapı, parotisler, konstriktörler, larenks ve brakiyal pleksus kümülatif dozları hesaplanmalıdır.');
    if (input.hpvStatus === 'unknown' && input.p16Status === 'unknown') warnings.push('Orofarenks skuamöz hücreli karsinomunda p16/HPV durumu evreleme ve prognoz için doğrulanmalıdır.');
    if (hpvPositive) rationale.push('HPV/p16 pozitifliği prognostik ve evreleme açısından önemlidir; tedavi de-eskalasyonu yalnızca klinik çalışma veya protokol kapsamında düşünülmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(70, 35, 'conventional', '70 Gy / 35 fx; primer PTV70 ve elektif nodal PTV54-60 ile IMRT/VMAT');
      recommendations.push({
        id: 'new-oropharyngeal-cancer',
        label: locallyAdvanced
          ? 'Lokal ileri hastalıkta definitif IMRT/VMAT + eşzamanlı cisplatin veya seçilmiş transoral cerrahi ve risk-adapte adjuvan RT'
          : 'Erken evrede seçilmiş transoral cerrahi veya definitif IMRT/VMAT ve risk-adapte boyun tedavisi',
        indication: 'indicated',
        intent: 'definitive',
        fractionation: definitiveDose,
        targetVolumes: oropharynxTargets(definitiveDose),
        oarConstraints: oropharynxOars,
        systemicTherapy: [
          systemic('concurrent', 'Cisplatin bazlı eşzamanlı kemoradyoterapi', ['cisplatin'], 'Haftalık veya 3 haftada bir; işitme, renal fonksiyon ve performansa göre', '1'),
        ],
        rationale: [
          'Orofarenks kanserinde definitif IMRT/VMAT veya seçilmiş transoral cerrahi + boyun diseksiyonu, tümör subsite, HPV/p16, nodal yük ve fonksiyonel sonuçlara göre değerlendirilir.',
          'Primer tümör ve makroskopik nodlara yaklaşık 70 Gy, mikroskopik risk alanlarına 54-60 Gy; tonsil/dil kökü lateralitesi ve nodal drenaja göre tek veya bilateral boyun tedavisi yapılır.',
          'HPV pozitif hastalarda standart dışı de-eskalasyon rutin uygulama değildir; RTOG 1016 ve De-ESCALaTE HPV, cetuximabın cisplatine eşdeğer olmadığını gösterir.',
          'Elektif nodal ışınlama bilateral retropharyngeal ve servikal seviyeleri, tümör lateralitesi ve orta hat ilişkisine göre kapsar; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; transoral cerrahi yatağı ve riskli boyun alanları');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.bulkyNeckNodes === true;
      recommendations.push({
        id: 'postoperative-oropharyngeal-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif IMRT + eşzamanlı cisplatin' : 'ECOG 3311 benzeri risk-adapte adjuvan RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? oropharynxTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? oropharynxOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Pozitif marjin veya ekstranodal yayılımda postoperatif cisplatin bazlı KRT', ['cisplatin'], 'RT ile eşzamanlı; uygun renal ve işitme fonksiyonunda', '1')] : undefined,
        rationale: [
          'Pozitif marjin, ekstranodal yayılım ve yüksek nodal yük yüksek lokal-bölgesel nüks riskidir ve postoperatif eşzamanlı KRT lehinedir.',
          'R0 rezeksiyon, negatif marjin ve düşük riskli patolojide adjuvan RT dozu ECOG 3311 benzeri risk-adapte yaklaşımla azaltılabilir veya izlem düşünülebilir.',
          'Postoperatif CTV; preoperatif tümör hacmi, cerrahi yatak, klipler ve nodal drenajı birlikte kapsamalıdır.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kritik yapılardan uzak nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-oropharyngeal-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik tedavi' : 'Salvage cerrahi veya definitive salvage IMRT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: oropharynxTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: oropharynxOars,
        systemicTherapy: [systemic('palliative', 'PD-L1 CPS ve önceki tedaviye göre pembrolizumab veya platin/5-FU/cetuximab', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Nüks, önceki platin ve performans durumuna göre', '1')],
        rationale: [
          'İzole lokal veya servikal nükste R0 salvage cerrahi ve/veya daha önce ışınlanmamış alanda definitive RT değerlendirilebilir.',
          'Önceki RT sonrası re-irradiation; karotis, spinal kord, beyin sapı, konstriktörler, larenks ve brakiyal pleksus kümülatif dozlarıyla birlikte planlanmalıdır.',
          'Küçük ve kritik yapılardan uzak nükslerde SBRT düşünülebilir; orofarenks ve karotis komşuluğunda fraksiyone tedavi çoğu zaman daha güvenlidir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik orofarenks/boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-oropharyngeal-cancer',
        label: 'Sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? oropharynxTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? oropharynxOars : undefined,
        systemicTherapy: [systemic('palliative', 'Pembrolizumab veya platin/5-FU/cetuximab; PD-L1 CPS ve önceki tedaviye göre', ['pembrolizumab', 'platinum/5-FU/cetuximab'], 'Performans durumu, organ fonksiyonu ve önceki tedavilere göre', '1')],
        rationale: [
          'Metastatik orofarenks kanserinde sistemik tedavi ana tedavidir; RT ağrı, kanama, disfaji, hava yolu riski veya sınırlı metastaz için kullanılır.',
          'HPV/p16 durumu prognostik olsa da metastatik sistemik tedavi seçimi PD-L1 CPS, önceki platin ve organ fonksiyonlarıyla birlikte yapılır.',
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
      summary: recommendations[0]?.label ?? 'Orofarinks kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, HPV/p16 sonucu, endoskopi, MRI/PET-CT ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const oropharynxEngine = new OropharynxDecisionEngine();
