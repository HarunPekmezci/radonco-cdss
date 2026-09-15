import { BaseDecisionEngine } from '../base-engine';
import type {
  CDSSResult, ClinicalCaseInput, ClinicalRecommendation, Fractionation,
  GuidelineReference, JsonSchema, OARConstraint, SystemicTherapyRecommendation,
  TargetVolume, TNMStage,
} from '../../types/cdss';

export type MultipleMyelomaSetting = 'newly-diagnosed' | 'postoperative' | 'maintenance' | 'relapsed' | 'palliative' | 'surveillance';
export type MultipleMyelomaDiseasePattern = 'solitary-plasmacytoma' | 'systemic-myeloma' | 'oligosecretory' | 'extramedullary' | 'unknown';
export type MultipleMyelomaRisk = 'standard-risk' | 'high-risk' | 'ultra-high-risk' | 'unknown';
export type MultipleMyelomaSite = 'spine' | 'skull' | 'pelvis' | 'long-bone' | 'rib' | 'soft-tissue' | 'other';

export interface MultipleMyelomaInput extends ClinicalCaseInput {
  organSystem: 'hematologic';
  disease: 'multiple-myeloma';
  setting: MultipleMyelomaSetting;
  diseasePattern?: MultipleMyelomaDiseasePattern;
  riskGroup?: MultipleMyelomaRisk;
  stage?: TNMStage;
  primarySite?: MultipleMyelomaSite;
  boneLesionsCount?: number;
  lyticLesion?: boolean;
  plasmacytoma?: boolean;
  marrowInvolvement?: boolean;
  extramedullaryDisease?: boolean;
  spinalCordCompression?: boolean;
  epiduralDisease?: boolean;
  pathologicFracture?: boolean;
  impendingFracture?: boolean;
  neurologicDeficit?: boolean;
  renalImpairment?: boolean;
  hypercalcemia?: boolean;
  priorRadiotherapy?: boolean;
  priorSystemicTherapy?: string[];
  transplantEligible?: boolean;
  symptomaticDisease?: boolean;
  performanceStatusECOG?: number;
  molecularFindings?: string[];
}

const NCCN: GuidelineReference = {
  organization: 'NCCN',
  title: 'NCCN Clinical Practice Guidelines in Oncology: Multiple Myeloma',
  version: 'Current version; verify institutional subscription before use',
  url: 'https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1410',
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
  title: 'ESTRO recommendations for radiotherapy in hematologic malignancies and myeloma',
  url: 'https://www.estro.org/Science/Guidelines',
  evidenceLevel: 'B',
};
const TRIALS: GuidelineReference[] = [
  { organization: 'other', title: 'International Myeloma Working Group consensus on radiotherapy in multiple myeloma', url: 'https://doi.org/10.1016/S1470-2045(19)30175-4', evidenceLevel: 'B' },
  { organization: 'other', title: 'FIRST: lenalidomide-dexamethasone in newly diagnosed multiple myeloma', url: 'https://doi.org/10.1056/NEJMoa1113448', evidenceLevel: '1' },
  { organization: 'other', title: 'MAIA: daratumumab plus lenalidomide-dexamethasone in transplant-ineligible myeloma', url: 'https://doi.org/10.1056/NEJMoa1905763', evidenceLevel: '1' },
  { organization: 'other', title: 'GMMG-HD7: isatuximab with VRd in transplant-eligible myeloma', url: 'https://doi.org/10.1056/NEJMoa2106247', evidenceLevel: '1' },
  { organization: 'other', title: 'RTOG 0631: stereotactic spine radiotherapy quality framework, not myeloma-specific', url: 'https://clinicaltrials.gov/study/NCT00340171', evidenceLevel: '1' },
];

