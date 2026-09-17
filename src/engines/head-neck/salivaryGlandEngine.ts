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

export type SalivarySetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type SalivaryHistology = 'mucoepidermoid' | 'adenoid-cystic' | 'acinic-cell' | 'carcinoma-ex-pleomorphic' | 'salivary-duct' | 'squamous-cell' | 'other' | 'unknown';
export type SalivarySite = 'parotid' | 'submandibular' | 'sublingual' | 'minor-salivary' | 'unknown';
export type SalivaryStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type SalivarySurgery = 'none' | 'superficial-parotidectomy' | 'total-parotidectomy' | 'submandibulectomy' | 'wide-local-excision' | 'neck-dissection' | 'unknown';
export type SalivaryMolecularFinding = 'HER2-positive' | 'AR-positive' | 'NTRK-fusion' | 'RET-fusion' | 'BRAF-altered' | 'PIK3CA-altered' | 'PD-L1-positive' | 'MSI-H' | 'TMB-high' | 'none' | 'unknown';

export interface SalivaryGlandInput extends ClinicalCaseInput {
  organSystem: 'head-neck';
  disease: 'salivary-gland-cancer';
  setting: SalivarySetting;
  stage?: TNMStage;
  stageGroup?: SalivaryStage;
  site?: SalivarySite;
  histology?: SalivaryHistology;
  surgeryType?: SalivarySurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  tumorSizeCm?: number;
  tCategory?: string;
  nCategory?: string;
  highGrade?: boolean;
  perineuralInvasion?: boolean;
  namedNerveInvasion?: boolean;
  lymphovascularSpaceInvasion?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  skullBaseInvasion?: boolean;
  facialNerveInvolvement?: boolean;
  distantMetastases?: string[];
  priorHeadNeckRT?: boolean;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: SalivaryMolecularFinding;
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
  title: 'ASTRO clinical practice resources for salivary gland and head and neck radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO consensus guidance for major/minor salivary gland cancer target delineation and IMRT',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 1008: postoperative radiotherapy with or without concurrent chemotherapy for salivary gland malignancies', url: 'https://clinicaltrials.gov/study/NCT01220583', evidenceLevel: '2A' },
  { organization: 'other', title: 'RTOG 9501: postoperative concurrent chemoradiotherapy for high-risk head and neck cancer', url: 'https://doi.org/10.1200/JCO.2004.07.082', evidenceLevel: '1' },
  { organization: 'other', title: 'EORTC 22931: postoperative radiotherapy with or without chemotherapy in high-risk head and neck cancer', url: 'https://doi.org/10.1016/S0140-6736(04)17021-9', evidenceLevel: '1' },
  { organization: 'other', title: 'DeVIC: lenvatinib in progressive adenoid cystic carcinoma', url: 'https://doi.org/10.1016/S1470-2045(20)30039-7', evidenceLevel: '2A' },
  { organization: 'other', title: 'Larotrectinib in NTRK fusion-positive solid tumors', url: 'https://doi.org/10.1056/NEJMoa1812624', evidenceLevel: '1' },
];

