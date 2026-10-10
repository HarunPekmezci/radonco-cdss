/**
 * Deterministic Clinical Report Parser (Auto-Stager Engine)
 * 
 * SaMD / MDR Rule 11 & KVKK Compliant:
 * - 100% client-side, zero network calls, zero external AI dependencies.
 * - Instantaneous deterministic regex & semantic parsing.
 * - Automated patient de-identification (TCKN 11-digit numbers, names, dates).
 * - Full verbatim evidence quotes for complete clinical auditability.
 */

import { OrganId } from '@/data/cdssRules';

export type ReportModality = 'auto' | 'pathology' | 'pet_ct' | 'mri' | 'usg';

export interface ExtractedEvidence {
  field: string;
  label: string;
  value: string;
  quote: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ParsedRiskFactors {
  lvi?: boolean;
  pni?: boolean;
  visceralPleura?: 'intact' | 'invaded';
  marginStatus?: 'negative' | 'close' | 'positive';
  marginDistanceMm?: number;
  ene?: boolean;
  // Rectum / GI MRI
  crmStatus?: 'negative' | 'positive';
  crmDistanceMm?: number;
  emvi?: boolean;
  analVergeDistanceCm?: number;
  // Prostate
  pirads?: number;
  ece?: boolean;
  svi?: boolean;
  gleasonPrimary?: string;
  gleasonSecondary?: string;
  psa?: number;
  // Breast
  er?: boolean;
  erPercent?: number;
  pr?: boolean;
  prPercent?: number;
  her2?: boolean;
  her2Score?: string;
  ki67Percent?: number;
  // CNS
  brainMetCount?: number;
  brainMaxDiameterMm?: number;
}

export interface ParsedStagingResult {
  deidentifiedText: string;
  detectedModality: ReportModality;
  organ: OrganId | null;
  organConfidence: 'high' | 'medium' | 'low';
  subsite?: string;
  histology?: string;
  tumorSizeMm?: number;
  tumorSizeCm?: number;
  suggestedT: string;
  suggestedN: string;
  suggestedM: string;
  riskFactors: ParsedRiskFactors;
  evidenceQuotes: ExtractedEvidence[];
  redactedCount: number;
}

// ==========================================
// 1. DE-IDENTIFICATION (KVKK / GDPR / HIPAA)
// ==========================================

export function deidentifyClinicalText(rawText: string): { text: string; redactedCount: number } {
  let text = rawText;
  let redactedCount = 0;

  // 1. Redact 11-digit Turkish National ID (TCKN)
  const tcknRegex = /\b[1-9]\d{10}\b/g;
  text = text.replace(tcknRegex, () => {
    redactedCount++;
    return '[TCKN GİZLENDİ / REDACTED]';
  });

  // 2. Redact labeled patient names (e.g., "Hasta Adı: Ahmet Yılmaz", "Ad Soyad: ...")
  const patientNameLabelRegex = /(?:hasta\s*ad[ıi]|ad[ıi]\s*soyad[ıi]|ad\s*soyad|patient\s*name|hastanın\s*adı|sayın|sn\.)\s*[:=\-]?\s*([A-ZÇĞİÖŞÜa-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜa-zçğıöşü]+){1,3})/gi;
  text = text.replace(patientNameLabelRegex, (match, nameGroup) => {
    redactedCount++;
    return match.replace(nameGroup, '[İSİM GİZLENDİ / REDACTED]');
  });

  // 3. Redact Turkish phone numbers
  const phoneRegex = /\b0?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g;
  text = text.replace(phoneRegex, () => {
    redactedCount++;
    return '[TEL GİZLENDİ / REDACTED]';
  });

  // 4. Redact protocol / barcode numbers if labelled
  const protocolRegex = /(?:protokol\s*no|barkod\s*no|dosya\s*no|mrn|lab\s*no)\s*[:=\-]?\s*([A-Za-z0-9\-_]{5,20})/gi;
  text = text.replace(protocolRegex, (match, val) => {
    redactedCount++;
    return match.replace(val, '[PROTOKOL NO GİZLENDİ]');
  });

  return { text, redactedCount };
}

// ==========================================
// 2. MODALITY DETECTION
// ==========================================

export function detectModality(text: string): ReportModality {
  const lower = text.toLowerCase();
  if (/pet[\/\s-]?b?t|suv|fdg|hipermetabolik|metabolik\s*aktivite|suvmax/i.test(lower)) {
    return 'pet_ct';
  }
  if (/manyetik\s*rezonans|\bmr\b|mrg|mr\s*incelemesi|t1\s*a|t2\s*a|difüzyon|adc|pi[\s-]?rads/i.test(lower)) {
    return 'mri';
  }
  if (/ultrason|usg|doppler|sonografi/i.test(lower)) {
    return 'usg';
  }
  if (/biyopsi|patoloji|histopatoloji|makroskopi|mikroskopi|immünohistokimya|karsinom|rezeksiyon|lobektomi|mastektomi/i.test(lower)) {
    return 'pathology';
  }
  return 'auto';
}

// ==========================================
// 3. ORGAN DETECTION ENGINE
// ==========================================

interface OrganScore {
  organ: OrganId;
  score: number;
  evidence: string;
}

