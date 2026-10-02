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

export type MaxillarySetting = 'newly-diagnosed' | 'postoperative' | 'definitive' | 'recurrent' | 'metastatic';
export type MaxillaryHistology = 'squamous-cell' | 'adenocarcinoma' | 'adenoid-cystic' | 'mucosal-melanoma' | 'olfactory-neuroblastoma' | 'other' | 'unknown';
export type MaxillaryStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type MaxillaryTCategory = 'T1' | 'T2' | 'T3' | 'T4' | 'T4a' | 'T4b' | 'unknown';
export type MaxillaryNCategory = 'N0' | 'N1' | 'N2' | 'N2a' | 'N2b' | 'N2c' | 'N3' | 'N3a' | 'N3b' | 'unknown';
export type MaxillarySurgery = 'none' | 'endoscopic-resection' | 'partial-maxillectomy' | 'total-maxillectomy' | 'craniofacial-resection' | 'neck-dissection' | 'unknown';
export type MaxillarySurgicalMargin = 'R0' | 'R1' | 'R2' | 'RX' | 'inoperable' | 'not-applicable';
export type MaxillaryMolecularFinding = 'NTRK-fusion' | 'HER2-positive' | 'EGFR-altered' | 'BRAF-altered' | 'PD-L1-positive' | 'MSI-H' | 'TMB-high' | 'none' | 'unknown';

export interface MaxillarySinusInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'maxillary-sinus-cancer';
  setting: MaxillarySetting;
  stage?: TNMStage;
  stageGroup?: MaxillaryStage;
  histology?: MaxillaryHistology;
  surgeryType?: MaxillarySurgery;
  surgicalMargin?: MaxillarySurgicalMargin;
  tCategory?: MaxillaryTCategory;
  nCategory?: MaxillaryNCategory;
  tumorSizeCm?: number;
  orbitalInvasion?: boolean;
  orbitalApexInvolvement?: boolean;
  skullBaseInvasion?: boolean;
  cavernousSinusInvolvement?: boolean;
  perineuralInvasion?: boolean;
  boneErosion?: boolean;
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
  { organization: 'other', title: 'EORTC 22931 / RTOG 9501 pooled analysis of postoperative chemoradiotherapy', url: 'https://doi.org/10.1056/NEJMoa040529', evidenceLevel: '1' },
];
const EORTC_RTOG_POOLED_ANALYSIS = TRIALS[TRIALS.length - 1];

