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

export type KaposiSetting = 'newly-diagnosed' | 'localized' | 'disseminated' | 'relapsed' | 'palliative';
export type KaposiSubtype = 'HIV-associated' | 'classic' | 'iatrogenic-transplant' | 'endemic-African' | 'unknown';
export type KaposiStage = 'T0-good-risk' | 'T1-poor-risk' | 'unknown';
export type KaposiSurgery = 'excision' | 'biopsy' | 'debulking' | 'none' | 'unknown';
export type KaposiMolecularFinding = 'HHV8-positive' | 'HHV8-unknown' | 'none';

export interface KaposiSarcomaInput extends ClinicalCaseInput {
  organSystem: 'skin';
  disease: 'kaposi-sarcoma';
  setting: KaposiSetting;
  subtype?: KaposiSubtype;
  stage?: TNMStage;
  stageGroup?: KaposiStage;
  surgeryType?: KaposiSurgery;
  surgicalMargin?: 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
  hivPositive?: boolean;
  cd4Count?: number;
  viralLoadSuppressed?: boolean;
  transplantRecipient?: boolean;
  immunosuppressiveDrug?: string;
  lesionsCount?: number;
  largestLesionCm?: number;
  lesionsGeneralized?: boolean;
  visceralDisease?: boolean;
  edemaOrPain?: boolean;
  bleedingOrUlceration?: boolean;
  pulmonaryDisease?: boolean;
  priorSkinRT?: boolean;
  priorSystemicTherapy?: string[];
  performanceStatusECOG?: number;
  molecularFinding?: KaposiMolecularFinding;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: AIDS-Related Kaposi Sarcoma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1450',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for skin and lymphoma radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance and consensus statements for skin and haematologic malignancy radiotherapy',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'WHO/Global Initiative for AIDS: Kaposi sarcoma treatment guidance', url: 'https://www.who.int/publications/i/item/9789240050353', evidenceLevel: 'B' },
  { organization: 'other', title: 'Radiotherapy for classic and AIDS-related Kaposi sarcoma: international dose and technique experience', url: 'https://doi.org/10.1016/S0360-3016(01)01626-7', evidenceLevel: '2B' },
  { organization: 'other', title: 'Liposomal doxorubicin versus standard chemotherapy for advanced AIDS-related Kaposi sarcoma', url: 'https://doi.org/10.1056/NEJM199708073370602', evidenceLevel: '1' },
  { organization: 'other', title: 'ART and chemotherapy outcomes in AIDS-related Kaposi sarcoma', url: 'https://doi.org/10.1056/NEJMoa0401389', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 93-11: involved-field radiotherapy dose framework for indolent cutaneous malignancies', url: 'https://clinicaltrials.gov/study/NCT00003173', evidenceLevel: '2B' },
];

export const KAPOSI_SARCOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/kaposi-sarcoma-input.json',
  title: 'Kaposi sarcoma clinical case input',
  type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['skin'] },
    disease: { type: 'string', enum: ['kaposi-sarcoma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'localized', 'disseminated', 'relapsed', 'palliative'] },
    subtype: { type: 'string', enum: ['HIV-associated', 'classic', 'iatrogenic-transplant', 'endemic-African', 'unknown'] },
    stage: { type: 'object', additionalProperties: true },
    stageGroup: { type: 'string', enum: ['T0-good-risk', 'T1-poor-risk', 'unknown'] },
    surgeryType: { type: 'string' },
    surgicalMargin: { type: 'string', enum: ['R0', 'R1', 'R2', 'RX', 'not-applicable'] },
    hivPositive: { type: 'boolean' }, cd4Count: { type: 'number' }, viralLoadSuppressed: { type: 'boolean' },
    transplantRecipient: { type: 'boolean' }, immunosuppressiveDrug: { type: 'string' },
    lesionsCount: { type: 'number' }, largestLesionCm: { type: 'number' }, lesionsGeneralized: { type: 'boolean' },
    visceralDisease: { type: 'boolean' }, edemaOrPain: { type: 'boolean' }, bleedingOrUlceration: { type: 'boolean' },
    pulmonaryDisease: { type: 'boolean' }, priorSkinRT: { type: 'boolean' },
    priorSystemicTherapy: { type: 'array', items: { type: 'string' } },
    performanceStatusECOG: { type: 'number' }, molecularFinding: { type: 'string' },
  },
  additionalProperties: true,
};