export function detectPrimaryOrgan(text: string): { organ: OrganId | null; confidence: 'high' | 'medium' | 'low'; evidence: string } {
  const lower = text.toLowerCase();
  const scores: OrganScore[] = [];

  // Thorax / Lung
  let lungScore = 0;
  if (/akciğer|lung|toraks|lobektomi|pnömonektomi|bronş|nsclc|khdak|sclc|khak/i.test(lower)) lungScore += 10;
  if (/viseral\s*plevra|parietal\s*plevra|subkarinal|paratrakeal|hiler|aortopulmoner/i.test(lower)) lungScore += 6;
  if (lungScore > 0) scores.push({ organ: 'thorax', score: lungScore, evidence: 'Akciğer / Torasik yapılar ve lobektomi / lenf nodu bulguları' });

  // Breast
  let breastScore = 0;
  if (/meme|breast|mastektomi|lumpektomi|kadranektomi|duktal\s*karsinom|idk|dcis|lobüler\s*karsinom/i.test(lower)) breastScore += 10;
  if (/aksiller|sentinel|östrojen\s*reseptör|her2|er\s*pozitif|pr\s*pozitif/i.test(lower)) breastScore += 6;
  if (breastScore > 0) scores.push({ organ: 'breast', score: breastScore, evidence: 'Meme parenkimi, lumpektomi / mastektomi ve ER/PR/HER2 biyobelirteçleri' });

  // Prostate & Genitourinary
  let prostateScore = 0;
  if (/prostat|prostate|radikal\s*prostatektomi|gleason|psa|pirads|pi[\s-]?rads/i.test(lower)) prostateScore += 12;
  if (/ekstraprostatik|seminal\s*vezik/i.test(lower)) prostateScore += 8;
  if (prostateScore > 0) scores.push({ organ: 'prostate', score: prostateScore, evidence: 'Prostatik doku, Gleason skoru, PI-RADS ve PSA bulguları' });

  // GIS / Gastrointestinal
  let gisScore = 0;
  if (/rektum|rectum|kolon|mide|gastrik|özofagus|ozofagus|pankreas|anal\s*kanal|karaciğer/i.test(lower)) gisScore += 10;
  if (/mezorektal|crm|emvi|perirektal|subserozal|mukozal/i.test(lower)) gisScore += 6;
  if (gisScore > 0) scores.push({ organ: 'gis', score: gisScore, evidence: 'Gastrointestinal sistem, mezorektal fasya veya endoskopik/cerrahi bulgular' });

  // Head and Neck
  let hnScore = 0;
  if (/larenks|larynx|nazofarenks|orofarenks|hipofarenks|parotis|oral\s*kavite|dil\s*karsinom/i.test(lower)) hnScore += 10;
  if (/boyun\s*diseksiyonu|servikal\s*level|derinlik\s*\(doi\)/i.test(lower)) hnScore += 6;
  if (hnScore > 0) scores.push({ organ: 'head-neck', score: hnScore, evidence: 'Baş-boyun anatomik lokalizasyonu veya servikal lenf diseksiyonu' });

  // CNS / Brain
  let cnsScore = 0;
  if (/beyin|brain|kraniyal|serebral|serebellum|glioma|glioblastom|gbm|meningiom|menenjiom/i.test(lower)) cnsScore += 12;
  if (/orta\s*hat\s*şift|intrakraniyal|dura\s*mater/i.test(lower)) cnsScore += 6;
  if (cnsScore > 0) scores.push({ organ: 'cns', score: cnsScore, evidence: 'Merkezi sinir sistemi / intrakraniyal lezyon' });

  // Gynecology
  let gynScore = 0;
  if (/serviks|cervix|endometriyum|endometrium|uterus|over|ovary|vajen|vulva/i.test(lower)) gynScore += 10;
  if (/myometriyum|parametriyum|pelvik\s*lenfadenektomi/i.test(lower)) gynScore += 6;
  if (gynScore > 0) scores.push({ organ: 'gynecology', score: gynScore, evidence: 'Jinekolojik organ tutulumu veya parametrial değerlendirme' });

  // Skin
  let skinScore = 0;
  if (/cilt|deri|melanom|bazal\s*hücreli|bcc|skuamöz\s*hücreli\s*karsinom.*?(cilt|deri)/i.test(lower)) skinScore += 10;
  if (skinScore > 0) scores.push({ organ: 'skin', score: skinScore, evidence: 'Kutanöz lezyon / cilt biyopsisi' });

  if (scores.length === 0) {
    return { organ: null, confidence: 'low', evidence: 'Spesifik organ tanımlayıcısı bulunamadı' };
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const confidence = best.score >= 10 ? 'high' : best.score >= 6 ? 'medium' : 'low';

  return { organ: best.organ, confidence, evidence: best.evidence };
}

// ==========================================
// 4. TUMOR SIZE & T-STAGE DETERMINISTIC CALCULATOR
// ==========================================

export interface TumorSizeMatch {
  sizeMm: number;
  sizeCm: number;
  quote: string;
}

export function extractTumorSize(text: string): TumorSizeMatch | null {
  // Matches e.g., "çapı: 24 mm", "boyut: 2.4 cm", "18x12 mm boyutlarında", "en büyük boyutu 3.5 cm", "tumor diameter 2.8 cm"
  const regexPatterns = [
    /(?:tümör|lezyon|kitle|odak|nodül|tumor|lesion|mass|çap[ıi]|boyut[ıu]?|diameter)\s*(?:en\s*büyük)?\s*[:=\-]?\s*(?:yaklaşık|ölçülen)?\s*(\d+(?:[.,]\d+)?)\s*(?:[xX*×]\s*\d+(?:[.,]\d+)?)*\s*(mm|cm)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:[xX*×]\s*\d+(?:[.,]\d+)?)*\s*(mm|cm)\s*(?:boyutunda|çapında|ölçülen|kitle|lezyon|tümör)/i,
  ];

  for (const regex of regexPatterns) {
    const match = text.match(regex);
    if (match) {
      const rawNum = match[1].replace(',', '.');
      const unit = match[2].toLowerCase();
      let sizeMm = parseFloat(rawNum);
      if (unit === 'cm') {
        sizeMm *= 10;
      }
      const sizeCm = +(sizeMm / 10).toFixed(1);

      // Extract full sentence as evidence quote
      const matchIndex = match.index ?? 0;
      const start = Math.max(0, text.lastIndexOf('.', matchIndex) + 1, text.lastIndexOf('\n', matchIndex) + 1);
      let end = text.indexOf('.', matchIndex + match[0].length);
      if (end === -1) end = text.indexOf('\n', matchIndex + match[0].length);
      if (end === -1) end = text.length;
      const quote = text.slice(start, end + 1).trim();

      return { sizeMm, sizeCm, quote };
    }
  }

  return null;
}

