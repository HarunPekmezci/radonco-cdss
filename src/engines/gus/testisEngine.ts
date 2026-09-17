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

export type TestisHistology = 'seminoma' | 'non-seminoma' | 'mixed-germ-cell' | 'spermatocytic' | 'unknown';
export type TestisSetting = 'newly-diagnosed' | 'post-orchiectomy' | 'relapsed' | 'metastatic';
export type IGCCCGRisk = 'good' | 'intermediate' | 'poor' | 'not-applicable' | 'unknown';
export type TestisResponse = 'complete-response' | 'partial-response' | 'stable' | 'progressive' | 'unknown';

export interface TestisInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'testicular-cancer';
  setting: TestisSetting;
  stage?: TNMStage;
  histology?: TestisHistology;
  orchiectomyPerformed?: boolean;
  surgeryType?: 'radical-inguinal-orchiectomy' | 'nerve-sparing-RPLND' | 'post-chemotherapy-RPLND' | 'none' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  pathologicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'N3' | 'unknown';
  metastaticSites?: string[];
  serumAFPNgMl?: number;
  serumHCGMiuMl?: number;
  serumLDHIuL?: number;
  tumorMarkersNormalizedAfterOrchiectomy?: boolean;
  igcccgRisk?: IGCCCGRisk;
  retroperitonealNodeSizeCm?: number;
  bulkyRetroperitonealDisease?: boolean;
  renalFunctionAdequateForCisplatin?: boolean;
  pulmonaryFunctionAdequateForBleomycin?: boolean;
  fertilityPreservationDiscussed?: boolean;
  priorAbdominalRT?: boolean;
  responseToChemotherapy?: TestisResponse;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Testicular Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1468',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for genitourinary and germ-cell tumor radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP guidance for seminoma radiotherapy and target delineation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'SWENOTECA: one cycle carboplatin versus surveillance in stage I seminoma',
    url: 'https://doi.org/10.1016/S0140-6736(08)61875-0',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'MRC TE19/EORTC 30982: adjuvant carboplatin versus radiotherapy in stage I seminoma',
    url: 'https://doi.org/10.1016/S0140-6736(05)67588-0',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'IGCCCG update: international germ cell cancer prognostic classification',
    url: 'https://doi.org/10.1200/JCO.2021.38.16_suppl.4507',
    evidenceLevel: '2A',
  },
];

export const TESTIS_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/testis-input.json',
  title: 'Testicular cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['testicular-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'post-orchiectomy', 'relapsed', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    histology: { type: 'string', enum: ['seminoma', 'non-seminoma', 'mixed-germ-cell', 'spermatocytic', 'unknown'] },
    orchiectomyPerformed: { type: 'boolean' },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    pathologicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'unknown'] },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    serumAFPNgMl: { type: 'number' },
    serumHCGMiuMl: { type: 'number' },
    serumLDHIuL: { type: 'number' },
    tumorMarkersNormalizedAfterOrchiectomy: { type: 'boolean' },
    igcccgRisk: { type: 'string', enum: ['good', 'intermediate', 'poor', 'not-applicable', 'unknown'] },
    retroperitonealNodeSizeCm: { type: 'number' },
    bulkyRetroperitonealDisease: { type: 'boolean' },
    renalFunctionAdequateForCisplatin: { type: 'boolean' },
    pulmonaryFunctionAdequateForBleomycin: { type: 'boolean' },
    fertilityPreservationDiscussed: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    responseToChemotherapy: { type: 'string' },
  },
  additionalProperties: true,
};

