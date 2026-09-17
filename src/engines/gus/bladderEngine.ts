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

export type BladderSetting =
  | 'non-muscle-invasive'
  | 'localized-muscle-invasive'
  | 'post-cystectomy'
  | 'recurrent'
  | 'metastatic';
export type BladderRisk = 'low' | 'intermediate' | 'high' | 'very-high' | 'unknown';
export type BladderHistology = 'urothelial' | 'squamous' | 'adenocarcinoma' | 'variant' | 'unknown';
export type BladderMolecularFinding = 'FGFR3' | 'ERBB2' | 'MSI-H' | 'dMMR' | 'PD-L1-high' | 'none' | 'unknown';

export interface BladderInput extends ClinicalCaseInput {
  organSystem: 'gus';
  disease: 'bladder-cancer';
  setting: BladderSetting;
  stage?: TNMStage;
  clinicalT?: string;
  nodalStatus?: 'N0' | 'N1' | 'N2' | 'N3' | 'unknown';
  metastases?: string[];
  histology?: BladderHistology;
  bladderRisk?: BladderRisk;
  completeTURBT?: boolean;
  solitaryTumor?: boolean;
  tumorSizeCm?: number;
  carcinomaInSitu?: boolean;
  hydronephrosis?: boolean;
  bladderCapacityAdequate?: boolean;
  renalFunctionAdequateForCisplatin?: boolean;
  performanceStatusECOG?: number;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  lymphadenectomy?: 'limited' | 'standard' | 'extended' | 'unknown';
  priorPelvicRT?: boolean;
  molecularFinding?: BladderMolecularFinding;
  cisplatinIneligible?: boolean;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Bladder Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1417',
  evidenceLevel: '2A',
};

const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO Clinical Practice Guideline: bladder preservation therapy',
  url: 'https://www.practicalradonc.org/article/S1879-355X(23)00114-6/fulltext',
  evidenceLevel: 'B',
};

const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ACROP recommendations for bladder cancer radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};

const TRIALS: GuidelineReference[] = [
  {
    organization: 'other',
    title: 'BC2001: radiotherapy with or without chemotherapy in muscle-invasive bladder cancer',
    url: 'https://doi.org/10.1016/S0140-6736(12)61209-0',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'BC2001: hypofractionated radiotherapy 55 Gy in 20 fractions',
    url: 'https://doi.org/10.1016/S0140-6736(12)61202-8',
    evidenceLevel: '1',
  },
  {
    organization: 'other',
    title: 'SWOG 1806: trimodality therapy with or without atezolizumab',
    url: 'https://clinicaltrials.gov/study/NCT03775265',
    evidenceLevel: '2A',
  },
  {
    organization: 'other',
    title: 'KEYNOTE-909/EV-302: enfortumab vedotin plus pembrolizumab in advanced urothelial cancer',
    url: 'https://clinicaltrials.gov/study/NCT04223856',
    evidenceLevel: '1',
  },
];

export const BLADDER_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/bladder-input.json',
  title: 'Bladder cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gus'] },
    disease: { type: 'string', enum: ['bladder-cancer'] },
    setting: { type: 'string', enum: ['non-muscle-invasive', 'localized-muscle-invasive', 'post-cystectomy', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    clinicalT: { type: 'string' },
    nodalStatus: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'unknown'] },
    metastases: { type: 'array', items: { type: 'string' } },
    histology: { type: 'string', enum: ['urothelial', 'squamous', 'adenocarcinoma', 'variant', 'unknown'] },
    bladderRisk: { type: 'string', enum: ['low', 'intermediate', 'high', 'very-high', 'unknown'] },
    completeTURBT: { type: 'boolean' },
    solitaryTumor: { type: 'boolean' },
    tumorSizeCm: { type: 'number' },
    carcinomaInSitu: { type: 'boolean' },
    hydronephrosis: { type: 'boolean' },
    bladderCapacityAdequate: { type: 'boolean' },
    renalFunctionAdequateForCisplatin: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    lymphadenectomy: { type: 'string', enum: ['limited', 'standard', 'extended', 'unknown'] },
    priorPelvicRT: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    cisplatinIneligible: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const BLADDER_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/bladder-result.json',
  title: 'Bladder cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gus.bladder'] },
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

