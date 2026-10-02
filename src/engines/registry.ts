import type { ClinicalCaseInput, CDSSResult, JsonSchema, OrganSystem } from '../types/cdss';
import type { DecisionEngine } from './base-engine';
import * as boneEngines from './bone';
import * as cnsEngines from './cns';
import * as gisEngines from './gis';
import * as gusEngines from './gus';
import * as gynecologyEngines from './gynecology';
import * as headNeckEngines from './head-neck';
import * as hematologicEngines from './hematologic';
import * as palliativeEngines from './palliative';
import * as pediatricEngines from './pediatric-age';
import * as skinEngines from './skin';
import * as thoraxEngines from './thorax';

export interface CDSSFormField {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
}

export interface RegisteredEngine {
  id: string;
  version: string;
  name: string;
  organSystem: OrganSystem;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  defaults: Record<string, unknown>;
  formSchema: CDSSFormField[];
  evaluate(input: Record<string, unknown>): CDSSResult;
  toLLMContext(input: Record<string, unknown>, result?: CDSSResult): string;
}

const organSystems: readonly OrganSystem[] = [
  'gis', 'gus', 'thorax', 'head-neck', 'cns', 'gynecology', 'sarcoma', 'liver',
  'palliative', 'pediatric-age', 'bone', 'hematologic', 'breast', 'skin',
];

function isOrganSystem(value: unknown): value is OrganSystem {
  return typeof value === 'string' && organSystems.includes(value as OrganSystem);
}

function isDecisionEngine(value: unknown): value is DecisionEngine<ClinicalCaseInput> {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<DecisionEngine<ClinicalCaseInput>>;
  return typeof candidate.id === 'string'
    && typeof candidate.version === 'string'
    && typeof candidate.evaluate === 'function'
    && typeof candidate.toLLMContext === 'function'
    && typeof candidate.inputSchema === 'object'
    && typeof candidate.outputSchema === 'object';
}

function initialValue(schema: JsonSchema): unknown {
  if (schema.enum?.length) return schema.enum[0];
  if (schema.type === 'boolean') return false;
  if (schema.type === 'number') return 0;
  if (schema.type === 'object') return {};
  if (schema.type === 'array') return [];
  return '';
}

function labelFor(key: string, schema: JsonSchema): string {
  return schema.title ?? key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (firstLetter) => firstLetter.toLocaleUpperCase());
}

function registerEngine<Input extends ClinicalCaseInput>(engine: DecisionEngine<Input>): RegisteredEngine {
  const properties = engine.inputSchema.properties ?? {};
  const organSystem = properties.organSystem?.enum?.find(isOrganSystem);

  if (!organSystem) {
    throw new Error(`Engine ${engine.id} has no valid organSystem in its input schema.`);
  }

  const defaults = Object.fromEntries(
    Object.entries(properties).map(([key, schema]) => [key, initialValue(schema)]),
  );
  const formSchema = Object.entries(properties)
    .filter(([key, schema]) => key !== 'organSystem' && key !== 'disease' && ['string', 'number', 'boolean'].includes(schema.type))
    .map(([key, schema]): CDSSFormField => ({
      key,
      label: labelFor(key, schema),
      description: schema.description,
      type: schema.enum?.length ? 'select' : schema.type === 'number' ? 'number' : schema.type === 'boolean' ? 'boolean' : 'text',
      options: schema.enum?.map((value) => ({ value, label: value })),
    }));

  return {
    id: engine.id,
    version: engine.version,
    name: engine.inputSchema.title ?? engine.id,
    organSystem,
    inputSchema: engine.inputSchema,
    outputSchema: engine.outputSchema,
    defaults,
    formSchema,
    evaluate: (input) => engine.evaluate(input as Input),
    toLLMContext: (input, result) => engine.toLLMContext(input as Input, result),
  };
}

const engineModules = [
  boneEngines,
  cnsEngines,
  gisEngines,
  gusEngines,
  gynecologyEngines,
  headNeckEngines,
  hematologicEngines,
  palliativeEngines,
  pediatricEngines,
  skinEngines,
  thoraxEngines,
];

const engines = engineModules
  .flatMap((module) => Object.values(module))
  .filter(isDecisionEngine)
  .map(registerEngine);

export const ENGINE_REGISTRY = Object.fromEntries(
  engines.map((engine) => [engine.id, engine]),
) as Record<string, RegisteredEngine>;

export function getEnginesByOrgan(organ: OrganSystem): RegisteredEngine[] {
  return Object.values(ENGINE_REGISTRY).filter((engine) => engine.organSystem === organ);
}