export const MAXILLARY_SINUS_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/maxillary-sinus-input.json',
  title: 'Maxillary sinus cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['maxillary-sinus-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'definitive', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'adenoid-cystic', 'mucosal-melanoma', 'olfactory-neuroblastoma', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'inoperable', 'not-applicable'] },
    tCategory: { type: 'string', enum: ['T1', 'T2', 'T3', 'T4', 'T4a', 'T4b', 'unknown'] },
    nCategory: { type: 'string', enum: ['N0', 'N1', 'N2', 'N2a', 'N2b', 'N2c', 'N3', 'N3a', 'N3b', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    orbitalInvasion: { type: 'boolean' },
    orbitalApexInvolvement: { type: 'boolean' },
    skullBaseInvasion: { type: 'boolean' },
    cavernousSinusInvolvement: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    boneErosion: { type: 'boolean' },
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
  { organ: 'Optic chiasm', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Dmax < 54 Gy' },
  { organ: 'Contralateral optic nerve', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Dmax < 50-54 Gy; mandatory visual sparing' },
  { organ: 'Ipsilateral optic nerve', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Dmax < 54-55 Gy' },
  { organ: 'Retina', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Dmax < 45 Gy' },
  { organ: 'Lens', metric: 'Dmax', limit: 6, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Dmax < 6-8 Gy; cataract risk' },
  { organ: 'Lacrimal gland', metric: 'Dmean', limit: 25, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Dmean < 25-30 Gy; reduce severe dry eye risk' },
  { organ: 'Globe', metric: 'Dmean', limit: 35, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Sinonasal globe preservation objective' },
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
    const tCategory = input.tCategory ?? input.stage?.t?.replace(/^[cpy]/i, '');
    const nCategory = input.nCategory ?? input.stage?.n?.replace(/^[cpy]/i, '');
    const t3OrHigher = ['T3', 'T4', 'T4a', 'T4b'].includes(tCategory ?? '');
    const advanced = ['III', 'IVA', 'IVB'].includes(input.stageGroup ?? '')
      || t3OrHigher
      || ['N2', 'N2a', 'N2b', 'N2c', 'N3', 'N3a', 'N3b'].includes(nCategory ?? '');
    const hasHighRiskPathology = input.surgicalMargin === 'R1' || input.extranodalExtension === true;
    const isDefinitive = input.setting === 'definitive'
      || (!['recurrent', 'metastatic'].includes(input.setting) && input.surgicalMargin === 'inoperable');
    const hasStandardAdjuvantRisk = input.boneErosion === true || input.perineuralInvasion === true || t3OrHigher;

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; optik yollar, göz, beyin sapı, spinal kord, karotis ve beyin kümülatif dozları hesaplanmalıdır.');
    if (input.orbitalApexInvolvement || input.cavernousSinusInvolvement) warnings.push('Orbital apeks/kavernöz sinüs tutulumu mevcut; nöro-oftalmolojik değerlendirme, yüksek çözünürlüklü MRI ve optik yapı doz optimizasyonu zorunludur.');
    if (input.namedNerveInvasion) rationale.push('Adlandırılmış sinir/perinöral yayılım mevcut; ilgili sinir trasesi ve kafa tabanı foramenleri CTV’ye eklenmelidir.');

    if (isDefinitive) {
      const definitiveDose = fraction(70, 35, 'conventional', '70 Gy / 35 fx, 2.0 Gy/fx; definitif primer ve gross nodal hastalık');
      recommendations.push({
        id: 'definitive-maxillary-sinus-cancer',
        label: 'İnoperabl maksiller sinüs: definitif eşzamanlı kemoradyoterapi',
        indication: 'indicated',
        intent: 'definitive',
        fractionation: definitiveDose,
        targetVolumes: maxillaryTargets(definitiveDose),
        oarConstraints: maxillaryOars,
        systemicTherapy: [systemic('concurrent', 'Eşzamanlı sisplatin', ['Sisplatin 100 mg/m² üç haftada bir', 'Sisplatin 40 mg/m² haftalık'], '70 Gy / 35 fx ile eşzamanlı; renal, işitme ve performans durumu değerlendirilerek', '1')],
        rationale: [
          'İnoperabl veya definitif tedavi seçilen maksiller sinüs karsinomunda 70 Gy / 35 fx eşzamanlı sisplatin ile uygulanır.',
          'Hedef hacimler, gross hastalık ve risk altındaki nodal seviyeler için ayrı ayrı tanımlanmalı; optik ve nörolojik OAR dozları önceliklendirilmelidir.',
          'SCC ve ACC histolojileri için karar, rezektabilite, sinir/orbit/kafa tabanı yayılımı ve multidisipliner değerlendirmeye göre bireyselleştirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[3]),
      });
      rtIndication = 'indicated';
      intent = 'definitive';
    } else if (hasHighRiskPathology && !['recurrent', 'metastatic'].includes(input.setting)) {
      const highRiskDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx, 2.0 Gy/fx; high-risk tumor bed and ENE-positive nodal basin');
      const electiveNeckDose = fraction(54, 30, 'conventional', '54-60 Gy / 30-33 fx; elective neck volume');
      const highRiskTargets: TargetVolume[] = [
        {
          name: 'CTV-HR tumor bed',
          description: 'High-risk resection bed; include the ENE-positive nodal basin when extranodal extension is present.',
          dose: highRiskDose,
          margin: 'Pathology- and imaging-adapted high-risk bed and involved nodal basin',
        },
        ...(input.extranodalExtension ? [{
          name: 'CTV-ENE nodal basin',
          description: 'Pathologically involved nodal basin with extranodal extension.',
          dose: highRiskDose,
          margin: 'Postoperative imaging and neck-dissection findings',
        }] : []),
        {
          name: 'CTV-elective-neck',
          description: 'Elective neck volume; select 54-60 Gy in 30-33 fractions according to nodal risk.',
          dose: electiveNeckDose,
          margin: 'Risk-adapted elective nodal levels',
        },
        {
          name: 'PTV-HR',
          description: 'High-risk tumor bed and ENE-positive nodal basin as applicable.',
          dose: highRiskDose,
          margin: 'Institutional image-guidance and setup protocol',
        },
      ];
      recommendations.push({
        id: 'maxillary-sinus-high-risk-postoperative-chemoradiation',
        label: 'YÜKSEK RİSKLİ ADJUVAN EŞZAMANLI KEMORADYOTERAPİ (Kategori 1 Altın Standart)',
        indication: 'indicated',
        intent: 'adjuvant',
        fractionation: highRiskDose,
        targetVolumes: highRiskTargets,
        oarConstraints: maxillaryOars,
        systemicTherapy: [systemic('concurrent', 'Eşzamanlı sisplatin', ['Sisplatin 100 mg/m² üç haftada bir', 'Sisplatin 40 mg/m² haftalık'], '66 Gy / 33 fx PORT ile eşzamanlı; renal, işitme ve performans durumu değerlendirilerek', '1')],
        rationale: [
          'Ekstrakapsüler yayılım (ENE+) veya R1 cerrahi sınır saptandı -> Kategori 1 Eşzamanlı Sisplatin + 66 Gy PORT kesin endikedir.',
          'Yüksek riskli tümör yatağı ve ENE pozitif nodal basin 66 Gy / 33 fx; elektif boyun hacmi 54-60 Gy / 30-33 fx ile tedavi edilir.',
          'EORTC 22931 / RTOG 9501 havuzlanmış analiz bulguları doğrultusunda sisplatin uygunluğu, böbrek fonksiyonu, işitme ve performans durumu ile doğrulanmalıdır.',
        ],
        guidelineReferences: references(EORTC_RTOG_POOLED_ANALYSIS, TRIALS[0], TRIALS[1]),
      });
      rtIndication = 'indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; maksiller sinüs cerrahi yatağı ± perinöral/skull-base boost');
      const r0AndEneNegative = input.surgicalMargin === 'R0' && input.extranodalExtension !== true;
      const adjuvantIndicated = r0AndEneNegative && hasStandardAdjuvantRisk;
      recommendations.push({
        id: 'postoperative-maxillary-sinus-cancer',
        label: adjuvantIndicated
          ? 'R0 / ENE(-): standart adjuvan RT 60 Gy / 30 fx'
          : r0AndEneNegative
            ? 'R0 / ENE(-): ek adjuvan RT risk özelliği yok; izlem'
            : 'Postoperatif maksiller sinüs: patoloji ve cerrahi sınır değerlendirmesi gerekli',
        indication: adjuvantIndicated ? 'indicated' : r0AndEneNegative ? 'not-indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: adjuvantIndicated ? postoperativeDose : undefined,
        targetVolumes: adjuvantIndicated ? maxillaryTargets(postoperativeDose) : undefined,
        oarConstraints: adjuvantIndicated ? maxillaryOars : undefined,
        rationale: adjuvantIndicated
          ? [
              'R0 ve ENE(-) hastada kemik erozyonu, perinöral invazyon veya T3-T4 hastalık varsa 60 Gy / 30 fx adjuvan RT endikedir.',
              'Optik sinir/kiazma, retina, lens, gözyaşı bezi ve beyin sapı dozları ile hedef kapsamı arasında IMRT/proton optimizasyonu gerekir.',
              'Adenoid kistik karsinomda sinir trasesi boyunca kafa tabanına uzanan CTV lokal kontrol için önemlidir.',
            ]
          : r0AndEneNegative
            ? ['R0 ve ENE(-) hastada kemik erozyonu, perinöral invazyon veya T3-T4 ölçütleri yoksa adjuvan RT rutin olarak endike değildir; izlem MDT ile planlanır.']
            : ['R0/R1 durumu ve ENE patoloji sonucu doğrulanmadan adjuvan doz kararı verilmemelidir.'],
        guidelineReferences: references(EORTC_RTOG_POOLED_ANALYSIS, TRIALS[0], TRIALS[1]),
      });
      rtIndication = adjuvantIndicated ? 'indicated' : r0AndEneNegative ? 'not-indicated' : 'conditional';
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
    } else if (input.setting === 'metastatic') {
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
    } else {
      recommendations.push({
        id: 'new-maxillary-sinus-cancer',
        label: advanced
          ? 'Lokal ileri maksiller sinüs kanseri: rezektabilite ve multimodal tedavi değerlendirmesi'
          : 'Maksiller sinüs kanseri: histoloji ve evreye göre cerrahi değerlendirme',
        indication: 'conditional',
        intent: 'curative',
        oarConstraints: maxillaryOars,
        rationale: [
          'Baş-boyun -> paranazal sinüs -> maksiller sinüs primerlerinde SCC ve ACC histolojileri, T/N evresi, orbit ve kafa tabanı ilişkisi multidisipliner değerlendirilmelidir.',
          'R0 hedefli endoskopik/parsiyel-total maksillektomi veya kraniofasiyal rezeksiyon sonrası patolojiye göre adjuvan RT/kemoradyoterapi seçilir.',
          'Görüntüleme ve patoloji sonrası ENE, marjin, kemik erozyonu ve perinöral invazyon bilgileri tamamlanmalıdır.',
        ],
        guidelineReferences: references(EORTC_RTOG_POOLED_ANALYSIS, TRIALS[0], TRIALS[1]),
      });
      rtIndication = 'conditional';
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
