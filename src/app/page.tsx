'use client';

import React, { useState } from 'react';
import { DISEASE_CATALOG, MAIN_GROUPS } from '../data/catalog';
import { EngineOutput } from '../types';
import {
  runProstateEngine, runBladderEngine, runKidneyRccEngine, runRectumEngine,
  runAnalCanalEngine, runEsophagusEngine, runPancreasEngine, runLiverEngine,
  runLungNsclcEngine, runLungSclcEngine, runNasopharynxEngine, runHypopharynxEngine,
  runCervixEngine, runEndometriumEngine, runBreastEngine, runGliomaEngine,
  runMeningiomaEngine, runSarcomaEngine, runMelanomaEngine, runNmscEngine,
  runBonePalliativeEngine
} from '../engines';

const TNM_DICTIONARY: Record<string, { 
  T: {label:string, desc:string, val:string}[], 
  N: {label:string, desc:string, val:string}[],
  M?: {label:string, desc:string, val:boolean}[]
}> = {
  rectum: {
    T: [
      { label: 'cT1-T2', desc: 'Tümör submukoza veya muskularis propriaya invaze', val: 'cT1-T2' },
      { label: 'cT3a/b', desc: 'Tümör mezorektal yağ dokusuna invaze (< 5mm derinlik)', val: 'cT3a/b' },
      { label: 'cT3c/d', desc: 'Tümör mezorektal yağ dokusuna derin invaze (> 5mm derinlik)', val: 'cT3c/d' },
      { label: 'cT4', desc: 'Tümör viseral peritona veya komşu organlara invaze', val: 'cT4' }
    ],
    N: [
      { label: 'cN0', desc: 'Bölgesel lenf nodu metastazı yok', val: 'cN0' },
      { label: 'cN1', desc: '1-3 adet bölgesel lenf nodu metastazı', val: 'cN1' },
      { label: 'cN2', desc: '4 veya daha fazla bölgesel lenf nodu metastazı', val: 'cN2' }
    ],
    M: [
      { label: 'cM0', desc: 'Uzak metastaz saptanmadı', val: false },
      { label: 'cM1', desc: 'Uzak organ/periton metastazı mevcut', val: true }
    ]
  },
  esophagus: {
    T: [
      { label: 'T1-T2', desc: 'Tümör submukoza veya muskularis propriaya invaze', val: 'T1-T2' },
      { label: 'T3', desc: 'Tümör adventisyaya invaze', val: 'T3' },
      { label: 'T4', desc: 'Tümör komşu yapılara (plevra, perikard, aort) invaze', val: 'T4' }
    ],
    N: [
      { label: 'N0', desc: 'Lenf nodu metastazı yok', val: 'N0' },
      { label: 'N1', desc: '1-2 adet bölgesel LN metastazı', val: 'N1' },
      { label: 'N2', desc: '3-6 adet bölgesel LN metastazı', val: 'N2' },
      { label: 'N3', desc: '7 ve üzeri bölgesel LN metastazı', val: 'N3' }
    ],
    M: [
      { label: 'M0', desc: 'Uzak metastaz yok', val: false },
      { label: 'M1', desc: 'Uzak metastaz mevcut', val: true }
    ]
  },
  lung_nsclc: {
    T: [
      { label: 'T1', desc: 'Tümör çapı ≤ 3 cm', val: 'T1a-T1c (<=3cm)' },
      { label: 'T2', desc: 'Tümör çapı 3-5 cm arası veya viseral plevra invazyonu', val: 'T2a-T2b (3-5cm)' },
      { label: 'T3', desc: 'Tümör çapı > 5 cm veya göğüs duvarı/perikard invazyonu', val: 'T3 (>5cm / invazyon)' },
      { label: 'T4', desc: 'Tümör çapı > 7 cm veya mediasten/kalp/trakea invazyonu', val: 'T4 (Mediasten/Omurga/Kalp)' }
    ],
    N: [
      { label: 'N0', desc: 'Lenf nodu metastazı yok', val: 'N0' },
      { label: 'N1', desc: 'İpsilateral hiler / peribronşiyal LN', val: 'N1' },
      { label: 'N2', desc: 'İpsilateral mediastinal / subkarinal LN', val: 'N2' },
      { label: 'N3', desc: 'Kontralateral mediastinal veya supraklavikular LN', val: 'N3' }
    ],
    M: [
      { label: 'M0', desc: 'Metastaz yok', val: false },
      { label: 'M1', desc: 'Plevral effüzyon, kontralateral nodül veya uzak organ', val: true }
    ]
  },
  prostate: {
    T: [
      { label: 'T1', desc: 'Klinik olarak saptanamayan', val: 'cT1a-cT1c' },
      { label: 'T2', desc: 'Tümör prostatta sınırlı', val: 'cT2a' },
      { label: 'T3a', desc: 'Ekstrakapsüler uzanım (EPE)', val: 'cT3a' },
      { label: 'T3b', desc: 'Seminal vezikül invazyonu (SVI)', val: 'cT3b' },
      { label: 'T4', desc: 'Komşu dokulara invaze', val: 'cT4' }
    ],
    N: [],
    M: [{ label: 'cM0', desc: 'Yok', val: false }, { label: 'cM1', desc: 'Var', val: true }]
  },
  bladder: {
    T: [
      { label: 'T2', desc: 'Kasa invaze', val: 'cT2a-cT2b' },
      { label: 'T3', desc: 'Perivezikal yağ invazyonu', val: 'cT3a-cT3b' },
      { label: 'T4a', desc: 'Prostat/Uterus/Vajen', val: 'cT4a' },
      { label: 'T4b', desc: 'Pelvik duvara fikse', val: 'cT4b' }
    ],
    N: [{ label: 'cN0', desc: 'Yok', val: 'cN0' }, { label: 'cN1', desc: 'Tek LN', val: 'cN1' }, { label: 'cN2-N3', desc: 'Çoklu LN', val: 'cN2-N3' }],
    M: [{ label: 'cM0', desc: 'Yok', val: false }, { label: 'cM1', desc: 'Var', val: true }]
  },
  nasopharynx: {
    T: [
      { label: 'T1', desc: 'Nazofarinkste sınırlı', val: 'T1' },
      { label: 'T2', desc: 'Parafaringeal alan', val: 'T2' },
      { label: 'T3', desc: 'Kafa tabanı', val: 'T3' },
      { label: 'T4', desc: 'İntrakraniyal/KR', val: 'T4' }
    ],
    N: [{ label: 'N0', desc: 'Yok', val: 'N0' }, { label: 'N1', desc: 'Tek taraflı', val: 'N1' }, { label: 'N2', desc: 'Çift taraflı', val: 'N2' }, { label: 'N3', desc: '>6cm / Supraklavikuler', val: 'N3' }],
    M: [{ label: 'M0', desc: 'Yok', val: false }, { label: 'M1', desc: 'Var', val: true }]
  },
  hypopharynx: {
    T: [
      { label: 'T1', desc: '≤ 2 cm', val: 'T1' },
      { label: 'T2', desc: '2-4 cm', val: 'T2' },
      { label: 'T3', desc: '> 4 cm veya vokal kord fiksasyonu', val: 'T3' },
      { label: 'T4', desc: 'Tiroid kıkırdak / yumuşak doku', val: 'T4a' }
    ],
    N: [{ label: 'N0', desc: 'Yok', val: 'N0' }, { label: 'N1', desc: 'Tek LN ≤ 3cm', val: 'N1' }, { label: 'N2', desc: 'LN 3-6cm', val: 'N2' }, { label: 'N3', desc: 'LN > 6cm', val: 'N3' }],
    M: [{ label: 'M0', desc: 'Yok', val: false }, { label: 'M1', desc: 'Var', val: true }]
  },
  anal_canal: {
    T: [
      { label: 'T1', desc: '≤ 2 cm', val: 'T1 (<=2cm)' },
      { label: 'T2', desc: '2-5 cm', val: 'T2 (2-5cm)' },
      { label: 'T3', desc: '> 5 cm', val: 'T3 (>5cm)' },
      { label: 'T4', desc: 'Komşu organ', val: 'T4 (Komşu organ)' }
    ],
    N: [{ label: 'N0', desc: 'Yok', val: 'N0' }, { label: 'N1', desc: 'Bölgesel LN', val: 'N1a' }],
    M: [{ label: 'M0', desc: 'Yok', val: false }, { label: 'M1', desc: 'Var', val: true }]
  }
};

