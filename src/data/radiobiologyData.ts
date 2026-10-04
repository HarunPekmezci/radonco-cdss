export type AlphaBetaPreset = {
  id: string;
  kind: 'tcp-target' | 'oar-ntcp-ceiling';
  label_tr: string;
  label_en: string;
  value: number;
};

export const presets = [
  { id: 'acute-tumor', kind: 'tcp-target', label_tr: 'Akut Doku / Standart Tümör (α/β = 10 Gy)', label_en: 'Acute Tissue / Standard Tumor (α/β = 10 Gy)', value: 10 },
  { id: 'late-oar', kind: 'oar-ntcp-ceiling', label_tr: 'Geç doku / Genel OAR (α/β = 3.0 Gy)', label_en: 'Late tissue / General OAR (α/β = 3.0 Gy)', value: 3 },
  { id: 'prostate', kind: 'tcp-target', label_tr: 'Prostat Adenokarsinom (α/β = 1.5 Gy)', label_en: 'Prostate Adenocarcinoma (α/β = 1.5 Gy)', value: 1.5 },
  { id: 'melanoma', kind: 'tcp-target', label_tr: 'Melanom (α/β = 2.5 Gy)', label_en: 'Melanoma (α/β = 2.5 Gy)', value: 2.5 },
  { id: 'rcc', kind: 'tcp-target', label_tr: 'Böbrek Hücreli / RCC (α/β = 2.6 Gy)', label_en: 'Renal Cell / RCC (α/β = 2.6 Gy)', value: 2.6 },
  { id: 'breast', kind: 'tcp-target', label_tr: 'Meme Kanseri (α/β = 4.0 Gy)', label_en: 'Breast Cancer (α/β = 4.0 Gy)', value: 4 },
  { id: 'colorectal', kind: 'tcp-target', label_tr: 'Kolorektal Kanser (α/β = 5.0 Gy)', label_en: 'Colorectal AdenoCA (α/β = 5.0 Gy)', value: 5 },
  { id: 'lens', kind: 'oar-ntcp-ceiling', label_tr: 'Lens / Katarakt (α/β = 1.2 Gy)', label_en: 'Lens / Cataract (α/β = 1.2 Gy)', value: 1.2 },
  { id: 'cns-cord', kind: 'oar-ntcp-ceiling', label_tr: 'MSS / Spinal Kord (α/β = 2.0 Gy)', label_en: 'CNS / Spinal Cord (α/β = 2.0 Gy)', value: 2 },
  { id: 'colon-oar', kind: 'oar-ntcp-ceiling', label_tr: 'Kolon & Bağırsak OAR (α/β = 3.0 Gy)', label_en: 'Colon & Bowel OAR (α/β = 3.0 Gy)', value: 3 },
] satisfies AlphaBetaPreset[];

export const baselinePresetIds = new Set(['acute-tumor', 'late-oar']);
export const tumorPresetIds = new Set(['prostate', 'melanoma', 'rcc', 'breast', 'colorectal']);
export const oarPresetIds = new Set(['lens', 'cns-cord', 'colon-oar']);

export const fractionCounts = [1, 3, 5, 8, 10, 15, 20, 25, 28, 30, 35];

export type TCPTargetBenchmark = {
  id: string;
  title_tr: string;
  title_en: string;
  benchmark_tr: string;
  benchmark_en: string;
  source: string;
  alphaBeta: number;
  targetEqd2: number;
};

export type OARNTPCeilingReference = {
  id: string;
  title_tr: string;
  title_en: string;
  limits_tr: string;
  limits_en: string;
};

