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

export type RectalSetting =
  | 'newly-diagnosed'
  | 'locally-advanced'
  | 'postoperative'
  | 'recurrent'
  | 'metastatic';
export type RectalRisk =
  | 'low'
  | 'intermediate'
  | 'high'
  | 'very-high'
  | 'unknown';
export type RectalMMRStatus = 'pMMR' | 'dMMR' | 'MSI-H' | 'unknown';
export type RectalResponse = 'complete-clinical-response' | 'partial-response' | 'stable' | 'progressive' | 'unknown';

export interface RectumInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'rectal-cancer';
  setting: RectalSetting;
  stage?: TNMStage;
  rectalRisk?: RectalRisk;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'unknown';
  mesorectalFascia?: 'clear' | 'threatened' | 'involved' | 'unknown';
  extramuralVascularInvasion?: boolean;
  tumorDistanceFromAnalVergeCm?: number;
  threatenedSphincter?: boolean;
  metastaticSites?: string[];
  msiStatus?: RectalMMRStatus;
  neoadjuvantResponse?: RectalResponse;
  surgeryType?: 'TME' | 'local-excision' | 'abdominoperineal-resection' | 'none' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  positiveCircumferentialMarginMm?: number;
  priorPelvicRT?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Rectal Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1461',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO Clinical Practice Guideline: radiation therapy for rectal cancer',
  url: 'https://www.practicalradonc.org/article/S1879-355X(20)30115-5/fulltext',
  evidenceLevel: 'A',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP consensus recommendations for rectal cancer radiotherapy and target delineation',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'RAPIDO: short-course radiotherapy followed by chemotherapy versus standard chemoradiotherapy',
    url: 'https://doi.org/10.1016/S0140-6736(20)32752-5',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'PRODIGE 23: induction mFOLFIRINOX followed by chemoradiotherapy and surgery',
    url: 'https://doi.org/10.1016/S0140-6736(21)00016-2',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'PROSPECT: selective use of radiation after neoadjuvant chemotherapy in rectal cancer',
    url: 'https://doi.org/10.1056/NEJMoa2300445',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'OPRA: total neoadjuvant therapy and organ preservation in rectal cancer',
    url: 'https://doi.org/10.1200/JCO.22.00032',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'MSI-H/dMMR locally advanced rectal cancer immunotherapy evidence',
    url: 'https://doi.org/10.1056/NEJMoa2201445',
    evidenceLevel: '2A',
  },
];

export const RECTUM_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/rectum-input.json',
  title: 'Rectal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['rectal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'locally-advanced', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    rectalRisk: { type: 'string', enum: ['low', 'intermediate', 'high', 'very-high', 'unknown'] },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'unknown'] },
    mesorectalFascia: { type: 'string', enum: ['clear', 'threatened', 'involved', 'unknown'] },
    extramuralVascularInvasion: { type: 'boolean' },
    tumorDistanceFromAnalVergeCm: { type: 'number' },
    threatenedSphincter: { type: 'boolean' },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    msiStatus: { type: 'string', enum: ['pMMR', 'dMMR', 'MSI-H', 'unknown'] },
    neoadjuvantResponse: { type: 'string', enum: ['complete-clinical-response', 'partial-response', 'stable', 'progressive', 'unknown'] },
    surgeryType: { type: 'string', enum: ['TME', 'local-excision', 'abdominoperineal-resection', 'none', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    positiveCircumferentialMarginMm: { type: 'number' },
    priorPelvicRT: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const RECTUM_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/rectum-result.json',
  title: 'Rectal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.rectum'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['gis'] },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  additionalProperties: true,
};

const fraction = (
  totalDoseGy: number,
  fractions: number,
  fractionationClass: Fractionation['class'],
  schedule: string,
): Fractionation => ({
  class: fractionationClass,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: 'IGRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const rectalTargets = (radiationDose: Fractionation, includeNodes = true): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Pelvik MR, endoskopi ve klinik muayene ile görülen primer tümör.',
    dose: radiationDose,
    margin: 'Görüntülenebilir primer tümör',
  },
  {
    name: 'CTV',
    description: 'Primer tümör yatağı, mezorektum ve riskli mikroskopik yayılım yolları.',
    dose: radiationDose,
    margin: 'Mezorektal fasya, peritoneal refleksiyon ve sakral/yanal anatomik bariyerler dikkate alınır',
  },
  ...(includeNodes
    ? [{
        name: 'CTV',
        description: 'Presakral, internal iliak ve obturator nodal bölgeler; tümör seviyesi ve risk özelliklerine göre.',
        dose: fraction(45, 25, 'conventional', 'Pelvik nodlar 45 Gy / 25 fx'),
        margin: 'RTOG/ESTRO pelvik nodal atlası',
      }]
    : []),
  {
    name: 'PTV',
    description: 'İç organ hareketi, mesane/rectum doluluğu ve günlük kurulum belirsizliği için CTV marjı.',
    dose: radiationDose,
    margin: 'IGRT ile yaklaşık 5-10 mm; kurum protokolü ve hareket yönetimine göre',
  },
];

const rectalOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'V45', limit: 195, unit: 'cc', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic rectal cancer chemoradiotherapy objective' },
  { organ: 'Small bowel', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic RT bowel constraint' },
  { organ: 'Bladder', metric: 'V40', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Rectal cancer pelvic RT objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic RT planning objective' },
  { organ: 'Anal sphincter', metric: 'Dmean', limit: 40, unit: 'Gy', priority: 'acceptable', source: 'protocol', sourceReference: 'Rectal cancer organ preservation planning objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class RectumDecisionEngine extends BaseDecisionEngine<RectumInput> {
  public readonly id = 'gis.rectum';
  public readonly version = '1.0.0';
  public readonly inputSchema = RECTUM_INPUT_JSON_SCHEMA;
  public readonly outputSchema = RECTUM_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: RectumInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';
    const highRiskMRI = input.mesorectalFascia === 'threatened' || input.mesorectalFascia === 'involved' || input.extramuralVascularInvasion || input.nodalStatus === 'N2';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; ince barsak, mesane, femur ve anastomoz/anal sfinkter kümülatif dozları değerlendirilmeden yeniden ışınlama yapılmamalıdır.');
    if (input.msiStatus === 'dMMR' || input.msiStatus === 'MSI-H') {
      recommendations.push({
        id: 'mmr-directed-immunotherapy',
        label: 'dMMR/MSI-H hastalıkta neoadjuvan immünoterapi değerlendirmesi',
        indication: 'consider',
        intent: 'neoadjuvant',
        systemicTherapy: [systemic('neoadjuvant', 'PD-1 inhibitörü ile tümör eradikasyonu/organ koruma yaklaşımı', ['dostarlimab veya pembrolizumab'], 'Moleküler doğrulama, klinik çalışma/erişim ve MDT protokolüne göre')],
        rationale: [
          'dMMR/MSI-H lokal ileri rektum kanserinde PD-1 blokajı olağan kemoradyoterapi ve cerrahi sıralamasını değiştirebilir.',
          'Klinik tam yanıt sağlansa bile endoskopi, rektal MR, parmakla muayene ve yakın takip ile güvenli watch-and-wait kriterleri doğrulanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[4]),
      });
    }

    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') {
      const shortCourse = fraction(25, 5, 'moderate-hypofractionation', '25 Gy / 5 fx; kısa kür RT');
      const longCourse = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + 5.4 Gy boost / 3 fx');
      const tnt = highRiskMRI || input.setting === 'locally-advanced';
      recommendations.push({
        id: 'rectal-total-neoadjuvant-therapy',
        label: tnt ? 'Total neoadjuvan tedavi (TNT) ve TME/watch-and-wait değerlendirmesi' : 'Risk-adapte neoadjuvan yaklaşım',
        indication: 'indicated',
        intent: 'neoadjuvant',
        fractionation: highRiskMRI ? shortCourse : longCourse,
        targetVolumes: rectalTargets(highRiskMRI ? shortCourse : longCourse, true),
        oarConstraints: rectalOars,
        systemicTherapy: [
          systemic('induction', 'FOLFOX veya CAPOX tabanlı sistemik kemoterapi', ['5-FU/leucovorin/oxaliplatin veya capecitabine/oxaliplatin'], 'RT öncesi veya sonrası TNT sıralamasına göre'),
          systemic('concurrent', 'Uzun kür RT ile eşzamanlı fluoropirimidin', ['capecitabine veya infüzyonel 5-FU'], 'Uzun kür kemoradyoterapi sırasında'),
        ],
        rationale: [
          'Yüksek riskli MRI özelliklerinde TNT; uzak metastaz kontrolünü, tedavi tamamlama oranını ve lokal tedaviye hazırlığı artırmak amacıyla standart seçeneklerdendir.',
          'RAPIDO kısa kür RT + kemoterapi yaklaşımını, PRODIGE 23 ise indüksiyon mFOLFIRINOX içeren TNT’yi destekler.',
          highRiskMRI ? 'CRM tehditli/pozitif, EMVI pozitif, N2 veya düşük yerleşimli tümörde mezorektal fasya, sfinkter ve lateral nodlar MRI ile ayrıca raporlanmalıdır.' : 'Daha düşük riskli üst rektum/erken lokal ileri olguda PROSPECT benzeri seçilmiş RT azaltma stratejileri yalnızca uygun MRI ve MDT koşullarında düşünülebilir.',
          'Elektif nodal RT tümör seviyesi, T/N evresi ve MRI riskine göre presakral/internal iliak/obturator alanlara yönlendirilir; rutin geniş para-aortik ENI önerilmez.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      recommendations.push({
        id: 'organ-preservation',
        label: 'Klinik tam yanıt sonrası watch-and-wait/organ koruma',
        indication: input.neoadjuvantResponse === 'complete-clinical-response' ? 'consider' : 'conditional',
        intent: 'curative',
        rationale: [
          'Klinik tam yanıt; endoskopi, DRE ve MRI ile doğrulanır. OPRA verileri TNT sonrası seçilmiş hastalarda organ koruma stratejisini destekler.',
          'Watch-and-wait, yoğun endoskopik, MRI, DRE ve CEA sürveyansı olmadan uygulanmamalıdır; lokal yeniden büyümede salvage TME planı bulunmalıdır.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + 5.4 Gy boost / 3 fx');
      const highRisk = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || (input.positiveCircumferentialMarginMm ?? 99) <= 1 || input.nodalStatus === 'N2';
      recommendations.push({
        id: 'postoperative-rectal-chemoradiation',
        label: highRisk ? 'Yüksek riskli postoperatif kemoradyoterapi' : 'Patolojiye göre postoperatif sistemik tedavi/izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? rectalTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRisk ? rectalOars : undefined,
        systemicTherapy: [systemic('adjuvant', 'Adjuvan fluoropirimidin/oksaliplatin tabanlı kemoterapi', ['FOLFOX veya CAPOX'], 'Patolojik evre, önceki neoadjuvan tedavi ve toleransa göre')],
        rationale: [
          'R1/R2 veya CRM pozitifliği, pT3/pT4 ve pozitif nodal hastalık lokal ve uzak nüks riskini artırır.',
          'Postoperatif RT, primer planlama yapılamamış veya yüksek riskli lokal özellikler bulunan seçilmiş hastalarda düşünülür; mümkünse neoadjuvan yaklaşım tercih edilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(50.4, 28, 'conventional', 'Salvage pelvis RT 45 Gy / 25 fx + boost; önceki RT durumuna göre');
      recommendations.push({
        id: 'recurrent-rectal-salvage',
        label: 'Lokal nükste salvage cerrahi ± yeniden ışınlama',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: rectalTargets(salvageDose, true),
        oarConstraints: rectalOars,
        rationale: [
          'Lokal nükste R0 rezeksiyon olasılığı, sakral/yan duvar invazyonu, CRM ve önceki RT dozu deneyimli pelvik MDT ile değerlendirilir.',
          'Önceki RT sonrası yeniden ışınlama yalnızca kümülatif doz, interval, hedef ve barsak hareketi dikkate alınarak seçilmiş hastada uygulanır.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      recommendations.push({
        id: 'metastatic-rectal-systemic',
        label: 'Metastatik rektum kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy: [
          systemic('palliative', 'Moleküler profile göre sistemik tedavi', ['FOLFOX/FOLFIRI ± bevacizumab veya anti-EGFR; MSI-H/dMMR’de immünoterapi'], 'RAS/BRAF, MSI/MMR, tümör tarafı ve önceki tedaviye göre'),
        ],
        rationale: [
          'Metastatik hastalıkta RAS/BRAF ve MSI/MMR testleri sistemik tedavi sırasını belirler.',
          'Primer tümör veya metastazlara RT kanama, ağrı, obstrüksiyon, spinal/kemik tehdidi veya seçilmiş oligometastatik hastalıkta uygulanır.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = input.metastaticSites?.length ? 'conditional' : 'consider';
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gis',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.stage || input.mesorectalFascia === 'unknown' ? ['Pelvik MRI/CRM ve TNM değerlendirmesi tamamlanmamış.'] : undefined,
      confidence: !input.stage || input.mesorectalFascia === 'unknown' ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: RectumInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'locally-advanced') return 'Yeni tanı/lokal ileri rektum kanseri: MRI riskine göre TNT, neoadjuvan RT, TME veya watch-and-wait değerlendirmesi.';
    if (input.setting === 'postoperative') return 'Postoperatif rektum kanseri: CRM/R1-R2, pT ve nodal duruma göre adjuvan tedavi.';
    if (input.setting === 'recurrent') return 'Lokal nüks rektum kanseri: R0 salvage cerrahi ve seçilmiş yeniden ışınlama.';
    return 'Metastatik rektum kanseri: RAS/BRAF/MSI/MMR profile göre sistemik tedavi ve semptom odaklı RT.';
  }
}

export const rectumEngine = new RectumDecisionEngine();

export default rectumEngine;