export const KAPOSI_SARCOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/kaposi-sarcoma-result.json',
  title: 'Kaposi sarcoma CDSS result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['skin.kaposi-sarcoma'] },
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
  technique: fractions === 1 || fractions <= 5 ? 'IGRT' : 'electrons/photons' as Fractionation['technique'],
  alphaBetaTumor: 10,
  bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10),
  eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});

const targets = (dose: Fractionation, extensive = false): TargetVolume[] => [
  { name: 'GTV', description: extensive ? 'Görünür/palpabl tüm kutanöz lezyonlar ve gerekirse semptomatik nodal/visseral odak.' : 'Klinik ve fotoğrafik olarak tanımlanmış Kaposi lezyonu.', dose, margin: 'Dermatolojik muayene, fotoğraf, palpasyon ve gerekli görüntülemeye göre' },
  { name: 'CTV', description: extensive ? 'Teknik olarak güvenli şekilde kapsanabilen yaygın cilt alanı veya tutulan nodal/visseral hedef.' : 'GTV çevresindeki subklinik dermal yayılım ve ödemli komşu alan.', dose, margin: 'Genellikle 1-1.5 cm; anatomik bariyerler, cilt elastikiyeti ve ILROG/kurum protokolüne göre' },
  { name: 'PTV', description: 'Yüzeyel tedavi için kurulum, bolus ve cilt hareketi belirsizliğini kapsayan hacim.', dose, margin: 'Genellikle 3-5 mm; günlük görüntüleme ve bolus ile doğrulanır' },
];

