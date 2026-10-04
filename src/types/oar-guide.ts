export type OARRegion =
  | 'kranial'
  | 'bas-boyun'
  | 'toraks'
  | 'abdomen'
  | 'pelvis'
  | 'omurilik';

export type OARFractionation =
  | 'konvansiyonel'
  | 'hipofraksiyon'
  | 'sbrt-2fx'
  | 'sbrt-3fx'
  | 'sbrt-5fx'
  | 'srs-1fx'
  | 'srs-3fx';

export type OARPriority = 'hard' | 'soft';

export interface OARNTPCeiling {
  id: string;
  organ: string;
  region: OARRegion;
  fractionation: OARFractionation;
  metric: string;
  limit: string;
  limitType?: 'volume' | 'dose' | 'mean' | 'max';
  numericThreshold?: number; // e.g., 20 for V20Gy, 54 for Dmax
  unit?: 'Gy' | '%' | 'cc';
  endpoint: string;
  priority: OARPriority;
  alphaBeta?: number;
  source: string;
  sourceUrl?: string;
  context: string;
}

export type OARGuideItem = OARNTPCeiling;
