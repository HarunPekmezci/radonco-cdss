import { EngineOutput, CancerType } from './index';

export interface Engine {
  run(data: Record<string, unknown>): EngineOutput;
}

export interface EngineRegistry {
  getCancerTypes(): CancerType[];
}