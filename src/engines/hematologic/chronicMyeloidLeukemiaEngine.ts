import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type CMLSetting = 'newly-diagnosed' | 'chronic-phase' | 'accelerated-phase' | 'blast-phase' | 'relapsed' | 'post-transplant' | 'surveillance';
export type CMLRisk = 'low' | 'intermediate' | 'high' | 'unknown';
export type CMLMolecularResponse = 'deep-molecular-response' | 'optimal' | 'warning' | 'treatment-failure' | 'unknown';
export type CMLBlastLineage = 'myeloid' | 'lymphoid' | 'mixed' | 'not-applicable' | 'unknown';

export interface ChronicMyeloidLeukemiaInput extends ClinicalCaseInput {
  organSystem: 'hematologic';
  disease: 'chronic-myeloid-leukemia';
  setting: CMLSetting;
  riskGroup?: CMLRisk;
  stage?: TNMStage;
  molecularResponse?: CMLMolecularResponse;
  bcrAblTranscript?: 'e13a2' | 'e14a2' | 'atypical' | 'unknown';
  bcrAblPercentIS?: number;
  blastLineage?: CMLBlastLineage;
  extramedullaryDisease?: boolean;
  myeloidSarcoma?: boolean;
  symptomaticSplenomegaly?: boolean;
  symptomaticBoneDisease?: boolean;
  leukostasis?: boolean;
  priorRadiotherapy?: boolean;
  priorTKIs?: string[];
  transplantEligible?: boolean;
  performanceStatusECOG?: number;
  symptomaticDisease?: boolean;
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Chronic Myeloid Leukemia',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1427',
  evidenceLevel: '2A',
};
const ASTRO: GuidelineReference = {
  organization: 'ASTRO',
  title: 'ASTRO clinical practice resources for hematologic malignancies and palliative radiotherapy',
  url: 'https://www.astro.org/Patient-Care-and-Research/Clinical-Practice-Statements/Clinical-Practice-Guidelines',
  evidenceLevel: 'B',
};
const ESTRO: GuidelineReference = {
  organization: 'ESTRO',
  title: 'ESTRO guidance for radiotherapy in hematologic malignancies and extramedullary disease',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'IRIS: imatinib versus interferon plus cytarabine in newly diagnosed CML', url: 'https://doi.org/10.1056/NEJMoa0104490', evidenceLevel: '1' },
  { organization: 'other', title: 'DASISION: dasatinib versus imatinib in newly diagnosed CML', url: 'https://doi.org/10.1056/NEJMoa1002315', evidenceLevel: '1' },
  { organization: 'other', title: 'ENESTnd: nilotinib versus imatinib in newly diagnosed CML', url: 'https://doi.org/10.1056/NEJMoa0912614', evidenceLevel: '1' },
  { organization: 'other', title: 'European LeukemiaNet recommendations for management of CML', url: 'https://doi.org/10.1038/s41375-020-0776-2', evidenceLevel: 'A' },
  { organization: 'other', title: 'RTOG 0631: stereotactic spine radiotherapy framework, not CML-specific', url: 'https://clinicaltrials.gov/study/NCT00340171', evidenceLevel: '1' },
];

export const CHRONIC_MYeloID_LEUKEMIA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/chronic-myeloid-leukemia-input.json',
  title: 'Chronic myeloid leukemia clinical case input', type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['hematologic'] }, disease: { type: 'string', enum: ['chronic-myeloid-leukemia'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'chronic-phase', 'accelerated-phase', 'blast-phase', 'relapsed', 'post-transplant', 'surveillance'] },
    riskGroup: { type: 'string', enum: ['low', 'intermediate', 'high', 'unknown'] }, stage: { type: 'object', additionalProperties: true },
    molecularResponse: { type: 'string', enum: ['deep-molecular-response', 'optimal', 'warning', 'treatment-failure', 'unknown'] },
    bcrAblTranscript: { type: 'string', enum: ['e13a2', 'e14a2', 'atypical', 'unknown'] }, bcrAblPercentIS: { type: 'number' },
    blastLineage: { type: 'string', enum: ['myeloid', 'lymphoid', 'mixed', 'not-applicable', 'unknown'] },
    extramedullaryDisease: { type: 'boolean' }, myeloidSarcoma: { type: 'boolean' }, symptomaticSplenomegaly: { type: 'boolean' },
    symptomaticBoneDisease: { type: 'boolean' }, leukostasis: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorTKIs: { type: 'array', items: { type: 'string' } }, transplantEligible: { type: 'boolean' },
    performanceStatusECOG: { type: 'number' }, symptomaticDisease: { type: 'boolean' },
  }, additionalProperties: true,
};

