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

export type VaginalSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type VaginalHistology = 'squamous-cell' | 'adenocarcinoma' | 'melanoma' | 'sarcoma' | 'other' | 'unknown';
export type VaginalFIGOStage = 'I' | 'II' | 'III' | 'IVA' | 'IVB' | 'unknown';
export type VaginalSurgery = 'none' | 'local-excision' | 'partial-vaginectomy' | 'radical-vaginectomy' | 'exenteration' | 'unknown';
export type VaginalMolecularFinding = 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'HER2-positive' | 'none' | 'unknown';

export interface VaginalInput extends ClinicalCaseInput {
  organSystem: 'gynecology';
  disease: 'vaginal-cancer';
  setting: VaginalSetting;
  stage?: TNMStage;
  figoStage?: VaginalFIGOStage;
  histology?: VaginalHistology;
  tumorSizeCm?: number;
  upperThirdInvolvement?: boolean;
  paravaginalTissueInvasion?: boolean;
  pelvicWallInvolvement?: boolean;
  bladderOrRectumInvasion?: boolean;
  pelvicNodePositive?: boolean;
  inguinalNodePositive?: boolean;
  distantMetastases?: string[];
  surgeryType?: VaginalSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  positiveNodes?: number;
  lymphovascularSpaceInvasion?: boolean;
  positiveMargin?: boolean;
  priorPelvicRT?: boolean;
  brachytherapyFeasible?: boolean;
  molecularFinding?: VaginalMolecularFinding;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Vaginal Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1483',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gynecologic cancer radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO/ESGO guidance for vaginal and vulvar cancer radiotherapy and brachytherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'RTOG 1203 (TIME-C): image-guided IMRT versus conventional pelvic radiotherapy', url: 'https://doi.org/10.1016/S0360-3016(17)34405-1', evidenceLevel: '1' },
  { organization: 'other', title: 'EMBRACE: image-guided adaptive brachytherapy principles for gynecologic tumors', url: 'https://doi.org/10.1016/S0167-8140(19)31105-5', evidenceLevel: '2A' },
  { organization: 'other', title: 'NRG-GY018: pembrolizumab plus chemotherapy in advanced endometrial cancer', url: 'https://doi.org/10.1056/NEJMoa2302312', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-826: pembrolizumab plus chemotherapy in advanced cervical cancer', url: 'https://doi.org/10.1056/NEJMoa2112435', evidenceLevel: '1' },
];

export const VAGINAL_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/vaginal-input.json',
  title: 'Vaginal cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gynecology'] },
    disease: { type: 'string', enum: ['vaginal-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    figoStage: { type: 'string', enum: ['I', 'II', 'III', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'adenocarcinoma', 'melanoma', 'sarcoma', 'other', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    upperThirdInvolvement: { type: 'boolean' },
    paravaginalTissueInvasion: { type: 'boolean' },
    pelvicWallInvolvement: { type: 'boolean' },
    bladderOrRectumInvasion: { type: 'boolean' },
    pelvicNodePositive: { type: 'boolean' },
    inguinalNodePositive: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    positiveNodes: { type: 'number' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    positiveMargin: { type: 'boolean' },
    priorPelvicRT: { type: 'boolean' },
    brachytherapyFeasible: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const VAGINAL_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/vaginal-result.json',
  title: 'Vaginal cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gynecology.vaginal'] },
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
  technique: className === 'brachytherapy' ? 'adaptive' : className === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const vaginalTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  {
    name: 'GTV',
    description: postoperative ? 'Vajinal cuff/cerrahi yatak ve görüntülenebilir rezidüel hastalık.' : 'Vajinal primer tümör ve görüntülenebilir pelvik/inguinal nodal hastalık; MRI ve PET-CT füzyonu.',
    dose,
    margin: 'Makroskopik tümör, pozitif nod ve cerrahi klipler',
  },
  {
    name: 'CTV',
    description: postoperative
      ? 'Vajinal cuff, paravaginal dokular ve patolojiye göre pelvik/inguinal nodal risk alanları.'
      : 'Primer vajina, paravaginal dokular ve tümör seviyesine göre pelvik ± inguinal nodal istasyonlar; elektif nodal kapsam bireyselleştirilir.',
    dose,
    margin: 'Anatomik yayılım, MRI/PET-CT, klinik muayene ve cerrahi bulgulara göre',
  },
  {
    name: 'PTV',
    description: 'Vajinal ve pelvik organ hareketi ile günlük görüntüleme belirsizliği.',
    dose,
    margin: 'IGRT/CBCT ile yaklaşık 5-10 mm; brakiterapide aplikatör ve MRI/BT rekonstrüksiyonu',
  },
];

const vaginalOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pelvic chemoradiotherapy bowel objective' },
  { organ: 'Rectum', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT rectal objective' },
  { organ: 'Bladder', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT bladder objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pelvic femoral head objective' },
  { organ: 'Rectum', metric: 'D2cc', limit: 75, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided vaginal brachytherapy objective' },
  { organ: 'Bladder', metric: 'D2cc', limit: 90, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided vaginal brachytherapy objective' },
  { organ: 'Sigmoid/small bowel', metric: 'D2cc', limit: 70, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided gynecologic brachytherapy objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class VaginalDecisionEngine extends BaseDecisionEngine<VaginalInput> {
  public readonly id = 'gynecology.vaginal';
  public readonly version = '1.0.0';
  public readonly inputSchema = VAGINAL_INPUT_JSON_SCHEMA;
  public readonly outputSchema = VAGINAL_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: VaginalInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; bağırsak, rektum, mesane, sigmoid ve kemik dozlarının kümülatif değerlendirilmesi gerekir.');
    if (input.brachytherapyFeasible === false && input.setting === 'newly-diagnosed') warnings.push('Brakiterapi uygulanamıyorsa tümör boost dozu ve OAR güvenliği için interstisyel/alternatif boost MDT tarafından planlanmalıdır.');
    if (input.histology === 'melanoma' || input.histology === 'sarcoma') warnings.push('Melanom ve sarkom histolojilerinde sistemik tedavi ve cerrahi öncelikleri skuamöz karsinomdan farklıdır; histolojiye özgü MDT değerlendirmesi gerekir.');

    if (input.setting === 'newly-diagnosed') {
      const earlySurgeryCandidate = input.figoStage === 'I' && input.tumorSizeCm !== undefined && input.tumorSizeCm <= 2 && input.upperThirdInvolvement === true;
      const pelvicDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; primer/nodal boost ve vajinal brakiterapi ile');
      recommendations.push({
        id: 'new-vaginal-cancer',
        label: earlySurgeryCandidate ? 'Seçilmiş küçük üst vajina tümöründe cerrahi veya definitive RT + brakiterapi' : 'Definitif pelvik RT + vajinal brakiterapi; seçilmiş hastada eşzamanlı platin',
        indication: 'indicated',
        intent: 'curative',
        fractionation: pelvicDose,
        targetVolumes: vaginalTargets(pelvicDose),
        oarConstraints: vaginalOars,
        systemicTherapy: [
          systemic('concurrent', 'Seçilmiş lokal ileri hastada cisplatin bazlı eşzamanlı kemoterapi', ['cisplatin'], 'Haftalık 40 mg/m²; böbrek fonksiyonu ve performansa göre', '2B'),
        ],
        rationale: [
          'Vajinal kanserde cerrahi yalnızca küçük, iyi sınırlı ve uygun anatomik yerleşimli lezyonlarda R0 rezeksiyon olasılığı yüksekse düşünülür; fonksiyonel morbidite MDT ile tartılmalıdır.',
          'Lokal ileri, paravaginal/pelvik duvar tutulumu veya nodal hastalıkta definitive pelvik RT ve görüntü kılavuzlu brakiterapi temel küratif yaklaşımdır.',
          'Primer tümör dozu yalnızca EBRT ile bırakılmamalı; brakiterapi ile tümör boostu ve vajinal aplikatör/interstisyel teknik seçimi MRI/BT ve OAR anatomisine göre yapılmalıdır.',
          'RTOG 1203, pelvik IMRT/IGRT ile akut toksisiteyi azaltabilecek planlama yaklaşımını destekler; EMBRACE prensipleri brakiterapide hedef ve OAR optimizasyonunu destekler.',
          'Elektif nodal ışınlama vajinal tümörün seviyesi ve lenfatik drenajına göre pelvik, seçilmiş inguinal ve/veya paraaortik alanlarla sınırlanır; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; risk-adapte boost ± vajinal brakiterapi');
      const highRisk = input.positiveMargin === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.paravaginalTissueInvasion === true;
      recommendations.push({
        id: 'postoperative-vaginal-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif pelvik RT ± brakiterapi ve eşzamanlı tedavi' : 'Patolojiye göre adjuvan RT, vajinal brakiterapi veya yakın izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? vaginalTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRisk ? vaginalOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Postoperatif seçilmiş hastada cisplatin bazlı KRT', ['cisplatin'], 'Marjin/nodal veya paravaginal yüksek riskte haftalık eşzamanlı', '2B')] : undefined,
        rationale: [
          'Pozitif/çok yakın marjin, nodal hastalık, paravaginal invazyon veya R1/R2 rezeksiyon lokal nüks riskini artırır ve adjuvan RT lehinedir.',
          'Küçük, R0 rezeke edilmiş ve düşük riskli tümörlerde rutin geniş alan RT yerine vajinal cuff brakiterapisi veya yakın izlem seçilebilir.',
          'Adjuvan alan ve boost, cerrahi yatak, tümör seviyesi, marjin ve nodal drenaja göre belirlenmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; yalnızca seçilmiş fokal/oligorekürens hastalık');
      const unreirradiatedDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; definitive salvage RT + brakiterapi');
      const priorRT = input.priorPelvicRT === true;
      recommendations.push({
        id: 'recurrent-vaginal-cancer',
        label: priorRT ? 'Önceki RT sonrası seçilmiş fokal salvage SBRT/re-irradiation veya sistemik tedavi' : 'Salvage definitive RT + brakiterapi veya seçilmiş cerrahi',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: priorRT ? focalDose : unreirradiatedDose,
        targetVolumes: vaginalTargets(priorRT ? focalDose : unreirradiatedDose),
        oarConstraints: vaginalOars,
        systemicTherapy: [systemic('palliative', 'Platin uygun değilse histolojiye ve biyobelirteçlere göre sistemik tedavi', ['carboplatin/paclitaxel veya pembrolizumab uygun biyobelirteçte'], 'MDT ve önceki tedavilere göre', '2B')],
        rationale: [
          'İzole veya sınırlı vajinal/pelvik nükste daha önce RT uygulanmamışsa küratif salvage RT ve brakiterapi; seçilmiş rezektabl olguda cerrahi değerlendirilebilir.',
          'Önceki pelvik RT sonrası yeniden ışınlama yalnızca küçük, iyi sınırlı hedeflerde kümülatif OAR dozu ve fistül/nekroz riski ayrıntılı hesaplanarak yapılmalıdır.',
          'Ağrı, kanama, obstrüksiyon veya bası semptomlarında RT endikasyonu güçlenir; yaygın hastalıkta sistemik tedavi önceliklidir.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik pelvik veya metastatik hastalık');
      recommendations.push({
        id: 'metastatic-vaginal-cancer',
        label: 'Sistemik tedavi ve semptomatik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? vaginalTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? vaginalOars : undefined,
        systemicTherapy: [
          systemic('palliative', 'Biyobelirteç ve histolojiye göre platin bazlı kemoterapi veya immünoterapi', ['carboplatin/paclitaxel', 'pembrolizumab MSI-H/dMMR veya TMB-high durumda'], 'Performans durumu, önceki tedavi ve organ fonksiyonuna göre', '2A'),
        ],
        rationale: [
          'IVB veya yaygın metastatik hastalıkta sistemik tedavi ana tedavidir; RT kanama, ağrı, obstrüksiyon, ülserasyon veya sınırlı metastaz için semptom kontrolü sağlar.',
          'PD-L1, MSI/dMMR, TMB ve HER2 gibi biyobelirteçler sistemik tedavi seçimini etkileyebilir; tümör konseyinde doğrulanmalıdır.',
          'Palyatif RT alanı semptomatik makroskopik hastalıkla sınırlanmalı ve önceki pelvik RT dozu dikkate alınmalıdır.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.pelvicWallInvolvement || input.bladderOrRectumInvasion) {
      warnings.push('Pelvik duvar veya mesane/rektum invazyonu mevcut; fistül, kanama ve cerrahi/ekzenterasyon gereksinimi açısından jinekolojik onkoloji ve radyasyon onkolojisi MDT değerlendirmesi gerekir.');
    }
    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal tedavi kararı sistemik hastalık yükü, semptomlar ve oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gynecology',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Vajinal kanser için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, tam MRI/PET-CT ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.82,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const vaginalEngine = new VaginalDecisionEngine();