const bladderTargets = (radiationDose: Fractionation, includeNodes = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: 'TURBT, sistoskopi ve MR/PET ile tanımlanan primer tümör yatağı veya rezidüel tümör.',
    dose: radiationDose,
    margin: 'Görüntülenebilir/kliplenmiş tümör',
  },
  {
    name: 'CTV',
    description: 'Tüm mesane veya tümör yatağı; trimodalite protokolüne göre risk-adapte kapsama.',
    dose: radiationDose,
    margin: 'Mesane duvarı ve tümör yatağı; mesane doluluğu günlük standardize edilir',
  },
  ...(includeNodes
    ? [{
        name: 'CTV',
        description: 'Obturator, internal/external iliac ve seçilmiş presakral/common iliac nodlar.',
        dose: fraction(46, 23, 'conventional', 'Pelvik nodlar 46 Gy / 23 fx'),
        margin: 'Pelvik nodal atlas ve damar konturları',
      }]
    : []),
  {
    name: 'PTV',
    description: 'Mesane doluluk değişkenliği ve günlük kurulum için CTV üzerine marj.',
    dose: radiationDose,
    margin: 'IGRT/adaptif planlama ile kurum protokolüne göre yaklaşık 10-15 mm; tümör boostunda daha dar marj düşünülebilir',
  },
];

const bladderOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Bladder preservation planning objective' },
  { organ: 'Small bowel', metric: 'V45', limit: 195, unit: 'cc', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic RT bowel constraint' },
  { organ: 'Rectum', metric: 'V50', limit: 50, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Bladder RT planning objective' },
  { organ: 'Rectum', metric: 'Dmean', limit: 40, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Bladder RT planning objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Pelvic RT planning objective' },
  { organ: 'Bone marrow', metric: 'V10', limit: 90, unit: '%', priority: 'acceptable', source: 'protocol', sourceReference: 'Concurrent chemoradiotherapy marrow-sparing objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class BladderDecisionEngine extends BaseDecisionEngine<BladderInput> {
  public readonly id = 'gus.bladder';
  public readonly version = '1.0.0';
  public readonly inputSchema = BLADDER_INPUT_JSON_SCHEMA;
  public readonly outputSchema = BLADDER_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: BladderInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; mesane, barsak, rektum ve kemik iliği kümülatif dozları hesaplanmadan yeniden ışınlama yapılmamalıdır.');
    if (input.histology && input.histology !== 'urothelial') warnings.push('Non-uroteliyal histoloji için standart trimodalite kanıtı daha sınırlıdır; patoloji alt tipi deneyimli üropatolog ve MDT tarafından doğrulanmalıdır.');

    if (input.setting === 'non-muscle-invasive') {
      recommendations.push({
        id: 'nmibc-endoscopic-and-intravesical',
        label: 'Risk-adapte TURBT ve intravezikal tedavi',
        indication: 'not-indicated',
        intent: 'curative',
        rationale: [
          'Kas invazyonu olmayan hastalıkta temel yaklaşım kaliteli/repeat TURBT, risk grubuna göre intravezikal tedavi ve sistoskopik sürveyanstır.',
          'Mesane RT’si NMIBC için rutin ilk basamak değildir; BCG-refrakter veya ilerleyen hastalıkta erken radikal sistektomi ve klinik çalışma değerlendirilir.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = 'not-indicated';
      rationale.push('T1 yüksek risk, CIS, BCG başarısızlığı veya varyant histolojide radikal sistektomi geciktirilmemelidir.');
    } else if (input.setting === 'localized-muscle-invasive') {
      const hypofractionatedDose = fraction(55, 20, 'moderate-hypofractionation', '55 Gy / 20 fx; mesane koruma alternatifi');
      const cisplatinEligible = input.renalFunctionAdequateForCisplatin && !input.cisplatinIneligible;
      const idealTrimodality = Boolean(
        input.completeTURBT &&
        input.solitaryTumor &&
        input.bladderCapacityAdequate &&
        !input.hydronephrosis &&
        input.nodalStatus !== 'N2' &&
        input.nodalStatus !== 'N3' &&
        !input.carcinomaInSitu,
      );
      recommendations.push({
        id: 'mibc-radical-cystectomy',
        label: 'Neoadjuvan sistemik tedavi sonrası radikal sistektomi',
        indication: 'indicated',
        intent: 'curative',
        systemicTherapy: cisplatinEligible
          ? [systemic('neoadjuvant', 'Sisplatin bazlı neoadjuvan kemoterapi', ['gemcitabine/cisplatin veya dose-dense MVAC'], 'Sistektomi öncesi; renal fonksiyon ve performansa göre')]
          : [systemic('neoadjuvant', 'Cisplatin uygun değilse klinik çalışma veya alternatif perioperatif sistemik yaklaşım', ['güncel kılavuz/klinik çalışma'], 'MDT ve medikal onkoloji kararı')],
        rationale: [
          'Kas invaziv hastalıkta radikal sistektomi ve uygun pelvik lenfadenektomi küratif standart seçeneklerden biridir.',
          'Cerrahi hedef R0 rezeksiyondur; R1/R2, pozitif nodlar ve yetersiz lenfadenektomi postoperatif tedavi/RT kararını değiştirir.',
          'Neoadjuvan cisplatin bazlı kemoterapi cisplatin uygun hastalarda patolojik yanıt ve sağkalım yararı nedeniyle değerlendirilir.',
        ],
        guidelineReferences: references(),
      });
      if (idealTrimodality) {
        recommendations.push({
          id: 'mibc-trimodality-preservation',
          label: 'Seçilmiş hastada trimodalite mesane koruma',
          indication: 'consider',
          intent: 'curative',
          fractionation: hypofractionatedDose,
          targetVolumes: bladderTargets(hypofractionatedDose, input.nodalStatus === 'N1'),
          oarConstraints: bladderOars,
          systemicTherapy: [
            systemic('concurrent', 'Radyoduyarlı eşzamanlı kemoterapi', ['cisplatin veya 5-FU/mitomycin-C veya gemcitabine'], 'RT boyunca; renal fonksiyon ve protokole göre'),
          ],
          rationale: [
            'Tam TURBT, soliter ve uygun yerleşimli tümör, yeterli mesane fonksiyonu ve sınırlı nodal yük trimodalite için olumlu kriterlerdir.',
            'BC2001, eşzamanlı kemoterapinin mesane koruma sonuçlarını iyileştirdiğini; 55 Gy / 20 fx şemasının 64 Gy / 32 fx’e uygun alternatif olduğunu destekler.',
            'Sistoskopik yanıt değerlendirmesi ve yakın sürveyans zorunludur; invaziv nüks veya yetersiz yanıt yeniden sistektomi gerektirebilir.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
        });
      } else {
        rationale.push('Hidron efroz, çok odaklı/CIS eşlik eden tümör, yetersiz TURBT, düşük mesane kapasitesi veya ileri nodal yük trimodalite başarısını azaltır; sistektomi önceliklidir.');
      }
      rtIndication = idealTrimodality ? 'consider' : 'conditional';
      rationale.push('Elektif nodal RT tüm hastalarda zorunlu değildir; klinik nodal risk, görüntüleme, cerrahi plan ve kurum protokolüne göre involved/pelvik nodal kapsama seçilir.');
    } else if (input.setting === 'post-cystectomy') {
      const postoperativeDose = fraction(50.4, 28, 'conventional', '50.4 Gy / 28 fx; seçilmiş yüksek riskli postoperatif pelvik RT');
      const highRiskPathology = input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.nodalStatus === 'N2' || input.nodalStatus === 'N3' || input.clinicalT === 'pT4';
      recommendations.push({
        id: 'post-cystectomy-adjuvant-management',
        label: highRiskPathology ? 'Yüksek riskli postoperatif sistemik tedavi ± RT' : 'Patolojiye göre postoperatif izlem/sistemik tedavi',
        indication: highRiskPathology ? 'consider' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRiskPathology ? postoperativeDose : undefined,
        targetVolumes: highRiskPathology ? bladderTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRiskPathology ? bladderOars : undefined,
        systemicTherapy: [systemic('adjuvant', 'Patoloji ve cisplatin uygunluğuna göre adjuvan sistemik tedavi', ['cisplatin bazlı kemoterapi veya güncel perioperatif immünoterapi seçeneği'], 'R0/R1, nodal durum ve neoadjuvan tedaviye göre MDT')],
        rationale: [
          'R1/R2 marjin, pT3/pT4 hastalık, çoklu pozitif nod veya yetersiz cerrahi yüksek nüks riski taşır.',
          'Postoperatif RT rutin değildir; seçilmiş yüksek riskli hastada modern IMRT/VMAT ile mesane yatağı ve pelvik nodlar değerlendirilebilir.',
          'İdrar diversiyonu, ince barsak anatomisi ve renal fonksiyon planlama güvenliğini belirler.',
        ],
        guidelineReferences: references(),
      });
      rtIndication = highRiskPathology ? 'consider' : 'conditional';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(55, 20, 'moderate-hypofractionation', '55 Gy / 20 fx; seçilmiş lokal nüks/mesane koruma protokolü');
      recommendations.push({
        id: 'recurrent-bladder-salvage',
        label: 'Lokal nükste salvage sistektomi veya seçilmiş salvage kemoradyoterapi',
        indication: 'conditional',
        intent: 'salvage',
        fractionation: salvageDose,
        targetVolumes: bladderTargets(salvageDose, input.nodalStatus === 'N1'),
        oarConstraints: bladderOars,
        rationale: [
          'Nüks lokalizasyonu, önceki RT/cerrahi, mesane fonksiyonu ve uzak hastalık yokluğu salvage kararının temelidir.',
          'Daha önce RT almamış, lokalize ve sistoskopik olarak değerlendirilebilir hastada deneyimli merkezde salvage kemoradyoterapi düşünülebilir.',
          'Önceki pelvik RT varsa yeniden ışınlama yalnızca kümülatif doz ve toksisite analiziyle, tercihen klinik çalışma/uzman merkezde ele alınır.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const systemicTherapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'Metastatik ürotelyal kanserde sistemik tedavi', ['enfortumab vedotin + pembrolizumab veya güncel NCCN dizilimi'], 'Performans, renal fonksiyon, önceki platin ve immünoterapiye göre'),
      ];
      if (input.molecularFinding === 'FGFR3') {
        systemicTherapy.push(systemic('palliative', 'FGFR hedefli tedavi değerlendirmesi', ['erdafitinib'], 'FGFR değişikliği ve önceki tedavi kriterlerine göre'));
      }
      if (input.molecularFinding === 'MSI-H' || input.molecularFinding === 'dMMR') {
        systemicTherapy.push(systemic('palliative', 'İmmün kontrol noktası inhibitörü değerlendirmesi', ['pembrolizumab'], 'MSI-H/dMMR ve ruhsat/kılavuz kriterlerine göre'));
      }
      recommendations.push({
        id: 'metastatic-bladder-systemic',
        label: 'Metastatik hastalıkta sistemik tedavi ve semptom odaklı RT',
        indication: 'indicated',
        intent,
        systemicTherapy,
        rationale: [
          'Metastatik hastalıkta sistemik tedavi esastır; RT kanama, ağrı, obstrüksiyon, kemik/spinal kord tehdidi veya sınırlı oligoprogresif odaklarda palyatif/ablative amaçla kullanılır.',
          'KEYNOTE-909/EV-302 enfortumab vedotin + pembrolizumab kombinasyonunu destekler; seçim güncel kılavuz ve erişim/kontrendikasyonlara göre yapılır.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      if (input.metastases?.length) {
        recommendations.push({
          id: 'metastatic-bladder-palliative-rt',
          label: 'Semptomatik metastaza palyatif RT',
          indication: 'consider',
          intent: 'palliative',
          rationale: ['Kemik ağrısı, spinal kord basısı, kanama veya lokal obstrüksiyonda fraksiyonasyon; yaşam beklentisi, hedef ve OAR riskine göre seçilir.'],
          guidelineReferences: references(),
        });
      }
      rtIndication = input.metastases?.length ? 'conditional' : 'consider';
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
      uncertainties: input.setting === 'localized-muscle-invasive' && input.nodalStatus === 'unknown' ? ['Nodal evreleme tamamlanmamış.'] : undefined,
      confidence: input.setting === 'localized-muscle-invasive' && input.nodalStatus === 'unknown' ? 0.72 : 0.86,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: BladderInput): string {
    if (input.setting === 'non-muscle-invasive') return 'Kas invaziv olmayan mesane kanseri: TURBT, intravezikal tedavi ve risk-adapte sürveyans.';
    if (input.setting === 'localized-muscle-invasive') return 'Lokalize kas invaziv mesane kanseri: radikal sistektomi veya uygun seçilmiş hastada trimodalite mesane koruma.';
    if (input.setting === 'post-cystectomy') return 'Sistektomi sonrası: patolojik risk, R0/R1/R2 marjin ve nodal duruma göre adjuvan karar.';
    if (input.setting === 'recurrent') return 'Mesane kanseri nüksü: lokal salvage yaklaşım ve sistemik tedavi/RT seçimi.';
    return 'Metastatik ürotelyal kanser: güncel sistemik tedavi, moleküler profil ve semptom odaklı RT.';
  }
}

export const bladderEngine = new BladderDecisionEngine();

export default bladderEngine;
