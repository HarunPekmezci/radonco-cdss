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

export type GistSetting = 'newly-diagnosed' | 'localized' | 'postoperative' | 'recurrent' | 'metastatic';
export type GistSite = 'stomach' | 'small-bowel' | 'duodenum' | 'colorectal' | 'extra-gastrointestinal' | 'unknown';
export type GistRisk = 'very-low' | 'low' | 'intermediate' | 'high' | 'ruptured' | 'unknown';
export type GistMutation =
  | 'KIT-exon-9'
  | 'KIT-exon-11'
  | 'PDGFRA-D842V'
  | 'PDGFRA-other'
  | 'SDH-deficient'
  | 'NF1-associated'
  | 'BRAF'
  | 'wild-type-unknown'
  | 'unknown';

export interface GistInput extends ClinicalCaseInput {
  organSystem: 'gis';
  disease: 'gist';
  setting: GistSetting;
  stage?: TNMStage;
  primarySite?: GistSite;
  tumorSizeCm?: number;
  mitoticRatePer5mm2?: number;
  rupture?: boolean;
  gistRisk?: GistRisk;
  resectability?: 'resectable' | 'borderline' | 'unresectable' | 'unknown';
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  mutation?: GistMutation;
  KITPDGFRAStatusKnown?: boolean;
  metastaticSites?: string[];
  progressionOnTKI?: boolean;
  priorAbdominalRT?: boolean;
  bleeding?: boolean;
  obstruction?: boolean;
  pain?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Soft Tissue Sarcoma / GIST',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1465',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gastrointestinal and oligometastatic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for soft-tissue sarcoma and stereotactic radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ACOSOG Z9001: adjuvant imatinib after resection of primary GIST', url: 'https://doi.org/10.1056/NEJMoa0802188', evidenceLevel: '1' },
  { organization: 'other', title: 'SSG XVIII/AIO: 3 years versus 1 year of adjuvant imatinib in high-risk GIST', url: 'https://doi.org/10.1056/NEJMoa1207481', evidenceLevel: '1' },
  { organization: 'other', title: 'B2222: imatinib in unresectable/metastatic GIST', url: 'https://doi.org/10.1056/NEJM200003233421202', evidenceLevel: '1' },
  { organization: 'other', title: 'INVICTUS: ripretinib in advanced GIST after prior kinase inhibitors', url: 'https://doi.org/10.1056/NEJMoa1911167', evidenceLevel: '1' },
  { organization: 'other', title: 'NAVIGATOR: avapritinib in PDGFRA exon 18 mutant GIST', url: 'https://doi.org/10.1016/S0140-6736(20)30964-7', evidenceLevel: '2A' },
];