export const SALIVARY_GLAND_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/salivary-gland-input.json',
  title: 'Salivary gland cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['head-neck'] },
    disease: { type: 'string', enum: ['salivary-gland-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    site: { type: 'string', enum: ['parotid', 'submandibular', 'sublingual', 'minor-salivary', 'unknown'] },
    histology: { type: 'string', enum: ['mucoepidermoid', 'adenoid-cystic', 'acinic-cell', 'carcinoma-ex-pleomorphic', 'salivary-duct', 'squamous-cell', 'other', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    tumorSizeCm: { type: 'number' },
    tCategory: { type: 'string' },
    nCategory: { type: 'string' },
    highGrade: { type: 'boolean' },
    perineuralInvasion: { type: 'boolean' },
    namedNerveInvasion: { type: 'boolean' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' },
    skullBaseInvasion: { type: 'boolean' },
    facialNerveInvolvement: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    priorHeadNeckRT: { type: 'boolean' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const SALIVARY_GLAND_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/salivary-gland-result.json',
  title: 'Salivary gland cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['head-neck.salivary-gland'] },
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

const salivaryTargets = (dose: Fractionation, recurrent = false): TargetVolume[] => [
  { name: 'GTV', description: recurrent ? 'MRI/PET-CT ile tanımlanan salivary gland yatağı, perinöral veya nodal nüks.' : 'Tükürük bezi primer tümörü ve görüntülenebilir nodal hastalık; MRI, kontrastlı CT ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör, patolojik nodlar ve cerrahi klipler' },
  { name: 'CTV', description: recurrent ? 'Nüks yatağı ve ilgili sinir trasesi; re-irradiation için daraltılmış bireysel hacim.' : 'Primer bez yatağı, perinöral yayılım varsa sinir trasesi/kafa tabanı ve riskli servikal nodal seviyeler.', dose, margin: 'Histoloji, tümör derecesi, perinöral yolaklar ve lenfatik drenaja göre' },
  { name: 'PTV', description: 'Baş-boyun immobilizasyonu, günlük IGRT ve küçük anatomik hareketler için güvenlik hacmi.', dose, margin: 'IGRT ile yaklaşık 3-5 mm; sinir trasesi ve kritik OAR yakınlığına göre adaptif planlama' },
];

const salivaryOars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck spinal cord objective' },
  { organ: 'Brainstem', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck brainstem objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Optic pathway objective' },
  { organ: 'Contralateral parotid', metric: 'Dmean', limit: 26, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Salivary gland preservation objective' },
  { organ: 'Oral cavity', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Head and neck mucosal toxicity objective' },
  { organ: 'Mandible', metric: 'Dmax', limit: 70, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Head and neck osteoradionecrosis objective' },
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

export class SalivaryGlandDecisionEngine extends BaseDecisionEngine<SalivaryGlandInput> {
  public readonly id = 'head-neck.salivary-gland';
  public readonly version = '1.0.0';
  public readonly inputSchema = SALIVARY_GLAND_INPUT_JSON_SCHEMA;
  public readonly outputSchema = SALIVARY_GLAND_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: SalivaryGlandInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';
    const highRisk = input.highGrade === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.perineuralInvasion === true || input.namedNerveInvasion === true || input.extranodalExtension === true || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.skullBaseInvasion === true;

    if (input.priorHeadNeckRT) warnings.push('Önceki baş-boyun RT mevcut; spinal kord, beyin sapı, optik yollar, parotis, mandibula, karotis ve brakiyal pleksus kümülatif dozları hesaplanmalıdır.');
    if (input.namedNerveInvasion || input.facialNerveInvolvement) warnings.push('Adlandırılmış sinir/perinöral yayılım mevcut; sinir trasesi MRI ile kafa tabanına kadar deline edilmeli ve ilgili foramenler OAR güvenliğiyle birlikte değerlendirilmelidir.');
    if (input.histology === 'adenoid-cystic') rationale.push('Adenoid kistik karsinomda perinöral yayılım ve uzak metastaz riski belirgin olabilir; uzun dönem görüntüleme ve sistemik takip planlanmalıdır.');

    if (input.setting === 'newly-diagnosed') {
      const definitiveDose = fraction(66, 33, 'conventional', '66 Gy / 33 fx; seçilmiş inoperabl hastada primer PTV66 ve riskli sinir/nodal alanlar');
      recommendations.push({
        id: 'new-salivary-gland-cancer',
        label: 'R0 hedefli cerrahi ± boyun diseksiyonu; yüksek riskte adjuvan RT, seçilmiş inoperabl hastada definitif IMRT',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'curative',
        fractionation: definitiveDose,
        targetVolumes: salivaryTargets(definitiveDose),
        oarConstraints: salivaryOars,
        systemicTherapy: [systemic('concurrent', 'Seçilmiş yüksek riskli/inoperabl hastada cisplatin bazlı KRT; rutin standart değildir', ['cisplatin'], 'MDT, histoloji ve renal/işitme fonksiyonuna göre', '2B')],
        rationale: [
          'Tükürük bezi kanserlerinde temel yaklaşım anatomik olarak mümkünse R0 hedefli cerrahi, gerekirse boyun diseksiyonu ve histoloji/risk özelliklerine göre adjuvan RT’dir.',
          'Yüksek derece, ileri T evresi, pozitif marjin, perinöral veya adlandırılmış sinir yayılımı, nodal hastalık ve kafa tabanı tutulumu adjuvan RT lehinedir.',
          'Adjuvan RT, primer bez yatağını ve perinöral yayılım varsa ilgili sinir trasesini foramen/skull-base düzeyine kadar kapsamalıdır; elektif nodal alanlar histoloji ve nodal riskle seçilir.',
          'RTOG 1008, tükürük bezi malignitelerinde postoperatif RT’ye kemoterapi eklenmesinin rolünü araştıran önemli bir çalışmadır; eşzamanlı sistemik tedavi rutin değil, seçilmiş MDT kararıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; primer bez yatağı ± perinöral/nodal boost');
      recommendations.push({
        id: 'postoperative-salivary-gland-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif IMRT; seçilmiş olguda eşzamanlı sistemik tedavi' : 'Risk-adapte postoperatif bez yatağı RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? salivaryTargets(postoperativeDose) : undefined,
        oarConstraints: highRisk ? salivaryOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Seçilmiş yüksek riskli olguda cisplatin bazlı KRT', ['cisplatin'], 'Pozitif marjin/ekstranodal veya yaygın nodal hastalıkta; rutin değildir', '2B')] : undefined,
        rationale: [
          'Pozitif marjin, adlandırılmış sinir/perinöral invazyon, yüksek derece, nodal metastaz, ekstranodal yayılım ve kemik/kafa tabanı invazyonu postoperatif RT endikasyonunu güçlendirir.',
          'Adenoid kistik histolojide sinir trasesi ve kafa tabanı risk alanları, primer yataktan bağımsız olarak uzun CTV kapsamı gerektirebilir.',
          'Düşük dereceli, R0 rezeke edilmiş, küçük ve perinöral/nodal risk taşımayan seçilmiş tümörlerde yakın izlem tartışılabilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(60, 30, 'conventional', '60 Gy / 30 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve kritik yapılardan uzak lokal nüks');
      const previouslyIrradiated = input.priorHeadNeckRT === true;
      recommendations.push({
        id: 'recurrent-salivary-gland-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş salvage cerrahi/re-irradiation veya sistemik hedefli tedavi' : 'Salvage cerrahi ve/veya definitive salvage IMRT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? focalDose : salvageDose,
        targetVolumes: salivaryTargets(previouslyIrradiated ? focalDose : salvageDose, true),
        oarConstraints: salivaryOars,
        systemicTherapy: [systemic('palliative', 'Moleküler değişikliğe göre hedefli tedavi veya histolojiye uygun sistemik tedavi', ['HER2/AR hedefli tedavi', 'NTRK/RET hedefli tedavi', 'lenvatinib veya klinik çalışma'], 'Progresyon, semptom ve biyobelirteçlere göre', '2A')],
        rationale: [
          'İzole rezeke edilebilir lokal nükste salvage cerrahi; daha önce RT uygulanmamış alanda definitive salvage RT seçilmiş hastalarda küratif olabilir.',
          'Önceki RT sonrası re-irradiation; karotis, optik yollar, spinal kord, beyin sapı, mandibula ve brakiyal pleksus kümülatif dozlarıyla birlikte planlanmalıdır.',
          'NTRK/RET füzyonu, HER2 veya androjen reseptörü gibi değişiklikler sistemik hedefli tedavi seçimini etkileyebilir; kapsamlı moleküler profil ve klinik çalışma değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik baş-boyun veya metastatik odak');
      recommendations.push({
        id: 'metastatic-salivary-gland-cancer',
        label: 'Moleküler/histolojiye göre sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? salivaryTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? salivaryOars : undefined,
        systemicTherapy: [systemic('palliative', 'Moleküler değişikliğe göre HER2/AR/NTRK/RET hedefli tedavi, lenvatinib veya klinik çalışma', ['HER2/AR-directed therapy', 'larotrectinib/entrectinib', 'selpercatinib/pralsetinib', 'lenvatinib'], 'Biyobelirteç, histoloji, performans ve önceki tedavilere göre', '2A')],
        rationale: [
          'Metastatik tükürük bezi kanserinde sistemik tedavi ve klinik çalışma ana seçeneklerdir; RT ağrı, kanama, kraniyal sinir basısı, hava yolu riski veya sınırlı metastaz için kullanılır.',
          'Adenoid kistik karsinomda akciğer metastazlarının yavaş seyri ve semptom yükü; lokal ablasyon, gözlem ve sistemik tedavi kararını etkiler.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal RT kararı sistemik hastalık yükü, histoloji, semptomlar ve seçilmiş oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'head-neck',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Tükürük bezi kanseri için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, MRI/PET-CT, perinöral yayılım değerlendirmesi ve kapsamlı moleküler profil kurum içinde doğrulanmalıdır.'],
      confidence: 0.82,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const salivaryGlandEngine = new SalivaryGlandDecisionEngine();
