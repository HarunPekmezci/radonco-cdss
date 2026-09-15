'use client';

import React, { useState } from 'react';
import { DISEASE_CATALOG, MAIN_GROUPS } from '../data/catalog';
import { EngineOutput } from '../types';
import {
  runProstateEngine, runBladderEngine, runKidneyRccEngine, runRectumEngine,
  runAnalCanalEngine, runEsophagusEngine, runStomachEngine, runPancreasEngine, runLiverEngine,
  runLungNsclcEngine, runLungSclcEngine, runNasopharynxEngine, runHypopharynxEngine,
  runCervixEngine, runEndometriumEngine, runBreastEngine, runGliomaEngine,
  runMeningiomaEngine, runSoftTissueSarcomaEngine, runMelanomaEngine, runNmscEngine,
  runBonePalliativeEngine, runBoneCurativeEngine, 

} from '../engines';

const TNM_DICTIONARY: Record<string, { 
  T: {label:string, desc:string, val:any}[], 
  N: {label:string, desc:string, val:any}[],
  M?: {label:string, desc:string, val:boolean}[]
}> = {
  prostate: {
    T: [
      { label: 'cT1', desc: 'Palpe edilemeyen (PSA veya insidental)', val: 'cT1a-cT1c' },
      { label: 'cT2a', desc: 'Tek lobun yarısı veya daha azı palpabl', val: 'cT2a' },
      { label: 'cT2b', desc: 'Tek lobun yarısından fazlası palpabl', val: 'cT2b' },
      { label: 'cT2c', desc: 'Her iki lobda palpabl nodül', val: 'cT2c' },
      { label: 'cT3a', desc: 'Ekstrakapsüler uzanım (EPE)', val: 'cT3a' },
      { label: 'cT3b', desc: 'Seminal vezikül invazyonu (SVI)', val: 'cT3b' },
      { label: 'cT4', desc: 'Rektum veya pelvik taban invazyonu', val: 'cT4' }
    ],
    N: [
      { label: 'cN0', desc: 'Pelvik lenf nodu temiz', val: false },
      { label: 'cN1', desc: 'Pelvik lenf nodu metastazı (+)', val: true }
    ],
    M: [{ label: 'cM0', desc: 'Metastaz yok', val: false }, { label: 'cM1', desc: 'Kemik / Uzak organ met', val: true }]
  },
  bladder: {
    T: [
      { label: 'cT2', desc: 'Muskularis propriaya (kasa) invaze', val: 'cT2a-cT2b' },
      { label: 'cT3', desc: 'Perivezikal yağ dokusuna invaze', val: 'cT3a-cT3b' },
      { label: 'cT4a', desc: 'Prostat stroması / Uterus / Vagen tutulumu', val: 'cT4a' },
      { label: 'cT4b', desc: 'Pelvik duvara veya karın duvarına fikse', val: 'cT4b' }
    ],
    N: [
      { label: 'cN0', desc: 'Bölgesel LN metastazı yok', val: 'cN0' },
      { label: 'cN1', desc: 'Gerçek pelviste tek bir LN tutulumu', val: 'cN1' },
      { label: 'cN2-3', desc: 'Çoklu pelvik veya ana iliak LN', val: 'cN2-N3' }
    ],
    M: [{ label: 'cM0', desc: 'Metastaz yok', val: false }, { label: 'cM1', desc: 'Uzak metastaz (+)', val: true }]
  },
  pancreas: {
    T: [
      { label: 'Rezekabl', desc: 'Damar teması yok, cerrahiye uygun', val: 'BORDERLINE_RESECTABLE' },
      { label: 'Borderline', desc: 'Sınırda rezekabl (Ven/SMA teması ≤ 180°)', val: 'BORDERLINE_RESECTABLE' },
      { label: 'LAPC', desc: 'Lokal İleri İnoperabl (> 180° arter teması)', val: 'LOCALLY_ADVANCED_LAPC' }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel LN metastazı yok', val: false },
      { label: 'N1', desc: 'Bölgesel lenf nodu pozitif', val: true }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Karaciğer/periton metastazı', val: true }]
  },
  liver_hcc: {
    T: [
      { label: 'Erken (Tek)', desc: 'Soliter lezyon ≤ 3 cm', val: 30 },
      { label: 'Orta Boyut', desc: '3 - 5 cm arası primer lezyon', val: 45 },
      { label: 'Geniş Kitle', desc: '5 cm üzeri primer lezyon', val: 65 }
    ],
    N: [
      { label: 'Child-A', desc: 'İyi fonksiyonel rezerv (SBRT güvenli)', val: 'CLASS_A' },
      { label: 'Child-B/C', desc: 'İleri siroz / yetmezlik (RT kontrendike)', val: 'CLASS_B' }
    ],
    M: [{ label: 'M0', desc: 'Ekstrahepatik yayılım yok', val: false }, { label: 'M1', desc: 'Ekstrahepatik metastaz var', val: true }]
  },
  cervix: {
    T: [
      { label: 'FIGO IB1', desc: 'Derinlik > 5 mm, boyut ≤ 2 cm', val: 18 },
      { label: 'FIGO IB2', desc: 'Boyut 2 - 4 cm arası servikal kitle', val: 30 },
      { label: 'FIGO IB3', desc: 'Boyut > 4 cm (servikste sınırlı)', val: 45 },
      { label: 'FIGO IIB', desc: 'Parametrial invazyon mevcut', val: 'PARAMETRIAL' },
      { label: 'FIGO IIIA/B', desc: 'Vajen alt 1/3 veya pelvik duvar / hidronefroz', val: 'WALL' }
    ],
    N: [
      { label: 'N0', desc: 'Lenf nodu negatif', val: 'N0' },
      { label: 'FIGO IIIC1', desc: 'Pelvik lenf nodu pozitifliği', val: 'PELVIC' },
      { label: 'FIGO IIIC2', desc: 'Para-aortik lenf nodu pozitifliği', val: 'PARAAORTIC' }
    ],
    M: [{ label: 'FIGO IVB', desc: 'Uzak metastaz (+)', val: true }, { label: 'M0', desc: 'Pelviste sınırlı', val: false }]
  },
  endometrium: {
    T: [
      { label: 'Evre IA', desc: 'Miyometrial invazyon < %50', val: false },
      { label: 'Evre IB', desc: 'Derin miyometrial invazyon ≥ %50', val: true }
    ],
    N: [
      { label: 'N0', desc: 'Lenf nodu tutulumu yok (Evre I-II)', val: 'STAGE_I_HIGH_INTERMEDIATE' },
      { label: 'Evre IIIC', desc: 'Pelvik veya para-aortik LN tutulumu (+)', val: 'STAGE_III_HIGH_RISK_NODAL' }
    ],
    M: [{ label: 'Evre IVB', desc: 'Uzak metastaz (+)', val: true }, { label: 'M0', desc: 'Metastaz yok', val: false }]
  },
  sarcoma_sts: {
    T: [
      { label: 'T1 (≤ 5 cm)', desc: 'Ekstremite / Gövde ≤ 5 cm kitle', val: 40 },
      { label: 'T2 (5 - 10 cm)', desc: 'Boyut 5 ile 10 cm arası', val: 75 },
      { label: 'T3 (> 10 cm)', desc: 'Boyut 10 cm üzeri geniş kitle', val: 120 }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel LN negatif', val: false },
      { label: 'N1', desc: 'Bölgesel LN tutulumu (+)', val: true }
    ],
    M: [{ label: 'M0', desc: 'Metastaz yok', val: false }, { label: 'M1', desc: 'Akciğer veya uzak metastaz', val: true }]
  },
  anal_canal: {
    T: [
      { label: 'T1', desc: 'Tümör boyutu ≤ 2 cm', val: 'T1 (<2cm)' },
      { label: 'T2', desc: 'Tümör boyutu 2 - 5 cm arası', val: 'T2 (2-5cm)' },
      { label: 'T3', desc: 'Tümör boyutu 5 cm üzeri', val: 'T3 (>5cm)' },
      { label: 'T4', desc: 'Vajen, üretra, mesane gibi komşu organ invazyonu', val: 'T4 (Komşu Organ)' }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel lenf nodu metastazı yok', val: 'N0' },
      { label: 'N1a', desc: 'İnguinal, mezorektal veya internal iliak LN', val: 'N1' },
      { label: 'N1b/c', desc: 'Bilateral veya eksternal iliak tutulum', val: 'N2' }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Karaciğer/akciğer met', val: true }]
  },
  esophagus: {
    T: [
      { label: 'T1-T2', desc: 'Submukoza veya muskularis propriaya sınırlı', val: 'T1-T2' },
      { label: 'T3', desc: 'Adventisyaya invaze', val: 'T3' },
      { label: 'T4a', desc: 'Plevra, perikard veya diyafram invazyonu', val: 'T4' },
      { label: 'T4b', desc: 'Aort, trakea veya vertebra invazyonu (İnoperabl)', val: 'T4' }
    ],
    N: [
      { label: 'N0', desc: 'Lenf nodu negatif', val: 'N0' },
      { label: 'N1', desc: '1 - 2 adet bölgesel LN tutulumu', val: 'N1' },
      { label: 'N2', desc: '3 - 6 adet bölgesel LN tutulumu', val: 'N2' },
      { label: 'N3', desc: '7 veya daha fazla LN tutulumu', val: 'N3' }
    ],
    M: [{ label: 'M0', desc: 'Uzak organ met yok', val: false }, { label: 'M1', desc: 'Uzak metastaz (+)', val: true }]
  },
  stomach: {
    T: [
      { label: 'cT1-T2', desc: 'Erken evre (Mukoza, submukoza veya muskularis propria)', val: 'cT1-T2' },
      { label: 'cT3', desc: 'Subserozal bağ dokusu invazyonu', val: 'cT3' },
      { label: 'cT4', desc: 'Seroza perforasyonu veya komşu organ invazyonu', val: 'cT4' }
    ],
    N: [
      { label: 'cN0', desc: 'Bölgesel lenf nodu metastazı yok', val: 'cN0' },
      { label: 'cN+', desc: 'Bölgesel lenf nodu metastazı (+)', val: 'cN+' }
    ],
    M: [{ label: 'cM0', desc: 'Metastaz yok', val: false }, { label: 'cM1', desc: 'Uzak metastaz (+)', val: true }]
  },
  breast: {
    T: [
      { label: 'T1 (≤ 20 mm)', desc: 'Erken evre küçük kitle', val: 18 },
      { label: 'T2 (20 - 50 mm)', desc: 'Orta çaplı primer tümör', val: 35 },
      { label: 'T3 (> 50 mm)', desc: 'Geniş kitle (> 5 cm)', val: 55 },
      { label: 'T4', desc: 'Göğüs duvarı veya cilt tutulumu', val: 65 }
    ],
    N: [
      { label: 'N0', desc: 'Aksiller LN negatif', val: 0 },
      { label: 'N1 (1-3 LN)', desc: '1 - 3 adet tutulu aksiller LN', val: 2 },
      { label: 'N2 (4-9 LN)', desc: '4 - 9 adet tutulu aksiller LN', val: 5 },
      { label: 'N3 (≥ 10 LN)', desc: '10+ LN veya supraklavikuler', val: 10 }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Uzak metastaz (+)', val: true }]
  },
  
  lung_nsclc: {
    T: [
      { label: 'T1a-c', desc: 'Tümör çapı ≤ 3 cm', val: 'T1a-T1c (<=3cm)' },
      { label: 'T2a-b', desc: 'Tümör çapı 3 - 5 cm veya ana bronş tutulumu', val: 'T2a-T2b (3-5cm)' },
      { label: 'T3', desc: 'Tümör 5 - 7 cm veya göğüs duvarı/perikard invazyonu', val: 'T3 (>5cm / invazyon)' },
      { label: 'T4', desc: 'Tümör 7 cm üzeri veya mediasten/kalp/karina invazyonu', val: 'T4 (Mediasten/Omurga/Kalp)' }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel lenf nodu temiz', val: 'N0' },
      { label: 'N1', desc: 'İpsilateral hiler / peribronşial LN tutulumu', val: 'N1' },
      { label: 'N2', desc: 'İpsilateral mediastinal veya subkarinal LN', val: 'N2' },
      { label: 'N3', desc: 'Kontralateral mediasten veya supraklavikuler LN', val: 'N3' }
    ],
    M: [{ label: 'M0', desc: 'Metastaz yok', val: false }, { label: 'M1', desc: 'Plevral effüzyon veya uzak organ met', val: true }]
  },
  lung_sclc: {
    T: [
      { label: 'Sınırlı Evre (LS)', desc: 'Tek bir hemitoraksta, tolere edilebilir RT alanında', val: 'LIMITED_STAGE' },
      { label: 'Yaygın Evre (ES)', desc: 'Hemitoraks dışı yayılım, uzak metastaz veya belirgin effüzyon', val: 'EXTENSIVE_STAGE' }
    ],
    N: [
      { label: 'N0/N1', desc: 'Hiler tutulum ile sınırlı', val: 'N0' },
      { label: 'N2/N3', desc: 'Geniş mediastinal nodal tutulum', val: 'N2' }
    ],
    M: [{ label: 'M0', desc: 'Sınırlı Evre (M0)', val: false }, { label: 'M1', desc: 'Yaygın Evre (M1)', val: true }]
  },
  nasopharynx: {
    T: [
      { label: 'T1', desc: 'Nazofarinkste sınırlı veya orofarinks/nazal kavite uzanımı', val: 'T1' },
      { label: 'T2', desc: 'Parafaringeal yumuşak doku uzanımı', val: 'T2' },
      { label: 'T3', desc: 'Kafa tabanı kemikleri, servikal vertebra veya paranazal sinüs', val: 'T3' },
      { label: 'T4', desc: 'İntrakraniyal uzanım, kraniyal sinir veya orbita invazyonu', val: 'T4' }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel LN metastazı yok', val: 'N0' },
      { label: 'N1', desc: 'Tek taraflı servikal / retrofaringeal LN (≤ 6 cm)', val: 'N1' },
      { label: 'N2', desc: 'Bilateral servikal LN (≤ 6 cm)', val: 'N2' },
      { label: 'N3', desc: 'Lenf nodu 6 cm üzeri veya supraklavikuler fossada yerleşim', val: 'N3' }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Kemik, KC veya AC metastazı', val: true }]
  },
  hypopharynx: {
    T: [
      { label: 'T1', desc: 'Tek alt bölgede sınırlı, boyut ≤ 2 cm', val: 'T1' },
      { label: 'T2', desc: 'Komşu bölgeye uzanım veya boyut 2 - 4 cm', val: 'T2' },
      { label: 'T3', desc: 'Boyut 4 cm üzeri veya hemilarenks fiksasyonu', val: 'T3' },
      { label: 'T4a', desc: 'Tiroid/krikoid kıkırdak, hyoid kemik veya boyun kasları', val: 'T4a' },
      { label: 'T4b', desc: 'Prevertebral fasya, karotis veya mediasten invazyonu', val: 'T4b' }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel LN temiz', val: 'N0' },
      { label: 'N1', desc: 'Tek ipsilateral LN ≤ 3 cm', val: 'N1' },
      { label: 'N2', desc: 'İpsilateral 3-6 cm veya bilateral LN', val: 'N2' },
      { label: 'N3', desc: 'Lenf nodu 6 cm üzeri', val: 'N3' }
    ],
    M: [{ label: 'M0', desc: 'Metastaz yok', val: false }, { label: 'M1', desc: 'Uzak metastaz var', val: true }]
  },
  glioma: {
    T: [
      { label: 'Grade 2 (LGG)', desc: 'Düşük dereceli diffüz gliom (IDH-mutant)', val: 2 },
      { label: 'Grade 3 (Atipik)', desc: 'Anaplastik astrositom / oligodendrogliom', val: 3 },
      { label: 'Grade 4 (GBM)', desc: 'Glioblastom veya CDKN2A kaybı / TERT mutasyonu', val: 4 }
    ],
    N: [
      { label: 'IDH-Wildtype', desc: 'Primer agresif GBM moleküler profili', val: 'WILDTYPE' },
      { label: 'IDH-Mutant', desc: 'Sekonder daha iyi prognozlu gliom', val: 'MUTANT' }
    ],
    M: [{ label: 'M0', desc: 'MSS dışı metastaz yok', val: false }, { label: 'M1', desc: 'MSS dışı yayılım / Leptomeningeal', val: true }]
  },
  meningioma: {
    T: [
      { label: 'Grade 1 (Benign)', desc: 'Mitoz < 4/10 BBA, beyin invazyonu yok', val: 1 },
      { label: 'Grade 2 (Atipik)', desc: 'Mitoz 4-19/10 BBA veya beyin invazyonu', val: 2 },
      { label: 'Grade 3 (Anaplastik)', desc: 'Mitoz ≥ 20/10 BBA veya sarkomatöz yapı', val: 3 }
    ],
    N: [
      { label: 'Simpson I-III', desc: 'Gross total rezeksiyon (GTR)', val: 'GTR' },
      { label: 'Simpson IV-V', desc: 'Subtotal rezeksiyon / Biyopsi (STR)', val: 'STR' }
    ],
    M: [{ label: 'M0', desc: 'Metastaz yok', val: false }, { label: 'M1', desc: 'Uzak metastaz var', val: true }]
  },
  skin_melanoma: {
    T: [
      { label: 'T1 (≤ 1.0 mm)', desc: 'Breslow ≤ 0.8 mm veya 0.8-1.0 mm ülserasyonsuz', val: 0.8 },
      { label: 'T2 (1.0 - 2.0 mm)', desc: 'Orta kalınlıkta kutanöz melanom', val: 1.5 },
      { label: 'T3 (2.0 - 4.0 mm)', desc: 'Kalın primer kutanöz melanom', val: 3.0 },
      { label: 'T4 (> 4.0 mm)', desc: 'Derin invazyonlu primer tümör', val: 5.0 }
    ],
    N: [
      { label: 'N0', desc: 'Sentinel lenf nodu (SLNB) negatif', val: false },
      { label: 'N1-3', desc: 'Sentinel veya klinik lenf nodu pozitif', val: true }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Beyin / AC / KC metastazı', val: true }]
  },
  skin_nonmelanoma: {
    T: [
      { label: 'T1 (≤ 2 cm)', desc: 'Yüksek risk özelliği olmayan küçük lezyon', val: 15 },
      { label: 'T2 (2 - 4 cm)', desc: 'Orta çaplı primer karsinom', val: 30 },
      { label: 'T3 (> 4 cm)', desc: 'Geniş kitle veya derin kemik korteks erozyonu', val: 50 }
    ],
    N: [
      { label: 'N0', desc: 'Bölgesel LN metastazı yok', val: false },
      { label: 'N1', desc: 'Bölgesel LN tutulumu mevcut', val: true }
    ],
    M: [{ label: 'M0', desc: 'Uzak metastaz yok', val: false }, { label: 'M1', desc: 'Uzak metastaz var', val: true }]
  },
  kidney_rcc: {
    T: [
      { label: 'T1a (≤ 4 cm)', desc: 'Böbrekle sınırlı küçük kitle', val: 35 },
      { label: 'T1b (4 - 7 cm)', desc: 'Böbrekle sınırlı orta kitle', val: 55 },
      { label: 'T2 (7 - 10 cm)', desc: 'Böbrekle sınırlı büyük kitle', val: 85 },
      { label: 'T3/T4', desc: 'Perirenal yağ veya renal ven invazyonu', val: 110 }
    ],
    N: [
      { label: 'cN0', desc: 'Bölgesel LN negatif', val: 'cN0' },
      { label: 'cN1', desc: 'Bölgesel LN tutulumu (+)', val: 'cN1' }
    ],
    M: [{ label: 'cM0', desc: 'Metastaz yok', val: false }, { label: 'cM1', desc: 'Uzak metastaz var', val: true }]
  },
  rectum: {
    T: [
      { label: 'cT1-2', desc: 'Muskularis propriaya sınırlı', val: 'cT1-T2' },
      { label: 'cT3a/b', desc: 'Mezorektal yağa invaze (< 5 mm)', val: 'cT3a/b' },
      { label: 'cT3c/d', desc: 'Mezorektal yağa derin invaze (> 5 mm)', val: 'cT3c/d' },
      { label: 'cT4', desc: 'Peritona veya komşu organa invaze', val: 'cT4' }
    ],
    N: [
      { label: 'cN0', desc: 'Lenf nodu negatif', val: 'cN0' },
      { label: 'cN1', desc: '1 - 3 adet bölgesel LN pozitif', val: 'cN1' },
      { label: 'cN2', desc: '4 veya daha fazla LN pozitif', val: 'cN2' }
    ],
M: [{ label: 'cM0', desc: 'Metastaz yok', val: false }, { label: 'cM1', desc: 'Uzak metastaz (+)', val: true }]
  }
};

export default function AdaptiveCDSSPlatform() {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('prostate');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOutputTab, setActiveOutputTab] = useState<'doses' | 'margins'>('doses');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTnmHelper, setShowTnmHelper] = useState(true);

  // AI Epikriz Çıkarıcı
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [reportInputText, setReportInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState('');

  // AI Kılavuz Güncelleyici
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [guidelineInputText, setGuidelineInputText] = useState('');
  const [isAnalyzingGuideline, setIsAnalyzingGuideline] = useState(false);
  const [guidelineDiffResult, setGuidelineDiffResult] = useState<any>(null);
  const [guidelineStatusMsg, setGuidelineStatusMsg] = useState('');
  // Bekleyen kılavuz güncellemeleri için state
  const [pendingGuidelineUpdates, setPendingGuidelineUpdates] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [isRagModalOpen, setIsRagModalOpen] = useState(false);
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragReferences, setRagReferences] = useState<any[]>([]);
  const [isRagLoading, setIsRagLoading] = useState(false);
 
  // Sayfa açıldığında haftalık tarayıcı durumunu kontrol et
  React.useEffect(() => {
    const checkGuidelineStatus = async () => {
      try {
        const res = await fetch('/api/guidelines/status');
        const data = await res.json();
        if (data.success) {
          setPendingCount(data.pendingCount || 0);
          setPendingGuidelineUpdates(data.pendingUpdates || []);
        }
      } catch (e) {
        console.error('Kılavuz durum kontrolü hatası:', e);
      }
    };
    checkGuidelineStatus();
  }, []);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'GÜS (Genitoüriner Sistem)': true, 'Meme Onkolojisi': false, 'Torasik / Akciğer': false,
    'Baş-Boyun Onkolojisi': false, 'Jinekolojik Onkoloji': false, 'GİS (Gastrointestinal Sistem)': false,
    'Santral Sinir Sistemi (MSS)': false, 'Sarkom & Kemik': false, 'Dermatolojik Onkoloji': false, 'Palyatif Radyoterapi': false,
  });

  const toggleGroup = (grp: string) => setOpenGroups(prev => ({ ...prev, [grp]: !prev[grp] }));

  // 21 HASTALIK STATE DEPOSU
  const [prostateData, setProstateData] = useState({ clinicalT: 'cT1a-cT1c', tPsa: 6.5, gleasonP1: 3, gleasonP2: 4, positiveCoresPercent: 20, psaDensity: 0.12, seminalVesicleInvasion: false, hasN1: false, hasM1: false, lifeExpectancyLess10: false });
  const [bladderData, setBladderData] = useState({ clinicalT: 'cT2a-cT2b', completeTurbt: true, hydronephrosis: false, hasCis: false, nodalStatus: 'cN0', hasM1: false, poorBladderCapacity: false, smokingHistory: 0 });
  const [kidneyData, setKidneyData] = useState({ tumorSizeMm: 35, locationPolarity: 'PERIPHERAL_CORTICAL', isMedicallyInoperable: true, isSolitaryKidney: false, nodalStatus: 'cN0', hasM1: false, lowGfr: false });
  const [rectumData, setRectumData] = useState({ clinicalT: 'cT3a/b', nodalStatus: 'cN1', mrfThreatened: false, emviPositive: false, hasM1: false });
  const [analCanalData, setAnalCanalData] = useState({ clinicalT: 'T2 (2-5cm)', nodalStatus: 'N0', hasM1: false, hivPositive: false });
  const [esophagusData, setEsophagusData] = useState({ clinicalT: 'T3', nodalStatus: 'N1', intent: 'NEOADJUVANT_CROSS', location: 'MID_LOWER_THORACIC', hasM1: false, histology: 'SCC' });
  const [stomachData, setStomachData] = useState<any>({
  location: 'BODY',
  setting: 'SURGERY_FIRST',
  surgeryStatus: 'NONE',
  resectionMargin: 'R0',
  clinicalT: 'cT3',
  nodalStatus: 'cN0',
  hasM1: false,
  receivedPriorChemo: false
});
  const [pancreasData, setPancreasData] = useState({ resectability: 'BORDERLINE_RESECTABLE', hasM1: false, tumorSizeMm: 30, vascularInvolvement: true, nodalStatus: false });
  const [liverData, setLiverData] = useState({ etiology: 'PRIMARY_HCC', childPughScore: 'CLASS_A', tumorSizeMm: 30, hasM1: false, blcStage: 'STAGE_A' });
  const [lungNsclcData, setLungNsclcData] = useState({ clinicalT: 'T1a-T1c (<=3cm)', nodalStatus: 'N0', hasM1: false, isMedicallyOperable: false, performanceScoreECOG: 1, hasILD: false, smokingHistory: 30 });
  const [lungSclcData, setLungSclcData] = useState({ stageExtent: 'LIMITED_STAGE', pciCandidate: true, hasILD: false, smokingHistory: 40 });
  const [nasopharynxData, setNasopharynxData] = useState({ tStage: 'T3', nStage: 'N2', hasM1: false, ebvPositive: true, smokingHistory: 10 });
  const [hypopharynxData, setHypopharynxData] = useState({ clinicalT: 'T3', nodalStatus: 'N1', intent: 'ORGAN_PRESERVATION', hasM1: false, smokingHistory: 20 });
  const [cervixData, setCervixData] = useState({ tumorSizeMm: 35, parametrialInvasion: true, vaginalLowerThird: false, pelvicWallOrHydronephrosis: false, bladderRectumInv: false, pelvicNodePositive: true, paraAorticNodePositive: false, hasM1: false });
  const [endometriumData, setEndometriumData] = useState({ stage: 'STAGE_I_HIGH_INTERMEDIATE', deepMyometrialInvasion: true, lvsiPositive: true, grade: 2 });
  const [breastData, setBreastData] = useState({ age: 58, surgery: 'BCT', tumorSizeMm: 18, positiveNodes: 0, hasM1: false, erPositive: true, prPositive: true, her2Positive: false, ki67Percent: 15, grade: 2, brcaMutated: false, menopausalStatus: 'POST' });
  const [gliomaData, setGliomaData] = useState({ idhStatus: 'WILDTYPE', codeletion1p19q: false, cdkn2aHomozygousLoss: true, histologyGrade: 4, mgmtStatus: 'METHYLATED', kpsScore: 80, patientAge: 58, severeMassEffect: false, seizures: false, neuroDeficit: false });
  const [meningiomaData, setMeningiomaData] = useState({ whoGrade: 1, tumorSizeMm: 24, resectionStatus: 'SIMPSON_IV_V_SUBTOTAL_R1', isOpticChiasmClose: false, severeMassEffect: false, seizures: false, neuroDeficit: false });
  const [sarcomaData, setSarcomaData] = useState({ tumorSizeMm: 75, depth: 'DEEP', fnclcGrade: 3, nodalInvolvement: false, hasM1: false, setting: 'PREOPERATIVE', marginStatus: 'NEGATIVE' });
  const [melanomaData, setMelanomaData] = useState({ breslowThicknessMm: 1.8, ulceration: false, sentinelNodePositive: false, hasM1: false, setting: 'ADJUVANT_NODAL', immunosuppressed: false });
  const [skinNmscData, setSkinNmscData] = useState({ histology: 'BCC', tumorSizeMm: 15, locationArea: 'AREA_H', perineuralInvasion: false, depthGreater6mm: false, poorlyDifferentiated: false, marginPositive: false, hasN1: false, hasM1: false, immunosuppressed: false });
  const [bonePalliativeData, setBonePalliativeData] = useState({ clinicalScenario: 'UNCOMPLICATED_BONE_PAIN', boneLocation: 'SPINE', priorRadiationHere: false, lifeExpectancyMonths: '>6' });

  // AI ÇIKARIM İŞLEYİCİSİ
  const handleAiExtraction = async () => {
    if (!reportInputText.trim()) {
      setAiStatusMsg('Lütfen epikriz metni yapıştırın.');
      return;
    }
    setIsExtracting(true);
    setAiStatusMsg('RTX 5080 (Qwen 2.5) metni inceliyor...');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: reportInputText, diseaseId: selectedDiseaseId })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Veri ayıklanamadı');

      const p = result.data;
      if (selectedDiseaseId === 'prostate') {
        setProstateData(prev => ({
          ...prev,
          ...(p.clinicalT && { clinicalT: p.clinicalT }),
          ...(p.tPsa !== undefined && p.tPsa !== null && { tPsa: Number(p.tPsa) }),
          ...(p.gleasonP1 && { gleasonP1: Number(p.gleasonP1) }),
          ...(p.gleasonP2 && { gleasonP2: Number(p.gleasonP2) }),
          ...(p.hasN1 !== undefined && { hasN1: Boolean(p.hasN1) }),
          ...(p.hasM1 !== undefined && { hasM1: Boolean(p.hasM1) })
        }));
      } else if (selectedDiseaseId === 'breast') {
        setBreastData(prev => ({
          ...prev,
          ...(p.tumorSizeMm && { tumorSizeMm: Number(p.tumorSizeMm) }),
          ...(p.positiveNodes !== undefined && { positiveNodes: Number(p.positiveNodes) }),
          ...(p.erPositive !== undefined && { erPositive: Boolean(p.erPositive) }),
          ...(p.prPositive !== undefined && { prPositive: Boolean(p.prPositive) }),
          ...(p.her2Positive !== undefined && { her2Positive: Boolean(p.her2Positive) }),
          ...(p.hasM1 !== undefined && { hasM1: Boolean(p.hasM1) })
        }));
      } else if (selectedDiseaseId === 'glioma') {
        setGliomaData(prev => ({
          ...prev,
          ...(p.histologyGrade && { histologyGrade: Number(p.histologyGrade) }),
          ...(p.idhStatus && { idhStatus: p.idhStatus })
        }));
      }

      setAiStatusMsg('✓ Parametreler başarıyla forma işlendi!');
      setTimeout(() => { setIsAiModalOpen(false); setAiStatusMsg(''); }, 1200);
    } catch (err: any) {
      setAiStatusMsg(`Hata: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

 // KILAVUZ ANALİZ İŞLEYİCİSİ
  const handleGuidelineAnalyze = async () => {
    if (!guidelineInputText.trim()) {
      setGuidelineStatusMsg('Lütfen kılavuz metni veya değişiklik pasajını yapıştırın.');
      return;
    }
    setIsAnalyzingGuideline(true);
    setGuidelineDiffResult(null);
    setGuidelineStatusMsg('AI mevcut veritabanı ile yeni kılavuzu kıyaslıyor...');

    try {
      const res = await fetch('/api/guidelines/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseId: selectedDiseaseId,
          guidelineText: guidelineInputText
        })
      });
      const data = await res.json();
      if (data.success) {
        setGuidelineDiffResult(data.diff);
        setGuidelineStatusMsg('⚡ Klinik değişiklik tespit edildi!');
      } else {
        setGuidelineStatusMsg('❌ Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (e: any) {
      setGuidelineStatusMsg('❌ Bağlantı hatası: ' + e.message);
    } finally {
      setIsAnalyzingGuideline(false);
    }
  };

  // KILAVUZA DANIŞ (RAG) İŞLEYİCİSİ
  const handleAskGuideline = async () => {
    if (!ragQuestion.trim()) return;
    setIsRagLoading(true);
    setRagAnswer(null);
    setRagReferences([]);
    try {
      const res = await fetch('/api/guidelines/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: ragQuestion, 
          diseaseContext: activeDisease.name 
        })
      });
      const data = await res.json();
      if (data.success) {
        setRagAnswer(data.answer);
        setRagReferences(data.references || []);
      } else {
        alert(data.error || 'Bir hata oluştu.');
      }
    } catch (e) {
      alert('Sunucu hatası oluştu.');
    } finally {
      setIsRagLoading(false);
    }
  };

  // KILAVUZ ONAY VE JSON YAZMA İŞLEYİCİSİ
  const handleApplyGuidelineUpdate = async () => {
    if (!guidelineDiffResult?.updatedRegimens) return;
    setGuidelineStatusMsg('Veritabanı güncelleniyor...');

    try {
      const res = await fetch('/api/guidelines/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseId: selectedDiseaseId,
          updatedRegimens: guidelineDiffResult.updatedRegimens
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Güncelleme yazılamadı');

      setGuidelineStatusMsg('✓ Kılavuz veritabanı güncellendi! Sayfa yenileniyor...');
      setTimeout(() => {
        setIsGuidelineModalOpen(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setGuidelineStatusMsg(`Hata: ${err.message}`);
    }
  };

  const getActiveOutput = (): { res: EngineOutput; alphaBeta: number } => {
  switch (selectedDiseaseId) {
    case 'prostate': return { res: runProstateEngine(prostateData), alphaBeta: 1.5 };
    case 'bladder': return { res: runBladderEngine(bladderData), alphaBeta: 10.0 };
    case 'kidney_rcc': return { res: runKidneyRccEngine(kidneyData), alphaBeta: 2.6 };
    case 'rectum': return { res: runRectumEngine(rectumData), alphaBeta: 10.0 };
    case 'anal_canal': return { res: runAnalCanalEngine(analCanalData), alphaBeta: 10.0 };
    case 'esophagus': return { res: runEsophagusEngine(esophagusData), alphaBeta: 10.0 };
    case 'stomach': return { res: runStomachEngine(stomachData), alphaBeta: 10.0 };
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

const handleGlobalM1 = (m1Val: boolean) => {
  if (selectedDiseaseId === 'prostate') setProstateData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'bladder') setBladderData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'kidney_rcc') setKidneyData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'rectum') setRectumData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'anal_canal') setAnalCanalData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'esophagus') setEsophagusData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'stomach') setStomachData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'pancreas') setPancreasData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'liver_hcc') setLiverData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'lung_nsclc') setLungNsclcData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'lung_sclc') setLungSclcData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'nasopharynx') setNasopharynxData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'hypopharynx') setHypopharynxData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'cervix') setCervixData(prev => ({ ...prev, hasM1: m1Val }));
  if (selectedDiseaseId === 'endometrium') setEndometriumData(prev => ({ ...prev, hasM1: m1Val }));
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
      case 'lung_sclc': return lungSclcData.hasM1;
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

  const handleTnmSelect = (category: 'T' | 'N' | 'M', value: any) => {
    if (category === 'M') {
      handleGlobalM1(value);
      return;
    }
    switch (selectedDiseaseId) {
      case 'prostate':
        if (category === 'T') setProstateData(prev => ({ ...prev, clinicalT: value, seminalVesicleInvasion: value === 'cT3b' ? true : prev.seminalVesicleInvasion }));
        if (category === 'N') setProstateData(prev => ({ ...prev, hasN1: value }));
        break;
      case 'bladder':
        if (category === 'T') setBladderData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setBladderData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'pancreas':
        if (category === 'T') setPancreasData(prev => ({ ...prev, resectability: value }));
        if (category === 'N') setPancreasData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'liver_hcc':
        if (category === 'T') setLiverData(prev => ({ ...prev, tumorSizeMm: value }));
        if (category === 'N') setLiverData(prev => ({ ...prev, childPughScore: value }));
        break;
      case 'cervix':
        if (category === 'T') {
          if (value === 'PARAMETRIAL') setCervixData(prev => ({ ...prev, parametrialInvasion: true, pelvicWallOrHydronephrosis: false }));
          else if (value === 'WALL') setCervixData(prev => ({ ...prev, pelvicWallOrHydronephrosis: true }));
          else setCervixData(prev => ({ ...prev, tumorSizeMm: value, parametrialInvasion: false, pelvicWallOrHydronephrosis: false }));
        }
        if (category === 'N') {
          if (value === 'PELVIC') setCervixData(prev => ({ ...prev, pelvicNodePositive: true, paraAorticNodePositive: false }));
          else if (value === 'PARAAORTIC') setCervixData(prev => ({ ...prev, paraAorticNodePositive: true }));
          else setCervixData(prev => ({ ...prev, pelvicNodePositive: false, paraAorticNodePositive: false }));
        }
        break;
      case 'endometrium':
        if (category === 'T') setEndometriumData(prev => ({ ...prev, deepMyometrialInvasion: value }));
        if (category === 'N') setEndometriumData(prev => ({ ...prev, stage: value }));
        break;
      case 'sarcoma_sts':
        if (category === 'T') setSarcomaData(prev => ({ ...prev, tumorSizeMm: value }));
        if (category === 'N') setSarcomaData(prev => ({ ...prev, nodalInvolvement: value }));
        break;
      case 'anal_canal':
        if (category === 'T') setAnalCanalData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setAnalCanalData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'esophagus':
        if (category === 'T') setEsophagusData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setEsophagusData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'lung_nsclc':
        if (category === 'T') setLungNsclcData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setLungNsclcData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'lung_sclc':
        if (category === 'T') setLungSclcData(prev => ({ ...prev, stageExtent: value }));
        if (category === 'N') setLungSclcData(prev => ({ ...prev, stageExtent: value === 'N2' ? 'EXTENSIVE_STAGE' : prev.stageExtent }));
        break;
      case 'nasopharynx':
        if (category === 'T') setNasopharynxData(prev => ({ ...prev, tStage: value }));
        if (category === 'N') setNasopharynxData(prev => ({ ...prev, nStage: value }));
        break;
      case 'hypopharynx':
        if (category === 'T') setHypopharynxData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setHypopharynxData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'glioma':
        if (category === 'T') setGliomaData(prev => ({ ...prev, histologyGrade: value }));
        if (category === 'N') setGliomaData(prev => ({ ...prev, idhStatus: value }));
        break;
      case 'meningioma':
        if (category === 'T') setMeningiomaData(prev => ({ ...prev, whoGrade: value }));
        if (category === 'N') setMeningiomaData(prev => ({ ...prev, resectionStatus: value === 'GTR' ? 'SIMPSON_I_III_GROSS_TOTAL' : 'SIMPSON_IV_V_SUBTOTAL_R1' }));
        break;
      case 'skin_melanoma':
        if (category === 'T') setMelanomaData(prev => ({ ...prev, breslowThicknessMm: value }));
        if (category === 'N') setMelanomaData(prev => ({ ...prev, sentinelNodePositive: value }));
        break;
      case 'skin_nonmelanoma':
        if (category === 'T') setSkinNmscData(prev => ({ ...prev, tumorSizeMm: value }));
        if (category === 'N') setSkinNmscData(prev => ({ ...prev, hasN1: value }));
        break;
      case 'kidney_rcc':
        if (category === 'T') setKidneyData(prev => ({ ...prev, tumorSizeMm: value }));
        if (category === 'N') setKidneyData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'rectum':
        if (category === 'T') setRectumData(prev => ({ ...prev, clinicalT: value }));
        if (category === 'N') setRectumData(prev => ({ ...prev, nodalStatus: value }));
        break;
      case 'breast':
        if (category === 'T') setBreastData(prev => ({ ...prev, tumorSizeMm: value }));
        if (category === 'N') setBreastData(prev => ({ ...prev, positiveNodes: value }));
        break;
    }
  };

  const copyClinicalSummary = () => {
    const summary = `[RADONC CDSS RAPORU - ${activeDisease.name.toUpperCase()}]\n• Evre: ${currentRes.ajccStage}\n• Klinik Tanı / Risk: ${currentRes.stageSummary}\n• Strateji: ${currentRes.strategy}\n• Sistemik Tedavi: ${currentRes.systemic}\n• Doz Şeması: ${currentRes.regimens[0]?.regimenName || '-'} (${currentRes.regimens[0]?.totalDoseGy || '-'} Gy)\n• PTV Marjı: ${currentRes.regimens[0]?.ctvToPtvMargin || '-'}\n• Kılavuz Referansı: ${currentRes.ref}`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* SOL KATALOG */}
      <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <h1 className="font-bold text-base tracking-wide">RadOnc Master CDSS</h1>
          </div>
          <p className="text-[11px] text-slate-400">NCCN &bull; ESTRO &bull; ASTRO &bull; FIGO 2026</p>
          <div className="mt-3">
            <input type="text" placeholder="Tümör / Organ ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-700 placeholder-slate-500 outline-none focus:border-cyan-500 transition" />
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
                      <button key={item.id} onClick={() => { setSelectedDiseaseId(item.id); setOpenGroups(prev => ({ ...prev, [grp]: true })); }} className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition flex items-center justify-between ${selectedDiseaseId === item.id ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-800'}`}>
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
            <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition">
              <span>🤖</span> AI Epikriz Çözümle
            </button>
            <button 
              onClick={() => setIsRagModalOpen(true)} 
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white flex items-center gap-1.5 shadow-sm transition"
            >
              <span>📖</span> Kılavuza Danış
            </button>
            <div className="relative">
              <button 
                onClick={() => { 
                  setIsGuidelineModalOpen(true); 
                  setGuidelineDiffResult(null); 
                  setGuidelineStatusMsg('');
                  const match = pendingGuidelineUpdates.find((u: any) => u.key === selectedDiseaseId);
                  if (match && match.pendingNotes) {
                    setGuidelineInputText(match.pendingNotes);
                    setGuidelineStatusMsg(`⚡ Bekleyen kılavuz bildirimi yüklendi (${match.name})`);
                  }
                }} 
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition"
              >
                <span>🔔</span> Kılavuz Güncelle
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
            <button onClick={copyClinicalSummary} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${copySuccess ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'}`}>
              {copySuccess ? '✓ Rapor Kopyalandı' : '📋 Rapor Kopyala'}
            </button>
            <a href={currentRes.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition">Kılavuz ↗</a>
          </div>
        </header>

        {/* EPİKRİZ MODALI */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h3 className="font-bold text-sm text-slate-800">
                    Yerel AI Epikriz Çözümleyici ({activeDisease.name})
                  </h3>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
              </div>
              <textarea
                value={reportInputText}
                onChange={(e) => setReportInputText(e.target.value)}
                placeholder="Rapor metnini veya patoloji sonucunu buraya yapıştırın..."
                className="w-full h-40 text-xs p-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition"
              />
              {aiStatusMsg && <div className="text-xs p-2 rounded bg-indigo-50 text-indigo-900 font-medium">{aiStatusMsg}</div>}
              <div className="flex justify-end gap-2 border-t pt-2">
                <button type="button" onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">İptal</button>
                <button type="button" disabled={isExtracting} onClick={handleAiExtraction} className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg shadow">
                  {isExtracting ? 'Çözümleniyor...' : '⚡ Formu Doldur'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KILAVUZ GÜNCELLEME MODALI */}
        {isGuidelineModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔔</span>
                  <h3 className="font-bold text-sm text-slate-800">
                    Kılavuz Güncelleme & AI Fark Analizörü ({activeDisease.name})
                  </h3>
                </div>
                <button onClick={() => setIsGuidelineModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
              </div>

                {/* Eski: Yeni NCCN, ASTRO veya ESTRO bülteninden pasajı yapıştırın. RTX 5080 (Qwen 2.5) mevcut doz şemaları ile kıyaslayıp size onaylatacaktır. */}
              <p className="text-xs text-slate-500">
                Yeni NCCN, ASTRO veya ESTRO bülteninden pasajı yapıştırın. AI mevcut doz şemaları ile kıyaslayıp size onaylatacaktır.
              </p>

              <textarea
                value={guidelineInputText}
                onChange={(e) => setGuidelineInputText(e.target.value)}
                placeholder="Örn: 'NCCN Prostate 2026: PACE-B SBRT şemasında PTV marjı intra-fraksiyon takip ile 3-4 mm yerine 2 mm olarak önerilmektedir...'"
                className="w-full h-32 text-xs p-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition"
              />

              {guidelineStatusMsg && (
                <div className="text-xs p-2.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-200 font-medium flex items-center gap-2">
                  {isAnalyzingGuideline && <span className="animate-spin">⏳</span>}
                  <span>{guidelineStatusMsg}</span>
                </div>
              )}

              {guidelineDiffResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-slate-800">AI Değişiklik Raporu:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${guidelineDiffResult.hasChanges ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'}`}>
                      {guidelineDiffResult.hasChanges ? 'Revizyon Gerekli' : 'Fark Bulunamadı'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {guidelineDiffResult.changeSummary}
                  </p>

                  {guidelineDiffResult.hasChanges && guidelineDiffResult.updatedRegimens && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 block">Uygulanacak Yeni Şemalar ({guidelineDiffResult.updatedRegimens.length} Adet):</span>
                      <div className="max-h-40 overflow-y-auto space-y-1 bg-white p-2 rounded border border-slate-200 text-[11px]">
                        {guidelineDiffResult.updatedRegimens.map((r: any, i: number) => (
                          <div key={i} className="flex justify-between border-b last:border-0 py-1 text-slate-800">
                            <span className="font-semibold">{r.regimenName} ({r.totalDoseGy} Gy / {r.fractionCount} fx)</span>
                            <span className="text-emerald-700 font-bold">Marj: {r.ctvToPtvMargin}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsGuidelineModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Kapat
                </button>
                {!guidelineDiffResult?.hasChanges ? (
                  <button
                    type="button"
                    disabled={isAnalyzingGuideline}
                    onClick={handleGuidelineAnalyze}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg shadow transition"
                  >
                    {isAnalyzingGuideline ? 'Analiz Ediliyor...' : '🔍 Farkı Analiz Et'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyGuidelineUpdate}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    ✓ Onayla ve Sisteme Uygula
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANA ÇALIŞMA ALANI */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SOL FORM VE TNM REHBERİ */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>📐</span> Klinik & TNM Parametreleri
                </h3>
                {TNM_DICTIONARY[selectedDiseaseId] && (
                  <button onClick={() => setShowTnmHelper(!showTnmHelper)} className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded border border-indigo-200 transition hover:bg-indigo-100">
                    {showTnmHelper ? 'Rehberi Gizle' : '📖 TNM / WHO Asistanı'}
                  </button>
                )}
              </div>

              {/* İNTERAKTİF TNM ASİSTANI */}
              {showTnmHelper && TNM_DICTIONARY[selectedDiseaseId] && (
                <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-lg space-y-3 mb-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
                      ⚡ İnteraktif Evreleme Asistanı ({activeDisease.name})
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-indigo-900 block mb-1">
                      {['glioma', 'meningioma'].includes(selectedDiseaseId) ? '1. Derece / Histopatoloji:' : '1. Primer Tümör (T / Boyut):'}
                    </span>
                    <div className="grid gap-1">
                      {TNM_DICTIONARY[selectedDiseaseId].T.map(t => (
                        <button key={t.label} onClick={() => handleTnmSelect('T', t.val)} className="text-left text-xs p-1.5 rounded border bg-white hover:bg-indigo-100 border-slate-200 transition">
                          <span className="font-bold text-indigo-900">{t.label}:</span> <span className="text-slate-600">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {TNM_DICTIONARY[selectedDiseaseId].N.length > 0 && (
                    <div>
                      <span className="font-bold text-[11px] text-indigo-900 block mb-1 mt-2">
                        {['glioma', 'meningioma'].includes(selectedDiseaseId) ? '2. Moleküler / Cerrahi Rezeksiyon:' : '2. Bölgesel Lenf Nodu (N):'}
                      </span>
                      <div className="grid gap-1">
                        {TNM_DICTIONARY[selectedDiseaseId].N.map(n => (
                          <button key={n.label} onClick={() => handleTnmSelect('N', n.val)} className="text-left text-xs p-1.5 rounded border bg-white hover:bg-indigo-100 border-slate-200 transition">
                            <span className="font-bold text-indigo-900">{n.label}:</span> <span className="text-slate-600">{n.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TÜM 21 ORGANIN FORM ALANLARI */}
              <div className="space-y-3.5 text-xs pt-1">
                
                {/* 1. PROSTAT */}
                {selectedDiseaseId === 'prostate' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT Evresi)</label>
                      <select value={prostateData.clinicalT} onChange={(e) => setProstateData(prev => ({ ...prev, clinicalT: e.target.value as any, seminalVesicleInvasion: e.target.value === 'cT3b' ? true : prev.seminalVesicleInvasion }))} className="w-full border rounded-lg p-2 bg-slate-50 font-medium">
                        <option value="cT1a-cT1c">cT1a - cT1c</option><option value="cT2a">cT2a</option><option value="cT2b">cT2b</option><option value="cT2c">cT2c</option><option value="cT3a">cT3a (EPE)</option><option value="cT3b">cT3b (SVI)</option><option value="cT4">cT4</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (N)</label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-rose-50 border border-rose-200 rounded">
                        <input type="checkbox" checked={prostateData.hasN1} onChange={(e) => setProstateData(prev => ({ ...prev, hasN1: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="text-xs font-bold text-rose-900">Pelvik LN Pozitifliği (cN1)</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Serum tPSA (ng/mL)</label>
                        <input type="number" step="0.1" value={prostateData.tPsa} onChange={(e) => setProstateData(prev => ({ ...prev, tPsa: parseFloat(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Gleason (P1 + P2)</label>
                        <div className="flex items-center gap-1">
                          <input type="number" min="1" max="5" value={prostateData.gleasonP1} onChange={(e) => setProstateData(prev => ({ ...prev, gleasonP1: parseInt(e.target.value) || 3 }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold text-center" />
                          <span>+</span>
                          <input type="number" min="1" max="5" value={prostateData.gleasonP2} onChange={(e) => setProstateData(prev => ({ ...prev, gleasonP2: parseInt(e.target.value) || 4 }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold text-center" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. MESANE */}
                {selectedDiseaseId === 'bladder' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={bladderData.clinicalT} onChange={(e) => setBladderData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-medium">
                        <option value="cT2a-cT2b">cT2 (Muskularis Propriaya İnvaze)</option>
                        <option value="cT3a-cT3b">cT3 (Perivezikal Yağa İnvaze)</option>
                        <option value="cT4a">cT4a (Prostat Stroması / Uterus / Vagen)</option>
                        <option value="cT4b">cT4b (Pelvik Duvara veya Karın Duvarına Fikse)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={bladderData.nodalStatus} onChange={(e) => setBladderData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="cN0">cN0 (Pelvik LN Negatif)</option>
                        <option value="cN1">cN1 (Gerçek Pelviste Tek LN)</option>
                        <option value="cN2-N3">cN2-N3 (Çoklu / Ana İliak LN)</option>
                      </select>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 block">Trimodalite (Mesane Koruma) Kriterleri</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bladderData.completeTurbt} onChange={(e) => setBladderData(prev => ({ ...prev, completeTurbt: e.target.checked }))} className="rounded accent-cyan-600 h-4 w-4" />
                        <span className="text-slate-800">Maksimal / Komplet TURBT Yapıldı</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bladderData.hydronephrosis} onChange={(e) => setBladderData(prev => ({ ...prev, hydronephrosis: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="text-rose-800 font-semibold">Tümöre Bağlı Hidronefroz Mevcut</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bladderData.hasCis} onChange={(e) => setBladderData(prev => ({ ...prev, hasCis: e.target.checked }))} className="rounded accent-amber-600 h-4 w-4" />
                        <span className="text-slate-800">Eşlik Eden Yaygın Karsinoma İn Situ (CIS)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={bladderData.poorBladderCapacity} onChange={(e) => setBladderData(prev => ({ ...prev, poorBladderCapacity: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="text-rose-900 font-bold">Kötü Mesane Kapasitesi / Şiddetli Disüri</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 3. PANKREAS */}
                {selectedDiseaseId === 'pancreas' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Rezekabilite / Lokal Yayılım (cT)</label>
                      <select value={pancreasData.resectability} onChange={(e) => setPancreasData(prev => ({ ...prev, resectability: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="BORDERLINE_RESECTABLE">Borderline (Sınırda Rezekabl - Ven/SMA ≤ 180°)</option>
                        <option value="LOCALLY_ADVANCED_LAPC">LAPC (Lokal İleri İnoperabl - Arter {'>'} 180°)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                        <input type="number" value={pancreasData.tumorSizeMm} onChange={(e) => setPancreasData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                        <select value={pancreasData.nodalStatus ? 'N1' : 'N0'} onChange={(e) => setPancreasData(prev => ({ ...prev, nodalStatus: e.target.value === 'N1' }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="N0">cN0 (Negatif)</option>
                          <option value="N1">cN1 (Bölgesel LN Pozitif)</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={pancreasData.vascularInvolvement} onChange={(e) => setPancreasData(prev => ({ ...prev, vascularInvolvement: e.target.checked }))} className="rounded accent-amber-600 h-4 w-4" />
                        <span className="font-bold text-amber-950">Vasküler Temas / Cerrahi Sınır Riski Mevcut</span>
                      </label>
                      <p className="text-[10px] text-amber-800 mt-1">İndüksiyon FOLFIRINOX sonrası stabil veya yanıtlı olguda SBRT konsolidasyonu düşünülür.</p>
                    </div>
                  </>
                )}

                {/* 4. KARACİĞER */}
                {selectedDiseaseId === 'liver_hcc' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">1. Lezyon Çapı (mm) - [T]</label>
                        <input type="number" value={liverData.tumorSizeMm} onChange={(e) => setLiverData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">2. Karaciğer Rezervi (Child-Pugh)</label>
                        <select value={liverData.childPughScore} onChange={(e) => setLiverData(prev => ({ ...prev, childPughScore: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="CLASS_A">Child-Pugh A (SBRT Uygulanabilir)</option>
                          <option value="CLASS_B">Child-Pugh B/C (RT Kontrendike)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Etiyoloji & Klinik Durum</label>
                      <select value={liverData.etiology} onChange={(e) => setLiverData(prev => ({ ...prev, etiology: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-medium">
                        <option value="PRIMARY_HCC">Primer Hepatosellüler Karsinom (HCC)</option>
                        <option value="OLIGOMETASTASIS">Kolorektal / Diğer Oligometastaz</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 5. SERVİKS */}
                {selectedDiseaseId === 'cervix' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Tümör Çapı (mm) - [T]</label>
                      <input type="number" value={cervixData.tumorSizeMm} onChange={(e) => setCervixData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={cervixData.parametrialInvasion} onChange={(e) => setCervixData(prev => ({ ...prev, parametrialInvasion: e.target.checked }))} className="rounded accent-cyan-600 h-4 w-4" />
                        <span className="font-semibold text-slate-800">Parametrial İnvazyon (FIGO IIB)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-rose-50 border border-rose-200 rounded">
                        <input type="checkbox" checked={cervixData.pelvicWallOrHydronephrosis} onChange={(e) => setCervixData(prev => ({ ...prev, pelvicWallOrHydronephrosis: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-semibold text-rose-900">Pelvik Yan Duvar / Hidronefroz (FIGO IIIB)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-rose-50 border border-rose-200 rounded">
                        <input type="checkbox" checked={cervixData.bladderRectumInv} onChange={(e) => setCervixData(prev => ({ ...prev, bladderRectumInv: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-900">Mesane veya Rektum Mukoza İnvazyonu (FIGO IVA)</span>
                      </label>
                    </div>
                    <div className="pt-2 border-t space-y-1.5">
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Nodal Durum [N]</label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={cervixData.pelvicNodePositive} onChange={(e) => setCervixData(prev => ({ ...prev, pelvicNodePositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-semibold text-rose-800">Pelvik Lenf Nodu Pozitifliği (FIGO IIIC1)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-rose-50 border border-rose-200 rounded">
                        <input type="checkbox" checked={cervixData.paraAorticNodePositive} onChange={(e) => setCervixData(prev => ({ ...prev, paraAorticNodePositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-950">Para-Aortik Lenf Nodu Pozitifliği (FIGO IIIC2)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 6. ENDOMETRİYUM */}
                {selectedDiseaseId === 'endometrium' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Miyometrial İnvazyon Derinliği - [T]</label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 border rounded">
                        <input type="checkbox" checked={endometriumData.deepMyometrialInvasion} onChange={(e) => setEndometriumData(prev => ({ ...prev, deepMyometrialInvasion: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-semibold text-slate-800">Derin Miyometriyal İnvazyon (≥ %50 - Evre IB)</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Histolojik Derece</label>
                        <select value={endometriumData.grade} onChange={(e) => setEndometriumData(prev => ({ ...prev, grade: parseInt(e.target.value) || 2 }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value={1}>Grade 1</option><option value={2}>Grade 2</option><option value={3}>Grade 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">2. Nodal Durum - [N]</label>
                        <select value={endometriumData.stage} onChange={(e) => setEndometriumData(prev => ({ ...prev, stage: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="STAGE_I_HIGH_INTERMEDIATE">Evre I/II (N0)</option>
                          <option value="STAGE_III_HIGH_RISK_NODAL">Evre III (N+)</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-50 border rounded">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={endometriumData.lvsiPositive} onChange={(e) => setEndometriumData(prev => ({ ...prev, lvsiPositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-semibold text-slate-800">Yaygın LVSI (Lenfovasküler İnvazyon)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 7. YUMUŞAK DOKU SARKOMU */}
                {selectedDiseaseId === 'sarcoma_sts' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">1. Tümör Çapı (mm) - [T]</label>
                        <input type="number" value={sarcomaData.tumorSizeMm} onChange={(e) => setSarcomaData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">FNCLCC Grade</label>
                        <select value={sarcomaData.fnclcGrade} onChange={(e) => setSarcomaData(prev => ({ ...prev, fnclcGrade: parseInt(e.target.value) || 3 }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value={1}>Grade 1</option><option value={2}>Grade 2</option><option value={3}>Grade 3</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Kompartman Derinliği</label>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setSarcomaData(prev => ({ ...prev, depth: 'SUPERFICIAL' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${sarcomaData.depth === 'SUPERFICIAL' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Yüzeyel (Fasya Üstü)</button>
                        <button type="button" onClick={() => setSarcomaData(prev => ({ ...prev, depth: 'DEEP' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${sarcomaData.depth === 'DEEP' ? 'bg-indigo-700 text-white' : 'bg-white'}`}>Derin (Fasya Altı)</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tedavi Zamanı</label>
                        <select value={sarcomaData.setting} onChange={(e) => setSarcomaData(prev => ({ ...prev, setting: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="PREOPERATIVE">Preoperatif (50 Gy)</option>
                          <option value="POSTOPERATIVE">Postoperatif (60-66 Gy)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">2. Lenf Nodu [N]</label>
                        <select value={sarcomaData.nodalInvolvement ? 'N1' : 'N0'} onChange={(e) => setSarcomaData(prev => ({ ...prev, nodalInvolvement: e.target.value === 'N1' }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="N0">N0 (Negatif)</option><option value="N1">N1 (Pozitif)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* 8. ANAL KANAL */}
                {selectedDiseaseId === 'anal_canal' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={analCanalData.clinicalT} onChange={(e) => setAnalCanalData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-medium">
                        <option value="T1 (<2cm)">T1 (≤ 2 cm)</option><option value="T2 (2-5cm)">T2 (2 - 5 cm)</option><option value="T3 (>5cm)">T3 ({'>'} 5 cm)</option><option value="T4 (Komşu Organ)">T4 (Komşu Organ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={analCanalData.nodalStatus} onChange={(e) => setAnalCanalData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="N0">cN0 (Negatif)</option><option value="N1">cN1 (Pozitif)</option>
                      </select>
                    </div>
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={analCanalData.hivPositive} onChange={(e) => setAnalCanalData(prev => ({ ...prev, hivPositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-amber-950">HIV Pozitifliği / İmmün Yetmezlik</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 9. ÖZOFAGUS */}
                {selectedDiseaseId === 'esophagus' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tedavi Yaklaşımı</label>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setEsophagusData(prev => ({ ...prev, intent: 'NEOADJUVANT_CROSS' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${esophagusData.intent === 'NEOADJUVANT_CROSS' ? 'bg-cyan-700 text-white' : 'bg-white'}`}>CROSS (41.4 Gy)</button>
                        <button type="button" onClick={() => setEsophagusData(prev => ({ ...prev, intent: 'DEFINITIVE_CRT' }))} className={`flex-1 py-1.5 rounded text-xs font-bold border ${esophagusData.intent === 'DEFINITIVE_CRT' ? 'bg-indigo-700 text-white' : 'bg-white'}`}>Definitif (50.4 Gy)</button>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={esophagusData.clinicalT} onChange={(e) => setEsophagusData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50">
                        <option value="T1-T2">T1 - T2</option><option value="T3">T3</option><option value="T4">T4</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={esophagusData.nodalStatus} onChange={(e) => setEsophagusData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="N0">cN0</option><option value="N1">cN1</option><option value="N2">cN2</option><option value="N3">cN3</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 10. KHDAK (AKCİĞER) */}
                {selectedDiseaseId === 'lung_nsclc' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={lungNsclcData.clinicalT} onChange={(e) => setLungNsclcData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50">
                        <option value="T1a-T1c (<=3cm)">T1 (≤ 3 cm)</option><option value="T2a-T2b (3-5cm)">T2 (3 - 5 cm)</option><option value="T3 (>5cm / invazyon)">T3 ({'>'} 5 cm)</option><option value="T4 (Mediasten/Omurga/Kalp)">T4 (Santral)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={lungNsclcData.nodalStatus} onChange={(e) => setLungNsclcData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="N0">cN0 (SBRT Adayı)</option><option value="N1">cN1</option><option value="N2">cN2 (KRT)</option><option value="N3">cN3</option>
                      </select>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={lungNsclcData.hasILD} onChange={(e) => setLungNsclcData(prev => ({ ...prev, hasILD: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="text-rose-900 font-bold">İnterstisyel Akciğer Hastalığı (ILD / IPF)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 11. KHAK */}
                {selectedDiseaseId === 'lung_sclc' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Klinik Evreleme</label>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setLungSclcData(prev => ({ ...prev, stageExtent: 'LIMITED_STAGE' }))} className={`flex-1 py-2 rounded text-xs font-bold border ${lungSclcData.stageExtent === 'LIMITED_STAGE' ? 'bg-cyan-700 text-white' : 'bg-white'}`}>Sınırlı Evre</button>
                        <button type="button" onClick={() => setLungSclcData(prev => ({ ...prev, stageExtent: 'EXTENSIVE_STAGE' }))} className={`flex-1 py-2 rounded text-xs font-bold border ${lungSclcData.stageExtent === 'EXTENSIVE_STAGE' ? 'bg-purple-700 text-white' : 'bg-white'}`}>Yaygın Evre</button>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={lungSclcData.pciCandidate} onChange={(e) => setLungSclcData(prev => ({ ...prev, pciCandidate: e.target.checked }))} className="rounded accent-cyan-600 h-4 w-4" />
                        <span className="text-slate-800 font-semibold">Profilaktik Kraniyal Işınlama (PCI) Adayı</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 12. NAZOFARİNKS */}
                {selectedDiseaseId === 'nasopharynx' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={nasopharynxData.tStage} onChange={(e) => setNasopharynxData(prev => ({ ...prev, tStage: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50">
                        <option value="T1">T1</option><option value="T2">T2</option><option value="T3">T3</option><option value="T4">T4</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={nasopharynxData.nStage} onChange={(e) => setNasopharynxData(prev => ({ ...prev, nStage: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="N0">cN0</option><option value="N1">cN1</option><option value="N2">cN2</option><option value="N3">cN3</option>
                      </select>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={nasopharynxData.ebvPositive} onChange={(e) => setNasopharynxData(prev => ({ ...prev, ebvPositive: e.target.checked }))} className="rounded accent-blue-600 h-4 w-4" />
                        <span className="font-bold text-blue-950">EBV DNA Plazma Düzeyi Pozitif</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 13. HİPOFARİNKS */}
                {selectedDiseaseId === 'hypopharynx' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={hypopharynxData.clinicalT} onChange={(e) => setHypopharynxData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50">
                        <option value="T1">T1</option><option value="T2">T2</option><option value="T3">T3</option><option value="T4a">T4a</option><option value="T4b">T4b</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu (cN)</label>
                      <select value={hypopharynxData.nodalStatus} onChange={(e) => setHypopharynxData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value="N0">cN0</option><option value="N1">cN1</option><option value="N2">cN2</option><option value="N3">cN3</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 14. GLİOM (MSS) - TÜM ACİL / ŞİFT / SEMPTOM ALANLARI EKSİKSİZ */}
                {selectedDiseaseId === 'glioma' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. WHO Derecesi ve Histopatoloji</label>
                      <select value={gliomaData.histologyGrade} onChange={(e) => setGliomaData(prev => ({ ...prev, histologyGrade: parseInt(e.target.value) || 4 }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value={4}>WHO Grade 4 (Glioblastom - GBM)</option>
                        <option value={3}>WHO Grade 3 (Anaplastik Astrositom)</option>
                        <option value={2}>WHO Grade 2 (Diffüz Düşük Dereceli Gliom)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">IDH Durumu</label>
                        <select value={gliomaData.idhStatus} onChange={(e) => setGliomaData(prev => ({ ...prev, idhStatus: e.target.value as any }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold">
                          <option value="WILDTYPE">IDH Wildtype</option>
                          <option value="MUTANT">IDH Mutant</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">MGMT Metilasyonu</label>
                        <select value={gliomaData.mgmtStatus} onChange={(e) => setGliomaData(prev => ({ ...prev, mgmtStatus: e.target.value as any }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold">
                          <option value="METHYLATED">Metile (İyi Yanıt)</option>
                          <option value="UNMETHYLATED">Metilasyonsuz</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Hasta Yaşı</label>
                        <input type="number" value={gliomaData.patientAge} onChange={(e) => setGliomaData(prev => ({ ...prev, patientAge: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">KPS Skoru</label>
                        <input type="number" step="10" min="20" max="100" value={gliomaData.kpsScore} onChange={(e) => setGliomaData(prev => ({ ...prev, kpsScore: parseInt(e.target.value) || 80 }))} className="w-full border rounded p-1.5 bg-slate-50 font-bold" />
                      </div>
                    </div>
                    
                    {/* ACİL ŞİFT / KİTLE ETKİSİ UYARISI */}
                    <div className="p-2.5 bg-rose-50 border border-rose-300 rounded space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gliomaData.severeMassEffect} onChange={(e) => setGliomaData(prev => ({ ...prev, severeMassEffect: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-950">⚠️ Belirgin Kitle Etkisi / Orta Hat Şifti (&gt; 5 mm)</span>
                      </label>
                      <p className="text-[10px] text-rose-800 leading-tight">
                        Orta hat şiftinde radyoterapi kontrendikedir. Acil nöroşirürjikal cerrahi dekompresyon ve yüksek doz steroid (Deksametazon) endikedir.
                      </p>
                    </div>

                    {/* SEMPTOMLAR (NÖBET & DEFİSİT) */}
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-700 block">Klinik Semptomlar & Nörolojik Durum</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gliomaData.seizures} onChange={(e) => setGliomaData(prev => ({ ...prev, seizures: e.target.checked }))} className="rounded accent-indigo-600 h-4 w-4" />
                        <span className="text-slate-800 font-medium">Epileptik Nöbet Öyküsü (Antiepileptik Başlandı)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gliomaData.neuroDeficit} onChange={(e) => setGliomaData(prev => ({ ...prev, neuroDeficit: e.target.checked }))} className="rounded accent-indigo-600 h-4 w-4" />
                        <span className="text-slate-800 font-medium">Fokal Nörolojik Defisit (Motor / Konuşma Kaybı)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 15. MENENJİOM (MSS) - TÜM ACİL / OPTİK / ŞİFT ALANLARI EKSİKSİZ */}
                {selectedDiseaseId === 'meningioma' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. WHO Sınıfı (Grade)</label>
                      <select value={meningiomaData.whoGrade} onChange={(e) => setMeningiomaData(prev => ({ ...prev, whoGrade: parseInt(e.target.value) || 1 }))} className="w-full border rounded-lg p-2 bg-slate-50 font-bold">
                        <option value={1}>WHO Grade 1 (Benign)</option>
                        <option value={2}>WHO Grade 2 (Atipik)</option>
                        <option value={3}>WHO Grade 3 (Anaplastik / Malign)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                        <input type="number" value={meningiomaData.tumorSizeMm} onChange={(e) => setMeningiomaData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Cerrahi Rezeksiyon</label>
                        <select value={meningiomaData.resectionStatus} onChange={(e) => setMeningiomaData(prev => ({ ...prev, resectionStatus: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="SIMPSON_I_III_GROSS_TOTAL">Simpson I-III (GTR)</option>
                          <option value="SIMPSON_IV_V_SUBTOTAL_R1">Simpson IV-V (STR / Biyopsi)</option>
                        </select>
                      </div>
                    </div>

                    {/* MENENJİOM RİSK VE ŞİFT / SEMPTOM ALANLARI */}
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-indigo-50 border border-indigo-200 rounded">
                        <input type="checkbox" checked={meningiomaData.isOpticChiasmClose} onChange={(e) => setMeningiomaData(prev => ({ ...prev, isOpticChiasmClose: e.target.checked }))} className="rounded accent-indigo-600 h-4 w-4" />
                        <span className="font-bold text-indigo-950">Optik Kiazma / Sinire Yakın (&lt; 2 mm - SRS Kontrendike)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-rose-50 border border-rose-300 rounded">
                        <input type="checkbox" checked={meningiomaData.severeMassEffect} onChange={(e) => setMeningiomaData(prev => ({ ...prev, severeMassEffect: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-950">⚠️ Belirgin Kitle Etkisi / Peritümöral Ödem / Şift</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={meningiomaData.seizures} onChange={(e) => setMeningiomaData(prev => ({ ...prev, seizures: e.target.checked }))} className="rounded accent-indigo-600 h-4 w-4" />
                        <span className="text-slate-800 font-medium">Nörolojik Semptom / Nöbet / KİBAS Belirtileri</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 16. MELANOM */}
                {selectedDiseaseId === 'skin_melanoma' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">1. Breslow (mm)</label>
                        <input type="number" step="0.1" value={melanomaData.breslowThicknessMm} onChange={(e) => setMelanomaData(prev => ({ ...prev, breslowThicknessMm: parseFloat(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Klinik Senaryo</label>
                        <select value={melanomaData.setting} onChange={(e) => setMelanomaData(prev => ({ ...prev, setting: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="ADJUVANT_NODAL">Adjuvan Nodal RT</option>
                          <option value="BRAIN_METASTASIS">Beyin Met (SRS)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={melanomaData.sentinelNodePositive} onChange={(e) => setMelanomaData(prev => ({ ...prev, sentinelNodePositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-900">2. Sentinel Lenf Nodu Pozitifliği [N]</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-orange-50 border border-orange-200 rounded">
                        <input type="checkbox" checked={melanomaData.immunosuppressed} onChange={(e) => setMelanomaData(prev => ({ ...prev, immunosuppressed: e.target.checked }))} className="rounded accent-orange-600 h-4 w-4" />
                        <span className="font-bold text-orange-950">İmmünosuprese Hasta (Agresif Seyir)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 17. NON-MELANOMA CİLT */}
                {selectedDiseaseId === 'skin_nonmelanoma' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Histoloji</label>
                        <select value={skinNmscData.histology} onChange={(e) => setSkinNmscData(prev => ({ ...prev, histology: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                          <option value="BCC">BCC</option><option value="CSCC">cSCC</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tümör Çapı (mm)</label>
                        <input type="number" value={skinNmscData.tumorSizeMm} onChange={(e) => setSkinNmscData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Anatomik Bölge</label>
                      <select value={skinNmscData.locationArea} onChange={(e) => setSkinNmscData(prev => ({ ...prev, locationArea: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                        <option value="AREA_H">Maske Alanı (Area H - Yüksek Risk)</option>
                        <option value="AREA_M">Area M (Orta Risk)</option>
                        <option value="AREA_L">Area L (Düşük Risk)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={skinNmscData.perineuralInvasion} onChange={(e) => setSkinNmscData(prev => ({ ...prev, perineuralInvasion: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-semibold text-slate-800">Perinöral İnvazyon (PNI)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 border rounded">
                        <input type="checkbox" checked={skinNmscData.marginPositive} onChange={(e) => setSkinNmscData(prev => ({ ...prev, marginPositive: e.target.checked }))} className="rounded accent-rose-600 h-4 w-4" />
                        <span className="font-bold text-rose-800">Cerrahi Sınır Pozitifliği (R1)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 18. MEME */}
                {selectedDiseaseId === 'breast' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Tümör Çapı (mm) - [T]</label>
                      <input type="number" value={breastData.tumorSizeMm} onChange={(e) => setBreastData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Pozitif Aksiller LN Sayısı - [N]</label>
                      <input type="number" value={breastData.positiveNodes} onChange={(e) => setBreastData(prev => ({ ...prev, positiveNodes: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold text-rose-700" />
                    </div>
                    <div className="bg-pink-50/50 p-2.5 rounded border border-pink-100 space-y-2">
                      <label className="font-bold text-slate-700 block">Reseptör Durumu</label>
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
                  </>
                )}

                {/* 19. REKTUM */}
                {selectedDiseaseId === 'rectum' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Primer Tümör (cT)</label>
                      <select value={rectumData.clinicalT} onChange={(e) => setRectumData(prev => ({ ...prev, clinicalT: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-medium">
                        <option value="cT1-T2">cT1 - cT2</option><option value="cT3a/b">cT3a/b</option><option value="cT3c/d">cT3c/d</option><option value="cT4">cT4</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Lenf Nodu (cN)</label>
                      <select value={rectumData.nodalStatus} onChange={(e) => setRectumData(prev => ({ ...prev, nodalStatus: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                        <option value="cN0">cN0</option><option value="cN1">cN1</option><option value="cN2">cN2</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 20. BÖBREK (RCC) */}
                {selectedDiseaseId === 'kidney_rcc' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">1. Tümör Çapı (mm) - [T]</label>
                      <input type="number" value={kidneyData.tumorSizeMm} onChange={(e) => setKidneyData(prev => ({ ...prev, tumorSizeMm: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 bg-slate-50 font-bold" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">2. Bölgesel Lenf Nodu - [N]</label>
                      <select value={kidneyData.nodalStatus} onChange={(e) => setKidneyData(prev => ({ ...prev, nodalStatus: e.target.value }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                        <option value="cN0">cN0 (Negatif)</option><option value="cN1">cN1 (Pozitif)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 21. PALYATİF KEMİK */}
                {selectedDiseaseId === 'palliative_bone' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Klinik Senaryo</label>
                      <select value={bonePalliativeData.clinicalScenario} onChange={(e) => setBonePalliativeData(prev => ({ ...prev, clinicalScenario: e.target.value as any }))} className="w-full border rounded p-2 bg-slate-50 font-bold">
                        <option value="UNCOMPLICATED_BONE_PAIN">Komplike Olmayan Ağrı (8 Gy / 1 fx)</option>
                        <option value="SPINAL_CORD_COMPRESSION">Kord Basısı Dekompresyon (30 Gy / 10 fx)</option>
                        <option value="OLIGOMET_SPINE_SBRT">Spinal SBRT (16-18 Gy / 1 fx)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 3. UZAK METASTAZ (M) */}
                {selectedDiseaseId !== 'palliative_bone' && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                    <span className="font-bold text-slate-800 text-xs">3. Uzak Metastaz (M):</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleGlobalM1(false)} className={`px-3 py-1 rounded text-xs font-bold transition ${!getGlobalM1Status() ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}>M0 (Yok)</button>
                      <button type="button" onClick={() => handleGlobalM1(true)} className={`px-3 py-1 rounded text-xs font-bold transition ${getGlobalM1Status() ? 'bg-purple-600 text-white' : 'bg-white border text-slate-700'}`}>M1 (Metastatik)</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ ÇIKTI PANELİ */}
            <div className="lg:col-span-7 space-y-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Radyoterapi Stratejisi:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{currentRes.strategy}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Hedef Hacim / Marj Alanı:</span>
                    <p className="text-amber-900 font-semibold leading-relaxed">
                      {currentRes.targetVolume || currentRes.regimens[0]?.targetVolumeCTV || 'Standart Kılavuz Alanı'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Sistemik Tedavi:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{currentRes.systemic}</p>
                  </div>
                </div>
              </div>

              {/* DOZ VE FRAKSİYONASYON TABLOSU */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex gap-2">
                    <button onClick={() => setActiveOutputTab('doses')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeOutputTab === 'doses' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Doz & Fraksiyonasyon Şemaları
                    </button>
                    <button onClick={() => setActiveOutputTab('margins')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeOutputTab === 'margins' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      GTV / CTV / PTV Marjları
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">&alpha;/&beta; = {currentAlphaBeta} Gy</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Kategori</th>
                        <th className="p-2.5">Şema Adı</th>
                        <th className="p-2.5">Toplam Doz</th>
                        <th className="p-2.5">Fraksiyon</th>
                        <th className="p-2.5">fx Başı</th>
                        <th className="p-2.5 text-cyan-800">BED</th>
                        <th className="p-2.5 text-blue-800">EQD2</th>
                        {activeOutputTab === 'doses' ? (
                          <th className="p-2.5">Endikasyon</th>
                        ) : (
                          <>
                            <th className="p-2.5">Hedef Hacim</th>
                            <th className="p-2.5">PTV Marjı</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentRes.regimens.map((reg, idx) => (
                        <tr key={idx} className={reg.preferredBadge ? 'bg-cyan-50/40 hover:bg-cyan-50/60' : 'hover:bg-slate-50'}>
                          <td className="p-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-800 border-slate-300">{reg.modalityDisplay}</span></td>
                          <td className="p-2.5 font-bold text-slate-800">{reg.regimenName}</td>
                          <td className="p-2.5 font-bold">{reg.totalDoseGy} Gy</td>
                          <td className="p-2.5">{reg.fractionCount} fx</td>
                          <td className="p-2.5">{reg.dosePerFractionGy} Gy</td>
                          <td className="p-2.5 font-mono font-bold text-cyan-900">{reg.bedGy.toFixed(1)} Gy</td>
                          <td className="p-2.5 font-mono font-bold text-blue-900">{reg.eqd2Gy.toFixed(1)} Gy</td>
                          {activeOutputTab === 'doses' ? (
                            <td className="p-2.5 text-[11px] text-slate-600">{reg.clinicalIndication}</td>
                          ) : (
                            <>
                              <td className="p-2.5 text-[11px] font-mono text-cyan-950">{reg.targetVolumeCTV}</td>
                              <td className="p-2.5 text-[11px] font-semibold text-slate-900">{reg.ctvToPtvMargin}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* KILAVUZA DANIŞ (RAG) MODALI */}
      {isRagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h3 className="font-bold text-sm text-slate-800">
                  Kılavuza Danış Asistanı ({activeDisease.name})
                </h3>
              </div>
              <button onClick={() => setIsRagModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Resmi NCCN/ASTRO kılavuzları taranarak atipik vakalar ve dipnot hükümleri sayfa referansıyla yanıtlanır.
            </p>

            <div className="space-y-2">
              <textarea
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                placeholder="Örn: Gleason 3+4 tek kordonda %60 tutulum ve PSA 9 olan hastada SBRT uygun mudur, kılavuz koşulu nedir?"
                className="w-full h-24 text-xs p-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-cyan-600 outline-none transition"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 flex-wrap">
                  <button 
                    type="button"
                    onClick={() => setRagQuestion("Post-op biyokimyasal nükste pelvik RT endikasyonu ve sınırları nelerdir?")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                  >
                    + Post-op Nüks RT
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRagQuestion("SBRT için mutlak ve rölatif kontrendikasyonlar nelerdir?")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                  >
                    + SBRT Kriterleri
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAskGuideline}
                  disabled={isRagLoading || !ragQuestion.trim()}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  {isRagLoading ? 'Kılavuz Taranıyor...' : 'Danış'}
                </button>
              </div>
            </div>

            {/* Yanıt Alanı */}
            {ragAnswer && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="bg-cyan-50/60 border border-cyan-100 rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {ragAnswer}
                </div>
                {ragReferences.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Referans Alınan Sayfalar:</span>
                    {ragReferences.map((ref: any, idx: number) => (
                      <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                        {ref.source} (s. {ref.page})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </main>
    </div>
  );
}