export const tumorTargetAtlas = [
  {
    id: 'lung-sbrt',
    title_tr: 'Erken Evre KHDAK SBRT',
    title_en: 'Early-stage NSCLC SBRT',
    benchmark_tr: 'BED₁₀ ≥ 100 Gy · Onishi et al.; 3 yıllık lokal kontrol >%90',
    benchmark_en: 'BED₁₀ ≥ 100 Gy · Onishi et al.; >90% 3-year local control',
    source: 'Onishi et al.',
    alphaBeta: 10,
    targetEqd2: 100 / (1 + 2 / 10),
  },
  {
    id: 'prostate-definitive',
    title_tr: 'Prostat Adenokarsinom (Definitif)',
    title_en: 'Prostate AdenoCA (Definitive)',
    benchmark_tr: 'EQD2₁.₅ ≥ 78–80 Gy · Doz eskalasyonu çalışmaları',
    benchmark_en: 'EQD2₁.₅ ≥ 78–80 Gy · Dose-escalation trials',
    source: 'Dose-escalation trials',
    alphaBeta: 1.5,
    targetEqd2: 78,
  },
  {
    id: 'cervix-hrctv',
    title_tr: 'Serviks Karsinomu (EBRT + BT HR-CTV)',
    title_en: 'Cervix Carcinoma (EBRT + BT HR-CTV)',
    benchmark_tr: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    benchmark_en: 'EQD2₁₀ ≥ 85–90 Gy · EMBRACE II',
    source: 'EMBRACE II',
    alphaBeta: 10,
    targetEqd2: 85,
  },
  {
    id: 'breast-adjuvant',
    title_tr: 'Meme Kanseri (Adjuvan)',
    title_en: 'Breast Cancer (Adjuvant)',
    benchmark_tr: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    benchmark_en: 'EQD2₄ ≈ 46–50 Gy · FAST-Forward / START-B',
    source: 'FAST-Forward / START-B',
    alphaBeta: 4,
    targetEqd2: 46,
  },
  {
    id: 'head-neck',
    title_tr: 'Baş-Boyun Skuamöz Hücreli Karsinom (Definitif)',
    title_en: 'Head & Neck SCC (Definitive)',
    benchmark_tr: 'EQD2₁₀ ≥ 70 Gy',
    benchmark_en: 'EQD2₁₀ ≥ 70 Gy',
    source: 'Conventional definitive radiotherapy',
    alphaBeta: 10,
    targetEqd2: 70,
  },
  {
    id: 'glioblastoma',
    title_tr: 'Glioblastom (Stupp)',
    title_en: 'Glioblastoma (Stupp)',
    benchmark_tr: 'EQD2₁₀ = 60 Gy · Yaşlılarda hipofraksiyon ≈ 42 Gy',
    benchmark_en: 'EQD2₁₀ = 60 Gy · Elderly hypofractionation ≈ 42 Gy',
    source: 'Stupp regimen',
    alphaBeta: 10,
    targetEqd2: 60,
  },
  {
    id: 'bone-palliation',
    title_tr: 'Kemik Metastazı Palyatif',
    title_en: 'Palliative Bone Metastasis',
    benchmark_tr: '4 Gy × 5: EQD2₁₀ ≈ 23.3 Gy · 8 Gy × 1: EQD2₁₀ = 12 Gy',
    benchmark_en: '4 Gy × 5: EQD2₁₀ ≈ 23.3 Gy · 8 Gy × 1: EQD2₁₀ = 12 Gy',
    source: 'Palliative fractionation schedules',
    alphaBeta: 10,
    targetEqd2: 20,
  },
  {
    id: 'colorectal-short-course',
    title_tr: 'Kolorektal / Rektum Kısa Dönem (RAPIDO)',
    title_en: 'Colorectal / Rectal Short-Course (RAPIDO)',
    benchmark_tr: 'Toplam 25 Gy (5 Gy × 5 fx) · EQD2₅ = 35.7 Gy · BED₅ = 50.0 Gy',
    benchmark_en: 'Total 25 Gy (5 Gy × 5 fx) · EQD2₅ = 35.7 Gy · BED₅ = 50.0 Gy',
    source: 'RAPIDO',
    alphaBeta: 5,
    targetEqd2: 35.7,
  },
  {
    id: 'colorectal-long-course',
    title_tr: 'Rektum Standart Uzun Dönem KRT',
    title_en: 'Rectal Standard Long-Course CRT',
    benchmark_tr: 'Toplam 50.4 Gy (1.8 Gy × 28 fx) · EQD2₁₀ = 49.6 Gy',
    benchmark_en: 'Total 50.4 Gy (1.8 Gy × 28 fx) · EQD2₁₀ = 49.6 Gy',
    source: 'Standard long-course chemoradiotherapy',
    alphaBeta: 10,
    targetEqd2: 49.6,
  },
  {
    id: 'colorectal-oligometastases',
    title_tr: 'Kolorektal Oligometastaz SBRT',
    title_en: 'Colorectal Oligometastasis SBRT',
    benchmark_tr: 'BED₁₀ ≥ 100 Gy · Radyorezistan metastazlarda ablasyon',
    benchmark_en: 'BED₁₀ ≥ 100 Gy · Ablative local control for radioresistant metastases',
    source: 'Colorectal oligometastasis SBRT',
    alphaBeta: 10,
    targetEqd2: 100 / (1 + 2 / 10),
  },
] satisfies readonly TCPTargetBenchmark[];

export const oarThresholds = [
  {
    id: 'spinal-cord',
    title_tr: 'Omurilik',
    title_en: 'Spinal Cord',
    limits_tr: 'Konvansiyonel: D2% < 45–50 Gy · 1 fx SRS: Dmax < 13–14 Gy',
    limits_en: 'Conventional: D2% < 45–50 Gy · 1 fx SRS: Dmax < 13–14 Gy',
  },
  {
    id: 'brainstem',
    title_tr: 'Beyin Sapı',
    title_en: 'Brainstem',
    limits_tr: 'Konvansiyonel: Dmax < 54 Gy · 1 fx SRS: D0.035cc < 10 Gy',
    limits_en: 'Conventional: Dmax < 54 Gy · 1 fx SRS: D0.035cc < 10 Gy',
  },
  {
    id: 'optic-apparatus',
    title_tr: 'Optik Kiazma / Sinirler',
    title_en: 'Optic Chiasm / Nerves',
    limits_tr: 'Konvansiyonel: D2% < 54–55 Gy · 1 fx SRS: Dmax < 8–10 Gy',
    limits_en: 'Conventional: D2% < 54–55 Gy · 1 fx SRS: Dmax < 8–10 Gy',
  },
  {
    id: 'bilateral-lung',
    title_tr: 'Bilateral Akciğer',
    title_en: 'Bilateral Lung',
    limits_tr: 'V20Gy < 30–35% · Ortalama akciğer dozu < 20 Gy',
    limits_en: 'V20Gy < 30–35% · Mean lung dose < 20 Gy',
  },
  {
    id: 'heart',
    title_tr: 'Kalp',
    title_en: 'Heart',
    limits_tr: 'Ortalama doz < 20 Gy (memede < 4–5 Gy) · V30Gy < 45%',
    limits_en: 'Mean dose < 20 Gy (breast: < 4–5 Gy) · V30Gy < 45%',
  },
  {
    id: 'rectum',
    title_tr: 'Rektum',
    title_en: 'Rectum',
    limits_tr: 'V70Gy < 15–20% · V50Gy < 50%',
    limits_en: 'V70Gy < 15–20% · V50Gy < 50%',
  },
  {
    id: 'small-bowel-colon',
    title_tr: 'İnce Bağırsak / Kolon',
    title_en: 'Small Bowel / Colon',
    limits_tr: 'V45Gy < 195 cc · D2% < 50 Gy',
    limits_en: 'V45Gy < 195 cc · D2% < 50 Gy',
  },
] satisfies readonly OARNTPCeilingReference[];
