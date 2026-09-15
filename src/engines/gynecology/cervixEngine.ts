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

export type CervixSetting = 'newly-diagnosed' | 'postoperative' | 'persistent' | 'recurrent' | 'metastatic';
export type CervixHistology = 'squamous-cell' | 'adenocarcinoma' | 'adenosquamous' | 'other' | 'unknown';
export type CervixFIGOStage = 'IA1' | 'IA2' | 'IB1' | 'IB2' | 'IB3' | 'IIA1' | 'IIA2' | 'IIB' | 'IIIC1' | 'IIIC2' | 'IIIA' | 'IIIB' | 'IVA' | 'IVB' | 'unknown';
export type CervixRisk = 'low' | 'intermediate' | 'high' | 'unknown';
export type CervixMolecularFinding = 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'HER2-positive' | 'none' | 'unknown';

export interface CervixInput extends ClinicalCaseInput {
  organSystem: 'gynecology';
  disease: 'cervical-cancer';
  setting: CervixSetting;
  stage?: TNMStage;
  figoStage?: CervixFIGOStage;
  histology?: CervixHistology;
  riskCategory?: CervixRisk;
  clinicalTumorSizeCm?: number;
  parametrialInvasion?: boolean;
  pelvicNodePositive?: boolean;
  paraaorticNodePositive?: boolean;
  hydronephrosis?: boolean;
  distantMetastases?: string[];
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  surgeryType?: 'conization' | 'trachelectomy' | 'hysterectomy' | 'radical-hysterectomy' | 'none' | 'unknown';
  lymphadenectomy?: 'sentinel' | 'pelvic' | 'pelvic-and-paraaortic' | 'none' | 'unknown';
  lymphovascularSpaceInvasion?: boolean;
  positiveNodes?: number;
  positiveMargin?: boolean;
  parametrialInvolvementOnPathology?: boolean;
  molecularFinding?: CervixMolecularFinding;
  priorPelvicRT?: boolean;
  brachytherapyFeasible?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Cervical Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1426',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO Clinical Practice Guideline: Radiation Therapy for Cervical Cancer',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'A',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO-ESGO-ESP cervical cancer radiotherapy and brachytherapy guidance',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'GOG-120: concurrent cisplatin-based chemoradiation in locally advanced cervical cancer', url: 'https://doi.org/10.1056/NEJM199904153401502', evidenceLevel: '1' },
  { organization: 'other', title: 'OUTBACK: adjuvant chemotherapy after chemoradiation for locally advanced cervical cancer', url: 'https://doi.org/10.1016/S0140-6736(23)00372-5', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-826: pembrolizumab plus chemotherapy for persistent, recurrent or metastatic cervical cancer', url: 'https://doi.org/10.1056/NEJMoa2112435', evidenceLevel: '1' },
  { organization: 'other', title: 'INTERLACE: induction chemotherapy followed by chemoradiation in locally advanced cervical cancer', url: 'https://doi.org/10.1016/S0140-6736(23)00372-5', evidenceLevel: '1' },
  { organization: 'other', title: 'EMBRACE: image-guided adaptive brachytherapy in locally advanced cervical cancer', url: 'https://doi.org/10.1016/S0167-8140(19)31105-5', evidenceLevel: '2A' },
];

export const CERVIX_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cervix-input.json',
  title: 'Cervical cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gynecology'] },
    disease: { type: 'string', enum: ['cervical-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'persistent', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    figoStage: { type: 'string', enum: ['IA1', 'IA2', 'IB1', 'IB2', 'IB3', 'IIA1', 'IIA2', 'IIB', 'IIIC1', 'IIIC2', 'IIIA', 'IIIB', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'adenosquamous', 'other', 'unknown'] },
    riskCategory: { type: 'string', enum: ['low', 'intermediate', 'high', 'unknown'] },
    clinicalTumorSizeCm: { type: 'number' },
    parametrialInvasion: { type: 'boolean' },
    pelvicNodePositive: { type: 'boolean' },
    paraaorticNodePositive: { type: 'boolean' },
    hydronephrosis: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    surgeryType: { type: 'string', enum: ['conization', 'trachelectomy', 'hysterectomy', 'radical-hysterectomy', 'none', 'unknown'] },
    lymphadenectomy: { type: 'string', enum: ['sentinel', 'pelvic', 'pelvic-and-paraaortic', 'none', 'unknown'] },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    positiveMargin: { type: 'boolean' },
    parametrialInvolvementOnPathology: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    priorPelvicRT: { type: 'boolean' },
    brachytherapyFeasible: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const CERVIX_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cervix-result.json',
  title: 'Cervical cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gynecology.cervix'] },
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

const cervixTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  { name: 'GTV', description: postoperative ? 'Postoperatif serviks/vajinal cuff yatağı ve rezidüel hastalık; MRI/PET-CT ile.' : 'Primer serviks tümörü ve görüntülenebilir nodal hastalık; pelvik MRI/PET-CT füzyonu.', dose, margin: 'Primer ve makroskopik nodal hastalık' },
  { name: 'CTV', description: postoperative ? 'Vajinal cuff, parametrial/paravaginal dokular ve cerrahi risk alanları; patolojiye göre.' : 'Serviks, uterus/parametrium, üst vajina ve tümör/nodal riskine göre pelvik ± paraaortik nodal istasyonlar.', dose, margin: 'Anatomi, MRI, cerrahi klipler ve hareket yönetimine göre' },
  { name: 'PTV', description: 'Mesane/rek­tum dolumu, uterus hareketi ve günlük IGRT belirsizliği.', dose, margin: 'CBCT/IGRT ile yaklaşık 5-10 mm; adaptif planlama tercih edilebilir' },
];

const cervixOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pelvic chemoradiotherapy small bowel objective' },
  { organ: 'Rectum', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT rectal objective' },
  { organ: 'Bladder', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT bladder objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pelvic femoral head objective' },
  { organ: 'Sigmoid', metric: 'D2cc', limit: 70, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided cervical brachytherapy sigmoid objective' },
  { organ: 'Rectum', metric: 'D2cc', limit: 75, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided cervical brachytherapy rectal objective' },
  { organ: 'Bladder', metric: 'D2cc', limit: 90, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided cervical brachytherapy bladder objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class CervixDecisionEngine extends BaseDecisionEngine<CervixInput> {
  public readonly id = 'gynecology.cervix';
  public readonly version = '1.0.0';
  public readonly inputSchema = CERVIX_INPUT_JSON_SCHEMA;
  public readonly outputSchema = CERVIX_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: CervixInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; kümülatif barsak, rektum, mesane, sigmoid ve kemik dozları ile yeniden ışınlama riski hesaplanmalıdır.');
    if (input.hydronephrosis) warnings.push('Hidronefroz ileri lokal hastalık ve renal fonksiyon riski göstergesi olabilir; üreterik drenaj ve böbrek fonksiyonu değerlendirilmelidir.');
    if (input.brachytherapyFeasible === false && (input.figoStage === 'IIB' || input.figoStage === 'IIIB' || input.figoStage === 'IVA')) warnings.push('Brakiterapi uygulanabilir değilse tümör dozu ve OAR güvenliği açısından alternatif boost/MDT planlaması gerekir.');

    if (input.setting === 'newly-diagnosed') {
      const chemoradiationDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx + parametrial/nodal boost');
      const early = input.figoStage === 'IA1' || input.figoStage === 'IA2' || input.figoStage === 'IB1' || input.figoStage === 'IIA1';
      recommendations.push({
        id: 'new-cervical-cancer',
        label: early && !input.pelvicNodePositive && !input.parametrialInvasion ? 'Erken evrede fertilite koruyucu/cerrahi seçenek veya risk-adapte adjuvan yaklaşım' : 'Definitif eşzamanlı kemoradyoterapi + brakiterapi',
        indication: early && !input.pelvicNodePositive && !input.parametrialInvasion ? 'conditional' : 'indicated',
        intent: 'curative',
        fractionation: early && !input.pelvicNodePositive && !input.parametrialInvasion ? undefined : chemoradiationDose,
        targetVolumes: early && !input.pelvicNodePositive && !input.parametrialInvasion ? undefined : cervixTargets(chemoradiationDose),
        oarConstraints: cervixOars,
        systemicTherapy: early && !input.pelvicNodePositive && !input.parametrialInvasion ? undefined : [systemic('concurrent', 'Cisplatin bazlı eşzamanlı kemoterapi', ['cisplatin'], 'Haftalık 40 mg/m²; uygun renal fonksiyon ve performansta'), systemic('adjuvant', 'Brakiterapi boost', ['HDR intracavitary/interstitial brachytherapy'], 'EBRT ile toplam tedavi süresini ideal olarak 56 gün civarında tutarak')],
        rationale: [
          'Erken evrede konizasyon, trakelektomi veya uygun cerrahi; tümör boyutu, fertilite hedefi, LVSI, nodal durum ve cerrahi risklere göre değerlendirilir.',
          'Lokal ileri veya cerrahiye uygun olmayan serviks kanserinde cisplatin eşzamanlı pelvik RT ve MRI-kılavuzlu brakiterapi küratif standarttır.',
          'GOG-120 eşzamanlı platin bazlı KRT yararını; EMBRACE görüntü kılavuzlu adaptif brakiterapinin lokal kontrol ve OAR korumasındaki rolünü destekler.',
          'Elektif nodal alanlar pelvik ve seçilmiş paraaortik istasyonlardır; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[4]),
      });
      if (!(early && !input.pelvicNodePositive && !input.parametrialInvasion)) {
        recommendations[0].fractionation = chemoradiationDose;
        recommendations[0].targetVolumes = cervixTargets(chemoradiationDose);
        recommendations[0].rationale.push(`Brakiterapi önerisi: ${input.brachytherapyFeasible === false ? 'uygulanabilirlik sorunu varsa interstisyel/alternatif boost için MDT' : 'yüksek dozlu, görüntü kılavuzlu boost; tek başına EBRT yeterli değildir'}.`);
        recommendations[0].oarConstraints = [...cervixOars, { organ: 'Cervix/HR-CTV', metric: 'D90', limit: 85, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'MRI-guided cervical brachytherapy tumor dose objective' }];
      } else {
        recommendations[0].oarConstraints = undefined;
      }
      rtIndication = early && !input.pelvicNodePositive && !input.parametrialInvasion ? 'conditional' : 'indicated';
    } else if (input.setting === 'postoperative') {
      const adjuvantDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; risk-adapte pelvik RT ± boost');
      const highRisk = input.positiveMargin || input.parametrialInvolvementOnPathology || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2';
      recommendations.push({
        id: 'postoperative-cervical-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif eşzamanlı kemoradyoterapi' : 'Orta riskli patolojiye göre adjuvan tedavi veya sürveyans',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? adjuvantDose : undefined,
        targetVolumes: highRisk ? cervixTargets(adjuvantDose, true) : undefined,
        oarConstraints: highRisk ? cervixOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Postoperatif cisplatin bazlı KRT', ['cisplatin'], 'Haftalık eşzamanlı; marjin/nodal/parametrial yüksek riskte')] : undefined,
        rationale: [
          'Pozitif cerrahi marjin, parametrial tutulum veya pozitif nodlar yüksek riskli postoperatif KRT endikasyonudur.',
          'Orta riskte tümör boyutu, stromal invazyon ve LVSI gibi Sedlis benzeri faktörler RT kararını belirler.',
          'R0 rezeksiyonlu düşük riskli hastada rutin RT yerine yakın klinik ve görüntüleme sürveyansı düşünülebilir.',
        ],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'persistent' || input.setting === 'recurrent') {
      const salvageDose = fraction(50.4, 28, 'conventional', '45 Gy / 25 fx + boost; daha önce RT almamış seçilmiş lokal nüks');
      recommendations.push({
        id: 'recurrent-cervical-cancer',
        label: 'Lokal nükste salvage cerrahi veya seçilmiş yeniden/definitif RT',
        indication: input.priorPelvicRT ? 'consider' : 'indicated',
        intent: 'salvage',
        fractionation: input.priorPelvicRT ? undefined : salvageDose,
        targetVolumes: input.priorPelvicRT ? undefined : cervixTargets(salvageDose, true),
        oarConstraints: input.priorPelvicRT ? undefined : cervixOars,
        systemicTherapy: [systemic('palliative', 'Nüks/metastatik hastalıkta sistemik tedavi', ['pembrolizumab + platin/taksan ± bevacizumab veya tisotumab vedotin'], 'PD-L1 CPS, önceki tedavi, kanama/fistül riski ve performansa göre')],
        rationale: [
          'Santral pelviste seçilmiş izole nükste salvage cerrahi (egzenterasyon dahil) veya daha önce RT almamış hastada definitif KRT değerlendirilebilir.',
          'Önceden pelvik RT alanlarda yeniden ışınlama yalnız seçilmiş olguda, kümülatif OAR dozu ve fistül/nekroz riskiyle birlikte planlanır.',
          'KEYNOTE-826, persistan/nüks/metastatik serviks kanserinde pembrolizumab kombinasyonunu destekler.',
        ],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = input.priorPelvicRT ? 'consider' : 'indicated';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; kanama, ağrı veya pelvik bası');
      recommendations.push({
        id: 'metastatic-cervical-cancer',
        label: 'Metastatik serviks kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: 'conditional',
        intent,
        fractionation: palliativeDose,
        targetVolumes: cervixTargets(palliativeDose),
        oarConstraints: cervixOars,
        systemicTherapy: [systemic('palliative', 'İlk sıra immüno-kemoterapi', ['pembrolizumab + paclitaxel + cisplatin/carboplatin ± bevacizumab'], 'PD-L1 CPS, organ fonksiyonu ve fistül/kanama riskine göre')],
        rationale: [
          'Metastatik serviks kanserinde sistemik tedavi temel yaklaşımdır; RT kanama, ağrı, obstrüksiyon veya oligometastatik odaklarda lokal kontrol/palyasyon sağlar.',
          'PD-L1, MSI/MMR ve önceki tedaviye göre immünoterapi/hedefli seçenekler değerlendirilir.',
        ],
        guidelineReferences: references(TRIALS[2]),
      });
      rtIndication = input.distantMetastases?.length || input.pelvicNodePositive ? 'conditional' : 'consider';
    }

    rationale.push('Serviks kanseri kararı; jinekolojik onkoloji, radyasyon onkolojisi, medikal onkoloji, patoloji ve radyoloji konseyinde FIGO/TNM evresi, MRI/PET-CT, cerrahi risk ve hasta fertilite/yaşam hedefleriyle verilmelidir.');
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
      uncertainties: !input.figoStage || !input.histology ? ['FIGO evresi veya histoloji eksik; cerrahi, KRT ve brakiterapi seçimi değişebilir.'] : undefined,
      confidence: !input.figoStage || !input.histology ? 0.73 : 0.89,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: CervixInput): string {
    if (input.setting === 'newly-diagnosed') return 'Yeni tanı serviks kanseri: FIGO evresi ve nodal duruma göre cerrahi veya eşzamanlı KRT + MRI-kılavuzlu brakiterapi.';
    if (input.setting === 'postoperative') return 'Postoperatif serviks kanseri: marjin, parametrial tutulum, nodal durum ve orta risk özelliklerine göre adjuvan tedavi.';
    if (input.setting === 'persistent' || input.setting === 'recurrent') return 'Persistan/nüks serviks kanseri: salvage cerrahi/RT ve moleküler profile göre sistemik tedavi.';
    return 'Metastatik serviks kanseri: immüno-kemoterapi ve semptom odaklı pelvik/metastatik RT.';
  }
}

export const cervixEngine = new CervixDecisionEngine();

export default cervixEngine;