export default function AdaptiveCDSSPlatform() {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('prostate');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOutputTab, setActiveOutputTab] = useState<'doses' | 'margins'>('doses');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTnmHelper, setShowTnmHelper] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'GÜS (Genitoüriner Sistem)': true, 'Meme Onkolojisi': false, 'Torasik / Akciğer': false,
    'Baş-Boyun Onkolojisi': false, 'Jinekolojik Onkoloji': false, 'GİS (Gastrointestinal Sistem)': false,
    'Santral Sinir Sistemi (MSS)': false, 'Sarkom & Kemik': false, 'Dermatolojik Onkoloji': false, 'Palyatif Radyoterapi': false,
  });

  const toggleGroup = (grp: string) => setOpenGroups(prev => ({ ...prev, [grp]: !prev[grp] }));

  // TÜM HASTALIKLAR İÇİN EKSİKSİZ POLİKLİNİK STATELERİ
  const [prostateData, setProstateData] = useState({ clinicalT: 'cT1a-cT1c', tPsa: 6.5, gleasonP1: 3, gleasonP2: 4, positiveCoresPercent: 20, psaDensity: 0.12, seminalVesicleInvasion: false, hasN1: false, hasM1: false, lifeExpectancyLess10: false });
  const [bladderData, setBladderData] = useState({ clinicalT: 'cT2a-cT2b', completeTurbt: true, hydronephrosis: false, hasCis: false, nodalStatus: 'cN0', hasM1: false, poorBladderCapacity: false, smokingHistory: 0 });
  const [kidneyData, setKidneyData] = useState({ tumorSizeMm: 35, locationPolarity: 'PERIPHERAL_CORTICAL', isMedicallyInoperable: true, isSolitaryKidney: false, nodalStatus: 'cN0', hasM1: false, lowGfr: false });
  const [rectumData, setRectumData] = useState({ clinicalT: 'cT3a/b', nodalStatus: 'cN1', mrfThreatened: false, emviPositive: false, hasM1: false });
  const [analCanalData, setAnalCanalData] = useState({ clinicalT: 'T2 (2-5cm)', nodalStatus: 'N0', hasM1: false, hivPositive: false });
  const [esophagusData, setEsophagusData] = useState({ clinicalT: 'T3', nodalStatus: 'N1', intent: 'NEOADJUVANT_CROSS', location: 'MID_LOWER_THORACIC', hasM1: false });
  const [pancreasData, setPancreasData] = useState({ resectability: 'BORDERLINE_RESECTABLE', hasM1: false, tumorSizeMm: 30, vascularInvolvement: true });
  const [liverData, setLiverData] = useState({ etiology: 'PRIMARY_HCC', childPughScore: 'CLASS_A', tumorSizeMm: 30, hasM1: false, blcStage: 'STAGE_A' });
  const [lungNsclcData, setLungNsclcData] = useState({ clinicalT: 'T1a-T1c (<=3cm)', nodalStatus: 'N0', hasM1: false, isMedicallyOperable: false, performanceScoreECOG: 1, hasILD: false, smokingHistory: 30 });
  const [lungSclcData, setLungSclcData] = useState({ stageExtent: 'LIMITED_STAGE', pciCandidate: true, hasILD: false, smokingHistory: 40 });
  const [nasopharynxData, setNasopharynxData] = useState({ tStage: 'T3', nStage: 'N2', hasM1: false, smokingHistory: 10 });
  const [hypopharynxData, setHypopharynxData] = useState({ clinicalT: 'T3', nodalStatus: 'N1', intent: 'ORGAN_PRESERVATION', hasM1: false, smokingHistory: 20 });
  const [cervixData, setCervixData] = useState({ tumorSizeMm: 35, parametrialInvasion: true, vaginalLowerThird: false, pelvicWallOrHydronephrosis: false, bladderRectumInv: false, pelvicNodePositive: true, paraAorticNodePositive: false, hasM1: false });
  const [endometriumData, setEndometriumData] = useState({ stage: 'STAGE_I_HIGH_INTERMEDIATE', deepMyometrialInvasion: true, lvsiPositive: true, grade: 2 });
  const [breastData, setBreastData] = useState({ age: 58, surgery: 'BCT', tumorSizeMm: 18, positiveNodes: 0, hasM1: false, erPositive: true, prPositive: true, her2Positive: false, ki67Percent: 15, grade: 2, brcaMutated: false, menopausalStatus: 'POST' });
  const [gliomaData, setGliomaData] = useState({ idhStatus: 'WILDTYPE', codeletion1p19q: false, cdkn2aHomozygousLoss: true, histologyGrade: 4, mgmtStatus: 'METHYLATED', kpsScore: 80, patientAge: 58, severeMassEffect: false, seizures: true, neuroDeficit: false });
  const [meningiomaData, setMeningiomaData] = useState({ whoGrade: 1, tumorSizeMm: 24, resectionStatus: 'SIMPSON_IV_V_SUBTOTAL_R1', isOpticChiasmClose: false, severeMassEffect: false, seizures: false, neuroDeficit: false });
  const [sarcomaData, setSarcomaData] = useState({ tumorSizeMm: 75, depth: 'DEEP', fnclcGrade: 3, nodalInvolvement: false, hasM1: false, setting: 'PREOPERATIVE', marginStatus: 'NEGATIVE' });
  const [melanomaData, setMelanomaData] = useState({ breslowThicknessMm: 1.8, ulceration: false, sentinelNodePositive: false, hasM1: false, setting: 'ADJUVANT_NODAL', immunosuppressed: false });
  const [skinNmscData, setSkinNmscData] = useState({ histology: 'BCC', tumorSizeMm: 15, locationArea: 'AREA_H', perineuralInvasion: false, depthGreater6mm: false, poorlyDifferentiated: false, marginPositive: false, hasN1: false, hasM1: false, immunosuppressed: false });
  const [bonePalliativeData, setBonePalliativeData] = useState({ clinicalScenario: 'UNCOMPLICATED_BONE_PAIN', boneLocation: 'SPINE', priorRadiationHere: false, lifeExpectancyMonths: '>6' });

  const getActiveOutput = (): { res: EngineOutput; alphaBeta: number } => {
    switch (selectedDiseaseId) {
      case 'prostate': return { res: runProstateEngine(prostateData), alphaBeta: 1.5 };
      case 'bladder': return { res: runBladderEngine(bladderData), alphaBeta: 10.0 };
      case 'kidney_rcc': return { res: runKidneyRccEngine(kidneyData), alphaBeta: 2.6 };
      case 'rectum': return { res: runRectumEngine(rectumData), alphaBeta: 10.0 };
      case 'anal_canal': return { res: runAnalCanalEngine(analCanalData), alphaBeta: 10.0 };
      case 'esophagus': return { res: runEsophagusEngine(esophagusData), alphaBeta: 10.0 };
      case 'pancreas': return { res: runPancreasEngine(pancreasData), alphaBeta: 10.0 };
      case 'liver_hcc': return { res: runLiverEngine(liverData), alphaBeta: 10.0 };
      case 'lung_nsclc': return { res: runLungNsclcEngine(lungNsclcData), alphaBeta: 10.0 };
      case 'lung_sclc': return { res: runLungSclcEngine(lungSclcData), alphaBeta: 10.0 };
      case 'nasopharynx': return { res: runNasopharynxEngine(nasopharynxData), alphaBeta: 10.0 };
      case 'hypopharynx': return { res: runHypopharynxEngine(hypopharynxData), alphaBeta: 10.0 };
      case 'cervix': return { res: runCervixEngine(cervixData), alphaBeta: 10.0 };
      case 'endometrium': return { res: runEndometriumEngine(endometriumData), alphaBeta: 10.0 };
      case 'breast': return { res: runBreastEngine(breastData), alphaBeta: 4.0 };
      case 'glioma': return { res: runGliomaEngine(gliomaData), alphaBeta: 10.0 };
      case 'meningioma': return { res: runMeningiomaEngine(meningiomaData), alphaBeta: 3.0 };
      case 'sarcoma_sts': return { res: runSarcomaEngine(sarcomaData), alphaBeta: 4.0 };
      case 'skin_melanoma': return { res: runMelanomaEngine(melanomaData), alphaBeta: 2.5 };
      case 'skin_nonmelanoma': return { res: runNmscEngine(skinNmscData), alphaBeta: 8.0 };
      case 'palliative_bone': return { res: runBonePalliativeEngine(bonePalliativeData), alphaBeta: 10.0 };
      default: return { res: runProstateEngine(prostateData), alphaBeta: 1.5 };
    }
  };

  const activeDisease = DISEASE_CATALOG.find((d) => d.id === selectedDiseaseId) || DISEASE_CATALOG[0];
  const { res: currentRes, alphaBeta: currentAlphaBeta } = getActiveOutput();

  const handleTnmSelect = (category: 'T' | 'N' | 'M', value: any) => {
    if (category === 'M') {
      handleGlobalM1(value);
      return;
    }
    switch (selectedDiseaseId) {
      case 'rectum':
        if (category === 'T') setRectumData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setRectumData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'esophagus':
        if (category === 'T') setEsophagusData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setEsophagusData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'lung_nsclc':
        if (category === 'T') setLungNsclcData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setLungNsclcData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'prostate':
        if (category === 'T') setProstateData(prev => ({ ...prev, clinicalT: value, seminalVesicleInvasion: value === 'cT3b' ? true : prev.seminalVesicleInvasion }));
        if (category === 'N') setProstateData(prev => ({ ...prev, hasN1: value === 'cN1' }));
        break;
      case 'bladder':
        if (category === 'T') setBladderData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setBladderData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'nasopharynx':
        if (category === 'T') setNasopharynxData(prev => ({ ...prev, tStage: value }));
        if (category === 'N') setNasopharynxData(prev => ({ ...prev, nStage: value }));
        break;
      case 'hypopharynx':
        if (category === 'T') setHypopharynxData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setHypopharynxData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'anal_canal':
        if (category === 'T') setAnalCanalData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setAnalCanalData(prev => ({ ...prev, nodalStatus: value }));
        break;
    }
  };

  const handleGlobalM1 = (m1Val: boolean) => {
    if (selectedDiseaseId === 'prostate') setProstateData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'bladder') setBladderData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'kidney_rcc') setKidneyData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'rectum') setRectumData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'anal_canal') setAnalCanalData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'esophagus') setEsophagusData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'pancreas') setPancreasData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'liver_hcc') setLiverData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'lung_nsclc') setLungNsclcData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'nasopharynx') setNasopharynxData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'hypopharynx') setHypopharynxData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'cervix') setCervixData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'sarcoma_sts') setSarcomaData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'skin_melanoma') setMelanomaData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'skin_nonmelanoma') setSkinNmscData(prev => ({ ...prev, hasM1: m1Val }));
    if (selectedDiseaseId === 'breast') setBreastData(prev => ({ ...prev, hasM1: m1Val }));
  };

  const getGlobalM1Status = () => {
    switch (selectedDiseaseId) {
      case 'prostate': return prostateData.hasM1;
      case 'bladder': return bladderData.hasM1;
      case 'kidney_rcc': return kidneyData.hasM1;
      case 'rectum': return rectumData.hasM1;
      case 'anal_canal': return analCanalData.hasM1;
      case 'esophagus': return esophagusData.hasM1;
      case 'pancreas': return pancreasData.hasM1;
      case 'liver_hcc': return liverData.hasM1;
      case 'lung_nsclc': return lungNsclcData.hasM1;
      case 'nasopharynx': return nasopharynxData.hasM1;
      case 'hypopharynx': return hypopharynxData.hasM1;
      case 'cervix': return cervixData.hasM1;
      case 'sarcoma_sts': return sarcomaData.hasM1;
      case 'skin_melanoma': return melanomaData.hasM1;
      case 'skin_nonmelanoma': return skinNmscData.hasM1;
      case 'breast': return breastData.hasM1;
      default: return false;
    }
  };

  const getActiveTnmValue = (category: 'T' | 'N') => {
    switch (selectedDiseaseId) {
      case 'rectum': return category === 'T' ? rectumData.clinicalT : rectumData.nodalStatus;
      case 'esophagus': return category === 'T' ? esophagusData.clinicalT : esophagusData.nodalStatus;
      case 'lung_nsclc': return category === 'T' ? lungNsclcData.clinicalT : lungNsclcData.nodalStatus;
      case 'prostate': return category === 'T' ? prostateData.clinicalT : (prostateData.hasN1 ? 'cN1' : 'cN0');
      case 'bladder': return category === 'T' ? bladderData.clinicalT : bladderData.nodalStatus;
      case 'nasopharynx': return category === 'T' ? nasopharynxData.tStage : nasopharynxData.nStage;
      case 'hypopharynx': return category === 'T' ? hypopharynxData.clinicalT : hypopharynxData.nodalStatus;
      case 'anal_canal': return category === 'T' ? analCanalData.clinicalT : analCanalData.nodalStatus;
      default: return '';
    }
  };

  const copyClinicalSummary = () => {
    const summary = `[RADONC CDSS RAPORU - ${activeDisease.name.toUpperCase()}]\n• Evre: ${currentRes.ajccStage}\n• Klinik Durum: ${currentRes.stageSummary}\n• Strateji: ${currentRes.strategy}\n• Sistemik Tedavi: ${currentRes.systemic}\n• Rejim: ${currentRes.regimens[0]?.regimenName || '-'} (${currentRes.regimens[0]?.totalDoseGy || '-'} Gy)\n• Referans: ${currentRes.ref}`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* SOL FİHRİST */}
      <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <h1 className="font-bold text-base tracking-wide">RadOnc Master CDSS</h1>
          </div>
          <p className="text-[11px] text-slate-400">Tüm Kılavuzlar Entegre</p>
          <div className="mt-3">
            <input type="text" placeholder="Organ ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-700 placeholder-slate-500 outline-none focus:border-cyan-500 transition" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {MAIN_GROUPS.map((grp) => {
            const items = DISEASE_CATALOG.filter(d => d.group === grp && (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.group.toLowerCase().includes(searchQuery.toLowerCase())));
            if (items.length === 0) return null;
            const isOpen = openGroups[grp] || searchQuery.length > 0;
            return (
              <div key={grp} className="rounded-lg border border-slate-800/90 overflow-hidden bg-slate-900/60">
                <button onClick={() => toggleGroup(grp)} className="w-full px-3 py-2 bg-slate-800/70 hover:bg-slate-800 text-left flex items-center justify-between transition">
                  <span className="text-[11px] font-bold text-cyan-400">{grp}</span>
                  <span className="text-[10px] text-slate-400">{isOpen ? '▼' : '▶'}</span>
                </button>
                {isOpen && (
                  <div className="p-1 space-y-0.5 bg-slate-950/40">
                    {items.map((item) => (
                      <button key={item.id} onClick={() => { setSelectedDiseaseId(item.id); setOpenGroups(prev => ({ ...prev, [grp]: true })); setShowTnmHelper(false); }} className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition flex items-center justify-between ${selectedDiseaseId === item.id ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <span className="truncate pr-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">{activeDisease.group}</span>
              <h2 className="text-lg font-bold text-slate-800">{activeDisease.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{activeDisease.subTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyClinicalSummary} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${copySuccess ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'}`}>
              {copySuccess ? '✓ Kopyalandı' : '📋 Epikriz Özeti Kopyala'}
            </button>
            <a href={currentRes.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition">Kılavuzu Aç ↗</a>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SOL FORM KOLONU */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Klinik Parametreler</h3>
                {TNM_DICTIONARY[selectedDiseaseId] && (
                  <button onClick={() => setShowTnmHelper(!showTnmHelper)} className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-200 transition hover:bg-indigo-100">
                    {showTnmHelper ? 'Asistanı Kapat' : 'TNM Asistanı Aç'}
                  </button>
                )}
              </div>

              {/* İNTERAKTİF TNM ASİSTANI */}
              {showTnmHelper && TNM_DICTIONARY[selectedDiseaseId] && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg space-y-4 mb-4">
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    <strong>TNM Evreleme Rehberi ({activeDisease.name}):</strong> Lütfen menülerden bulgularınıza uygun durumu seçin.
                  </p>
                  {TNM_DICTIONARY[selectedDiseaseId].T.length > 0 && (
                    <div>
                      <span className="font-bold text-[11px] text-indigo-800 block mb-1.5">1. Primer Tümör (T)</span>
                      <div className="grid gap-1">
                        {TNM_DICTIONARY[selectedDiseaseId].T.map(t => (
                          <button key={t.label} onClick={() => handleTnmSelect('T', t.val)} className={`text-left text-xs p-2 rounded border transition ${getActiveTnmValue('T') === t.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                            <span className="font-bold">{t.label}:</span> {t.desc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {TNM_DICTIONARY[selectedDiseaseId].N.length > 0 && (
                    <div>
                      <span className="font-bold text-[11px] text-indigo-800 block mb-1.5 mt-3">2. Lenf Nodu (N)</span>
                      <div className="grid gap-1">
                        {TNM_DICTIONARY[selectedDiseaseId].N.map(n => (
                          <button key={n.label} onClick={() => handleTnmSelect('N', n.val)} className={`text-left text-xs p-2 rounded border transition ${getActiveTnmValue('N') === n.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                            <span className="font-bold">{n.label}:</span> {n.desc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* M0/M1 ORTAK SEÇİCİ */}
              {selectedDiseaseId !== 'palliative_bone' && (
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border mb-2">
                  <span className="font-semibold text-slate-700 text-xs">Uzak Metastaz (M):</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleGlobalM1(false)} className={`px-2.5 py-1 rounded text-xs font-bold transition ${!getGlobalM1Status() ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}>M0</button>
                    <button type="button" onClick={() => handleGlobalM1(true)} className={`px-2.5 py-1 rounded text-xs font-bold transition ${getGlobalM1Status() ? 'bg-purple-600 text-white' : 'bg-white border text-slate-700'}`}>M1</button>
                  </div>
                </div>
              )}

              {/* BÖBREK (RCC) */}
              {selectedDiseaseId === 'kidney_rcc' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                    <input type="number" value={kidneyData.tumorSizeMm} onChange={(e) => setKidneyData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Yerleşim</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setKidneyData(prev => ({ ...prev, locationPolarity: 'PERIPHERAL_CORTICAL' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${kidneyData.locationPolarity === 'PERIPHERAL_CORTICAL' ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>Periferik</button>
                      <button type="button" onClick={() => setKidneyData(prev => ({ ...prev, locationPolarity: 'CENTRAL_HILAR' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${kidneyData.locationPolarity === 'CENTRAL_HILAR' ? 'bg-indigo-700 text-white' : 'bg-slate-50'}`}>Santral / Hiler</button>
                    </div>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={kidneyData.isSolitaryKidney} onChange={(e) => setKidneyData(prev => ({ ...prev, isSolitaryKidney: e.target.checked }))} className="rounded accent-amber-600 h-4 w-4" />
                      <span className="font-bold text-amber-900">Soliter Böbrek / Nefron Koruma</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={kidneyData.lowGfr} onChange={(e) => setKidneyData(prev => ({ ...prev, lowGfr: e.target.checked }))} className="rounded accent-orange-600 h-4 w-4" />
                      <span className="font-bold text-orange-900">Düşük GFR / Kronik Böbrek Yetmezliği</span>
                    </label>
                  </div>
                </div>
              )}

              {/* PANKREAS */}
              {selectedDiseaseId === 'pancreas' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Rezekabilite Durumu</label>
                    <select value={pancreasData.resectability} onChange={(e) => setPancreasData(prev => ({ ...prev, resectability: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                      <option value="BORDERLINE_RESECTABLE">Borderline / Sınırda Rezekabl</option>
                      <option value="LOCALLY_ADVANCED_LAPC">LAPC (Lokal İleri İnoperabl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                    <input type="number" value={pancreasData.tumorSizeMm} onChange={(e) => setPancreasData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2 border-t">
                    <input type="checkbox" checked={pancreasData.vascularInvolvement} onChange={(e) => setPancreasData(prev => ({ ...prev, vascularInvolvement: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                    <span className="font-bold text-rose-900">SMA / Çölyak / Portal Ven Teması Var</span>
                  </label>
                </div>
              )}

              {/* KARACİĞER (HCC) */}
              {selectedDiseaseId === 'liver_hcc' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Etiyoloji / Lezyon Tipi</label>
                    <select value={liverData.etiology} onChange={(e) => setLiverData(prev => ({ ...prev, etiology: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                      <option value="PRIMARY_HCC">Primer Hepatosellüler Karsinom (HCC)</option>
                      <option value="LIVER_METASTASIS">Oligometastatik Karaciğer Lezyonu</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Child-Pugh Karaciğer Fonksiyonu</label>
                    <select value={liverData.childPughScore} onChange={(e) => setLiverData(prev => ({ ...prev, childPughScore: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                      <option value="CLASS_A">Child-Pugh A (SBRT Uygulanabilir)</option>
                      <option value="CLASS_B">Child-Pugh B/C (RT Kontrendike / Yüksek Risk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Lezyon Çapı (mm)</label>
                    <input type="number" value={liverData.tumorSizeMm} onChange={(e) => setLiverData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                  </div>
                </div>
              )}

              {/* YUMUŞAK DOKU SARKOMU (STS) */}
              {selectedDiseaseId === 'sarcoma_sts' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">RT Zamanlaması</label>
                    <select value={sarcomaData.setting} onChange={(e) => setSarcomaData(prev => ({ ...prev, setting: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                      <option value="PREOPERATIVE">Preoperatif (Ameliyat Öncesi 50 Gy)</option>
                      <option value="POSTOPERATIVE">Postoperatif (Ameliyat Sonrası 60-66 Gy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                    <input type="number" value={sarcomaData.tumorSizeMm} onChange={(e) => setSarcomaData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Derinlik</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setSarcomaData(prev => ({ ...prev, depth: 'SUPERFICIAL' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${sarcomaData.depth === 'SUPERFICIAL' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>Yüzeyel</button>
                      <button type="button" onClick={() => setSarcomaData(prev => ({ ...prev, depth: 'DEEP' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${sarcomaData.depth === 'DEEP' ? 'bg-indigo-700 text-white' : 'bg-slate-50'}`}>Derin (Fasya Altı)</button>
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">FNCLC Histolojik Grade</label>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(g => (
                        <button key={g} type="button" onClick={() => setSarcomaData(prev => ({ ...prev, fnclcGrade: g }))} className={`flex-1 py-1 rounded text-xs font-bold border ${sarcomaData.fnclcGrade === g ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>Grade {g}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CİLT (MELANOM / NMSC) */}
              {(selectedDiseaseId === 'skin_melanoma' || selectedDiseaseId === 'skin_nonmelanoma') && (
                <div className="space-y-3.5 text-xs">
                  {selectedDiseaseId === 'skin_melanoma' ? (
                    <>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Breslow Kalınlığı (mm)</label>
                        <input type="number" step="0.1" value={melanomaData.breslowThicknessMm} onChange={(e) => setMelanomaData(prev => ({ ...prev, breslowThicknessMm: parseFloat(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tedavi Amacı</label>
                        <select value={melanomaData.setting} onChange={(e) => setMelanomaData(prev => ({ ...prev, setting: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="ADJUVANT_NODAL">Adjuvan Nodal Havza RT</option>
                          <option value="BRAIN_METASTASIS">Beyin Metastazı (SRS)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Histoloji</label>
                        <select value={skinNmscData.histology} onChange={(e) => setSkinNmscData(prev => ({ ...prev, histology: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="BCC">BCC (Bazal Hücreli Karsinom)</option>
                          <option value="SCC">cSCC (Kutanöz Skuamöz Hücreli)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                        <input type="number" value={skinNmscData.tumorSizeMm} onChange={(e) => setSkinNmscData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedDiseaseId === 'skin_melanoma' ? melanomaData.immunosuppressed : skinNmscData.immunosuppressed} onChange={(e) => selectedDiseaseId === 'skin_melanoma' ? setMelanomaData(prev => ({ ...prev, immunosuppressed: e.target.checked })) : setSkinNmscData(prev => ({ ...prev, immunosuppressed: e.target.checked }))} className="rounded accent-orange-600 h-4 w-4" />
                      <span className="font-bold text-orange-900">İmmünosuprese / Organ Nakli Hastası</span>
                    </label>
                  </div>
                </div>
              )}

              {/* PROSTAT, MEME, MESANE VB. DİĞERLERİ İÇİN FALLBACK */}
              {selectedDiseaseId === 'prostate' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Primer Tümör (cT Evresi)</label>
                    <select value={prostateData.clinicalT} onChange={(e) => setProstateData(prev => ({ ...prev, clinicalT: e.target.value as any, seminalVesicleInvasion: e.target.value === 'cT3b' ? true : prev.seminalVesicleInvasion }))} className="w-full border rounded-lg p-2 bg-slate-50 font-medium">
                      <option value="cT1a-cT1c">cT1a - cT1c</option><option value="cT2a">cT2a</option><option value="cT2b">cT2b</option><option value="cT2c">cT2c</option><option value="cT3a">cT3a (Ekstrakapsüler)</option><option value="cT3b">cT3b (SVI)</option><option value="cT4">cT4</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Serum tPSA (ng/mL)</label>
                      <input type="number" step="0.1" value={prostateData.tPsa} onChange={(e) => setProstateData(prev => ({ ...prev, tPsa: parseFloat(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Pozitif Kor (%)</label>
                      <input type="number" value={prostateData.positiveCoresPercent} onChange={(e) => setProstateData(prev => ({ ...prev, positiveCoresPercent: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block">Gleason Skoru (P1 + P2)</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1"><input type="number" min="1" max="5" value={prostateData.gleasonP1} onChange={(e) => setProstateData(prev => ({ ...prev, gleasonP1: parseInt(e.target.value) || 3 }))} className="w-full border-2 border-cyan-500 rounded-lg p-2 bg-white font-bold text-center text-sm outline-none" /></div>
                      <span className="text-base font-bold text-slate-400">+</span>
                      <div className="flex-1"><input type="number" min="1" max="5" value={prostateData.gleasonP2} onChange={(e) => setProstateData(prev => ({ ...prev, gleasonP2: parseInt(e.target.value) || 4 }))} className="w-full border-2 border-cyan-500 rounded-lg p-2 bg-white font-bold text-center text-sm outline-none" /></div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDiseaseId === 'breast' && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                      <input type="number" value={breastData.tumorSizeMm} onChange={(e) => setBreastData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Pozitif LN</label>
                      <input type="number" value={breastData.positiveNodes} onChange={(e) => setBreastData(prev => ({ ...prev, positiveNodes: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold text-rose-700" />
                    </div>
                  </div>
                  <div className="bg-pink-50/40 p-2.5 rounded border border-pink-100 space-y-2">
                    <label className="font-semibold text-slate-700 block">Reseptörler (ER / PR / HER2)</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, erPositive: true }))} className={`flex-1 py-1 rounded text-xs font-bold ${breastData.erPositive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>ER+</button>
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, erPositive: false }))} className={`flex-1 py-1 rounded text-xs font-bold ${!breastData.erPositive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>ER-</button>
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, prPositive: true }))} className={`flex-1 py-1 rounded text-xs font-bold ${breastData.prPositive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>PR+</button>
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, prPositive: false }))} className={`flex-1 py-1 rounded text-xs font-bold ${!breastData.prPositive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>PR-</button>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, her2Positive: true }))} className={`flex-1 py-1 rounded text-xs font-bold ${breastData.her2Positive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>HER2+</button>
                      <button type="button" onClick={() => setBreastData(prev => ({ ...prev, her2Positive: false }))} className={`flex-1 py-1 rounded text-xs font-bold ${!breastData.her2Positive ? 'bg-pink-600 text-white' : 'bg-white border'}`}>HER2-</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SAĞ ÇIKTI & TABLOLAR */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Dinamik Evreleme & Tanı</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                        {currentRes.ajccStage}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${currentRes.color}`}>
                        {currentRes.stageSummary}
                      </div>
                    </div>
                  </div>

                  {currentRes.roachRisk !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Roach Pelvik LN Riski</span>
                      <span className="text-sm font-bold font-mono text-slate-800">%{currentRes.roachRisk}</span>
                    </div>
                  )}
                </div>

                {currentRes.coreImpact && (
                  <div className="bg-amber-50/70 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs leading-relaxed font-medium">
                    📌 <strong>Klinik / Patoloji Notu:</strong> {currentRes.coreImpact}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Radyoterapi Stratejisi:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{currentRes.strategy}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Hedef Hacim / Marj Alanı:</span>
                    <p className="text-amber-900 font-semibold leading-relaxed">
                      {currentRes.targetVolume || currentRes.regimens[0]?.targetVolumeCTV || 'Belirtilmedi'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Sistemik Tedavi:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{currentRes.systemic}</p>
                  </div>
                </div>
              </div>

              {/* SEKME SEÇİCİ */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex gap-2">
                    <button onClick={() => setActiveOutputTab('doses')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeOutputTab === 'doses' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Doz, Fraksiyonasyon & BED Değerleri
                    </button>
                    <button onClick={() => setActiveOutputTab('margins')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeOutputTab === 'margins' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Konturlama, GTV / CTV / PTV Marjları
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Referans: &alpha;/&beta; = {currentAlphaBeta} Gy</span>
                </div>

                {/* TABLO GÖRÜNÜMÜ */}
                <div className="overflow-x-auto">
                  {currentRes.regimens.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                      ⚠️ Bu klinik senaryo için Radyoterapi endike değildir (veya kontrendikedir). <br/> Lütfen strateji kutusundaki notu inceleyiniz.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5">Şema Adı</th>
                          <th className="p-2.5">Toplam Doz</th>
                          <th className="p-2.5">Fraksiyon</th>
                          <th className="p-2.5">fx Başı</th>
                          <th className="p-2.5 text-cyan-800">BED<sub>{currentAlphaBeta}</sub></th>
                          <th className="p-2.5 text-blue-800">EQD2</th>
                          {activeOutputTab === 'doses' ? (
                            <th className="p-2.5">Klinik Not & Endikasyon</th>
                          ) : (
                            <>
                              <th className="p-2.5 bg-cyan-50/60 text-cyan-950">Hedef Hacimler & Boolean Union</th>
                              <th className="p-2.5">GTV &rarr; CTV Marj / Tanım</th>
                              <th className="p-2.5">CTV &rarr; PTV Marjları</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentRes.regimens.map((reg, idx) => (
                          <tr key={idx} className={reg.preferredBadge ? 'bg-cyan-50/40 hover:bg-cyan-50/60' : 'hover:bg-slate-50'}>
                            <td className="p-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-800 border-slate-300">{reg.modalityDisplay}</span></td>
                            <td className="p-2.5 font-bold text-slate-800"><div className="flex items-center gap-1.5">{reg.regimenName}{reg.preferredBadge && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-600 text-white">Standart</span>}</div></td>
                            <td className="p-2.5 font-bold whitespace-nowrap">{reg.totalDoseGy > 0 ? `${reg.totalDoseGy} Gy` : '-'}</td>
                            <td className="p-2.5 whitespace-nowrap">{reg.fractionCount > 0 ? `${reg.fractionCount} fx` : '-'}</td>
                            <td className="p-2.5 whitespace-nowrap">{reg.dosePerFractionGy > 0 ? `${reg.dosePerFractionGy} Gy` : '-'}</td>
                            <td className="p-2.5 font-mono font-bold text-cyan-900 whitespace-nowrap">{reg.bedGy > 0 ? `${reg.bedGy.toFixed(1)} Gy` : '-'}</td>
                            <td className="p-2.5 font-mono font-bold text-blue-900 whitespace-nowrap">{reg.eqd2Gy > 0 ? `${reg.eqd2Gy.toFixed(1)} Gy` : '-'}</td>
                            {activeOutputTab === 'doses' ? (
                              <td className="p-2.5 text-[11px] text-slate-600 max-w-xs">{reg.clinicalIndication}</td>
                            ) : (
                              <>
                                <td className="p-2.5 text-[11px] text-cyan-950 font-mono bg-cyan-50/30 whitespace-pre-line max-w-sm leading-relaxed">{reg.volumeUnionHierarchy || reg.targetVolumeCTV || '-'}</td>
                                <td className="p-2.5 text-[11px] text-slate-600 whitespace-pre-line max-w-xs">{reg.gtvToCtvMargin}</td>
                                <td className="p-2.5 text-[11px] font-semibold text-slate-900 whitespace-pre-line max-w-xs">{reg.ctvToPtvMargin}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}