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
} from '../../types/cdss';

export type ALLSetting = 'newly-diagnosed' | 'during-treatment' | 'relapsed' | 'maintenance' | 'surveillance';
export type ALLLineage = 'B-ALL' | 'T-ALL' | 'mixed-phenotype' | 'unknown';
export type ALLRisk = 'standard-risk' | 'high-risk' | 'very-high-risk' | 'unknown';
export type ALLCNSStatus = 'CNS1' | 'CNS2' | 'CNS3' | 'traumatic-tap' | 'unknown';
export type ALLMolecularFinding = 'ETV6-RUNX1' | 'hyperdiploid' | 'BCR-ABL1' | 'KMT2A-rearranged' | 'hypodiploid' | 'IKZF1-plus' | 'Ph-like' | 'none' | 'unknown';

export interface AcuteLymphoblasticLeukemiaInput extends ClinicalCaseInput {
  organSystem: 'cns';
  disease: 'acute-lymphoblastic-leukemia';
  setting: ALLSetting;
  lineage?: ALLLineage;
  riskGroup?: ALLRisk;
  cnsStatus?: ALLCNSStatus;
  molecularFinding?: ALLMolecularFinding;
  minimalResidualDisease?: boolean;
  mrdPercent?: number;
  testicularInvolvement?: boolean;
  extramedullaryDisease?: boolean;
  inductionFailure?: boolean;
  relapseSite?: 'isolated-CNS' | 'isolated-testis' | 'marrow' | 'combined' | 'unknown';
  priorCranialRT?: boolean;
  priorSystemicTherapy?: string[];
  ageYears?: number;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Pediatric Acute Lymphoblastic Leukemia',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1475',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for hematologic malignancies and pediatric radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for pediatric CNS, testicular and hematologic malignancy radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'COG AALL0331: risk-adapted therapy for standard-risk B-ALL', url: 'https://clinicaltrials.gov/study/NCT00103285', evidenceLevel: '1' },
  { organization: 'other', title: 'COG AALL1131: high-risk B-ALL therapy and targeted approaches', url: 'https://clinicaltrials.gov/study/NCT02883049', evidenceLevel: '1' },
  { organization: 'other', title: 'COG AALL0434: nelarabine and augmented therapy for T-ALL', url: 'https://clinicaltrials.gov/study/NCT00408005', evidenceLevel: '1' },
  { organization: 'other', title: 'UKALL 2003: risk-adapted pediatric ALL treatment and CNS-directed therapy', url: 'https://doi.org/10.1016/S0140-6736(14)60179-2', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0933: hippocampal avoidance whole-brain radiotherapy, not an ALL standard but a neurocognitive planning reference', url: 'https://clinicaltrials.gov/study/NCT01314911', evidenceLevel: '2B' },
];

