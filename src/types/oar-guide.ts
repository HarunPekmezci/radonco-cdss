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
  | 'srs-1fx';

export type OARPriority = 'hard' | 'soft';

export interface OARGuideItem {
  id: string;
  organ: string;
  region: OARRegion;
  fractionation: OARFractionation;
  metric: string;
  limit: string;
  endpoint: string;
  priority: OARPriority;
  alphaBeta?: number;
  source: string;
  sourceUrl?: string;
  context: string;
}