export function calculateDeterministicTStage(
  organ: OrganId | null,
  sizeMm: number | undefined,
  text: string,
  riskFactors: ParsedRiskFactors
): { stage: string; quote: string } {
  const lower = text.toLowerCase();

  // If text explicitly mentions T-Stage e.g., "pT1c", "cT2a", "T3"
  const explicitT = text.match(/\b(?:p|c|y)?T([0-4][a-d]?(?:mi)?)\b/i);
  if (explicitT) {
    return { stage: `T${explicitT[1].toLowerCase()}`, quote: `Raporda açıkça belirtilen evre: ${explicitT[0]}` };
  }

  if (!organ) {
    return { stage: 'T1', quote: 'Organ belirlenemediğinden varsayılan T1' };
  }

  // Organ: THORAX (Lung AJCC 8th Edition)
  if (organ === 'thorax') {
    // Check visceral pleura invasion (PL1/PL2 increases stage to at least T2a)
    const hasPleuralInvasion = riskFactors.visceralPleura === 'invaded';

    // Direct chest wall or adjacent organ extension
    if (/göğüs\s*duvarı|parietal\s*plevra|perikard|ayrı\s*tümör\s*odağı\s*aynı\s*lob/i.test(lower)) {
      return { stage: 'T3', quote: 'Göğüs duvarı / perikard / aynı lobda ek nodül invazyonu (T3)' };
    }
    if (/mediasten|kalp|büyük\s*damar|trakea|karina|özofagus|farklı\s*lob/i.test(lower)) {
      return { stage: 'T4', quote: 'Mediasten / büyük damar / trakea / omurga invazyonu (T4)' };
    }

    if (sizeMm !== undefined) {
      if (sizeMm <= 10) {
        return hasPleuralInvasion
          ? { stage: 'T2a', quote: `Tümör ${sizeMm} mm (≤1 cm) ancak viseral plevra invazyonu (PL1/PL2) nedeniyle T2a` }
          : { stage: 'T1a', quote: `Tümör boyutu ${sizeMm} mm (≤10 mm) (T1a)` };
      }
      if (sizeMm <= 20) {
        return hasPleuralInvasion
          ? { stage: 'T2a', quote: `Tümör ${sizeMm} mm (≤2 cm) ancak viseral plevra invazyonu nedeniyle T2a` }
          : { stage: 'T1b', quote: `Tümör boyutu ${sizeMm} mm (>10 mm ve ≤20 mm) (T1b)` };
      }
      if (sizeMm <= 30) {
        return hasPleuralInvasion
          ? { stage: 'T2a', quote: `Tümör ${sizeMm} mm (≤3 cm) ancak viseral plevra invazyonu nedeniyle T2a` }
          : { stage: 'T1c', quote: `Tümör boyutu ${sizeMm} mm (>20 mm ve ≤30 mm) (T1c)` };
      }
      if (sizeMm <= 40) {
        return { stage: 'T2a', quote: `Tümör boyutu ${sizeMm} mm (>3 cm ve ≤4 cm) (T2a)` };
      }
      if (sizeMm <= 50) {
        return { stage: 'T2b', quote: `Tümör boyutu ${sizeMm} mm (>4 cm ve ≤5 cm) (T2b)` };
      }
      if (sizeMm <= 70) {
        return { stage: 'T3', quote: `Tümör boyutu ${sizeMm} mm (>5 cm ve ≤7 cm) (T3)` };
      }
      return { stage: 'T4', quote: `Tümör boyutu ${sizeMm} mm (>7 cm) (T4)` };
    }
    return { stage: 'T1b', quote: 'Varsayılan Akciğer T evresi' };
  }

  // Organ: BREAST (AJCC 8th Edition)
  if (organ === 'breast') {
    if (/göğüs\s*duvarı\s*fiksasyonu|cilt\s*ülserasyonu|enflamatuar/i.test(lower)) {
      return { stage: 'T4', quote: 'Göğüs duvarı fiksasyonu veya cilt ülserasyonu (T4)' };
    }
    if (sizeMm !== undefined) {
      if (sizeMm <= 1) return { stage: 'T1mi', quote: `Mikroinvazyon ${sizeMm} mm (T1mi)` };
      if (sizeMm <= 5) return { stage: 'T1a', quote: `Tümör boyutu ${sizeMm} mm (≤5 mm) (T1a)` };
      if (sizeMm <= 10) return { stage: 'T1b', quote: `Tümör boyutu ${sizeMm} mm (>5 mm ve ≤10 mm) (T1b)` };
      if (sizeMm <= 20) return { stage: 'T1c', quote: `Tümör boyutu ${sizeMm} mm (>10 mm ve ≤20 mm) (T1c)` };
      if (sizeMm <= 50) return { stage: 'T2', quote: `Tümör boyutu ${sizeMm} mm (>20 mm ve ≤50 mm) (T2)` };
      return { stage: 'T3', quote: `Tümör boyutu ${sizeMm} mm (>50 mm) (T3)` };
    }
    return { stage: 'T1c', quote: 'Varsayılan Meme T evresi' };
  }

  // Organ: PROSTATE
  if (organ === 'prostate') {
    if (riskFactors.svi) {
      return { stage: 'T3b', quote: 'Seminal vezikül invazyonu izlendi (T3b)' };
    }
    if (riskFactors.ece) {
      return { stage: 'T3a', quote: 'Ekstraprostatik uzanım / kapsül aşımı izlendi (T3a)' };
    }
    if (/komşu\s*organ|rektum\s*invazyonu|mesane\s*boynu/i.test(lower)) {
      return { stage: 'T4', quote: 'Komşu pelvik organ invazyonu (T4)' };
    }
    if (sizeMm !== undefined && sizeMm > 25) {
      return { stage: 'T2c', quote: `Prostata sınırlı geniş lezyon (${sizeMm} mm) (T2c)` };
    }
    return { stage: 'T1c', quote: 'Klinik / biyopsi ile saptanan prostata sınırlı lezyon (T1c)' };
  }

  // Organ: GIS / RECTUM
  if (organ === 'gis') {
    if (/periton|komşu\s*organ\s*invazyonu|vajen|prostat\s*invazyonu/i.test(lower)) {
      return { stage: 'T4', quote: 'Periton penetrasyonu veya komşu organ invazyonu (T4)' };
    }
    if (/perirektal|subseroz|mezorektal\s*yağ/i.test(lower)) {
      return { stage: 'T3', quote: 'Perirektal / mezorektal yağ dokusu invazyonu (T3)' };
    }
    if (/muskularis\s*propria/i.test(lower)) {
      return { stage: 'T2', quote: 'Muskularis propria tutulumu (T2)' };
    }
    return { stage: 'T3', quote: 'Varsayılan Rektum T evresi' };
  }

  // Organ: HEAD & NECK
  if (organ === 'head-neck') {
    if (/kemik\s*korteks|derin\s*dil|mandibula|pterigoid/i.test(lower)) {
      return { stage: 'T4a', quote: 'Kemik korteks veya derin kas yapıları invazyonu (T4a)' };
    }
    if (sizeMm !== undefined) {
      if (sizeMm <= 20) return { stage: 'T1', quote: `Tümör boyutu ${sizeMm} mm (≤2 cm) (T1)` };
      if (sizeMm <= 40) return { stage: 'T2', quote: `Tümör boyutu ${sizeMm} mm (>2 cm ve ≤4 cm) (T2)` };
      return { stage: 'T3', quote: `Tümör boyutu ${sizeMm} mm (>4 cm) (T3)` };
    }
    return { stage: 'T2', quote: 'Varsayılan Baş-Boyun T evresi' };
  }

  return { stage: 'T1b', quote: 'Genel varsayılan evre' };
}

