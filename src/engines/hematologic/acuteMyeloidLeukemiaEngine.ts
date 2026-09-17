import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type AMLSetting = 'newly-diagnosed' | 'induction' | 'consolidation' | 'relapsed' | 'refractory' | 'post-transplant' | 'surveillance';
export type AMLRisk = 'favorable' | 'intermediate' | 'adverse' | 'unknown';
export type AMLMolecularFinding = 'NPM1-mutated' | 'CEBPA-biallelic' | 'RUNX1-mutated' | 'FLT3-ITD' | 'IDH1-mutated' | 'IDH2-mutated' | 'TP53-mutated' | 'KMT2A-rearranged' | 'CBF-AML' | 'unknown';
export type AMLDiseasePattern = 'marrow-only' | 'myeloid-sarcoma' | 'CNS-involvement' | 'extramedullary' | 'relapsed-extramedullary' | 'unknown';

export interface AcuteMyeloidLeukemiaInput extends ClinicalCaseInput {
  organSystem: 'hematologic';
  disease: 'acute-myeloid-leukemia';
  setting: AMLSetting;
  riskGroup?: AMLRisk;
  stage?: TNMStage;
  molecularFinding?: AMLMolecularFinding;
  diseasePattern?: AMLDiseasePattern;
  measurableResidualDisease?: boolean;
  mrdPercent?: number;
  cnsInvolvement?: boolean;
  myeloidSarcoma?: boolean;
  extramedullaryDisease?: boolean;
  leukostasis?: boolean;
  hyperleukocytosis?: boolean;
  inductionFailure?: boolean;
  transplantEligible?: boolean;
  donorAvailable?: boolean;
  priorRadiotherapy?: boolean;
  priorSystemicTherapy?: string[];
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Acute Myeloid Leukemia',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1411',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for hematologic malignancies and palliative radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for radiotherapy in hematologic malignancies and total-body irradiation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ELN 2022 recommendations for diagnosis and management of AML', url: 'https://doi.org/10.1182/blood.2022016867', evidenceLevel: 'A' },
  { organization: 'other', title: 'RATIFY: midostaurin plus chemotherapy in FLT3-mutated AML', url: 'https://doi.org/10.1056/NEJMoa1614359', evidenceLevel: '1' },
  { organization: 'other', title: 'QUAZAR AML-001: oral azacitidine maintenance in AML remission', url: 'https://doi.org/10.1056/NEJMoa2004447', evidenceLevel: '1' },
  { organization: 'other', title: 'VIALE-A: azacitidine plus venetoclax in older/unfit AML', url: 'https://doi.org/10.1056/NEJMoa2014839', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0933: hippocampal avoidance WBRT, not an AML standard', url: 'https://clinicaltrials.gov/study/NCT01314911', evidenceLevel: '2B' },
];

export const ACUTE_MYeloID_LEUKEMIA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/acute-myeloid-leukemia-input.json',
  title: 'Acute myeloid leukemia clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['hematologic'] },
    disease: { type: 'string', enum: ['acute-myeloid-leukemia'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'induction', 'consolidation', 'relapsed', 'refractory', 'post-transplant', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['favorable', 'intermediate', 'adverse', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    molecularFinding: { type: 'string' }, diseasePattern: { type: 'string' },
    measurableResidualDisease: { type: 'boolean' }, mrdPercent: { type: 'number' },
    cnsInvolvement: { type: 'boolean' }, myeloidSarcoma: { type: 'boolean' }, extramedullaryDisease: { type: 'boolean' },
    leukostasis: { type: 'boolean' }, hyperleukocytosis: { type: 'boolean' }, inductionFailure: { type: 'boolean' },
    transplantEligible: { type: 'boolean' }, donorAvailable: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorSystemicTherapy: { type: 'array', items: { type: 'string' } }, symptomaticDisease: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const ACUTE_MYeloID_LEUKEMIA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/acute-myeloid-leukemia-result.json',
  title: 'Acute myeloid leukemia CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['hematologic.acute-myeloid-leukemia'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['hematologic'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
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
  technique: fractions <= 5 ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (dose: Fractionation, cns = false): TargetVolume[] => [
  { name: 'GTV', description: cns ? 'MRI/PET ile görülen CNS miyeloid sarkom veya lösemik ekstramedüller odak.' : 'Görüntülenebilir miyeloid sarkom, ekstramedüller AML veya semptomatik fokal hedef.', dose, margin: 'PET-CT/MRI, biyopsi ve hematolojik bağlama göre' },
  { name: 'CTV', description: cns ? 'Tutulan meninks/kraniyal veya spinal kompartıman ve ilgili sinir yolları.' : 'Makroskopik hedef çevresindeki mikroskopik infiltrasyon ve biyopsi yatağı.', dose, margin: 'Anatomik bariyerler ve görüntüleme doğruluğuna göre 0.5-1.5 cm' },
  { name: 'PTV', description: 'Kurulum, hareket ve günlük IGRT belirsizliği.', dose, margin: 'Konvansiyonel 5-10 mm; stereotaktik hedeflerde 1-3 mm' },
];

const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Extramedullary AML/spine RT objective' },
  { organ: 'Brainstem/optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'CNS myeloid sarcoma objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic extramedullary disease objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Total-body/abdominal RT planning objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Abdominal RT planning objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class AcuteMyeloidLeukemiaDecisionEngine extends BaseDecisionEngine<AcuteMyeloidLeukemiaInput> {
  public readonly id = 'hematologic.acute-myeloid-leukemia';
  public readonly version = '1.0.0';
  public readonly inputSchema = ACUTE_MYeloID_LEUKEMIA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ACUTE_MYeloID_LEUKEMIA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: AcuteMyeloidLeukemiaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const focal = input.myeloidSarcoma === true || input.extramedullaryDisease === true || input.cnsInvolvement === true;
    const urgent = input.leukostasis === true || input.hyperleukocytosis === true;
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; spinal kord, beyin sapı, optik yollar, böbrek, karaciğer, akciğer ve kemik iliği kümülatif dozları doğrulanmalıdır.');
    if (input.measurableResidualDisease || (input.mrdPercent !== undefined && input.mrdPercent > 0.01)) warnings.push('MRD pozitifliği hematoloji protokolü, kurtarma tedavisi ve uygun hastada allo-HSCT kararını etkiler; RT tek başına MRD eradikasyonu sağlamaz.');
    if (urgent) warnings.push('Hiperlökositoz/lökostaz hematolojik acildir; hidroksiüre, lökaferez ve yoğun bakım desteği RT’den önce başlatılmalıdır.');

    if (focal) {
      const dose = fraction(24, 12, 'conventional', '24 Gy / 12 fx; seçilmiş ekstramedüller/miyeloid sarkom hedefi');
      recommendations.push({
        id: 'focal-aml-radiotherapy',
        label: input.cnsInvolvement ? 'CNS miyeloid sarkomunda intratekal/sistemik tedaviye ek seçilmiş RT' : 'Ekstramedüller/miyeloid sarkomda düşük doz fokal RT ve AML sistemik tedavisi',
        indication: 'indicated',
        intent: 'palliative',
        fractionation: dose,
        targetVolumes: targets(dose, input.cnsInvolvement === true),
        oarConstraints: oars,
        systemicTherapy: [
          systemic('concurrent', 'AML için yoğunluk ve mutasyona uygun sistemik tedavi', ['7+3 cytarabine + anthracycline', 'azacitidine + venetoclax uygun hastada', 'FLT3 inhibitörü uygun mutasyonda'], 'RT ile hematoloji protokolü ve enfeksiyon/kanama riskine göre', '1'),
          ...(input.transplantEligible && input.donorAvailable ? [systemic('adjuvant', 'Allojenik hematopoetik kök hücre nakli', ['allo-HSCT'], 'Remisyon, MRD ve risk grubuna göre konsolidasyon sonrası', '2A')] : []),
        ],
        rationale: [
          'AML’de RT rutin kemik iliği tedavisi değildir; miyeloid sarkom, fokal ekstramedüller kitle, CNS tutulumu veya semptomatik lokal hastalıkta hızlı lokal kontrol/palliasyon sağlar.',
          'Sistemik indüksiyon/konsolidasyon, moleküler hedefli tedavi ve uygun hastada allo-HSCT temel tedavilerdir; RT bunların yerine geçmez.',
          'Elektif nodal ışınlama ve torasik 60-66 Gy eşzamanlı KRT/konsolidasyon immünoterapisi AML için standart değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = 'indicated';
      intent = 'palliative';
    } else if (urgent) {
      const dose = fraction(8, 1, 'single-fraction', '8 Gy / 1 fx; yalnızca semptomatik sınırlı hedef varsa');
      recommendations.push({
        id: 'urgent-aml-support',
        label: 'Acil sitoredüksiyon ve hematoloji yönetimine ek seçilmiş kısa RT',
        indication: input.symptomaticDisease ? 'indicated' : 'not-indicated',
        intent: 'palliative',
        fractionation: input.symptomaticDisease ? dose : undefined,
        targetVolumes: input.symptomaticDisease ? targets(dose) : undefined,
        oarConstraints: input.symptomaticDisease ? oars : undefined,
        systemicTherapy: [systemic('induction', 'Acil AML sitoredüksiyonu', ['hidroksiüre', 'lökaferez seçilmiş lökostazda', 'AML protokolü'], 'Yoğun bakım/hematoloji ile hemen', '1')],
        rationale: [
          'Hiperlökositoz ve lökostaz sistemik hematolojik acildir; RT dolaşımdaki blast yükünü güvenilir biçimde azaltmaz.',
          'RT yalnızca eşlik eden sınırlı, semptomatik ekstramedüller hedef için düşünülür; rutin beyin/akciğer veya tüm vücut ışınlaması uygun değildir.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'not-indicated';
      intent = 'palliative';
    } else if (input.setting === 'relapsed' || input.setting === 'refractory') {
      recommendations.push({
        id: 'relapsed-aml',
        label: 'Relaps/refrakter AML’de kurtarma tedavisi, moleküler hedefleme ve allo-HSCT/klinik çalışma',
        indication: 'not-indicated',
        intent: 'salvage',
        systemicTherapy: [systemic('induction', 'Relaps AML için kurtarma tedavisi', ['gilteritinib FLT3-mutasyonda', 'ivosidenib IDH1-mutasyonda', 'enasidenib IDH2-mutasyonda', 'azacitidine + venetoclax veya klinik çalışma'], 'MRD, performans ve nakil uygunluğuna göre', '1')],
        rationale: [
          'Yaygın kemik iliği relapsında RT sistemik hastalığı tedavi etmez; moleküler hedefli kurtarma, klinik çalışma ve uygun hastada allo-HSCT önceliklidir.',
          'Fokal miyeloid sarkom veya semptomatik ekstramedüller relaps gelişirse ayrı involved-site RT kararı verilmelidir.',
          'RTOG 0933 CNS RT standardı değildir; AML’de nörokognitif planlama için doğrudan kanıt olarak kullanılmamalıdır.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[4]),
      });
      rtIndication = 'not-indicated';
      intent = 'salvage';
    } else {
      recommendations.push({
        id: 'systemic-aml',
        label: 'AML’de hematoloji liderliğinde indüksiyon/konsolidasyon ve MRD takibi; rutin RT yok',
        indication: 'not-indicated',
        intent: 'curative',
        systemicTherapy: [systemic('induction', 'Uygun hastada 7+3 veya yoğunluk azaltılmış azacitidine/venetoclax', ['cytarabine + anthracycline', 'azacitidine + venetoclax', 'midostaurin FLT3-mutasyonda'], 'ELN risk, yaş, performans ve organ fonksiyonuna göre', '1')],
        rationale: [
          'AML’nin ana tedavisi sistemik indüksiyon, konsolidasyon ve MRD/risk uyumlu allo-HSCT değerlendirmesidir; RT kemik iliği hastalığında rutin değildir.',
          'Cerrahi R0/R1/R2 veya mediastinal evreleme AML’de primer karar düğümleri değildir; cerrahi yalnızca biyopsi, drenaj veya komplikasyon yönetimi için düşünülür.',
          'Moleküler hedefler FLT3, IDH1/2, NPM1 ve diğer ELN belirteçlerine göre hematoloji tarafından değerlendirilir; EGFR/ALK hedefli tedavi AML için uygun değildir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'not-indicated';
      intent = 'curative';
    }
    rationale.push('Bu motor AML’de hematoloji, transplant, enfeksiyon hastalıkları, radyasyon onkolojisi ve palyatif bakım MDT kararını destekler; RT seçilmiş fokal ekstramedüller kontrol içindir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'hematologic',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'AML için hematoloji MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO ve ELN sürümü, kemik iliği morfoloji/akım sitometrisi, sitogenetik-moleküler profil, MRD, CNS/ekstramedüller görüntüleme ve nakil uygunluğu doğrulanmalıdır.'],
      confidence: 0.9,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const acuteMyeloidLeukemiaEngine = new AcuteMyeloidLeukemiaDecisionEngine();