export const CHRONIC_MYeloID_LEUKEMIA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'https://radonco.local/schema/chronic-myeloid-leukemia-result.json',
  title: 'Chronic myeloid leukemia CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['hematologic.chronic-myeloid-leukemia'] },
    engineVersion: { type: 'string' }, organSystem: { type: 'string', enum: ['hematologic'] }, rtIndication: { type: 'string' },
    intent: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    warnings: { type: 'array', items: { type: 'string' } }, guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
  }, additionalProperties: true,
};

const fraction = (totalDoseGy: number, fractions: number, className: Fractionation['class'], schedule: string): Fractionation => ({
  class: className, totalDoseGy, fractions, dosePerFractionGy: totalDoseGy / fractions, schedule, technique: fractions <= 5 ? 'IGRT' : 'IMRT',
  alphaBetaTumor: 10, bedGy: totalDoseGy * (1 + totalDoseGy / fractions / 10), eqd2Gy: totalDoseGy * ((totalDoseGy / fractions + 10) / 12),
});
const targets = (dose: Fractionation, spine = false): TargetVolume[] => [
  { name: 'GTV', description: spine ? 'Ekstramedüller/paraspinal miyeloid sarkom veya fokal CML tutulumu.' : 'Görüntülenebilir ekstramedüller, kemik veya splenik semptomatik hedef.', dose, margin: 'PET-CT/MRI, muayene ve hematolojik bağlamla' },
  { name: 'CTV', description: spine ? 'Epidural/paraspinal hastalık ve ilgili kemik kompartımanı.' : 'Makroskopik hedef çevresindeki mikroskopik infiltrasyon alanı.', dose, margin: 'Anatomik bariyerler ve görüntüleme doğruluğuna göre 0.5-1.5 cm' },
  { name: 'PTV', description: 'Kurulum, hareket ve günlük IGRT belirsizliği.', dose, margin: 'Konvansiyonel 5-10 mm; SBRT/omurga 1-3 mm' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Extramedullary CML/spine RT objective' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Abdominal RT planning objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Abdominal/pelvic RT planning objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic extramedullary disease objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class ChronicMyeloidLeukemiaDecisionEngine extends BaseDecisionEngine<ChronicMyeloidLeukemiaInput> {
  public readonly id = 'hematologic.chronic-myeloid-leukemia';
  public readonly version = '1.0.0';
  public readonly inputSchema = CHRONIC_MYeloID_LEUKEMIA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = CHRONIC_MYeloID_LEUKEMIA_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: ChronicMyeloidLeukemiaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const blastPhase = input.setting === 'blast-phase';
    const focalDisease = input.extramedullaryDisease === true || input.myeloidSarcoma === true || input.symptomaticBoneDisease === true;
    const urgent = input.leukostasis === true || input.symptomaticSplenomegaly === true || input.symptomaticDisease === true;
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; spinal kord, böbrek, bağırsak, akciğer ve kemik iliği kümülatif dozları doğrulanmalıdır.');
    if (input.molecularResponse === 'treatment-failure' || input.molecularResponse === 'warning') warnings.push('BCR::ABL1 yanıtı uyarı/başarısızlık düzeyinde; uyum, mutasyon analizi ve TKI değişimi/allo-HSCT değerlendirmesi hematoloji tarafından yapılmalıdır.');
    if (input.leukostasis) warnings.push('Lökostaz hematolojik acildir; lökaferez, sitoredüksiyon ve yoğun bakım/hematoloji yönetimi RT’den önce başlatılmalıdır.');

    if (focalDisease || blastPhase && urgent) {
      const dose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; semptomatik ekstramedüller/miyeloid sarkom hedefi');
      recommendations.push({
        id: 'focal-cml-radiotherapy',
        label: blastPhase ? 'Blast faz KML’de yoğun hematolojik tedaviye ek seçilmiş fokal RT' : 'Ekstramedüller/kemik KML odağı için düşük doz fokal RT ve TKI optimizasyonu',
        indication: 'indicated', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, input.symptomaticBoneDisease), oarConstraints: oars,
        systemicTherapy: [
          systemic('concurrent', 'BCR::ABL1 hedefli TKI tedavisi', ['imatinib/dasatinib/nilotinib veya direnç profiline uygun 2./3. nesil TKI'], 'RT ve blast fazında kemoterapi/ALL-AML benzeri rejimle hematoloji protokolüne göre', '1'),
          ...(input.transplantEligible ? [systemic('adjuvant', 'Allojenik hematopoetik kök hücre nakli değerlendirmesi', ['allo-HSCT'], 'Blast faz, TKI başarısızlığı veya uygun yüksek risk durumunda', '2A')] : []),
        ],
        rationale: [
          'KML’de RT rutin tedavi değildir; semptomatik kemik/ekstramedüller hastalık, miyeloid sarkom, ağrılı splenik alan veya lokal kitle etkisinde hızlı palliasyon sağlar.',
          'Blast fazında RT yalnızca lokal kontrol için destekleyicidir; TKI, lineage-uyumlu yoğun kemoterapi ve uygun hastada allo-HSCT temel tedavidir.',
          'RTOG 0631 stereotaktik spinal kalite çerçevesidir ve KML’ye özgü değildir; spinal SBRT ancak seçilmiş, güvenli ve uzman planlama ile düşünülmelidir.',
        ],
        guidelineReferences: references(TRIALS[0], TRIALS[3], TRIALS[4]),
      });
      rtIndication = 'indicated'; intent = 'palliative';
    } else if (urgent) {
      const dose = fraction(8, 1, 'single-fraction', '8 Gy / 1 fx; semptomatik splenik/kemik veya acil lokal hedef');
      recommendations.push({
        id: 'urgent-cml-palliation', label: 'Acil hematoloji yönetimine ek kısa palyatif RT',
        indication: 'indicated', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose), oarConstraints: oars,
        systemicTherapy: [systemic('induction', 'Acil sitoredüksiyon ve TKI', ['hidroksiüre', 'uygun TKI'], 'Lökostaz/splenik semptom için acil hematoloji protokolü', '1')],
        rationale: ['Acil sistemik sitoredüksiyon ve TKI tedavisi önceliklidir; RT yalnızca semptomatik, güvenli ve sınırlı hedefte eklenir.', 'RT yaygın lökositoz veya kemik iliği hastalığını kontrol etmez; elektif nodal/torasik KRT endikasyonu yoktur.'],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
      });
      rtIndication = 'indicated'; intent = 'palliative';
    } else if (blastPhase || input.setting === 'relapsed') {
      recommendations.push({
        id: 'advanced-cml-no-routine-rt', label: 'Blast/relaps KML’de TKI direnç yönetimi, yoğun tedavi ve nakil değerlendirmesi',
        indication: 'not-indicated', intent: 'salvage',
        systemicTherapy: [systemic('induction', 'Mutasyon ve lineage uyumlu blast faz tedavisi', ['ponatinib veya uygun TKI', 'AML/ALL uyumlu yoğun kemoterapi', 'allo-HSCT uygun hastada'], 'Hematoloji ve transplant MDT ile', '2A')],
        rationale: ['Yaygın blast faz veya kemik iliği relapsında RT sistemik hastalığı tedavi etmez; TKI, yoğun kemoterapi ve allo-HSCT/klinik çalışma önceliklidir.', 'Fokal semptom gelişirse ayrı involved-site RT önerisi oluşturulmalıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[3]),
      });
      rtIndication = 'not-indicated'; intent = 'salvage';
    } else {
      recommendations.push({
        id: 'chronic-phase-cml', label: 'Kronik faz KML’de TKI ile moleküler yanıt takibi; rutin RT yok',
        indication: 'not-indicated', intent: 'curative',
        systemicTherapy: [systemic('maintenance', 'Uzun süreli BCR::ABL1 hedefli TKI', ['imatinib', 'dasatinib', 'nilotinib', 'bosutinib veya asciminib'], 'BCR::ABL1 qPCR ile 3 aylık/kurum protokolü izlem; derin yanıt ve seçilmiş tedavisiz remisyon', '1')],
        rationale: ['Kronik faz KML’de imatinib veya ikinci nesil TKI ile moleküler yanıt temel tedavidir; RT veya cerrahi primer tedavi değildir.', 'ELN kriterleriyle moleküler yanıt, TKI uyumu, yan etki ve BCR::ABL1 mutasyonları izlenmelidir.', 'EGFR/ALK hedefli tedaviler KML’de uygun değildir; hedef BCR::ABL1 kinazıdır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'not-indicated'; intent = 'curative';
    }
    rationale.push('Bu motor KML’de hematoloji, transplant, enfeksiyon hastalıkları ve radyasyon onkolojisi MDT kararını destekler; RT seçilmiş fokal palliasyon içindir ve TKI/allo-HSCT’nin yerine geçmez.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'hematologic',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'KML için hematoloji MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO ve ELN sürümü, BCR::ABL1 qPCR trendi, mutasyon analizi, blast lineage, ekstramedüller görüntüleme, TKI öyküsü ve nakil uygunluğu doğrulanmalıdır.'],
      confidence: 0.9, guidelineReferences: references(...TRIALS),
    };
  }
}

export const chronicMyeloidLeukemiaEngine = new ChronicMyeloidLeukemiaDecisionEngine();
