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

export type BccSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'locally-advanced' | 'metastatic';
export type BccSite = 'face' | 'nose' | 'ear' | 'scalp' | 'periocular' | 'lip' | 'trunk' | 'extremity' | 'genital' | 'other' | 'unknown';
export type BccStage = 'I' | 'II' | 'III' | 'IV' | 'unknown';
export type BccSurgery = 'none' | 'wide-excision' | 'Mohs' | 'exenteration' | 'nodal-dissection' | 'unknown';
export type BccHistology = 'nodular' | 'superficial' | 'infiltrative' | 'morpheaform' | 'basosquamous' | 'micronodular' | 'other' | 'unknown';
export type BccMolecularFinding = 'PTCH1-altered' | 'SMO-altered' | 'SUFU-altered' | 'PD-L1-positive' | 'TMB-high' | 'MSI-H' | 'dMMR' | 'none' | 'unknown';

export interface BccInput extends ClinicalCaseInput {
  organSystem: 'skin';
  disease: 'basal-cell-carcinoma';
  setting: BccSetting;
  stage?: TNMStage;
  stageGroup?: BccStage;
  site?: BccSite;
  histology?: BccHistology;
  surgeryType?: BccSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  depthMm?: number;
  recurrentTumor?: boolean;
  perineuralInvasion?: boolean;
  namedNerveInvasion?: boolean;
  boneInvasion?: boolean;
  orbitalInvasion?: boolean;
  immunosuppressed?: boolean;
  positiveNodes?: number;
  distantMetastases?: string[];
  priorSkinRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: BccMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Basal Cell Skin Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1416',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for non-melanoma skin cancer radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for non-melanoma skin cancer radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ERIVANCE: vismodegib in locally advanced or metastatic basal-cell carcinoma', url: 'https://doi.org/10.1056/NEJMoa1113713', evidenceLevel: '1' },
  { organization: 'other', title: 'STEVIE: safety of vismodegib in advanced basal-cell carcinoma', url: 'https://doi.org/10.1016/S1470-2045(16)00146-3', evidenceLevel: '2A' },
  { organization: 'other', title: 'BOLT: sonidegib in advanced basal-cell carcinoma', url: 'https://doi.org/10.1016/S1470-2045(15)70122-8', evidenceLevel: '1' },
  { organization: 'other', title: 'Cemiplimab after hedgehog inhibition in advanced basal-cell carcinoma', url: 'https://doi.org/10.1016/S0140-6736(21)01424-1', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0813: hypofractionated stereotactic radiotherapy for centrally located lung tumors; cited here only as a stereotactic planning framework', url: 'https://doi.org/10.1016/j.ijrobp.2019.02.034', evidenceLevel: '2B' },
];

