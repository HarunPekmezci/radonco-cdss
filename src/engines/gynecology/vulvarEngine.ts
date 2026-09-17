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

export type VulvarSetting = 'newly-diagnosed' | 'postoperative' | 'recurrent' | 'metastatic';
export type VulvarHistology = 'squamous-cell' | 'melanoma' | 'adenocarcinoma' | 'sarcoma' | 'other' | 'unknown';
export type VulvarFIGOStage = 'IA' | 'IB' | 'II' | 'IIIA' | 'IIIB' | 'IIIC' | 'IVA' | 'IVB' | 'unknown';
export type VulvarSurgery = 'none' | 'wide-local-excision' | 'partial-vulvectomy' | 'radical-vulvectomy' | 'exenteration' | 'unknown';
export type VulvarMolecularFinding = 'PD-L1-positive' | 'MSI-H' | 'dMMR' | 'TMB-high' | 'HER2-positive' | 'none' | 'unknown';

export interface VulvarInput extends ClinicalCaseInput {
  organSystem: 'gynecology';
  disease: 'vulvar-cancer';
  setting: VulvarSetting;
  stage?: TNMStage;
  figoStage?: VulvarFIGOStage;
  histology?: VulvarHistology;
  tumorSizeCm?: number;
  depthOfInvasionMm?: number;
  midlineCrossing?: boolean;
  urethralOrAnalInvolvement?: boolean;
  pelvicWallInvolvement?: boolean;
  inguinalNodePositive?: boolean;
  pelvicNodePositive?: boolean;
  distantMetastases?: string[];
  surgeryType?: VulvarSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  closestMarginMm?: number;
  positiveMargin?: boolean;
  positiveNodes?: number;
  extranodalExtension?: boolean;
  lymphovascularSpaceInvasion?: boolean;
  priorPelvicRT?: boolean;
  brachytherapyFeasible?: boolean;
  molecularFinding?: VulvarMolecularFinding;
  symptomaticRecurrence?: boolean;
  performanceStatusECOG?: number;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Vulvar Cancer',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1473',
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
  title: 'ESGO-ESTRO consensus guidance for vulvar cancer radiotherapy and brachytherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'GROINSS-V-II: radiotherapy versus inguinofemoral lymphadenectomy for sentinel-node-positive vulvar cancer', url: 'https://doi.org/10.1016/S0140-6736(20)32622-9', evidenceLevel: '1' },
  { organization: 'other', title: 'GOG-205: neoadjuvant cisplatin with radiation for locally advanced vulvar cancer', url: 'https://doi.org/10.1016/j.ijrobp.2012.01.060', evidenceLevel: '2A' },
  { organization: 'other', title: 'RTOG 1203 (TIME-C): image-guided IMRT versus conventional pelvic radiotherapy', url: 'https://doi.org/10.1016/S0360-3016(17)34405-1', evidenceLevel: '1' },
  { organization: 'other', title: 'KEYNOTE-826: pembrolizumab plus chemotherapy in advanced gynecologic cancer', url: 'https://doi.org/10.1056/NEJMoa2112435', evidenceLevel: '1' },
];

export const VULVAR_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/vulvar-input.json',
  title: 'Vulvar cancer clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['gynecology'] },
    disease: { type: 'string', enum: ['vulvar-cancer'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'recurrent', 'metastatic'] },
    stage: { type: 'object', additionalProperties: true },
    figoStage: { type: 'string', enum: ['IA', 'IB', 'II', 'IIIA', 'IIIB', 'IIIC', 'IVA', 'IVB', 'unknown'] },
    histology: { type: 'string', enum: ['squamous-cell', 'melanoma', 'adenocarcinoma', 'sarcoma', 'other', 'unknown'] },
    tumorSizeCm: { type: 'number' },
    depthOfInvasionMm: { type: 'number' },
    midlineCrossing: { type: 'boolean' },
    urethralOrAnalInvolvement: { type: 'boolean' },
    pelvicWallInvolvement: { type: 'boolean' },
    inguinalNodePositive: { type: 'boolean' },
    pelvicNodePositive: { type: 'boolean' },
    distantMetastases: { type: 'array', items: { type: 'string' } },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    closestMarginMm: { type: 'number' },
    positiveMargin: { type: 'boolean' },
    positiveNodes: { type: 'number' },
    extranodalExtension: { type: 'boolean' },
    lymphovascularSpaceInvasion: { type: 'boolean' },
    priorPelvicRT: { type: 'boolean' },
    brachytherapyFeasible: { type: 'boolean' },
    molecularFinding: { type: 'string' },
    symptomaticRecurrence: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' },
  },
  additionalProperties: true,
};

