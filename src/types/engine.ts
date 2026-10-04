import { EngineOutput, CancerType } from './index';

export interface Engine {
  run(data: Record<string, any>): EngineOutput;
}

export interface EngineRegistry {
  getCancerTypes(): CancerType[];
}