export const MULTIPLE_MYELOMA_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/multiple-myeloma-input.json',
  title: 'Multiple myeloma clinical case input', type: 'object',
  required: ['organSystem', 'disease', 'setting'],
  properties: {
    organSystem: { type: 'string', enum: ['hematologic'] }, disease: { type: 'string', enum: ['multiple-myeloma'] },
    setting: { type: 'string', enum: ['newly-diagnosed', 'postoperative', 'maintenance', 'relapsed', 'palliative', 'surveillance'] },
    diseasePattern: { type: 'string', enum: ['solitary-plasmacytoma', 'systemic-myeloma', 'oligosecretory', 'extramedullary', 'unknown'] },
    riskGroup: { type: 'string', enum: ['standard-risk', 'high-risk', 'ultra-high-risk', 'unknown'] },
    stage: { type: 'object', additionalProperties: true }, primarySite: { type: 'string' },
    boneLesionsCount: { type: 'number' }, lyticLesion: { type: 'boolean' }, plasmacytoma: { type: 'boolean' },
    marrowInvolvement: { type: 'boolean' }, extramedullaryDisease: { type: 'boolean' },
    spinalCordCompression: { type: 'boolean' }, epiduralDisease: { type: 'boolean' },
    pathologicFracture: { type: 'boolean' }, impendingFracture: { type: 'boolean' }, neurologicDeficit: { type: 'boolean' },
    renalImpairment: { type: 'boolean' }, hypercalcemia: { type: 'boolean' }, priorRadiotherapy: { type: 'boolean' },
    priorSystemicTherapy: { type: 'array', items: { type: 'string' } }, transplantEligible: { type: 'boolean' },
    symptomaticDisease: { type: 'boolean' }, performanceStatusECOG: { type: 'number' },
    molecularFindings: { type: 'array', items: { type: 'string' } },
  }, additionalProperties: true,
};

