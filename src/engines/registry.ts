import {
  nsclcEngine, sclcEngine, stomachEngine, rectumEngine, prostateEngine, bladderEngine, breastEngine,
  glialTumorEngine, brainMetastasesEngine, nasopharynxEngine, cervixEngine, palliativeRadiotherapyEngine,
  colonEngine, analEngine, gistEngine, liverCancerEngine, kidneyEngine, testisEngine, penileEngine,
  meningiomaEngine, ependymomaEngine, primaryCNSLymphomaEngine, leptomeningealMetastasesEngine,
  metastaticSpinalTumorEngine, primarySpinalCordTumorEngine, oropharynxEngine, hypopharynxEngine,
  oralCavityEngine, salivaryGlandEngine, maxillarySinusEngine, thyroidEngine, endometrialEngine,
  ovaryEngine, uterusEngine, vaginalEngine, vulvarEngine, medulloblastomaEngine, ewingSarcomaEngine,
  acuteLymphoblasticLeukemiaEngine, wilmsTumorEngine, osteosarcomaEngine, chondrosarcomaEngine,
  giantCellTumorEngine, melanomaEngine, bccEngine, skinSccEngine, cutaneousLymphomaEngine, kaposiSarcomaEngine,
  multipleMyelomaEngine, acuteMyeloidLeukemiaEngine, chronicMyeloidLeukemiaEngine,
} from './index';

import type { DecisionEngine } from './base-engine';
import type { ClinicalCaseInput, OrganSystem } from '../types/cdss';

/**
 * UI-facing description of a single editable field in the generic case-input
 * form. This is intentionally minimal (Aşama A / hızlı çözüm): it does not
 * yet encode per-disease clinical fields (whoGrade, gleasonScore, TNM, vb.).
 * Each engine should eventually own a hand-authored formSchema/defaults pair
 * that reflects its real clinical inputs — see AGENTS.md/CLAUDE.md for the
 * planned migration.
 */
export interface CDSSFormField {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
}

/**
 * A DecisionEngine instance augmented with the UI metadata page.tsx needs
 * to render a generic form and seed initial state. `id` is expected to
 * follow the `"<organSystem>.<diseaseSlug>"` convention (e.g. 'cns.meningioma',
 * 'breast.primary') so organSystem/disease can be derived without requiring
 * every engine to expose them separately at runtime.
 */
export type RegisteredEngine = DecisionEngine<ClinicalCaseInput> & {
  formSchema: CDSSFormField[];
  defaults: Record<string, unknown>;
};

const RAW_ENGINES: DecisionEngine<ClinicalCaseInput>[] = [
  nsclcEngine, sclcEngine, stomachEngine, rectumEngine, prostateEngine, bladderEngine, breastEngine,
  glialTumorEngine, brainMetastasesEngine, nasopharynxEngine, cervixEngine, palliativeRadiotherapyEngine,
  colonEngine, analEngine, gistEngine, liverCancerEngine, kidneyEngine, testisEngine, penileEngine,
  meningiomaEngine, ependymomaEngine, primaryCNSLymphomaEngine, leptomeningealMetastasesEngine,
  metastaticSpinalTumorEngine, primarySpinalCordTumorEngine, oropharynxEngine, hypopharynxEngine,
  oralCavityEngine, salivaryGlandEngine, maxillarySinusEngine, thyroidEngine, endometrialEngine,
  ovaryEngine, uterusEngine, vaginalEngine, vulvarEngine, medulloblastomaEngine, ewingSarcomaEngine,
  acuteLymphoblasticLeukemiaEngine, wilmsTumorEngine, osteosarcomaEngine, chondrosarcomaEngine,
  giantCellTumorEngine, melanomaEngine, bccEngine, skinSccEngine, cutaneousLymphomaEngine, kaposiSarcomaEngine,
  multipleMyelomaEngine, acuteMyeloidLeukemiaEngine, chronicMyeloidLeukemiaEngine,
];

/**
 * Extracts the leading "<organSystem>." segment of an engine id.
 * Falls back to 'palliative' (a harmless, always-valid OrganSystem) if an
 * id doesn't follow the expected convention, so a single malformed id can
 * never crash the whole registry.
 */
function deriveOrganSystem(engineId: string): OrganSystem {
  const [organSlug] = engineId.split('.');
  return (organSlug || 'palliative') as OrganSystem;
}

function deriveDisease(engineId: string): string {
  const [, ...rest] = engineId.split('.');
  return rest.join('.') || engineId;
}

const GENERIC_FORM_SCHEMA: CDSSFormField[] = [
  {
    key: 'diagnosis',
    label: 'Tanı / Klinik Not',
    description: 'Serbest metin klinik özet (opsiyonel).',
    type: 'textarea',
  },
];

function toRegisteredEngine(engine: DecisionEngine<ClinicalCaseInput>): RegisteredEngine {
  const organSystem = deriveOrganSystem(engine.id);
  const disease = deriveDisease(engine.id);

  return {
    ...engine,
    formSchema: GENERIC_FORM_SCHEMA,
    defaults: {
      organSystem,
      disease,
      diagnosis: '',
    },
  };
}

export const ENGINE_REGISTRY: RegisteredEngine[] = RAW_ENGINES.map(toRegisteredEngine);

export function getEnginesByOrgan(organ: OrganSystem): RegisteredEngine[] {
  return ENGINE_REGISTRY.filter((engine) => deriveOrganSystem(engine.id) === organ);
}

export function getEngineById(engineId: string): RegisteredEngine | undefined {
  return ENGINE_REGISTRY.find((engine) => engine.id === engineId);
}