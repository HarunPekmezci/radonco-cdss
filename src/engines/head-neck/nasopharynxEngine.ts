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

export type NasopharynxSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type NasopharynxHistology = 'non-keratinizing-undifferentiated' | 'non-keratinizing-differentiated' | 'keratinizing-squamous' | 'other' | 'unknown';
export type NasopharynxStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type NasopharynxSurgery = 'none' | 'endoscopic-salvage' | 'neck-dissection' | 'nasopharyngectomy' | 'unknown';
export type NasopharynxMolecularFinding = 'EBV-high' | 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'none' | 'unknown';

export interface NasopharynxInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'nasopharyngeal-cancer';
  setting: NasopharynxSetting;
  stage?: TNMStage;
  stageGroup?: NasopharynxStage;
  histology?: NasopharynxHistology;
  surgeryType?: NasopharynxSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tCategory?: string;
  nCategory?: string;
  skullBaseInvasion?: boolean;
  cavernousSinusInvolvement?: boolean;
  cranialNerveInvolvement?: boolean;
  bulkyNeckNodes?: boolean;
  bilateralNeckNodes?: boolean;
  distantMetastases?: string[];
  EBVDNA?: number;
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
  title: 'ESTRO consensus guidance for nasopharyngeal carcinoma target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'Intergroup 0099: concurrent-adjuvant chemotherapy with radiotherapy for nasopharyngeal carcinoma', url: 'https://doi.org/10.1056/NEJM200005183422001', evidenceLevel: '1' },
  { organization: 'other', title: 'Induction gemcitabine/cisplatin followed by chemoradiotherapy for locoregionally advanced nasopharyngeal carcinoma', url: 'https://doi.org/10.1056/NEJMoa2111287', evidenceLevel: '1' },
  { organization: 'other', title: 'Induction chemotherapy plus concurrent chemoradiotherapy for locoregionally advanced nasopharyngeal carcinoma', url: 'https://doi.org/10.1056/NEJMoa1908077', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0225: IMRT for nasopharyngeal carcinoma', url: 'https://doi.org/10.1016/j.ijrobp.2008.09.039', evidenceLevel: '2A' },
];

export const NASOPHARYNX_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/nasopharynx-input.json',
  title: 'Nasopharyngeal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['nasopharyngeal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['non-keratinizing-undifferentiated', 'non-keratinizing-differentiated', 'keratinizing-squamous', 'other', 'unknown'] },
    surgeryType: { type: 'string', enum: ['none', 'endoscopic-salvage', 'neck-dissection', 'nasopharyngectomy', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    skullBaseInvasion: { type: 'boolean' },
    cavernousSinusInvolvement: { type: 'boolean' },
    cranialNerveInvolvement: { type: 'boolean' },
    bulkyNeckNodes: { type: 'boolean' },
    bilateralNeckNodes: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    EBVDNA: { type: 'number' },
    priorHeadNeckRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const NASOPHARYNX_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/nasopharynx-result.json',
  title: 'Nasopharyngeal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.nasopharynx'] },
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
  technique: className === 'SRS' || className === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const nasopharynxTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan lokal nüks, nodal nüks veya skull-base hastalığı.' : 'Primer nazofarenks tümörü ve görüntülenebilir retropharyngeal/servikal nodal hastalık; MRI ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör ve patolojik nodlar' },
  { name: 'CTV', description: recurrent ? 'Nüks çevresi ve önceki anatomik risk alanları; yeniden ışınlamada daraltılmış bireysel hacim.' : 'Nazofarenks, parapharyngeal alan, skull base risk bölgeleri, retropharyngeal ve elektif servikal nodal seviyeler.', dose, margin: 'Tümör yayılımı, perinöral/skull-base risk ve anatomik bariyerlere göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, günlük IGRT ve küçük anatomik hareketler için güvenlik hacmi.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; adaptif planlama ve proton/IMRT seçeneği değerlendirilebilir' },
];

const nasopharynxOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Optic chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Optic pathway objective' },
  { organ: 'Optic nerves', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Optic pathway objective' },
  { organ: 'Temporal lobes', metric: 'Dmax', limit: 60, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Nasopharyngeal IMRT temporal lobe objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Cochlea', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Nasopharyngeal IMRT hearing preservation objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class NasopharynxDecisionEngine extends BaseDecisionEngine<NasopharynxInput> {
  public readonly id = 'head-neck.nasopharynx';
  public readonly version = '1.0.0';
  public readonly inputSchema = NASOPHARYNX_INPUT_JSON_SCHEMA;
  public readonly outputSchema = NASOPHARYNX_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: NasopharynxInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const locallyAdvanced = input.stageGroup === 'III' || input.stageGroup === 'IVA' || input.tCategory === 'T3' || input.tCategory === 'T4' || input.nCategory === 'N2' || input.nCategory === 'N3';

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; beyin sapı, optik yollar, temporal loblar, spinal kord ve karotis kümülatif dozları yeniden ışınlama planında hesaplanmalıdır.');
    if (input.histology === 'keratinizing-squamous') warnings.push('Keratinize skuamöz histoloji daha düşük radyosensitivite ile ilişkili olabilir; sigara, EBV ve sistemik tedavi faktörleri MDT tarafından ayrıca değerlendirilmelidir.');
    if (input.EBVDNA !== undefined && input.EBVDNA > 0) rationale.push('Plazma EBV DNA düzeyi prognostik ve risk-adaptif değerlendirmede kullanılabilir; test yöntemi ve eşik kurum protokolüyle doğrulanmalıdır.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(70, 33, 'conventional', '70 Gy / 33 fx; primer PTV70 ve elektif nodal PTV54-60 ile IMRT/VMAT');
      recommendations.push({
        id: 'new-nasopharyngeal-cancer',
        label: locallyAdvanced ? 'İndüksiyon kemoterapisi + eşzamanlı kemoradyoterapi ve seçilmiş adjuvan tedavi' : 'Definitif IMRT/VMAT ile nazofarenks ve riskli boyun tedavisi',
        indication: 'indicated',
        intent: 'definitive',
        fractionation: definitiveDose,
        targetVolumes: nasopharynxTargets(definitiveDose),
        oarConstraints: nasopharynxOars,
        systemicTherapy: locallyAdvanced
          ? [systemic('induction', 'İndüksiyon gemcitabin + sisplatin', ['gemcitabine', 'cisplatin'], 'Genellikle 2-3 kür, ardından eşzamanlı KRT', '1'), systemic('concurrent', 'Cisplatin bazlı eşzamanlı kemoterapi', ['cisplatin'], 'Haftalık veya 3 haftada bir; kümülatif doz ve renal fonksiyona göre', '1'), systemic('adjuvant', 'Seçilmiş yüksek riskte adjuvan sistemik tedavi', ['cisplatin/5-FU veya kurum protokolü'], 'Eşzamanlı KRT sonrası tolere edilebilirlik ve risk durumuna göre', '2A')]
          : [systemic('concurrent', 'Seçilmiş evre II hastalıkta cisplatin bazlı eşzamanlı KRT', ['cisplatin'], 'Nodal hacim, EBV DNA ve risk durumuna göre', '2A')],
        rationale: [
          'Nazofarenks kanserinde cerrahi primer tedavi değildir; anatomik derinlik, skull-base ve bilateral lenfatik drenaj nedeniyle definitif yüksek doz IMRT/VMAT temel yaklaşımdır.',
          'Primer tümör ve makroskopik nodlara yaklaşık 70 Gy, mikroskopik risk alanlarına 54-60 Gy aralığında SIB/ardışık planlama yapılır; elektif nodal alanlar retropharyngeal ve bilateral servikal drenajı kapsar.',
          'Lokal ileri hastalıkta indüksiyon gemcitabin/sisplatin ve eşzamanlı cisplatin, klinik çalışma verileriyle desteklenen ardışık yaklaşımlardır.',
          'RTOG 0225 IMRT’nin nazofarenks anatomisinde hedef kapsamı ve kritik yapı korumasındaki rolünü; Intergroup 0099 eşzamanlı-adjuvan kemoterapi yaklaşımını destekler.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; postoperatif primer/nodal yatak ve risk-adapte boost');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.surgeryType === 'nasopharyngectomy' || input.bulkyNeckNodes === true;
      recommendations.push({
        id: 'postoperative-nasopharyngeal-cancer',
        label: highRisk ? 'Yüksek riskli salvage/postoperatif IMRT ± eşzamanlı cisplatin' : 'Seçilmiş cerrahi sonrası risk-adapte RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? nasopharynxTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? nasopharynxOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Pozitif marjin veya yüksek riskli nodal hastalıkta cisplatin bazlı KRT', ['cisplatin'], 'Kümülatif doz ve önceki tedavilere göre', '2B')] : undefined,
        rationale: [
          'Nazofarenks cerrahisi genellikle primer tedavi değil, seçilmiş lokal/nodal nükslerde salvage yaklaşımıdır.',
          'Pozitif marjin, gross rezidü, ekstrakapsüler nodal yayılım veya bulky nodal hastalıkta postoperatif/salvage IMRT ve seçilmiş eşzamanlı cisplatin düşünülebilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; seçilmiş lokal nükste salvage IMRT/re-irradiation');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük, iyi sınırlı ve kritik yapılardan uzak nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-nasopharyngeal-cancer',
        label: previouslyIrradiated ? 'Seçilmiş lokal nükste salvage re-irradiation/cerrahi veya sistemik tedavi' : 'Salvage endoskopik cerrahi veya definitive salvage IMRT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: nasopharynxTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: nasopharynxOars,
        systemicTherapy: [systemic('palliative', 'Platin bazlı tedavi ve uygun hastada PD-1 inhibitörü', ['gemcitabine/cisplatin', 'toripalimab veya kurum/ülke onaylı PD-1 inhibitörü'], 'Nüks anatomisi, önceki tedavi ve biyobelirteçlere göre', '2A')],
        rationale: [
          'İzole lokal nükste endoskopik nazofarenjektomi veya salvage IMRT seçilmiş hastalarda küratif amaçla değerlendirilebilir.',
          'Önceki RT sonrası yeniden ışınlama; beyin sapı, optik yollar, temporal lob, spinal kord ve karotis dozları ile nekroz/kanama riskleri hesaplanmadan uygulanmamalıdır.',
          'Küçük ve kritik yapılardan uzak nükslerde SBRT düşünülebilir; skull-base, kavernöz sinüs veya kraniyal sinir tutulumu varsa fraksiyone yaklaşım çoğu zaman daha güvenlidir.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik baş-boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-nasopharyngeal-cancer',
        label: 'Sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? nasopharynxTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? nasopharynxOars : undefined,
        systemicTherapy: [systemic('palliative', 'Gemcitabin/sisplatin ve uygun hastada PD-1 inhibitörü', ['gemcitabine/cisplatin', 'PD-1 inhibitor'], 'Performans durumu, önceki platin ve organ fonksiyonuna göre', '1')],
        rationale: [
          'Metastatik hastalıkta sistemik tedavi ana tedavidir; RT kanama, ağrı, kraniyal sinir basısı, hava yolu/üst solunum yolu semptomları veya sınırlı metastaz için kullanılır.',
          'EBV DNA, histoloji, önceki platin tedavisi ve hastanın performans durumu sistemik tedavi sıralamasını etkiler.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.skullBaseInvasion || input.cavernousSinusInvolvement || input.cranialNerveInvolvement) {
      warnings.push('Skull-base/kavernöz sinüs veya kraniyal sinir tutulumu mevcut; nöro-oftalmolojik değerlendirme, MRI füzyonu ve optik yollar/beyin sapı doz optimizasyonu gereklidir.');
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
      summary: recommendations[0]?.label ?? 'Nazofarenks kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, MRI/PET-CT, EBV DNA ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const nasopharynxEngine = new NasopharynxDecisionEngine();