export const GIST_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/gist-input.json',
  title: 'Gastrointestinal stromal tumor clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gis'] },
    disease: { type: 'string', enum: ['gist'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'localized', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    primarySite: { type: 'string', enum: ['stomach', 'small-bowel', 'duodenum', 'colorectal', 'extra-gastrointestinal', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    mitoticRatePer5mm2: { type: 'number' },
    rupture: { type: 'boolean' },
    gistRisk: { type: 'string', enum: ['very-low', 'low', 'intermediate', 'high', 'ruptured', 'unknown'] },
    resectability: { type: 'string', enum: ['resectable', 'borderline', 'unresectable', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    mutation: { type: 'string' },
    KITPDGFRAStatusKnown: { type: 'boolean' },
    metastaticSites: { type: 'array', items: { type: 'string' } },
    progressionOnTKI: { type: 'boolean' },
    priorAbdominalRT: { type: 'boolean' },
    bleeding: { type: 'boolean' },
    obstruction: { type: 'boolean' },
    pain: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const GIST_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/gist-result.json',
  title: 'GIST CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gis.gist'] },
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

const fraction = (totalDoseGy: number, fractions: number, fractionationClass: Fractionation['class'], schedule: string): Fractionation => ({
  class: fractionationClass,
  totalDoseGy,
  fractions,
  dosePerFractionGy: totalDoseGy / fractions,
  schedule,
  technique: fractionationClass === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const gistTargets = (dose: Fractionation, stereotactic = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'Kontrastlı BT/MRG/PET ve endoskopik bulgularla tanımlanan primer, rezidüel veya metastatik GIST.',
    dose,
    margin: 'Görüntülenebilir hastalık; hemorajik/nekrotik alanlar klinik bağlamda değerlendirilir',
  },
  {
    name: 'CTV',
    description: stereotactic
      ? 'GTV çevresinde anatomik bariyerler ve mikroskopik uzanım dikkate alınarak dar marj; rutin elektif nodal ışınlama yoktur.'
      : 'Primer tümör yatağı veya lokal nüks alanı; GIST lenfojen yayılımı düşük olduğundan elektif nodal alan eklenmez.',
    dose,
    margin: stereotactic ? 'Genellikle 0-5 mm; görüntüleme ve hareket yönetimine göre' : 'Cerrahi klipler, anatomik bariyerler ve rezidüel risk',
  },
  {
    name: 'PTV',
    description: 'Solunum, barsak doluluğu ve günlük pozisyon değişkenliği için IGRT marjı.',
    dose,
    margin: stereotactic ? '4D-CT/CBCT ile yaklaşık 3-5 mm' : 'Günlük CBCT/IGRT ile yaklaşık 5-10 mm',
  },
];

const gistOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 35, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT luminal bowel objective' },
  { organ: 'Small bowel', metric: 'D1cc', limit: 30, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Abdominal SBRT luminal bowel objective' },
  { organ: 'Stomach', metric: 'Dmax', limit: 36, unit: 'Gy', priority: 'mandatory', source: 'HyTEC', sourceReference: 'Upper abdominal stereotactic bowel objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 15, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Partial liver irradiation objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Renal objective for abdominal RT' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Spinal cord tolerance' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class GistDecisionEngine extends BaseDecisionEngine<GistInput> {
  public readonly id = 'gis.gist';
  public readonly version = '1.0.0';
  public readonly inputSchema = GIST_INPUT_JSON_SCHEMA;
  public readonly outputSchema = GIST_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: GistInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorAbdominalRT) warnings.push('Önceki abdominal RT mevcut; ince barsak, mide, karaciğer, böbrek ve spinal kord kümülatif dozları değerlendirilmelidir.');
    if (!input.KITPDGFRAStatusKnown && (input.setting === 'newly-diagnosed' || input.setting === 'localized' || input.setting === 'metastatic')) {
      warnings.push('KIT/PDGFRA ve uygun genişletilmiş moleküler profil tamamlanmadan TKI seçimi yapılmamalıdır.');
    }
    if (input.rupture || input.gistRisk === 'ruptured') warnings.push('Tümör rüptürü peritoneal nüks riskini artırır; yüksek riskli adjuvan imatinib ve yakın sürveyans MDT’de değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'localized') {
      const resectable = input.resectability !== 'unresectable';
      const neoadjuvant = input.resectability === 'borderline' || input.resectability === 'unresectable';
      const therapy: SystemicTherapyRecommendation[] = [];
      if (neoadjuvant) therapy.push(systemic('neoadjuvant', 'Cerrahi öncesi imatinib ile tümör küçültme', ['imatinib'], 'Özellikle KIT-mutant veya duyarlı PDGFRA-mutant GIST; yanıtı seri BT/MRG ile izleyerek R0 organ koruyucu cerrahi zamanlanır'));
      recommendations.push({
        id: 'localized-gist-management',
        label: resectable ? 'R0 hedefli cerrahi ve risk-adapte adjuvan tedavi' : 'İmatinib sonrası yeniden evreleme ve seçilmiş cerrahi',
        indication: resectable ? 'indicated' : 'conditional',
        intent: 'curative',
        systemicTherapy: therapy.length ? therapy : undefined,
        rationale: [
          'Lokalize GIST’te temel küratif yaklaşım, tümör rüptüründen kaçınarak negatif mikroskopik marjinli (R0) cerrahidir; rutin lenfadenektomi genellikle gerekmez.',
          'Borderline rezektabl veya morbid cerrahi gerektiren tümörde, duyarlı mutasyon varsa neoadjuvan imatinib R0 rezeksiyon ve organ korumayı kolaylaştırabilir.',
          'R1 marjin, tümör rüptürü, boyut, mitotik hız, lokalizasyon ve mutasyon birlikte değerlendirilmeli; R2 rezidüde yeniden rezeksiyon veya sistemik tedavi MDT’de önceliklidir.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      if (resectable && (input.gistRisk === 'high' || input.gistRisk === 'ruptured' || input.surgicalMargin === 'R1')) {
        recommendations.push({
          id: 'high-risk-gist-adjuvant-imatinib',
          label: 'Yüksek riskli GIST’te adjuvan imatinib',
          indication: input.mutation === 'PDGFRA-D842V' ? 'not-indicated' : 'indicated',
          intent: 'adjuvant',
          systemicTherapy: [systemic('adjuvant', 'Uzun süreli adjuvan imatinib', ['imatinib'], 'Genellikle 3 yıl; tolere edilebilirlik, mutasyon duyarlılığı ve nüks riski ile kişiselleştirilir')],
          rationale: [
            'ACOSOG Z9001 ve SSG XVIII/AIO, uygun yüksek riskli rezeke edilmiş GIST’te adjuvan imatinib yararını destekler.',
            'PDGFRA D842V mutasyonu imatinib dirençlidir; adjuvan imatinib yerine klinik çalışma ve yakın sürveyans tartışılmalıdır.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[1]),
        });
      }
    } else if (input.setting === 'postoperative') {
      const highRisk = input.gistRisk === 'high' || input.gistRisk === 'ruptured' || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2';
      recommendations.push({
        id: 'postoperative-gist',
        label: highRisk ? 'Yüksek riskli postoperatif GIST’te adjuvan imatinib' : 'Risk-adapte GIST sürveyansı',
        indication: highRisk && input.mutation !== 'PDGFRA-D842V' ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        systemicTherapy: highRisk && input.mutation !== 'PDGFRA-D842V' ? [systemic('adjuvant', 'Adjuvan imatinib', ['imatinib'], 'Genellikle 3 yıl; mutasyon ve risk sınıfına göre')] : undefined,
        rationale: [
          'R0 rezeksiyon sonrası adjuvan RT rutin standart değildir; lokal kontrolün temeli cerrahi ve uygun hastada TKI tedavisidir.',
          'R2 rezidü, R1 marjin veya rüptür durumunda yeniden rezeksiyon olasılığı ve sistemik nüks riski MDT’de değerlendirilmelidir.',
          'GIST’te elektif nodal ışınlama ve rutin postoperatif abdominal RT önerilmez; RT yalnızca seçilmiş lokal kontrol veya semptom endikasyonunda düşünülür.',
        ],
        guidelineReferences: references(TRIALS[1]),
      });
      rtIndication = input.surgicalMargin === 'R2' ? 'consider' : 'not-indicated';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const dose = fraction(50, 25, 'conventional', '50 Gy / 25 fx; seçilmiş lokal nüks veya semptomatik rezidü');
      recommendations.push({
        id: 'recurrent-gist-local-control',
        label: 'Lokal nükste salvage cerrahi/TKI; seçilmiş RT',
        indication: input.bleeding || input.obstruction || input.pain ? 'consider' : 'conditional',
        intent: 'salvage',
        fractionation: dose,
        targetVolumes: gistTargets(dose),
        oarConstraints: gistOars,
        rationale: [
          'İzole lokal nükste cerrahi ve mutasyon-duyarlı TKI seçimi öncelikle MDT’de değerlendirilir.',
          'GIST radyorezistan kabul edilir; RT rutin değildir ancak kanama, ağrı, obstrüksiyon veya TKI’ye dirençli sınırlı lokal hastalıkta seçilmiş salvage/palyatif seçenek olabilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = input.bleeding || input.obstruction || input.pain ? 'consider' : 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const therapy: SystemicTherapyRecommendation[] = [];
      if (input.mutation === 'PDGFRA-D842V') therapy.push(systemic('palliative', 'PDGFRA D842V hedefli tedavi', ['avapritinib'], 'İleri/rezeke edilemeyen hastalıkta uygun moleküler sonuçla'));
      else therapy.push(systemic('palliative', 'İlk sıra ileri GIST tedavisi', ['imatinib'], 'KIT/PDGFRA duyarlılığına göre; metastatik hastalıkta genellikle sürekli tedavi'));
      if (input.progressionOnTKI) therapy.push(systemic('palliative', 'TKI dirençli GIST’te ardışık tedavi', ['sunitinib → regorafenib → ripretinib'], 'Progresyon, toksisite ve mutasyon profiline göre; uygun klinik çalışma tercih edilir'));
      recommendations.push({
        id: 'metastatic-gist-management',
        label: 'Metastatik GIST’te moleküler profilleme, ardışık TKI ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy: therapy,
        rationale: [
          'Metastatik GIST’te B2222 imatinib etkinliğini; INVICTUS ise çoklu TKI sonrası ripretinib seçeneğini destekler.',
          'PDGFRA D842V hastalığında avapritinib, imatinibden farklı bir hedefli seçenektir; NAVIGATOR verileri bu yaklaşımı destekler.',
          'RT; kanama, ağrı, obstrüksiyon veya seçilmiş oligoprogresif odaklarda semptomatik/ablative amaçla değerlendirilebilir; rutin elektif nodal RT yapılmaz.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3], TRIALS[4]),
      });
      if (input.bleeding || input.obstruction || input.pain) {
        const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptom ve OAR durumuna göre');
        recommendations[0].fractionation = palliativeDose;
        recommendations[0].targetVolumes = gistTargets(palliativeDose);
        recommendations[0].oarConstraints = gistOars;
        rtIndication = 'indicated';
      } else {
        rtIndication = 'consider';
      }
    }

    rationale.push('GIST yönetimi histolojik doğrulama, KIT/PDGFRA ve uygun moleküler profil, mitotik hız, tümör boyutu/lokalizasyonu, rüptür ve cerrahi risk ile MDT’de kişiselleştirilmelidir.');
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
      uncertainties: !input.gistRisk || !input.KITPDGFRAStatusKnown ? ['Risk sınıfı veya KIT/PDGFRA moleküler durumu eksik; tedavi sıralaması değişebilir.'] : undefined,
      confidence: !input.gistRisk || !input.KITPDGFRAStatusKnown ? 0.74 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: GistInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'localized') return 'Lokalize GIST: mutasyon-duyarlı neoadjuvan/adjuvan TKI, R0 cerrahi ve risk-adapte yaklaşım.';
    if (input.setting === 'postoperative') return 'Postoperatif GIST: rüptür, risk sınıfı, marjin ve mutasyona göre adjuvan imatinib veya sürveyans.';
    if (input.setting === 'recurrent') return 'Nüks GIST: salvage cerrahi/TKI ve seçilmiş semptomatik radyoterapi.';
    return 'Metastatik GIST: moleküler profile göre ardışık TKI tedavisi ve semptom odaklı RT.';
  }
}

export const gistEngine = new GistDecisionEngine();

export default gistEngine;