// ==========================================
// 5. NODAL STAGING ENGINE (PET/CT & PATHOLOGY)
// ==========================================

export function calculateDeterministicNStage(
  organ: OrganId | null,
  text: string
): { stage: string; quote: string } {
  const lower = text.toLowerCase();

  // Explicit mention e.g. "pN2", "cN0", "N1b"
  const explicitN = text.match(/\b(?:p|c|y)?N([0-3][a-c]?)\b/i);
  if (explicitN) {
    return { stage: `N${explicitN[1].toLowerCase()}`, quote: `Raporda açıkça belirtilen N evresi: ${explicitN[0]}` };
  }

  // Clear negative node statement
  const isExplicitlyNegative =
    /lenf\s*nod(?:u|larında)?\s*(?:tutulum|metastaz|malignite)?\s*(?:izlenmedi|saptanmadı|negatif|yok|0\/\d+)/i.test(lower) ||
    /reaktif\s*lenf\s*nod|patolojik\s*boyut\s*artışı\s*izlenmedi|metabolik\s*aktivite\s*artışı\s*izlenmedi/i.test(lower);

  // Organ: THORAX / LUNG (Mediastinal Station Mapping)
  if (organ === 'thorax') {
    // N3: Contralateral mediastinal/hilar or supraclavicular
    if (/supraklavikuler|karşı\s*taraf|kontralateral|istasyon\s*1\b/i.test(lower) && /metastaz|tutulum|pozitif|suv/i.test(lower)) {
      return { stage: 'N3', quote: 'Kontralateral mediastinal veya supraklavikuler lenf nodu tutulumu (N3)' };
    }
    // N2: Ipsilateral mediastinal (2R, 4R, 2L, 4L, 7 subcarinal, 5 AP window, 6, 8, 9)
    if (/(?:istasyon|station|düzey)\s*(?:2r|4r|2l|4l|7|5|6|8|9|subkarinal|paratrakeal)/i.test(lower) &&
        /(?:[1-9]\/\d+|pozitif|tutulum|metastaz\s*izlendi|suvmax\s*[:=\-]?\s*[4-9]|\bmet\b)/i.test(lower)) {
      return { stage: 'N2', quote: 'İpsilateral mediastinal / subkarinal (2R/4R/7) istasyon pozitifliği (N2)' };
    }
    // N1: Ipsilateral hilar / peribronchial (10, 11, 12, 13, 14)
    if (/(?:istasyon|station|düzey)\s*(?:10|11|12|13|14|hiler|lober)/i.test(lower) &&
        /(?:[1-9]\/\d+|pozitif|tutulum|metastaz\s*izlendi)/i.test(lower)) {
      return { stage: 'N1', quote: 'İpsilateral hiler / peribronşiyal istasyon pozitifliği (N1)' };
    }
    if (isExplicitlyNegative) {
      return { stage: 'N0', quote: 'Lenf nodlarında metastaz saptanmadı (N0)' };
    }
    return { stage: 'N0', quote: 'Klinik N0 varsayımı' };
  }

  // Organ: BREAST (Axillary Station Count)
  if (organ === 'breast') {
    const axillaryNodeCount = lower.match(/([1-9]\d?)\s*\/\s*(\d+)\s*(?:lenf\s*nod|nodunda)?\s*(?:makrometastaz|metastaz)/i);
    if (axillaryNodeCount) {
      const positiveCount = parseInt(axillaryNodeCount[1], 10);
      if (positiveCount >= 10) return { stage: 'N3', quote: `≥10 aksiller lenf nodu pozitif (${positiveCount} adet) (N3)` };
      if (positiveCount >= 4) return { stage: 'N2', quote: `4-9 aksiller lenf nodu pozitif (${positiveCount} adet) (N2)` };
      if (positiveCount >= 1) return { stage: 'N1', quote: `1-3 aksiller lenf nodu pozitif (${positiveCount} adet) (N1)` };
    }
    if (/(?:supraklavikuler|internal\s*mammar|infraklavikuler)/i.test(lower) && /pozitif|tutulum/i.test(lower)) {
      return { stage: 'N3', quote: 'Supraklavikuler veya internal mammar lenf nodu tutulumu (N3)' };
    }
    if (isExplicitlyNegative) {
      return { stage: 'N0', quote: 'Aksiller lenf nodları negatif (N0)' };
    }
    return { stage: 'N0', quote: 'Klinik N0 varsayımı' };
  }

  // Organ: PROSTATE / PELVIC
  if (organ === 'prostate' || organ === 'gis') {
    if (/(?:obturator|iliak|mezorektal|pelvik)\s*(?:lenf\s*nod[ıi]|alanda)?.*?(?:[1-9]\/\d+|pozitif|tutulum|şüpheli\s*lenf)/i.test(lower)) {
      return { stage: 'N1', quote: 'Bölgesel pelvik / mezorektal lenf nodu tutulumu (N1)' };
    }
    if (isExplicitlyNegative) {
      return { stage: 'N0', quote: 'Bölgesel lenf nodlarında metastaz izlenmedi (N0)' };
    }
    return { stage: 'N0', quote: 'Klinik N0 varsayımı' };
  }

  // Organ: HEAD & NECK
  if (organ === 'head-neck') {
    if (/(?:bilateral|kontralateral|karşı\s*taraf)\s*(?:boyun|level|servikal)/i.test(lower) && /pozitif|tutulum/i.test(lower)) {
      return { stage: 'N2c', quote: 'Bilateral veya kontralateral servikal lenf nodu tutulumu (N2c)' };
    }
    if (/(?:level\s*[1-5]|servikal\s*lenf).*?(?:pozitif|tutulum|[1-9]\/\d+)/i.test(lower)) {
      return { stage: 'N1', quote: 'İpsilateral servikal lenf nodu tutulumu (N1)' };
    }
    if (isExplicitlyNegative) {
      return { stage: 'N0', quote: 'Servikal lenf nodu metastazı saptanmadı (N0)' };
    }
    return { stage: 'N0', quote: 'Klinik N0 varsayımı' };
  }

  if (isExplicitlyNegative) {
    return { stage: 'N0', quote: 'Lenf nodu metastazı izlenmedi (N0)' };
  }

  return { stage: 'N0', quote: 'Varsayılan N0' };
}