export const VULVAR_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/vulvar-result.json',
  title: 'Vulvar cancer CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['gynecology.vulvar'] },
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

const vulvarTargets = (dose: Fractionation, postoperative = false): TargetVolume[] => [
  { name: 'GTV', description: postoperative ? 'Vulvar cerrahi yatağı, pozitif/çok yakın marjin ve görüntülenebilir rezidüel hastalık.' : 'Primer vulvar tümör ve görüntülenebilir inguinal/pelvik nodal hastalık; klinik muayene, MRI ve PET-CT füzyonu.', dose, margin: 'Makroskopik tümör, pozitif nod ve cerrahi klipler' },
  { name: 'CTV', description: postoperative ? 'Vulvar cerrahi yatak, komşu cilt/paravulvar dokular ve patolojiye göre inguinal-pelvik nodal alanlar.' : 'Primer vulva, paravulvar dokular ve tümör lateralitesi/orta hat geçişine göre bilateral inguinal ± pelvik nodal istasyonlar.', dose, margin: 'Anatomik yayılım, MRI/PET-CT, cilt işaretleri ve cerrahi bulgulara göre' },
  { name: 'PTV', description: 'Cilt yüzeyi, vulvar/perineal hareket ve günlük IGRT belirsizliği.', dose, margin: 'Bolus/cilt dozunu doğrulayan IGRT ile yaklaşık 5-10 mm' },
];