export const TESTIS_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/testis-result.json',
  title: 'Testicular cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gus.testis'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['gus'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, schedule: string): Fractionation => ({
  class: 'conventional',
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const seminomaTargets = (radiationDose: Fractionation): TargetVolume[] => [
  {
    name: 'CTV',
    description: 'Paraaortik retroperitoneal nodal hedef; ipsilateral renal hilus ve damar anatomisi ile risk-adapte.',
    dose: radiationDose,
    margin: 'Modern involved-node/involved-site prensibi; elektif geniş alanlardan kaçınma',
  },
  {
    name: 'PTV',
    description: 'Solunum ve günlük kurulum belirsizliği için nodal CTV marjı.',
    dose: radiationDose,
    margin: 'IGRT ile yaklaşık 5-10 mm; böbrek ve barsak dozlarına göre',
  },
];

const testisOars: OARConstraint[] = [
  { organ: 'Both kidneys', metric: 'Dmean', limit: 10, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Seminoma para-aortic RT renal protection objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Retroperitoneal RT bowel objective' },
  { organ: 'Small bowel', metric: 'V30', limit: 30, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Retroperitoneal RT bowel objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
  { organ: 'Remaining testis', metric: 'Dmean', limit: 2, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Fertility and Leydig-cell preservation objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class TestisDecisionEngine extends BaseDecisionEngine<TestisInput> {
  public readonly id = 'gus.testis';
  public readonly version = '1.0.0';
  public readonly inputSchema = TESTIS_INPUT_JSON_SCHEMA;
  public readonly outputSchema = TESTIS_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: TestisInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (!input.fertilityPreservationDiscussed) warnings.push('Orşiektomi/kemoterapi öncesi sperm kriyoprezervasyonu ve fertilite danışmanlığı belgelenmelidir.');
    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; böbrek, barsak, kemik iliği ve karşı testis kümülatif dozları değerlendirilmelidir.');
    if (input.serumAFPNgMl !== undefined && input.histology === 'seminoma' && input.serumAFPNgMl > 0) warnings.push('Saf seminoma histolojisinde yükselmiş AFP non-seminomatöz komponent veya patoloji uyumsuzluğu açısından yeniden değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'post-orchiectomy') {
      const stageI = input.nodalStatus === 'N0' && !input.metastaticSites?.length;
      if (input.histology === 'seminoma' && stageI) {
        const paraaorticDose = fraction(20, 10, 'Paraaortik 20 Gy / 10 fx');
        recommendations.push({
          id: 'stage-i-seminoma-management',
          label: 'Evre I seminoma: sürveyans, tek doz/iki doz karboplatin veya seçilmiş RT',
          indication: 'consider',
          intent: 'adjuvant',
          fractionation: paraaorticDose,
          targetVolumes: seminomaTargets(paraaorticDose),
          oarConstraints: testisOars,
          systemicTherapy: [
            systemic('adjuvant', 'Tek doz karboplatin AUC 7 seçeneği', ['carboplatin'], 'Sürveyans uyumu, tümör boyutu ve rete testis özelliklerine göre; RT alternatifi'),
          ],
          rationale: [
            'Evre I seminoma’da yoğun görüntüleme/serum belirteçleriyle sürveyans, tek doz karboplatin ve seçilmiş modern paraaortik RT seçenekleridir.',
            'MRC TE19/EORTC 30982 ve SWENOTECA, adjuvan karboplatin ile RT/sürveyans stratejilerini destekler.',
            'RT uygulanacaksa involved-node/involved-site yaklaşımı ve böbrek/karşı testis korunması; tarihsel geniş dog-leg alanlarından kaçınma esastır.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[1]),
        });
        rtIndication = 'consider';
      } else {
        const systemicTherapy = input.igcccgRisk === 'poor'
          ? [systemic('neoadjuvant', '4 kür BEP veya bleomisin uygun değilse VIP', ['bleomycin + etoposide + cisplatin veya etoposide + ifosfamide + cisplatin'], 'IGCCCG poor-risk germ-cell tümörde')]
          : [systemic('neoadjuvant', '3 kür BEP veya 4 kür EP', ['bleomycin + etoposide + cisplatin veya etoposide + cisplatin'], 'Non-seminoma/seminoma evre II-III ve IGCCCG riskine göre')];
        recommendations.push({
          id: 'germ-cell-systemic-and-rplnd',
          label: 'Germ hücreli tümörde cisplatin bazlı kemoterapi ± RPLND',
          indication: 'indicated',
          intent: 'curative',
          systemicTherapy,
          rationale: [
            'Orşiektomi sonrası kalıcı belirteç yüksekliği, retroperitoneal nodal veya metastatik hastalıkta cisplatin bazlı kemoterapi küratif omurgadır.',
            'Non-seminomada seçilmiş rezidüel retroperitoneal kitlelerde post-kemoterapi RPLND; seminoma rezidüsünde PET/BT ve klinik bağlamla değerlendirme yapılır.',
            'IGCCCG risk grubu, AFP/hCG/LDH ve primer tümör bölgesi tedavi yoğunluğunu belirler.',
          ],
          guidelineReferences: references(TRIALS[2]),
        });
        rtIndication = 'not-indicated';
      }
    } else if (input.setting === 'relapsed') {
      recommendations.push({
        id: 'relapsed-testicular-cancer',
        label: 'Nüks germ hücreli tümörde salvage kemoterapi/cerrahi',
        indication: 'indicated',
        intent: 'salvage',
        systemicTherapy: [
          systemic('palliative', 'Salvage cisplatin bazlı tedavi veya yüksek doz kemoterapi', ['TIP veya VeIP; seçilmiş hastada yüksek doz karboplatin/etoposide'], 'Önceki tedavi, interval ve IGCCCG/salvage riskine göre'),
        ],
        rationale: [
          'Nüks hastalıkta deneyimli germ-cell tümör merkezinde multidisipliner salvage kemoterapi ve rezidüel kitle cerrahisi değerlendirilmelidir.',
          'R1/R2 veya rezeke edilemeyen rezidüel hastalıkta ek sistemik tedavi/klinik çalışma düşünülür; RT seçilmiş semptomatik veya lokal kontrol gerektiren odaklarla sınırlıdır.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'curative';
      recommendations.push({
        id: 'metastatic-testicular-systemic',
        label: 'Metastatik germ hücreli tümörde küratif sistemik tedavi',
        indication: 'indicated',
        intent,
        systemicTherapy: [
          systemic('neoadjuvant', 'IGCCCG riskine göre BEP/EP/VIP', ['cisplatin + etoposide ± bleomycin/ifosfamide'], 'Primer sistemik tedavi; renal ve pulmoner uygunluğa göre'),
        ],
        rationale: [
          'Metastatik testis kanserinde sistemik cisplatin bazlı tedavi yüksek kür oranı nedeniyle temel yaklaşımdır; RT primer tedavi değildir.',
          'Bleomisin pulmoner riski, renal fonksiyon, nöropati ve fertilite tedavi seçimini etkiler; sperm bankacılığı ve organ fonksiyonu önceden değerlendirilmelidir.',
        ],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = input.metastaticSites?.length ? 'consider' : 'not-indicated';
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gus',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.stage || input.histology === 'unknown' || input.igcccgRisk === 'unknown' ? ['TNM, histoloji veya IGCCCG risk sınıflaması tamamlanmamış.'] : undefined,
      confidence: !input.stage || input.histology === 'unknown' || input.igcccgRisk === 'unknown' ? 0.72 : 0.9,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: TestisInput): string {
    if (input.histology === 'seminoma' && input.nodalStatus === 'N0') return 'Evre I/erken seminoma: sürveyans, karboplatin veya seçilmiş sınırlı paraaortik RT.';
    if (input.setting === 'relapsed') return 'Nüks testis kanseri: salvage cisplatin bazlı kemoterapi, rezidüel kitle cerrahisi ve seçilmiş RT.';
    return 'Testis germ hücreli kanseri: orşiektomi, tümör belirteçleri ve IGCCCG riskine göre cisplatin bazlı küratif tedavi.';
  }
}

export const testisEngine = new TestisDecisionEngine();

export default testisEngine;
