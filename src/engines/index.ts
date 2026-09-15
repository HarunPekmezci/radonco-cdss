import { EngineOutput, DoseRegimen } from '../types';
import guidelinesData from '../data/clinicalGuidelines.json';

// ============================================================================
// 1. PROSTAT MOTORU (DİNAMİK JSON DESTEKLİ)
// ============================================================================
export function runProstateEngine(data: any): EngineOutput {
  const p1 = Number(data.gleasonP1) || 3;
  const p2 = Number(data.gleasonP2) || 4;
  const sum = p1 + p2;
  let isup = 1;
  if (p1 === 3 && p2 === 3) isup = 1;
  else if (p1 === 3 && p2 === 4) isup = 2;
  else if (p1 === 4 && p2 === 3) isup = 3;
  else if (sum === 8) isup = 4;
  else if (sum >= 9) isup = 5;

  const psa = Number(data.tPsa) || 0;
  const effectiveT3b = data.seminalVesicleInvasion || data.clinicalT === 'cT3b';
  const roach = Math.max(0, Math.round(((2 / 3) * psa) + ((sum - 6) * 10)));

  let stage = 'Evre I (T1-T2a, ISUP 1)';
  if (data.hasM1) stage = 'Evre IVB (cM1)';
  else if (data.hasN1) stage = 'Evre IVA (cN1 M0)';
  else if (data.clinicalT === 'cT4') stage = 'Evre IVA (cT4 N0 M0)';
  else if (effectiveT3b || data.clinicalT === 'cT3a') stage = 'Evre IIIC (cT3 N0 M0)';
  else if (isup === 5) stage = 'Evre IIIC (ISUP 5)';
  else if (isup >= 3 || psa >= 20) stage = 'Evre IIIB';
  else if (isup === 2) stage = 'Evre IIB';
  else if (data.clinicalT === 'cT2b' || data.clinicalT === 'cT2c' || psa >= 10) stage = 'Evre IIA';

  const isHigh = data.hasM1 || data.hasN1 || effectiveT3b || data.clinicalT === 'cT4' || p1 === 5 || isup >= 4 || psa > 20;
  const isUnfav = (isup === 3 || data.positiveCoresPercent >= 50 || (isup === 2 && psa >= 10));

  const dbRegimens = (guidelinesData.guidelines.prostate?.regimens || []) as DoseRegimen[];
  
  const chhip = dbRegimens.find(r => r.id === 'chhip_standard') || {
    categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Hipofraksiyone', regimenName: 'CHHiP (60 Gy / 20 fx)',
    totalDoseGy: 60, fractionCount: 20, dosePerFractionGy: 3, alphaBeta: 1.5, bedGy: 180, eqd2Gy: 77.1,
    targetVolumeCTV: 'Prostat ± SV', volumeUnionHierarchy: 'PTV = CTV + 5 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: 'Post 4mm, Diğer 5-6mm', clinicalIndication: 'Standart lokalize'
  };

  const sbrt = dbRegimens.find(r => r.id === 'pace_b_sbrt') || {
    categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'SBRT', regimenName: 'PACE-B (36.25 Gy / 5 fx)',
    totalDoseGy: 36.25, fractionCount: 5, dosePerFractionGy: 7.25, alphaBeta: 1.5, bedGy: 211.5, eqd2Gy: 90.6,
    targetVolumeCTV: 'Prostat', volumeUnionHierarchy: 'PTV = CTV + 3-4 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: '3-4 mm', clinicalIndication: 'Ablatif standart'
  };

  const sib = dbRegimens.find(r => r.id === 'pelvic_sib') || {
    categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Pelvik SIB', regimenName: 'SIB (70/56/46 Gy)',
    totalDoseGy: 70, fractionCount: 28, dosePerFractionGy: 2.5, alphaBeta: 1.5, bedGy: 186.7, eqd2Gy: 80,
    targetVolumeCTV: 'Prostat + SV + Pelvik LN', volumeUnionHierarchy: 'PTV_46 ∪ PTV_56 ∪ PTV_70', gtvToCtvMargin: 'Pelvik LN + 7mm', ctvToPtvMargin: '5 mm', clinicalIndication: 'Yüksek risk nodal kapsama'
  };

  const regimens = data.hasM1 
    ? [{ ...chhip, totalDoseGy: 55, dosePerFractionGy: 2.75, regimenName: 'STAMPEDE (55 Gy)', bedGy: 155.8, eqd2Gy: 66.8, preferredBadge: true }] 
    : isHigh 
    ? [{ ...sib, preferredBadge: true }, chhip] 
    : isUnfav 
    ? (roach >= 15 ? [{ ...sib, preferredBadge: true }, chhip] : [{ ...chhip, preferredBadge: true }, sbrt]) 
    : [{ ...chhip, preferredBadge: true }, { ...sbrt, preferredBadge: true }];

  const strategy = data.lifeExpectancyLess10 && !data.hasM1 && !isHigh 
    ? 'Gözlem (Observation). Yaşam beklentisi kısa olan lokalize hastalıkta küratif RT önerilmez.' 
    : isHigh 
    ? 'Pelvik SIB + Uzun Dönem ADT.' 
    : isUnfav 
    ? 'Prostat RT + Kısa Dönem ADT.' 
    : 'Aktif İzlem veya Monoterapi RT.';

  return {
    ajccStage: stage,
    stageSummary: data.hasM1 ? 'Metastatik' : isHigh ? 'Yüksek Risk' : isUnfav ? 'Uygunsuz Orta Risk' : 'Düşük/Uygun Orta Risk',
    color: isHigh ? 'bg-rose-50 text-rose-900 border-rose-300' : isUnfav ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
    strategy,
    systemic: isHigh ? 'Uzun ADT ± Abirateron.' : isUnfav ? 'Kısa ADT.' : 'Gerekmez.',
    roachRisk: roach,
    coreImpact: `Gleason ${p1}+${p2}=${sum}.`,
    regimens: data.lifeExpectancyLess10 && !data.hasM1 && !isHigh ? [] : regimens,
    url: guidelinesData.guidelines.prostate?.referenceUrl || 'https://www.nccn.org',
    ref: guidelinesData.guidelines.prostate?.reference || 'NCCN Prostate'
  };
}