const oars: OARConstraint[] = [
  { organ: 'Lens', metric: 'Dmax', limit: 6, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Periocular Kaposi sarcoma RT objective' },
  { organ: 'Eye', metric: 'Dmean', limit: 30, unit: 'Gy', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Periocular skin RT objective' },
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Nodal or paraspinal RT objective' },
  { organ: 'Bone marrow', metric: 'Dmean', limit: 20, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Extensive-field Kaposi RT planning objective' },
  { organ: 'Brachial plexus', metric: 'Dmax', limit: 66, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Cervical/axillary nodal field objective' },
];

const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '2A'): SystemicTherapyRecommendation => ({
  setting, regimen, agents, timing, evidenceLevel,
});
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class KaposiSarcomaDecisionEngine extends BaseDecisionEngine<KaposiSarcomaInput> {
  public readonly id = 'skin.kaposi-sarcoma';
  public readonly version = '1.0.0';
  public readonly inputSchema = KAPOSI_SARCOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = KAPOSI_SARCOMA_OUTPUT_JSON_SCHEMA;

  public constructor() {
    super('1.0.0');
  }

  protected evaluateCase(input: KaposiSarcomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const extensive = input.lesionsGeneralized === true || input.visceralDisease === true || input.pulmonaryDisease === true || input.setting === 'disseminated';
    const symptomatic = input.edemaOrPain === true || input.bleedingOrUlceration === true;
    const transplant = input.transplantRecipient === true || input.subtype === 'iatrogenic-transplant';

    if (input.priorSkinRT) warnings.push('Önceki cilt RT mevcut; cilt, göz, lens, kemik iliği, spinal kord ve brakiyal pleksus kümülatif dozları değerlendirilmelidir.');
    if (input.hivPositive && input.viralLoadSuppressed !== true) warnings.push('HIV viremisyonu kontrol altında değil; enfeksiyon hastalıkları ile ART başlanması/optimizasyonu ve CD4/viral yük takibi gerekir.');
    if (input.cd4Count !== undefined && input.cd4Count < 200) warnings.push('CD4 <200 hücre/µL; fırsatçı enfeksiyon profilaksisi, ART ve sistemik tedavi toleransı enfeksiyon hastalıkları/hematoloji ile değerlendirilmelidir.');
    if (input.pulmonaryDisease || input.visceralDisease) warnings.push('Pulmoner veya visseral tutulumda PET-CT/toraks görüntüleme, biyopsi gereksinimi ve sistemik tedavi önceliği multidisipliner olarak belirlenmelidir.');
    if (transplant) warnings.push('Transplant ilişkili Kaposi sarkomunda immünsüpresyon azaltılması veya mTOR inhibitörüne geçiş transplant ekibiyle; greft güvenliği korunarak değerlendirilmelidir.');

    if (input.setting === 'newly-diagnosed' || input.setting === 'localized') {
      const dose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; lokalize semptomatik veya kozmetik açıdan önemli Kaposi lezyonu');
      recommendations.push({
        id: 'localized-kaposi-sarcoma',
        label: symptomatic ? 'Lokalize Kaposi lezyonuna involved-lesion RT ve altta yatan nedenin tedavisi' : 'ART/immünsüpresyon yönetimi ve seçilmiş lokal tedavi',
        indication: symptomatic ? 'indicated' : 'conditional',
        intent: 'definitive',
        fractionation: symptomatic ? dose : undefined,
        targetVolumes: symptomatic ? targets(dose) : undefined,
        oarConstraints: symptomatic ? oars : undefined,
        systemicTherapy: [
          ...(input.hivPositive ? [systemic('concurrent', 'HIV için kombine antiretroviral tedavi (ART)', ['kuruma uygun ART rejimi'], 'Tanı ile birlikte; etkileşimler ve IRIS riski izlenerek', '1')] : []),
          ...(transplant ? [systemic('maintenance', 'İmmünsüpresyon azaltılması veya mTOR inhibitörü yaklaşımı', ['sirolimus/everolimus; transplant protokolüne göre'], 'Transplant ekibi ve greft fonksiyonu ile birlikte', '2A')] : []),
        ],
        rationale: [
          'Lokalize Kaposi sarkomunda RT yüksek lokal yanıt sağlar; semptomatik, kanayan, ağrılı, ödem oluşturan veya kozmetik/fonksiyonel açıdan önemli lezyonlarda involved-lesion yaklaşımı tercih edilir.',
          'HIV ilişkili hastalıkta ART temel tedavidir; yalnızca torasik SBRT, eşzamanlı 60-66 Gy kemoradyoterapi veya elektif nodal ışınlama Kaposi için rutin değildir.',
          '20 Gy/5 fx veya 30 Gy/10 fx gibi şemalar sık kullanılan seçeneklerdir; çok küçük lezyonlarda 8 Gy tek fraksiyon veya 4 Gy/2 fx düşünülebilir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2]),
      });
      rtIndication = symptomatic ? 'indicated' : 'conditional';
      intent = 'definitive';
    } else if (extensive || input.setting === 'relapsed') {
      const dose = fraction(8, 1, 'single-fraction', '8 Gy / 1 fx; seçilmiş küçük semptomatik lezyon');
      recommendations.push({
        id: 'advanced-kaposi-sarcoma',
        label: 'Yaygın/relaps Kaposi sarkomunda sistemik tedavi, ART ve seçilmiş fokal palyatif RT',
        indication: symptomatic ? 'indicated' : 'conditional',
        intent: 'palliative',
        fractionation: symptomatic ? dose : undefined,
        targetVolumes: symptomatic ? targets(dose) : undefined,
        oarConstraints: symptomatic ? oars : undefined,
        systemicTherapy: [
          ...(input.hivPositive ? [systemic('concurrent', 'ART optimizasyonu', ['kuruma uygun ART rejimi'], 'Sistemik Kaposi tedavisiyle birlikte etkileşim kontrolü', '1')] : []),
          systemic('palliative', 'Yaygın/semptomatik hastalıkta sistemik kemoterapi', ['pegile liposomal doxorubicin', 'paclitaxel; önceki tedavi ve organ fonksiyonuna göre'], 'Hematoloji/enfeksiyon hastalıkları MDT ile', '1'),
        ],
        rationale: [
          'Yaygın kutanöz, pulmoner veya visseral hastalıkta RT tek başına uygun değildir; sistemik tedavi ve altta yatan immünolojik/HIV durumunun kontrolü önceliklidir.',
          'Pegile liposomal doxorubicin ve paclitaxel ileri AIDS ilişkili Kaposi sarkomunda temel sistemik seçeneklerdir; RT kanayan/ağrılı/ödemli odaklarda semptom kontrolü sağlar.',
          'Pulmoner Kaposi’de bronşiyal veya akciğer hedeflerine RT kararı ciddi toksisite, kanama ve enfeksiyon riskiyle birlikte göğüs hastalıkları/hematoloji MDT’sinde verilmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[2], TRIALS[3]),
      });
      rtIndication = symptomatic ? 'indicated' : 'conditional';
      intent = 'palliative';
    } else {
      const dose = fraction(30, 10, 'conventional', '30 Gy / 10 fx; lokal salvage veya kalıcı semptom kontrolü');
      recommendations.push({
        id: 'recurrent-kaposi-sarcoma',
        label: 'Relaps/refrakter Kaposi sarkomunda salvage RT ve sistemik tedavi',
        indication: symptomatic ? 'indicated' : 'conditional',
        intent: 'salvage',
        fractionation: symptomatic ? dose : undefined,
        targetVolumes: symptomatic ? targets(dose) : undefined,
        oarConstraints: symptomatic ? oars : undefined,
        systemicTherapy: [systemic('palliative', 'Önceki tedaviye göre liposomal doxorubicin veya paclitaxel', ['pegile liposomal doxorubicin', 'paclitaxel'], 'Relaps yükü, HIV/immünsüpresyon ve performans durumuna göre', '1')],
        rationale: [
          'Relaps Kaposi sarkomunda lokal semptomatik odaklar salvage RT ile tedavi edilebilir; çok odaklı relapsta sistemik tedavi gerekir.',
          'Re-irradiation yalnızca kümülatif cilt ve kritik organ dozları, tedavi aralığı ve alternatif sistemik seçenekler gözden geçirilerek yapılmalıdır.',
          'RTOG 93-11, Kaposi’ye özgü bir çalışma değildir; yalnızca düşük doz/involved-field lenfoid RT için tarihsel bir planlama çerçevesidir ve doğrudan kanıt olarak yorumlanmamalıdır.',
        ],
        guidelineReferences: references(TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = symptomatic ? 'indicated' : 'conditional';
      intent = 'salvage';
    }
    rationale.push('Bu motor HIV ilişkili, klasik, endemik ve iatrojenik/transplant ilişkili Kaposi sarkomunu kapsar; HHV-8 doğrulaması, HIV/immünsüpresyon yönetimi ve hematoloji-enfeksiyon hastalıkları-transplant MDT’si gereklidir.');
    return {
      schemaVersion: '1.0',
      engineId: this.id,
      engineVersion: this.version,
      caseId: input.caseId,
      organSystem: 'skin',
      rtIndication,
      intent,
      summary: recommendations[0]?.label ?? 'Kaposi sarkomu için dermatoloji, hematoloji ve ilgili MDT değerlendirmesi gerekir.',
      recommendations,
      rationale,
      warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, HHV-8 patolojisi, HIV viral yük/CD4, transplant immünsüpresyonu, visseral hastalık ve önceki RT dozları kurum içinde doğrulanmalıdır.'],
      confidence: 0.84,
      guidelineReferences: references(...TRIALS),
    };
  }
}

export const kaposiSarcomaEngine = new KaposiSarcomaDecisionEngine();