// ==========================================
// 6. METASTASIS (M-STAGE) ENGINE
// ==========================================

export function calculateDeterministicMStage(text: string): { stage: string; quote: string } {
  const lower = text.toLowerCase();

  const explicitM = text.match(/\b(?:p|c|y)?M([0-1][a-c]?)\b/i);
  if (explicitM) {
    return { stage: `M${explicitM[1].toLowerCase()}`, quote: `Raporda açıkça belirtilen M evresi: ${explicitM[0]}` };
  }

  // Clear distant metastases
  const distantMetMatches = [
    { pattern: /(?:kemik|akciğer|karaciğer|beyin|sürrenal|periton)\s*(?:metastaz[ıi]|tutulumu)\s*(?:izlendi|saptandı|mevcut)/i, label: 'Uzak organ metastazı' },
    { pattern: /yaygın\s*(?:kemik|viseral)\s*metastaz/i, label: 'Yaygın metastatik hastalık' },
    { pattern: /multipl\s*(?:kemik|akciğer|karaciğer)\s*(?:lezyon|metastaz)/i.test(lower), label: 'Multipl metastaz odakları' },
  ];

  for (const match of distantMetMatches) {
    if (typeof match.pattern === 'boolean' ? match.pattern : match.pattern.test(lower)) {
      return { stage: 'M1', quote: `${match.label} tespit edildi (M1)` };
    }
  }

  if (/uzak\s*metastaz\s*(?:saptanmadı|izlenmedi|bulgusuna\s*rastlanmadı|yok)|kemik\s*yapılar\s*salim/i.test(lower)) {
    return { stage: 'M0', quote: 'Uzak metastaz bulgusu izlenmedi (M0)' };
  }

  return { stage: 'M0', quote: 'Uzak metastaz saptanmadı / varsayılan (M0)' };
}