export const MULTIPLE_MYELOMA_OUTPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/multiple-myeloma-result.json',
  title: 'Multiple myeloma CDSS result', type: 'object',
  required: ['schemaVersion', 'engineId', 'engineVersion', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] }, engineId: { type: 'string', enum: ['hematologic.multiple-myeloma'] },
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
  { name: 'GTV', description: spine ? 'MRI ile görülen kemik, epidural veya paraspinal miyelom odağı.' : 'Ağrılı litik lezyon, plazmasitom veya ekstramedüller miyelom odağı.', dose, margin: 'MRI/PET-CT, kemik BT ve klinik ağrı alanıyla' },
  { name: 'CTV', description: spine ? 'Tutulan vertebra ve gerekli epidural/paraspinal uzanım; stabilite ve spinal kanal ilişkisine göre.' : 'Lezyon çevresindeki kemik ve yumuşak doku mikroskopik hastalık alanı.', dose, margin: 'Konvansiyonel hedefte 0.5-1.5 cm; SBRT’de görüntüleme ve IGRT ile daraltılmış' },
  { name: 'PTV', description: 'Kurulum, solunum/hareket ve günlük IGRT belirsizliği.', dose, margin: 'Konvansiyonel 5-10 mm; spinal SBRT/SRS 1-3 mm' },
];
const oars: OARConstraint[] = [
  { organ: 'Spinal cord', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Myeloma spinal RT objective; cumulative dose required' },
  { organ: 'Kidneys', metric: 'Dmean', limit: 18, unit: 'Gy', priority: 'optimal', source: 'protocol', sourceReference: 'Abdominal/plasma cell RT planning objective' },
  { organ: 'Bowel', metric: 'Dmax', limit: 45, unit: 'Gy', priority: 'mandatory', source: 'protocol', sourceReference: 'Abdominal/pelvic myeloma RT objective' },
  { organ: 'Lung', metric: 'V20', limit: 30, unit: '%', priority: 'optimal', source: 'QUANTEC', sourceReference: 'Thoracic plasmacytoma planning objective' },
  { organ: 'Brainstem/optic pathways', metric: 'Dmax', limit: 54, unit: 'Gy', priority: 'mandatory', source: 'QUANTEC', sourceReference: 'Cranial plasmacytoma objective' },
];
const systemic = (setting: SystemicTherapyRecommendation['setting'], regimen: string, agents: string[], timing: string, evidenceLevel: SystemicTherapyRecommendation['evidenceLevel'] = '1'): SystemicTherapyRecommendation => ({ setting, regimen, agents, timing, evidenceLevel });
const references = (...extra: GuidelineReference[]): GuidelineReference[] => [NCCN, ASTRO, ESTRO, ...extra];

export class MultipleMyelomaDecisionEngine extends BaseDecisionEngine<MultipleMyelomaInput> {
  public readonly id = 'hematologic.multiple-myeloma';
  public readonly version = '1.0.0';
  public readonly inputSchema = MULTIPLE_MYELOMA_INPUT_JSON_SCHEMA;
  public readonly outputSchema = MULTIPLE_MYELOMA_OUTPUT_JSON_SCHEMA;
  public constructor() { super('1.0.0'); }

  protected evaluateCase(input: MultipleMyelomaInput): CDSSResult {
    const recommendations: ClinicalRecommendation[] = [];
    const rationale: string[] = [];
    const warnings: string[] = [];
    let rtIndication: CDSSResult['rtIndication'] = 'not-indicated';
    let intent: CDSSResult['intent'] = 'observation';
    const urgent = input.spinalCordCompression === true || input.epiduralDisease === true || input.neurologicDeficit === true;
    const solitary = input.diseasePattern === 'solitary-plasmacytoma' || input.plasmacytoma === true && input.marrowInvolvement !== true;
    if (input.priorRadiotherapy) warnings.push('Önceki RT mevcut; spinal kord, böbrek, bağırsak, akciğer ve kemik iliği kümülatif dozları doğrulanmalıdır.');
    if (input.pathologicFracture || input.impendingFracture) warnings.push('Patolojik veya impending kırıkta ortopedi/spinal cerrahi değerlendirmesi; RT mekanik stabilitenin yerini tutmaz.');
    if (input.renalImpairment || input.hypercalcemia) warnings.push('Renal yetmezlik/hiperkalsemi mevcut; nefroloji ve hematoloji ile acil sıvı, antiresorptif ve sistemik tedavi optimizasyonu gerekir.');

    if (solitary && !input.marrowInvolvement) {
      const dose = fraction(45, 25, 'conventional', '45 Gy / 25 fx; soliter plazmasitom definitif RT');
      recommendations.push({
        id: 'solitary-plasmacytoma', label: 'Soliter plazmasitom için definitif involved-site RT ve hematolojik evreleme',
        indication: 'indicated', intent: 'definitive', fractionation: dose, targetVolumes: targets(dose), oarConstraints: oars,
        rationale: ['Soliter plazmasitomda tam vücut görüntüleme, kemik iliği değerlendirmesi ve monoklonal protein izlemi tamamlanmalıdır.', '45-50 Gy aralığında involved-site RT yüksek lokal kontrol sağlar; elektif nodal veya torasik kemoradyoterapi gerekmez.', 'Rezidüel sistemik hastalık gelişimi için hematoloji takibi ve gerekirse sistemik tedavi planı gerekir.'],
        guidelineReferences: references(TRIALS[0]),
      });
      rtIndication = 'indicated'; intent = 'definitive';
    } else if (urgent) {
      const dose = fraction(20, 5, 'moderate-hypofractionation', '20 Gy / 5 fx; spinal kord/epidural bası veya nörolojik tehdit');
      recommendations.push({
        id: 'urgent-myeloma-spine', label: 'Acil steroid, spinal cerrahi değerlendirmesi ve hızlı miyelom RT',
        indication: 'indicated', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, true), oarConstraints: oars,
        systemicTherapy: [systemic('concurrent', 'Acil miyelom sistemik tedavisi', ['bortezomib içeren rejim', 'dexamethasone'], 'RT ve cerrahi değerlendirme ile eşzamanlı hematoloji protokolü', '1')],
        rationale: ['Spinal kord/epidural basıda kontrastlı tüm spinal MRI, nöroşirürji-ortopedi görüşü ve kortikosteroid geciktirilmemelidir.', 'RT 20 Gy/5 fx veya yaşam beklentisi kısa hastada 8 Gy/1 fx olarak seçilebilir; mekanik instabilite cerrahi gerektirir.', 'Sistemik miyelom yükü bortezomib ve steroid temelli tedaviyle hızla kontrol edilmeye çalışılır.'],
        guidelineReferences: references(TRIALS[0], TRIALS[4]),
      });
      rtIndication = 'indicated'; intent = 'palliative';
    } else if (input.symptomaticDisease || input.lyticLesion || input.setting === 'palliative' || input.setting === 'relapsed') {
      const dose = fraction(input.performanceStatusECOG !== undefined && input.performanceStatusECOG > 2 ? 8 : 20, input.performanceStatusECOG !== undefined && input.performanceStatusECOG > 2 ? 1 : 5, input.performanceStatusECOG !== undefined && input.performanceStatusECOG > 2 ? 'single-fraction' : 'moderate-hypofractionation', input.performanceStatusECOG !== undefined && input.performanceStatusECOG > 2 ? '8 Gy / 1 fx; ağrılı litik lezyon ve kısa yaşam beklentisi' : '20 Gy / 5 fx; ağrılı litik lezyon veya plazmasitom');
      recommendations.push({
        id: 'symptomatic-myeloma', label: 'Ağrılı litik lezyon/plazmasitom için fokal palyatif RT ve sistemik miyelom tedavisi',
        indication: 'indicated', intent: 'palliative', fractionation: dose, targetVolumes: targets(dose, input.primarySite === 'spine'), oarConstraints: oars,
        systemicTherapy: [systemic('palliative', 'Miyelom için proteazom inhibitörü/IMiD/anti-CD38 tabanlı tedavi', ['bortezomib', 'lenalidomid', 'daratumumab', 'dexamethasone'], 'Hastalık yükü, renal fonksiyon, transplant uygunluğu ve önceki tedaviye göre', '1')],
        rationale: ['Palyatif RT ağrı, impending kırık, lokal tümör kütlesi ve seçilmiş ekstramedüller odaklarda hızlı semptom kontrolü sağlar.', 'RT hacmi semptomatik lezyonla sınırlanmalı; elektif nodal ışınlama ve lokal ileri torasik 60-66 Gy kemoradyoterapisi miyelom için uygun değildir.', 'RTOG 0631 stereotaktik spinal kalite çerçevesidir; miyelomda SBRT yalnızca seçilmiş oligolezyon ve uzman planlama ile düşünülür.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[4]),
      });
      rtIndication = 'indicated'; intent = 'palliative';
    } else {
      recommendations.push({
        id: 'systemic-myeloma', label: 'Sistemik miyelomda hematoloji liderliğinde çoklu ajan tedavi; rutin RT yok',
        indication: 'not-indicated', intent: 'curative',
        systemicTherapy: [systemic('induction', 'Transplant uygunluğuna göre VRd/anti-CD38 tabanlı indüksiyon', ['bortezomib', 'lenalidomid', 'dexamethasone', 'daratumumab veya isatuximab'], 'İndüksiyon, kök hücre toplama/otolog nakil ve idame fazlarıyla', '1')],
        rationale: ['Yaygın kemik iliği tutulumlu miyelomda RT sistemik hastalığı kontrol etmez; hematoloji protokolü ve kemik hedefli ajanlar temel tedavidir.', 'RT yalnızca ağrılı, kırık riski taşıyan, spinal/epidural veya lokal kitle etkili lezyonlarda eklenir.', 'Cerrahi yalnızca stabilizasyon, dekompresyon veya seçilmiş fokal lezyon kontrolü içindir; R0/R1/R2 kavramı miyelomda primer cerrahi gibi rutin uygulanmaz.'],
        guidelineReferences: references(TRIALS[0], TRIALS[1], TRIALS[2], TRIALS[3]),
      });
      rtIndication = 'not-indicated'; intent = 'curative';
    }
    rationale.push('Bu motor multiple myelomda hematoloji, spinal/ortopedik cerrahi, radyasyon onkolojisi, nefroloji ve palyatif bakım MDT kararını destekler; RT sistemik miyelom tedavisinin yerine geçmez.');
    return {
      schemaVersion: '1.0', engineId: this.id, engineVersion: this.version, caseId: input.caseId, organSystem: 'hematologic',
      rtIndication, intent, summary: recommendations[0]?.label ?? 'Multiple myelom için hematoloji MDT değerlendirmesi gerekir.',
      recommendations, rationale, warnings,
      uncertainties: ['Aktif NCCN/ASTRO/ESTRO sürümü, kemik iliği/plazma hücre yükü, SPEP/FLC, MRI/PET-CT, spinal stabilite, renal fonksiyon, önceki RT ve sistemik tedavi doğrulanmalıdır.'],
      confidence: 0.9, guidelineReferences: references(...TRIALS),
    };
  }
}

export const multipleMyelomaEngine = new MultipleMyelomaDecisionEngine();
