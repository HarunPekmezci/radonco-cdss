import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type SkinSccSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type SkinSccSite = 'face' | 'scalp' | 'ear' | 'lip' | 'trunk' | 'extremity' | 'genital' | 'other' | 'unknown';
export type SkinSccStage = 'I' | 'II' | 'III' | 'IV' | 'unknown';
export type SkinSccSurgery = 'none' | 'wide-excision' | 'Mohs' | 'amputation' | 'nodal-dissection' | 'unknown';
export type SkinSccMolecularFinding = 'PD-L1-positive' | 'TMB-high' | 'MSI-H' | 'dMMR' | 'none' | 'unknown';

export interface SkinSccInput extends ClinicalCaseInput {
  organSystem: 'skin';
  disease: 'cutaneous-squamous-cell-carcinoma';
  setting: SkinSccSetting;
  stage?: TNMStage;
  stageGroup?: SkinSccStage;
  site?: SkinSccSite;
  surgeryType?: SkinSccSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  depthMm?: number;
  differentiation?: 'well' | 'moderate' | 'poor' | 'unknown';
  perineuralInvasion?: boolean;
  namedNerveInvasion?: boolean;
  boneInvasion?: boolean;
  recurrentTumor?: boolean;
  immunosuppressed?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  distantMetastases?: string[];
  priorSkinRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: SkinSccMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Squamous Cell Skin Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1465',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for skin cancer radiotherapy',
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
  { organization: 'other', title: 'Cemiplimab in advanced cutaneous squamous-cell carcinoma', url: 'https://doi.org/10.1056/NEJMoa1805131', evidenceLevel: '1' },
  { organization: 'other', title: 'Pembrolizumab in recurrent or metastatic cutaneous squamous-cell carcinoma', url: 'https://doi.org/10.1016/S0140-6736(23)00749-5', evidenceLevel: '2A' },
  { organization: 'other', title: 'TROG 05.01: postoperative chemoradiotherapy for high-risk cutaneous SCC', url: 'https://doi.org/10.1016/S0140-6736(18)30902-6', evidenceLevel: '1' },
  { organization: 'other', title: 'Mohs micrographic surgery for high-risk cutaneous SCC', url: 'https://doi.org/10.1016/j.jaad.2018.06.005', evidenceLevel: '2A' },
];