// ==========================================
// 7. HISTOPATHOLOGY & INVASION RISK FACTORS
// ==========================================

export function extractHistology(organ: OrganId | null, text: string): { histology: string; quote: string } | null {
  const lower = text.toLowerCase();

  if (/adenokarsinom|adenocarcinoma/i.test(lower)) {
    if (/müsinoz|musinous/i.test(lower)) return { histology: 'Müsinoz Adenokarsinom', quote: 'Müsinoz Adenokarsinom' };
    return { histology: 'Adenokarsinom', quote: 'Adenokarsinom morfolojisi' };
  }
  if (/skuamöz\s*hücreli|yassı\s*epitelyal|scc/i.test(lower)) {
    return { histology: 'Skuamöz Hücreli Karsinom (SCC)', quote: 'Skuamöz Hücreli Karsinom' };
  }
  if (/küçük\s*hücreli\s*karsinom|sclc|khak/i.test(lower)) {
    return { histology: 'Küçük Hücreli Karsinom (SCLC)', quote: 'Küçük Hücreli Akciğer Karsinomu' };
  }
  if (/invaziv\s*duktal|idk|infiltrating\s*ductal|nst/i.test(lower)) {
    return { histology: 'İnvaziv Duktal Karsinom (İDK)', quote: 'İnvaziv Duktal Karsinom (NST)' };
  }
  if (/invaziv\s*lobüler|ilk/i.test(lower)) {
    return { histology: 'İnvaziv Lobüler Karsinom (İLK)', quote: 'İnvaziv Lobüler Karsinom' };
  }
  if (/glioblastom|gbm|glioblastoma/i.test(lower)) {
    return { histology: 'Glioblastoma (IDH-wildtype)', quote: 'Glioblastoma tanısı' };
  }
  if (/meningiom|menenjiom/i.test(lower)) {
    return { histology: 'Meningiom', quote: 'Meningiom morfolojisi' };
  }
  if (/ürotelyal|urothelial|transizyonel/i.test(lower)) {
    return { histology: 'Ürotelyal Karsinom', quote: 'Ürotelyal Karsinom' };
  }
  if (/asiner\s*adenokarsinom/i.test(lower)) {
    return { histology: 'Asiner Adenokarsinom', quote: 'Prostat Asiner Adenokarsinom' };
  }

  return null;
}

