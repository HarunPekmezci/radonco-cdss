// @ts-nocheck

import { EvaluatedDecision, DoseScheme, PrognosticResult, TargetVolume, OARConstraint, getGuidelineMetadata } from '../data/cdssRules';
import { NCCN_GUIDELINE_MAP } from '../data/nccnGuidelineMap';

import { BENIGN_CLINICAL_OPTIONS, OARNTPCeiling, LUNG_SBRT_EVIDENCE_LINKS, LUNG_SBRT_0915_EVIDENCE_LINKS, LUNG_SBRT_0813_EVIDENCE_LINKS, LUNG_HYPO_EVIDENCE_LINKS, LUNG_CONV_0617_EVIDENCE_LINKS } from '../data/cdssRules';


function _evaluateClinicalDecisionInternal(state: any): EvaluatedDecision {
  const {
    selectedOrgan, selectedSubsite, benignClinicalStatus, thoraxSubtype, thoraxCentrality, breathingMotion, thoraxSurgeryStatus, sclcStage, sclcTiming, thymomaStage, thymomaMargin, thymicHistology, nsclcHistology, mesoIntent, gusSubtype, gleasonPrimary, gleasonSecondary, psaLevel, hasECE, hasSVI, positiveCorePercent, bladderTurbtComplete, bladderTmtSuitable, bladderHydronephrosis, bladderConcurrentCis, prostateHistology, testisHistology, bladderHistology, renalHistology, renalDiseaseSetting, renalTumorSizeCm, breastHistology, breastMenopause, breastSurgery, breastMargin, breastBoost, phyllodesMarginCm, phyllodesHighGrade, breastER, breastPR, breastHER2, breastKi67, breastGrade, gisOrgan, liverHistology, liverBclcStage, biliaryHistology, biliaryTreatmentSetting, biliaryMarginStatus, gisCrmStatus, hnSubsite, hnLarynxSubsite, hnCrossesMidline, hnDistanceFromMidlineCm, hnTumorSizeCm, hnDoiMm, hnENE, hnPositiveMargin, cnsSubtype, gliomaGrade, gliomaRiskFactors, cnsMidlineShift, cnsMetCount, cnsMaxDiameter, cnsSymptoms, cnsResection, meningiomaSimpson, cnsKps, gbmPerformance, meningiomaGrade, gliomaHistology, gynSite, cervixScenario, endoRisk, ovaryScenario, vulvaScenario, sarcomaSubtype, dfspStatus, sarcomaSurgery, osteoScenario, ewingIntent, stsHistology, skinHistology, skinMargin, skinDepthMm, skinPerineuralInvasion, skinBoneInvasion, hematologicSubtype, lymphomaResponse, myelomaFractionation, pediatricSubtype, pediatricRisk, wilmsStage, wilmsWholeAbdomen, palliativeIntent, selectedT, selectedN, selectedM, patientAgeYears, patientGender, lang, tText
  } = state;

  const tNum = parseInt(selectedT.replace(/\D/g, '')) || 0;
  const nNum = parseInt(selectedN.replace(/\D/g, '')) || 0;
  const mNum = parseInt(selectedM.replace(/\D/g, '')) || 0;

  const makeScheme = (id: string, title: string, dose: number, fx: number, optScale: number, desc: string, detail: string, tags: string[], oars: OARConstraint[], ptvInfo?: string, alternatives?: DoseScheme[]): DoseScheme => {
    const isPalliative = id.includes('palliative');
    const eqd2 = dose * (1 + (dose / fx) / (isPalliative ? 10 : 10)); // approximate logic if needed
    return {
      id, title, dose, fractions: fx,
      bed: dose * (1 + (dose / fx) / 10),
      eqd2,
      description: desc, details: detail, tags, targetVolumes: [{ // @ts-ignore

        name: 'PTV', dose, fractions: fx, description: ptvInfo || desc as any
      }],
      oars,
      evidence: [] as any,
      optimizationScale: optScale,
      alternatives
    };
  };

    if (selectedOrgan === 'benign') {
      const selectedClinicalOption = BENIGN_CLINICAL_OPTIONS[selectedSubsite]?.find((option: any) => option.value === benignClinicalStatus);
      const clinicalContext = selectedClinicalOption?.label || 'Klinik durum değerlendirmesi';
      const makeScheme = (
        id: string,
        name: string,
        totalDoseGy: number,
        fractionCount: number,
        fractionDoseGy: number,
        technique: string,
        indication: string,
        target: string,
        oars: OARNTPCeiling[] = [],
        alphaBeta = 3,
      ): DoseScheme => ({
        id,
        name,
        tag: 'Benign RT',
        totalDoseGy,
        fractionCount,
        fractionDoseGy,
        alphaBeta,
        technique,
        indication,
        targetVolumes: totalDoseGy > 0
          ? [{ name: 'CTV / PTV', doseGy: totalDoseGy, marginMm: 'Anatomik klinik marjin', anatomical: target }]
          : [],
        oars,
        evidence: 'DEGRO / ESTRO benign radyoterapi önerileri; hasta bazında klinik doğrulama gerekir.',
      });
      let primaryScheme: DoseScheme;
      let alternativeSchemes: DoseScheme[] = [];
      let statusText: string;
      let targetVolumeBadge = 'Hedef: Klinik hedef hacim';
      let techniqueBadge = 'Teknik: Klinik endikasyona göre planlama';
      const noNodalDisease = 'Nodal: Uygulanmaz (Benign)';

      if (selectedSubsite === 'benign-ho') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-ho-7gy',
          late ? 'RT önerilmez (>72 saat)' : '7 Gy / 1 fx (Heterotopik Ossifikasyon Profilaksisi)',
          late ? 0 : 7,
          late ? 0 : 1,
          late ? 0 : 7,
          'Tek fraksiyon konformal RT',
          `${clinicalContext}. Cerrahi yatak ve periartiküler yumuşak doku hedeflenir; eklem aralığı hariç tutulur. Preoperatif ilk 4 saat veya postoperatif 24-48 saat içinde uygulanmalıdır; >72 saatte etkinlik beklenmez.`,
          'Cerrahi yatak ve periartiküler yumuşak doku (eklem aralığı hariç)',
          [{ organ: 'Gonad / komşu eklem', metric: 'Doz', limit: 'Mümkün olduğunca düşük', source: 'DEGRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-ho-10gy-5fx', '10 Gy / 5 fx (Alternatif Profilaksi)', 10, 5, 2,
          'Konformal 3D-CRT', `${clinicalContext}. Zamanlama cerrahi ekiple koordine edilmelidir.`,
          'Cerrahi yatak ve periartiküler yumuşak doku (eklem aralığı hariç)',
          [{ organ: 'Gonad / komşu eklem', metric: 'Doz', limit: 'Mümkün olduğunca düşük', source: 'DEGRO' }],
        )];
        statusText = late ? 'GEÇ BAŞVURU: >72 SAATTE HO PROFİLAKSİSİNDEN FAYDA BEKLENMEZ' : 'ENDİKE: UYGUN ZAMAN PENCERESİNDE HO PROFİLAKSİSİ';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak / Periartiküler Yumuşak Doku';
        techniqueBadge = 'Teknik: Konformal 3D-CRT';
      } else if (selectedSubsite === 'benign-keloid') {
        const late = benignClinicalStatus === 'late';
        primaryScheme = makeScheme(
          'benign-keloid-12gy', late ? 'RT zamanlaması yeniden değerlendirilmelidir' : '12 Gy / 3 fx (Keloid Eksizyon Sonrası)',
          late ? 0 : 12, late ? 0 : 3, late ? 0 : 4,
          'Yüzeysel elektron veya brakiterapi',
          `${clinicalContext}. Cerrahi eksizyon sonrası RT ideal olarak ilk 24 saat içinde başlatılmalıdır.`,
          'Eksizyon yatağı ve keloid skarı',
          [{ organ: 'Cilt / çevre doku', metric: 'Doz', limit: 'Hedef dışı dokularda en aza indir', source: 'ESTRO' }],
        );
        alternativeSchemes = late ? [primaryScheme] : [primaryScheme, makeScheme(
          'benign-keloid-18gy', '18 Gy / 3 fx (Yüksek Riskli Nüks)', 18, 3, 6,
          'Yüzeysel elektron veya brakiterapi', 'Yüksek nüks riskinde uzman değerlendirmesiyle fraksiyone RT.',
          'Eksizyon yatağı ve keloid skarı',
          [{ organ: 'Cilt / çevre doku', metric: 'Doz', limit: 'Hedef dışı dokularda en aza indir', source: 'ESTRO' }],
        )];
        statusText = late ? 'ZAMANLAMA UYGUN DEĞİL: KONSEYDE TEDAVİ YAKLAŞIMINI DEĞERLENDİRİN' : 'ENDİKE: EKSİZYON SONRASI ERKEN KELOİD PROFİLAKSİSİ';
        targetVolumeBadge = 'Hedef: Cerrahi Yatak (<24 saat)';
        techniqueBadge = 'Teknik: Yüzeysel Elektron / Brakiterapi';
      } else if (selectedSubsite === 'benign-dupuytren' || selectedSubsite === 'benign-ledderhose') {
        const advanced = benignClinicalStatus === 'advanced';
        const label = selectedSubsite === 'benign-dupuytren' ? 'Dupuytren' : 'Ledderhose';
        primaryScheme = makeScheme(
          `benign-${label.toLowerCase()}-30gy`,
          advanced ? 'RT rutin önerilmez - ileri hastalıkta cerrahi değerlendirme' : '30 Gy / 10 fx (Split-Course)',
          advanced ? 0 : 30, advanced ? 0 : 10, advanced ? 0 : 3,
          'Elektron / ortovoltaj; 5 fx + 6-8 hafta ara + 5 fx',
          `${clinicalContext}. Erken nodül/kordon evresinde: Faz 1 5 × 3 Gy = 15 Gy, 6-8 hafta ara, ardından Faz 2 5 × 3 Gy = 15 Gy.`,
          `${label} nodül ve kordonları; eklem aralıkları korunur`,
          [{ organ: 'Cilt / el-ayak eklemleri', metric: 'Doz', limit: 'Klinik planlama ile korunur', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = advanced ? 'İLERİ KONTRAKTÜR: CERRAHİ ÖNCELİKLİ, RT YARARI SINIRLI' : 'ERKEN NODÜL / KORDON: SPLIT-COURSE RT DEĞERLENDİR';
        targetVolumeBadge = `Hedef: ${label} Nodül ve Kordonlar`;
        techniqueBadge = 'Teknik: Elektron / Ortovoltaj';
      } else if (['benign-topuk-dikeni', 'benign-epikondilit', 'benign-omuz', 'benign-artroz'].includes(selectedSubsite)) {
        const repeat = benignClinicalStatus === 'repeat';
        const sites: Record<string, string> = {
          'benign-topuk-dikeni': 'Plantar fasya / kalkaneus yapışma alanı',
          'benign-epikondilit': 'Lateral veya medial epikondil ve tendon yapışma alanı',
          'benign-omuz': 'Omuz periartiküler yumuşak dokuları',
          'benign-artroz': 'Semptomatik eklem çevresi; eklem aralığı korunur',
        };
        primaryScheme = makeScheme(
          repeat ? `benign-${selectedSubsite}-repeat-6gy` : `benign-${selectedSubsite}-3gy`,
          repeat ? '6 Gy / 6 fx (İkinci Seri)' : '3 Gy / 6 fx (DEGRO Düşük Doz)',
          repeat ? 6 : 3, 6, repeat ? 1 : 0.5,
          'Konformal düşük doz RT; haftada 2-3 fraksiyon',
          `${clinicalContext}. Refrakter semptomlarda 6-12 hafta sonra klinik değerlendirme ve gerekirse ikinci seri düşünülür.`,
          (sites as any)[selectedSubsite],
          [{ organ: 'Cilt / komşu eklem', metric: 'Doz', limit: 'Düşük doz protokolü', source: 'DEGRO' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = repeat ? 'PERSISTAN SEMPTOM: 6-12 HAFTA SONRA İKİNCİ SERİ DEĞERLENDİR' : 'ENDİKE: REFRAKTER DEJENERATİF / ENFLAMATUAR SEMPTOMDA DÜŞÜK DOZ RT';
        targetVolumeBadge = `Hedef: ${(sites as any)[selectedSubsite]}`;
        techniqueBadge = 'Teknik: Konformal Düşük Doz RT';
      } else if (selectedSubsite === 'benign-graves') {
        const inactive = benignClinicalStatus === 'fibrotic';
        primaryScheme = makeScheme(
          'benign-graves-20gy', inactive ? 'İnaktif fibrotik hastalıkta RT rutin önerilmez' : '20 Gy / 10 fx (Graves Orbitopati)',
          inactive ? 0 : 20, inactive ? 0 : 10, inactive ? 0 : 2,
          'IMRT / VMAT; lens koruması',
          `${clinicalContext}. Aktif orta-ağır orbitopatide 2 haftada uygulanır.`,
          'Orbital yumuşak dokular ve ekstraoküler kaslar',
          [{ organ: 'Lens', metric: 'Dmax', limit: '<5 Gy', source: 'DEGRO' }, { organ: 'Retina', metric: 'Dmean', limit: '<30 Gy', source: 'DEGRO' }],
          3,
        );
        alternativeSchemes = [primaryScheme];
        statusText = inactive ? 'İN-AKTİF FİBROZİS: RT YARARI BEKLENMEZ' : 'ENDİKE: AKTİF GRAVES ORBİTOPATİSİNDE ORBİTAL RT';
        targetVolumeBadge = 'Hedef: Bilateral Orbital Yumuşak Dokular';
        techniqueBadge = 'Teknik: IMRT / VMAT, Lens Koruması';
      } else if (selectedSubsite === 'benign-trigeminal') {
        primaryScheme = makeScheme(
          'benign-trigeminal-80gy', '80 Gy / 1 fx (Trigeminal Nevralji SRS)', 80, 1, 80,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Maksimum tolere edilebilir doz REZ bölgesine odaklanır.`,
          'Trigeminal sinirin kök giriş bölgesi (REZ)',
          [{ organ: 'Beyin sapı yüzeyi', metric: 'Dmax', limit: '<12 Gy', source: 'SRS konsensüsü' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-trigeminal-70gy', name: '70 Gy / 1 fx (Trigeminal Nevralji SRS)', totalDoseGy: 70, fractionDoseGy: 70 }];
        statusText = 'ENDİKE: MEDİKAL TEDAVİYE DİRENÇLİ OLGUDA SRS DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: Trigeminal REZ Bölgesi';
        techniqueBadge = 'Teknik: Stereotaktik Radyocerrahi';
      } else if (selectedSubsite === 'benign-schwannom') {
        const large = benignClinicalStatus === 'large';
        primaryScheme = makeScheme(
          large ? 'benign-schwannom-fsrt' : 'benign-schwannom-srs',
          large ? '50.4 Gy / 28 fx (Vestibüler Schwannom FSRT)' : '12.5 Gy / 1 fx (Vestibüler Schwannom SRS)',
          large ? 50.4 : 12.5, large ? 28 : 1, large ? 1.8 : 12.5,
          large ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. İşitme, tümör hacmi ve beyin sapı komşuluğu multidisipliner değerlendirilmelidir.`,
          'Vestibüler schwannom hedefi',
          [{ organ: 'Koklea', metric: 'Dmean', limit: '<4 Gy (SRS)', source: 'SRS konsensüsü' }, { organ: 'Beyin sapı', metric: 'Dmax', limit: 'Planlama protokolü içinde', source: 'QUANTEC / HyTEC' }],
          3,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: large ? 'benign-schwannom-srs-alt' : 'benign-schwannom-fsrt-alt', name: large ? '12-13 Gy / 1 fx (uygun küçük hedefte SRS)' : '50.4 Gy / 28 fx (FSRT)', totalDoseGy: large ? 12.5 : 50.4, fractionCount: large ? 1 : 28, fractionDoseGy: large ? 12.5 : 1.8 }];
        statusText = 'ENDİKE: VESTİBÜLER SCHWANNOMDA SRS / FSRT DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: Vestibüler Schwannom';
        techniqueBadge = large ? 'Teknik: Fraksiyone Stereotaktik RT' : 'Teknik: SRS';
      } else if (selectedSubsite === 'benign-gynecomastia') {
        const symptomatic = benignClinicalStatus === 'symptomatic';
        primaryScheme = makeScheme(
          'benign-gynecomastia-12',
          symptomatic ? '12 Gy / 3 fx (Yerleşik Ağrılı Jinekomasti)' : '10 Gy / 1 fx (Jinekomasti Profilaksisi)',
          symptomatic ? 12 : 10,
          symptomatic ? 3 : 1,
          symptomatic ? 4 : 10,
          '6-9 MeV elektron; bilateral meme başına bolus',
          'Prostat kanseri antiandrojen tedavisi öncesi ağrı ve meme büyümesini azaltma; bilateral meme başı ve glandüler doku hedeflenir.',
          'Bilateral meme başı / glandüler meme dokusu',
          [{ organ: 'Kalp ve akciğer', metric: 'Doz', limit: 'Minimal doz', source: 'Benign RT konsensüsü' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = 'ENDİKE: JİNEKOMASTİ PROFİLAKSİSİ / SEMPTOM KONTROLÜ';
        targetVolumeBadge = 'Hedef: Bilateral Meme Başları';
        techniqueBadge = 'Teknik: 6-9 MeV Elektron + Bolus';
      } else if (selectedSubsite === 'benign-pituitary') {
        const fractionated = benignClinicalStatus === 'chiasm-close';
        const functional = benignClinicalStatus === 'functional';
        primaryScheme = makeScheme(
          fractionated ? 'benign-pituitary-fsrt' : 'benign-pituitary-srs',
          fractionated ? '45-50.4 Gy / 25-28 fx (Kiazma Komşu Fraksiyone SRT)' : `${functional ? 22 : 13} Gy / 1 fx (${functional ? 'Fonksiyonel' : 'Non-fonksiyonel'} Adenom SRS)`,
          fractionated ? 50.4 : functional ? 22 : 13,
          fractionated ? 28 : 1,
          fractionated ? 1.8 : functional ? 22 : 13,
          fractionated ? 'Fraksiyone stereotaktik RT' : 'Stereotaktik radyocerrahi',
          'Hipofiz adenomunda hormon kontrolü ve lokal kontrol için hacim, hormonal alt tip ve optik kiazma mesafesine göre SRS veya fraksiyone SRT.',
          'Hipofiz adenomu ve rezidü tümör',
          [{ organ: 'Optik kiazma', metric: 'Dmax', limit: fractionated ? '<54 Gy' : '<8-10 Gy', source: 'QUANTEC / SRS konsensüsü' }],
        );
        alternativeSchemes = [primaryScheme];
        statusText = fractionated ? 'ENDİKE: KİAZMA KOMŞU HİPOFİZ ADENOMUNDA FRAKSİYONE SRT' : 'ENDİKE: HİPOFİZ ADENOMUNDA SRS';
        targetVolumeBadge = 'Hedef: Hipofiz Adenomu';
        techniqueBadge = fractionated ? 'Teknik: Fraksiyone SRT' : 'Teknik: SRS';
      } else {
        const highGrade = benignClinicalStatus === 'high-grade';
        primaryScheme = makeScheme(
          'benign-avm-20gy', '20 Gy / 1 fx (AVM SRS)', 20, 1, 20,
          'Stereotaktik radyocerrahi (SRS)',
          `${clinicalContext}. Marjin dozu nidus hacmi ve Spetzler-Martin / Pollock skoruna göre 16-24 Gy aralığında bireyselleştirilir.`,
          'AVM nidusu',
          [{ organ: 'Beyin sapı / optik yol', metric: 'Dmax', limit: 'Konum ve protokole göre kısıtla', source: 'HyTEC / SRS konsensüsü' }],
          2,
        );
        alternativeSchemes = [primaryScheme, { ...primaryScheme, id: 'benign-avm-16gy', name: '16 Gy / 1 fx (AVM SRS)', totalDoseGy: 16, fractionDoseGy: 16 }];
        statusText = highGrade ? 'KOMPLEKS AVM: SRS DOZU / FRAKSİYONASYON UZMAN KONSEYİNDE BELİRLENMELİ' : 'ENDİKE: UYGUN AVM NİDUSUNDA SRS DEĞERLENDİR';
        targetVolumeBadge = 'Hedef: AVM Nidusu';
        techniqueBadge = 'Teknik: Stereotaktik Radyocerrahi';
      }

      return {
        statusText,
        badgeClass: primaryScheme.totalDoseGy > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
        primaryScheme,
        alternativeSchemes,
        targetVolumeBadge,
        nodalStatusBadge: noNodalDisease,
        techniqueBadge,
      };
    }

    // ------------------------------------------
    // 1. TORAKS
    // ------------------------------------------
    if (selectedOrgan === 'thorax') {
      // 1.A. KHAK (Küçük Hücreli Akciğer Kanseri)
      if (thoraxSubtype === 'sclc') {
        if (sclcStage === 'Sinirli') {
          const isBid = sclcTiming === 'Erken_BID_45Gy';
          const sclcChest: DoseScheme = {
            id: isBid ? 'sclc-turrisi-45' : 'sclc-convert-60',
            name: isBid ? 'Akselere Hiperfraksiyonasyon (1.5 Gy BID / 30 fx, ≥ 6 saat ara) · Turrisi' : '60-66 Gy QD (CONVERT Günlük Standart)',
            tag: isBid ? '⚡ Turrisi Altın Standart' : '🎯 CONVERT Günlük',
            totalDoseGy: isBid ? 45 : 60,
            fractionCount: isBid ? 30 : 30,
            fractionDoseGy: isBid ? 1.5 : 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Erken Eşzamanlı KRT - KT Kür 1 veya 2 ile)',
            indication: 'Sınırlı Evre KHAK: Kemoterapi (Sisplatin + Etopozid) ile eşzamanlı erken torasik RT sağkalım avantajı sağlar (Kategori 1).',
            targetVolumes: [
              { name: 'GTV_T & Nodal', doseGy: isBid ? 45 : 60, marginMm: '0 mm', anatomical: 'Pre-KT primer kitle ve tutulu mediastinal/hiler lenf nodları' },
              { name: 'CTV_Involved', doseGy: isBid ? 45 : 60, marginMm: 'GTV + 5 mm', anatomical: 'Yalnızca tutulu alan mikroskobik yayılımı (Elektif nodal önerilmez)' },
              { name: 'PTV', doseGy: isBid ? 45 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfı' },
            ],
            oars: [
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30%', source: 'CONVERT / Turrisi' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
              { organ: 'Özofagus Mean', metric: 'Dmean', limit: '< 34 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Eşzamanlı Sisplatin (60 mg/m2 d1) + Etopozid (120 mg/m2 d1-3) q3w x 4 kür.',
            evidence: 'Turrisi et al. (NEJM 1999), CONVERT Trial (Lancet Oncol 2017), NCCN v1.2025 SCLC',
          };

          const sclcPCI: DoseScheme = {
            id: 'sclc-pci-25',
            name: '25 Gy / 10 fx (Profilaktik Kraniyal Işınlama - PCI)',
            tag: '🧠 Standart PCI (HA-PCI)',
            totalDoseGy: 25,
            fractionCount: 10,
            fractionDoseGy: 2.5,
            alphaBeta: 10,
            technique: 'VMAT (Hipokampus Koruma - HA-PCI Tercih Edilir)',
            indication: 'Torasik KRT sonrası tam/kısmi yanıt veren Sınırlı Evre KHAK olgularında beyin metastazı riskini %50 azaltır ve sağkalımı uzatır.',
            targetVolumes: [
              { name: 'PTV_Brain', doseGy: 25, marginMm: '3 mm', anatomical: 'Tüm beyin parankimi (Hipokampus nörogenezis zonu hariç)' },
            ],
            oars: [
              { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'RTOG 0933 / NRG CC003' },
              { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik KRT tamamlandıktan 3-4 hafta sonra başlanır.',
            evidence: 'Auperin et al. Meta-analysis (NEJM), NRG CC003',
          };

          return {
            statusText: 'ENDİKE: SINIRLI EVRE KHAK ERKEN EŞZAMANLI KRT ± PCI',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: sclcChest,
            alternativeSchemes: [sclcChest, sclcPCI],
          };
        } else {
          // Yaygın Evre
          const crest: DoseScheme = {
            id: 'sclc-crest-30',
            name: '30 Gy / 10 fx (CREST Torasik Konsolidasyon RT)',
            tag: '🛡️ CREST Konsolidasyon',
            totalDoseGy: 30,
            fractionCount: 10,
            fractionDoseGy: 3.0,
            alphaBeta: 10,
            technique: '3D-CRT / IMRT',
            indication: 'Yaygın Evre KHAK: Sistemik kemo-immünoterapiye (EP + Atezolizumab/Durvalumab) yanıt veren olgularda rezidüel torasik kitleye konsolidasyon RT 2 yıllık sağkalımı artırır.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 30, marginMm: '0 mm', anatomical: 'Post-KT rezidüel akciğer kitlesi ve tutulu nodlar' },
              { name: 'PTV', doseGy: 30, marginMm: 'GTV + 8 mm', anatomical: 'Planlanan hedef alan' },
            ],
            oars: [
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 25%', source: 'CREST Trial' },
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'İmmünoterapi (Atezolizumab veya Durvalumab) idamesine RT sonrası devam edilir.',
            evidence: 'CREST Faz III Çalışması (Slotman et al. Lancet 2015)',
          };
          return {
            statusText: 'ÖNERİLİR: YAYGIN EVRE YANITLI HASTADA TORASİK KONSOLİDASYON RT',
            badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
            primaryScheme: crest,
            alternativeSchemes: [crest],
          };
        }
      }

      // 1.B. TİMOMA VE TİMİK KARSİNOM
      if (thoraxSubtype === 'thymoma') {
        if (thymicHistology === 'thymic-carcinoma') {
          const thymicCarcinoma: DoseScheme = {
            id: 'thymic-carcinoma-port',
            name: '50-60 Gy / 25-30 fx (Adjuvan Kemoradyoterapi)',
            tag: '🛡️ Timik Karsinom PORT',
            totalDoseGy: thymomaMargin === 'R1' ? 54 : 60,
            fractionCount: thymomaMargin === 'R1' ? 27 : 30,
            fractionDoseGy: 2,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve Akciğer Koruma)',
            indication: 'Timik karsinomda R0 rezeksiyon sonrasında dahi yüksek lokal ve sistemik nüks riski nedeniyle adjuvan kemoradyoterapi ve PORT değerlendirilmelidir.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'Anatomik', anatomical: 'Tümör yatağı, cerrahi klipsler ve anterior mediasten' },
              { name: 'PTV', doseGy: thymomaMargin === 'R1' ? 54 : 60, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Cerrahi sonrası platin bazlı eşzamanlı kemoterapi, multidisipliner değerlendirme ile planlanır.',
            evidence: 'NCCN v1.2025 Thymic Carcinoma / ITMIG',
          };
          return {
            statusText: 'ENDİKE: TIMİK KARSİNOMDA ADJUVAN KEMORADYOTERAPİ (PORT)',
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
            primaryScheme: thymicCarcinoma,
            alternativeSchemes: [thymicCarcinoma],
          };
        }
        if (thymomaStage === 'Masaoka_I' && thymomaMargin === 'R0') {
          const noRt: DoseScheme = {
            id: 'thymoma-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Klinik ve Toraks BT İzlemi',
            indication: 'Tam rezeke (R0) Masaoka Evre I timomalarda adjuvan radyoterapi nüks veya sağkalım avantajı sağlamaz.',
            targetVolumes: [],
            oars: [],
            evidence: 'ITMIG & NCCN Guidelines for Thymoma and Thymic Carcinoma',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: R0 EVRE I TİMOMADA PORT GEREKMEZ (İZLEM)',
            badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else {
          const dose = thymomaMargin === 'R1' ? 54 : thymomaStage === 'Masaoka_II' ? 50 : 60;
          const thymomaRt: DoseScheme = {
            id: 'thymoma-port-50',
            name: `${dose} Gy / ${Math.round(dose / 2)} fx (Adjuvan / Definitif Mediastinal RT)`,
            tag: '🛡️ PORT Standardı',
            totalDoseGy: dose,
            fractionCount: Math.round(dose / 2),
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT (Kalp ve Akciğer Koruma)',
            indication: 'Masaoka Evre II-III veya R1/R2 cerrahi sınır pozitifliği taşıyan timomalarda lokal nüksü azaltmak için adjuvan PORT uygulanır.',
            targetVolumes: [
              { name: 'CTV_Bed', doseGy: dose, marginMm: 'Anatomik', anatomical: 'Tümör yatağı, plevral adezyon bölgeleri ve anterior mediasten' },
              { name: 'PTV', doseGy: dose, marginMm: 'CTV + 5 mm', anatomical: 'Planlama hedef hacmi' },
            ],
            oars: [
              { organ: 'Kalp Dmean', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
              { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 25%', source: 'QUANTEC' },
            ],
            evidence: 'ITMIG Retrospective Studies, NCCN v1.2025',
          };
          return {
            statusText: 'ENDİKE: POSTOPERATİF ADJUVAN MEDİASTİNAL RT (PORT)',
            badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
            primaryScheme: thymomaRt,
            alternativeSchemes: [thymomaRt],
          };
        }
      }

      // 1.C. MALİGN PLEVRAL MEZOTELYOMA
      if (thoraxSubtype === 'mesothelioma') {
        const mesoPal: DoseScheme = {
          id: 'meso-pal-30',
          name: '30 Gy / 10 fx (Palyatif Semptom Kontrolü)',
          tag: '🛡️ Palyatif Plevral RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'Göğüs duvarı ağrısı ve nefes darlığını palye etmek için uygulanır.',
          targetVolumes: [{ name: 'GTV_Pain', doseGy: 30, marginMm: '0 mm', anatomical: 'Ağrılı invaziv plevral kitle odağı' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN v1.2025 Mesothelioma Principles',
        };
        const mesoTract: DoseScheme = {
          id: 'meso-tract-21',
          name: '21 Gy / 3 fx (Girişim / Dren Yeri Proflaksisi)',
          tag: '⚠️ Girişim Yeri RT',
          totalDoseGy: 21,
          fractionCount: 3,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'Elektron Demeti veya Yüzeyel Foton',
          indication: 'Torasentez ve dren giriş traktusunda tümör tohumlanmasını engellemek amacıyla uygulanır (Klinik tartışmalı).',
          targetVolumes: [{ name: 'PTV_Scar', doseGy: 21, marginMm: 'Skar + 10 mm', anatomical: 'Dren ve biyopsi skarları' }],
          oars: [{ organ: 'Akciğer', metric: 'Dmax', limit: '< 10 Gy', source: 'Klinik' }],
          evidence: 'SMART Trial, NCCN',
        };
        const mesoAdj: DoseScheme = {
          id: 'meso-hemithoracic-504',
          name: '50.4 Gy / 28 fx (Adjuvan Hemitorasik IMRT, P/D Sonrası)',
          tag: '⚡ Adjuvan Hemitorasik RT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Hemitorasik IMRT / VMAT (akciğer koruyucu P/D sonrası); EPD sonrası dikkatli dozimetri',
          indication: 'Plevrektomi/dekortikasyon (P/D) veya genişletilmiş plöropnömonektomi (EPD) sonrası yüksek lokal nüks riskinde adjuvan hemitorasik RT; IMPRINT verisi P/D sonrası akciğer koruyucu IMRT güvenliğini destekler.',
          targetVolumes: [
            { name: 'CTV_Hemithorax', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Tüm ipsilateral plevral yüzey, cerrahi yatak ve insizyon/dren bölgeleri' },
            { name: 'PTV', doseGy: 50.4, marginMm: 'CTV + 5-8 mm', anatomical: 'Günlük IGRT ile set-up güvenlik marjini' },
          ],
          oars: [
            { organ: 'İpsilateral Akciğer (P/D sonrası)', metric: 'V20Gy', limit: 'Mümkün olan en düşük; MLD < 20 Gy', source: 'IMPRINT' },
            { organ: 'Karaciğer (Sağ taraf)', metric: 'Mean', limit: '< 30 Gy', source: 'QUANTEC' },
            { organ: 'Kalp (Sol taraf)', metric: 'Dmean', limit: '< 20 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Platin + pemetrexed bazlı sistemik tedavi ile multidisipliner koordinasyon.',
          evidence: 'IMPRINT Faz II (Rimmer et al. JCO 2016), NCCN v1.2025 Mesothelioma',
        };
        return {
          statusText: mesoIntent === 'Hemitorasik_Postop' ? 'ENDİKE: P/D-EPD SONRASI ADJUVAN HEMİTORASİK RT' : 'PALYATİF VEYA GİRİŞİM YERİ PROFLAKTİK RT',
          badgeClass: mesoIntent === 'Hemitorasik_Postop' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: mesoIntent === 'Dren_Yeri' ? mesoTract : mesoIntent === 'Hemitorasik_Postop' ? mesoAdj : mesoPal,
          alternativeSchemes: [mesoPal, mesoTract, mesoAdj],
        };
      }

      // 1.D. KHDAK (Küçük Hücreli Dışı Akciğer Kanseri)
      const isM1 = selectedM.startsWith('M1');
      const isLocallyAdvanced = selectedN === 'N2' || selectedN === 'N3' || selectedT === 'T3' || selectedT === 'T4';
      const isPostop = thoraxSurgeryStatus.startsWith('Postop');

      if (isM1) {
        if (selectedM === 'M1b') {
          const sbrtOligo: DoseScheme = {
            id: 'lung-oligo-sbrt',
            name: '50 Gy / 5 fx (SABR-COMET Oligometastaz SBRT)',
            tag: '🎯 SABR-COMET',
            totalDoseGy: 50,
            fractionCount: 5,
            fractionDoseGy: 10,
            alphaBeta: 10,
            technique: 'SBRT (4D-CT Entegre VMAT)',
            indication: 'Oligometastatik KHDAK (1-3 odak). Primer tümör ve metastazlara ablatif SBRT genel sağkalım avantajı sağlar.',
            targetVolumes: [
              { name: 'GTV_Oligo', doseGy: 50, marginMm: '0 mm', anatomical: 'Metastatik odak ve primer kitle' },
              { name: 'PTV_SBRT', doseGy: 50, marginMm: 'ITV + 4 mm', anatomical: 'Ablatif PTV hedefi' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 25 Gy', source: 'AAPM TG-101' },
              { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 15%', source: 'AAPM TG-101' },
            ],
            systemicTherapy: 'Sistemik Kemo-İmmünoterapi veya hedefe yönelik TKI devamlılığı.',
            evidence: 'SABR-COMET Trial (Lancet), Gomez et al.',
          };
          return {
            statusText: 'DEĞERLENDİRİLMELİ: OLİGOMETASTAZ ABLATİF SBRT (SABR-COMET)',
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
            primaryScheme: sbrtOligo,
            alternativeSchemes: [sbrtOligo],
          };
        }
        const pal: DoseScheme = {
          id: 'lung-pal-30',
          name: '30 Gy / 10 fx (Semptom Kontrolü Palyatif RT)',
          tag: '🛡️ Palyatif RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: '3D-CRT / Konformal RT',
          indication: 'Yaygın polimetastatik hastalıkta primer tümöre ablatif RT sağkalımı artırmaz. Sistemik tedavi önceliklidir; RT hemoptizi/ağrı palyasyonuna yöneliktir.',
          targetVolumes: [{ name: 'GTV_Palyatif', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik obstrüktif kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' }],
          systemicTherapy: 'Birinci basamak Kemo-İmmünoterapi (KEYNOTE-189/407).',
          evidence: 'NCCN v1.2025 Palyatif İlkeler',
        };
        return {
          statusText: 'PALYATİF / SİSTEMİK TEDAVİ ÖNCELİKLİ (SEMPTOMATİK RT)',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: pal,
          alternativeSchemes: [pal],
        };
      }

      if (isPostop && thoraxSurgeryStatus === 'Postop_R0' && (selectedN === 'N0' || selectedN === 'N1')) {
        const contra: DoseScheme = {
          id: 'lung-contra',
          name: 'Radyoterapi Önerilmez (İzlem)',
          tag: '⛔ KONTRENDİKE',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'İzlem / Rutin BT Takibi',
          indication: 'R0 rezeke pN0-pN1 olgularda postoperatif radyoterapi (PORT) sağkalımı düşürür ve kardiyopulmoner mortaliteyi artırır. UYGULANMAMALIDIR.',
          targetVolumes: [],
          oars: [],
          evidence: 'PORT Meta-Analysis (Lancet), Lung-ART (Lancet Oncol 2022)',
        };
        return {
          statusText: 'ENDİKE DEĞİLDİR: PORT KONTRENDİKEDİR (LUNG-ART)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
          primaryScheme: contra,
          alternativeSchemes: [contra],
        };
      }

      if (isLocallyAdvanced) {
        const pacific: DoseScheme = {
          id: 'lung-pacific',
          name: '60 Gy / 30 fx (Eşzamanlı KRT + PACIFIC)',
          tag: '⚡ PACIFIC Standart',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Elektif Nodal Işınlama YAPILMAZ)',
          indication: 'Lokal ileri rezeke edilemez Evre III olgularda kesin eşzamanlı KRT standardı. KRT bitiminde progresyonsuz olgularda 12 aya kadar Durvalumab (Kategori 1).',
          targetVolumes: [
            { name: 'GTV_T & Nodal', doseGy: 60, marginMm: '0 mm', anatomical: 'Primer kitle + PET/biyopsi pozitif mediastinal nodlar' },
            { name: 'CTV_Involved', doseGy: 60, marginMm: 'GTV + 5-7 mm', anatomical: 'Yalnızca tutulu alan mikroskobik payı' },
            { name: 'PTV_Definitive', doseGy: 60, marginMm: 'CTV + 5 mm', anatomical: 'Solunum ve set-up zarfı' },
          ],
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 30-35%', source: 'RTOG 0617' },
            { organ: 'Kalp Mean Doz', metric: 'Dmean', limit: '< 15 Gy', source: 'RTOG 0617 (OS Belirleyicisi)' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin/Etopozid. KRT bitiminde 12 ay Durvalumab konsolidasyonu.',
          evidence: 'PACIFIC Faz III (NEJM 2017 & 2021), RTOG 0617',
        };
        const highDose: DoseScheme = { ...pacific, id: 'lung-high-66', name: '66 Gy / 33 fx (Yüksek Doz KRT)', totalDoseGy: 66, fractionCount: 33 };
        return {
          statusText: 'ENDİKE: DEFİNİTİF EŞZAMANLI KRT + PACIFIC DURVALUMAB',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pacific,
          alternativeSchemes: [pacific, highDose],
        };
      }

      // Erken Evre SBRT
      const lungSbrtTargets = (doseGy: number) => breathingMotion === 'DIBH'
        ? [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: "Derin inspiryum BT'deki primer parankimal kitle" },
            { name: 'ITV_DIBH', doseGy, marginMm: 'GTV->ITV: DIBH / gating ile artık solunum hareketini doğrulayın', anatomical: 'Hareket yönetimi ve 4D-CT doğrulamasına göre' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +3 mm (DIBH / gating)', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
          ]
        : [
            { name: 'GTV', doseGy, marginMm: '0 mm', anatomical: 'Parankimal primer kitle (BT/PET füzyonu)' },
            { name: 'ITV_4D', doseGy, marginMm: 'GTV->ITV: 4D-CT solunum hareket zarfı', anatomical: 'Tümörün solunum siklusu boyunca kat ettiği hareket hacmi (MIP)' },
            { name: 'PTV_SBRT', doseGy, marginMm: 'ITV->PTV +5 mm', anatomical: 'Günlük IGRT ve set-up güvenlik marjini' },
          ];
      const lungSbrtTechnique = breathingMotion === 'DIBH'
        ? 'DIBH (Derin İnspiryumda Nefes Tutma) + SGRT (Optik Yüzey Rehberliği) / VMAT'
        : 'SBRT (4D-CT / ITV tabanlı VMAT)';
      let sbrt: DoseScheme;
      let sbrtAlt: DoseScheme | null = null;
      if (thoraxCentrality === 'Central') {
        sbrt = {
          id: 'lung-sbrt-50',
          name: '50 Gy / 5 fx (SBRT Santral No-Fly Zone)',
          tag: '⚠️ Santral SBRT',
          totalDoseGy: 50,
          fractionCount: 5,
          fractionDoseGy: 10,
          alphaBeta: 10,
          technique: `${lungSbrtTechnique} (Risk-Adapte)`,
          indication: 'PBT ≤2 cm komşu lezyonlar. Fatal hemoptizi ve bronşiyal fistülü önlemek için 5 fraksiyon standardı.',
          targetVolumes: lungSbrtTargets(50),
          oars: [{ organ: 'Proksimal Bronş Ağacı', metric: 'Dmax', limit: '< 50 Gy', source: 'RTOG 0813' }],
          evidence: 'RTOG 0813 (Bezjak et al. JCO 2019)',
          evidenceLinks: [
            {
              authority: 'NCCN',
              title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
              url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
              category: 'Kategori 1',
            },
            {
              authority: 'ASTRO',
              title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
              url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
              category: 'Consensus Guideline',
            },
            {
              authority: 'ESTRO',
              title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
              url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
              category: 'Consensus Guideline',
            },
            {
              authority: 'RTOG',
              title: 'RTOG 0813 trial protocol / reference',
              url: 'https://www.nrgoncology.org/clinical-trials/rtog-0813',
              category: 'Phase I/II Protocol',
            },
          ],
        };
      } else if (thoraxCentrality === 'UltraCentral') {
        sbrt = {
          id: 'lung-sbrt-60',
          name: '60 Gy / 12 fx (SBRT Ultrasantral SUNSET)',
          tag: '🛡️ Ultrasantral',
          totalDoseGy: 60,
          fractionCount: 12,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: `${lungSbrtTechnique} (Hipofraksiyone)`,
          indication: 'Trakea veya özofagus ile direkt temas eden lezyonlar. 3-5 fraksiyonluk ablatif dozlar kontrendikedir.',
          targetVolumes: lungSbrtTargets(60),
          oars: [{ organ: 'Ana Bronş / Trakea', metric: 'Dmax', limit: '< 60 Gy', source: 'SUNSET Trial' }],
          evidence: 'SUNSET Trial',
          evidenceLinks: [
            {
              authority: 'NCCN',
              title: 'NCCN Non-Small Cell Lung Cancer Guidelines (v1.2025 - Principles of Radiation Therapy, p.77)',
              url: 'https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf#page=77',
              category: 'Kategori 1',
            },
            {
              authority: 'ASTRO',
              title: 'ASTRO Clinical Practice Guideline on SBRT for Early-Stage NSCLC',
              url: 'https://www.astro.org/provider-resources/guidelines/astro-s-guideline-on-sbrt-for-early-stage-nsclc',
              category: 'Consensus Guideline',
            },
            {
              authority: 'ESTRO',
              title: 'ESTRO-ACROP Consensus Recommendations on SBRT for Early-Stage Lung Cancer',
              url: 'https://doi.org/10.1016/j.radonc.2017.05.012',
              category: 'Consensus Guideline',
            },
          ],
        };
      } else {
        sbrt = {
          id: 'lung-sbrt-54',
          name: '54 Gy / 3 fx (SBRT Periferik Standart)',
          tag: '🎯 Periferik SBRT',
          totalDoseGy: 54,
          fractionCount: 3,
          fractionDoseGy: 18,
          alphaBeta: 10,
          technique: lungSbrtTechnique,
          indication: 'Periferik erken evre KHDAK (Kategori 1 küratif altın standart, BED10 = 151.2 Gy).',
          targetVolumes: lungSbrtTargets(54),
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0236' },
            { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0236' },
          ],
          evidence: 'RTOG 0236, RTOG 0915, NCCN v1.2025 Kategori 1',
          evidenceLinks: LUNG_SBRT_EVIDENCE_LINKS,
        };
        sbrtAlt = {
          id: 'lung-sbrt-48',
          name: '48 Gy / 4 fx (SBRT Periferik Alternatif)',
          tag: '🎯 Periferik 4 fx',
          totalDoseGy: 48,
          fractionCount: 4,
          fractionDoseGy: 12,
          alphaBeta: 10,
          technique: lungSbrtTechnique,
          indication: 'Göğüs duvarına komşu veya fraksiyon başına doz toksisitesi sınırlandırılmak istenen periferik erken evre KHDAK alternatifi (BED10 = 105.6 Gy).',
          targetVolumes: lungSbrtTargets(48),
          oars: [
            { organ: 'Bilateral Akciğer', metric: 'V20Gy', limit: '< 10-15%', source: 'RTOG 0915' },
            { organ: 'Göğüs Duvarı', metric: 'V30Gy', limit: '< 30 cc', source: 'RTOG 0915' },
          ],
          evidence: 'RTOG 0915, NCCN v1.2025',
          evidenceLinks: LUNG_SBRT_0915_EVIDENCE_LINKS,
        };
      }
      return {
        statusText: `ENDİKE: KÜRATİF ${sbrt.tag} PROTOKOLÜ`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: sbrt,
        alternativeSchemes: sbrtAlt ? [sbrt, sbrtAlt] : [sbrt],
      };
    }

    // ------------------------------------------
    // 2. JİNEKOLOJİ (SERVİKS, ENDOMETRİYUM, OVER, VAJEN, VULVA)
    // ------------------------------------------
    if (selectedOrgan === 'gynecology') {
      if (gynSite === 'Serviks') {
        const cervixCrt: DoseScheme = {
          id: 'gyn-cervix-embrace',
          name: '45-50.4 Gy Pelvik EBRT + HDR 3D Brakiterapi (EMBRACE II)',
          tag: '⚡ EMBRACE II Standart',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IGRT Pelvik KRT + MR Kılavuzluğunda 3D/4D İntrakaviter/İnterstisyel Brakiterapi',
          indication: 'Lokal ileri Serviks Karsinomu (FIGO IB3-IVA veya LN+). Eşzamanlı haftalık Sisplatinli EBRT sonrası IGABT ile HR-CTV D90 ≥85-90 Gy EQD2 hedeflenir.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Serviks, uterus, parametriyal dokular, vajen üst 1/2 ve pelvik lenf nodları' },
            { name: 'HR-CTV (High-Risk)', doseGy: 85, marginMm: 'MR bazlı', anatomical: 'Rezidu servikal kitle + tüm serviks (Brakiterapi ile eskalasyon)' },
          ],
          oars: [
            { organ: 'Rektum', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 65 / < 75 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Mesane', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 80 / < 90 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Sigmoid / bağırsak', metric: 'D2cc EQD2 α/β=3 (planlama hedefi / limit)', limit: '< 70 / < 75 Gy', source: 'EMBRACE II', context: 'Kümülatif EBRT + brakiterapi; yalnızca serviks kanseri.', contextEn: 'Cumulative EBRT + brachytherapy; cervical cancer only.', classification: 'protocol-limit' },
            { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc', source: 'QUANTEC small bowel (2010)', context: 'EBRT peritoneal cavity/bowel-bag metric; brakiterapi D2cc değerinden ayrı.', contextEn: 'EBRT peritoneal-cavity/bowel-bag metric; separate from brachytherapy D2cc.', classification: 'dose-volume-reference' },
          ],
          systemicTherapy: 'Eşzamanlı haftalık Sisplatin (40 mg/m2, 5-6 kür).',
          evidence: 'EMBRACE II Protokolü, NCCN v1.2025 Kategori 1',
        };

        const postopPeters: DoseScheme = {
          id: 'gyn-cervix-peters',
          name: '50.4 Gy / 28 fx Pelvik KRT (Peters Protokolü)',
          tag: '🔬 Peters Adjuvan KRT',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT + Eşzamanlı Sisplatin',
          indication: 'Radikal histerektomi sonrası yüksek risk faktörleri (Pozitif cerrahi marjin, pozitif pelvik lenf nodları, parametriyal tutulum).',
          targetVolumes: [
            { name: 'CTV_Bed_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, parametriyum yatağı ve pelvik lenfatik drenaj' },
          ],
          oars: [
            { organ: 'Individual small-bowel loops', metric: 'V15Gy', limit: '< 120 cc (QUANTEC conventional-fractionation reference)', source: 'QUANTEC small bowel (2010)', context: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', contextEn: 'Individual loops only; not interchangeable with a bowel-bag V45Gy metric.', classification: 'dose-volume-reference' },
            { organ: 'Rectum', metric: 'Protocol-specific DVH', limit: 'Follow the applicable postoperative pelvic RT protocol', source: 'Peters / GOG 109 protocol', context: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', contextEn: 'Do not apply prostate-specific QUANTEC rectal DVH values as universal gynecologic limits.', classification: 'context-note' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin (40-50 mg/m2 haftalık).',
          evidence: 'Peters et al. (JCO 2000), GOG 109',
        };

        return {
          statusText: cervixScenario === 'Adjuvan_Peters'
            ? 'ENDİKE: POSTOPERATİF YÜKSEK RİSK ADJUVAN KRT (PETERS)'
            : 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + 3D IGABT (EMBRACE II)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: cervixScenario === 'Adjuvan_Peters' ? postopPeters : cervixCrt,
          alternativeSchemes: [cervixCrt, postopPeters],
        };
      }

      if (gynSite === 'Endometriyum') {
        if (endoRisk === 'Low') {
          const noRt: DoseScheme = {
            id: 'endo-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Düzenli Jinekolojik Takip',
            indication: 'Düşük riskli endometrioid adenokarsinomda (Evre IA, G1-2, LVSI yok) cerrahi sonrası radyoterapiye gerek yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'PORTEC-1, ASTRO Guidelines',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: DÜŞÜK RİSK ENDOMETRİYUMDA İZLEM STANDARTTIR',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        } else if (endoRisk === 'Intermediate' || endoRisk === 'High_Intermediate') {
          const vcb: DoseScheme = {
            id: 'endo-vcb-21',
            name: '21 Gy / 3 fx veya 25 Gy / 5 fx (Vajinal Kaf Brakiterapisi - VCB)',
            tag: '🎯 VCB Standardı (PORTEC-2)',
            totalDoseGy: 21,
            fractionCount: 3,
            fractionDoseGy: 7.0,
            alphaBeta: 10,
            technique: 'HDR Vajinal Silindir Aplikatör (Mukoza altı 5 mm derinlikte)',
            indication: 'Yüksek-orta risk endometrioid karsinomda (Evre IB G1-2 veya Evre IA G3, yaş ≥60, LVSI+): Pelvik EBRT ile eşit lokal kontrol sağlar, gastrointestinal toksisiteyi belirgin azaltır.',
            targetVolumes: [
              { name: 'CTV_VaginaCuff', doseGy: 21, marginMm: 'Üst 1/3-1/2', anatomical: 'Vajinal kaf ve üst 3-4 cm vajina mukozası' },
            ],
            oars: [
              { organ: 'Rektum Mukoza', metric: 'Dmax', limit: '< 100% reçete dozu', source: 'ABS / ESTRO' },
              { organ: 'Mesane Mukoza', metric: 'Dmax', limit: '< 100% reçete dozu', source: 'ABS / ESTRO' },
            ],
            evidence: 'PORTEC-2 Faz III (Lancet 2010), ASTRO Endometrial Guidelines',
          };
          return {
            statusText: 'ENDİKE: VAJİNAL KAF BRAKİTERAPİSİ (PORTEC-2 STANDARDI)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: vcb,
            alternativeSchemes: [vcb],
          };
        } else {
          const portec3: DoseScheme = {
            id: 'endo-portec3-45',
            name: '45-50.4 Gy Pelvik EBRT + Eşzamanlı/Adjuvan KT (PORTEC-3)',
            tag: '⚡ PORTEC-3 Yüksek Risk',
            totalDoseGy: 45,
            fractionCount: 25,
            fractionDoseGy: 1.8,
            alphaBeta: 10,
            technique: 'IMRT / VMAT Pelvik Nodal RT ± VCB Boost',
            indication: 'Yüksek riskli endometriyum ca (Evre III, seröz/berrak hücreli veya derin myometriyal invazyon + G3): Pelvik EBRT + KT genel sağkalımı ve nükssüz sağkalımı belirgin artırır.',
            targetVolumes: [
              { name: 'CTV_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Vajinal kaf, paraservikal yatak ve pelvik lenfatikler' },
              { name: 'VCB_Boost', doseGy: 10, marginMm: 'HDR', anatomical: 'Pozitif marjin veya servikal tutulumda vajinal kaf boostu' },
            ],
            oars: [
              { organ: 'Bowel bag (EBRT)', metric: 'V45Gy', limit: '< 195 cc (QUANTEC reference; protocol-specific)', source: 'QUANTEC small bowel (2010)', context: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', contextEn: 'Bowel-bag/peritoneal cavity metric; do not apply as an individual-loop threshold.', classification: 'dose-volume-reference' },
              { organ: 'Mesane', metric: 'Protocol-specific DVH', limit: 'Follow the applicable pelvic RT protocol; no universal QUANTEC V45 limit asserted', source: 'PORTEC-3 protocol', context: 'This is not a QUANTEC small-bowel constraint.', contextEn: 'This is not a QUANTEC small-bowel constraint.', classification: 'context-note' },
            ],
            systemicTherapy: 'RT sırasında 2 kür Sisplatin (50 mg/m2) ardından 4 kür Karboplatin (AUC 5) + Paklitaksel (175 mg/m2).',
            evidence: 'PORTEC-3 Faz III (Lancet Oncol 2018), GOG 258',
          };
          return {
            statusText: 'ENDİKE: KOMBİNE PELVİK EBRT + SİSTEMİK KT (PORTEC-3)',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            primaryScheme: portec3,
            alternativeSchemes: [portec3],
          };
        }
      }

      if (gynSite === 'Over_Tuba') {
        const sbrtOvary: DoseScheme = {
          id: 'ovary-sbrt-35',
          name: '35-45 Gy / 3-5 fx (Oligometastaz / Rekürrens SBRT)',
          tag: '🎯 Over Oligometastaz SBRT',
          totalDoseGy: 35,
          fractionCount: 5,
          fractionDoseGy: 7.0,
          alphaBeta: 10,
          technique: 'SBRT (MR veya BT Kılavuzluğunda Hassas VMAT)',
          indication: 'Over ve tuba kanserinde primer tedavi cerrahi debulking ve sistemik KT\'dir. İzole pelvik/para-aortik nükste veya kemorezistan oligoprogresyonda SBRT %90+ lokal kontrol sağlar.',
          targetVolumes: [
            { name: 'GTV_Recurrence', doseGy: 35, marginMm: '0 mm', anatomical: 'PET/MR pozitif nüks lenf nodu veya visseral kitle' },
            { name: 'PTV', doseGy: 35, marginMm: 'GTV + 3-5 mm', anatomical: 'Stereotaktik güvenlik marjini' },
          ],
          oars: [
            { organ: 'İnce Bağırsak / Duodenum', metric: 'Dmax', limit: '< 30 Gy', source: 'AAPM TG-101' },
            { organ: 'Büyük Damarlar', metric: 'Dmax', limit: '< 45 Gy', source: 'HyTEC' },
          ],
          systemicTherapy: 'Platin duyarlı/dirençli sistemik tedaviye mola sağlama potansiyeli.',
          evidence: 'MITO RT Group Study, NCCN v1.2025 Ovarian Principles',
        };
        const palOvary: DoseScheme = {
          id: 'ovary-pal-30',
          name: '30 Gy / 10 fx (Pelvik Kitle & Hemostaz Palyatif RT)',
          tag: '🛡️ Palyatif Pelvik RT',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3.0,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT',
          indication: 'Ağrılı nüks pelvik kitle veya rektal/vajinal kanama semptomlarını kontrol altına almak için uygulanır.',
          targetVolumes: [{ name: 'GTV_Mass', doseGy: 30, marginMm: '0 mm', anatomical: 'Semptomatik kitle' }],
          oars: [{ organ: 'Bağırsak', metric: 'Dmax', limit: '< 32 Gy', source: 'QUANTEC' }],
          evidence: 'Palliative Radiotherapy Guidelines in Gynecologic Oncology',
        };
        return {
          statusText: 'SEÇİLMİŞ ENDİKASYON: OLİGOMETASTAZDA SBRT VEYA PALYATİF RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: ovaryScenario === 'Oligometastatik_SBRT' ? sbrtOvary : palOvary,
          alternativeSchemes: [sbrtOvary, palOvary],
        };
      }

      if (gynSite === 'Vajen') {
        const vajenCrt: DoseScheme = {
          id: 'vagina-crt-45',
          name: '45 Gy EBRT + İnterstisyel / İntrakaviter Brakiterapi (Toplam EQD2 75-80 Gy)',
          tag: '⚡ Definitif Vajen KRT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pelvik (± Kasık) EBRT + 3D HDR Brakiterapi Boost',
          indication: 'Primer Vajen Karsinomu (FIGO Evre II-IVA): Alt 1/3 tutulumunda bilateral inguinal lenfatikler zorunlu olarak alana dahil edilir. Eşzamanlı haftalık Sisplatin uygulanır.',
          targetVolumes: [
            { name: 'CTV_Vagina_Pelvis', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Tüm vajen, parakolpium, pelvik lenf nodları (alt 1/3 ise bilateral kasık dahil)' },
            { name: 'HR-CTV_Brachy', doseGy: 75, marginMm: 'Brakiterapi', anatomical: 'Primer kitle rezidüsü (İnterstisyel iğneler veya silindir ile boost)' },
          ],
          oars: [
            { organ: 'Rektum D2cc', metric: 'EQD2', limit: '< 70 Gy', source: 'ABS Guidelines' },
            { organ: 'Mesane D2cc', metric: 'EQD2', limit: '< 80 Gy', source: 'ABS Guidelines' },
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı haftalık Sisplatin (40 mg/m2).',
          evidence: 'ABS Consensus Guidelines for Vaginal Cancer, NCCN',
        };
        return {
          statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + İNTERSTİSYEL BRAKİTERAPİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: vajenCrt,
          alternativeSchemes: [vajenCrt],
        };
      }

      if (gynSite === 'Vulva') {
        const isPostop = vulvaScenario === 'Adjuvan_Cerrahi_Sonrasi';
        const vulvaPort: DoseScheme = {
          id: 'vulva-port-50',
          name: '45-50.4 Gy / 25-28 fx (Adjuvan İnguinal & Pelvik RT)',
          tag: '🛡️ GROINSS-V-II Standart',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Bilateral İnguinal ve Pelvik Lenfatik Işınlama)',
          indication: 'Radikal cerrahi sonrası: Yakın/pozitif marjin (<8 mm), >1 metastatik lenf nodu veya kapsül dışı yayılım (ENE) varlığında kasık nüksünü önler ve sağkalımı korur.',
          targetVolumes: [
            { name: 'CTV_Groin_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Bilateral inguinofemoral ve iliak lenf nodu istasyonları' },
            { name: 'Boost_LN_ENE', doseGy: 60, marginMm: 'GTV + 5 mm', anatomical: 'Kapsül dışı yayılan veya rezeke makroskopik nod yatağı' },
          ],
          oars: [
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops.', classification: 'dose-volume-reference' },
          ],
          systemicTherapy: 'Çoklu lenf nodu veya ENE pozitifliğinde eşzamanlı haftalık Sisplatin düşünülür.',
          evidence: 'GROINSS-V-II Trial (JCO 2021), GOG 37 Faz III (NEJM)',
        };

        const vulvaDefinitive: DoseScheme = {
          id: 'vulva-def-64',
          name: '60-64 Gy / 32-35 fx (Definitif / Neoadjuvan KRT)',
          tag: '⚡ Definitif Vulva KRT',
          totalDoseGy: 64,
          fractionCount: 32,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT SIB (Eşzamanlı Entegre Boost)',
          indication: 'Lokal ileri inoperabl veya organ koruma (sfinkter koruma) hedeflenen olgularda definitif kemoradyoterapi.',
          targetVolumes: [
            { name: 'PTV_Primary_High', doseGy: 64, marginMm: 'GTV + 5 mm', anatomical: 'Primer kitle ve tutulu kasık nodları' },
            { name: 'PTV_Elective_Low', doseGy: 50, marginMm: 'Elektif lenfatik', anatomical: 'Bilateral inguinofemoral ve pelvik istasyonlar' },
          ],
          oars: [
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 50 Gy', source: 'QUANTEC' },
            { organ: 'Mesane / Rektum', metric: 'V50Gy', limit: '< 20%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin veya 5-FU / Mitomisin-C.',
          evidence: 'GOG 101, GOG 205',
        };

        return {
          statusText: isPostop
            ? 'ENDİKE: POSTOPERATİF ADJUVAN İNGUİNAL/PELVİK RT (GROINSS-V)'
            : 'ENDİKE: LOKAL İLERİ VULVA DEFİNİTİF KEMORADYOTERAPİSİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: isPostop ? vulvaPort : vulvaDefinitive,
          alternativeSchemes: [vulvaPort, vulvaDefinitive],
        };
      }
    }

    // ------------------------------------------
    // 3. KEMİK & SARKOM (YDS, OSTEOSARKOM, EWING, KONDROSARKOM, KORDOMA, GCTB)
    // ------------------------------------------
    if (selectedOrgan === 'bone' || selectedOrgan === 'sarcoma' || selectedOrgan === 'bone-sarcoma') {
      if (sarcomaSubtype === 'DFSP') {
        const dfspIndicated = dfspStatus !== 'R0';
        const dfspRt: DoseScheme = {
          id: dfspIndicated ? 'dfsp-adjuvant-56' : 'dfsp-observation',
          name: dfspIndicated ? '50-60 Gy / 25-30 fx (DFSP Adjuvan / Definitif RT)' : 'RT Gerekmez - R0 Cerrahi Sonrası İzlem',
          tag: dfspIndicated ? 'Dermatofibrosarkoma Protuberans' : 'R0 Cerrahi',
          totalDoseGy: dfspIndicated ? 56 : 0,
          fractionCount: dfspIndicated ? 28 : 0,
          fractionDoseGy: dfspIndicated ? 2 : 0,
          alphaBeta: 4,
          technique: 'IMRT / VMAT; tümör yatağı ve risk uyarlanmış cerrahi sınırlar',
          indication: dfspIndicated ? 'R1 pozitif marjin veya rezeke edilemeyen dermatofibrosarkoma protuberans olgusunda lokal kontrol amacıyla adjuvan/definitif RT multidisipliner değerlendirilir.' : 'R0 cerrahi sonrası klinik izlem; RT rutin olarak gerekmez.',
          targetVolumes: dfspIndicated ? [{ name: 'CTV_DFSP', doseGy: 56, marginMm: 'Cerrahi skar ve anatomik yayılım doğrultusunda', anatomical: 'Ekstremite veya gövde primer yatağı' }] : [],
          oars: dfspIndicated ? [{ organ: 'Eklem / cilt', metric: 'Dmean', limit: 'Fonksiyonel doku koruması ile optimize et', source: 'ESTRO / NCCN' }] : [],
          evidence: 'NCCN Soft Tissue Sarcoma v1.2025; ESTRO sarcoma guidance',
        };
        return {
          statusText: dfspIndicated ? 'ENDİKE: DFSP R1 MARJİN VEYA REZEKE EDİLEMEYEN HASTALIKTA RT DEĞERLENDİR' : 'R0 CERRAHİ SONRASI RT GEREKMEZ: İZLEM',
          badgeClass: dfspIndicated ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: dfspRt,
          alternativeSchemes: [dfspRt],
        };
      }

      if (sarcomaSubtype === 'Yumusak_Doku') {
        const isPreop = sarcomaSurgery === 'Preop';
        const sarcomaScheme: DoseScheme = {
          id: isPreop ? 'sarcoma-preop-50' : 'sarcoma-postop-66',
          name: isPreop ? '50 Gy / 25 fx (Preoperatif Neoadjuvan RT)' : '60-66 Gy / 30-33 fx (Postoperatif Cerrahi Sınır RT)',
          tag: isPreop ? '🛡️ Preop Altın Standart' : '🔬 Postop Eskalasyon',
          totalDoseGy: isPreop ? 50 : 66,
          fractionCount: isPreop ? 25 : 33,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT (Ekstremite Cilt Şeridi ve Eklem Koruma Zorunlu)',
          indication: isPreop
            ? 'Yüksek dereceli derin yumuşak doku sarkomunda preoperatif RT: Hedef hacim daha küçük, uzun dönem fibrozis ve lenfödem riski anlamlı düşüktür (Cerrahi 4-6 hafta sonra).'
            : 'Pozitif cerrahi marjin (R1) veya yakın sınır olgularında lokal kontrolü korumak için 66 Gy doza çıkılır.',
          targetVolumes: [
            { name: 'GTV', doseGy: isPreop ? 50 : 66, marginMm: '0 mm', anatomical: 'Primer kitle veya tümör rezeksiyon yatağı' },
            { name: 'CTV', doseGy: isPreop ? 50 : 60, marginMm: 'Boyuna 3-4 cm, radyal 1.5 cm', anatomical: 'Fasyal planlar boyunca anatomik mikroskobik yayılım payı' },
          ],
          oars: [],
          evidence: 'Kanada Sarcoma Group Faz III (O\'Sullivan et al. Lancet 2002), NCCN v1.2025',
        };
        return {
          statusText: isPreop
            ? 'ENDİKE: PREOPERATİF 50 GY RT (DÜŞÜK UZUN DÖNEM TOKSİSİTE)'
            : 'ENDİKE: POSTOPERATİF MARJİN ESKALASYONLU RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: sarcomaScheme,
          alternativeSchemes: [sarcomaScheme],
        };
      }

      if (sarcomaSubtype === 'Osteosarkom') {
        if (osteoScenario === 'Cerrahi_R0_Takip') {
          const osteoObs: DoseScheme = {
            id: 'osteo-obs',
            name: 'Radyoterapi Önerilmez (İzlem)',
            tag: '👁️ Cerrahi R0 İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Adjuvan MAP Kemoterapisi + İzlem',
            indication: 'Osteosarkom klasik olarak radyorezistandır. R0 geniş rezeksiyon ve neoadjuvan/adjuvan kemoterapi (Metotreksat, Doksorubisin, Sisplatin) standarttır; RT önerilmez.',
            targetVolumes: [],
            oars: [],
            evidence: 'NCCN Bone Cancer Guidelines - Osteosarcoma Principles',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: R0 CERRAHİ SONRASI RT GEREKMEZ (KT + İZLEM)',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: osteoObs,
            alternativeSchemes: [osteoObs],
          };
        } else {
          const osteoHigh: DoseScheme = {
            id: 'osteo-high-70',
            name: '66-74 Gy / 33-37 fx (Yüksek Doz Eskalasyonlu RT)',
            tag: '🔬 Yüksek Doz / Partikül RT',
            totalDoseGy: 70,
            fractionCount: 35,
            fractionDoseGy: 2.0,
            alphaBeta: 10,
            technique: 'IMRT / VMAT veya Proton / Karbon İyon Tedavisi',
            indication: 'Rezeke edilemeyen, pozitif marjinli (R1/R2) veya aksiyel/pelvik/kafatası tabanı osteosarkomlarında lokal kontrol için yüksek doza çıkılmalıdır.',
            targetVolumes: [
              { name: 'GTV_Residue', doseGy: 70, marginMm: '0 mm', anatomical: 'Makroskopik rezidü veya cerrahi sınır pozitif kemik yatağı' },
              { name: 'CTV', doseGy: 60, marginMm: 'GTV + 15 mm', anatomical: 'Mikroskobik kemik iliği ve periostal alan' },
            ],
            oars: [
              { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45-50 Gy', source: 'QUANTEC' },
              { organ: 'Büyük Sinir Gövdeleri', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
            ],
            systemicTherapy: 'Sistemik MAP kemoterapisi eşlik eder.',
            evidence: 'NCCN Bone Cancer Guidelines, DeLaney et al. (Cancer 2005)',
          };
          return {
            statusText: 'ENDİKE: İNOPERABL VEYA R1/R2 OSTEOSARKOMDA YÜKSEK DOZ RT',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            primaryScheme: osteoHigh,
            alternativeSchemes: [osteoHigh],
          };
        }
      }

      if (sarcomaSubtype === 'Ewing') {
        const isDefinitive = ewingIntent === 'Definitif_RT';
        const ewingScheme: DoseScheme = {
          id: isDefinitive ? 'ewing-def-55' : 'ewing-postop-50',
          name: isDefinitive ? '55.8 Gy / 31 fx (Definitif Lokal Kontrol RT)' : '45-50.4 Gy / 25-28 fx (Postoperatif R1/R2 RT)',
          tag: isDefinitive ? '⚡ Definitif Küratif RT' : '🛡️ Postop Adjuvan RT',
          totalDoseGy: isDefinitive ? 55.8 : 50.4,
          fractionCount: isDefinitive ? 31 : 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Pre-KT Başlangıç Kemik Hacmi Zorunlu)',
          indication: 'Ewing sarkomu yüksek derecede radyosensitiftir. Cerrahiye uygun olmayan olgularda veya pozitif cerrahi sınır sonrası lokal kontrol sağlar.',
          targetVolumes: [
            { name: 'CTV_Initial_Bone', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Kemoterapi ÖNCESİ başlangıçtaki tüm kemik tutulum hacmi' },
            { name: 'CTV_Boost_Residue', doseGy: isDefinitive ? 55.8 : 50.4, marginMm: 'GTV + 10 mm', anatomical: 'Kemoterapi SONRASI rezidüel yumuşak doku kompanenti' },
          ],
          oars: [
            { organ: 'Büyüme Plağı (Pediatrik)', metric: 'Dmean', limit: 'Asimetrik büyümeyi önlemek için homojen alan', source: 'PENTEC' },
            { organ: 'Komşu Eklem', metric: 'V50Gy', limit: '< 50%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'VDC/IE (Vinkristin, Doksorubisin, Siklofosfamid / İfosfamid, Etopozid) kemoterapisi.',
          evidence: 'Euro-EWING 99, Children\'s Oncology Group (COG) Protocols',
        };
        return {
          statusText: 'ENDİKE: RADYOSENSİTİF EWING SARKOMU LOKAL KONTROL PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: ewingScheme,
          alternativeSchemes: [ewingScheme],
        };
      }

      if (sarcomaSubtype === 'Kondrosarkom') {
        const chondroRt: DoseScheme = {
          id: 'chondro-70',
          name: '70-74 Gy / 35-37 fx (Partikül / Yüksek Doz Eskalasyon)',
          tag: '🔬 Doz Eskalasyonlu RT',
          totalDoseGy: 70,
          fractionCount: 35,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'Proton Terapi / Karbon İyon veya Yüksek Doz IMRT',
          indication: 'Konvansiyonel kondrosarkomlar radyorezistandır. İnoperabl, kafa tabanı veya sakral olgularda ≥70 Gy EQD2 gereklidir.',
          targetVolumes: [{ name: 'GTV', doseGy: 70, marginMm: '0 mm', anatomical: 'Rezidü veya inoperabl kitle' }],
          oars: [{ organ: 'Beyin Sapı / Optik Yol', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Cancer, Particle Therapy Oncology Group',
        };
        return {
          statusText: 'SEÇİLMİŞ OLGULARDA: İNOPERABL KONDROSARKOMDA YÜKSEK DOZ RT',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: chondroRt,
          alternativeSchemes: [chondroRt],
        };
      }

      if (sarcomaSubtype === 'Kordoma') {
        const chordomaScheme: DoseScheme = {
          id: 'chordoma-74',
          name: '74-76 Gy / 37-38 fx (Klivus / Sakrum Ultra Yüksek Doz)',
          tag: '⚡ Ultra Yüksek Doz / Partikül',
          totalDoseGy: 74,
          fractionCount: 37,
          fractionDoseGy: 2.0,
          alphaBeta: 2.5,
          technique: 'Proton / Karbon İyon veya Stereotaktik Fraksiyone SRT',
          indication: 'Kordomalar son derece radyorezistandır ve komşu nöral yapılara yakındır. Küratif kontrol için >74 Gy EQD2 dozu şarttır.',
          targetVolumes: [{ name: 'GTV', doseGy: 74, marginMm: '0 mm', anatomical: 'Sakral veya klivus lezyon hacmi' }],
          oars: [{ organ: 'Beyin Sapı / Kord', metric: 'Dmax', limit: '< 54-60 Gy', source: 'HyTEC' }],
          evidence: 'Consensus Guidelines for Chordoma Management',
        };
        return {
          statusText: 'ENDİKE: KORDOMADA ULTRA YÜKSEK DOZ PARTİKÜL / IMRT ESKALASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: chordomaScheme,
          alternativeSchemes: [chordomaScheme],
        };
      }

      if (sarcomaSubtype === 'GCTB') {
        const gctbScheme: DoseScheme = {
          id: 'gctb-50',
          name: '45-50.4 Gy / 25-28 fx (Definitif Lokal Kontrol RT)',
          tag: '🛡️ GCTB Lokal Kontrol',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Konformal IMRT / VMAT',
          indication: 'Cerrahi rezeksiyonu ağır morbidite veya instabilite yaratacak omurga/pelvis yerleşimli veya Denosumab sonrası inoperabl olgularda %80+ lokal kontrol sağlar.',
          targetVolumes: [{ name: 'GTV', doseGy: 50.4, marginMm: '0 mm', anatomical: 'Ekspansif litik kitle' }],
          oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' }],
          evidence: 'NCCN Bone Sarcoma Guidelines',
        };
        return {
          statusText: 'ENDİKE: İNOPERABL DEV HÜCRELİ KEMİK TÜMÖRÜNDE DEFİNİTİF RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gctbScheme,
          alternativeSchemes: [gctbScheme],
        };
      }
    }

    // ------------------------------------------
    // 4. BAŞ-BOYUN
    // ------------------------------------------
    if (selectedOrgan === 'head-neck') {
      const bilateralNeck = hnSubsite === 'nasopharynx'
        || hnSubsite === 'oropharynx'
        || hnSubsite === 'hypopharynx'
        || (hnSubsite === 'larynx' && hnLarynxSubsite === 'Lokal_Ileri_T3_T4')
        || hnCrossesMidline
        || (parseFloat(hnDistanceFromMidlineCm) || 0) < 1;
      const electiveNeckIndicated = (parseFloat(hnTumorSizeCm) || 0) > 1 || (parseFloat(hnDoiMm) || 0) > 5;
      if (hnSubsite === 'larynx' && hnLarynxSubsite === 'Erken_Glottik_T1_T2') {
        const earlyGlottic: DoseScheme = {
          id: 'larynx-glottic-63',
          name: '63 Gy / 28 fx (2.25 Gy/fx Hipofraksiyone Glottik RT)',
          tag: '🎯 Erken Glottik Standart',
          totalDoseGy: 63,
          fractionCount: 28,
          fractionDoseGy: 2.25,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT (Yalnızca Vokal Kordlar - Boyun IŞINLANMAZ)',
          indication: 'Erken evre T1a/b-T2 N0 Glottik Kanser: Vokal kord mobilitesi ve ses kalitesini korur; elektif boyun ışınlaması KESİNLİKLE yapılmaz.',
          targetVolumes: [
            { name: 'PTV_Glottic', doseGy: 63, marginMm: '5 mm', anatomical: 'Gerçek vokal kordlar, ön komissür ve aritenoid vokal proçes' },
          ],
          oars: [
            { organ: 'Karotis Arterler', metric: 'Dmean', limit: '< 20-30 Gy (İnme önleme)', source: 'RTOG' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 30 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 9512, Yamazaki et al., NCCN v1.2025',
        };
        return {
          statusText: 'ENDİKE: ERKEN GLOTTİK LARİNKS HİPOFRAKSİYONE RT (BOYUNSUZ)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: earlyGlottic,
          alternativeSchemes: [earlyGlottic],
        };
      }

      if (hnSubsite === 'maxillary-sinus') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const dose = highRiskAdjuvant ? 66 : 60;
        const maxillarySinusScheme: DoseScheme = {
          id: 'maxillary-sinus-postoperative',
          name: `${dose} Gy / ${dose / 2} fx (${highRiskAdjuvant ? 'Kategori 1 eşzamanlı kemoradyoterapi' : 'adjuvan radyoterapi'})`,
          tag: highRiskAdjuvant ? 'Kategori 1 · ENE+ / R1' : 'Maksiller Sinüs',
          totalDoseGy: dose,
          fractionCount: dose / 2,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT · IGRT',
          indication: highRiskAdjuvant
            ? 'ENE+ veya R1 cerrahi sınır: Kategori 1 adjuvan eşzamanlı sisplatin ve 66 Gy / 33 fx.'
            : 'Maksiller sinüs histolojisi, evresi, cerrahi ve risk özelliklerine göre multidisipliner değerlendirme.',
          targetVolumes: [
            { name: 'CTV_Primary_High_Risk', doseGy: dose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Cerrahi yatak / primer tümör yatağı' },
            { name: 'CTV_Elective_Nodal', doseGy: highRiskAdjuvant ? 54 : 50, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: 'Patoloji ve başlangıç görüntülemeye göre elektif boyun' },
          ],
          oars: [],
          systemicTherapy: highRiskAdjuvant ? 'Eşzamanlı sisplatin (uygunluk ve kurum protokolüne göre).' : undefined,
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'KATEGORİ 1: ENE+ / R1 · 66 Gy / 33 fx + EŞZAMANLI SİSPLATİN'
            : 'Maksiller Sinüs: Histoloji, evre ve risk bilgileriyle MDT değerlendirmesi',
          badgeClass: highRiskAdjuvant
            ? 'bg-rose-950/60 text-rose-100 border-rose-500/60'
            : 'bg-sky-950/60 text-sky-100 border-sky-500/40',
          primaryScheme: maxillarySinusScheme,
          alternativeSchemes: [maxillarySinusScheme],
        };
      }

      if (hnSubsite === 'oral-cavity') {
        const highRiskAdjuvant = hnENE || hnPositiveMargin;
        const oralCavityDose = highRiskAdjuvant ? 66 : 60;
        const oralCrt: DoseScheme = {
          id: 'oral-postop-66',
          name: `${oralCavityDose} Gy / ${oralCavityDose / 2} fx (Postoperatif ${highRiskAdjuvant ? 'KRT' : 'RT'} - EORTC 22931 / RTOG 9501)`,
          tag: '⚡ EORTC/RTOG Standart',
          totalDoseGy: oralCavityDose,
          fractionCount: oralCavityDose / 2,
          fractionDoseGy: 2.0,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (Yüksek Risk Yatak Boostu)',
          indication: highRiskAdjuvant
            ? 'Oral kavite cerrahisi sonrası ENE veya pozitif cerrahi sınır (R1) nedeniyle Sisplatin eşzamanlı adjuvan KRT değerlendirilir (EORTC 22931 / RTOG 9501).'
            : electiveNeckIndicated
              ? 'Tümör çapı >1 cm veya DOI >5 mm olduğunda elektif boyun tedavisi/diseksiyonu değerlendirilir; iyi lateralize tümörde ipsilateral alan yeterli olabilir.'
              : 'İyi lateralize, düşük riskli oral kavite tümöründe ipsilateral elektif boyun alanı veya uygun cerrahi yaklaşım multidisipliner değerlendirilir.',
          targetVolumes: [
            { name: 'PTV_Primary_Bed', doseGy: oralCavityDose, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer rezeksiyon yatağı ve patolojiye göre yüksek risk alanı' },
            ...(electiveNeckIndicated || selectedN !== 'N0' ? [{ name: 'PTV_Elective_Neck', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: `${bilateralNeck ? 'Bilateral' : 'Lateralize tümörde ipsilateral'} Level I-IV boyun${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` }] : []),
            ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yatağı / SIB', anatomical: `Level V dahil yüksek riskli nodal alan; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
          ],
          oars: [
            { organ: 'Mandibula', metric: 'Plan-specific dose review', limit: 'Minimize dose; assess dental status and osteoradionecrosis risk', source: 'Site- and protocol-specific planning guidance', context: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', contextEn: 'No universal QUANTEC Dmax/V60 threshold; evaluate contour, dental factors, surgery and fractionation.', classification: 'planning-aim' },
            { organ: 'Parotis Bezi (Karşı)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: highRiskAdjuvant ? 'Eşzamanlı Sisplatin (100 mg/m2 3 haftalık veya 40 mg/m2 haftalık) değerlendirilir.' : 'Sisplatin, yalnızca patolojik yüksek risk ölçütleri varsa değerlendirilir.',
          evidence: 'EORTC 22931 (NEJM 2004), RTOG 9501 (NEJM 2004)',
        };
        return {
          statusText: highRiskAdjuvant
            ? 'ENDİKE: ENE / R1 VARLIĞINDA POSTOPERATİF ADJUVAN KEMORADYOTERAPİ'
            : electiveNeckIndicated
              ? 'ENDİKE: TÜMÖR ÇAPI / DOI NEDENİYLE ELEKTİF BOYUN TEDAVİSİ DEĞERLENDİR'
              : 'RİSK UYARLI: CERRAHİ SONRASI PRİMER YATAK RT DEĞERLENDİR',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: oralCrt,
          alternativeSchemes: [oralCrt],
        };
      }

      // Nazofarenks / Orofarenks / Standart SIB
      const hnSib: DoseScheme = {
        id: 'hn-sib-70',
        name: '70 / 60 / 54 Gy - 33 fx (3 Kademeli Standart SIB Kemoradyoterapi)',
        tag: '⚡ Baş-Boyun Standart SIB',
        totalDoseGy: 70,
        fractionCount: 33,
        fractionDoseGy: 2.12,
        alphaBeta: 10,
        technique: 'VMAT / IMRT (Eşzamanlı Entegre Boost)',
        indication: `${hnSubsite === 'larynx' && hnLarynxSubsite === 'Lokal_Ileri_T3_T4' ? 'Lokal ileri supraglottik/glottik' : 'Lokal ileri baş-boyun'} kanserinde definitif kemoradyoterapi. ${hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb ve retrofaringeal lenf nodları (RPN) zorunlu hedef hacimdir.' : bilateralNeck ? 'Bilateral Level II-IV kapsanır; nazofarenkste Level II-Vb ve RPN, oral kavitede Level I-IV uygulanır.' : 'İyi lateralize oral kavite primerinde ipsilateral Level I-III; DOI >5 mm ise Level IV eklenir.'} ${hnENE || selectedN === 'N2' || selectedN === 'N3' ? 'ENE+ veya N2-N3 varlığında Level V dahil edilir ve tutulu nod yatağına 66-70 Gy SIB boost uygulanır.' : ''}`,
        targetVolumes: [
          { name: 'PTV_High (GTV)', doseGy: 70, marginMm: 'High-risk CTV->PTV +3-5 mm', anatomical: 'Primer kitle ve makroskopik tutulu lenf nodları' },
          { name: 'PTV_Mid (Subklinik)', doseGy: 60, marginMm: 'Yüksek risk nodlar', anatomical: 'Primer komşuluğu ve tutulu nod istasyonu' },
          { name: 'PTV_Low (Elektif)', doseGy: 54, marginMm: 'Elective nodal CTV->PTV +5 mm', anatomical: hnSubsite === 'nasopharynx' ? 'Bilateral Level II-Vb + retrofaringeal lenf nodları (RPN)' : `${bilateralNeck ? 'Bilateral' : 'İpsilateral'} Level II-IV${hnENE || selectedN === 'N2' || selectedN === 'N3' ? ' + Level V' : ''}` },
          ...(hnENE || selectedN === 'N2' || selectedN === 'N3' ? [{ name: 'PTV_Nodal_High_Risk_Boost', doseGy: selectedN === 'N3' ? 70 : 66, marginMm: 'Tutulu nod yatağı / SIB', anatomical: `Level V dahil tutulu nod yatağı; ${selectedN === 'N3' ? '70 Gy' : '66 Gy'} SIB boost` }] : []),
        ],
        oars: [
          { organ: 'Parotis Bezi (Kontralateral)', metric: 'Dmean', limit: '< 26 Gy', source: 'QUANTEC (Kserostomi koruması)' },
          { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
        ],
        systemicTherapy: 'Eşzamanlı Sisplatin (100 mg/m2 gün 1, 22, 43 veya 40 mg/m2 haftalık).',
        evidence: 'RTOG 0129, RTOG 0522, GORTEC, NCCN v1.2025 Head and Neck',
      };
      return {
        statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ SIB PROTOKOLÜ (70/60/54 GY)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: hnSib,
        alternativeSchemes: [hnSib],
      };
    }

    // ------------------------------------------
    // 5. SANTRAL SİNİR SİSTEMİ
    // ------------------------------------------
    if (selectedOrgan === 'cns') {
      if (cnsSubtype === 'glioma') {
        const riskCount = Object.values(gliomaRiskFactors).filter(Boolean).length;
        const highRisk = gliomaGrade === 'Grade_3' || gliomaGrade === 'Grade_4' || riskCount >= 2 || gliomaRiskFactors.molecularHighRisk;
        const isGbm = gliomaHistology === 'gbm' || gliomaGrade === 'Grade_4';
        const isOligo = gliomaHistology === 'oligodendroglioma';
        const isAstro = gliomaHistology === 'astrocytoma';
        const dose = isGbm ? 60 : gliomaGrade === 'Grade_3' ? 59.4 : highRisk ? 54 : 50.4;
        const fractions = isGbm ? 30 : gliomaGrade === 'Grade_3' ? 33 : highRisk ? 30 : 28;
        const glioma: DoseScheme = {
          id: isGbm ? 'glioma-stupp-60' : isOligo ? 'glioma-oligo-pcv' : highRisk ? 'glioma-high-risk-57' : 'glioma-low-risk-504',
          name: isGbm
            ? '60 Gy / 30 fx + TMZ (Stupp)'
            : isOligo
              ? '54-59.4 Gy / 30-33 fx + PCV (RTOG 9402 Oligodendrogliom)'
              : gliomaGrade === 'Grade_3'
                ? '59.4-60 Gy / 30-33 fx + TMZ/PCV'
                : highRisk
                  ? '54 Gy / 30 fx + TMZ/PCV'
                  : '45-54 Gy / 25-30 fx veya İzlem',
          tag: isGbm ? 'WHO Grade 4 / GBM (IDH-wildtype)' : isOligo ? 'Oligodendrogliom (1p/19q ko-del)' : isAstro ? 'Astrositom (IDH-mutant)' : highRisk ? 'Yüksek Riskli Gliom' : 'Düşük Riskli Gliom',
          totalDoseGy: dose,
          fractionCount: fractions,
          fractionDoseGy: dose / fractions,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; cerrahi kavite + T2/FLAIR CTV',
          indication: isGbm
            ? 'Maksimal güvenli rezeksiyon sonrası eşzamanlı ve adjuvan TMZ ile Stupp protokolü.'
            : isOligo
              ? '1p/19q ko-delesyonlu oligodendrogliomda RT sonrası adjuvan PCV, RTOG 9402 uzun dönem sağkalım avantajı göstermiştir; TMZ alternatifi daha zayıftır.'
              : isAstro
                ? 'IDH-mutant astrositomda CDKN2A/B delesyonu ve grade; düşük riskli Grade 2 olguda izlem veya fokal RT, yüksek riskte RT + TMZ değerlendirilir.'
                : highRisk
                  ? `Pignatti/RTOG 9802 risk kriterleri: ${riskCount} kriter; PCV veya TMZ ile eskalasyon.`
                  : 'Grade 1-2 düşük riskli gliomda izlem veya fokal RT multidisipliner değerlendirilir.',
          targetVolumes: [{ name: 'GTV/CTV/PTV', doseGy: dose, marginMm: 'GTV + 1.5-2 cm CTV; PTV + 3-5 mm', anatomical: 'Cerrahi kavite, rezidü tümör ve T2/FLAIR anormalliği' }],
          oars: [{ organ: 'Optik kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }, { organ: 'Beyin sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' }],
          systemicTherapy: isGbm
            ? 'Eşzamanlı TMZ 75 mg/m² ve 6 kür adjuvan TMZ.'
            : isOligo
              ? 'RT sonrası adjuvan PCV (Prokarbazin, Lomustin, Vinkristin) - RTOG 9402 / EORTC 26951.'
              : isAstro
                ? 'IDH-mutant astrositomda yüksek risk özelliklerinde adjuvan TMZ; Grade 2 düşük riskte izlem seçeneği.'
                : highRisk
                  ? 'PCV veya TMZ; moleküler sınıflamaya göre nöro-onkoloji kararı.'
                  : undefined,
          evidence: 'NCCN CNS; RTOG 9802; RTOG 9402; EORTC 26951; EORTC 22033; Stupp',
        };
        return { statusText: highRisk ? 'YÜKSEK RİSKLİ GLİOM: ESKALASYON PROTOKOLÜ' : 'DÜŞÜK RİSKLİ GLİOM: İZLEM / FOKAL RT', badgeClass: highRisk ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: glioma, alternativeSchemes: [glioma] };
      }
      if (cnsSubtype === 'gbm') {
        const isElderly = gbmPerformance === 'Duskun_Yasli';
        const stupp: DoseScheme = {
          id: isElderly ? 'gbm-elderly-40' : 'gbm-stupp-60',
          name: isElderly ? '40.05 Gy / 15 fx + Eşzamanlı TMZ (Perry Rejimi)' : '60 Gy / 30 fx + Eşzamanlı ve Adjuvan TMZ (Stupp Protokolü)',
          tag: isElderly ? '👴 Yaşlı/Düşkün Hipofraksiyonasyon' : '⚡ Stupp Altın Standart',
          totalDoseGy: isElderly ? 40.05 : 60,
          fractionCount: isElderly ? 15 : 30,
          fractionDoseGy: isElderly ? 2.67 : 2.0,
          alphaBeta: 10,
          technique: '3D-CRT / VMAT + Günlük Temozolomid',
          indication: isElderly
            ? '≥65-70 yaş veya ECOG ≥2 olgularda 3 haftalık hipofraksiyone KRT: Yaşam kalitesini korur ve genel sağkalımı uzatır (Perry et al. NEJM 2017).'
            : 'Maksimal güvenli cerrahi sonrası Glioblastom altın standardı. Radyoterapi ile eşzamanlı günlük TMZ (75 mg/m2), ardından 6 kür adjuvan TMZ (150-200 mg/m2).',
          targetVolumes: [
            { name: 'GTV', doseGy: isElderly ? 40.05 : 60, marginMm: '0 mm', anatomical: 'T1 kontrastlı rezidü ve cerrahi kavite' },
            { name: 'CTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'GTV + 15-20 mm', anatomical: 'Anatomik bariyerlere saygılı mikroskobik pay' },
            { name: 'PTV', doseGy: isElderly ? 40.05 : 60, marginMm: 'CTV + 3-5 mm', anatomical: 'Set-up güvenlik zarfı' },
          ],
          oars: [
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Göz Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı günlük Temozolomid (75 mg/m2) ardından 6 kür Adjuvan TMZ.',
          evidence: 'Stupp et al. (NEJM 2005), Perry et al. (NEJM 2017), NCCN v1.2025 CNS',
        };
        return {
          statusText: isElderly
            ? 'ENDİKE: YAŞLI/DÜŞKÜN HASTADA HİPOFRAKSİYONE KRT (PERRY REJİMİ)'
            : 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ + TMZ (STUPP PROTOKOLÜ)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: stupp,
          alternativeSchemes: [stupp],
        };
      }

      if (cnsSubtype === 'meningioma') {
        const isGrade1 = meningiomaGrade === 'Grade_1';
        const isSubtotalGrade1 = isGrade1 && (cnsResection === 'STR' || cnsResection === 'Biyopsi' || meningiomaSimpson === 'IV-V');
        const diameter = parseFloat(cnsMaxDiameter) || 0;
        const useSrs = isSubtotalGrade1 && diameter > 0 && diameter <= 3;
        const meningiomaDose = isGrade1 ? useSrs ? 14 : 54 : 60;
        const menScheme: DoseScheme = {
          id: useSrs ? 'mening-grade1-srs-14' : isGrade1 ? 'mening-54' : 'mening-60',
          name: useSrs ? '12-14 Gy / 1 fx (WHO Grade 1 STR, uygun küçük hedefte SRS)' : isGrade1 ? '54 Gy / 30 fx (WHO Grade 1 Menenjiyom)' : '60 Gy / 30 fx (Grade 2/3 Adjuvan RT)',
          tag: isGrade1 ? useSrs ? 'Grade 1 STR - SRS' : 'Grade 1 Konformal RT' : 'Grade 2/3 - RTOG 0539',
          totalDoseGy: meningiomaDose,
          fractionCount: useSrs ? 1 : isGrade1 ? 30 : 30,
          fractionDoseGy: useSrs ? meningiomaDose : isGrade1 ? 1.8 : 2.0,
          alphaBeta: 3.5,
          technique: useSrs ? 'Stereotaktik radyocerrahi; kritik organ dozları uygunsa' : 'IMRT / VMAT',
          indication: isGrade1
            ? isSubtotalGrade1
              ? 'WHO Grade 1 subtotal rezeksiyon / Simpson IV-V sonrası küçük ve uygun rezidüde SRS 12-14 Gy; büyük veya kritik organ komşuluğunda fraksiyone RT değerlendirilir.'
              : 'WHO Grade 1 tam rezeksiyon sonrası izlem; rezidü, semptom, hacim ve kritik organ ilişkisine göre 54 Gy fraksiyone RT düşünülebilir.'
            : 'WHO Grade 2/3 menenjiyomda rezeksiyon derecesi ve patolojiye göre adjuvan fraksiyone RT (Grade 2/3 için yaklaşık 60 Gy) değerlendirilir.',
          targetVolumes: [
            { name: 'GTV', doseGy: meningiomaDose, marginMm: '0 mm', anatomical: 'Kontrast tutan dural kuyruk ve rezidüel kitle' },
            ...(!useSrs ? [{ name: 'CTV', doseGy: meningiomaDose, marginMm: 'GTV + 5-10 mm dural kuyruk', anatomical: 'Dural yaprak boyunca infiltrasyon' }] : []),
          ],
          oars: [
            { organ: 'Optik Sinir / Kiazma', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 54 Gy', source: 'QUANTEC' },
          ],
          evidence: 'RTOG 0539, EORTC 22042-26042, NCCN CNS Guidelines',
        };
        return {
          statusText: 'ENDİKE: MENENJİYOM FRAKSİYONE RT VEYA SRS PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: menScheme,
          alternativeSchemes: [menScheme],
        };
      }

      // Beyin Metastazı
      if (cnsMidlineShift === '>=5mm') {
        const emer: DoseScheme = {
          id: 'cns-emer',
          name: 'Acil Dekompresyon + Deksametazon Protokolü',
          tag: '🚨 ACİL DURUM',
          totalDoseGy: 0,
          fractionCount: 0,
          fractionDoseGy: 0,
          alphaBeta: 10,
          technique: 'Medikal Acil Girişim',
          indication: 'Orta hat şifti ≥5 mm herniasyon riskini gösterir. ACİL IV Deksametazon başlanmalı, Nöroşirürji ile acil cerrahi dekompresyon tartışılmalıdır.',
          targetVolumes: [],
          oars: [],
          evidence: 'NCCN CNS Emergency Guidelines',
        };
        return {
          statusText: '🚨 ACİL UYARI: ORTA HAT ŞİFTİ ≥5 MM (HERNİASYON RİSKİ)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse',
          primaryScheme: emer,
          alternativeSchemes: [emer],
        };
      }

      const metCount = parseInt(cnsMetCount) || 1;
      const diam = parseFloat(cnsMaxDiameter) || 1.8;
      if (metCount <= 4 && diam <= 3.5) {
        const isPostoperativeCavity = cnsResection === 'GTR' || cnsResection === 'STR';
        const srsDose = isPostoperativeCavity ? (diam <= 2 ? 18 : 15) : diam <= 2.0 ? 24 : diam <= 3.0 ? 18 : 15;
        const srs: DoseScheme = {
          id: isPostoperativeCavity ? 'cns-cavity-srs' : 'cns-srs',
          name: `${srsDose} Gy / 1 fx (${isPostoperativeCavity ? 'Cerrahi Kavite SRS' : 'Tek Fraksiyon SRS'})`,
          tag: isPostoperativeCavity ? 'Postoperatif Kavite SRS' : 'Tek Fx SRS',
          totalDoseGy: srsDose,
          fractionCount: 1,
          fractionDoseGy: srsDose,
          alphaBeta: 10,
          technique: 'Stereotaktik Radyocerrahi (SRS - Gamma Knife / CyberKnife / VMAT)',
          indication: `${isPostoperativeCavity ? '1-4 odak için rezeksiyon sonrası cerrahi kaviteye SRS; ' : '1-4 odakta tek başına SRS; '}hasta performansı (KPS ${cnsKps}) ve sistemik hastalık kontrolüyle birlikte değerlendirilir. ${cnsSymptoms === 'Semptomatik' ? 'Semptomatik kitle etkisi için steroid ve cerrahi değerlendirmesi de gerekir.' : 'Asemptomatik durumda yakın nörolojik ve görüntüleme izlemi gerekir.'}`,
          targetVolumes: [
            { name: 'GTV_Met', doseGy: srsDose, marginMm: '0 mm', anatomical: 'MR T1 kontrast tutan lezyon' },
            { name: 'PTV_SRS', doseGy: srsDose, marginMm: '1-2 mm', anatomical: 'Sub-milimetrik set-up zarfı' },
          ],
          oars: [
            { organ: 'Beyin Sapı', metric: 'Dmax', limit: '< 12 Gy', source: 'HyTEC' },
            { organ: 'Optik Kiazma', metric: 'Dmax', limit: '< 8-10 Gy', source: 'HyTEC' },
          ],
          evidence: 'NCCN v1.2025 Kategori 1, Yamamoto et al. (Lancet Oncol)',
        };
        return {
          statusText: 'ENDİKE: KÜRATİF STEREOTAKTİK RADYOCERRAHİ (SRS / SRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: srs,
          alternativeSchemes: [srs],
        };
      } else {
        const wbrt: DoseScheme = {
          id: 'cns-wbrt-30',
          name: '30 Gy / 10 fx + HA & Memantin (Tüm Beyin RT)',
          tag: '🧠 WBRT + HA Standart',
          totalDoseGy: 30,
          fractionCount: 10,
          fractionDoseGy: 3,
          alphaBeta: 10,
          technique: 'Hipokampus Koruyucu VMAT (HA-WBRT) + Memantin',
          indication: '>4 metastaz veya yaygın leptomeningeal tutulum. Bellek fonksiyonlarını korumak için hipokampus Dmax <16 Gy tutulmalıdır.',
          targetVolumes: [
            { name: 'Whole Brain PTV', doseGy: 30, marginMm: 'Kafatası', anatomical: 'Bilateral beyin hemisferleri (Hipokampus alanı hariç)' },
          ],
          oars: [
            { organ: 'Hipokampus Dmax', metric: 'Dmax', limit: '< 16 Gy (D100% < 9 Gy)', source: 'NRG CC001' },
            { organ: 'Göz Lensleri', metric: 'Dmax', limit: '< 7 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'RT ile eşzamanlı ve 6 ay boyunca Memantin (20 mg/gün).',
          evidence: 'NRG Oncology CC001 (JCO 2020), RTOG 0933',
        };
        return {
          statusText: 'ENDİKE: HİPOKAMPUS KORUYUCU WBRT + MEMANTİN',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: wbrt,
          alternativeSchemes: [wbrt],
        };
      }
    }

    // ------------------------------------------
    // 6. PROSTAT VE GÜS
    // ------------------------------------------
    if (selectedOrgan === 'prostate') {
      if (gusSubtype === 'bladder') {
        const isSuitableForTmt = bladderTmtSuitable && bladderTurbtComplete && selectedN === 'N0' && selectedM === 'M0';
        const tmt: DoseScheme = {
          id: 'bladder-tmt-648',
          name: '45 Gy Pelvis + Tümör Yatağı Boost ile 64.8 Gy',
          tag: 'Mesane Koruyucu Trimodal Tedavi',
          totalDoseGy: 64.8,
          fractionCount: 36,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Maksimal TURBT sonrası görüntü kılavuzlu IMRT / VMAT',
          indication: isSuitableForTmt
            ? 'Seçilmiş cT2-T4a N0 M0 kas-invaziv mesane kanserinde maksimal TURBT sonrası eşzamanlı kemoradyoterapi; sistoskopik yanıt değerlendirmesi ve kurtarma sistektomisi planı gerektirir.'
            : 'TMT için uygunluk, N0M0 durum ve maksimal TURBT yapılabilirliği açısından doğrulanmalıdır; mevcut seçimler uygunluk koşullarını karşılamıyor.',
          targetVolumes: [
            { name: 'Pelvik nodal CTV', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Pelvik lenfatikler ve mesane çevresi' },
            { name: 'Mesane / tümör yatağı', doseGy: 64.8, marginMm: 'Mesane duvarı ve yatak', anatomical: 'Görüntüleme ve TURBT bulgularına göre boost' },
          ],
          oars: [
            { organ: 'Rektum', metric: 'V50Gy', limit: 'Planlama protokolüyle sınırlandır', source: 'QUANTEC / IGRT' },
            { organ: 'Pelvic bowel', metric: 'Protocol- and contour-specific DVH', limit: 'Minimize dose; follow the selected bladder-preservation protocol', source: 'BC2001 / site-specific protocol', context: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', contextEn: 'Do not interpret as a QUANTEC V45 threshold for individual bowel loops.', classification: 'context-note' },
          ],
          systemicTherapy: 'Eşzamanlı Sisplatin veya 5-FU / Mitomisin-C; maksimal TURBT ve yakın sistoskopik izlem.',
          evidence: 'NCCN Bladder Cancer v1.2025; BC2001; RTOG trimodal therapy protocols',
        };
        return {
          statusText: isSuitableForTmt ? 'ENDİKE: UYGUN HASTADA MESANE KORUYUCU TRİMODAL TEDAVİ' : 'UYARI: MESANE KORUYUCU TMT UYGUNLUĞUNU DOĞRULAYIN',
          badgeClass: isSuitableForTmt ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
          primaryScheme: tmt,
          alternativeSchemes: [tmt],
        };
      }

      if (gusSubtype === 'testis') {
        if (testisHistology === 'nonseminoma') {
          const nonSeminoma: DoseScheme = {
            id: 'testis-nonseminoma-no-rt',
            name: 'Radyoterapi Önerilmez (Kemoterapi / RPLND / İzlem)',
            tag: '⚠️ Non-Seminom',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: 'Radyoterapi endike değil',
            indication: 'Non-seminom germ hücreli tümörlerde adjuvan radyoterapi önerilmez; evreye göre aktif izlem, BEP kemoterapi veya RPLND standart yaklaşımdır. Radyoduyarlılık seminoma göre belirgin düşüktür.',
            targetVolumes: [],
            oars: [],
            systemicTherapy: 'Evre ve risk durumuna göre BEP kemoterapi veya RPLND; multidisipliner üro-onkoloji konseyi kararı.',
            evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: NON-SEMİNOMDA RT ÖNERİLMEZ (KEMOTERAPİ / RPLND / İZLEM)',
            badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
            primaryScheme: nonSeminoma,
            alternativeSchemes: [nonSeminoma],
          };
        }
        const testisStage = selectedT === 'I' ? 'I' : selectedT === 'IIB' ? 'IIB' : 'IIA';
        const isStageI = testisStage === 'I';
        const stageIIDoseGy = testisStage === 'IIB' ? 36 : 30;
        const stageIIFractions = testisStage === 'IIB' ? 18 : 15;
        const testisRt: DoseScheme = {
          id: isStageI ? 'seminoma-stage-i-20' : `seminoma-stage-${testisStage.toLowerCase()}-${stageIIDoseGy}`,
          name: isStageI ? '20 Gy / 10 fx (Adjuvan Paraaortik RT)' : `${stageIIDoseGy} Gy / ${stageIIFractions} fx (Paraaortik + İpsilateral İliak RT)`,
          tag: isStageI ? 'Evre I Seminom' : `Evre ${testisStage} Seminom`,
          totalDoseGy: isStageI ? 20 : stageIIDoseGy,
          fractionCount: isStageI ? 10 : stageIIFractions,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; böbrek ve karşı testis dozunu en aza indir',
          indication: isStageI
            ? 'Evre I seminomda aktif izlem sıklıkla tercih edilir; RT, bilgilendirilmiş seçilmiş hastalarda adjuvan seçenek olarak değerlendirilir.'
            : 'Evre IIA/B seminomda paraaortik ve ipsilateral iliak lenfatiklere RT, evre ve nodal hacme göre bireyselleştirilir.',
          targetVolumes: [{ name: 'Paraaortik ± ipsilateral iliak', doseGy: isStageI ? 20 : stageIIDoseGy, marginMm: 'Anatomik nodal alan', anatomical: isStageI ? 'Paraaortik lenfatikler' : 'Paraaortik ve ipsilateral iliak lenfatikler' }],
          oars: [
            { organ: 'Karşı testis', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'NCCN / ESTRO' },
            { organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC' },
          ],
          evidence: 'NCCN Testicular Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: isStageI ? 'SEÇENEK: EVRE I SEMİNOMDA AKTİF İZLEM VEYA SEÇİLMİŞ HASTADA ADJUVAN RT' : 'ENDİKE: EVRE II SEMİNOMDA EVREYE GÖRE NODAL RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: testisRt,
          alternativeSchemes: [testisRt],
        };
      }

      if (gusSubtype === 'penile') {
        const organPreservation = (selectedT === 'T1' || selectedT === 'T2') && selectedN === 'N0';
        const penileRt: DoseScheme = {
          id: organPreservation ? 'penile-organ-preservation-60' : 'penile-nodal-66',
          name: organPreservation ? '60-66 Gy (Organ Koruyucu Brakiterapi / EBRT)' : '60-66 Gy Primer + İnguinal / Pelvik Nodal RT',
          tag: organPreservation ? 'Organ Koruyucu Yaklaşım' : 'Lokal İleri / Nodal Pozitif',
          totalDoseGy: 60,
          fractionCount: 30,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'Seçilmiş olguda interstisyel brakiterapi veya IMRT / VMAT',
          indication: organPreservation
            ? 'Seçilmiş T1-T2 penis kanserinde organ koruma amacıyla brakiterapi veya EBRT multidisipliner değerlendirmeyle düşünülebilir.'
            : 'T3-T4 primer veya N+ hastalıkta primer yatağa ve klinik risk durumuna göre inguinal / pelvik lenfatiklere RT değerlendirilir.',
          targetVolumes: [{ name: 'Primer yatak', doseGy: 60, marginMm: 'Anatomik', anatomical: organPreservation ? 'Primer penis lezyonu' : 'Primer yatak ve klinik olarak endike inguinal / pelvik nodlar' }],
          oars: [{ organ: 'Üretra / cilt', metric: 'Dmean', limit: 'Organ koruma ve toksisite hedefleriyle optimize et', source: 'ESTRO / NCCN' }],
          evidence: 'NCCN Penile Cancer v1.2025; EAU Guidelines',
        };
        return {
          statusText: organPreservation ? 'SEÇENEK: ERKEN EVREDE ORGAN KORUYUCU TEDAVİ DEĞERLENDİR' : 'ENDİKE: LOKAL İLERİ / NODAL RİSKTE MULTİDİSİPLİNER RT DEĞERLENDİRMESİ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: penileRt,
          alternativeSchemes: [penileRt],
        };
      }

      if (gusSubtype === 'kidney') {
        const primaryRcc = renalDiseaseSetting === 'primary-inoperable';
        const renalDiameterCm = Number.parseFloat(renalTumorSizeCm);
        const sizeBasedFractionation = !Number.isFinite(renalDiameterCm) || renalDiameterCm <= 0
          ? 'ineligible'
          : renalDiameterCm <= 4
            ? 'single'
            : renalDiameterCm <= 10
              ? 'three'
              : 'ineligible';
        if (primaryRcc && sizeBasedFractionation === 'ineligible') {
          const notApplicable: DoseScheme = {
            id: 'rcc-primary-outside-fastrack-size',
            name: lang === 'tr' ? 'FASTRACK II uygunluğu için primer böbrek tümörü ≤10 cm olmalı; evre ve protokolü gözden geçirin' : 'FASTRACK II eligibility requires a renal primary ≤10 cm; review stage and local protocol',
            tag: lang === 'tr' ? 'SABR uygunluk değerlendirmesi' : 'SABR eligibility review',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 10,
            technique: lang === 'tr' ? 'Multidisipliner değerlendirme' : 'Multidisciplinary assessment',
            indication: lang === 'tr'
              ? 'FASTRACK II için tümör çapı ≤10 cm olmalıdır. Çapı ve renal ven/perirenal yayılımı doğrulayın; uygunluk, performans durumu ve güncel renal SBRT protokolü multidisipliner değerlendirilmelidir.'
              : 'FASTRACK II requires a tumour diameter ≤10 cm. Verify diameter and renal vein/perirenal extension; eligibility, fitness and the current renal SBRT protocol require multidisciplinary review.',
            targetVolumes: [],
            oars: [],
            evidence: 'FASTRACK II (Lancet Oncol 2024), DOI: 10.1016/S1470-2045(24)00020-2; eviQ protocol 4381',
          };
          return { statusText: lang === 'tr' ? 'DEĞERLENDİRİN: RCC EVRESİ FASTRACK II BASİT T1 DOZ SEÇİMİ DIŞINDA' : 'REVIEW: SELECTED RCC EXTENT OUTSIDE SIMPLE T1 FASTRACK II DOSE SELECTION', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: notApplicable, alternativeSchemes: [notApplicable] };
        }
        const doseGy = primaryRcc ? sizeBasedFractionation === 'single' ? 26 : 42 : 35;
        const fractions = primaryRcc ? sizeBasedFractionation === 'single' ? 1 : 3 : 5;
        const scheme: DoseScheme = {
          id: primaryRcc ? sizeBasedFractionation === 'single' ? 'rcc-primary-26-1' : 'rcc-primary-42-3' : 'rcc-oligometastatic-35-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primer renal SABR' : 'renal oligometastatik / oligoprogresif SBRT'})`
            : `${doseGy} Gy / ${fractions} fx (${primaryRcc ? 'primary renal SABR' : 'renal oligometastatic / oligoprogressive SBRT'})`,
          tag: primaryRcc ? 'FASTRACK II · SABR' : lang === 'tr' ? 'Oligometastatik SBRT' : 'Oligometastatic SBRT',
          totalDoseGy: doseGy,
          fractionCount: fractions,
          fractionDoseGy: doseGy / fractions,
          alphaBeta: 10,
          technique: lang === 'tr' ? 'Solunum hareketi yönetimi ve görüntü kılavuzlu SABR; OAR yakınlığına göre uyarlayın' : 'Image-guided SABR with respiratory motion management; adapt to OAR proximity',
          indication: primaryRcc
            ? lang === 'tr'
              ? `Biyopsiyle doğrulanmış, medikal olarak inoperabl veya cerrahi riski yüksek primer RCC (${renalDiameterCm <= 4 ? '≤4 cm' : '>4–10 cm'}). FASTRACK II, ≤4 cm tümörlerde 26 Gy × 1 ve >4–10 cm tümörlerde 42 Gy / 3 fx kullandı. Seçilen çapı (${renalDiameterCm} cm), eGFR'yi ve uygunluğu doğrulayın.`
              : `Biopsy-confirmed, medically inoperable or high-surgical-risk primary RCC (${renalDiameterCm <= 4 ? '≤4 cm' : '>4–10 cm'}). FASTRACK II delivered 26 Gy x1 for tumours ≤4 cm and 42 Gy in 3 fx for tumours >4–10 cm. Verify the selected diameter (${renalDiameterCm} cm), eGFR and eligibility.`
            : lang === 'tr'
              ? 'Konsey değerlendirmesi sonrası seçilmiş oligometastatik hastalık veya immünoterapi altında oligoprogresyon için örnek 35 Gy / 5 fx. Primer RCC’de FASTRACK II şeması değildir.'
              : 'Example 35 Gy / 5 fx for selected oligometastatic disease or oligoprogression during immunotherapy after MDT review. Not a primary RCC FASTRACK II regimen.',
          targetVolumes: [{ name: 'GTV_Renal', doseGy, marginMm: lang === 'tr' ? 'Güncel protokole göre hareket ve set-up marjini' : 'Motion and setup margin per current protocol', anatomical: lang === 'tr' ? 'Primer renal lezyon veya seçilmiş oligometastatik hedef' : 'Renal primary or selected oligometastatic target' }],
          oars: [],
          evidence: primaryRcc
            ? 'FASTRACK II, Siva et al. Lancet Oncol 2024; DOI: 10.1016/S1470-2045(24)00020-2; eviQ renal SABR protocol 4381'
            : 'Current disease-site SBRT protocol and multidisciplinary review; do not extrapolate FASTRACK II primary RCC limits',
        };
        return {
          statusText: primaryRcc
            ? lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ MEDİKAL İNOPERABL PRİMER RCC’DE SABR' : 'OPTION: SABR FOR SELECTED MEDICALLY INOPERABLE PRIMARY RCC'
            : lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ RCC OLİGOMETASTAZI / OLİGOPROGRESYONUNDA SBRT' : 'OPTION: SBRT FOR SELECTED RCC OLIGOMETASTASIS / OLIGOPROGRESSION',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: scheme,
          alternativeSchemes: primaryRcc && sizeBasedFractionation === 'single'
            ? [scheme, { ...scheme, id: 'rcc-primary-42-3', name: lang === 'tr' ? '42 Gy / 3 fx (FASTRACK II; tümör >4–10 cm)' : '42 Gy / 3 fx (FASTRACK II; tumour >4–10 cm)', totalDoseGy: 42, fractionCount: 3, fractionDoseGy: 14 }]
            : [scheme],
        };
      }

      const pG = parseInt(gleasonPrimary) || 3;
      const sG = parseInt(gleasonSecondary) || 4;
      const score = pG + sG;
      const psa = parseFloat(psaLevel) || 8.5;
      const positiveCores = parseFloat(positiveCorePercent) || 0;
      const isNodePositive = selectedN === 'N1';
      const intermediateFactors = Number(selectedT === 'T2b' || selectedT === 'T2c') + Number(score === 7) + Number(psa >= 10 && psa <= 20);
      const isVeryHighRisk = hasSVI || selectedT === 'T3b' || selectedT === 'T4' || pG === 5;
      const isHighRisk = !isVeryHighRisk && (score >= 8 || psa > 20 || selectedT === 'T3a' || selectedT === 'T3b' || hasECE);
      const isIntermediateRisk = !isHighRisk && !isVeryHighRisk && intermediateFactors > 0;
      const isUnfavorableIntermediate = isIntermediateRisk && (pG >= 4 || positiveCores >= 50 || intermediateFactors > 1);
      const prostateRiskGroup = isNodePositive
        ? 'N1'
        : isVeryHighRisk
          ? 'Çok Yüksek'
          : isHighRisk
            ? 'Yüksek'
            : isIntermediateRisk
              ? isUnfavorableIntermediate ? 'Orta-Unfavorable' : 'Orta-Favorable'
              : 'Düşük';

      if (isNodePositive) {
        const pelvicStampede: DoseScheme = {
          id: 'pros-stampede',
          name: '78 Gy Prostat + 46-50 Gy Pelvik LN + 2-3 Yıl ADT',
          tag: '⚡ STAMPEDE Standardı',
          totalDoseGy: 78,
          fractionCount: 39,
          fractionDoseGy: 2,
          alphaBeta: 1.5,
          technique: 'IMRT / VMAT (Elektif Pelvik Lenf Nodu Işınlaması Dahil)',
          indication: 'Çok Yüksek Riskli veya N1 Prostat Ca: Prostat ve seminal veziküllerle birlikte pelvik lenfatik drenaj alanlarının ışınlanması ve 24-36 ay uzun dönem ADT genel sağkalımı belirgin uzatır.',
          targetVolumes: [
            { name: 'PTV_Prostat_High', doseGy: 78, marginMm: '5-7 mm', anatomical: 'Prostat bezi ve seminal vezikül tabanı' },
            { name: 'PTV_Pelvik_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Bilateral obturator, eksternal iliak, internal iliak nod zinciri' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'QUANTEC' },
            { organ: 'Rektum V50', metric: 'V50Gy', limit: '< 35%', source: 'STAMPEDE' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'QUANTEC' },
          ],
          systemicTherapy: '24-36 ay LHRH agonisti/antagonisti + N1 ise Abirateron eklenmesi önerilir.',
          evidence: 'STAMPEDE Trial, POP-RT Trial, RTOG 0521',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK / N1 PROSTAT PELVİK RT + UZUN ADT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pelvicStampede,
          alternativeSchemes: [pelvicStampede],
        };
      }

      if (isVeryHighRisk || isHighRisk) {
        const highPros: DoseScheme = {
          id: 'pros-high-78',
          name: '78 Gy / 39 fx veya 60 Gy / 20 fx + 18-36 Ay ADT',
          tag: `${prostateRiskGroup} Risk`,
          totalDoseGy: 78,
          fractionCount: 39,
          fractionDoseGy: 2,
          alphaBeta: 1.5,
          technique: 'IGRT VMAT',
          indication: `${prostateRiskGroup} riskli lokalize prostat kanserinde doz eskalasyonu ve uzun dönem hormonoterapi multidisipliner olarak değerlendirilir.`,
          targetVolumes: [
            { name: 'PTV_Prostate_SV', doseGy: 78, marginMm: '5 mm', anatomical: 'Prostat ve seminal veziküller' },
            { name: 'PTV_Pelvic_LN', doseGy: 46, marginMm: '7 mm', anatomical: 'Risk temelli elektif pelvik lenfatik alanlar' },
          ],
          oars: [
            { organ: 'Rektum V70', metric: 'V70Gy', limit: '< 15%', source: 'RTOG 0415' },
            { organ: 'Mesane V70', metric: 'V70Gy', limit: '< 25%', source: 'RTOG 0415' },
          ],
          systemicTherapy: '18-36 ay androjen deprivasyon tedavisi (ADT); elektif pelvik nodal RT (46-50 Gy) risk ve nodal değerlendirmeyle planlanır.',
          evidence: 'DART01/05, EORTC 22961',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK PROSTAT ESKALE RT + 2 YIL ADT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: highPros,
          alternativeSchemes: [highPros],
        };
      }

      const isLowRisk = !isIntermediateRisk;
      const lowRiskSurveillance: DoseScheme = {
        id: 'pros-active-surveillance',
        name: 'Aktif İzlem (RT ertelenebilir)',
        tag: 'Düşük Risk Seçeneği',
        totalDoseGy: 0,
        fractionCount: 0,
        fractionDoseGy: 0,
        alphaBeta: 1.5,
        technique: 'PSA, MR ve protokol dahilinde tekrar biyopsi ile yakın izlem',
        indication: 'Düşük riskli hastalıkta uygun hastalar için aktif izlem; tedavi tercihi ortak karar ile belirlenir.',
        targetVolumes: [],
        oars: [],
        evidence: 'NCCN Prostate Cancer v1.2025; AUA/ASTRO Guideline',
      };
      const intPros: DoseScheme = {
        id: 'pros-mod-60',
        name: '60 Gy / 20 fx (Ilımlı Hipofraksiyonasyon CHHiP)',
        tag: '⚡ CHHiP Standart',
        totalDoseGy: 60,
        fractionCount: 20,
        fractionDoseGy: 3,
        alphaBeta: 1.5,
        technique: 'IGRT VMAT',
        indication: 'Orta riskli prostat kanserinde 20 fraksiyonluk rejim 39 fraksiyona non-inferiordur (Kategori 1 standart).',
        targetVolumes: [{ name: 'PTV_Prostate', doseGy: 60, marginMm: '5 mm', anatomical: 'Prostat bezi ve seminal vezikül proksimal 1 cm' }],
        oars: [{ organ: 'Rektum V57', metric: 'V57Gy', limit: '< 15%', source: 'CHHiP' }],
        systemicTherapy: isUnfavorableIntermediate ? 'Orta-unfavorable riskte 4-6 ay kısa dönem ADT; pelvik RT risk temelli değerlendirilir.' : 'Orta-favorable riskte ADT çoğunlukla önerilmez.',
        evidence: 'CHHiP Phase III (Lancet Oncol 2016), PROFIT Trial',
      };
      const sbrtPros: DoseScheme = {
        id: 'pros-sbrt-36',
        name: '36.25 Gy / 5 fx (Ultra-Hipofraksiyonasyon PACE-B)',
        tag: '🎯 SBRT PACE-B',
        totalDoseGy: 36.25,
        fractionCount: 5,
        fractionDoseGy: 7.25,
        alphaBeta: 1.5,
        technique: 'SBRT (Fidüsyel / MR Kılavuzluğunda)',
        indication: 'Düşük ve uygun orta risk olgularda 5 fraksiyonda küratif tedavi.',
        targetVolumes: [
          { name: 'GTV_Prostate', doseGy: 36.25, marginMm: '0 mm', anatomical: 'Prostat bezi; varsa dominant intraprostatik lezyon (DIL) / nodül boostu' },
          { name: 'CTV_Prostate', doseGy: 36.25, marginMm: 'Anatomik', anatomical: 'Prostat ± seminal veziküller, risk uyarlamalı' },
          { name: 'PTV_Prostate', doseGy: 36.25, marginMm: 'CTV->PTV +4-5 mm; posterior +3 mm with SpaceOAR', anatomical: 'Günlük IGRT ve prostat hareket güvenlik marjini' },
        ],
        oars: [{ organ: 'Rektum V36Gy', metric: 'V36Gy', limit: '< 1 cc', source: 'PACE-B' }],
        evidence: 'PACE-B Trial (NEJM 2024)',
      };
      return {
        statusText: isLowRisk
          ? 'DÜŞÜK RİSK: AKTİF İZLEM VEYA HASTA TERCİHİNE GÖRE KÜRATİF RT'
          : `${prostateRiskGroup.toUpperCase()}: ${isUnfavorableIntermediate ? 'KISA DÖNEM ADT DEĞERLENDİR' : 'ADT GENELLİKLE GEREKMEZ'}`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: intPros,
        alternativeSchemes: isLowRisk ? [intPros, sbrtPros, lowRiskSurveillance] : [intPros, sbrtPros],
      };
    }

    // ------------------------------------------
    // 7. MEME
    // ------------------------------------------
    if (selectedOrgan === 'breast') {
      if (breastHistology === 'Duktal Karsinoma In Situ (DCIS)') {
        const dcisWbi: DoseScheme = {
          id: 'br-dcis-wbi-26',
          name: '26 Gy / 5 fx (DCIS Tüm Meme RT) ± Tümör Yatağı Boost',
          tag: 'DCIS - Aksiller RT / Kemoterapi Yok',
          totalDoseGy: 26,
          fractionCount: 5,
          fractionDoseGy: 5.2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT; sol taraflı olguda kalp koruması',
          indication: 'MKC sonrası DCIS için tüm meme ışınlaması lokal nüksü azaltır; boost, yaş, derece, marjin ve nüks riskine göre değerlendirilir. Aksiller RT ve sistemik kemoterapi önerilmez.',
          targetVolumes: [
            { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altı 5 mm', anatomical: 'Tüm meme; nodal alanlar rutin olarak dahil edilmez' },
            ...(breastBoost ? [{ name: 'Tumor bed boost', doseGy: 10, marginMm: 'Kavite + cerrahi klips', anatomical: 'Uygun risk özelliklerinde 10-16 Gy ek boost' }] : []),
          ],
          oars: [
            { organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC / FAST-Forward' },
            { organ: 'İpsilateral akciğer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
          ],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO Whole Breast Irradiation Guideline',
        };
        return {
          statusText: 'ENDİKE: MKC SONRASI DCIS TÜM MEME RT; NODAL RT VE KEMOTERAPİ YOK',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: dcisWbi,
          alternativeSchemes: [
            dcisWbi,
            {
              ...dcisWbi,
              id: 'br-dcis-wbi-40-15',
              name: '40.05 Gy / 15 fx (DCIS Tüm Meme RT, START-B) ± Boost',
              totalDoseGy: 40.05,
              fractionCount: 15,
              fractionDoseGy: 2.67,
              targetVolumes: dcisWbi.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'Tumor bed boost' ? volume.doseGy : 40.05 })),
            },
          ],
        };
      }

      if (breastHistology === 'Malign Filloides Tümörü') {
        const marginCm = parseFloat(phyllodesMarginCm) || 0;
        const observe = marginCm >= 1 && !phyllodesHighGrade;
        const phyllodes: DoseScheme = {
          id: observe ? 'phyllodes-observation' : 'phyllodes-adjuvant-56',
          name: observe ? 'RT Gerekmez - Cerrahi Sonrası İzlem' : '50-60 Gy / 25-30 fx (Adjuvan Yatak RT)',
          tag: observe ? '≥1 cm Marjin - İzlem' : 'Yakın/Pozitif Marjin veya Yüksek Derece',
          totalDoseGy: observe ? 0 : 56,
          fractionCount: observe ? 0 : 28,
          fractionDoseGy: observe ? 0 : 2,
          alphaBeta: 4,
          technique: observe ? 'Klinik ve radyolojik izlem' : 'Meme yatağına IMRT / VMAT',
          indication: observe
            ? 'Cerrahi marjin ≥1 cm ve yüksek dereceli stromal özellik yoksa izlem tercih edilir.'
            : 'Marjin <1 cm veya yüksek dereceli stromal aşırı büyümede lokal nüks riskini azaltmak için adjuvan meme yatağı RT değerlendirilir; elektif aksiller nodal RT uygulanmaz.',
          targetVolumes: observe ? [] : [{ name: 'CTV_TumorBed', doseGy: 56, marginMm: 'Cerrahi yatak ve klipsler', anatomical: 'Meme yatağı; elektif aksilla dahil edilmez' }],
          oars: observe ? [] : [{ organ: 'Kalp (sol taraf)', metric: 'Dmean', limit: 'Mümkün olan en düşük doz', source: 'QUANTEC' }, { organ: 'İpsilateral akciğer', metric: 'V20Gy', limit: '< 15%', source: 'QUANTEC' }],
          evidence: 'NCCN Breast Cancer v1.2025; ASTRO soft tissue sarcoma guidance',
        };
        return {
          statusText: observe ? 'RT GEREKMEZ: MARJİN ≥1 CM VE YÜKSEK DERECELİ ÖZELLİK YOK - İZLEM' : 'DEĞERLENDİR: YAKIN/POZİTİF MARJİN VEYA YÜKSEK DERECELİ FİLLOİDES',
          badgeClass: observe ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: phyllodes,
          alternativeSchemes: [phyllodes],
        };
      }

      const isMastectomy = breastSurgery === 'Mastektomi';
      const isNodePositive = selectedN === 'N1' || selectedN === 'N2' || selectedN === 'N3';
      const isHighNodal = selectedN === 'N2' || selectedN === 'N3';
      const isT1 = selectedT.startsWith('T1');
      const isT3T4 = selectedT === 'T3' || selectedT === 'T4';
      const highKi67 = Number.parseFloat(breastKi67) >= 20;
      const gradeThree = breastGrade === '3';
      const elevatedBreastRisk = selectedT === 'T1c' || highKi67 || gradeThree;
      const systemicRiskNote = elevatedBreastRisk
        ? `${selectedT === 'T1c' ? 'Tümör çapı >1 cm (T1c); ' : ''}${highKi67 ? 'Ki-67 ≥20%; ' : ''}${gradeThree ? 'Grade 3; ' : ''}Genomik risk skoruna göre adjuvan KT / anti-HER2 endikasyonu tartışılsın.`
        : '';
      const boostRiskNote = elevatedBreastRisk
        ? 'Tümör yatağı boost (10-16 Gy) endikasyonu klinik risk ve yaş ile tartışılsın.'
        : '';

      if (breastHistology === 'Dermatofibrosarkoma Protuberans (DFSP)') {
       const dfsp: DoseScheme = {
         id: 'dfsp-adjuvant-50-60',
         name: '50-60 Gy / 25-30 fx (Adjuvan DFSP RT)',
         tag: 'DFSP - Yakın/Pozitif Marjin',
         totalDoseGy: 56,
         fractionCount: 28,
         fractionDoseGy: 2,
         alphaBeta: 4,
         technique: 'Elektron veya foton RT; geniş mikroskopik marjin',
         indication: 'Geniş lokal eksizyon (2-3 cm) veya Mohs sonrası pozitif/yakın cerrahi sınırda, re-eksizyon mümkün değilse adjuvan RT.',
         targetVolumes: [{ name: 'CTV_DFSP', doseGy: 56, marginMm: '3-5 cm mikroskopik marjin', anatomical: 'Primer yatak ve cerrahi skar' }],
         oars: [],
         evidence: 'Soft tissue sarcoma / DFSP multidisciplinary guidance',
       };
       return { statusText: 'DEĞERLENDİR: DFSP YAKIN/PozİTİF MARJİNDE ADJUVAN RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: dfsp, alternativeSchemes: [dfsp] };
      }

      if (breastHistology === 'İnflamatuar Meme Kanseri (IBC)') {
        const inflammatory: DoseScheme = {
          id: 'br-inflammatory-pmrt-50',
          name: 'Neoadjuvan Sistemik Tedavi + Modifiye Radikal Mastektomi Sonrası Kapsamlı Lokoregiyonal RT (50 Gy / 25 fx ± 10 Gy Scar Boost)',
          tag: 'Lokal İleri Yüksek Risk (Evre IIIB/C)',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: 'IMRT / VMAT + DIBH',
          indication: 'Neoadjuvan sistemik tedavi ve modifiye radikal mastektomi sonrası göğüs duvarı, supraklavikuler, internal mammary ve aksiller seviye III alanlarına kapsamlı lokoregiyonal RT; uygun seçilmiş olguda 10 Gy scar boost.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Mastektomi göğüs duvarı ve cilt altı yüzey' },
            { name: 'CTV_RNI', doseGy: 50, marginMm: 'Anatomik', anatomical: 'Aksilla Level I-IV + supraklavikuler + internal mammary chain' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy hedef', source: 'NCCN / EMBRACE prensipleri' },
            { organ: 'İpsilateral akciğer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Neoadjuvan kemoterapi / anti-HER2 tedavi sonrası cerrahi ve PMRT.',
          evidence: 'NCCN Breast Cancer v1.2025; AJCC 8th edition T4d',
        };
        return {
          statusText: 'ENDİKE: İNFLAMATUAR MEME KARSİNOMU T4d - NEOADJUVAN KT + MASTEKTOMİ + PMRT',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
          primaryScheme: inflammatory,
          alternativeSchemes: [inflammatory],
        };
      }

      if (isMastectomy) {
        if (!isNodePositive && !isT3T4 && (isT1 || selectedT === 'T2') && selectedN === 'N0' && breastMargin === 'Negatif') {
          const noRt: DoseScheme = {
            id: 'br-no-pmrt',
            name: 'PMRT Önerilmez (İzlem)',
            tag: '👁️ Yalnızca İzlem',
            totalDoseGy: 0,
            fractionCount: 0,
            fractionDoseGy: 0,
            alphaBeta: 4,
            technique: 'Rutin Onkolojik Takip',
            indication: 'T1-T2 N0 mastektomi ve negatif cerrahi sınır varlığında PMRT endikasyonu yoktur.',
            targetVolumes: [],
            oars: [],
            evidence: 'EBCTCG Meta-analysis, NCCN v1.2025',
          };
          return {
            statusText: 'ENDİKE DEĞİLDİR: T1-T2 N0 MASTEKTOMİDE PMRT GEREKMEZ',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            primaryScheme: noRt,
            alternativeSchemes: [noRt],
          };
        }
        const pmrt: DoseScheme = {
          id: 'br-pmrt-50',
          name: '50 Gy / 25 fx veya 40 Gy / 15 fx (Postmastektomi RT - PMRT)',
          tag: '🛡️ PMRT Standart',
          totalDoseGy: 50,
          fractionCount: 25,
          fractionDoseGy: 2,
          alphaBeta: 4,
          technique: '3D-CRT / VMAT (Derin İnspirasyon Nefes Tutma - DIBH Zorunlu)',
          indication: 'T3-T4 tümörler veya ≥4 lenf nodu pozitifliğinde lokoregiyonal nüksü %70 azaltır ve genel sağkalımı artırır.',
          targetVolumes: [
            { name: 'CTV_ChestWall', doseGy: 50, marginMm: 'Cilt altı 5 mm', anatomical: 'Mastektomi skarı ve pektorali kası yüzeyi' },
            { name: 'CTV_Supraclav', doseGy: 46, marginMm: 'Anatomik', anatomical: 'Supraklavikuler fossa ve aksilla apeksi (Level III)' },
          ],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 2.5 Gy', source: 'NCCN Sarcoma/Breast' },
            { organ: 'İpsilateral Akciğer', metric: 'V20Gy', limit: '< 30%', source: 'QUANTEC' },
          ],
          systemicTherapy: `Sistemik tedavi patoloji ve biyobelirteçlerle belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
          evidence: 'EBCTCG PMRT Meta-Analysis (Lancet), SUPREMO Trial',
        };
        return {
          statusText: 'ENDİKE: POSTMASTEKTOMİ GÖĞÜS DUVARI + LENFATİK RT (PMRT)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: pmrt,
          alternativeSchemes: [
            pmrt,
            {
              ...pmrt,
              id: 'br-pmrt-40-15',
              name: '40.05 Gy / 15 fx (Hipofraksiyone PMRT, START-B)',
              totalDoseGy: 40.05,
              fractionCount: 15,
              fractionDoseGy: 2.67,
              targetVolumes: pmrt.targetVolumes.map(volume => ({ ...volume, doseGy: 40.05 })),
            },
          ],
        };
      }

      // Meme Koruyucu Cerrahi (MKC)
      const hasNodalDisease = isNodePositive || isHighNodal;
      const fastForward: DoseScheme = {
        id: 'br-fast-26',
        name: '26 Gy / 5 fx (FAST-Forward Ultra-Hipofraksiyonasyon)',
        tag: '⚡ FAST-Forward Standart',
        totalDoseGy: 26,
        fractionCount: 5,
        fractionDoseGy: 5.2,
        alphaBeta: 4,
        technique: '3D-CRT / VMAT (DIBH Sol Kalp Koruması)',
        indication: `Tüm meme ışınlaması; ${isNodePositive ? 'Nodal pozitiflikte bölgesel nodal ışınlama (RNI) ayrıca değerlendirilir.' : 'nodal risk durumuna göre RNI eklenmez.'} Menopoz: ${breastMenopause}. ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}. ${systemicRiskNote} ${boostRiskNote} 40 Gy / 15 fx eşdeğer standart seçenektir.`,
        targetVolumes: [
          { name: 'CTV_WholeBreast', doseGy: 26, marginMm: 'Cilt altı 5 mm', anatomical: 'Tüm meme parankimi' },
          ...(hasNodalDisease ? [{ name: 'CTV_RNI', doseGy: 40, marginMm: 'Risk uyarlanmış', anatomical: 'Nodal durum ve klinik risk doğrultusunda bölgesel nodlar' }] : []),
          ...(breastBoost ? [{ name: 'TumorBedBoost', doseGy: 10, marginMm: 'Kavite ve klipsler', anatomical: `Uygun hastada 10-16 Gy ek boost${boostRiskNote ? `; ${boostRiskNote}` : ''}` }] : []),
        ],
        oars: [
          { organ: 'Kalp (Sol)', metric: 'Dmean', limit: '< 1.5 Gy', source: 'FAST-Forward' },
          { organ: 'İpsilateral Akciğer', metric: 'V8Gy', limit: '< 15%', source: 'FAST-Forward' },
        ],
        systemicTherapy: `Adjuvan sistemik tedavi multidisipliner kararla belirlenir: ER ${breastER ? 'pozitif' : 'negatif'}, PR ${breastPR ? 'pozitif' : 'negatif'}, HER2 ${breastHER2 ? 'pozitif' : 'negatif'}, Ki-67 ${breastKi67}%, Grade ${breastGrade}; menopoz durumu ${breastMenopause}. ${systemicRiskNote}`,
        evidence: 'FAST-Forward Faz III (Lancet 2020), ASTRO 2023 Guidelines',
      };
      return {
        statusText: 'ENDİKE: ADJUVAN TÜM MEME RT (FAST-FORWARD 26 GY / 5 FX)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: fastForward,
        alternativeSchemes: [
          fastForward,
          {
            ...fastForward,
            id: 'br-wbi-40-15',
            name: '40.05 Gy / 15 fx (Hipofraksiyone Tüm Meme RT, START-B) + Gereğinde 10-16 Gy Boost',
            totalDoseGy: 40.05,
            fractionCount: 15,
            fractionDoseGy: 2.67,
            targetVolumes: fastForward.targetVolumes.map(volume => ({ ...volume, doseGy: volume.name === 'TumorBedBoost' ? 10 : 40.05 })),
          },
        ],
      };
    }

    // ------------------------------------------
    // 8. GİS (REKTUM, MİDE, KARACİĞER, ÖZOFAGUS, PANKREAS, ANAL)
    // ------------------------------------------
    if (selectedOrgan === 'gis') {
      if (gisOrgan === 'Rektum') {
        const rapido: DoseScheme = {
          id: 'gis-rapido-25',
          name: '25 Gy / 5 fx (5x5 Gy RAPIDO Kısa Dönem RT + KT)',
          tag: '⚡ RAPIDO TNT Standardı',
          totalDoseGy: 25,
          fractionCount: 5,
          fractionDoseGy: 5,
          alphaBeta: 10,
          technique: 'VMAT (Dolu Mesane Protokolü)',
          indication: 'Lokal İleri Rektum Ca (cT3-T4, CRM+, N2): Kısa dönem RT ardından konsolidasyon kemoterapisi (CAPOX/FOLFOX) organ koruma ve metastaz kontrolünü maksimize eder.',
          targetVolumes: [
            { name: 'CTV_Pelvis', doseGy: 25, marginMm: 'Anatomik', anatomical: 'Rektal tümör, mezorektum, presakral ve internal iliak lenf nodları' },
          ],
          oars: [
            { organ: 'Small bowel', metric: 'Fractionation-specific bowel DVH', limit: 'Use the applicable RAPIDO/site protocol; conventional QUANTEC limits are not transferable', source: 'RAPIDO protocol (verify current version)', context: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', contextEn: 'Short-course RT 25 Gy / 5 fx; not the conventional-fractionation setting for QUANTEC V15/V45 references.', classification: 'context-note' },
            { organ: 'Femur Başları', metric: 'Dmax', limit: '< 25 Gy', source: 'QUANTEC' },
            { organ: 'Mesane', metric: 'V20Gy', limit: '< 40%', source: 'RAPIDO' },
          ],
          systemicTherapy: 'RT sonrası cerrahi öncesi 18 hafta CAPOX veya FOLFOX4 kemoterapisi.',
          evidence: 'RAPIDO Faz III (Lancet Oncol 2021 & 2023), PRODIGE 23',
        };
        const standardKrt: DoseScheme = {
          id: 'gis-rectum-long-50',
          name: '50.4 Gy / 28 fx + Eşzamanlı Kapesitabin (Uzun Dönem KRT)',
          tag: '🎯 Klasik Kemoradyoterapi',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT',
          indication: 'Lokal ileri rektum kanserinde sfinkter koruma ve lokal kontrol için uzun dönem eşzamanlı KRT.',
          targetVolumes: [{ name: 'CTV_Pelvis', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Mezorektum ve pelvik lenfatik istasyonlar' }],
          oars: [],
          systemicTherapy: 'Eşzamanlı oral Kapesitabin (825 mg/m2 günde iki kez).',
          evidence: 'German Rectal Cancer Study (CAO/ARO/AIO-94)',
        };
        const crmPositive = gisCrmStatus === 'Pozitif';
        const rapidoCrm: DoseScheme = crmPositive
          ? { ...rapido, indication: `${rapido.indication} MR-CRM pozitifliği (≤1 mm) lokal nüks ve uzak metastaz riskini artırır; TNT yaklaşımı ve yeterli mezorektal excision kritik önemdedir.` }
          : rapido;
        return {
          statusText: crmPositive ? 'ENDİKE: CRM+ LOKAL İLERİ REKTUM - TNT (RAPIDO / PRODIGE 23) ÖNCELİKLİ' : 'ENDİKE: NEOADJUVAN TNT / RAPIDO KISA DÖNEM RT PROTOKOLÜ',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          primaryScheme: rapidoCrm,
          alternativeSchemes: [rapidoCrm, standardKrt],
        };
      }

      if (gisOrgan === 'Mide') {
        const gastricCrt: DoseScheme = {
          id: 'gis-gastric-45',
          name: '45 Gy / 25 fx + Eşzamanlı 5-FU/Kapesitabin (Adjuvan KRT)',
          tag: '⚡ INT-0116 / ARTIST',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT (Böbrek ve Karaciğer Korumalı)',
          indication: 'Rezeke edilmiş evre pT3-T4 veya N+ M0 mide adenokarsinomunda yetersiz lenf nodu diseksiyonu (<D2 rezeksiyon) veya D2 sonrası lenf nodu pozitif olgularda lokorejyonel nüksü önler ve sağkalımı uzatır.',
          targetVolumes: [
            { name: 'CTV_Stomach_Bed', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Gastric bed, surgical anastomosis, and perigastric draining nodal stations' },
            { name: 'CTV_Nodal_Basins', doseGy: 45, marginMm: 'Anatomik', anatomical: 'Celiac axis, suprapancreatic, porta hepatis, and para-aortic nodes as clinically indicated' },
          ],
          oars: [
            { organ: 'Bilateral Böbrek', metric: 'Mean', limit: '< 15-18 Gy (en az 2/3 tek böbrek < 12 Gy)', source: 'QUANTEC' },
            { organ: 'Karaciğer', metric: 'Mean', limit: '< 30 Gy (en az 700 cc < 15 Gy)', source: 'QUANTEC' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
            { organ: 'Kalp', metric: 'Mean', limit: '< 20-30 Gy', source: 'QUANTEC' },
            { organ: 'İnce Bağırsak / Duodenum', metric: 'Dmax / V45', limit: 'Dmax < 50 Gy, V45Gy < 100 cc', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı ve takip eden Kapesitabin veya 5-FU/Leukovorin.',
          evidence: 'INT-0116 / SWOG 9008 (Macdonald NEJM 2001, Smalley JCO 2012), ARTIST & ARTIST-2 (Lee JCO 2012, Park JCO 2021), CRITICS (Lancet Oncol 2018), TOPGEAR (NEJM 2024), NCCN Gastric Cancer v1.2025 (GAST-C)',
        };
        return {
          statusText: 'ENDİKE: ADJUVAN KEMORADYOTERAPİ (INT-0116 / ARTIST STANDARDI)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: gastricCrt,
          alternativeSchemes: [gastricCrt],
        };
      }

      if (gisOrgan === 'Karaciger' && liverHistology) {
        const isHcc = liverHistology === 'hcc';
        const doseGy = isHcc ? 45 : 50;
        const stageText = `BCLC ${liverBclcStage}`;
        const liverSbrt: DoseScheme = {
          id: isHcc ? 'gis-liver-hcc-sbrt-45-5' : 'gis-liver-crlm-sbrt-50-5',
          name: lang === 'tr'
            ? `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'kolorektal karaciğer metastazı'} SBRT)`
            : `${doseGy} Gy / 5 fx (${isHcc ? 'HCC' : 'colorectal liver metastasis'} SBRT)`,
          tag: isHcc ? 'NRG/RTOG 1112 · HCC' : lang === 'tr' ? 'Karaciğer oligometastazı SBRT' : 'Liver oligometastasis SBRT',
          totalDoseGy: doseGy,
          fractionCount: 5,
          fractionDoseGy: doseGy / 5,
          alphaBeta: 10,
          technique: breathingMotion === 'DIBH'
            ? (lang === 'tr' ? 'Görüntü kılavuzlu DIBH / SGRT' : 'DIBH / SGRT with image guidance')
            : (lang === 'tr' ? 'Günlük görüntü kılavuzlu 4D-CT / ITV tabanlı VMAT SBRT' : '4D-CT / ITV-based VMAT SBRT with daily image guidance'),
          indication: isHcc
            ? lang === 'tr'
              ? `${stageText}${liverBclcStage === 'C' ? ' (makrovasküler invazyon / PVTT olasılığı)' : ''}: multidisipliner değerlendirme sonrası seçilmiş HCC olgusunda SBRT düşünülebilir. Child-Pugh sınıfını, karaciğer rezervini ve alternatifleri doğrulayın; 45 Gy / 5 fx NRG/RTOG 1112 aralığında örnek bir şemadır.`
              : `${stageText}${liverBclcStage === 'C' ? ' with possible macrovascular invasion/PVTT' : ''}: selected HCC SBRT after MDT review. Confirm Child-Pugh class, liver reserve and alternatives; 45 Gy / 5 fx is an example within NRG/RTOG 1112.`
            : lang === 'tr'
              ? 'Rezeksiyon/ablasyon uygunluğu, sistemik hastalık kontrolü ve OAR yakınlığı konseyde değerlendirildikten sonra seçilmiş kolorektal karaciğer oligometastazı için örnek 50 Gy / 5 fx.'
              : 'Example 50 Gy / 5 fx for selected colorectal liver oligometastasis after MDT review of resection/ablation, systemic disease control and OAR proximity.',
          targetVolumes: [
            { name: 'GTV_Liver', doseGy, marginMm: '0 mm', anatomical: lang === 'tr' ? 'Kontrast tutan karaciğer lezyonu' : 'Contrast-enhancing liver lesion' },
            { name: breathingMotion === 'DIBH' ? 'PTV_Liver_DIBH' : 'ITV_4D', doseGy, marginMm: lang === 'tr' ? 'Kurumsal hareket yönetimi / set-up marjini' : 'Motion management / institution-specific setup margin', anatomical: breathingMotion === 'DIBH' ? (lang === 'tr' ? 'Tekrarlanabilir nefes tutma hedefi' : 'Reproducible breath-hold target') : (lang === 'tr' ? '4D-CT solunum hareket zarfı' : 'Respiratory motion envelope on 4D-CT') },
          ],
          oars: [],
          evidence: isHcc
            ? 'NRG/RTOG 1112; Dawson et al. JAMA Oncol 2025; DOI: 10.1001/jamaoncol.2024.5403; ASTRO primary liver cancer guideline'
            : 'eviQ Hepatic Metastases SABR protocol 4026; HyTEC liver metastases analysis',
        };
        return {
          statusText: isHcc
            ? lang === 'tr' ? `SEÇENEK: HCC SBRT · ${stageText} · karaciğer rezervi ve konsey uygunluğunu doğrulayın` : `OPTION: HCC SBRT · ${stageText} · verify hepatic reserve and MDT suitability`
            : lang === 'tr' ? 'SEÇENEK: SEÇİLMİŞ KOLOREKTAL KARACİĞER OLİGOMETASTAZINDA SBRT' : 'OPTION: SBRT FOR SELECTED COLORECTAL LIVER OLIGOMETASTASIS',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: liverSbrt,
          alternativeSchemes: [
            liverSbrt,
            { ...liverSbrt, id: 'gis-liver-sbrt-60-5', name: lang === 'tr' ? '60 Gy / 5 fx (seçilmiş karaciğer met; yalnızca OAR sınırları uygunsa)' : '60 Gy / 5 fx (selected liver metastasis; only if OAR limits permit)', totalDoseGy: 60, fractionDoseGy: 12 },
          ],
        };
      }

      if (gisOrgan === 'SafraYollari') {
        const siteName = {
          intrahepatic: lang === 'tr' ? 'intrahepatik kolanjiyokarsinom' : 'intrahepatic cholangiocarcinoma',
          perihilar: lang === 'tr' ? 'perihiler kolanjiyokarsinom (Klatskin)' : 'perihilar cholangiocarcinoma (Klatskin)',
          extrahepatic: lang === 'tr' ? 'distal / ekstrahepatik kolanjiyokarsinom' : 'distal / extrahepatic cholangiocarcinoma',
          gallbladder: lang === 'tr' ? 'safra kesesi karsinomu' : 'gallbladder carcinoma',
        }[biliaryHistology];
        const highRisk = biliaryMarginStatus === 'R1' || selectedN === 'N1';
        const boostDose = biliaryMarginStatus === 'R1' ? 59.4 : 54;
        const boostFractions = Math.round(boostDose / 1.8);
        const adjuvant: DoseScheme = {
          id: `biliary-adjuvant-${biliaryMarginStatus.toLowerCase()}-${selectedN.toLowerCase()}`,
          name: highRisk
            ? lang === 'tr' ? `Bölgesel nodlara 45 Gy / 25 fx + tümör yatağına ${boostDose} Gy boost`
              : `45 Gy / 25 fx regional nodes + tumour bed boost to ${boostDose} Gy`
            : lang === 'tr' ? 'Mevcut R0/N0 seçiminde otomatik adjuvan RT önerilmez'
              : 'No automatic adjuvant radiotherapy recommendation for current R0/N0 selection',
          tag: 'SWOG S0809 · postoperative high-risk',
          totalDoseGy: highRisk ? boostDose : 0,
          fractionCount: highRisk ? boostFractions : 0,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT with image guidance',
          indication: highRisk
            ? lang === 'tr'
              ? `${siteName}: R1 marjin veya bölgesel N+ hastalık. SWOG S0809 bölgesel nodlara ve tümör yatağına 45 Gy / 25 fx; R0 için 54 Gy, R1 için 59.4 Gy boost kullandı. Kanıt ekstrahepatik kolanjiyokarsinom ve safra kesesi kanserinde daha güçlüdür; intrahepatik olguyu konseyde bireyselleştirin.`
              : `${siteName}: R1 margin or regional N+ disease. SWOG S0809 used 45 Gy / 25 fx to regional nodes and tumour bed with boost to 54 Gy (R0) or 59.4 Gy (R1). Evidence is strongest for extrahepatic cholangiocarcinoma and gallbladder cancer; individualise intrahepatic cases.`
            : lang === 'tr'
              ? `${siteName}: mevcut R0/N0 seçimi SWOG S0809 yüksek risk ölçütlerini karşılamaz. Adjuvan kemoradyoterapi otomatik değildir; patoloji ve sistemik adjuvan tedaviyi konseyde değerlendirin.`
              : `${siteName}: current R0/N0 selections do not meet high-risk SWOG S0809 criteria. Adjuvant chemoradiation is not automatic; review pathology and systemic adjuvant therapy at MDT.`,
          targetVolumes: highRisk ? [
            { name: 'Regional nodal CTV', doseGy: 45, marginMm: lang === 'tr' ? 'Alt bölgeye özgü atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bölgeye göre bölgesel nodal alan' : 'Regional nodal basin for primary site' },
            { name: 'Tumour bed / high-risk margin', doseGy: boostDose, marginMm: lang === 'tr' ? 'Postoperatif anatomi ve klipler' : 'Postoperative anatomy and clips', anatomical: lang === 'tr' ? 'Rezeksiyon yatağı; R1 ise pozitif marjin' : 'Resection bed; positive margin if R1' },
          ] : [],
          oars: [],
          systemicTherapy: highRisk
            ? lang === 'tr'
              ? 'SWOG S0809 sıralaması: gemsitabin/kapesitabin ardından RT ile eşzamanlı kapesitabin; dozları medikal onkolojiyle koordine edin.'
              : 'SWOG S0809 sequence: gemcitabine/capecitabine followed by concurrent capecitabine with RT; coordinate doses with medical oncology.'
            : undefined,
          evidence: 'SWOG S0809, Ben-Josef et al. JCO 2015; DOI: 10.1200/JCO.2014.60.2219; verify current NCCN version',
        };
        if (biliaryTreatmentSetting === 'adjuvant') {
          return {
            statusText: highRisk
              ? lang === 'tr' ? 'SEÇENEK: R1 VEYA N+ BİLİYER KANSERDE ADJUVAN KRT (SWOG S0809)' : 'OPTION: ADJUVANT CRT FOR R1 OR N+ BILIARY CANCER (SWOG S0809)'
              : lang === 'tr' ? 'ADJUVAN KRT OTOMATİK ENDİKE DEĞİL: R1 / N+ RİSKİNİ DOĞRULAYIN' : 'ADJUVANT CRT NOT AUTOMATICALLY INDICATED: CONFIRM R1 / N+ RISK',
            badgeClass: highRisk ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300',
            primaryScheme: adjuvant,
            alternativeSchemes: [adjuvant],
          };
        }
        const sbrt: DoseScheme = {
          ...adjuvant,
          id: 'biliary-unresectable-sbrt-45-5',
          name: lang === 'tr' ? '45 Gy / 5 fx (seçilmiş inoperabl safra yolu olguları)' : '45 Gy / 5 fx (selected unresectable biliary tract cases)',
          tag: lang === 'tr' ? 'SBRT · OAR sınırlı' : 'SBRT · OAR-limited',
          totalDoseGy: 45,
          fractionCount: 5,
          fractionDoseGy: 9,
          technique: lang === 'tr' ? 'Solunum hareketi yönetimli, görüntü kılavuzlu VMAT / SBRT' : 'Image-guided VMAT / SBRT with respiratory motion management',
          indication: lang === 'tr'
            ? `${siteName}: yalnızca konsey değerlendirmesi sonrası ve alt bölgeye özgü mide, bağırsak ve santral safra yolu OAR kısıtları karşılanabiliyorsa düşünün.`
            : `${siteName}: consider after MDT review only when site-specific stomach, bowel and central biliary OAR limits can be met.`,
          targetVolumes: [{ name: 'GTV_Biliary', doseGy: 45, marginMm: lang === 'tr' ? 'Protokole özgü hareket/set-up marjini' : 'Protocol-specific motion/setup margin', anatomical: lang === 'tr' ? 'Makroskopik primer veya nüks; alt bölgeye özgü nodal yaklaşım' : 'Gross primary or recurrence; site-specific nodal policy' }],
          evidence: 'Verify current NCCN Biliary Tract Cancers version; RTOG upper-abdominal atlas; institutional SBRT protocol',
        };
        const conventional: DoseScheme = {
          ...sbrt,
          id: 'biliary-unresectable-conventional-54-30',
          name: lang === 'tr' ? '50.4–54 Gy / 28–30 fx (konvansiyonel fraksiyonlu RT)' : '50.4–54 Gy / 28–30 fx (conventionally fractionated RT)',
          tag: lang === 'tr' ? 'Konvansiyonel RT / KRT' : 'Conventional RT / CRT',
          totalDoseGy: 54,
          fractionCount: 30,
          fractionDoseGy: 1.8,
          technique: lang === 'tr' ? 'Görüntü kılavuzlu IMRT / VMAT' : 'IMRT / VMAT with image guidance',
          targetVolumes: [{ name: 'CTV_Biliary', doseGy: 50.4, marginMm: lang === 'tr' ? 'Alt bölgeye özgü atlas' : 'Site-specific atlas', anatomical: lang === 'tr' ? 'Primer alt bölge ve klinik endikasyonlu bölgesel nodlar' : 'Primary site and clinically indicated regional nodes' }],
          evidence: 'SWOG S0809; verify current NCCN Biliary Tract Cancers version',
        };
        return {
          statusText: lang === 'tr' ? 'SEÇENEK: İNOPERABL BİLİYER HASTALIKTA ANATOMİ VE HASTAYA UYARLANMIŞ RT' : 'OPTION: ANATOMY- AND PATIENT-ADAPTED RT FOR UNRESECTABLE BILIARY DISEASE',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: sbrt,
          alternativeSchemes: [
            sbrt,
            conventional,
            { ...conventional, id: 'biliary-unresectable-conventional-504-28', name: lang === 'tr' ? '50.4 Gy / 28 fx (konvansiyonel fraksiyonlu RT)' : '50.4 Gy / 28 fx (conventionally fractionated RT)', totalDoseGy: 50.4, fractionCount: 28 },
          ],
        };
      }

      if (gisOrgan === 'Ozofagus') {
        const cross: DoseScheme = {
          id: 'gis-esophagus-cross-414',
          name: '41.4 Gy / 23 fx (CROSS Neoadjuvan KRT)',
          tag: 'CROSS Kategori 1',
          totalDoseGy: 41.4,
          fractionCount: 23,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'VMAT / IMRT',
          indication: 'Neoadjuvan CROSS protokolü: eşzamanlı karboplatin/paklitaksel ve ardından cerrahi.',
          targetVolumes: [{ name: 'CTV_Esophagus', doseGy: 41.4, marginMm: 'Anatomik', anatomical: 'Primer özofagus tümörü ve bölgesel lenfatikler' }],
          oars: [
            { organ: 'Kalp', metric: 'Dmean', limit: '< 20 Gy; V30 < 30%', source: 'CROSS / QUANTEC' },
            { organ: 'Akciğer', metric: 'V20Gy', limit: '< 20%', source: 'CROSS / QUANTEC' },
            { organ: 'Spinal kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı karboplatin/paklitaksel.',
          evidence: 'CROSS Trial; NCCN Esophageal Cancer v1.2025',
        };
        const definitive: DoseScheme = { ...cross, id: 'gis-esophagus-definitive-504', name: '50-50.4 Gy / 25-28 fx (Definitif KRT)', totalDoseGy: 50.4, fractionCount: 28, fractionDoseGy: 1.8, tag: 'Definitif Özofagus KRT' };
        return { statusText: 'ENDİKE: ÖZOFAGUS CROSS NEOADJUVAN KRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: cross, alternativeSchemes: [cross, definitive] };
      }

      if (gisOrgan === 'Pankreas') {
        const pancreatic: DoseScheme = {
          id: 'gis-pancreas-504',
          name: '50.4 Gy / 28 fx (Borderline Rezekabl Neoadjuvan KRT)',
          tag: 'NCCN Pankreas',
          totalDoseGy: 50.4,
          fractionCount: 28,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT',
          indication: 'Borderline rezekabl veya seçilmiş lokal ileri pankreas kanserinde eşzamanlı kapesitabin; indüksiyon FOLFIRINOX sonrası SBRT değerlendirilebilir.',
          targetVolumes: [{ name: 'PTV_Pancreas', doseGy: 50.4, marginMm: 'Anatomik', anatomical: 'Primer pankreas tümörü ve ilgili lenfatikler' }],
          oars: [
            { organ: 'Duodenum', metric: 'Dmax', limit: '< 54 Gy (SBRT Dmax < 33 Gy)', source: 'NCCN / QUANTEC' },
            { organ: 'Mide', metric: 'Dmax', limit: '< 50-54 Gy', source: 'NCCN / QUANTEC' },
            { organ: 'Bowel bag / peritoneal cavity', metric: 'V45Gy', limit: '< 195 cc (QUANTEC dose-volume reference)', source: 'QUANTEC small bowel (2010)', context: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', contextEn: 'Applies to the bowel-bag/peritoneal-cavity contour, not individual loops; conventional fractionation.', classification: 'dose-volume-reference' },
            { organ: 'Karaciğer', metric: 'Dmean', limit: '< 30 Gy', source: 'QUANTEC' },
            { organ: 'Böbrekler', metric: 'V18Gy', limit: '< 30% bilateral', source: 'QUANTEC' },
            { organ: 'Spinal Kord', metric: 'Dmax', limit: '< 45 Gy', source: 'QUANTEC' },
          ],
          systemicTherapy: 'Eşzamanlı kapesitabin veya indüksiyon FOLFIRINOX sonrası SBRT.',
          evidence: 'NCCN Pancreatic Adenocarcinoma v1.2025',
        };
        const sbrt: DoseScheme = { ...pancreatic, id: 'gis-pancreas-sbrt-40', name: '33-40 Gy / 5 fx (Pankreas SBRT)', totalDoseGy: 40, fractionCount: 5, fractionDoseGy: 8, technique: 'MR-Linac / SBRT' };
        return { statusText: 'ENDİKE: PANKREAS KRT / SEÇİLMİŞ SBRT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: pancreatic, alternativeSchemes: [pancreatic, sbrt] };
      }

      // Anal / Pankreas / Özofagus
      const generalGis: DoseScheme = {
        id: 'gis-general-50',
        name: '50.4 Gy / 28 fx Kemoradyoterapi',
        tag: '⚡ Definitif GİS KRT',
        totalDoseGy: 50.4,
        fractionCount: 28,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'VMAT',
        indication: 'GİS organı definitif kemoradyoterapi protokolü.',
        targetVolumes: [{ name: 'PTV', doseGy: 50.4, marginMm: '5-7 mm', anatomical: 'Primer kitle ve bölgesel lenfatikler' }],
        oars: [],
        evidence: 'NCCN Gastrointestinal Guidelines',
      };
      return {
        statusText: 'ENDİKE: DEFİNİTİF KEMORADYOTERAPİ',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: generalGis,
        alternativeSchemes: [generalGis],
      };
    }

    // ------------------------------------------
    // 9. CİLT
    // ------------------------------------------
    if (selectedOrgan === 'skin') {
      const isSCC = skinHistology === 'SCC';
      const isBCC = skinHistology === 'BCC';
      const isMelanoma = skinHistology === 'Melanom';
      const isMerkel = skinHistology === 'Merkel';
      const highRiskScc = (parseFloat(skinDepthMm) || 0) > 6 || skinPerineuralInvasion || skinBoneInvasion || skinMargin !== 'Negatif' || selectedN !== 'N0';
      const totalDose = isMelanoma ? skinMargin === 'Negatif' ? 30 : 48 : isMerkel ? 56 : isSCC ? highRiskScc ? 66 : 60 : 50;
      const fractions = isMelanoma ? skinMargin === 'Negatif' ? 5 : 20 : isMerkel ? 28 : isSCC ? highRiskScc ? 33 : 30 : 20;
      const skinScheme: DoseScheme = {
        id: isMelanoma ? 'skin-melanoma-adjuvant' : isMerkel ? 'skin-merkel-adjuvant' : isSCC ? highRiskScc ? 'skin-scc-high-risk' : 'skin-scc-conditional' : 'skin-bcc-50',
        name: isMelanoma ? `${totalDose} Gy / ${fractions} fx (Seçilmiş Melanom Adjuvan RT)` : isMerkel ? '50-56 Gy Primer + 50 Gy Bölgesel Nodal RT' : isSCC ? `${totalDose} Gy / ${fractions} fx (cSCC${highRiskScc ? ' yüksek risk IMRT' : ', RT endikasyonu varsa'})` : '50 Gy / 20 fx (BCC Yüzeyel / Elektron RT)',
        tag: isMelanoma ? 'Melanom - Seçilmiş Endikasyon' : isMerkel ? 'Merkel Hücreli Karsinom' : isSCC ? highRiskScc ? 'Yüksek Risk cSCC' : 'cSCC - RT endikasyonuna bağlı' : 'BCC Konformal RT',
        totalDoseGy: totalDose,
        fractionCount: fractions,
        fractionDoseGy: totalDose / fractions,
        alphaBeta: 10,
        technique: isMelanoma ? 'IMRT / VMAT; nodal hacim endikasyona göre' : isMerkel ? 'IMRT / VMAT; primer yatak ve bölgesel nodal alan' : isSCC ? 'Yüksek riskte IMRT / VMAT' : 'Elektron demeti, yüzeyel RT veya brakiterapi',
        indication: isMelanoma
          ? 'Lokal nüks, R1 cerrahi sınır veya çoklu nodal tutulum gibi seçilmiş durumlarda adjuvan hipofraksiyone RT değerlendirilir.'
          : isMerkel
            ? 'Agresif nöroendokrin biyoloji nedeniyle primer yatak ve elektif bölgesel nodal drenajın tedavisi multidisipliner olarak değerlendirilir.'
            : isSCC
              ? highRiskScc ? 'Derinlik >6 mm, perinöral invazyon, kemik tutulumu, pozitif marjin veya nodal hastalık yüksek risk özelliğidir; adjuvan/definitif IMRT değerlendirilir.' : 'Düşük riskli cSCC için cerrahi/izlem önceliklidir; RT yalnızca klinik endikasyon varsa değerlendirilir.'
              : 'Düşük riskli bazal hücreli karsinomda yüzeyel RT, elektron veya brakiterapi; cerrahiye uygunluk ve kozmetik hedeflerle değerlendirilir.',
        targetVolumes: [
          { name: 'PTV_Primer', doseGy: totalDose, marginMm: 'Klinik marjin ve anatomik bariyerlere göre', anatomical: 'Primer yatak / lezyon' },
          ...(isMerkel ? [{ name: 'CTV_Regional_Nodes', doseGy: 50, marginMm: 'Bölgesel drenaj', anatomical: 'Elektif bölgesel nodal alan; risk uyarlanmış' }] : []),
        ],
        oars: [
          { organ: 'Göz Lensi (Yüz ise)', metric: 'Dmax', limit: '< 5-7 Gy', source: 'QUANTEC' },
          { organ: 'Kemik / Kıkırdak', metric: 'Dmax', limit: '< 60 Gy', source: 'QUANTEC' },
        ],
        evidence: 'NCCN Basal / Squamous Cell Skin Cancer v1.2025; ASTRO Skin Cancer Guidelines; Merkel cell multidisciplinary guidance',
      };
      return {
        statusText: isMelanoma ? 'SEÇİLMİŞ OLGUDA ADJUVAN MELANOM RT DEĞERLENDİR' : isMerkel ? 'ENDİKE: PRİMER YATAK + BÖLGESEL NODAL ALAN DEĞERLENDİR' : isSCC && highRiskScc ? 'YÜKSEK RİSK cSCC: ADJUVAN / DEFİNİTİF IMRT DEĞERLENDİR' : isSCC ? 'DÜŞÜK RİSK cSCC: CERRAHİ / İZLEM; RT YALNIZCA ENDİKASYON VARSA' : isBCC ? 'BCC: CERRAHİ UYGUNLUĞUNA GÖRE YÜZEYEL RT DEĞERLENDİR' : 'ENDİKE: DEFİNİTİF / ADJUVAN KUTANÖZ RT',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: skinScheme,
        alternativeSchemes: [skinScheme],
      };
    }

    // ------------------------------------------
    // 10. HEMATOLOJİK
    // ------------------------------------------
    if (selectedOrgan === 'hematologic') {
      if (hematologicSubtype === 'Plasmacytoma') {
        const plasmacytoma: DoseScheme = {
          id: 'plasmacytoma-45',
          name: '40-50 Gy / 20-25 fx (Soliter Plazmasitom)',
          tag: 'Küratif Lokal RT',
          totalDoseGy: 45,
          fractionCount: 25,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / VMAT; tümör hacmine göre lokal alan',
          indication: 'Kemik veya ekstramedüller soliter plazmasitomda kemik iliği ve sistemik değerlendirme sonrası küratif lokal RT; lokal kontrol oranı yüksektir.',
          targetVolumes: [{ name: 'CTV_Plazmasitom', doseGy: 45, marginMm: 'Görüntüleme ve anatomik bariyerlere göre', anatomical: 'Makroskopik lezyon ve subklinik yayılım alanı' }],
          oars: [{ organ: 'Spinal kord (yakınsa)', metric: 'Dmax', limit: 'QUANTEC sınırları içinde', source: 'QUANTEC' }],
          evidence: 'ILROG Guidelines for Solitary Plasmacytoma; NCCN v1.2025',
        };
        return {
          statusText: 'ENDİKE: SOLİTER PLAZMASİTOMDA KÜRATİF LOKAL RT',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: plasmacytoma,
          alternativeSchemes: [plasmacytoma],
        };
      }

      if (hematologicSubtype === 'Myeloma') {
        const singleFraction = myelomaFractionation === 'TekFx';
        const doseGy = singleFraction ? 8 : myelomaFractionation === '30Gy' ? 30 : 20;
        const fractionCount = singleFraction ? 1 : doseGy === 30 ? 10 : 5;
        const myeloma: DoseScheme = {
          id: singleFraction ? 'myeloma-palliative-8' : `myeloma-palliative-${doseGy}`,
          name: `${doseGy} Gy / ${fractionCount} fx (Palyatif Miyelom RT)`,
          tag: 'Multipl Miyelom - Semptom Kontrolü',
          totalDoseGy: doseGy,
          fractionCount,
          fractionDoseGy: doseGy / fractionCount,
          alphaBeta: 10,
          technique: '3D-CRT / IMRT; omurga instabilitesinde cerrahi görüş',
          indication: 'Ağrılı litik lezyon, epidural hastalık veya patolojik fraktür riski için semptom odaklı palyatif RT; hematoloji ve ortopedi/nöroşirürji ile eşgüdüm gerekir.',
          targetVolumes: [{ name: 'PTV_Symptomatic_Lesion', doseGy, marginMm: 'Görüntüleme ve anatomik sınırlara göre', anatomical: 'Ağrılı litik veya fraktür riski taşıyan lezyon' }],
          oars: [{ organ: 'Spinal kord', metric: 'Dmax', limit: 'Fraksiyonasyona uygun QUANTEC sınırları', source: 'QUANTEC' }],
          evidence: 'ASTRO Bone Metastases Guideline; ILROG Myeloma Guidance',
        };
        return {
          statusText: 'ENDİKE: SEMPTOMATİK MİYELOM LEZYONUNDA PALYATİF RT',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          primaryScheme: myeloma,
          alternativeSchemes: [myeloma],
        };
      }

      if (hematologicSubtype === 'ALL') {
        const allScheme: DoseScheme = {
          id: 'all-tbi-12',
          name: '12 Gy / 6 fx BID (TBI) veya 12-18 Gy Kraniyal Profilaksi',
          tag: 'ALL - KİT Hazırlığı / CNS Profilaksisi',
          totalDoseGy: 12,
          fractionCount: 6,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'Total Body Irradiation veya risk uyarlı kraniyal RT',
          indication: 'ALL tedavisinde hematopoietik kök hücre nakli hazırlığında TBI; CNS riski olan hastada profilaktik kraniyal RT hematoloji protokolüyle koordine edilir.',
          targetVolumes: [{ name: 'CTV_TBI', doseGy: 12, marginMm: 'Tüm vücut', anatomical: 'Total body / kemik iliği' }],
          oars: [{ organ: 'Akciğer', metric: 'Dmean', limit: 'Akciğer bloklama protokolü', source: 'Hematopoietic transplant protocol' }],
          systemicTherapy: 'ALL sistemik tedavisi ve KİT protokolü ile birlikte.',
          evidence: 'EBMT / ALL transplant conditioning guidance',
        };
        return { statusText: 'ENDİKE: ALL KİT HAZIRLIĞINDA TBI / CNS RİSKİNE GÖRE KRANİYAL RT', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300', primaryScheme: allScheme, alternativeSchemes: [allScheme] };
      }

      if (hematologicSubtype === 'CLL') {
        const cllScheme: DoseScheme = {
          id: 'cll-spleen-6',
          name: '4-10 Gy / 0.5-1 Gy fx (Dalak Palyasyonu)',
          tag: 'KLL - Semptomatik Splenomegali',
          totalDoseGy: 6,
          fractionCount: 6,
          fractionDoseGy: 1,
          alphaBeta: 10,
          technique: 'Konformal düşük doz dalak RT',
          indication: 'Semptomatik splenomegali veya lokal nodal KLL progresyonunda düşük doz palyatif RT; hematolojik toksisite için yakın takip.',
          targetVolumes: [{ name: 'CTV_Spleen', doseGy: 6, marginMm: 'Dalak + günlük görüntüleme marjini', anatomical: 'Dalak ve semptomatik nodal hacim' }],
          oars: [{ organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'ILROG' }],
          evidence: 'ILROG low-dose lymphoma guidance',
        };
        return { statusText: 'ENDİKE: KLL SEMPTOMATİK SPLENOMEGALİDE DÜŞÜK DOZ RT', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', primaryScheme: cllScheme, alternativeSchemes: [cllScheme] };
      }

      if (hematologicSubtype === 'Foliküler') {
        const flScheme: DoseScheme = {
          id: 'follicular-isrt-24',
          name: '24 Gy / 12 fx (Tutulu Alan RT - ISRT)',
          tag: '🎯 Foliküler Lenfoma ISRT',
          totalDoseGy: 24,
          fractionCount: 12,
          fractionDoseGy: 2,
          alphaBeta: 10,
          technique: 'IMRT / VMAT (ISRT Prensipleri)',
          indication: 'Erken evre foliküler lenfomada 24 Gy tutulu alan radyoterapisi yüksek lokal kontrol sağlar; ileri evre semptomatik hastalıkta düşük doz (2x2 Gy) palyasyon hematoloji konseyiyle değerlendirilir.',
          targetVolumes: [{ name: 'CTV_ISRT', doseGy: 24, marginMm: 'Pre-KT GTV ile sınırlı', anatomical: 'Tutulu lenf nodu bölgesi' }],
          oars: [{ organ: 'Komşu OAR', metric: 'Dmean', limit: 'ALARA prensibi', source: 'ILROG' }],
          evidence: 'ILROG Guidelines; FORT Trial',
        };
        return { statusText: 'ENDİKE: FOLİKÜLER LENFOMADA 24 GY TUTULU ALAN RT (ISRT)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', primaryScheme: flScheme, alternativeSchemes: [flScheme] };
      }

      const isCR = lymphomaResponse === 'Tam_Yanit';
      const dose = isCR ? 20 : 30;
      const lymphomaScheme: DoseScheme = {
        id: 'lymphoma-isrt',
        name: `${dose} Gy / ${dose / 2} fx (Tutulu Alan Radyoterapisi - ISRT)`,
        tag: isCR ? '✨ Konsolidasyon ISRT' : '🔬 Refrakter / Rezidü ISRT',
        totalDoseGy: dose,
        fractionCount: dose / 2,
        fractionDoseGy: 2.0,
        alphaBeta: 10,
        technique: 'IMRT / VMAT (ISRT Prensipleri)',
        indication: 'Kemoterapi sonrası tutulu alana konsolidasyon RT nüks riskini %50\'den fazla azaltır.',
        targetVolumes: [
          { name: 'CTV_ISRT', doseGy: dose, marginMm: 'Pre-KT GTV ile sınırlı', anatomical: 'Başlangıçta tutulu lenf nodu hacmi' },
        ],
        oars: [
          { organ: 'Kalp', metric: 'Dmean', limit: '< 5 Gy', source: 'ILROG Guidelines' },
          { organ: 'Akciğer V20Gy', metric: 'V20Gy', limit: '< 10%', source: 'ILROG' },
        ],
        systemicTherapy: 'ABVD, brentuximab veya R-CHOP kemoterapisini takiben.',
        evidence: 'ILROG Guidelines, HD16/HD17 Trials (Lancet Oncol)',
      };
      return {
        statusText: 'ENDİKE: KONSOLİDASYON TUTULU ALAN RT (ISRT)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        primaryScheme: lymphomaScheme,
        alternativeSchemes: [lymphomaScheme],
      };
    }

    // ------------------------------------------
    // 11. PEDİATRİK
    // ------------------------------------------
    if (selectedOrgan === 'pediatric') {
      const isHighRisk = pediatricRisk === 'Yuksek';
      if (pediatricSubtype === 'Wilms') {
        const highRiskWilms = selectedT === 'III' || wilmsStage === 'Evre_III_Anaplazi';
        const wholeAbdomen = highRiskWilms && wilmsWholeAbdomen;
        const wilms: DoseScheme = {
          id: wholeAbdomen ? 'wilms-whole-abdomen-105' : highRiskWilms ? 'wilms-flank-108' : 'wilms-observe',
          name: !highRiskWilms ? 'RT Gerekmez - İzlem' : wholeAbdomen ? '10.5 Gy / 7 fx (Tüm Batın RT)' : '10.8 Gy / 6 fx (Flank RT)',
          tag: !highRiskWilms ? 'Erken Evre / Uygun Histoloji' : 'Wilms Tümörü - Risk Uyarlanmış RT',
          totalDoseGy: highRiskWilms ? wholeAbdomen ? 10.5 : 10.8 : 0,
          fractionCount: highRiskWilms ? wholeAbdomen ? 7 : 6 : 0,
          fractionDoseGy: highRiskWilms ? wholeAbdomen ? 1.5 : 1.8 : 0,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / 3D-CRT; böbrek, karaciğer ve büyüme dokularını koru',
          indication: highRiskWilms
            ? 'Evre III veya fokal/diffüz anaplazide protokol ve histolojiye göre flank RT; yaygın peritoneal kontaminasyon/implantlarda tüm batın RT değerlendirilir. Alan ve doz çocuk onkoloji protokolüne göre doğrulanmalıdır.'
            : 'Erken evre ve uygun histolojide RT rutin olarak gerekli olmayabilir; çocuk onkoloji protokolüne göre izlem.',
          targetVolumes: highRiskWilms ? [{ name: wholeAbdomen ? 'CTV_Whole_Abdomen' : 'CTV_Flank', doseGy: wholeAbdomen ? 10.5 : 10.8, marginMm: 'COG / SIOP protokol sınırları', anatomical: wholeAbdomen ? 'Peritoneal yayılım / tüm batın endikasyonu' : 'İpsilateral flank ve tümör yatağı' }] : [],
          oars: [{ organ: 'Kontralateral böbrek', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'COG / PENTEC' }],
          systemicTherapy: 'Çocuk onkoloji protokolü ve evreye göre sistemik tedavi.',
          evidence: 'COG AREN0532 / AREN0533; SIOP-RTSG UMBRELLA',
        };
        return {
          statusText: highRiskWilms ? 'ENDİKE: WILMS TÜMÖRÜNDE EVRE / HİSTOLOJİYE GÖRE PEDİATRİK RT' : 'RİSK UYARLI İZLEM: ERKEN EVRE WILMS TÜMÖRÜNDE RT GEREKMEYEBİLİR',
          badgeClass: highRiskWilms ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primaryScheme: wilms,
          alternativeSchemes: [wilms],
        };
      }

      if (pediatricSubtype === 'Neuroblastom') {
        const neuroblastoma: DoseScheme = {
          id: 'neuroblastoma-primary-216',
          name: '21.6 Gy / 12 fx (Yüksek Risk Primer Yatak RT)',
          tag: 'Nöroblastom - Yüksek Risk',
          totalDoseGy: 21.6,
          fractionCount: 12,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'Pediatrik IMRT / proton; böbrek, karaciğer ve omurilik koruması',
          indication: 'Yüksek risk nöroblastomda primer tümör yatağına konsolidatif RT, indüksiyon ve transplantasyon/immünoterapi protokolüyle koordine edilir.',
          targetVolumes: [{ name: 'CTV_Primary_Bed', doseGy: 21.6, marginMm: 'Başlangıç görüntüleme ve protokol sınırları', anatomical: 'Primer tümör yatağı ve rezidüel hastalık' }],
          oars: [{ organ: 'Böbrekler', metric: 'Dmean', limit: 'Mümkün olduğunca düşük', source: 'COG / PENTEC' }, { organ: 'Spinal kord', metric: 'Dmax', limit: 'Protokol sınırları içinde', source: 'QUANTEC' }],
          systemicTherapy: 'İndüksiyon kemoterapisi, kök hücre nakli ve anti-GD2 tedavisiyle protokol uyumu.',
          evidence: 'COG high-risk neuroblastoma protocols; PENTEC',
        };
        return {
          statusText: 'ENDİKE: YÜKSEK RİSK NÖROBLASTOMDA PRİMER YATAK KONSOLİDASYONU',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: neuroblastoma,
          alternativeSchemes: [neuroblastoma],
        };
      }

      if (pediatricSubtype === 'Ewing') {
        const pediatricEwing: DoseScheme = {
          id: 'pediatric-ewing-558',
          name: '45-55.8 Gy (İndüksiyon KT Sonrası Ewing RT)',
          tag: 'Pediatrik Ewing Sarkomu',
          totalDoseGy: 55.8,
          fractionCount: 31,
          fractionDoseGy: 1.8,
          alphaBeta: 10,
          technique: 'IMRT / proton; başlangıçtaki tümör hacmi ve kemik yatağı dikkate alınır',
          indication: 'Cerrahiye uygun olmayan, rezidüel veya seçilmiş yüksek riskli Ewing sarkomunda indüksiyon kemoterapisi sonrası definitif/adjuvan RT; doz ve hacimler protokole göre bireyselleştirilir.',
          targetVolumes: [{ name: 'CTV_Initial_Disease', doseGy: 45, marginMm: 'Pre-KT başlangıç hacmine göre', anatomical: 'Kemoterapi öncesi kemik ve yumuşak doku hastalığı' }, { name: 'CTV_Boost', doseGy: 55.8, marginMm: 'Rezidüel hacim', anatomical: 'Post-KT rezidüel tümör / yüksek risk alanı' }],
          oars: [{ organ: 'Büyüme plakları', metric: 'Dmean', limit: 'Mümkün olduğunca koru', source: 'PENTEC' }, { organ: 'Komşu eklem', metric: 'V50Gy', limit: 'Hedef hacimle optimize et', source: 'QUANTEC' }],
          systemicTherapy: 'VDC/IE temelli çok ajanlı kemoterapi protokolüyle koordine edilir.',
          evidence: 'COG / Euro-EWING protocols; PENTEC',
        };
        return {
          statusText: 'ENDİKE: PEDİATRİK EWING SARKOMUNDA PROTOKOL UYUMLU LOKAL KONTROL',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          primaryScheme: pediatricEwing,
          alternativeSchemes: [pediatricEwing],
        };
      }

      const csiDose = isHighRisk ? 36 : 23.4;
      const boostDose = 54;
      const pediaScheme: DoseScheme = {
        id: 'pedia-csi',
        name: `CSI ${csiDose} Gy + Boost ${boostDose} Gy (Medulloblastom CSI)`,
        tag: isHighRisk ? '⚡ Yüksek Risk CSI' : '🛡️ Standart Risk CSI',
        totalDoseGy: boostDose,
        fractionCount: 30,
        fractionDoseGy: 1.8,
        alphaBeta: 10,
        technique: 'Proton Beam veya VMAT (Kraniyospinal Eksen Işınlama)',
        indication: 'Medulloblastomda nöroaksiyel yayılımı önlemek için kraniyospinal aks ışınlanır, ardından tümör yatağı 54 Gy\'e tamamlanır.',
        targetVolumes: [
          { name: 'CTV_CSI', doseGy: csiDose, marginMm: 'Tüm nöroaksis', anatomical: 'Tüm beyin, tekal kese ve kauda ekuina sonlanımına kadar' },
          { name: 'PTV_Boost', doseGy: boostDose, marginMm: 'Kavite + 15 mm', anatomical: 'Posterior fossa tümör yatağı' },
        ],
        oars: [
          { organ: 'Koklea', metric: 'Dmean', limit: '< 35 Gy', source: 'PENTEC (İşitme kaybı)' },
          { organ: 'Tiroid / Kalp', metric: 'ALARA', limit: 'Minimal doz', source: 'PENTEC' },
        ],
        systemicTherapy: 'Kemoterapi protokolleri (Cisplatin, Lomustine, Vincristine).',
        evidence: 'SIOP PNET 4, COG A9961',
      };
      return {
        statusText: 'ENDİKE: KRANİYOSPİNAL AKS VE TÜMÖR YATAĞI BOOST (CSI)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        primaryScheme: pediaScheme,
        alternativeSchemes: [pediaScheme],
      };
    }

    const createFocusedPlan = (
      id: string,
      name: string,
      totalDoseGy: number,
      fractionCount: number,
      tag: string,
      anatomy: string,
      indication: string,
      technique = '3D-CRT / IMRT / IGRT',
    ): DoseScheme => ({
      id,
      name,
      tag,
      totalDoseGy,
      fractionCount,
      fractionDoseGy: totalDoseGy / fractionCount,
      alphaBeta: 10,
      technique,
      indication,
      targetVolumes: [
        { name: 'GTV', doseGy: totalDoseGy, marginMm: 'Görüntüleme ve klinik semptomla tanımlanır', anatomical: anatomy },
        { name: 'CTV', doseGy: totalDoseGy, marginMm: 'Anatomik yayılım; elektif nodal hacim rutin değildir', anatomical: `${anatomy} ve gerekli komşu risk alanı` },
        { name: 'PTV', doseGy: totalDoseGy, marginMm: 'Hareket yönetimi ve günlük IGRT ile belirlenir', anatomical: 'Set-up ve organ hareketi güvenlik marjini' },
      ],
      oars: [{ organ: 'Kritik komşu organlar', metric: 'Dmax / Dmean', limit: 'Önceki RT ve güncel protokole göre doğrula', source: 'QUANTEC / kurumsal protokol' }],
      evidence: 'ASTRO / ESTRO; aktif kılavuz sürümü ve kurum protokolü doğrulanmalıdır.',
    });

    if (selectedOrgan === 'emergencies') {
      const emergencyPlans: Record<string, { status: string; primary: DoseScheme; alternatives: DoseScheme[] }> = {
        'emergency-mscc': {
          status: 'ACİL: SPİNAL KORD BASISI (MSCC)',
          primary: createFocusedPlan('mscc-20-5', '20 Gy / 5 fx · MSCC acil RT', 20, 5, 'Deksametazon + cerrahi uygunluk değerlendirmesi', 'MRI ile tanımlanan vertebral metastaz ve epidural hastalık', 'Deksametazon 16 mg IV stat, ardından 4 mg IV/PO 6 saatte bir. Tek seviyeli kompresyon ve uygun performansta Patchell cerrahi/dekompresyon kriterlerini değerlendir.', 'Acil IMRT / 3D-CRT + günlük IGRT'),
          alternatives: [
            createFocusedPlan('mscc-8-1', '8 Gy / 1 fx · kısa prognoz / cerrahiye uygun değil', 8, 1, 'Tek fraksiyon', 'MRI ile tanımlanan semptomatik vertebra ve epidural uzanım', 'Nörolojik durum, instabilite, önceki RT ve cerrahi uygunlukla birlikte seçilir.'),
            createFocusedPlan('mscc-30-10', '30 Gy / 10 fx · seçilmiş uygun prognoz', 30, 10, 'Çoklu fraksiyon', 'MRI ile tanımlanan vertebral metastaz ve epidural hastalık', 'Cerrahi/postoperatif plan, kümülatif kord dozu ve prognoz MDT ile değerlendirilir.'),
          ],
        },
        'emergency-svcs': {
          status: 'ACİL: VENA KAVA SUPERIOR SENDROMU',
          primary: createFocusedPlan('svcs-30-10', '30 Gy / 10 fx · öne yüklemeli torasik RT', 30, 10, 'İlk 2-3 fx: 3-4 Gy/fx, sonra tamamla', 'Vena kava superior obstrüksiyonuna neden olan primer kitle ve semptomatik nodal hastalık', 'İlk 2-3 fraksiyonda 3-4 Gy/fx öne yükleme, ardından toplam 30 Gy / 10 fx tamamlanması örnek bir yaklaşımdır; stabil hastada histoloji ve stent/sistemik tedavi seçenekleri değerlendirilir.'),
          alternatives: [createFocusedPlan('svcs-20-5', '20 Gy / 5 fx · kısa prognozda', 20, 5, 'İlk 2 fx öne yükleme, sonra tamamla', 'Vena kava superior obstrüksiyonuna neden olan makroskopik torasik kitle', 'Histoloji, semptom şiddeti ve klinik yanıtla uyarlanır.')],
        },
        'emergency-airway': {
          status: 'ACİL: TRAKEA / KARİNA HAVAYOLU OBSTRÜKSİYONU',
          primary: createFocusedPlan('airway-17-2', '16-17 Gy / 2 fx · dekompresif RT', 17, 2, 'Stridor / asfiksi riski', 'Trakea, ana bronş veya karinayı daraltan makroskopik tümör', 'Stridor veya asfiksi riski varsa hava yolu güvenliği ve girişimsel bronkoskopi RT’yi geciktirmeden değerlendirilir.'),
          alternatives: [
            createFocusedPlan('airway-8-1', '8 Gy / 1 fx · hızlı kısa şema', 8, 1, 'Tek fraksiyon', 'Hava yolunu daraltan makroskopik tümör', 'Anestezi, göğüs hastalıkları ve girişimsel bronkoskopiyle acil hava yolu yönetimi gerekir.'),
            createFocusedPlan('airway-20-5', '20 Gy / 5 fx · seçilmiş hasta', 20, 5, 'Çoklu fraksiyon', 'Hava yolunu daraltan makroskopik tümör', 'Klinik stabilite ve toleransa göre seçilir.'),
          ],
        },
        'emergency-hemorrhage': {
          status: 'ACİL: MASİF HEMORAJİ / HEMOSTATİK RT',
          primary: createFocusedPlan('hemorrhage-8-1', '8 Gy / 1 fx · hemostatik RT', 8, 1, 'Hızlı hemostaz', 'Hemoptizi, jinekolojik kanama veya hematüri odağındaki makroskopik tümör', 'Resüsitasyon ve kanama odağının endoskopik/girişimsel kontrolü önceliklidir; RT bunları geciktirmemelidir.'),
          alternatives: [createFocusedPlan('hemorrhage-14-8-4', '14.8 Gy / 4 fx BID · en az 6 saat ara', 14.8, 4, 'Quad Shot hemostatik şema', 'Kanayan makroskopik tümör ve gerekli anatomik komşuluk', 'Kanama odağı ve klinik stabiliteye göre seçilir.')],
        },
        'emergency-icp': {
          status: 'ACİL: AKUT KİBAS / BEYİN HERNIASYONU',
          primary: createFocusedPlan('icp-20-5', '20 Gy / 5 fx · acil WBRT', 20, 5, 'Mannitol %20 + deksametazon + stabilizasyon', 'Tüm beyin parankimi; kontrastlı beyin MRI/BT ile metastaz değerlendirmesi', 'Hava yolu/nörolojik stabilizasyon, mannitol %20, deksametazon ve acil nöroşirürji değerlendirmesi RT ile eşzamanlı yürütülür.'),
          alternatives: [createFocusedPlan('icp-30-10', '30 Gy / 10 fx · uygun prognozda WBRT', 30, 10, 'Çoklu fraksiyon', 'Tüm beyin parankimi; lens ve optik yapılar doz optimizasyonuna alınır', 'Cerrahi veya SRS uygunluğu gecikmeden değerlendirilir; prognoz ve sistemik seçeneklere göre seçilir.')],
        },
      };
      const selectedPlan = emergencyPlans[selectedSubsite] ?? emergencyPlans['emergency-mscc'];
      return {
        statusText: selectedPlan.status,
        badgeClass: 'bg-rose-50 text-rose-900 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
        primaryScheme: selectedPlan.primary,
        alternativeSchemes: [selectedPlan.primary, ...selectedPlan.alternatives],
      };
    }

    if (selectedOrgan === 'palliative') {
      const palliativePlans: Record<'Agri' | 'Beyin' | 'Organ', { status: string; primary: DoseScheme; alternatives: DoseScheme[] }> = {
        Agri: {
          status: 'ENDİKE: KEMİK METASTAZI AĞRI PALYASYONU',
          primary: createFocusedPlan('bone-palliation-8-1', '8 Gy / 1 fx · kategori 1 analjezi', 8, 1, 'Kemik metastazı', 'Semptomatik kemik metastazı; görüntüleme ile tanımlanan lezyon', '8 Gy tek fraksiyon etkili ağrı palyasyonu sağlar; yeniden ışınlama ve kırık/instabilite riski ayrıca değerlendirilir.'),
          alternatives: [
            createFocusedPlan('bone-palliation-20-5', '20 Gy / 5 fx · çoklu fraksiyon', 20, 5, 'Alternatif analjezik şema', 'Semptomatik kemik metastazı', 'Prognoz, önceki RT ve hasta tercihiyle seçilir.'),
            createFocusedPlan('bone-palliation-sbrt', 'SBRT · seçilmiş oligo-metastatik hedef', 30, 5, 'SBRT / IGRT', 'Sınırlı sayıda, uygun anatomideki metastatik hedef', 'SBRT; kord basısı, instabilite ve kırık riski dışlandıktan sonra seçilmiş hastada değerlendirilir.', 'SBRT / IGRT'),
          ],
        },
        Beyin: {
          status: 'ELEKTİF: BEYİN METASTAZI · SRS / WBRT',
          primary: createFocusedPlan('brain-ha-wbrt-30-10', '30 Gy / 10 fx · HA-WBRT + memantin', 30, 10, 'Elektif beyin metastazı', 'Tüm beyin; hipokampus koruması uygunsa HA-WBRT planlanır', 'Hipokampus koruması ve memantin bilişsel korunma için değerlendirilir; 1-4 uygun lezyonda SRS tercih ölçütleri multidisipliner doğrulanır.'),
          alternatives: [createFocusedPlan('brain-srs-27-3', '27 Gy / 3 fx · seçilmiş SRS/FSRT', 27, 3, 'SRS / FSRT', 'Sınırlı sayıda ve boyutta beyin metastazı; MRI tabanlı GTV/CTV/PTV', 'Lezyon sayısı, hacmi, yerleşimi, semptomlar ve sistemik tedaviye göre SRS/FSRT uygunluğu değerlendirilir.', 'SRS / IGRT')],
        },
        Organ: {
          status: 'ENDİKE: ORGAN / YUMUŞAK DOKU METASTAZI PALYASYONU',
          primary: createFocusedPlan('soft-tissue-palliation-20-5', '20 Gy / 5 fx · organ / yumuşak doku palliasyonu', 20, 5, 'Semptomatik viseral veya yumuşak doku hedefi', 'Karaciğer kapsül ağrısı, pelvik kitle veya semptomatik yumuşak doku metastazı', 'Semptomatik makroskopik hedef ve gerekli anatomik komşuluk ışınlanır; elektif nodal alan rutin değildir.'),
          alternatives: [createFocusedPlan('soft-tissue-palliation-8-1', '8 Gy / 1 fx · kısa semptomatik şema', 8, 1, 'Kısa prognoz / hızlı palyasyon', 'Semptomatik viseral veya yumuşak doku metastazı', 'Organ toleransı, önceki RT ve kanama/obstrüksiyon riski doğrulanır.')],
        },
      };
      const selectedPlan = palliativePlans[palliativeIntent];
      return {
        statusText: selectedPlan.status,
        badgeClass: 'bg-teal-50 text-teal-900 border-teal-300',
        primaryScheme: selectedPlan.primary,
        alternativeSchemes: [selectedPlan.primary, ...selectedPlan.alternatives],
      };
    }
    const palDose = selectedN === 'TekFx' ? 8 : 20;
    const palFx = palDose === 8 ? 1 : 5;
    const palScheme: DoseScheme = {
      id: `palliative-${palDose}`,
      name: `${palDose} Gy / ${palFx} fx (Palyatif Ağrı / Kitle Kontrolü)`,
      tag: palDose === 8 ? '🎯 8 Gy Tek Fraksiyon (Kategori 1)' : '🛡️ 20 Gy / 5 fx Fraksiyone',
      totalDoseGy: palDose,
      fractionCount: palFx,
      fractionDoseGy: palDose === 8 ? 8 : 4,
      alphaBeta: 10,
      technique: '3D-CRT / Basit Konformal',
      indication: palDose === 8
        ? 'Ağrılı kemik metastazlarında 8 Gy tek fraksiyon, çoklu fraksiyonlarla eşit ağrı palyasyonu sağlar; hasta ve yakınları için en yüksek konforu sunar (Kategori 1).'
        : 'Spinal kord basısı veya uzun sağkalım beklenen oligometastatik olgularda çoklu fraksiyon re-treatment oranını düşürür.',
      targetVolumes: [{ name: 'GTV_Palliative', doseGy: palDose, marginMm: '0 mm', anatomical: 'Metastatik lezyon' }],
      oars: [{ organ: 'Spinal Kord', metric: 'Dmax', limit: palDose === 8 ? '< 8 Gy' : '< 18 Gy', source: 'QUANTEC' }],
      evidence: 'ASTRO Bone Metastases Guidelines, Chow et al. Meta-analysis',
    };
    return {
      statusText: 'ENDİKE: HIZLI VE ETKİN PALYATİF RADYOTERAPİ',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      primaryScheme: palScheme,
      alternativeSchemes: [palScheme],
    };

  return { statusText: 'No regimen matched', badgeClass: 'bg-slate-500', primaryScheme: null as any, alternativeSchemes: [] };
}


export function evaluateClinicalDecision(state: any): EvaluatedDecision {
  const decision = _evaluateClinicalDecisionInternal(state);
  if (!decision || !decision.primaryScheme) return decision;

  const resolvedSubsite = state.selectedSubsite ||
    (state.selectedOrgan === 'thorax' ? state.thoraxSubtype :
     state.selectedOrgan === 'gis' ? state.gisOrgan :
     state.selectedOrgan === 'cns' ? state.cnsSubtype :
     state.selectedOrgan === 'gynecology' ? state.gynSite :
     state.selectedOrgan === 'prostate' ? state.gusSubtype : '');

  const meta = getGuidelineMetadata(state.selectedOrgan, resolvedSubsite);
  decision.guidelineVersion = decision.guidelineVersion || meta.guidelineVersion;
  decision.lastVerifiedDate = decision.lastVerifiedDate || meta.lastVerifiedDate;
  decision.evidenceLevel = decision.evidenceLevel || meta.evidenceLevel;
  decision.nccnDeepLink = decision.nccnDeepLink || meta.nccnDeepLink;

  if (decision.primaryScheme) {
    decision.primaryScheme.guidelineVersion = decision.primaryScheme.guidelineVersion || meta.guidelineVersion;
    decision.primaryScheme.lastVerifiedDate = decision.primaryScheme.lastVerifiedDate || meta.lastVerifiedDate;
    decision.primaryScheme.evidenceLevel = decision.primaryScheme.evidenceLevel || meta.evidenceLevel;
    decision.primaryScheme.nccnDeepLink = decision.primaryScheme.nccnDeepLink || meta.nccnDeepLink;
  }

  if (decision.alternativeSchemes) {
    decision.alternativeSchemes.forEach((scheme: any) => {
      if (scheme) {
        scheme.guidelineVersion = scheme.guidelineVersion || meta.guidelineVersion;
        scheme.lastVerifiedDate = scheme.lastVerifiedDate || meta.lastVerifiedDate;
        scheme.evidenceLevel = scheme.evidenceLevel || meta.evidenceLevel;
        scheme.nccnDeepLink = scheme.nccnDeepLink || meta.nccnDeepLink;
      }
    });
  }

  return decision;
}
