/**
 * Canonical domain contract shared by clinical engines, the UI and local LLM
 * adapters. Values are intentionally serializable and do not depend on React.
 */

export type OrganSystem =
  | 'gis'
  | 'gus'
  | 'thorax'
  | 'head-neck'
  | 'cns'
  | 'gynecology'
  | 'sarcoma'
  | 'liver'
  | 'palliative'
  | 'pediatric-age'
  | 'bone'
  | 'hematologic'
  | 'breast'
  | 'skin'
  | 'emergencies';

export type TNMEdition = 'AJCC_8' | 'AJCC_9' | 'FIGO_2018' | 'OTHER';
export type TNMComponent = string;

export interface TNMStage {
  edition: TNMEdition;
  t?: TNMComponent;
  n?: TNMComponent;
  m?: TNMComponent;
  stageGroup?: string;
  assessedAt?: string;
  source?: 'clinical' | 'pathological' | 'radiological' | 'mixed';
}

export type RiskCategory =
  | 'very-low'
  | 'low'
  | 'favorable-intermediate'
  | 'unfavorable-intermediate'
  | 'high'
  | 'very-high'
  | 'standard'
  | 'poor'
  | 'unknown';

export interface RiskClassification {
  system: string;
  category: RiskCategory | string;
  label?: string;
  criteria?: string[];
  score?: number;
  scoreName?: string;
}

export type SurgicalMargin = 'R0' | 'R1' | 'R2' | 'RX' | 'not-applicable';
export type LymphadenectomyExtent =
  | 'D1'
  | 'D2'
  | 'selective'
  | 'radical'
  | 'sentinel'
  | 'not-performed'
  | 'not-applicable';

export interface SurgicalStatus {
  performed: boolean;
  procedure?: string;
  margin: SurgicalMargin;
  marginSites?: string[];
  lymphadenectomy?: LymphadenectomyExtent;
  nodesExamined?: number;
  nodesPositive?: number;
}

export interface PatientContext {
  age?: number;
  sex?: 'female' | 'male' | 'intersex' | 'unknown';
  performanceStatus?: {
    scale: 'ECOG' | 'KPS' | 'WHO';
    value: number;
  };
  lifeExpectancyYears?: number;
  comorbidities?: string[];
  organFunction?: Record<string, string | number | boolean>;
  preferences?: string[];
}

export interface ClinicalCaseInput {
  caseId?: string;
  organSystem: OrganSystem;
  disease: string;
  diagnosis?: string;
  staging?: TNMStage;
  risk?: RiskClassification[];
  pathology?: Record<string, string | number | boolean | null>;
  surgery?: SurgicalStatus;
  patient?: PatientContext;
  imaging?: Record<string, string | number | boolean | null>;
  priorTreatment?: string[];
  clinicalFlags?: Record<string, boolean | string | number | null>;
  metadata?: Record<string, string | number | boolean | null>;
}

export type RTIndication =
  | 'indicated'
  | 'not-indicated'
  | 'conditional'
  | 'contraindicated'
  | 'consider';

export type TreatmentIntent =
  | 'curative'
  | 'adjuvant'
  | 'neoadjuvant'
  | 'definitive'
  | 'palliative'
  | 'prophylactic'
  | 'salvage'
  | 'observation';

export type FractionationClass =
  | 'conventional'
  | 'accelerated-hyperfractionation'
  | 'moderate-hypofractionation'
  | 'ultra-hypofractionation'
  | 'SBRT'
  | 'SRS'
  | 'brachytherapy'
  | 'single-fraction';

export interface Fractionation {
  class: FractionationClass;
  totalDoseGy: number;
  fractions: number;
  dosePerFractionGy: number;
  schedule?: string;
  technique?: '3D-CRT' | 'IMRT' | 'VMAT' | 'IGRT' | 'SIB' | 'adaptive' | 'other';
  alphaBetaTumor?: number;
  alphaBetaLate?: number;
  eqd2Gy?: number;
  eqd2LateGy?: number;
  bedGy?: number;
  bedLateGy?: number;
}

export type TCPDosePrescription = Fractionation;

export type TargetVolumeName = 'GTV' | 'CTV' | 'ITV' | 'PTV' | 'PRV' | 'OAR';

export interface TargetVolume {
  name: TargetVolumeName | string;
  description?: string;
  dose?: TCPDosePrescription;
  margin?: string;
  includedStructures?: string[];
  excludedStructures?: string[];
}

export interface TCPTargetPrescription {
  targetVolume: TargetVolume;
  dose: TCPDosePrescription;
}

export type ConstraintMetric = 'Dmax' | 'D0.03cc' | 'D1cc' | 'D2cc' | 'Dmean' | 'Vx' | 'V20' | 'V30';

export type OARSourceReference =
  | 'QUANTEC'
  | 'HyTEC'
  | 'RTOG_0617'
  | 'RTOG_0813'
  | 'RTOG_0933'
  | 'protocol'
  | 'institutional'
  | 'other';

export interface OARNTPCeiling {
  organ: string;
  metric: ConstraintMetric | string;
  limit: number;
  unit: 'Gy' | 'cGy' | '%' | 'cc' | 'Gy/fraction';
  volume?: number;
  priority?: 'mandatory' | 'optimal' | 'acceptable';
  source: OARSourceReference;
  sourceReference?: string;
}

export type OARConstraint = OARNTPCeiling;