export const ACUTE_LYMPHOBLASTIC_LEUKEMIA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/acute-lymphoblastic-leukemia-input.json',
  title: 'Pediatric acute lymphoblastic leukemia clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['cns'] },
    disease: { type: 'string', enum: ['acute-lymphoblastic-leukemia'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'during-treatment', 'relapsed', 'maintenance', 'surveillance'] },
    lineage: { type: 'string', enum: ['B-ALL', 'T-ALL', 'mixed-phenotype', 'unknown'] },
    riskGroup: { type: 'string', enum: ['standard-risk', 'high-risk', 'very-high-risk', 'unknown'] },
    cnsStatus: { type: 'string', enum: ['CNS1', 'CNS2', 'CNS3', 'traumatic-tap', 'unknown'] },
    molecularFinding: { type: 'string' }, minimalResidualDisease: { type: 'boolean' }, mrdPercent: { type: 'number' },
    testicularInvolvement: { type: 'boolean' }, extramedullaryDisease: { type: 'boolean' }, inductionFailure: { type: 'boolean' },
    relapseSite: { type: 'string', enum: ['isolated-CNS', 'isolated-testis', 'marrow', 'combined', 'unknown'] },
    priorCranialRT: { type: 'boolean' }, priorSystemicTherapy: { type: 'array', items: { type: 'string' } },
    ageYears: { type: 'number' }, performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const ACUTE_LYMPHOBLASTIC_LEUKEMIA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/acute-lymphoblastic-leukemia-result.json',
  title: 'Pediatric acute lymphoblastic leukemia CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['pediatric-age.acute-lymphoblastic-leukemia'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['cns'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique: 'IMRT',
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, testis = false): TargetVolume[] => [
  { name: 'GTV', description: testis ? 'Klinik ve ultrason ile tutulan testis/testiküler yapı.' : 'Beyin ve spinal meninkslerde CNS lösemik tutulumu veya relaps hedefi.', dose, margin: 'BOS sitolojisi, kontrastlı MRI ve klinik muayene ile' },
  { name: 'CTV', description: testis ? 'Tutulan testis ve çevreleyen skrotal/testiküler kompartıman.' : 'Tüm beyin, meninksler ve gerekirse kraniyal sinir çıkışları; spinal RT yalnızca protokole göre.', dose, margin: 'Kraniyal RT’de kafa kemik anatomisi/meninks; testiste anatomik kompartıman ve günlük IGRT' },
  { name: 'PTV', description: 'Pediatrik immobilizasyon ve günlük kurulum belirsizliğini kapsayan hacim.', dose, margin: 'Genellikle 3-5 mm; lens/hipofiz/hipotalamus korunarak' },
];
const oars: OARConstraint[] = [
  { organ: 'Lens', metric: 'Dmax', limit: 6, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pediatric cranial RT objective' },
  { organ: 'Optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Cranial leukemia RT objective' },
  { organ: 'Hypothalamus/pituitary', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric endocrine preservation objective' },
  { organ: 'Cochlea', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Pediatric hearing preservation objective' },
  { organ: 'Brain', metric: 'Dmean', limit: 24, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Neurocognitive preservation objective' },
  { organ: 'Testis', metric: 'Dmax', limit: 2, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Contralateral gonadal preservation objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class AcuteLymphoblasticLeukemiaDecisionEngine extends BaseDecisionEngine<AcuteLymphoblasticLeukemiaInput> {
  public readonly id = 'pediatric-age.acute-lymphoblastic-leukemia';
  public readonly version = '1.0.0';
  public readonly inputSchema = ACUTE_LYMPHOBLASTIC_LEUKEMIA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ACUTE_LYMPHOBLASTIC_LEUKEMIA_OUTPUT_JSON_SCHEMA;

  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: AcuteLymphoblasticLeukemiaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const CNSIndication = input.cnsStatus === 'CNS3' || input.relapseSite === 'isolated-CNS' || input.extramedullaryDisease === true;
    const testisIndication = input.testicularInvolvement === true || input.relapseSite === 'isolated-testis';
    if (input.priorCranialRT) warnings.push('Önceki kraniyal RT mevcut; kümülatif beyin, lens, optik yollar, hipotalamo-hipofizer aks ve nörokognitif dozlar pediatrik re-irradiation uzmanıyla değerlendirilmelidir.');
    if (input.minimalResidualDisease || (input.mrdPercent !== undefined && input.mrdPercent > 0.01)) warnings.push('MRD pozitifliği hematoloji protokolü, hedefe yönelik tedavi ve gerekirse kök hücre nakli değerlendirmesini etkiler; RT tek başına MRD tedavisi değildir.');
    if (input.molecularFinding === 'BCR-ABL1' || input.molecularFinding === 'Ph-like') rationale.push('BCR-ABL1/Ph-like biyoloji için tirozin kinaz inhibitörü ve moleküler hedefli yaklaşım pediatrik hematoloji protokolüne göre RT’den bağımsız planlanmalıdır.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'during-treatment' || input.setting === 'maintenance') {
      if (CNSIndication || testisIndication) {
        const dose = fraction(testisIndication ? 24 : 18, testisIndication ? 12 : 10, 'conventional', testisIndication ? '24 Gy / 12 fx; tutulan testis veya izole testiküler relaps' : '18 Gy / 10 fx; protokole uygun CNS3/çok yüksek risk kraniyal RT');
        recommendations.push({
          id: 'high-risk-all-local-control',
          label: CNSIndication ? 'CNS-pozitif/izole CNS ALL için intratekal-sistemik tedaviye ek protokol kraniyal RT' : 'Tutulan testis için sistemik tedaviye ek testiküler RT',
          indication: 'indicated', intent: input.setting === 'maintenance' ? 'prophylactic' : 'adjuvant',
          fractionation: dose, targetVolumes: targets(dose, testisIndication), oarConstraints: oars,
          systemicTherapy: [systemic('concurrent', 'CNS-yönelimli ALL protokolü', ['intratekal metotreksat/sitarabin', 'yüksek doz sistemik metotreksat', 'protokole uygun çoklu ajan kemoterapi'], 'RT zamanlaması ve dozuyla birlikte pediatrik hematoloji protokolüne göre', '1')],
          rationale: [
            'CNS3, izole CNS relapsı veya seçilmiş çok yüksek risk gruplarında RT; intratekal ve sistemik kemoterapiye ek, protokol tanımlı bir lokal kontrol bileşenidir.',
            'Rutin profilaktik kraniyal RT CNS1/CNS2 standart ALL’de çoğunlukla önerilmez; nörokognitif, endokrin ve vasküler geç etkiler nedeniyle kemoterapi temelli CNS profilaksisi tercih edilir.',
            'Testiküler hastalıkta sistemik tedavi temeldir; persistan veya izole relaps testis için RT kararı bilateral testis dozu, fertilite ve protokole göre verilmelidir.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
        });
        rtIndication = 'indicated'; intent = input.setting === 'maintenance' ? 'prophylactic' : 'adjuvant';
      } else {
        recommendations.push({
          id: 'standard-all-no-radiotherapy',
          label: 'Risk ve MRD uyumlu sistemik/intratekal ALL tedavisi; rutin RT yok',
          indication: 'not-indicated', intent: 'curative',
          systemicTherapy: [systemic('induction', 'Pediatrik ALL çoklu ajan protokolü', ['kortikosteroid', 'vincristine', 'asparaginase', 'anthracycline risk uyumlu'], 'İndüksiyon, konsolidasyon, interim maintenance ve idame fazlarıyla', '1')],
          rationale: ['CNS1/CNS2 ve testiküler tutulumu olmayan çocukluk çağı ALL’de rutin kraniyal veya torasik RT yerine risk/MRD uyumlu sistemik ve intratekal tedavi standarttır.', 'Cerrahi rezeksiyon ALL tedavisinde rol taşımaz; tanı kemik iliği/akım sitometrisi ve gerekli moleküler testlerle konur.'],
          guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[3]),
        });
        rtIndication = 'not-indicated'; intent = 'curative';
      }
    } else if (input.setting === 'relapsed') {
      const dose = fraction(24, 12, 'conventional', '24 Gy / 12 fx; seçilmiş izole CNS/testis relapsı');
      recommendations.push({
        id: 'relapsed-all',
        label: CNSIndication || testisIndication ? 'İzole ekstramedüller ALL relapsında kurtarma sistemik tedavisi ve fokal RT' : 'Marrow/combined ALL relapsında kurtarma tedavisi veya klinik çalışma; rutin RT yok',
        indication: CNSIndication || testisIndication ? 'indicated' : 'conditional', intent: 'salvage',
        fractionation: CNSIndication || testisIndication ? dose : undefined,
        targetVolumes: CNSIndication || testisIndication ? targets(dose, testisIndication) : undefined,
        oarConstraints: CNSIndication || testisIndication ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Relaps ALL için kurtarma protokolü ve seçilmiş allojenik kök hücre nakli/CAR-T', ['blinatumomab', 'inotuzumab ozogamicin B-ALL için', 'nelarabine T-ALL için', 'CAR-T veya allojenik nakil uygun hastada'], 'Lineage, CD19/CD22, MRD ve önceki tedavilere göre', '1')],
        rationale: ['Relaps ALL’de kemik iliği, CNS ve testis bölgeleri yeniden evrelendirilmelidir; sistemik kurtarma tedavisi ve klinik çalışma önceliklidir.', 'İzole CNS/testis relapsında RT seçilmiş lokal kontrol sağlar; daha önce RT alanlarda kümülatif doz ve geç toksisite özellikle önemlidir.', 'RTOG 0933 ALL standardı değildir; yalnızca nörokognitif koruma ve hipokampus doz planlaması konusunda bağlamsal bir referanstır.'],
        guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = CNSIndication || testisIndication ? 'indicated' : 'conditional'; intent = 'salvage';
    } else {
      recommendations.push({
        id: 'all-surveillance',
        label: 'Tedavi sonrası ALL izlemi; rutin RT yok',
        indication: 'not-indicated', intent: 'observation',
        rationale: ['Remisyonda RT yerine hematolojik/MRD izlem, CNS/testis muayenesi, nörokognitif, endokrin, kardiyak ve fertilite geç etkilerinin pediatrik survivorship programıyla takibi yapılmalıdır.'],
        guidelineReferences: references(TRIALS[0]),
      });
    }
    rationale.push('ALL yönetimi pediatrik hematoloji merkezinde protokol, MRD, CNS/testis durumu, moleküler risk ve tedavi yanıtına göre yapılır; RT bağımsız bir kanser tedavisi değil, seçilmiş ekstramedüller kontrol bileşenidir.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'cns',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'ALL için pediatrik hematoloji MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, kemik iliği/MRD, BOS sitolojisi, testis muayenesi-ultrasonu, moleküler alt grup, önceki RT ve güncel COG/UKALL/BFM protokolü doğrulanmalıdır.'],
      confidence: 0.9, guidelineReferences: references(...TRIALS),
    };
  }
}

export const acuteLymphoblasticLeukemiaEngine = new AcuteLymphoblasticLeukemiaDecisionEngine();
