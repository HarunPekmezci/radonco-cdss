export * from './cdss';

export interface DoseRegimen {
  id?: string;
  categoryRank: string;
  modalityDisplay: string;
  regimenName: string;
  totalDoseGy: number;
  fractionCount: number;
  dosePerFractionGy: number;
  alphaBeta: number;
  bedGy: number;
  eqd2Gy: number;
  targetVolumeCTV: string;
  volumeUnionHierarchy: string;
  gtvToCtvMargin: string;
  ctvToPtvMargin: string;
  boostDoseDetails?: string;
  clinicalIndication: string;
  preferredBadge?: boolean;
}

export interface EngineOutput {
  ajccStage: string;
  stageSummary: string;
  color: string;
  strategy: string;
  systemic: string;
  regimens: DoseRegimen[];
  url: string;
  ref: string;
  roachRisk?: number;
  coreImpact?: string;
}

export type MainCategoryGroup = string;

export interface DiseaseItem {
  id: string;
  name: string;
  subTitle: string;
  group: MainCategoryGroup;
  guidelinePrimary: string;
}