export interface SystemicTherapyRecommendation {
  setting: 'concurrent' | 'adjuvant' | 'neoadjuvant' | 'induction' | 'maintenance' | 'palliative';
  regimen: string;
  agents?: string[];
  timing?: string;
  evidenceLevel?: EvidenceLevel;
  optional?: boolean;
}

export type EvidenceLevel = '1' | '2A' | '2B' | '3' | 'A' | 'B' | 'C' | 'expert-consensus';

export interface GuidelineReference {
  organization: 'NCCN' | 'ASTRO' | 'ESTRO' | 'ESMO' | 'EANO' | 'FIGO' | 'other';
  title: string;
  version?: string;
  url: string;
  evidenceLevel?: EvidenceLevel;
  recommendationClass?: string;
}

export interface ClinicalRecommendation {
  id: string;
  label: string;
  indication: RTIndication;
  intent: TreatmentIntent;
  fractionation?: TCPDosePrescription;
  targetVolumes?: TargetVolume[];
  targetPrescriptions?: TCPTargetPrescription[];
  oarConstraints?: OARNTPCeiling[];
  systemicTherapy?: SystemicTherapyRecommendation[];
  rationale: string[];
  guidelineReferences?: GuidelineReference[];
  evidenceObj?: RegimenEvidence;
  philosophy?: 'ultra_hypo' | 'moderate_hypo' | 'conventional' | 'sib_boost';
}

export interface EvidenceLink {
  authority: 'NCCN' | 'ASTRO' | 'ESTRO' | 'RTOG' | 'NRG';
  title: string;
  url: string;
  category?: string; // e.g., "Kategori 1", "Consensus Guideline", "Phase II Protocol"
  customBadge?: string;
}

export interface RegimenEvidence {
  nccn: {
    pdfUrl: string;
    targetPage: number;
    sectionCode: string; // e.g. "NSCL-C", "BINV-I", "PROS-E", "HEAD-F", "REC-E", "BRAIN-A", "CERV-A"
    sectionTitle: string; // e.g. "Principles of Radiation Therapy"
  };
  astro?: {
    title: string;
    url: string; // Verified permanent DOI or official ASTRO guideline URL
  };
  estro?: {
    title: string;
    url: string; // Verified permanent DOI or Green Journal / PubMed URL
  };
  landmarkTrial?: {
    shortName: string; // e.g. "RTOG 0236", "RTOG 0617", "START-B", "CHHiP", "RTOG 0522", "EORTC 22981"
    citation: string; // e.g. "JAMA 2010", "Lancet Oncol 2015"
    doiUrl: string; // Direct DOI resolver link (e.g. https://doi.org/10.1016/...)
  };
}

/**
 * A clinically usable alternative fractionation scheme.  Catalog entries are
 * deliberately self-contained so they can be displayed or exported without
 * re-running an engine.
 */
export interface AlternativeDoseScheme {
  id: string;
  label: string;
  intent: TreatmentIntent;
  indication?: string;
  fractionation: TCPDosePrescription;
  targetDescription: string;
  evidence: GuidelineReference[];
  evidenceLinks?: EvidenceLink[];
  evidenceObj?: RegimenEvidence;
  oarProfile: OARNTPCeiling[];
  notes?: string[];
  philosophy?: 'ultra_hypo' | 'moderate_hypo' | 'conventional' | 'sib_boost';
}

export interface RegimenCatalog {
  schemes: AlternativeDoseScheme[];
  defaultSchemeId?: string;
}

export interface CDSSResult {
  schemaVersion: '1.0';
  engineId: string;
  engineVersion: string;
  caseId?: string;
  organSystem: OrganSystem;
  rtIndication: RTIndication;
  intent: TreatmentIntent;
  summary: string;
  recommendations: ClinicalRecommendation[];
  rationale: string[];
  warnings?: string[];
  uncertainties?: string[];
  confidence?: number;
  generatedAt?: string;
  llmContext?: string;
  guidelineReferences: GuidelineReference[];
  alternativeDoseSchemes?: RegimenCatalog;
}

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: string[];
  additionalProperties?: boolean | JsonSchema;
}

export const CDSS_INPUT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cdss-input.json',
  title: 'CDSS clinical case input',
  type: 'object',
  required: ['organSystem', 'disease'],
  properties: {
    organSystem: { type: 'string' },
    disease: { type: 'string' },
    diagnosis: { type: 'string' },
    staging: { type: 'object', additionalProperties: true },
    risk: { type: 'array', items: { type: 'object', additionalProperties: true } },
    surgery: { type: 'object', additionalProperties: true },
    patient: { type: 'object', additionalProperties: true },
    clinicalFlags: { type: 'object', additionalProperties: true },
    metadata: { type: 'object', additionalProperties: true },
  },
  additionalProperties: true,
};

export const CDSS_RESULT_JSON_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://radonco.local/schema/cdss-result.json',
  title: 'CDSS recommendation result',
  type: 'object',
  required: ['schemaVersion', 'engineId', 'organSystem', 'rtIndication', 'intent', 'summary', 'recommendations'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    engineId: { type: 'string' },
    engineVersion: { type: 'string' },
    organSystem: { type: 'string' },
    rtIndication: { type: 'string' },
    intent: { type: 'string' },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    rationale: { type: 'array', items: { type: 'string' } },
    guidelineReferences: { type: 'array', items: { type: 'object', additionalProperties: true } },
    alternativeDoseSchemes: { type: 'object', additionalProperties: true },
  },
  additionalProperties: true,
};

export function toLLMContext(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