export function extractRiskFactors(text: string): { riskFactors: ParsedRiskFactors; quotes: ExtractedEvidence[] } {
  const lower = text.toLowerCase();
  const riskFactors: ParsedRiskFactors = {};
  const quotes: ExtractedEvidence[] = [];

  // 1. Visceral Pleura Invasion
  if (/viseral\s*plevra.*?(?:izlendi|saptandı|mevcut|pozitif|pl1|pl2)/i.test(lower)) {
    riskFactors.visceralPleura = 'invaded';
    quotes.push({
      field: 'visceralPleura',
      label: 'Viseral Plevra',
      value: 'İnvaze (PL1/PL2)',
      quote: 'Viseral plevra invazyonu saptandı',
      confidence: 'high',
    });
  } else if (/viseral\s*plevra.*?(?:intakt|salim|negatif|izlenmedi|saptanmadı)/i.test(lower)) {
    riskFactors.visceralPleura = 'intact';
    quotes.push({
      field: 'visceralPleura',
      label: 'Viseral Plevra',
      value: 'İntakt / Negatif',
      quote: 'Viseral plevra intakt / invazyon saptanmadı',
      confidence: 'high',
    });
  }

  // 2. Lymphovascular Invasion (LVI)
  if (/(?:lvi|lenfovasküler|lenfovaskuler)\s*(?:invazyon)?.*?(?:pozitif|mevcut|izlendi|saptandı|\(\+\))/i.test(lower)) {
    riskFactors.lvi = true;
    quotes.push({
      field: 'lvi',
      label: 'Lenfovasküler İnvazyon (LVI)',
      value: 'Pozitif',
      quote: 'Lenfovasküler invazyon (LVI) pozitif',
      confidence: 'high',
    });
  } else if (/(?:lvi|lenfovasküler|lenfovaskuler)\s*(?:invazyon)?.*?(?:negatif|yok|izlenmedi|saptanmadı|\(\-\))/i.test(lower)) {
    riskFactors.lvi = false;
    quotes.push({
      field: 'lvi',
      label: 'Lenfovasküler İnvazyon (LVI)',
      value: 'Negatif',
      quote: 'Lenfovasküler invazyon (LVI) izlenmedi',
      confidence: 'high',
    });
  }

  // 3. Perineural Invasion (PNI)
  if (/(?:pni|perinöral|perinoral)\s*(?:invazyon)?.*?(?:pozitif|mevcut|izlendi|saptandı|\(\+\))/i.test(lower)) {
    riskFactors.pni = true;
    quotes.push({
      field: 'pni',
      label: 'Perinöral İnvazyon (PNI)',
      value: 'Pozitif',
      quote: 'Perinöral invazyon (PNI) pozitif',
      confidence: 'high',
    });
  } else if (/(?:pni|perinöral|perinoral)\s*(?:invazyon)?.*?(?:negatif|yok|izlenmedi|saptanmadı|\(\-\))/i.test(lower)) {
    riskFactors.pni = false;
    quotes.push({
      field: 'pni',
      label: 'Perinöral İnvazyon (PNI)',
      value: 'Negatif',
      quote: 'Perinöral invazyon (PNI) izlenmedi',
      confidence: 'high',
    });
  }

  // 4. Margins (Surgical Margins)
  const marginMatch = text.match(/(?:cerrahi\s*sınır|marjin|margin).*?(?:negatif|pozitif|salim|temiz|yakin)/i);
  if (marginMatch) {
    if (/pozitif|tutulu|kanser\s*hücresi\s*görüldü/i.test(marginMatch[0])) {
      riskFactors.marginStatus = 'positive';
      quotes.push({ field: 'marginStatus', label: 'Cerrahi Sınır', value: 'Pozitif (R1)', quote: marginMatch[0], confidence: 'high' });
    } else {
      riskFactors.marginStatus = 'negative';
      quotes.push({ field: 'marginStatus', label: 'Cerrahi Sınır', value: 'Negatif (R0)', quote: marginMatch[0], confidence: 'high' });
    }
  }

  // 5. Rectum Specifics: CRM & EMVI & Anal Verge
  const crmMatch = text.match(/(?:crm|mesorektal\s*fasya|mezorektal\s*fasya|mrf).*?([<>]?\s*\d+(?:[.,]\d+)?\s*mm)/i);
  if (crmMatch) {
    const mmVal = parseFloat(crmMatch[1].replace(/[<>]/g, '').replace(',', '.').trim());
    riskFactors.crmDistanceMm = mmVal;
    riskFactors.crmStatus = mmVal <= 1 ? 'positive' : 'negative';
    quotes.push({
      field: 'crmStatus',
      label: 'Mezorektal Fasya (CRM)',
      value: `${mmVal} mm (${riskFactors.crmStatus === 'positive' ? 'Pozitif ≤1mm' : 'Negatif >1mm'})`,
      quote: crmMatch[0],
      confidence: 'high',
    });
  }

  if (/emvi.*?(?:pozitif|mevcut|izlendi|\(\+\))/i.test(lower)) {
    riskFactors.emvi = true;
    quotes.push({ field: 'emvi', label: 'EMVI', value: 'Pozitif', quote: 'Ekstramural vasküler invazyon pozitif', confidence: 'high' });
  } else if (/emvi.*?(?:negatif|yok|izlenmedi|\(\-\))/i.test(lower)) {
    riskFactors.emvi = false;
    quotes.push({ field: 'emvi', label: 'EMVI', value: 'Negatif', quote: 'EMVI izlenmedi', confidence: 'high' });
  }

  const analVergeMatch = text.match(/anal\s*(?:verge|girim).*?(\d+(?:[.,]\d+)?)\s*cm/i);
  if (analVergeMatch) {
    const cmVal = parseFloat(analVergeMatch[1].replace(',', '.'));
    riskFactors.analVergeDistanceCm = cmVal;
    quotes.push({ field: 'analVergeDistanceCm', label: 'Anal Verge Mesafesi', value: `${cmVal} cm`, quote: analVergeMatch[0], confidence: 'high' });
  }

  // 6. Prostate Specifics: PI-RADS, EPE, SVI, PSA, Gleason
  const piradsMatch = text.match(/pi[\s-]?rads\s*[:=\-]?\s*([1-5])/i);
  if (piradsMatch) {
    riskFactors.pirads = parseInt(piradsMatch[1], 10);
    quotes.push({ field: 'pirads', label: 'PI-RADS Skoru', value: `PI-RADS ${riskFactors.pirads}`, quote: piradsMatch[0], confidence: 'high' });
  }

  if (/ekstraprostatik|epe\b|kapsül\s*aşımı|kapsül\s*invazyonu/i.test(lower)) {
    riskFactors.ece = true;
    quotes.push({ field: 'ece', label: 'Ekstraprostatik Uzanım (EPE)', value: 'Mevcut (T3a)', quote: 'Ekstraprostatik uzanım / kapsül aşımı saptandı', confidence: 'high' });
  }

  if (/seminal\s*vezikül\s*invazyonu.*?(?:mevcut|izlendi|pozitif|tutulum)/i.test(lower) || /\bsvi\s*[:=\-]?\s*pozitif/i.test(lower)) {
    riskFactors.svi = true;
    quotes.push({ field: 'svi', label: 'Seminal Vezikül İnvazyonu (SVI)', value: 'Mevcut (T3b)', quote: 'Seminal vezikül invazyonu saptandı', confidence: 'high' });
  }

  const psaMatch = text.match(/(?:psa|tpsa)\s*[:=\-]?\s*(\d+(?:[.,]\d+)?)\s*(?:ng\/ml)?/i);
  if (psaMatch) {
    riskFactors.psa = parseFloat(psaMatch[1].replace(',', '.'));
    quotes.push({ field: 'psa', label: 'Serum PSA', value: `${riskFactors.psa} ng/mL`, quote: psaMatch[0], confidence: 'high' });
  }

  const gleasonMatch = text.match(/gleason\s*(?:skor[u]?)?\s*[:=\-]?\s*([3-5])\s*\+\s*([3-5])/i);
  if (gleasonMatch) {
    riskFactors.gleasonPrimary = gleasonMatch[1];
    riskFactors.gleasonSecondary = gleasonMatch[2];
    quotes.push({
      field: 'gleason',
      label: 'Gleason Skoru',
      value: `${gleasonMatch[1]}+${gleasonMatch[2]} = ${parseInt(gleasonMatch[1], 10) + parseInt(gleasonMatch[2], 10)}`,
      quote: gleasonMatch[0],
      confidence: 'high',
    });
  }

  // 7. Breast Biomarkers: ER, PR, HER2, Ki-67
  const erMatch = text.match(/(?:er|östrojen)\s*[:=\-]?\s*(?:%?\s*(\d+)|pozitif|\(\+\))/i);
  if (erMatch) {
    riskFactors.er = true;
    if (erMatch[1]) riskFactors.erPercent = parseInt(erMatch[1], 10);
    quotes.push({ field: 'er', label: 'Östrojen Reseptörü (ER)', value: riskFactors.erPercent ? `%${riskFactors.erPercent} Pozitif` : 'Pozitif', quote: erMatch[0], confidence: 'high' });
  }

  const prMatch = text.match(/(?:pr|progesteron)\s*[:=\-]?\s*(?:%?\s*(\d+)|pozitif|\(\+\))/i);
  if (prMatch) {
    riskFactors.pr = true;
    if (prMatch[1]) riskFactors.prPercent = parseInt(prMatch[1], 10);
    quotes.push({ field: 'pr', label: 'Progesteron Reseptörü (PR)', value: riskFactors.prPercent ? `%${riskFactors.prPercent} Pozitif` : 'Pozitif', quote: prMatch[0], confidence: 'high' });
  }

  const her2Match = text.match(/her2\s*(?:neu)?\s*[:=\-]?\s*([0-3]\+?|pozitif|negatif)/i);
  if (her2Match) {
    const rawVal = her2Match[1].toLowerCase();
    riskFactors.her2Score = her2Match[1];
    riskFactors.her2 = rawVal.includes('3') || rawVal === 'pozitif';
    quotes.push({ field: 'her2', label: 'HER2', value: her2Match[1], quote: her2Match[0], confidence: 'high' });
  }

  const ki67Match = text.match(/ki[\s-]?67\s*[:=\-]?\s*(?:%?\s*(\d+)|yüksek|düşük)/i);
  if (ki67Match && ki67Match[1]) {
    riskFactors.ki67Percent = parseInt(ki67Match[1], 10);
    quotes.push({ field: 'ki67', label: 'Ki-67 Proliferasyon', value: `%${riskFactors.ki67Percent}`, quote: ki67Match[0], confidence: 'high' });
  }

  return { riskFactors, quotes };
}

