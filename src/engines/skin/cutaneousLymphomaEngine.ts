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

export type CutaneousLymphomaSetting = 'newly-diagnosed' | 'post-treatment' | 'relapsed' | 'refractory' | 'palliative';
export type CutaneousLymphomaSubtype = 'mycosis-fungoides' | 'sezary-syndrome' | 'primary-cutaneous-b-cell' | 'primary-cutaneous-cd30-positive' | 'other' | 'unknown';
export type CutaneousLymphomaStage = 'IA' | 'IB' | 'II' | 'IIIA' | 'IIIB' | 'IVA1' | 'IVA2' | 'IVB' | 'unknown';
export type CutaneousLymphomaSurgery = 'excision' | 'biopsy' | 'nodal-biopsy' | 'none' | 'unknown';
export type CutaneousLymphomaMolecularFinding = 'none' | 'T-cell-receptor-clone' | 'CD30-positive' | 'EBV-positive' | 'MYD88-altered' | 'BCL2-rearranged' | 'unknown';

export interface CutaneousLymphomaInput extends ClinicalCaseInput {
  organSystem: 'skin';
  disease: 'cutaneous-lymphoma';
  setting: CutaneousLymphomaSetting;
  subtype?: CutaneousLymphomaSubtype;
  stage?: TNMStage;
  stageGroup?: CutaneousLymphomaStage;
  surgeryType?: CutaneousLymphomaSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  lesionsCount?: number;
  largestLesionCm?: number;
  lesionsGeneralized?: boolean;
  tumorsOrUlcers?: boolean;
  palpableNodes?: boolean;
  extracutaneousDisease?: boolean;
  bloodInvolvement?: boolean;
  cd30Positive?: boolean;
  priorSkinRT?: boolean;
  priorSystemicTherapy?: string[];
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
  molecularFinding?: CutaneousLymphomaMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Primary Cutaneous Lymphomas',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1483',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for lymphoma and skin radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance and consensus statements for lymphoma radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'ILROG: modern radiation therapy for primary cutaneous lymphomas', url: 'https://doi.org/10.1182/bloodadvances.2020003707', evidenceLevel: 'B' },
  { organization: 'other', title: 'PROCLIPI: international prognostic index for mycosis fungoides and Sézary syndrome', url: 'https://doi.org/10.1016/S0140-6736(20)31955-6', evidenceLevel: '2A' },
  { organization: 'other', title: 'MAVORIC: mogamulizumab versus vorinostat in relapsed or refractory CTCL', url: 'https://doi.org/10.1056/NEJMoa1807188', evidenceLevel: '1' },
  { organization: 'other', title: 'ALCANZA: brentuximab vedotin in CD30-positive CTCL', url: 'https://doi.org/10.1016/S0140-6736(17)31266-7', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 93-11: involved-field radiotherapy for indolent lymphoma, a dose framework relevant to localized cutaneous disease', url: 'https://clinicaltrials.gov/study/NCT00003173', evidenceLevel: '2B' },
];

