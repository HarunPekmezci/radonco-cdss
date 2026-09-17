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

export type EndometrialSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type EndometrialHistology = 'endometrioid' | 'serous' | 'clear-cell' | 'carcinosarcoma' | 'undifferentiated' | 'other' | 'unknown';
export type EndometrialFIGOStage = 'IA' | 'IB' | 'II' | 'IIIA' | 'IIIB' | 'IIIC1' | 'IIIC2' | 'IVA' | 'IVB' | 'unknown';
export type EndometrialMolecularClass = 'POLE-mutated' | 'MMRd' | 'NSMP' | 'p53-abnormal' | 'HER2-positive' | 'ER-positive' | 'none' | 'unknown';
export type EndometrialRisk = 'low' | 'intermediate' | 'high-intermediate' | 'high' | 'unknown';

export interface EndometrialInput extends ClinicalCaseInput {
  organSystem: 'gynecology';
  disease: 'endometrial-cancer';
  setting: EndometrialSetting;
  stage?: TNMStage;
  figoStage?: EndometrialFIGOStage;
  histology?: EndometrialHistology;
  molecularClass?: EndometrialMolecularClass;
  riskCategory?: EndometrialRisk;
  grade?: 'G1' | 'G2' | 'G3' | 'unknown';
  myometrialInvasionPercent?: number;
  cervicalStromalInvasion?: boolean;
  lymphovascularSpaceInvasion?: boolean;
  pelvicNodePositive?: boolean;
  paraaorticNodePositive?: boolean;
  distantMetastases?: string[];
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  surgeryType?: 'hysterectomy' | 'radical-hysterectomy' | 'none' | 'unknown';
  lymphadenectomy?: 'sentinel' | 'pelvic' | 'pelvic-and-paraaortic' | 'none' | 'unknown';
  vaginalCuffRecurrence?: boolean;
  priorPelvicRT?: boolean;
  brachytherapyFeasible?: boolean;
  fertilitySparingCandidate?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Uterine Neoplasms',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1473',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for endometrial cancer radiation therapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESGO-ESTRO-ESP endometrial cancer molecular risk and adjuvant therapy guidance',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'PORTEC-1: postoperative pelvic radiotherapy in endometrial cancer', url: 'https://doi.org/10.1016/S0140-6736(01)06309-1', evidenceLevel: '1' },
  { organization: 'other', title: 'PORTEC-2: vaginal brachytherapy versus pelvic radiotherapy in high-intermediate risk endometrial cancer', url: 'https://doi.org/10.1016/S0140-6736(10)60105-3', evidenceLevel: '1' },
  { organization: 'other', title: 'PORTEC-3: chemoradiotherapy versus radiotherapy in high-risk endometrial cancer', url: 'https://doi.org/10.1016/S0140-6736(17)31377-5', evidenceLevel: '1' },
  { organization: 'other', title: 'RUBY: dostarlimab plus carboplatin/paclitaxel in advanced or recurrent endometrial cancer', url: 'https://doi.org/10.1056/NEJMoa2216334', evidenceLevel: '1' },
  { organization: 'other', title: 'NRG-GY018: pembrolizumab plus chemotherapy in advanced or recurrent endometrial cancer', url: 'https://doi.org/10.1056/NEJMoa2302312', evidenceLevel: '1' },
];

export const ENDOMETRIAL_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/endometrial-input.json',
  title: 'Endometrial cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gynecology'] },
    disease: { type: 'string', enum: ['endometrial-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    figoStage: { type: 'string', enum: ['IA', 'IB', 'II', 'IIIA', 'IIIB', 'IIIC1', 'IIIC2', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['endometrioid', 'serous', 'clear-cell', 'carcinosarcoma', 'undifferentiated', 'other', 'unknown'] },
    molecularClass: { type: 'string' },
    riskCategory: { type: 'string', enum: ['low', 'intermediate', 'high-intermediate', 'high', 'unknown'] },
    grade: { type: 'string', enum: ['G1', 'G2', 'G3', 'unknown'] },
    myometrialInvasionPercent: { type: 'number' },
    cervicalStromalInvasion: { type: 'boolean' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    pelvicNodePositive: { type: 'boolean' },
    paraaorticNodePositive: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    surgeryType: { type: 'string', enum: ['hysterectomy', 'radical-hysterectomy', 'none', 'unknown'] },
    lymphadenectomy: { type: 'string', enum: ['sentinel', 'pelvic', 'pelvic-and-paraaortic', 'none', 'unknown'] },
    vaginalCuffRecurrence: { type: 'boolean' },
    priorPelvicRT: { type: 'boolean' },
    brachytherapyFeasible: { type: 'boolean' },
    fertilitySparingCandidate: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const ENDOMETRIAL_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/endometrial-result.json',
  title: 'Endometrial cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gynecology.endometrial'] },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string', enum: ['gynecology'] },
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
  technique: className === 'brachytherapy' ? 'adaptive' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const endometrialTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  { name: 'GTV', description: postoperative ? 'Vajinal cuff/cerrahi yatak ve rezidüel nüks; MRI/PET-CT ile.' : 'Makroskopik uterin, vajinal veya nodal hastalık.', dose, margin: 'Görüntülenebilir hastalık' },
  { name: 'CTV', description: postoperative ? 'Vajinal cuff, paravaginal doku ve patolojik risk alanları.' : 'Uterus/serviks, parametrial risk alanı ve pelvik ± paraaortik nodal istasyonlar.', dose, margin: 'MRI, cerrahi klipler ve anatomik bariyerlere göre' },
  { name: 'PTV', description: 'Mesane/rektum dolumu, uterus hareketi ve günlük IGRT belirsizliği.', dose, margin: 'CBCT/IGRT ile yaklaşık 5-10 mm; adaptif planlama seçilebilir' },
];

const endometrialOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pelvic RT small bowel objective' },
  { organ: 'Rectum', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT rectal objective' },
  { organ: 'Bladder', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT bladder objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pelvic femoral head objective' },
  { organ: 'Vaginal cuff', metric: 'D90', limit: 70, unit: 'Gy', priority: 'acceptable', source: 'protocol', sourceReference: 'Vaginal cuff brachytherapy target objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class EndometrialDecisionEngine extends BaseDecisionEngine<EndometrialInput> {
  public readonly id = 'gynecology.endometrial';
  public readonly version = '1.0.0';
  public readonly inputSchema = ENDOMETRIAL_INPUT_JSON_SCHEMA;
  public readonly outputSchema = ENDOMETRIAL_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: EndometrialInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'conditional';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; barsak, rektum, mesane, sigmoid ve kemik kümülatif dozları ile yeniden ışınlama riski hesaplanmalıdır.');
    if (input.molecularClass === 'MMRd' || input.molecularClass === 'p53-abnormal') warnings.push('Moleküler sınıf adjuvan sistemik tedavi ve RT yoğunluğunu etkiler; entegre moleküler rapor doğrulanmalıdır.');
    if (input.brachytherapyFeasible === false && input.vaginalCuffRecurrence) warnings.push('Vajinal cuff nüksünde brakiterapi uygulanabilir değilse interstisyel teknik veya alternatif boost için jinekolojik RT MDT değerlendirmesi gerekir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') {
      const pelvicDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; seçilmiş nodal/parametrial boost');
      const cuffDose = fraction(21, 3, 'brachytherapy', 'Vajinal cuff HDR 7 Gy x 3; risk ve anatomiye göre');
      const highRisk = input.riskCategory === 'high' || input.pelvicNodePositive || input.paraaorticNodePositive || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || input.molecularClass === 'p53-abnormal';
      const intermediateRisk = input.riskCategory === 'high-intermediate' || input.lymphovascularSpaceInvasion || input.cervicalStromalInvasion;
      const postoperative = input.setting === 'postoperative';
      const fractionation = highRisk ? pelvicDose : intermediateRisk ? cuffDose : undefined;
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (highRisk) systemicTherapy.push(systemic('adjuvant', 'Adjuvan karboplatin/paklitaksel ± RT', ['carboplatin', 'paclitaxel'], 'Yüksek riskli histoloji/nodal hastalıkta ardışık veya birlikte MDT kararına göre'));
      if (input.molecularClass === 'MMRd') systemicTherapy.push(systemic('adjuvant', 'Moleküler profile göre immünoterapi/klinik çalışma', ['dostarlimab veya pembrolizumab'], 'Özellikle ileri/yüksek riskli hastalıkta güncel ruhsat ve kılavuza göre', '2A'));
      recommendations.push({
        id: 'localized-endometrial-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif pelvik KRT ± sistemik tedavi' : intermediateRisk ? 'Orta-yüksek riskli hastalıkta vajinal cuff brakiterapisi veya pelvik RT' : 'Düşük riskli hastalıkta cerrahi sonrası sürveyans',
        indication: highRisk || intermediateRisk ? 'indicated' : 'not-indicated',
        intent: postoperative ? 'adjuvant' : 'curative',
        fractionation,
        targetVolumes: fractionation ? endometrialTargets(fractionation, postoperative) : undefined,
        oarConstraints: fractionation ? endometrialOars : undefined,
        systemicTherapy: systemicTherapy.length ? systemicTherapy : undefined,
        rationale: [
          'Total histerektomi ve uygun sentinel/pelvik-paraaortik nodal evreleme temel cerrahi yaklaşımdır; R0 hedeflenir, R1/R2 ve pozitif nodlar adjuvan tedaviyi değiştirir.',
          'PORTEC-1 ve PORTEC-2, düşük/orta riskli hastalarda rutin pelvik RT yerine seçilmiş vajinal cuff brakiterapisi veya sürveyansı destekler.',
          'PORTEC-3, yüksek riskli histoloji/evrede kombine kemoradyoterapi yaklaşımını destekler; FIGO 2023 moleküler sınıflaması risk kararına eklenmelidir.',
          'Elektif nodal alanlar pelvik ve paraaortik risk durumuna göre belirlenir; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = highRisk || intermediateRisk ? 'indicated' : 'not-indicated';
      intent = postoperative ? 'adjuvant' : 'curative';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + boost; daha önce pelvik RT almamış seçilmiş lokal nüks');
      recommendations.push({
        id: 'recurrent-endometrial-cancer',
        label: 'Lokal endometriyum kanseri nüksünde salvage cerrahi veya seçilmiş RT/brakiterapi',
        indication: input.priorPelvicRT ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: input.priorPelvicRT ? undefined : salvageDose,
        targetVolumes: input.priorPelvicRT ? undefined : endometrialTargets(salvageDose, true),
        oarConstraints: input.priorPelvicRT ? undefined : endometrialOars,
        systemicTherapy: [systemic('palliative', 'Nüks/ileri endometrium kanserinde sistemik tedavi', ['carboplatin + paclitaxel ± dostarlimab/pembrolizumab'], 'MMR/MSI, p53, HER2 ve önceki tedaviye göre')],
        rationale: [
          'İzole vajinal cuff veya pelvik nükste cerrahi, EBRT + brakiterapi ve önceki RT durumuna göre salvage yaklaşım değerlendirilir.',
          'Önceden pelvik RT alanlarda yeniden ışınlama fistül, nekroz ve barsak/mesane toksisitesi nedeniyle yalnız seçilmiş hastada planlanır.',
          'Nüks hastalıkta histoloji ve moleküler sınıf sistemik tedavi seçimini belirler.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.priorPelvicRT ? 'consider' : 'indicated';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; kanama, ağrı veya pelvik bası');
      const therapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'İleri endometrium kanserinde karboplatin/paklitaksel ± immünoterapi', ['carboplatin', 'paclitaxel', 'dostarlimab veya pembrolizumab'], 'MMR/MSI, p53, performans ve organ fonksiyonuna göre'),
      ];
      if (input.molecularClass === 'HER2-positive') therapy.push(systemic('palliative', 'HER2 hedefli tedavi değerlendirmesi', ['trastuzumab içeren rejim'], 'Seröz histoloji ve HER2 doğrulamasına göre', '2A'));
      recommendations.push({
        id: 'metastatic-endometrial-cancer',
        label: 'Metastatik endometriyum kanserinde moleküler profile göre sistemik tedavi ve semptomatik RT',
        indication: 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: endometrialTargets(palliativeDose),
        oarConstraints: endometrialOars,
        systemicTherapy: therapy,
        rationale: [
          'RUBY ve NRG-GY018, ileri veya nüks endometrium kanserinde karboplatin/paklitaksele immünoterapi eklenmesini destekler.',
          'RT; kanama, ağrı, pelvik bası, vajinal nüks veya seçilmiş oligometastatik odaklarda palyatif/lokal kontrol amacıyla kullanılır.',
        ],
        guidelineReferences: references(TRIALS[3], TRIALS[4]),
      });
      rtIndication = input.distantMetastases?.length || input.vaginalCuffRecurrence ? 'conditional' : 'consider';
    }

    rationale.push('Endometriyum kanseri kararı; jinekolojik onkoloji, radyasyon/medikal onkoloji, patoloji ve radyoloji konseyinde FIGO 2023, histoloji, moleküler sınıf, cerrahi patoloji ve hasta hedefleriyle verilmelidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gynecology',
      rtIndication,
      intent,
      summary: this.summary(input),
      recommendations,
      rationale,
      warnings: warnings.length ? warnings : undefined,
      uncertainties: !input.figoStage || !input.histology || !input.molecularClass ? ['FIGO evresi, histoloji veya moleküler sınıf eksik; risk-adapte adjuvan ve sistemik tedavi seçimi değişebilir.'] : undefined,
      confidence: !input.figoStage || !input.histology || !input.molecularClass ? 0.72 : 0.88,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: EndometrialInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative') return 'Yeni tanı/postoperatif endometriyum kanseri: FIGO 2023, moleküler sınıf ve risk grubuna göre sürveyans, cuff brakiterapisi veya pelvik KRT.';
    if (input.setting === 'recurrent') return 'Nüks endometriyum kanseri: salvage cerrahi/RT ve moleküler profile göre sistemik tedavi.';
    return 'Metastatik endometriyum kanseri: karboplatin/paklitaksel temelli immüno-kemoterapi ve semptom odaklı RT.';
  }
}

export const endometrialEngine = new EndometrialDecisionEngine();

export default endometrialEngine;