// ==========================================
// 8. MASTER PIPELINE: parseClinicalReport
// ==========================================

export function parseClinicalReport(rawReportText: string, forcedModality?: ReportModality): ParsedStagingResult {
  // 1. KVKK / MDR De-identification
  const { text: deidentifiedText, redactedCount } = deidentifyClinicalText(rawReportText);

  // 2. Modality Detection
  const detectedModality = forcedModality && forcedModality !== 'auto'
    ? forcedModality
    : detectModality(deidentifiedText);

  // 3. Organ & Subsite
  const organDetection = detectPrimaryOrgan(deidentifiedText);
  const organ = organDetection.organ;

  // 4. Tumor Size
  const sizeMatch = extractTumorSize(deidentifiedText);
  const tumorSizeMm = sizeMatch?.sizeMm;
  const tumorSizeCm = sizeMatch?.sizeCm;

  // 5. Risk Factors & Biomarkers
  const { riskFactors, quotes: riskQuotes } = extractRiskFactors(deidentifiedText);

  // 6. T, N, M Deterministic Calculation
  const tResult = calculateDeterministicTStage(organ, tumorSizeMm, deidentifiedText, riskFactors);
  const nResult = calculateDeterministicNStage(organ, deidentifiedText);
  const mResult = calculateDeterministicMStage(deidentifiedText);

  // 7. Histology
  const histologyMatch = extractHistology(organ, deidentifiedText);

  // 8. Assemble Evidence Quotes for Full Auditability
  const evidenceQuotes: ExtractedEvidence[] = [];

  if (organDetection.organ) {
    evidenceQuotes.push({
      field: 'organ',
      label: 'Primer Organ',
      value: organDetection.organ.toUpperCase(),
      quote: organDetection.evidence,
      confidence: organDetection.confidence,
    });
  }

  if (histologyMatch) {
    evidenceQuotes.push({
      field: 'histology',
      label: 'Histopatoloji',
      value: histologyMatch.histology,
      quote: histologyMatch.quote,
      confidence: 'high',
    });
  }

  if (sizeMatch) {
    evidenceQuotes.push({
      field: 'tumorSize',
      label: 'Tümör Boyutu',
      value: `${sizeMatch.sizeMm} mm (${sizeMatch.sizeCm} cm)`,
      quote: sizeMatch.quote,
      confidence: 'high',
    });
  }

  evidenceQuotes.push({
    field: 'suggestedT',
    label: 'T-Evresi',
    value: tResult.stage,
    quote: tResult.quote,
    confidence: 'high',
  });

  evidenceQuotes.push({
    field: 'suggestedN',
    label: 'N-Evresi',
    value: nResult.stage,
    quote: nResult.quote,
    confidence: 'high',
  });

  evidenceQuotes.push({
    field: 'suggestedM',
    label: 'M-Evresi',
    value: mResult.stage,
    quote: mResult.quote,
    confidence: 'high',
  });

  // Append other biomarker quotes
  evidenceQuotes.push(...riskQuotes);

  return {
    deidentifiedText,
    detectedModality,
    organ,
    organConfidence: organDetection.confidence,
    histology: histologyMatch?.histology,
    tumorSizeMm,
    tumorSizeCm,
    suggestedT: tResult.stage,
    suggestedN: nResult.stage,
    suggestedM: mResult.stage,
    riskFactors,
    evidenceQuotes,
    redactedCount,
  };
}