export const CUTANEOUS_LYMPHOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cutaneous-lymphoma-input.json',
  title: 'Cutaneous lymphoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['skin'] },
    disease: { type: 'string', enum: ['cutaneous-lymphoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'post-treatment', 'relapsed', 'refractory', 'palliative'] },
    subtype: { type: 'string', enum: ['mycosis-fungoides', 'sezary-syndrome', 'primary-cutaneous-b-cell', 'primary-cutaneous-cd30-positive', 'other', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['IA', 'IB', 'II', 'IIIA', 'IIIB', 'IVA1', 'IVA2', 'IVB', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    lesionsCount: { type: 'number' }, largestLesionCm: { type: 'number' },
    lesionsGeneralized: { type: 'boolean' }, tumorsOrUlcers: { type: 'boolean' },
    palpableNodes: { type: 'boolean' }, extracutaneousDisease: { type: 'boolean' },
    bloodInvolvement: { type: 'boolean' }, cd30Positive: { type: 'boolean' },
    priorSkinRT: { type: 'boolean' }, priorSystemicTherapy: { type: 'array', items: { type: 'string' } },
    symptomaticDisease: { type: 'boolean' }, performanceStatusECOG: { type: 'number' },
    molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const CUTANEOUS_LYMPHOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cutaneous-lymphoma-result.json',
  title: 'Cutaneous lymphoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string', enum: ['skin.cutaneous-lymphoma'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['skin'] },
    rtIndication: { type: 'string' }, intent: { type: 'string' }, summary: { type: 'string' },
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
  technique: className === 'ultra-hypofractionation' ? 'IGRT' : 'electrons/photons' as Fractionation['technique'],
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (dose: Fractionation, totalSkin = false): TargetVolume[] => [
  { name: 'GTV', description: totalSkin ? 'Klinik olarak tutulan tüm cilt ve görünür plak/tümör alanları.' : 'Biyopsi ile doğrulanmış plak, tümör, ülser veya nodal kutanöz lezyon.', dose, margin: 'Klinik muayene, fotoğraf, palpasyon ve gerekirse PET-CT/MRI ile' },
  { name: 'CTV', description: totalSkin ? 'Tüm cilt yüzeyi; saçlı deri, perine ve intertriginöz alanlar dahil teknik olarak tutulabilen bölgeler.' : 'GTV çevresindeki subklinik dermal infiltrasyon ve gerekiyorsa komşu cilt/nodal alan.', dose, margin: 'Lokal lezyonda genellikle 1-1.5 cm; anatomik bariyerler ve ILROG önerileriyle bireyselleştirilir' },
  { name: 'PTV', description: 'Cilt yüzeyindeki kurulum, solunum/hareket ve bolus belirsizliğini kapsayan tedavi hacmi.', dose, margin: 'Yüzeyel RT için 3-5 mm; TSEBT/TSEI tekniğinde hasta pozisyonu ve alan birleşimleri ile doğrulanır' },
];

const oars: OARConstraint[] = [
  { organ: 'Lens', metric: 'Dmax', limit: 6, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Periocular cutaneous lymphoma RT objective' },
  { organ: 'Eye', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Periocular and total-skin electron/photon planning objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Head and neck or nodal re-irradiation objective' },
  { organ: 'Bone marrow', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Extensive-field lymphoma RT planning objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Cervical/axillary nodal field objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({
  setting, regimen, agents, timing, evidenceLevel,
});
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class CutaneousLymphomaDecisionEngine extends BaseDecisionEngine<CutaneousLymphomaInput> {
  public readonly id = 'skin.cutaneous-lymphoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = CUTANEOUS_LYMPHOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = CUTANEOUS_LYMPHOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: CutaneousLymphomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const advanced = input.extracutaneousDisease === true || input.palpableNodes === true || input.stageGroup === 'IVA1' || input.stageGroup === 'IVA2' || input.stageGroup === 'IVB';
    const localizedHighBurden = input.tumorsOrUlcers === true || input.largestLesionCm !== undefined && input.largestLesionCm > 1.5 || input.lesionsCount === 1;
    if (input.priorSkinRT) warnings.push('Önceki cilt RT mevcut; cilt, göz, lens, kemik iliği, spinal kord ve brakiyal pleksus kümülatif dozları değerlendirilmelidir.');
    if (input.subtype === 'sezary-syndrome' || input.bloodInvolvement) warnings.push('Kan tutulumu/Sézary fenotipi için hematoloji, akım sitometrisi ve TCR klonalitesi ile sistemik evreleme gerekir; lokal RT tek başına yeterli değildir.');
    if (input.palpableNodes || input.extracutaneousDisease) warnings.push('Nodal veya ekstrakutanöz hastalıkta PET-CT, uygun biyopsi ve hematopatoloji/hematoloji MDT değerlendirmesi gereklidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'post-treatment') {
      if (input.lesionsGeneralized || input.subtype === 'sezary-syndrome' || advanced) {
        const dose = fraction(24, 12, 'conventional', '24 Gy / 12 fx; seçilmiş yaygın cilt tutulumunda düşük/orta doz TSEBT-TSEI yaklaşımı');
        recommendations.push({
          id: 'advanced-cutaneous-lymphoma',
          label: 'Sistemik tedavi/deri-yönelimli tedavi ve seçilmiş total-skin elektron ışınlaması',
          indication: input.symptomaticDisease ? 'indicated' : 'conditional',
          intent: 'definitive',
          fractionation: input.symptomaticDisease ? dose : undefined,
          targetVolumes: input.symptomaticDisease ? targets(dose, true) : undefined,
          oarConstraints: oars,
          systemicTherapy: [
            systemic('induction', 'MF/SS için deri-yönelimli veya sistemik tedavi', ['ekstrakorporeal fotoferez', 'beksaroten', 'mogamulizumab', 'brentuximab vedotin CD30 pozitifse'], 'Evre, kan tutulumu, CD30 ve önceki tedavilere göre hematoloji MDT ile', '1'),
          ],
          rationale: [
            'Yaygın MF veya Sézary sendromunda sistemik/deri-yönelimli tedavi önceliklidir; TSEBT/TSEI semptomatik cilt yükü veya yaygın plak/tümörlerde seçilmiş konsolidasyon/yanıt tedavisidir.',
            'MAVORIC, mogamulizumabın relaps/refrakter CTCL’de; ALCANZA ise CD30-pozitif CTCL’de brentuximab vedotinin etkinliğini destekler.',
            'Elektif nodal RT rutin değildir; klinik veya görüntüleme ile tutulan nodal/ekstrakutanöz alanlar ayrı hedeflenmelidir.',
          ],
          guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[3]),
        });
        rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional';
        intent = 'definitive';
      } else {
        const dose = fraction(24, 12, 'conventional', '24 Gy / 12 fx; lokalize kutanöz lenfoma');
        recommendations.push({
          id: 'localized-cutaneous-lymphoma',
          label: localizedHighBurden ? 'Lokalize plak/tümör için involved-lesion RT' : 'Lokalize düşük hacimli hastalıkta gözlem, eksizyon veya düşük doz RT',
          indication: localizedHighBurden ? 'indicated' : 'conditional',
          intent: input.setting === 'post-treatment' ? 'adjuvant' : 'curative',
          fractionation: localizedHighBurden ? dose : undefined,
          targetVolumes: localizedHighBurden ? targets(dose) : undefined,
          oarConstraints: localizedHighBurden ? oars : undefined,
          systemicTherapy: input.subtype === 'primary-cutaneous-b-cell' ? [systemic('adjuvant', 'B-hücreli primer kutanöz lenfomada seçilmiş rituksimab', ['rituksimab'], 'Yaygın, multifokal veya RT/eksizyon sonrası relaps riskine göre', '2A')] : undefined,
          rationale: [
            'Lokalize indolent primer kutanöz B-hücreli lenfomada eksizyon veya involved-lesion/site RT; lokalize MF plaklarında lokal RT, fototerapi veya topikal yaklaşım seçilebilir.',
            '24-30 Gy aralığı çoğu lokalize küratif RT için uygulanabilir; çok küçük/palyatif lezyonlarda 4 Gy/2 fx düşük doz şema düşünülebilir.',
            'Marjinler klinik fotoğraf ve palpasyonla belirlenmeli; bolus ile cilt yüzeyi dozu doğrulanmalıdır. Elektif tüm cilt veya nodal ışınlama rutin değildir.',
          ],
          guidelineReferences: references(TRIALS[0], TRIALS[4]),
        });
        rtIndication = localizedHighBurden ? 'indicated' : 'conditional';
        intent = input.setting === 'post-treatment' ? 'adjuvant' : 'curative';
      }
    } else {
      const dose = fraction(8, 2, 'ultra-hypofractionation', '4 Gy / 1-2 fx; seçilmiş düşük hacimli veya semptomatik palyatif odak');
      recommendations.push({
        id: 'relapsed-cutaneous-lymphoma',
        label: 'Relaps/refrakter hastalıkta fokal düşük doz RT ve sistemik tedavi',
        indication: input.symptomaticDisease ? 'indicated' : 'conditional',
        intent: input.setting === 'palliative' ? 'palliative' : 'salvage',
        fractionation: input.symptomaticDisease ? dose : undefined,
        targetVolumes: input.symptomaticDisease ? targets(dose) : undefined,
        oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'Relaps/refrakter CTCL veya CD30-pozitif hastalık için sistemik seçenek', ['mogamulizumab', 'brentuximab vedotin CD30 pozitifse', 'beksaroten veya romidepsin'], 'Önceki tedavi, CD30, kan tutulumu ve performans durumuna göre', '1')],
        rationale: [
          'Relaps veya refrakter kutanöz lenfomada semptomatik küçük lezyonlar 4 Gy/1-2 fx ile hızlı palliasyon sağlayabilir; daha dayanıklı lokal kontrol için 20-30 Gy aralığı seçilebilir.',
          'Re-irradiation yalnızca kümülatif cilt ve kritik organ dozları, tedavi aralığı ve alternatif sistemik tedaviler gözden geçirilerek yapılmalıdır.',
          'RTOG 93-11 ve ILROG doz yaklaşımları lokalize indolent lenfomada involved-field/involved-lesion prensiplerini destekleyen çerçevelerdir; bu sonuçlar her CTCL alt tipine doğrudan genellenmemelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[4]),
      });
      rtIndication = input.symptomaticDisease ? 'indicated' : 'conditional';
      intent = input.setting === 'palliative' ? 'palliative' : 'salvage';
    }
    rationale.push('Bu motor kutanöz T-hücreli ve primer kutanöz B-hücreli lenfomayı kapsar; sistemik evre, histopatoloji, kan/nodal tutulum ve MDT kararı tedavi seçiminin temelidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'skin',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Kutanöz lenfoma için hematopatoloji ve multidisipliner değerlendirme gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, MF/SS TNMB evresi, biyopsi alt tipi, CD30/kan klonalitesi, PET-CT ve önceki RT dozları kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const cutaneousLymphomaEngine = new CutaneousLymphomaDecisionEngine();
