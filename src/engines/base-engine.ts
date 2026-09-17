import {
  CDSS_INPUT_JSON_SCHEMA,
  CDSS_RESULT_JSON_SCHEMA,
  CDSSResult,
  ClinicalCaseInput,
  JsonSchema,
  toLLMContext as serializeLLMContext,
} from '../types/cdss';
import { getRegimenCatalog } from '../data/regimenCatalog';

export interface DecisionEngine<Input extends ClinicalCaseInput = ClinicalCaseInput> {
  readonly id: string;
  readonly version: string;
  readonly inputSchema: JsonSchema;
  readonly outputSchema: JsonSchema;
  evaluate(input: Input): CDSSResult;
  toLLMContext(input: Input, result?: CDSSResult): string;
}

/**
 * Synchronous, deterministic boundary for every organ-specific decision engine.
 * Clinical engines implement evaluateCase and return the canonical CDSS result.
 */
export abstract class BaseDecisionEngine<Input extends ClinicalCaseInput = ClinicalCaseInput>
  implements DecisionEngine<Input>
{
  public abstract readonly id: string;
  public readonly version: string;
  public readonly inputSchema = CDSS_INPUT_JSON_SCHEMA;
  public readonly outputSchema = CDSS_RESULT_JSON_SCHEMA;

  protected constructor(version = '1.0.0') {
    this.version = version;
  }

  public evaluate(input: Input): CDSSResult {
    this.assertInput(input);
    const result = this.evaluateCase(input);

    if (result.engineId !== this.id || result.engineVersion !== this.version) {
      throw new Error(`Engine ${this.id} returned a result with inconsistent metadata.`);
    }
    if (result.organSystem !== input.organSystem) {
      throw new Error(`Engine ${this.id} returned a result for another organ system.`);
    }
    const catalog = result.alternativeDoseSchemes ?? getRegimenCatalog(this.id);
    return catalog ? { ...result, alternativeDoseSchemes: catalog } : result;
  }

  public toLLMContext(input: Input, result?: CDSSResult): string {
    return serializeLLMContext(result ? { input, result } : input);
  }

  protected abstract evaluateCase(input: Input): CDSSResult;

  private assertInput(input: Input): void {
    if (!input || typeof input !== 'object') {
      throw new TypeError('CDSS engine input must be an object.');
    }
    if (!input.organSystem || !input.disease) {
      throw new TypeError('CDSS engine input requires organSystem and disease.');
    }
  }
}

export abstract class BaseEngine<Input extends ClinicalCaseInput = ClinicalCaseInput>
  extends BaseDecisionEngine<Input> {}