export const SKIN_SCC_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/skin-scc-input.json',
  title: 'Cutaneous squamous cell carcinoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['skin'] },
    disease: { type: 'string', enum: ['cutaneous-squamous-cell-carcinoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'unknown'] },
    site: { type: 'string', enum: ['face', 'scalp', 'ear', 'lip', 'trunk', 'extremity', 'genital', 'other', 'unknown'] },
    surgeryType: { type: 'string' }, surgicalMargin: { type: 'string' },
    tumorSizeCm: { type: 'number' }, depthMm: { type: 'number' },
    differentiation: { type: 'string' }, perineuralInvasion: { type: 'boolean' },
    namedNerveInvasion: { type: 'boolean' }, boneInvasion: { type: 'boolean' },
    recurrentTumor: { type: 'boolean' }, immunosuppressed: { type: 'boolean' },
    positiveNodes: { type: 'number' }, extranodalExtension: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    priorSkinRT: { type: 'boolean' }, symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' }, molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const SKIN_SCC_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/skin-scc-result.json',
  title: 'Cutaneous squamous cell carcinoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['skin.scc'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['skin'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule,
  technique: className === 'SBRT' ? 'IGRT' : 'IMRT', alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'Görüntülenebilir cilt veya nodal nüks.' : 'Primer kutanöz tümör, cerrahi yatağı ve makroskopik nodal hastalık.', dose, margin: 'Klinik fotoğraf, dermoskopi, MRI/PET-CT ve cerrahi kliplere göre' },
  { name: 'CTV', description: 'Primer cilt yatağı, subklinik dermal/subkutan yayılım, perinöral sinir trasesi ve seçilmiş nodal risk alanı.', dose, margin: 'Genellikle 1-2 cm lateral; derinlik ve anatomik bariyerlerle bireyselleştirilir' },
  { name: 'PTV', description: 'Cilt yüzeyi, immobilizasyon ve günlük kurulum belirsizliği.', dose, margin: 'Elektron/bolus veya IGRT ile yaklaşık 3-5 mm; yüzeyel hedefte bolus doğrulanmalıdır' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck re-irradiation objective' },
  { organ: 'Brain/optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Periocular skin RT objective' },
  { organ: 'Contralateral eye', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Periocular skin RT objective' },
  { organ: 'Parotid glands', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Head and neck salivary gland objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Nodal skin cancer RT objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class SkinSccDecisionEngine extends BaseDecisionEngine<SkinSccInput> {
  public readonly id = 'skin.scc';
  public readonly version = '1.0.0';
  public readonly inputSchema = SKIN_SCC_INPUT_JSON_SCHEMA;
  public readonly outputSchema = SKIN_SCC_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: SkinSccInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.perineuralInvasion === true || input.namedNerveInvasion === true || input.boneInvasion === true || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.recurrentTumor === true || input.immunosuppressed === true;
    if (input.priorSkinRT) warnings.push('Önceki cilt RT mevcut; cilt, göz, kıkırdak, kemik, spinal kord ve brakiyal pleksus kümülatif dozları değerlendirilmelidir.');
    if (input.namedNerveInvasion) warnings.push('Adlandırılmış sinir/perinöral yayılım mevcut; sinir trasesi boyunca MRI ve kafa tabanı değerlendirmesi gerekir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const dose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; yüksek riskli cilt yatağı ± nodal alan');
      recommendations.push({
        id: 'localized-skin-scc',
        label: input.setting === 'postoperative' ? (highRisk ? 'Yüksek riskli postoperatif cilt yatağı ve seçilmiş nodal RT' : 'R0 cerrahi sonrası izlem veya risk-adapte adjuvan RT') : 'Mohs/geniş eksizyon ile R0 hedefi; seçilmiş yüksek riskte adjuvan RT',
        indication: highRisk ? 'indicated' : 'conditional', intent: input.setting === 'postoperative' ? 'adjuvant' : 'curative',
        fractionation: highRisk ? dose : undefined, targetVolumes: highRisk ? targets(dose) : undefined, oarConstraints: highRisk ? oars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Rutin kemoradyoterapi önerilmez; seçilmiş olguda MDT sistemik yaklaşımı', ['clinical trial/systemic therapy'], 'Cerrahi ve RT risklerine göre', '2B')] : undefined,
        rationale: [
          'Kutanöz SCC’de ilk seçenek Mohs mikrografik cerrahi veya anatomik/onkolojik olarak uygun geniş eksizyondur; R0 marjin ve fonksiyon korunması hedeflenir.',
          'Pozitif marjin, perinöral/adlandırılmış sinir invazyonu, kemik invazyonu, rekürrens, immünsüpresyon veya nodal hastalıkta adjuvan RT düşünülür.',
          'Nodal hastalıkta terapötik diseksiyon ve/veya parotis-boyun nodal RT, nod sayısı ve ekstranodal yayılıma göre planlanır; elektif nodal RT rutin düşük riskli hastada gerekli değildir.',
          'Yüzeyel hedefte elektron/bolus veya foton IMRT kullanılabilir; derinlik, cilt kıvrımları ve kozmetik/işlevsel sonuçlar planlamayı belirler.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = input.setting === 'postoperative' ? 'adjuvant' : 'curative';
    } else if (input.setting === 'recurrent') {
      const dose = fraction(48, 20, 'conventional', '48 Gy / 20 fx; seçilmiş salvage cilt yatağı');
      const sbrtDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük, iyi sınırlı ve kritik yapılardan uzak nüks');
      const prior = input.priorSkinRT === true;
      recommendations.push({
        id: 'recurrent-skin-scc',
        label: prior ? 'Önceki RT sonrası seçilmiş cerrahi/re-irradiation veya immünoterapi' : 'Salvage cerrahi ve/veya fokal RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: prior ? sbrtDose : dose, targetVolumes: targets(prior ? sbrtDose : dose, true), oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'İleri/cerrahi dışı hastalıkta anti-PD-1 tedavisi', ['cemiplimab veya pembrolizumab'], 'Progresif veya unresectable hastalıkta; immün durumuna göre', '1')],
        rationale: ['İzole lokal nükste yeniden eksizyon/Mohs mümkünse tercih edilir; RT, cerrahi yapılamayan veya yüksek nüks riskli hastada salvage seçeneğidir.', 'Önceki RT sonrası re-irradiation; cilt, kıkırdak, kemik, göz ve nörovasküler yapı dozlarıyla birlikte planlanmalıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional'; intent = 'salvage';
    } else {
      const dose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik cilt veya nodal odak');
      recommendations.push({
        id: 'metastatic-skin-scc', label: 'Anti-PD-1 sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional', intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? dose : undefined, targetVolumes: input.symptomaticRecurrence ? targets(dose) : undefined, oarConstraints: input.symptomaticRecurrence ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'İleri kutanöz SCC’de anti-PD-1 tedavisi', ['cemiplimab veya pembrolizumab'], 'Performans, immünsüpresyon ve önceki tedavilere göre', '1')],
        rationale: ['Metastatik veya unresectable cilt SCC’de sistemik anti-PD-1 tedavisi temel seçenektir; RT ağrı, kanama, ülserasyon, enfeksiyon veya sınırlı metastaz için kullanılır.', 'İmmünsüpresyon ve transplant öyküsü immünoterapi risk-faydasını değiştirir; dermatoloji, transplant ve onkoloji MDT gerekir.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional'; intent = 'palliative';
    }
    if (input.distantMetastases && input.distantMetastases.length > 0) rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü ve semptomlarla birlikte verilmelidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId,
      organSystem: 'skin', rtIndication, intent, summary: recommendations[0]?.label ?? 'Cilt SCC için MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, dermatopatoloji, klinik fotoğraf/dermoskopi ve görüntüleme kurum içinde doğrulanmalıdır.'],
      confidence: 0.84, guidelineReferences: references(...TRIALS),
    };
  }
}

export const skinSccEngine = new SkinSccDecisionEngine();