export const BCC_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/bcc-input.json',
  title: 'Basal cell carcinoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['skin'] },
    disease: { type: 'string', enum: ['basal-cell-carcinoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'locally-advanced', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'unknown'] },
    site: { type: 'string', enum: ['face', 'nose', 'ear', 'scalp', 'periocular', 'lip', 'trunk', 'extremity', 'genital', 'other', 'unknown'] },
    histology: { type: 'string', enum: ['nodular', 'superficial', 'infiltrative', 'morpheaform', 'basosquamous', 'micronodular', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorSizeCm: { type: 'number' },
    depthMm: { type: 'number' },
    recurrentTumor: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    namedNerveInvasion: { type: 'boolean' },
    boneInvasion: { type: 'boolean' },
    orbitalInvasion: { type: 'boolean' },
    immunosuppressed: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    priorSkinRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const BCC_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/bcc-result.json',
  title: 'Basal cell carcinoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['skin.bcc'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['skin'] },
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

const bccTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'Görüntülenebilir kutanöz, orbital veya nodal BCC nüksü.' : 'Primer BCC, cerrahi yatağı ve görüntülenebilir nodal/metastatik hastalık.', dose, margin: 'Klinik fotoğraf, dermoskopi, MRI/CT/PET-CT ve cerrahi kliplere göre' },
  { name: 'CTV', description: 'Primer cilt yatağı, subklinik dermal/subkutan yayılım ve perinöral invazyon varsa ilgili sinir trasesi.', dose, margin: 'Genellikle 1-2 cm lateral; anatomik bariyer, histoloji ve perinöral riske göre bireyselleştirilir' },
  { name: 'PTV', description: 'Cilt yüzeyi, immobilizasyon ve günlük kurulum belirsizliği.', dose, margin: 'Elektron/bolus veya IGRT ile yaklaşık 3-5 mm; yüzeyel hedefte bolus doğrulanmalıdır' },
];

const bccOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck re-irradiation objective' },
  { organ: 'Brain/optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Periocular skin RT objective' },
  { organ: 'Contralateral eye', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Periocular skin RT objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Nodal skin cancer RT objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class BccDecisionEngine extends BaseDecisionEngine<BccInput> {
  public readonly id = 'skin.bcc';
  public readonly version = '1.0.0';
  public readonly inputSchema = BCC_INPUT_JSON_SCHEMA;
  public readonly outputSchema = BCC_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: BccInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.perineuralInvasion === true || input.namedNerveInvasion === true || input.boneInvasion === true || input.orbitalInvasion === true || input.recurrentTumor === true || input.immunosuppressed === true || input.histology === 'infiltrative' || input.histology === 'morpheaform' || input.histology === 'micronodular' || input.histology === 'basosquamous';

    if (input.priorSkinRT) warnings.push('Önceki cilt RT mevcut; cilt, göz, kıkırdak, kemik, spinal kord ve brakiyal pleksus kümülatif dozları değerlendirilmelidir.');
    if (input.namedNerveInvasion) warnings.push('Adlandırılmış sinir/perinöral yayılım mevcut; ilgili sinir trasesi boyunca MRI ve kafa tabanı değerlendirmesi gerekir.');
    if (input.site === 'periocular' || input.orbitalInvasion) warnings.push('Perioküler/orbital hastalıkta göz, lens, retina ve optik yollar için oftalmoloji ve hassas planlama gereklidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; yüksek riskli cilt yatağı ± perinöral alan');
      recommendations.push({
        id: 'localized-bcc',
        label: input.setting === 'postoperative' ? (highRisk ? 'Yüksek riskli postoperatif BCC yatağı ve seçilmiş nodal/perinöral RT' : 'R0 cerrahi sonrası izlem veya risk-adapte adjuvan RT') : 'Mohs/geniş eksizyon ile R0 hedefi; seçilmiş yüksek riskte adjuvan RT',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRisk ? dose : undefined,
        targetVolumes: highRisk ? bccTargets(dose) : undefined,
        oarConstraints: highRisk ? bccOars : undefined,
        rationale: [
          'Lokal BCC’de Mohs mikrografik cerrahi veya anatomik olarak uygun geniş eksizyon ilk seçenektir; R0 marjin ve fonksiyon/kozmetik korunması hedeflenir.',
          'Pozitif marjin, infiltratif/morfeiform/mikronodüler histoloji, basoskuamöz özellik, perinöral/adlandırılmış sinir invazyonu, kemik/orbit invazyonu, rekürrens ve immünsüpresyon adjuvan RT lehinedir.',
          'Cerrahi mümkün değilse veya morbidite kabul edilemezse yüzeyel elektron/foton IMRT ile definitif RT, bolus ve cilt dozu doğrulanarak planlanabilir.',
          'Düşük riskli BCC’de elektif nodal RT rutin değildir; metastatik nodal hastalık çok nadirdir ve cerrahi/RT kararı bireyselleştirilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (input.setting === 'locally-advanced') {
      const dose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; unresectable veya cerrahi morbiditesi yüksek lokal ileri BCC');
      recommendations.push({
        id: 'locally-advanced-bcc',
        label: 'Hedgehog inhibitörü ile küçültme/alternatif sistemik tedavi ve seçilmiş definitif RT',
        indication: 'indicated',
        intent: 'definitive',
        fractionation: dose,
        targetVolumes: bccTargets(dose),
        oarConstraints: bccOars,
        systemicTherapy: [
          systemic('induction', 'Hedgehog yolu inhibitörü ile neoadjuvan küçültme', ['vismodegib veya sonidegib'], 'Rezektabilite ve organ koruma için; yanıt/progresyonla yeniden değerlendirme', '1'),
          systemic('concurrent', 'Rutin eşzamanlı kemoradyoterapi yerine seçilmiş RT + sistemik/klinik çalışma yaklaşımı', ['clinical trial veya bireysel sistemik tedavi'], 'MDT kararıyla', '2B'),
        ],
        rationale: [
          'Lokal ileri BCC’de cerrahi rezeke edilebilirlik, rekonstrüksiyon ve fonksiyonel morbidite baş-boyun/plastik cerrahi MDT ile değerlendirilmelidir.',
          'Hedgehog yolu inhibitörleri (vismodegib/sonidegib) unresectable veya cerrahinin ciddi morbidite yaratacağı hastalarda küçültme ya da alternatif sistemik tedavi sağlar.',
          'RT; cerrahiye uygun olmayan, rezidüel hastalığı bulunan veya seçilmiş organ koruma senaryolarında yüzeyel hedef ve perinöral yayılımı kapsayacak şekilde planlanır.',
          'PACIFIC, CHRYSALIS ve torasik RTOG protokolleri BCC için doğrudan kanıt değildir; bu motor BCC’ye özgü hedgehog ve anti-PD-1 kanıtlarını esas alır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'indicated';
      intent = 'definitive';
    } else if (input.setting === 'recurrent') {
      const dose = fraction(48, 20, 'conventional', '48 Gy / 20 fx; seçilmiş salvage cilt yatağı');
      const sbrtDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük, iyi sınırlı ve kritik yapılardan uzak nüks');
      const prior = input.priorSkinRT === true;
      recommendations.push({
        id: 'recurrent-bcc',
        label: prior ? 'Önceki RT sonrası seçilmiş cerrahi/re-irradiation veya hedgehog/anti-PD-1 tedavisi' : 'Salvage Mohs/eksizyon ve/veya fokal RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: prior ? sbrtDose : dose,
        targetVolumes: bccTargets(prior ? sbrtDose : dose, true),
        oarConstraints: bccOars,
        systemicTherapy: [
          systemic('palliative', 'Hedgehog inhibitörü; progresyon/intolerans sonrası anti-PD-1', ['vismodegib veya sonidegib', 'cemiplimab'], 'Rezektabilite, önceki hedgehog tedavisi ve performansa göre', '1'),
        ],
        rationale: [
          'İzole lokal nükste yeniden Mohs/eksizyon mümkünse tercih edilir; RT, cerrahi yapılamayan veya yüksek nüks riskli hastada salvage seçeneğidir.',
          'Hedgehog inhibitörü sonrası progresyonda veya uygun olmayan hastada cemiplimab gibi anti-PD-1 tedavisi değerlendirilir.',
          'Önceki RT sonrası re-irradiation; cilt, göz, kıkırdak, kemik ve nörovasküler yapı dozlarıyla birlikte planlanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik cilt veya nodal odak');
      recommendations.push({
        id: 'metastatic-bcc',
        label: 'Hedgehog/anti-PD-1 sistemik tedavisi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? dose : undefined,
        targetVolumes: input.symptomaticRecurrence ? bccTargets(dose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? bccOars : undefined,
        systemicTherapy: [
          systemic('palliative', 'Hedgehog inhibitörü veya hedgehog sonrası cemiplimab', ['vismodegib/sonidegib', 'cemiplimab'], 'Performans, önceki tedavi ve progresyona göre', '1'),
        ],
        rationale: [
          'Metastatik veya unresectable BCC’de sistemik hedgehog yolu inhibisyonu ve uygun ardışık anti-PD-1 tedavisi temel seçeneklerdir.',
          'RT ağrı, kanama, ülserasyon, enfeksiyon, perioküler semptom veya sınırlı metastaz için kullanılır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
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
      organSystem: 'skin',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'BCC için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, dermatopatoloji, klinik fotoğraf/dermoskopi ve perioküler/kafa tabanı görüntülemesi kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const bccEngine = new BccDecisionEngine();
