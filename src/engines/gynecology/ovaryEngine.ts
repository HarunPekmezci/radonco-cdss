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

export type OvarySetting = 'newly-diagnosed' | 'postoperative' | 'neoadjuvant' | 'recurrent' | 'metastatic';
export type OvaryHistology = 'high-grade-serous' | 'low-grade-serous' | 'endometrioid' | 'clear-cell' | 'mucinous' | 'germ-cell' | 'sex-cord-stromal' | 'other' | 'unknown';
export type OvaryFIGOStage = 'I' | 'II' | 'IIIA' | 'IIIB' | 'IIIC' | 'IVA' | 'IVB' | 'unknown';
export type OvaryMolecularFinding = 'BRCA1' | 'BRCA2' | 'HRD-positive' | 'HRD-negative' | 'FR-alpha-high' | 'MSI-H' | 'dMMR' | 'none' | 'unknown';
export type OvaryCytoreduction = 'complete-no-gross-residual' | 'optimal-residual' | 'suboptimal-residual' | 'not-performed' | 'unknown';

export interface OvaryInput extends ClinicalCaseInput {
  organSystem: 'gynecology';
  disease: 'ovarian-cancer';
  setting: OvarySetting;
  stage?: TNMStage;
  figoStage?: OvaryFIGOStage;
  histology?: OvaryHistology;
  molecularFinding?: OvaryMolecularFinding;
  cytoreductionStatus?: OvaryCytoreduction;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  pelvicNodePositive?: boolean;
  paraaorticNodePositive?: boolean;
  peritonealDisease?: boolean;
  ascites?: boolean;
  pleuralEffusion?: boolean;
  platinumSensitive?: boolean;
  platinumResistant?: boolean;
  priorPelvicRT?: boolean;
  symptomaticFocalDisease?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Ovarian Cancer/Fallopian Tube/Primary Peritoneal Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1453',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for gynecologic and oligometastatic radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESGO-ESTRO guidance for ovarian cancer and pelvic radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ICON8: weekly dose-dense chemotherapy in ovarian cancer', url: 'https://doi.org/10.1016/S0140-6736(20)32236-8', evidenceLevel: '1' },
  { organization: 'other', title: 'SOLO-1: olaparib maintenance in BRCA-mutated advanced ovarian cancer', url: 'https://doi.org/10.1056/NEJMoa1810858', evidenceLevel: '1' },
  { organization: 'other', title: 'PAOLA-1: olaparib plus bevacizumab maintenance in advanced ovarian cancer', url: 'https://doi.org/10.1056/NEJMoa1911361', evidenceLevel: '1' },
  { organization: 'other', title: 'PRIMA: niraparib maintenance in advanced ovarian cancer', url: 'https://doi.org/10.1056/NEJMoa1910962', evidenceLevel: '1' },
  { organization: 'other', title: 'DESKTOP III: secondary cytoreductive surgery in platinum-sensitive recurrent ovarian cancer', url: 'https://doi.org/10.1056/NEJMoa2103294', evidenceLevel: '1' },
];

export const OVARY_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ovary-input.json',
  title: 'Ovarian cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gynecology'] },
    disease: { type: 'string', enum: ['ovarian-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'neoadjuvant', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    figoStage: { type: 'string', enum: ['I', 'II', 'IIIA', 'IIIB', 'IIIC', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['high-grade-serous', 'low-grade-serous', 'endometrioid', 'clear-cell', 'mucinous', 'germ-cell', 'sex-cord-stromal', 'other', 'unknown'] },
    molecularFinding: { type: 'string' },
    cytoreductionStatus: { type: 'string', enum: ['complete-no-gross-residual', 'optimal-residual', 'suboptimal-residual', 'not-performed', 'unknown'] },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    pelvicNodePositive: { type: 'boolean' },
    paraaorticNodePositive: { type: 'boolean' },
    peritonealDisease: { type: 'boolean' },
    ascites: { type: 'boolean' },
    pleuralEffusion: { type: 'boolean' },
    platinumSensitive: { type: 'boolean' },
    platinumResistant: { type: 'boolean' },
    priorPelvicRT: { type: 'boolean' },
    symptomaticFocalDisease: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const OVARY_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/ovary-result.json',
  title: 'Ovarian cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gynecology.ovary'] },
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
  technique: className === 'SBRT' ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const ovaryTargets = (dose: Fractionation): TargetVolume[] => [
  { name: 'GTV', description: 'Görüntülenebilir peritoneal, pelvik, nodal veya oligometastatik over/fallop tüpü/primer peritoneal hastalık.', dose, margin: 'Makroskopik hastalık ve cerrahi klipler' },
  { name: 'CTV', description: 'Pelvik/paraaortik nodal risk, cerrahi yatak veya seçilmiş peritoneal/oligometastatik alan; rutin tüm periton RT standart değildir.', dose, margin: 'Anatomi, PET-CT/MRI ve cerrahi bulgulara göre' },
  { name: 'PTV', description: 'Barsak hareketi ve günlük IGRT belirsizliği.', dose, margin: 'CBCT/IGRT ile yaklaşık 5-10 mm; SBRT’de 2-5 mm' },
];

const ovaryOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pelvic/abdominal RT small bowel objective' },
  { organ: 'Rectum', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT rectal objective' },
  { organ: 'Bladder', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT bladder objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Abdominal chemotherapy/RT renal objective' },
  { organ: 'Liver', metric: 'Dmean', limit: 28, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Upper abdominal RT liver objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class OvaryDecisionEngine extends BaseDecisionEngine<OvaryInput> {
  public readonly id = 'gynecology.ovary';
  public readonly version = '1.0.0';
  public readonly inputSchema = OVARY_INPUT_JSON_SCHEMA;
  public readonly outputSchema = OVARY_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: OvaryInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; barsak, rektum, mesane, böbrek ve karaciğer kümülatif dozları değerlendirilmelidir.');
    if (input.ascites || input.pleuralEffusion) warnings.push('Asit veya plevral efüzyon ileri peritoneal/plevral yayılım ve tedavi toleransı açısından değerlendirilmelidir.');
    if (input.platinumResistant) warnings.push('Platin dirençli hastalıkta sistemik seçenekler ve semptom odaklı RT önceliklidir; yeniden platin genellikle uygun değildir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative' || input.setting === 'neoadjuvant') {
      const pelvicDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; seçilmiş nodal/pelvik rezidüel alan');
      const systemicTherapy: SystemicTherapyRecommendation[] = [
        systemic('adjuvant', 'Platin/taksan tabanlı kemoterapi', ['carboplatin', 'paclitaxel'], 'Cerrahi sonrası veya neoadjuvan kemoterapi sonrası interval debulking ile; toplam 6 kür bağlamında'),
      ];
      if (input.molecularFinding === 'BRCA1' || input.molecularFinding === 'BRCA2' || input.molecularFinding === 'HRD-positive') systemicTherapy.push(systemic('maintenance', 'PARP inhibitörü idame tedavisi', ['olaparib veya niraparib'], 'Platin yanıtı sonrası, BRCA/HRD durumuna göre'));
      recommendations.push({
        id: 'localized-ovarian-cancer',
        label: input.cytoreductionStatus === 'complete-no-gross-residual' ? 'Komplet sitoredüksiyon sonrası platin/taksan ve moleküler profile göre idame' : 'Neoadjuvan kemoterapi → interval sitoredüksiyon → ek kemoterapi',
        indication: input.peritonealDisease || input.pelvicNodePositive || input.paraaorticNodePositive ? 'conditional' : 'not-indicated',
        intent: 'curative',
        fractionation: input.symptomaticFocalDisease ? pelvicDose : undefined,
        targetVolumes: input.symptomaticFocalDisease ? ovaryTargets(pelvicDose) : undefined,
        oarConstraints: input.symptomaticFocalDisease ? ovaryOars : undefined,
        systemicTherapy,
        rationale: [
          'İleri epitelyal over/fallop tüpü/primer peritoneal kanserde amaç komplet makroskopik sitoredüksiyondur; R0 ve cerrahi morbidite MDT’de değerlendirilir.',
          'Cerrahi başlangıçta uygun değilse neoadjuvan karboplatin/paklitaksel ve interval debulking yaklaşımı kullanılır.',
          'Rutin adjuvan pelvik RT standart değildir; RT seçilmiş semptomatik veya sınırlı rezidüel/pelvik odakta lokal kontrol amacıyla düşünülür.',
          'Elektif nodal RT yerine cerrahi nodal evreleme ve sistemik tedavi temel yaklaşımdır; torasik ENI uygulanmaz.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticFocalDisease ? 'consider' : 'not-indicated';
    } else if (input.setting === 'recurrent') {
      const focalDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; seçilmiş sınırlı oligorekürens veya semptomatik odak');
      const systemicTherapy: SystemicTherapyRecommendation[] = [];
      if (input.platinumSensitive) systemicTherapy.push(systemic('palliative', 'Platin-duyarlı nükste kombinasyon kemoterapisi ± bevacizumab', ['carboplatin + pegylated liposomal doxorubicin/paclitaxel ± bevacizumab'], 'Önceki yanıt, toksisite ve PARP idamesine göre'));
      if (input.platinumResistant) systemicTherapy.push(systemic('palliative', 'Platin-dirençli nükste tek ajan tedavi ± bevacizumab', ['pegylated liposomal doxorubicin, weekly paclitaxel, topotecan ± bevacizumab'], 'Performans, semptom ve önceki tedaviye göre'));
      recommendations.push({
        id: 'recurrent-ovarian-cancer',
        label: 'Nüks over kanserinde seçilmiş sekonder sitoredüksiyon, sistemik tedavi ve fokal RT',
        indication: input.symptomaticFocalDisease ? 'consider' : 'conditional',
        intent: 'salvage',
        fractionation: input.symptomaticFocalDisease ? focalDose : undefined,
        targetVolumes: input.symptomaticFocalDisease ? ovaryTargets(focalDose) : undefined,
        oarConstraints: input.symptomaticFocalDisease ? ovaryOars : undefined,
        systemicTherapy,
        rationale: [
          'Platin-duyarlı ve komplet sitoredüksiyon olasılığı yüksek seçilmiş nükste DESKTOP III doğrultusunda sekonder sitoredüksiyon değerlendirilebilir.',
          'Sınırlı oligorekürens, kanama, ağrı veya obstrüksiyonda SBRT/konvansiyonel RT lokal kontrol ve semptom palyasyonu sağlar.',
          'RT over kanserinde rutin sistemik tedavinin yerine geçmez; yaygın peritoneal hastalıkta sistemik tedavi esastır.',
        ],
        guidelineReferences: references(TRIALS[4]),
      });
      rtIndication = input.symptomaticFocalDisease ? 'consider' : 'conditional';
      intent = 'salvage';
    } else {
      intent = 'palliative';
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik pelvik/peritoneal odak');
      const therapy: SystemicTherapyRecommendation[] = [
        systemic('palliative', 'İleri over kanserinde platin/taksan veya nüks rejimi', ['carboplatin + paclitaxel veya nüks tedavisi'], 'Platin duyarlılığı, performans ve moleküler profile göre'),
      ];
      if (input.molecularFinding === 'BRCA1' || input.molecularFinding === 'BRCA2' || input.molecularFinding === 'HRD-positive') therapy.push(systemic('maintenance', 'PARP inhibitörü idame tedavisi', ['olaparib, niraparib veya rucaparib'], 'Platin yanıtı ve moleküler profile göre'));
      if (input.molecularFinding === 'FR-alpha-high') therapy.push(systemic('palliative', 'FRα hedefli tedavi', ['mirvetuximab soravtansine'], 'Uygun FRα-yüksek platin dirençli hastalıkta güncel ruhsat/kılavuza göre', '2A'));
      recommendations.push({
        id: 'metastatic-ovarian-cancer',
        label: 'Metastatik over kanserinde sistemik tedavi ve semptom odaklı RT',
        indication: input.symptomaticFocalDisease ? 'indicated' : 'conditional',
        intent,
        fractionation: input.symptomaticFocalDisease ? palliativeDose : undefined,
        targetVolumes: input.symptomaticFocalDisease ? ovaryTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticFocalDisease ? ovaryOars : undefined,
        systemicTherapy: therapy,
        rationale: [
          'Yaygın peritoneal/plevral hastalıkta sistemik tedavi ve semptom kontrolü temel yaklaşımdır.',
          'RT; kanama, ağrı, barsak/üreter basısı veya seçilmiş oligometastatik odaklarda uygulanır.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticFocalDisease ? 'indicated' : 'conditional';
    }

    rationale.push('Over kanseri kararı; jinekolojik onkoloji, medikal/radyasyon onkolojisi, cerrahi, patoloji ve radyoloji konseyinde histoloji, FIGO evresi, sitoredüksiyon olasılığı, platin duyarlılığı ve BRCA/HRD durumuyla verilmelidir.');
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
      uncertainties: !input.figoStage || !input.histology || !input.cytoreductionStatus ? ['FIGO evresi, histoloji veya sitoredüksiyon durumu eksik; cerrahi ve sistemik tedavi sıralaması değişebilir.'] : undefined,
      confidence: !input.figoStage || !input.histology || !input.cytoreductionStatus ? 0.72 : 0.87,
      generatedAt: new Date().toISOString(),
      guidelineReferences: recommendations.flatMap((recommendation) => recommendation.guidelineReferences ?? []),
    };
  }

  private summary(input: OvaryInput): string {
    if (input.setting === 'newly-diagnosed' || input.setting === 'postoperative' || input.setting === 'neoadjuvant') return 'Yeni tanı/operasyon çevresi over kanseri: komplet sitoredüksiyon, platin/taksan tedavisi ve BRCA/HRD’ye göre PARP idamesi.';
    if (input.setting === 'recurrent') return 'Nüks over kanseri: platin duyarlılığına göre sekonder cerrahi, sistemik tedavi ve seçilmiş fokal RT.';
    return 'Metastatik over kanseri: sistemik tedavi, PARP/FRα hedefli seçenekler ve semptom odaklı RT.';
  }
}

export const ovaryEngine = new OvaryDecisionEngine();

export default ovaryEngine;