const vulvarOars: OARConstraint[] = [
  { organ: 'Small bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Pelvic chemoradiotherapy bowel objective' },
  { organ: 'Rectum', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT rectal objective' },
  { organ: 'Bladder', metric: 'V60', limit: 60, unit: '%', priority: 'optimal', source: 'protocol', sourceReference: 'Pelvic IMRT bladder objective' },
  { organ: 'Femoral heads', metric: 'Dmax', limit: 50, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Pelvic femoral head objective' },
  { organ: 'Skin/perineum', metric: 'Dmean', limit: 45, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Vulvar IMRT skin and wound-healing objective' },
  { organ: 'Rectum', metric: 'D2cc', limit: 75, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided gynecologic brachytherapy objective' },
  { organ: 'Bladder', metric: 'D2cc', limit: 90, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Image-guided gynecologic brachytherapy objective' },
];

const systemic = (
  setting: SystemicTherapyRecommendation['setting'],
  regimen: string,
  agents: string[],
  timing: string,
  evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A',
): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });

const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class VulvarDecisionEngine extends BaseDecisionEngine<VulvarInput> {
  public readonly id = 'gynecology.vulvar';
  public readonly version = '1.0.0';
  public readonly inputSchema = VULVAR_INPUT_JSON_SCHEMA;
  public readonly outputSchema = VULVAR_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: VulvarInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'curative';

    if (input.priorPelvicRT) warnings.push('Önceki pelvik RT mevcut; bağırsak, rektum, mesane, cilt/perine ve femur başı dozlarının kümülatif değerlendirilmesi gerekir.');
    if (input.brachytherapyFeasible === false && input.setting === 'newly-diagnosed') warnings.push('Brakiterapi uygulanamıyorsa seçilmiş yüzeyel/rezidüel hastalık için boost tekniği ve cilt/OAR güvenliği MDT tarafından planlanmalıdır.');
    if (input.histology === 'melanoma' || input.histology === 'sarcoma') warnings.push('Melanom ve sarkom histolojilerinde cerrahi ve sistemik tedavi öncelikleri skuamöz vulvar karsinomdan farklıdır; histolojiye özgü MDT gerekir.');
    if (input.midlineCrossing) rationale.push('Orta hat geçişi bilateral inguinal drenaj riskini artırır; bilateral inguinofemoral nodal değerlendirme/ışınlama düşünülmelidir.');

    if (input.setting === 'newly-diagnosed') {
      const smallLateralLesion = input.figoStage === 'IA' && input.tumorSizeCm !== undefined && input.tumorSizeCm <= 2 && input.midlineCrossing !== true;
      const definitiveDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; primer/nodal boost ± yüzeyel brakiterapi');
      recommendations.push({
        id: 'new-vulvar-cancer',
        label: smallLateralLesion ? 'Seçilmiş küçük lateral lezyonda R0 geniş lokal eksizyon + sentinel nod yaklaşımı' : 'Definitif vulvar/inguinal-pelvik RT ± eşzamanlı tedavi ve seçilmiş brakiterapi',
        indication: smallLateralLesion ? 'conditional' : 'indicated',
        intent: 'curative',
        fractionation: smallLateralLesion ? undefined : definitiveDose,
        targetVolumes: smallLateralLesion ? undefined : vulvarTargets(definitiveDose),
        oarConstraints: smallLateralLesion ? undefined : vulvarOars,
        systemicTherapy: smallLateralLesion ? undefined : [
          systemic('concurrent', 'Seçilmiş lokal ileri hastada cisplatin bazlı eşzamanlı kemoterapi', ['cisplatin'], 'Haftalık 40 mg/m²; renal fonksiyon ve performansa göre', '2B'),
        ],
        rationale: [
          'Küçük, lateralize, invazyonu sınırlı ve nodal riski düşük lezyonlarda geniş lokal eksizyon ve uygun hastada sentinel nod yaklaşımı organ ve fonksiyon koruyabilir.',
          'Büyük, orta hattı geçen, paravulvar/üretral/anal komşuluğu olan veya nodal hastalık içeren tümörlerde cerrahi morbiditeyi azaltmak için definitive/neoadjuvan RT ve seçilmiş cisplatin yaklaşımı değerlendirilir.',
          'İnguinal nodal yönetim tümör lateralitesi, orta hat geçişi, derin invazyon ve sentinel nod sonucuna göre yapılır; pozitif nodlarda pelvik alan eklenebilir.',
          'GROINSS-V-II sentinel-node-pozitif hastalarda nodal RT seçiminin inguinofemoral cerrahiye alternatif olabileceğini destekler; GOG-205 lokal ileri hastalıkta neoadjuvan cisplatin-RT yaklaşımını destekler.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1]),
      });
      rtIndication = smallLateralLesion ? 'conditional' : 'indicated';
    } else if (input.setting === 'postoperative') {
      const postoperativeDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; inguinal ± pelvik nodal RT ve primer yatak boostu');
      const highRisk = input.positiveMargin === true || input.surgicalMargin === 'R1' || input.surgicalMargin === 'R2' || Boolean(input.positiveNodes && input.positiveNodes > 0) || input.extranodalExtension === true || (input.closestMarginMm !== undefined && input.closestMarginMm < 8);
      recommendations.push({
        id: 'postoperative-vulvar-cancer',
        label: highRisk ? 'Yüksek riskli postoperatif vulvar/inguinal-pelvik RT ± eşzamanlı tedavi' : 'Marjin, invazyon ve sentinel/inguinofemoral nod patolojisine göre adjuvan RT veya izlem',
        indication: highRisk ? 'indicated' : 'conditional',
        intent: 'adjuvant',
        fractionation: highRisk ? postoperativeDose : undefined,
        targetVolumes: highRisk ? vulvarTargets(postoperativeDose, true) : undefined,
        oarConstraints: highRisk ? vulvarOars : undefined,
        systemicTherapy: highRisk ? [systemic('concurrent', 'Seçilmiş yüksek riskli hastada cisplatin bazlı adjuvan KRT', ['cisplatin'], 'Pozitif marjin/çoklu nod/ekstranodal yayılımda haftalık eşzamanlı', '2B')] : undefined,
        rationale: [
          'Pozitif veya çok yakın marjin, çoklu pozitif inguinal nod, ekstranodal yayılım ve derin/komşu organ invazyonu lokal-bölgesel nüks riskini artırır ve adjuvan RT lehinedir.',
          'R0 rezeksiyon ve düşük riskli tek negatif sentinel nod varlığında rutin geniş alan RT yerine yakın izlem düşünülebilir.',
          'İnguinal nodal alanlar, orta hat ve drenaj anatomisine göre unilateral veya bilateral planlanır; pelvik nodlar pozitiflik ve üst drenaj riskine göre eklenir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2]),
      });
      rtIndication = highRisk ? 'indicated' : 'conditional';
      intent = 'adjuvant';
    } else if (input.setting === 'recurrent') {
      const salvageDose = fraction(30, 5, 'SBRT', '30 Gy / 5 fx; küçük ve seçilmiş fokal nüks');
      const definitiveDose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; daha önce ışınlanmamış seçilmiş salvage alan');
      const previouslyIrradiated = input.priorPelvicRT === true;
      recommendations.push({
        id: 'recurrent-vulvar-cancer',
        label: previouslyIrradiated ? 'Önceki RT sonrası seçilmiş fokal re-irradiation/SBRT veya sistemik tedavi' : 'Salvage cerrahi veya definitive salvage RT ± yüzeyel brakiterapi',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: previouslyIrradiated ? salvageDose : definitiveDose,
        targetVolumes: vulvarTargets(previouslyIrradiated ? salvageDose : definitiveDose),
        oarConstraints: vulvarOars,
        systemicTherapy: [systemic('palliative', 'Histoloji ve biyobelirteçlere göre platin bazlı tedavi veya immünoterapi', ['carboplatin/paclitaxel', 'pembrolizumab uygun MSI-H/dMMR veya TMB-high durumda'], 'Önceki tedavi, semptom yükü ve performansa göre', '2B')],
        rationale: [
          'İzole lokal nükste R0 rezeksiyon mümkünse salvage cerrahi; daha önce RT uygulanmamışsa definitive RT ve seçilmiş brakiterapi değerlendirilebilir.',
          'Önceki RT sonrası yeniden ışınlama yalnızca küçük hedeflerde, kümülatif cilt/perine, barsak, mesane ve rektum dozları hesaplanarak yapılmalıdır.',
          'Kanama, ağrı, ülserasyon veya obstrüksiyon semptomları RT endikasyonunu güçlendirir; yaygın hastalıkta sistemik tedavi önceliklidir.',
        ],
        guidelineReferences: references(TRIALS[2], TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'salvage';
    } else {
      const palliativeDose = fraction(30, 10, 'moderate-hypofractionation', '30 Gy / 10 fx; semptomatik vulvar/pelvik veya metastatik hastalık');
      recommendations.push({
        id: 'metastatic-vulvar-cancer',
        label: 'Sistemik tedavi ve semptomatik vulvar/pelvik odaklara palyatif RT',
        indication: input.symptomaticRecurrence ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: input.symptomaticRecurrence ? palliativeDose : undefined,
        targetVolumes: input.symptomaticRecurrence ? vulvarTargets(palliativeDose) : undefined,
        oarConstraints: input.symptomaticRecurrence ? vulvarOars : undefined,
        systemicTherapy: [
          systemic('palliative', 'Biyobelirteç ve histolojiye göre platin bazlı kemoterapi veya immünoterapi', ['carboplatin/paclitaxel', 'pembrolizumab MSI-H/dMMR veya TMB-high durumda'], 'Performans durumu, önceki tedavi ve organ fonksiyonuna göre', '2A'),
        ],
        rationale: [
          'IVB veya yaygın metastatik hastalıkta sistemik tedavi ana tedavidir; RT kanama, ağrı, ülserasyon, enfeksiyon veya lokal bası için semptom kontrolü sağlar.',
          'PD-L1, MSI/dMMR, TMB ve HER2 gibi biyobelirteçler sistemik tedavi seçimini etkileyebilir; sonuçlar tümör konseyinde doğrulanmalıdır.',
        ],
        guidelineReferences: references(TRIALS[3]),
      });
      rtIndication = input.symptomaticRecurrence ? 'indicated' : 'conditional';
      intent = 'palliative';
    }

    if (input.pelvicWallInvolvement || input.urethralOrAnalInvolvement) {
      warnings.push('Pelvik duvar, üretra veya anal kanal tutulumu mevcut; yara iyileşmesi, fistül, ekzenterasyon ve fonksiyonel morbidite açısından jinekolojik onkoloji/MDT değerlendirmesi gerekir.');
    }
    if (input.distantMetastases && input.distantMetastases.length > 0) {
      rationale.push('Uzak metastazlar mevcut; lokal tedavi kararı sistemik hastalık yükü, semptomlar ve seçilmiş oligometastatik strateji ile birlikte verilmelidir.');
    }

    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'gynecology',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Vulvar kanser için MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, klinik muayene, MRI/PET-CT ve patoloji raporu kurum içinde doğrulanmalıdır.'],
      confidence: 0.82,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const vulvarEngine = new VulvarDecisionEngine();