// ============================================================================
// 2. MESANE MOTORU
// ============================================================================
export function runBladderEngine(data: any): EngineOutput {
  const isHigh = data.hasM1 || data.nodalStatus !== 'cN0' || String(data.clinicalT).includes('4');
  const isIdeal = data.completeTurbt && !data.hydronephrosis && !data.hasCis && data.nodalStatus === 'cN0' && !data.hasM1;
  const regimens: DoseRegimen[] = [
    { categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Trimodalite', regimenName: 'Mesane Koruma (64 Gy / 32 fx)', totalDoseGy: 64.0, fractionCount: 32, dosePerFractionGy: 2.0, alphaBeta: 10.0, bedGy: 76.8, eqd2Gy: 64.0, targetVolumeCTV: 'Mesane + Tümör Boost', volumeUnionHierarchy: 'PTV = CTV + 15 mm', gtvToCtvMargin: '15 mm', ctvToPtvMargin: '15 mm', boostDoseDetails: 'Sisplatin eşzamanlı', clinicalIndication: 'Standart mesane koruma', preferredBadge: isIdeal && !data.poorBladderCapacity },
    { categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Hipofraksiyone', regimenName: 'BCON Şeması (55 Gy / 20 fx)', totalDoseGy: 55.0, fractionCount: 20, dosePerFractionGy: 2.75, alphaBeta: 10.0, bedGy: 70.1, eqd2Gy: 58.4, targetVolumeCTV: 'Tüm Mesane', volumeUnionHierarchy: 'PTV = CTV + 15 mm', gtvToCtvMargin: 'Mesane Duvarı', ctvToPtvMargin: '15 mm', clinicalIndication: '4 haftalık alternatif', preferredBadge: !isIdeal && !data.hasM1 && !data.poorBladderCapacity }
  ];
  let strategy = isIdeal ? 'Maksimal TURBT -> Eşzamanlı KRT.' : 'Neoadjuvan KT -> Sistektomi veya KRT.';
  if (data.poorBladderCapacity) strategy = '⚠️ KÖTÜ MESANE KAPASİTESİ: Trimodalite (Mesane Koruma) mutlak kontrendikedir. Radikal Sistektomi önerilir.';
  return { ajccStage: data.hasM1 ? 'Evre IVB' : data.nodalStatus !== 'cN0' ? 'Evre III' : 'Evre II', stageSummary: data.hasM1 ? 'Metastatik' : data.poorBladderCapacity ? 'Sistektomi Zorunlu' : isIdeal ? 'Trimodalite İdeal Adayı' : 'Yüksek Risk', color: data.poorBladderCapacity ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : data.hasM1 ? 'bg-purple-50 text-purple-900 border-purple-300' : isIdeal ? 'bg-cyan-50 text-cyan-900 border-cyan-300' : 'bg-amber-50 text-amber-800 border-amber-300', strategy, systemic: 'Sisplatin veya 5-FU/MMC.', regimens: data.poorBladderCapacity ? [] : regimens, url: 'https://www.nccn.org', ref: 'BC2001 Trial' };
}

// ============================================================================
// 3. BÖBREK (RCC) MOTORU
// ============================================================================
export function runKidneyRccEngine(data: any): EngineOutput {
  const isPerif = data.locationPolarity === 'PERIPHERAL_CORTICAL';
  const regimens: DoseRegimen[] = [
    { categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'Tek Doz SBRT', regimenName: 'Renal SBRT (26 Gy / 1 fx)', totalDoseGy: 26.0, fractionCount: 1, dosePerFractionGy: 26.0, alphaBeta: 2.6, bedGy: 286.0, eqd2Gy: 161.7, targetVolumeCTV: 'Renal Kitle (GTV=CTV)', volumeUnionHierarchy: 'PTV = ITV + 3-5 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: '3-5 mm', clinicalIndication: 'Periferik küçük kitleler', preferredBadge: isPerif && data.tumorSizeMm <= 40 },
    { categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: '3 Fx SBRT', regimenName: 'Renal SBRT (42 Gy / 3 fx)', totalDoseGy: 42.0, fractionCount: 3, dosePerFractionGy: 14.0, alphaBeta: 2.6, bedGy: 268.0, eqd2Gy: 151.7, targetVolumeCTV: 'Renal Kitle (GTV=CTV)', volumeUnionHierarchy: 'PTV = ITV + 5 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: '5 mm', clinicalIndication: 'Santral / Hiler kitleler', preferredBadge: !isPerif || data.tumorSizeMm > 40 }
  ];
  let stage = 'Evre I (T1)';
  if (data.hasM1) stage = 'Evre IV (cM1)';
  else if (data.nodalStatus === 'cN1') stage = 'Evre III (cN1)';
  else if (data.tumorSizeMm > 100) stage = 'Evre II (T2b)';
  else if (data.tumorSizeMm > 70) stage = 'Evre II (T2a)';
  else if (data.tumorSizeMm > 40) stage = 'Evre I (T1b)';

  return { ajccStage: stage, stageSummary: data.isSolitaryKidney || data.lowGfr ? 'Nefron Koruma Zorunlu' : 'İnoperabl Primer RCC', color: data.lowGfr ? 'bg-orange-100 text-orange-900 border-orange-400' : 'bg-blue-50 text-blue-900 border-blue-300', strategy: data.lowGfr || data.isSolitaryKidney ? 'Düşük GFR / Soliter Böbrek: Nefron koruyucu ablatif SBRT.' : 'Ablatif Renal SBRT.', systemic: data.hasM1 ? 'TKI + İmmünoterapi.' : 'Gerekmez.', regimens, url: 'https://www.nccn.org', ref: 'I収RT / NCCN Kidney' };
}

// ============================================================================
// 4. REKTUM MOTORU
// ============================================================================
export function runRectumEngine(data: any): EngineOutput {
  const isHigh = String(data.clinicalT).includes('4') || data.mrfThreatened || data.nodalStatus === 'cN2' || data.emviPositive;
  const regimens: DoseRegimen[] = data.hasM1 
    ? [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Palyatif', regimenName: 'Palyatif (30 Gy / 10 fx)', totalDoseGy: 30, fractionCount: 10, dosePerFractionGy: 3, alphaBeta: 10, bedGy: 39, eqd2Gy: 32.5, targetVolumeCTV: 'Tümör', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '10mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Semptomatik lokal kontrol', preferredBadge: true }] 
    : isHigh 
    ? [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Kısa Kurs', regimenName: 'RAPIDO (25 Gy / 5 fx)', totalDoseGy: 25, fractionCount: 5, dosePerFractionGy: 5, alphaBeta: 10, bedGy: 37.5, eqd2Gy: 31.3, targetVolumeCTV: 'Mezorektum', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: 'Mezorektum', ctvToPtvMargin: '5mm', clinicalIndication: 'TNT Adayı', preferredBadge: true }] 
    : [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Uzun Kurs', regimenName: 'KRT (50.4 Gy)', totalDoseGy: 50.4, fractionCount: 28, dosePerFractionGy: 1.8, alphaBeta: 10, bedGy: 59.5, eqd2Gy: 49.6, targetVolumeCTV: 'Mezorektum', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '1-2cm', ctvToPtvMargin: '5mm', clinicalIndication: 'Standart', preferredBadge: true }];
  
  return { ajccStage: data.hasM1 ? 'Evre IV' : isHigh ? 'Evre III' : 'Evre II', stageSummary: data.hasM1 ? 'Metastatik' : isHigh ? 'Yüksek Risk (TNT)' : 'Orta Risk', color: data.hasM1 ? 'bg-purple-50 text-purple-900 border-purple-300' : isHigh ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-amber-50 text-amber-800 border-amber-300', strategy: isHigh ? 'TNT (Kısa Kurs RT -> KT -> TME).' : 'KRT -> TME.', systemic: 'CAPOX / FOLFOX.', regimens, url: 'https://www.nccn.org', ref: 'RAPIDO / ESMO' };
}

// ============================================================================
// 5. ANAL KANAL MOTORU
// ============================================================================
export function runAnalCanalEngine(data: any): EngineOutput {
  const dose = String(data.clinicalT).includes('3') || String(data.clinicalT).includes('4') || data.nodalStatus !== 'N0' ? 54.0 : 50.4;
  const regimens: DoseRegimen[] = [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Nigro Protokolü', regimenName: `SIB KRT (${dose} Gy)`, totalDoseGy: dose, fractionCount: dose === 54 ? 30 : 28, dosePerFractionGy: 1.8, alphaBeta: 10.0, bedGy: dose * 1.18, eqd2Gy: dose, targetVolumeCTV: 'Primer + İnguinal/Pelvik LN', volumeUnionHierarchy: 'PTV_Primer ∪ PTV_Elektif(45 Gy)', gtvToCtvMargin: '15-20 mm', ctvToPtvMargin: '5 mm', clinicalIndication: 'Organ Koruma', preferredBadge: true }];
  return { ajccStage: data.hasM1 ? 'Evre IV' : 'Evre II-III', stageSummary: data.hivPositive ? 'Anal Kanser (HIV+ / İmmünkompromize)' : 'Anal Skuamöz Karsinom', color: data.hivPositive ? 'bg-orange-50 text-orange-900 border-orange-400' : 'bg-rose-50 text-rose-900 border-rose-300', strategy: data.hivPositive ? 'Eşzamanlı KRT. ⚠️ HIV Pozitifliği: CD4+ sayımı >200 olmalı, antiretroviral tedaviye devam edilmeli.' : 'Eşzamanlı KRT (Mitomisin+5FU).', systemic: 'Mitomisin-C + 5-FU/Kapesitabin.', regimens, url: 'https://www.nccn.org', ref: 'ACT II' };
}

// ============================================================================
// 6. ÖZOFAGUS MOTORU
// ============================================================================
export function runEsophagusEngine(data: any): EngineOutput {
  const isNeoadj = data.intent === 'NEOADJUVANT_CROSS';
  const regimens: DoseRegimen[] = isNeoadj ? [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'CROSS', regimenName: 'Neoadjuvan KRT (41.4 Gy / 23 fx)', totalDoseGy: 41.4, fractionCount: 23, dosePerFractionGy: 1.8, alphaBeta: 10.0, bedGy: 48.85, eqd2Gy: 40.7, targetVolumeCTV: 'Özofagus + LN', volumeUnionHierarchy: 'PTV = CTV + 5 mm', gtvToCtvMargin: 'Boyuna 3-4 cm', ctvToPtvMargin: '5 mm', clinicalIndication: 'Rezekabl Torasik Özofagus', preferredBadge: true }] : [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Definitif KRT', regimenName: 'KRT (50.4 Gy / 28 fx)', totalDoseGy: 50.4, fractionCount: 28, dosePerFractionGy: 1.8, alphaBeta: 10.0, bedGy: 59.5, eqd2Gy: 49.6, targetVolumeCTV: 'Özofagus + LN', volumeUnionHierarchy: 'PTV = CTV + 5 mm', gtvToCtvMargin: 'Boyuna 3-5 cm', ctvToPtvMargin: '5 mm', clinicalIndication: 'Servikal/İnoperabl Özofagus', preferredBadge: true }];
  return { ajccStage: data.hasM1 ? 'Evre IV' : 'Evre II-III', stageSummary: isNeoadj ? 'CROSS Neoadjuvan' : 'Definitif KRT', color: 'bg-amber-50 text-amber-900 border-amber-300', strategy: isNeoadj ? 'KRT -> Özofajektomi.' : 'Definitif KRT.', systemic: isNeoadj ? 'Paklitaksel + Karboplatin.' : 'Sisplatin + 5-FU.', regimens, url: 'https://www.nccn.org', ref: 'CROSS Trial' };
}

// ============================================================================
// 7. PANKREAS MOTORU
// ============================================================================
export function runPancreasEngine(data: any): EngineOutput {
  const isBorderline = data.resectability === 'BORDERLINE_RESECTABLE';
  const regimens: DoseRegimen[] = [
    { categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'Pankreas SBRT', regimenName: 'SBRT (33-40 Gy / 5 fx)', totalDoseGy: 40.0, fractionCount: 5, dosePerFractionGy: 8.0, alphaBeta: 10.0, bedGy: 72.0, eqd2Gy: 60.0, targetVolumeCTV: 'Pankreas Kitle + Damar Teması (GTV=CTV)', volumeUnionHierarchy: 'PTV = ITV + 3 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: '3 mm', clinicalIndication: 'FOLFIRINOX sonrası konsolidasyon SBRT', preferredBadge: true }
  ];
  return { ajccStage: data.hasM1 ? 'Evre IV' : isBorderline ? 'Borderline Rezekabl' : 'Lokal İleri (LAPC)', stageSummary: isBorderline ? 'Sınırda Rezekabl Pankreas' : 'İnoperabl Lokal İleri Pankreas', color: 'bg-amber-50 text-amber-900 border-amber-300', strategy: 'İndüksiyon kemoterapisi (FOLFIRINOX) ardından yanıt alan olgularda ablatif SBRT.', systemic: 'FOLFIRINOX veya Gem-NabPaclitaxel.', regimens, url: 'https://www.nccn.org', ref: 'NCCN Pancreas' };
}

// ============================================================================
// 8. KARACİĞER MOTORU
// ============================================================================
export function runLiverEngine(data: any): EngineOutput {
  const isChildA = data.childPughScore === 'CLASS_A';
  const regimens: DoseRegimen[] = isChildA ? [
    { categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'Karaciğer SBRT', regimenName: 'SBRT (50 Gy / 5 fx)', totalDoseGy: 50.0, fractionCount: 5, dosePerFractionGy: 10.0, alphaBeta: 10.0, bedGy: 100.0, eqd2Gy: 83.3, targetVolumeCTV: 'Karaciğer Lezyonu (GTV=CTV)', volumeUnionHierarchy: 'PTV = ITV + 5 mm', gtvToCtvMargin: '0 mm', ctvToPtvMargin: '5 mm (ITV)', clinicalIndication: 'Child-Pugh A siroz veya oligometastaz', preferredBadge: true }
  ] : [];

  let strategy = 'Ablatif SBRT ile yüksek lokal kontrol.';
  if (!isChildA) strategy = '⚠️ Child-Pugh B/C Siroz: Karaciğer SBRT/RT karaciğer yetmezliği riski nedeniyle kontrendikedir.';

  return { ajccStage: data.hasM1 ? 'Evre IV / Metastatik' : 'HCC / Primer Karaciğer', stageSummary: isChildA ? 'Child-Pugh A Karaciğer SBRT Adayı' : 'Child-Pugh B/C (RT Kontrendike)', color: !isChildA ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : 'bg-emerald-50 text-emerald-900 border-emerald-300', strategy, systemic: 'Atezolizumab + Bevacizumab.', regimens: !isChildA ? [] : regimens, url: 'https://www.nccn.org', ref: 'ASTRO Liver SBRT' };
}

// ============================================================================
// 9. KHDAK (AKCİĞER) MOTORU
// ============================================================================
export function runLungNsclcEngine(data: any): EngineOutput {
  const isN2 = data.nodalStatus === 'cN2' || data.nodalStatus === 'cN3';
  const regimens: DoseRegimen[] = data.hasM1 
    ? [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Palyatif', regimenName: 'Palyatif RT (30 Gy)', totalDoseGy: 30, fractionCount: 10, dosePerFractionGy: 3, alphaBeta: 10, bedGy: 39, eqd2Gy: 32.5, targetVolumeCTV: 'Kitle', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '5mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Palyasyon', preferredBadge: true }] 
    : isN2 
    ? [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Eşzamanlı KRT', regimenName: 'KRT (60 Gy)', totalDoseGy: 60, fractionCount: 30, dosePerFractionGy: 2, alphaBeta: 10, bedGy: 72, eqd2Gy: 60, targetVolumeCTV: 'Primer+Mediasten', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '5-7mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Standart', preferredBadge: !data.hasILD }] 
    : [{ categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'SBRT', regimenName: 'SBRT (54 Gy / 3 fx)', totalDoseGy: 54, fractionCount: 3, dosePerFractionGy: 18, alphaBeta: 10, bedGy: 151.2, eqd2Gy: 126, targetVolumeCTV: 'ITV', volumeUnionHierarchy: 'PTV=ITV+5mm', gtvToCtvMargin: 'ITV', ctvToPtvMargin: '5mm', clinicalIndication: 'Ablatif', preferredBadge: !data.hasILD }];
  
  let strategy = data.hasM1 ? 'Palyatif RT / Sistemik Tedavi.' : isN2 ? 'KRT + Durvalumab.' : 'SBRT.';
  if (data.hasILD) strategy = '⚠️ RÖLATİF KONTRENDİKASYON: İnterstisyel Akciğer Hastalığı (ILD) fatal pnömoni riski taşır. SBRT/RT çok dikkatli seçilmelidir.';
  return { ajccStage: data.hasM1 ? 'Evre IV' : isN2 ? 'Evre III' : 'Evre I-II', stageSummary: data.hasM1 ? 'Metastatik KHDAK' : isN2 ? 'Lokal İleri KHDAK' : 'Erken Evre KHDAK', color: data.hasILD ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : (data.hasM1 ? 'bg-purple-50 text-purple-900 border-purple-300' : isN2 ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'), strategy, systemic: isN2 ? 'Sisplatin/Etopozid.' : 'Yok.', regimens, url: 'https://www.nccn.org', ref: 'NCCN NSCLC' };
}

// ============================================================================
// 10. KHAK MOTORU
// ============================================================================
export function runLungSclcEngine(data: any): EngineOutput {
  const isLim = data.stageExtent === 'LIMITED_STAGE';
  const regimens: DoseRegimen[] = isLim 
    ? [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'BID KRT', regimenName: 'KRT (45 Gy / 30 fx BID)', totalDoseGy: 45, fractionCount: 30, dosePerFractionGy: 1.5, alphaBeta: 10, bedGy: 51.75, eqd2Gy: 43.1, targetVolumeCTV: 'Primer+Nodal', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '5mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Standart', preferredBadge: true }] 
    : [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Konsolidasyon', regimenName: 'Torasik RT (30 Gy)', totalDoseGy: 30, fractionCount: 10, dosePerFractionGy: 3, alphaBeta: 10, bedGy: 39, eqd2Gy: 32.5, targetVolumeCTV: 'Rezidü', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '5mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Palyatif', preferredBadge: true }];
  
  return { ajccStage: isLim ? 'Sınırlı Evre' : 'Yaygın Evre', stageSummary: isLim ? 'Sınırlı KHAK' : 'Yaygın KHAK', color: data.hasILD ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : isLim ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-purple-50 text-purple-900 border-purple-300', strategy: data.hasILD ? '⚠️ ILD nedeniyle torasik RT yüksek risklidir.' : isLim ? 'BID KRT -> PCI.' : 'Kemoterapi -> Torasik RT.', systemic: 'Sisplatin/Etopozid.', regimens, url: 'https://www.nccn.org', ref: 'NCCN SCLC' };
}

// ============================================================================
// 11. NAZOFARİNKS MOTORU
// ============================================================================
export function runNasopharynxEngine(data: any): EngineOutput {
  const regimens: DoseRegimen[] = [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: '3 Kademeli SIB', regimenName: 'SIB-IMRT (70/60/54 Gy)', totalDoseGy: 70, fractionCount: 33, dosePerFractionGy: 2.12, alphaBeta: 10, bedGy: 84.8, eqd2Gy: 70.7, targetVolumeCTV: 'GTV+Boyun', volumeUnionHierarchy: 'PTV_70 ⊂ PTV_60 ⊂ PTV_54', gtvToCtvMargin: '5-10mm', ctvToPtvMargin: '3mm', clinicalIndication: 'Standart SIB', preferredBadge: true }];
  let stage = 'Evre II-IVA';
  if (data.hasM1) stage = 'Evre IVB';
  else if (data.tStage === 'T4' || data.nStage === 'N3') stage = 'Evre IVA';
  return { ajccStage: stage, stageSummary: 'Nazofarinks Kanseri', color: data.hasM1 ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-rose-50 text-rose-900 border-rose-300', strategy: 'İndüksiyon KT -> Eşzamanlı KRT.', systemic: 'Gemsitabin/Sisplatin.', regimens, url: 'https://www.nccn.org', ref: 'NCCN H&N' };
}

// ============================================================================
// 12. HİPOFARİNKS MOTORU
// ============================================================================
export function runHypopharynxEngine(data: any): EngineOutput {
  const regimens: DoseRegimen[] = [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'SIB-IMRT', regimenName: 'Definitif KRT (70/63/56 Gy)', totalDoseGy: 70, fractionCount: 35, dosePerFractionGy: 2, alphaBeta: 10, bedGy: 84, eqd2Gy: 70, targetVolumeCTV: 'Primer+Boyun LN', volumeUnionHierarchy: 'PTV_70 ⊂ PTV_56', gtvToCtvMargin: '10mm', ctvToPtvMargin: '3-5mm', clinicalIndication: 'Organ Koruma', preferredBadge: true }];
  let stage = 'Evre III-IVA';
  if (data.hasM1) stage = 'Evre IVC';
  else if (data.clinicalT === 'T4b') stage = 'Evre IVB';
  else if (data.clinicalT === 'T4a' || data.nodalStatus === 'N2' || data.nodalStatus === 'N3') stage = 'Evre IVA';
  return { ajccStage: stage, stageSummary: 'Hipofarinks Kanseri', color: data.hasM1 ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-amber-50 text-amber-800 border-amber-300', strategy: 'Eşzamanlı KRT.', systemic: 'Sisplatin.', regimens, url: 'https://www.nccn.org', ref: 'NCCN H&N' };
}

// ============================================================================
// 13. SERVİKS MOTORU
// ============================================================================
export function runCervixEngine(data: any): EngineOutput {
  let stage = 'FIGO IB1';
  if (data.hasM1) stage = 'FIGO IVB';
  else if (data.bladderRectumInv) stage = 'FIGO IVA';
  else if (data.paraAorticNodePositive) stage = 'FIGO IIIC2';
  else if (data.pelvicNodePositive) stage = 'FIGO IIIC1';
  else if (data.pelvicWallOrHydronephrosis) stage = 'FIGO IIIB';
  else if (data.vaginalLowerThird) stage = 'FIGO IIIA';
  else if (data.parametrialInvasion) stage = 'FIGO IIB';
  else if (data.tumorSizeMm > 40) stage = 'FIGO IB3';
  else if (data.tumorSizeMm > 20) stage = 'FIGO IB2';

  const regimens: DoseRegimen[] = [
    { categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'EBRT + SIB', regimenName: 'EMBRACE II KRT (45 Gy) + SIB', totalDoseGy: 45, fractionCount: 25, dosePerFractionGy: 1.8, alphaBeta: 10, bedGy: 53.1, eqd2Gy: 44.3, targetVolumeCTV: 'Serviks, Uterus, Parametriyum, LN', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: 'Anatomik', ctvToPtvMargin: '5mm', clinicalIndication: 'Küratif', preferredBadge: true }, 
    { categoryRank: '4_BOOST_OZEL', modalityDisplay: 'IGABT', regimenName: '3D MR Brakiterapi', totalDoseGy: 28, fractionCount: 4, dosePerFractionGy: 7, alphaBeta: 10, bedGy: 47.6, eqd2Gy: 39.7, targetVolumeCTV: 'HR-CTV', volumeUnionHierarchy: '0mm', gtvToCtvMargin: '0mm', ctvToPtvMargin: '0mm', clinicalIndication: 'Küratif Boost', preferredBadge: true }
  ];
  return { ajccStage: stage, stageSummary: 'Lokal İleri Serviks', color: 'bg-rose-50 text-rose-900 border-rose-300', strategy: 'Eşzamanlı KRT + IGABT Brakiterapi.', systemic: 'Sisplatin.', regimens, url: 'https://www.nccn.org', ref: 'EMBRACE II & FIGO 2018' };
}

// ============================================================================
// 14. ENDOMETRİYUM MOTORU
// ============================================================================
export function runEndometriumEngine(data: any): EngineOutput {
  const isHigh = data.stage === 'STAGE_III_HIGH_RISK_NODAL' || (data.grade === 3 && data.deepMyometrialInvasion);
  const isHIR = data.stage === 'STAGE_I_HIGH_INTERMEDIATE' || (data.lvsiPositive && data.deepMyometrialInvasion);
  const regimens: DoseRegimen[] = isHigh 
    ? [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Pelvik EBRT', regimenName: 'Pelvik RT (45 Gy)', totalDoseGy: 45, fractionCount: 25, dosePerFractionGy: 1.8, alphaBeta: 10, bedGy: 53.1, eqd2Gy: 44.3, targetVolumeCTV: 'Vajen kafı + LN', volumeUnionHierarchy: 'PTV=CTV+5-7mm', gtvToCtvMargin: '7mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Yüksek Risk', preferredBadge: true }] 
    : [{ categoryRank: '4_BOOST_OZEL', modalityDisplay: 'VBT', regimenName: 'Vajinal Kaf Brakiterapisi (21 Gy)', totalDoseGy: 21, fractionCount: 3, dosePerFractionGy: 7, alphaBeta: 10, bedGy: 35.7, eqd2Gy: 29.8, targetVolumeCTV: 'Vajen üst 1/3', volumeUnionHierarchy: '0mm', gtvToCtvMargin: '0mm', ctvToPtvMargin: '0mm', clinicalIndication: 'HIR (PORTEC-2)', preferredBadge: true }];
  
  return { ajccStage: isHigh ? 'Evre III / Yüksek Risk' : isHIR ? 'Evre I HIR' : 'Evre IA Düşük Risk', stageSummary: isHigh ? 'Yüksek Risk Endometriyum' : isHIR ? 'Yüksek-Orta Risk' : 'Düşük Risk', color: isHigh ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300', strategy: isHigh ? 'EBRT + Kemoterapi.' : isHIR ? 'Sadece VBT.' : 'Gözlem.', systemic: isHigh ? 'Karboplatin+Paklitaksel.' : 'Yok.', regimens, url: 'https://www.nccn.org', ref: 'PORTEC / FIGO' };
}

// ============================================================================
// 15. MEME MOTORU (DİNAMİK JSON DESTEKLİ)
// ============================================================================
export function runBreastEngine(data: any): EngineOutput {
  const isTNBC = !data.erPositive && !data.prPositive && !data.her2Positive;
  const subtype = isTNBC ? 'Triple Negative' : data.her2Positive ? 'HER2 Pozitif' : 'Luminal';
  const rni = data.positiveNodes >= 4 ? 'Kapsamlı RNI' : data.positiveNodes >= 1 ? 'RNI (Supraklavikuler)' : 'RNI Gerekmez';
  
  const dbRegimens = (guidelinesData.guidelines.breast?.regimens || []) as DoseRegimen[];
  
  const fastForward = dbRegimens.find(r => r.id === 'fast_forward') || {
    categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Ultra-Hipofraksiyone', regimenName: 'FAST-Forward (26 Gy / 5 fx)',
    totalDoseGy: 26.0, fractionCount: 5, dosePerFractionGy: 5.2, alphaBeta: 4.0, bedGy: 59.8, eqd2Gy: 39.9,
    targetVolumeCTV: 'Tüm Meme', volumeUnionHierarchy: 'PTV = CTV + 5 mm', gtvToCtvMargin: 'Glanduler doku', ctvToPtvMargin: '5 mm', clinicalIndication: '1 haftalık standart WBI'
  };

  const startB = dbRegimens.find(r => r.id === 'start_b_pmrt') || {
    categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Orta-Hipofraksiyone', regimenName: 'START-B (40.05 Gy / 15 fx)',
    totalDoseGy: 40.05, fractionCount: 15, dosePerFractionGy: 2.67, alphaBeta: 4.0, bedGy: 66.8, eqd2Gy: 44.5,
    targetVolumeCTV: `Meme/Göğüs Duvarı ± ${rni}`, volumeUnionHierarchy: 'PTV = CTV + 5 mm', gtvToCtvMargin: 'ESTRO sınırları', ctvToPtvMargin: '5 mm', clinicalIndication: 'RNI/PMRT standardı'
  };

  const regimens: DoseRegimen[] = [
    { ...fastForward, preferredBadge: data.positiveNodes === 0 },
    { ...startB, preferredBadge: data.positiveNodes > 0 }
  ];

  let strategy = data.brcaMutated ? 'BRCA Mutasyonu mevcut: BCT yerine Bilateral Mastektomi düşünülmelidir. PMRT ± RNI.' : data.surgery === 'BCT' ? 'WBI ± Boost.' : 'PMRT + RNI.';
  let systemic = 'Kemoterapi Öncelikli.';
  if (data.erPositive) systemic = data.menopausalStatus === 'PRE' ? 'Ovaryan Süpresyon + Tamoksifen.' : 'Aromataz İnhibitörü.';

  return { ajccStage: data.hasM1 ? 'Evre IV' : data.positiveNodes > 3 ? 'Evre IIIC' : data.positiveNodes > 0 ? 'Evre II/IIIA' : 'Evre I', stageSummary: subtype, color: isTNBC || data.brcaMutated ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300', strategy, systemic, regimens, url: guidelinesData.guidelines.breast?.referenceUrl || 'https://www.astro.org', ref: guidelinesData.guidelines.breast?.reference || 'ASTRO / NCCN' };
}

// ============================================================================
// 16. GLİOM MOTORU
// ============================================================================
export function runGliomaEngine(data: any): EngineOutput {
  const isGrade4 = data.idhStatus === 'WILDTYPE' || data.cdkn2aHomozygousLoss || data.histologyGrade === 4;
  const isElderly = data.patientAge >= 70 || data.kpsScore < 70;
  const regimens: DoseRegimen[] = isGrade4 
    ? (isElderly 
      ? [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Hipofraksiyone', regimenName: 'Yaşlı Şeması (40.05 Gy)', totalDoseGy: 40.05, fractionCount: 15, dosePerFractionGy: 2.67, alphaBeta: 10, bedGy: 50.7, eqd2Gy: 42.3, targetVolumeCTV: 'Kavite+Rezidü', volumeUnionHierarchy: 'PTV=CTV+3mm', gtvToCtvMargin: '15mm', ctvToPtvMargin: '3mm', clinicalIndication: 'Kırılgan', preferredBadge: true }] 
      : [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Stupp', regimenName: 'Stupp (60 Gy / 30 fx)', totalDoseGy: 60, fractionCount: 30, dosePerFractionGy: 2, alphaBeta: 10, bedGy: 72, eqd2Gy: 60, targetVolumeCTV: 'Kavite+Ödem', volumeUnionHierarchy: 'PTV=CTV+3-5mm', gtvToCtvMargin: '20mm', ctvToPtvMargin: '3mm', clinicalIndication: 'Standart GBM', preferredBadge: true }]) 
    : [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'LGG', regimenName: 'LGG (50.4-54 Gy)', totalDoseGy: 50.4, fractionCount: 28, dosePerFractionGy: 1.8, alphaBeta: 10, bedGy: 59.5, eqd2Gy: 49.6, targetVolumeCTV: 'FLAIR', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '15mm', ctvToPtvMargin: '5mm', clinicalIndication: 'LGG Adjuvan', preferredBadge: true }];
  
  return { ajccStage: isGrade4 ? 'WHO Grade 4 (GBM)' : 'WHO Grade 2-3', stageSummary: data.severeMassEffect ? 'ACİL DEKOMPRESYON GEREKLİ' : isGrade4 ? 'Glioblastoma' : 'Düşük Dereceli Gliom', color: data.severeMassEffect ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : isGrade4 ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-blue-50 text-blue-800 border-blue-300', strategy: data.severeMassEffect ? '⚠️ CİDDİ KİTLE ETKİSİ / ŞİFT: RT kontrendikedir, acil nöroşirürjikal dekompresyon ve anti-ödem tedavi şarttır.' : isGrade4 ? 'RT + TMZ.' : 'RT + PCV/TMZ.', systemic: 'Temozolomid. Deksametazon taper.', regimens: data.severeMassEffect ? [] : regimens, url: 'https://www.eano.eu', ref: 'EANO' };
}

// ============================================================================
// 17. MENENJİOM MOTORU
// ============================================================================
export function runMeningiomaEngine(data: any): EngineOutput {
  const canDoSRS = data.whoGrade === 1 && data.tumorSizeMm <= 30 && !data.isOpticChiasmClose && !data.severeMassEffect;
  const regimens: DoseRegimen[] = canDoSRS 
    ? [{ categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'SRS', regimenName: 'Tek Seans SRS (12-14 Gy)', totalDoseGy: 14, fractionCount: 1, dosePerFractionGy: 14, alphaBeta: 3, bedGy: 79.3, eqd2Gy: 47.6, targetVolumeCTV: 'Tümör', volumeUnionHierarchy: 'PTV=CTV+1mm', gtvToCtvMargin: '0mm', ctvToPtvMargin: '1mm', clinicalIndication: 'Küçük benign', preferredBadge: true }] 
    : [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Fraksiyone IMRT', regimenName: `IMRT (${data.whoGrade === 1 ? '54 Gy' : '59.4-66 Gy'})`, totalDoseGy: data.whoGrade === 1 ? 54 : 60, fractionCount: data.whoGrade === 1 ? 30 : 33, dosePerFractionGy: 1.8, alphaBeta: 3, bedGy: 86.4, eqd2Gy: 51.8, targetVolumeCTV: 'GTV + dural kuyruk', volumeUnionHierarchy: 'PTV=CTV+2-3mm', gtvToCtvMargin: '5mm', ctvToPtvMargin: '2-3mm', clinicalIndication: 'Standart Fraksiyone', preferredBadge: true }];
  
  return { ajccStage: `Grade ${data.whoGrade}`, stageSummary: data.severeMassEffect ? 'ACİL DEKOMPRESYON GEREKLİ' : 'Menenjiom', color: data.severeMassEffect ? 'bg-rose-100 text-rose-950 font-bold border-rose-500' : 'bg-emerald-50 text-emerald-800 border-emerald-300', strategy: data.severeMassEffect ? '⚠️ CİDDİ KİTLE ETKİSİ: SRS mutlak kontrendike. Açık cerrahi dekompresyon gerekir.' : canDoSRS ? 'SRS.' : 'Fraksiyone RT.', systemic: 'Yok.', regimens: data.severeMassEffect ? [] : regimens, url: 'https://www.eano.eu', ref: 'EANO' };
}

// ============================================================================
// 18. YUMUŞAK DOKU SARKOMU MOTORU
// ============================================================================
export function runSarcomaEngine(data: any): EngineOutput {
  const isPreop = data.setting === 'PREOPERATIVE';
  const regimens: DoseRegimen[] = isPreop ? [
    { categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Preop RT', regimenName: 'Preoperatif STS (50 Gy / 25 fx)', totalDoseGy: 50.0, fractionCount: 25, dosePerFractionGy: 2.0, alphaBeta: 4.0, bedGy: 75.0, eqd2Gy: 50.0, targetVolumeCTV: 'GTV + Boyuna 3-4 cm, radyal 1.5 cm', volumeUnionHierarchy: 'PTV = CTV + 5-7 mm', gtvToCtvMargin: 'Boyuna 30-40 mm, radyal 15 mm', ctvToPtvMargin: '5-7 mm', clinicalIndication: 'Preoperatif standart', preferredBadge: true }
  ] : [
    { categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Postop RT', regimenName: 'Postoperatif STS (60-66 Gy)', totalDoseGy: 60.0, fractionCount: 30, dosePerFractionGy: 2.0, alphaBeta: 4.0, bedGy: 90.0, eqd2Gy: 60.0, targetVolumeCTV: 'Cerrahi Yatak + Marjlar', volumeUnionHierarchy: 'PTV = CTV + 7 mm', gtvToCtvMargin: 'Boyuna 30 mm, radyal 15 mm', ctvToPtvMargin: '7 mm', clinicalIndication: 'Postoperatif R1 / Yüksek Grade', preferredBadge: true }
  ];
  return { ajccStage: data.hasM1 ? 'Evre IV' : data.depth === 'DEEP' ? 'Evre III (Derin Kompartman)' : 'Evre I/II (Yüzeyel)', stageSummary: data.depth === 'DEEP' ? 'Derin Yerleşimli Yüksek Grade STS' : 'Yüzeyel Sarkom', color: 'bg-indigo-50 text-indigo-900 border-indigo-300', strategy: isPreop ? 'Preoperatif 50 Gy.' : 'Postoperatif 60-66 Gy.', systemic: 'Doxorubicin + Ifosfamid.', regimens, url: 'https://www.nccn.org', ref: 'NCCN Soft Tissue Sarcoma' };
}

// ============================================================================
// 19. KUTANÖZ MELANOM MOTORU
// ============================================================================
export function runMelanomaEngine(data: any): EngineOutput {
  const regimens: DoseRegimen[] = data.setting === 'BRAIN_METASTASIS' 
    ? [{ categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'SRS', regimenName: 'Beyin Met SRS (18-24 Gy)', totalDoseGy: 21.0, fractionCount: 1, dosePerFractionGy: 21.0, alphaBeta: 2.5, bedGy: 197.4, eqd2Gy: 109.7, targetVolumeCTV: 'GTV', volumeUnionHierarchy: 'PTV=CTV+1mm', gtvToCtvMargin: '0mm', ctvToPtvMargin: '1mm', clinicalIndication: 'Ablatif', preferredBadge: true }] 
    : [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Adjuvan', regimenName: 'Adjuvan Nodal RT (48 Gy / 20 fx)', totalDoseGy: 48.0, fractionCount: 20, dosePerFractionGy: 2.4, alphaBeta: 2.5, bedGy: 94.1, eqd2Gy: 52.3, targetVolumeCTV: 'Lenf Nodu Havzası', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: 'Cerrahi yatak', ctvToPtvMargin: '5mm', clinicalIndication: 'Nodal nüks önleme', preferredBadge: true }];
  
  return { ajccStage: data.hasM1 ? 'Evre IV (Metastatik)' : data.sentinelNodePositive ? 'Evre III (Nodal+)' : 'Evre I-II (Kutanöz)', stageSummary: data.immunosuppressed ? 'İmmünosuprese Melanom' : 'Melanom', color: data.immunosuppressed ? 'bg-orange-100 text-orange-950 font-bold border-orange-400' : 'bg-rose-50 text-rose-900 border-rose-300', strategy: data.immunosuppressed ? '⚠️ İmmünosupresyon agresif seyir demektir, adjuvan eşiği düşüktür.' : data.setting === 'BRAIN_METASTASIS' ? 'SRS.' : 'Adjuvan Havza RT.', systemic: 'İmmünoterapi / BRAF.', regimens, url: 'https://www.nccn.org', ref: 'NCCN Melanoma' };
}

// ============================================================================
// 20. NON-MELANOMA CİLT (BCC / cSCC) MOTORU
// ============================================================================
export function runNmscEngine(data: any): EngineOutput {
  const regimens: DoseRegimen[] = [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Definitif RT', regimenName: 'Fraksiyone RT (60-66 Gy)', totalDoseGy: 60.0, fractionCount: 30, dosePerFractionGy: 2.0, alphaBeta: 8.0, bedGy: 75.0, eqd2Gy: 60.0, targetVolumeCTV: 'Primer / Yatak', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: '10-15mm', ctvToPtvMargin: '5mm', clinicalIndication: 'Yüksek Risk / R1', preferredBadge: true }];
  return { ajccStage: data.hasM1 ? 'Evre IV' : 'Evre I-III', stageSummary: data.immunosuppressed ? 'İmmünosuprese BCC/cSCC' : 'BCC / cSCC', color: data.immunosuppressed ? 'bg-orange-100 text-orange-950 font-bold border-orange-400' : 'bg-amber-50 text-amber-900 border-amber-300', strategy: data.immunosuppressed ? '⚠️ Transplant/İmmünosuprese hasta: Agresif seyreder, Adjuvan RT şiddetle önerilir.' : 'Cerrahi veya Definitif/Adjuvan RT.', systemic: 'Cemiplimab.', regimens, url: 'https://www.nccn.org', ref: 'NCCN NMSC' };
}

// ============================================================================
// 21. PALYATİF KEMİK MOTORU
// ============================================================================
export function runBonePalliativeEngine(data: any): EngineOutput {
  const isSbrt = data.clinicalScenario === 'OLIGOMET_SPINE_SBRT';
  const isCordComp = data.clinicalScenario === 'SPINAL_CORD_COMPRESSION';
  const lifeEx = data.lifeExpectancyMonths;
  let regimens: DoseRegimen[] = [];
  if (lifeEx === '<3') regimens = [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Tek Doz', regimenName: 'Tek Fraksiyon Kemik RT (8 Gy / 1 fx)', totalDoseGy: 8, fractionCount: 1, dosePerFractionGy: 8, alphaBeta: 10, bedGy: 14.4, eqd2Gy: 12, targetVolumeCTV: 'Ağrılı kemik', volumeUnionHierarchy: 'PTV=CTV+5-10mm', gtvToCtvMargin: '10mm', ctvToPtvMargin: '5-10mm', clinicalIndication: 'Kısa yaşam beklentisi standart', preferredBadge: true }];
  else if (isSbrt) regimens = [{ categoryRank: '3_ULTRA_HIPOFRAKSIYONE_SBRT', modalityDisplay: 'Spinal SBRT', regimenName: 'SBRT (16-18 Gy / 1 fx)', totalDoseGy: 18, fractionCount: 1, dosePerFractionGy: 18, alphaBeta: 2, bedGy: 180, eqd2Gy: 90, targetVolumeCTV: 'Vertebra', volumeUnionHierarchy: 'PTV=CTV+1.5mm', gtvToCtvMargin: 'WBB', ctvToPtvMargin: '1.5mm', clinicalIndication: 'Oligometastatik', preferredBadge: true }];
  else if (isCordComp) regimens = [{ categoryRank: '1_KONVANSIYONEL', modalityDisplay: 'Dekompresyon', regimenName: 'Palyatif (30 Gy / 10 fx)', totalDoseGy: 30, fractionCount: 10, dosePerFractionGy: 3, alphaBeta: 10, bedGy: 39, eqd2Gy: 32.5, targetVolumeCTV: 'Vertebra + Kord', volumeUnionHierarchy: 'PTV=CTV+5mm', gtvToCtvMargin: 'Vertebra', ctvToPtvMargin: '5mm', clinicalIndication: 'Acil / Postop', preferredBadge: true }];
  else regimens = [{ categoryRank: '2_HIPOFRAKSIYONE', modalityDisplay: 'Tek Doz', regimenName: 'Tek Fraksiyon (8 Gy / 1 fx)', totalDoseGy: 8, fractionCount: 1, dosePerFractionGy: 8, alphaBeta: 10, bedGy: 14.4, eqd2Gy: 12, targetVolumeCTV: 'Ağrılı kemik', volumeUnionHierarchy: 'PTV=CTV+5-10mm', gtvToCtvMargin: '10mm', ctvToPtvMargin: '5-10mm', clinicalIndication: 'ASTRO Kategori 1', preferredBadge: true }];
  return { ajccStage: 'Palyatif M1', stageSummary: lifeEx === '<3' ? 'Kısa Yaşam Beklentisi' : isSbrt ? 'Oligometastaz' : isCordComp ? 'Kord Basısı' : 'Kemik Ağrısı', color: isCordComp ? 'bg-rose-100 text-rose-950 font-bold' : lifeEx === '<3' ? 'bg-slate-200 text-slate-800' : 'bg-amber-50 text-amber-900 border-amber-300', strategy: lifeEx === '<3' ? 'SADECE 8 Gy Tek Fraksiyon önerilir.' : isSbrt ? 'SBRT.' : isCordComp ? 'Acil Dekompresyon RT.' : '8 Gy Tek Fraksiyon.', systemic: 'Zoledronik Asit.', regimens, url: 'https://www.astro.org', ref: 'ASTRO Bone' };
}