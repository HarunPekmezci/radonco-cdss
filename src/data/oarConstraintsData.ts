import type { OARNTPCeiling } from '@/types/oar-guide';

export const oarConstraintsData: OARNTPCeiling[] = [
  {
    "id": "brainstem-conv",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "Ciddi nörolojik toksisite / Nekroz riski",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Brainstem (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.07.1753",
    "context": "Dmax tüm kesit < 54 Gy, < 1-10 cc fokal hacimlerde < 59 Gy tolere edilebilir.",
    "tumorSites": [
      "cranial-cns",
      "head-neck"
    ]
  },
  {
    "id": "brainstem-hypo",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 36-40 Gy",
    "endpoint": "Ciddi nörolojik toksisite / Nekroz",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "Clinical Guidelines / UK Consensus",
    "context": "10-15 fraksiyon hipofraksiyonasyon şemaları.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brainstem-srs-1fx-dmax",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 12.5 Gy",
    "endpoint": "Nöropati / Nekroz riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Brainstem (2021)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2020.08.013",
    "context": "Tek fraksiyon SRS; Dmax nokta dozu < 0.035 cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brainstem-srs-1fx-v10",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "V10Gy",
    "limit": "< 0.5 cc",
    "endpoint": "Nöropati / Nekroz riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Brainstem (2021)",
    "context": "Tek fraksiyon SRS; 10 Gy alan hacim kısıtı.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brainstem-srs-3fx",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 18-20 Gy",
    "endpoint": "Nöropati / Nekroz riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "3 fraksiyon SRS; V15Gy < 0.5 cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brainstem-srs-5fx",
    "organ": "Beyin sapı",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 23-25 Gy",
    "endpoint": "Nöropati / Nekroz riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC 2021",
    "context": "5 fraksiyon SRS; V20Gy < 0.5 cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "optic-conv",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54-55 Gy",
    "endpoint": "Radyasyon kaynaklı optik nöropati (RION) < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Optic Pathway (2010)",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/20171519/",
    "context": "Konvansiyonel fraksiyonasyon (1.8-2 Gy/fx); PRV marjı 1-2 mm.",
    "tumorSites": [
      "cranial-cns",
      "head-neck"
    ]
  },
  {
    "id": "optic-hypo",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 35 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "10 fraksiyon şemalarında Dmax < 35 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "optic-srs-1fx-dmax",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 8-10 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "Tek fraksiyon SRS; nokta dozu Dmax.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "optic-srs-1fx-d02",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "D0.2cc",
    "limit": "< 8 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "Küçük hacim doz eşiği D0.2cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "optic-srs-3fx",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "3 fraksiyon SRS; D0.2cc < 15 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "optic-srs-5fx",
    "organ": "Optik sinirler / kiazma",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 20-22 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "5 fraksiyon SRS; D0.2cc < 17.5-20 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-conv-mean",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 10-12 Gy",
    "endpoint": "Nörokognitif hafıza fonksiyonunun korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "RTOG 0933 / Gondi et al.",
    "context": "Primer beyin tümörleri ve WBRT planlamasında hipokampal subgranüler zonun korunması.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-conv-d40",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "D40%",
    "limit": "< 7.3 Gy",
    "endpoint": "Nörokognitif hafıza fonksiyonunun korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "RTOG 0933",
    "context": "Hipokampal hacmin %40’ının aldığı doz sınırı.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-hypo-d100",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "hipofraksiyon",
    "metric": "D100%",
    "limit": "≤ 9 Gy",
    "endpoint": "HA-WBRT (30 Gy/10 fx) hafıza korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "NRG CC001 (Lancet Oncol 2020)",
    "context": "Hipokampus korumalı tüm beyin RT protokolü (10 fx).",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-hypo-dmax",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "≤ 16-17 Gy",
    "endpoint": "HA-WBRT (30 Gy/10 fx) hafıza korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "NRG CC001 (Lancet Oncol 2020)",
    "context": "Hipokampus korumalı tüm beyin RT protokolü (10 fx).",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-srs-1fx",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 9 Gy",
    "endpoint": "Nörokognitif hafıza korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "RTOG 0933 / TG-101",
    "context": "Tek fraksiyon SRS; D100% < 7 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-srs-3fx",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "Nörokognitif hafıza korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "3 fraksiyon SRS.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hippocampus-srs-5fx",
    "organ": "Hipokampus",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 17 Gy",
    "endpoint": "Nörokognitif hafıza korunması",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "5 fraksiyon SRS; D100% < 9 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cochlea-conv-mean",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 45 Gy",
    "endpoint": "Sensörinöral işitme kaybının önlenmesi",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Cochlea (2010)",
    "context": "Eşzamanlı sisplatin varlığında eşik daha düşük (< 35 Gy) hedeflenmelidir.",
    "tumorSites": [
      "cranial-cns",
      "head-neck"
    ]
  },
  {
    "id": "cochlea-hypo-mean",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 30 Gy",
    "endpoint": "İşitme fonksiyonunun korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "10 fraksiyon şemalarında ortalama doz sınırı.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cochlea-srs-1fx-dmax",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 9 Gy",
    "endpoint": "Sensörinöral işitme korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "HyTEC Cochlea",
    "context": "Tek fraksiyon SRS.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cochlea-srs-1fx-dmean",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmean",
    "limit": "< 4.5 Gy",
    "endpoint": "Sensörinöral işitme korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "HyTEC Cochlea",
    "context": "Tek fraksiyon SRS ortalama doz.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cochlea-srs-3fx",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 14 Gy",
    "endpoint": "Sensörinöral işitme korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "HyTEC / TG-101",
    "context": "3 fraksiyon SRS; Dmean < 9 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cochlea-srs-5fx",
    "organ": "Koklea",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 17.5 Gy",
    "endpoint": "Sensörinöral işitme korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "HyTEC / TG-101",
    "context": "5 fraksiyon SRS; Dmean < 14 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brain-normal-conv-v60",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "V60Gy",
    "limit": "< 33%",
    "endpoint": "Semptomatik radyasyon nekrozu",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Brain (2010)",
    "context": "Normal beyin parankiminin %33’ünden azı 60 Gy almalıdır (veya V60Gy < 100 cc).",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brain-normal-conv-v45",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "V45Gy",
    "limit": "< 66%",
    "endpoint": "Semptomatik radyasyon nekrozu ve nörokognitif gerileme",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC Brain (2010)",
    "context": "Normal beyin parankiminin %66’sından azı 45 Gy almalıdır.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brain-normal-srs-1fx",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "V12Gy",
    "limit": "< 5-10 cc",
    "endpoint": "Semptomatik radyasyon nekrozu < %10",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Brain SRS (2021)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2020.08.013",
    "context": "V12Gy < 5 cc: düşük risk; 5-10 cc: <%10 nekroz; >14 cc: >%20 yüksek risk.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brain-normal-srs-3fx",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "V18Gy",
    "limit": "< 10-20 cc",
    "endpoint": "Semptomatik radyasyon nekrozu",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / TG-101",
    "context": "3 fraksiyon SRS; V18Gy < 10-20 cc veya V20Gy < 20 cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "brain-normal-srs-5fx",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "V24Gy",
    "limit": "< 20 cc",
    "endpoint": "Semptomatik radyasyon nekrozu",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / TG-101",
    "context": "5 fraksiyon SRS; V24Gy < 20 cc veya V28.8Gy < 5-7 cc.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cn-srs-1fx",
    "organ": "Kranial sinirler (CN V, VII, VIII)",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 12-14 Gy",
    "endpoint": "Trigeminal dizestezi & fasial motor sinir parezisi < %3",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC",
    "context": "Akustik nörom / vestibüler schwannom SRS.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cn-srs-3fx",
    "organ": "Kranial sinirler (CN V, VII, VIII)",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 18 Gy",
    "endpoint": "Nöropati riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "cn-srs-5fx",
    "organ": "Kranial sinirler (CN V, VII, VIII)",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 22-25 Gy",
    "endpoint": "Nöropati riski < %5",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "pituitary-conv",
    "organ": "Hipofiz",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "Hipopitüitarizm",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC",
    "context": "",
    "tumorSites": [
      "cranial-cns",
      "head-neck"
    ]
  },
  {
    "id": "pituitary-srs-1fx",
    "organ": "Hipofiz",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "Hipopitüitarizm önlenmesi",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "Dmean < 7-8 Gy.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "pituitary-srs-3fx",
    "organ": "Hipofiz",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 18-20 Gy",
    "endpoint": "Hipopitüitarizm önlenmesi",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "pituitary-srs-5fx",
    "organ": "Hipofiz",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 25 Gy",
    "endpoint": "Hipopitüitarizm önlenmesi",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "lens-conv",
    "organ": "Lens",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 5-10 Gy (tercihen < 7 Gy)",
    "endpoint": "Katarakt riski",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC",
    "context": "ALARA prensibi uygulanır.",
    "tumorSites": [
      "cranial-cns",
      "head-neck"
    ]
  },
  {
    "id": "lens-srs-1fx",
    "organ": "Lens",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 2-2.5 Gy",
    "endpoint": "Katarakt",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "lens-srs-3fx",
    "organ": "Lens",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 4 Gy",
    "endpoint": "Katarakt",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "lens-srs-5fx",
    "organ": "Lens",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 5 Gy",
    "endpoint": "Katarakt",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "retina-conv",
    "organ": "Retina",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45 Gy",
    "endpoint": "Radyasyon retinopatisi",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "retina-srs-1fx",
    "organ": "Retina",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 8 Gy",
    "endpoint": "Retinal toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "retina-srs-3fx",
    "organ": "Retina",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "Retinal toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "retina-srs-5fx",
    "organ": "Retina",
    "region": "kranial",
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 20 Gy",
    "endpoint": "Retinal toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "TG-101",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "lacrimal-conv",
    "organ": "Lakrimal bez",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 30-40 Gy",
    "endpoint": "Kuru göz sendromu (keratokonjonktivitis sikka)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "scalp-conv",
    "organ": "Kafa derisi / skalp",
    "region": "kranial",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50 Gy",
    "endpoint": "Kalıcı alopesi ve radyasyon dermatiti",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "CNS Planning Reference",
    "context": "Dmax > 45-50 Gy kalıcı saç dökülmesine yol açar.",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "scalp-srs-1fx",
    "organ": "Kafa derisi / skalp",
    "region": "kranial",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 10-12 Gy",
    "endpoint": "Kalıcı alopesi & ülserasyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Planning Reference",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "scalp-srs-3fx",
    "organ": "Kafa derisi / skalp",
    "region": "kranial",
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 18 Gy",
    "endpoint": "Kalıcı alopesi & ülserasyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Planning Reference",
    "context": "",
    "tumorSites": [
      "cranial-cns"
    ]
  },
  {
    "id": "hn-parotid-conv",
    "organ": "Parotis bezi",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 20-26 Gy",
    "endpoint": "Tükürük akışının korunması ve kserostomi riskinin azaltılması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Parotid (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.06.090",
    "context": "En az bir bezde Dmean < 26 Gy veya bilateral bezlerde Dmean < 20 Gy hedeflenmelidir.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-submandibular-conv",
    "organ": "Submandibular bez",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 35-39 Gy",
    "endpoint": "İstirahat tükürük salgısının ve musin sekresyonunun korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Head and Neck Planning Guidelines",
    "context": "Seçilmiş ipsilateral/kontralateral bez koruma.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-mandible-conv",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 70 Gy",
    "endpoint": "Osteoradyonekroz (ORN limit) < %5",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "Özellikle diş çekimi planlanan bölgelerde Dmax < 65-70 Gy tutulmalıdır.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-larynx-conv",
    "organ": "Larenks",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 45 Gy",
    "endpoint": "Laringeal ödem, aspirasyon ve disfonksiyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Larynx (2010)",
    "context": "Tümör glottik/supraglottik değilse larenks ortalama dozu < 40-45 Gy tutulur.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-pcm-conv",
    "organ": "Faringeal konstriktörler (PCM)",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 50 Gy",
    "endpoint": "Kronik disfaji ve PEG bağımlılığı riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC (2010)",
    "context": "Üst/orta/alt konstriktör kasların ortalama dozu sınırlanmalıdır.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-oral-cavity-conv",
    "organ": "Oral kavite",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 40 Gy (tercihen < 35 Gy)",
    "endpoint": "Mukozit, tat kaybı (disgezi) ve ağrı",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC (2010)",
    "context": "Tümör dışı oral kavite dozu kısıtlanır.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-thyroid-conv",
    "organ": "Tiroid",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "V30Gy",
    "limit": "< 50%",
    "endpoint": "Radyasyon kaynaklı hipotiroidizm",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Head and Neck Planning Guidelines",
    "context": "Tiroid dokusunun %50’sinden fazlasının 30 Gy alması hipotiroidi riskini artırır.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-spinal-cord-conv",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45-48 Gy (tercihen < 45 Gy)",
    "endpoint": "Radyasyon miyelopatisi riski < %0.2",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Spinal Cord (2010)",
    "context": "Konvansiyonel fraksiyonasyon için standart güvenlik tavanı.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cord-prv-conv",
    "organ": "Spinal kord PRV",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 48-50 Gy",
    "endpoint": "Radyasyon miyelopatisini önlemede geometrik güvenlik marjı",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "RTOG / ESTRO Guidelines",
    "context": "Spinal korda 1.5-2 mm geometrik genişletme ile elde edilen PRV için mutlak sınır.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cervical-esophagus-conv",
    "organ": "Servikal özofagus",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 34 Gy",
    "endpoint": "Kronik disfaji ve özofagus striktürü",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Esophagus (2010)",
    "context": "Alt boyun alanlarında özofagus dozu kısıtlanmalıdır.",
    "tumorSites": [
      "head-neck",
      "esophagus"
    ]
  },
  {
    "id": "hn-brachial-conv",
    "organ": "Brakial pleksus",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 66 Gy",
    "endpoint": "Brakiyal pleksopati ve kalıcı nöropatik ağrı/güçsüzlük",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "Level IV/V ve supraklavikuler nodal ışınlamada sinir köklerini koruyun.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-tmj-conv",
    "organ": "Temporomandibüler eklem (TMJ)",
    "region": "bas-boyun",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60-70 Gy",
    "endpoint": "Çiğneme kası fibrozu ve trismus",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Head and Neck Planning Guidelines",
    "context": "Trismus hastanın beslenme ve ağız bakımını ileri derecede bozar.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-spinal-cord-hypo",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 25-30 Gy (EQD2 < 45-50 Gy)",
    "endpoint": "Miyelopati (Myelopathy)",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC / UK Guidelines",
    "context": "10-15 fraksiyon palyatif / quad shot protokolleri.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-brainstem-hypo",
    "organ": "Beyin sapı",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 35-40 Gy",
    "endpoint": "Beyin sapı nekrozu / Kranial nöropati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "10-15 fraksiyon hipofraksiyone şemalar.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-carotid-hypo",
    "organ": "Karotis arter",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 35-40 Gy",
    "endpoint": "Karotis rüptürü (Carotid blowout prevention)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "Özellikle yeniden ışınlamada (re-irradiation) kritik.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-mandible-hypo",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 40-45 Gy",
    "endpoint": "Osteoradyonekroz (ORN prevention)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-larynx-hypo",
    "organ": "Larenks",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 25-30 Gy",
    "endpoint": "Larengeal ödem ve nekroz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "Dmax < 40 Gy.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-pcm-hypo",
    "organ": "Faringeal konstriktörler (PCM)",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 30-35 Gy",
    "endpoint": "Ciddi disfaji ve striktür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-parotid-hypo",
    "organ": "Parotis bezi",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 20-22 Gy",
    "endpoint": "Ciddi kserostomi önlenmesi",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-brachial-hypo",
    "organ": "Brakial pleksus",
    "region": "bas-boyun",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 35-40 Gy",
    "endpoint": "Brakiyal pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-carotid-srs-1fx",
    "organ": "Karotis arter",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 37 Gy",
    "endpoint": "Karotis rüptürü (Carotid blowout syndrome - CBS)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "AAPM TG-101 / MSKCC",
    "context": "D0.035cc < 37 Gy. Yeniden ışınlamada ve tek fraksiyon SRS'de damarın >180° sarmalanmasından kaçının.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-carotid-sbrt-3fx",
    "organ": "Karotis arter",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 27-30 Gy",
    "endpoint": "Karotis rüptürü (Carotid blowout syndrome - CBS)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "MSKCC / HyTEC",
    "context": "Yeniden ışınlamada damarın >180 derece çevresel sarmalanmasından kaçının.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-carotid-sbrt-5fx-dmax",
    "organ": "Karotis arter",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 40 Gy",
    "endpoint": "Karotis rüptürü (CBS riski)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "MSKCC / HyTEC",
    "context": "Yeniden ışınlamada >180° sarmalamaktan kaçının.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-carotid-sbrt-5fx-v35",
    "organ": "Karotis arter",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "V35Gy",
    "limit": "< 1 cc",
    "endpoint": "Karotis rüptürü (CBS riski)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "MSKCC / HyTEC",
    "context": "V35Gy < 1 cc ve >180° çevresel sarılma olmamalıdır.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-cord-srs-1fx-dmax",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 12-14 Gy",
    "endpoint": "Miyelopati (Myelopathy)",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "V10Gy < 0.35 cc; D0.035cc < 14 Gy.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cord-srs-1fx-v10",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "V10Gy",
    "limit": "< 0.35 cc",
    "endpoint": "Miyelopati (Myelopathy)",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "V10Gy < 0.35 cc kritik spinal kord hacim sınırlaması.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cord-sbrt-3fx",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 18-20 Gy",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "V14Gy < 1.2 cc.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cord-sbrt-5fx-dmax",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 23-25 Gy",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "D0.035cc < 25 Gy.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-cord-sbrt-5fx-v20",
    "organ": "Spinal kord",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "V20Gy",
    "limit": "< 0.5 cc",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "V20Gy < 0.5 cc hacim sınırlaması.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-brainstem-sbrt-3fx",
    "organ": "Beyin sapı",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 18-20 Gy",
    "endpoint": "Nöropati / Nekroz",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Brainstem",
    "context": "V15Gy < 0.5 cc.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-brainstem-sbrt-5fx",
    "organ": "Beyin sapı",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 23-25 Gy",
    "endpoint": "Nöropati / Nekroz",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Brainstem",
    "context": "V20Gy < 0.5 cc.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-mandible-srs-1fx-dmax",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 14-17.5 Gy",
    "endpoint": "Osteoradyonekroz (ORN)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "V12.5Gy < 0.1 cc; D0.035cc < 17.5 Gy.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-mandible-srs-1fx-v12",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "V12.5Gy",
    "limit": "< 0.1 cc",
    "endpoint": "Osteoradyonekroz (ORN)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "V12.5Gy < 0.1 cc kritik mandibula hacim sınırlaması.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-mandible-sbrt-3fx",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 26-30 Gy",
    "endpoint": "Osteoradyonekroz (ORN)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-mandible-sbrt-5fx-dmax",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 35-40 Gy",
    "endpoint": "Osteoradyonekroz (ORN)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-mandible-sbrt-5fx-v35",
    "organ": "Mandibula",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "V35Gy",
    "limit": "< 1 cc",
    "endpoint": "Osteoradyonekroz (ORN)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "V35Gy < 1 cc hacim kısıtı.",
    "tumorSites": [
      "head-neck",
      "parotid"
    ]
  },
  {
    "id": "hn-brachial-srs-1fx",
    "organ": "Brakial pleksus",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 14-17.5 Gy",
    "endpoint": "Brakiyal pleksopati (Plexopathy)",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "D0.035cc < 17.5 Gy.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-brachial-sbrt-3fx",
    "organ": "Brakial pleksus",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 22-24 Gy",
    "endpoint": "Brakiyal pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-brachial-sbrt-5fx",
    "organ": "Brakial pleksus",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 30-32 Gy",
    "endpoint": "Brakiyal pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "D0.035cc < 32 Gy.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-larynx-srs-1fx",
    "organ": "Larenks & trakea",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 17 Gy",
    "endpoint": "Kıkırdak nekrozu ve laringeal kollaps (Cartilage necrosis / collapse)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "D0.035cc < 17 Gy; kıkırdak nekrozu ve laringeal kollaps önleme.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-larynx-sbrt-3fx",
    "organ": "Larenks & trakea",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 28-30 Gy",
    "endpoint": "Kıkırdak nekrozu ve laringeal stenoz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-larynx-sbrt-5fx",
    "organ": "Larenks & trakea",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 35-40 Gy",
    "endpoint": "Kıkırdak nekrozu ve laringeal stenoz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "V35Gy < 1 cc.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-pharynx-srs-1fx",
    "organ": "Farinks & servikal özofagus",
    "region": "bas-boyun",
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 15.4 Gy",
    "endpoint": "Perforasyon / şiddetli ülserasyon (Perforation / severe ulceration)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "D0.035cc < 15.4 Gy; mukozal nekroz ve perforasyon önleme.",
    "tumorSites": [
      "head-neck",
      "esophagus"
    ]
  },
  {
    "id": "hn-pharynx-sbrt-3fx",
    "organ": "Farinks & servikal özofagus",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 27-30 Gy",
    "endpoint": "Perforasyon / striktür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck",
      "esophagus"
    ]
  },
  {
    "id": "hn-pharynx-sbrt-5fx",
    "organ": "Farinks & servikal özofagus",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 35-38 Gy",
    "endpoint": "Perforasyon / striktür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "V35Gy < 1 cc.",
    "tumorSites": [
      "head-neck",
      "esophagus"
    ]
  },
  {
    "id": "hn-skin-sbrt-3fx",
    "organ": "Cilt (Skin)",
    "region": "bas-boyun",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 24-27 Gy",
    "endpoint": "Cilt ülserasyonu",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "hn-skin-sbrt-5fx",
    "organ": "Cilt (Skin)",
    "region": "bas-boyun",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 32-35 Gy",
    "endpoint": "Cilt ülserasyonu",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "V35Gy < 10 cc.",
    "tumorSites": [
      "head-neck"
    ]
  },
  {
    "id": "lung-v20-conv",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "V20Gy",
    "limit": "< 30-35%",
    "endpoint": "Semptomatik radyasyon pnömonisi riski < %15-20",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Lung (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.06.091",
    "context": "Konvansiyonel fraksiyonasyon (1.8-2 Gy/fx). Tercihen V20Gy < %30 tutulmalıdır.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "lung-mean-conv",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 20 Gy",
    "endpoint": "Semptomatik radyasyon pnömonisi riski",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Lung (2010)",
    "context": "Ortalama akciğer dozu (MLD) < 20 Gy; eşzamanlı kemoterapide MLD < 18 Gy hedeflenir.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "lung-v5-conv",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "V5Gy",
    "limit": "< 60%",
    "endpoint": "Düşük doz banyosu ve pnömoni riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "Özellikle IMRT ve VMAT planlarında düşük doz yayılımını sınırlar.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "heart-conv-mean",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 20 Gy",
    "endpoint": "Kardiyak mortalite ve uzun dönem iskemik olaylar",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Cardiac (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.04.093",
    "context": "ALARA prensibi esastır. Meme RT için Dmean < 2-4 Gy; Akciğer/Özofagus RT için Dmean < 20 Gy.",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "heart-conv-v30",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "V30Gy",
    "limit": "< 46%",
    "endpoint": "Perikardit ve kardiyak hasar riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Cardiac (2010)",
    "context": "Kalp V30Gy < %46 perikardit riskini <%15 düzeyinde tutar.",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "lad-conv-mean",
    "organ": "LAD koroner arter",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 10 Gy",
    "endpoint": "Akut miyokard enfarktüsü ve radyasyon ilişkili koroner stenoz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Cardio-Oncology Thoracic Guidelines",
    "context": "Sol ön inen arter dozu sınırlanmalıdır.",
    "tumorSites": [
      "breast"
    ]
  },
  {
    "id": "lad-conv-dmax",
    "organ": "LAD koroner arter",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 20 Gy",
    "endpoint": "Koroner stenoz riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Cardio-Oncology Thoracic Guidelines",
    "context": "",
    "tumorSites": [
      "breast"
    ]
  },
  {
    "id": "esophagus-conv-mean",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 34 Gy",
    "endpoint": "Akut ve geç özofajit riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Esophagus (2010)",
    "context": "Dmean < 34 Gy Grade >= 2 özofajiti <%30 seviyesinde tutar.",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "esophagus-conv-dmax",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60 Gy",
    "endpoint": "Özofageal perforasyon ve darlık",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Esophagus (2010)",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "cord-thorax-conv",
    "organ": "Spinal kord",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45-50 Gy",
    "endpoint": "Radyasyon miyelopatisi",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Spinal Cord (2010)",
    "context": "Konvansiyonel fraksiyonasyon mutlak tavanı.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "brachial-thorax-conv",
    "organ": "Brakial pleksus",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 66 Gy",
    "endpoint": "Brakiyal pleksopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "Apikal ve üst lob tümörlerinde kritik yapı.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "ipsi-lung-conv-v20",
    "organ": "İpsilateral akciğer",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "V20Gy",
    "limit": "< 30% (tercihen < 20%)",
    "endpoint": "Radyasyon pnömonisi ve pulmoner fibrozis",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC / FAST-Forward (Lancet 2020)",
    "context": "Meme ve göğüs duvarı ışınlamasında ipsilateral akciğer kısıtı.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "ipsi-lung-conv-v5",
    "organ": "İpsilateral akciğer",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "V5Gy",
    "limit": "< 60%",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "FAST-Forward",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "contra-breast-conv",
    "organ": "Kontralateral meme",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 2-3 Gy",
    "endpoint": "İkincil radyasyon ilişkili meme kanseri",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC / ESTRO Guidelines",
    "context": "Karşı memeye sızan saçılma dozunu en aza indirin.",
    "tumorSites": [
      "breast"
    ]
  },
  {
    "id": "contra-lung-conv",
    "organ": "Kontralateral akciğer",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 2 Gy",
    "endpoint": "Düşük doz banyosu ve ikincil malignite riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Breast RT Planning Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "humeral-head-conv",
    "organ": "Humerus başı",
    "region": "toraks",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50 Gy",
    "endpoint": "Omuz sertliği, eklem fibrozu ve avasküler nekroz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Planning Reference",
    "context": "Aksiller ve supraklavikuler alanlarda humerus başını koruyun.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-lungs-v20-hypo",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "V20Gy",
    "limit": "< 25-28%",
    "endpoint": "Semptomatik radyasyon pnömonisi < %10-15",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC / Moderate HypoThorax trials",
    "context": "55 Gy / 20 fx veya 30 Gy / 10 fx hipofraksiyone toraks RT.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-mean-hypo",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 15-18 Gy",
    "endpoint": "Semptomatik radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC / Moderate HypoThorax trials",
    "context": "Ortalama akciğer dozu (MLD).",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-v5-hypo",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "V5Gy",
    "limit": "< 55%",
    "endpoint": "Semptomatik radyasyon pnömonisi",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC / Moderate HypoThorax trials",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-cord-hypo",
    "organ": "Spinal kord",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 40-42 Gy (EQD2 < 45-50 Gy)",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "Hipofraksiyone torasik RT şemaları.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-heart-mean-hypo",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 15-20 Gy",
    "endpoint": "Perikardit & majör kardiyak yan etkiler",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-heart-v30-hypo",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "V30Gy",
    "limit": "< 30%",
    "endpoint": "Perikardit & majör kardiyak yan etkiler",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-esophagus-mean-hypo",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmean",
    "limit": "< 25-30 Gy",
    "endpoint": "Grade >= 2 akut/geç özofajit",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "thorax-esophagus-dmax-hypo",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 50-52 Gy",
    "endpoint": "Grade >= 2 akut/geç özofajit ve striktür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "thorax-pbt-hypo",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 52-55 Gy",
    "endpoint": "Ciddi darlık / bronşiyal nekroz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-brachial-hypo",
    "organ": "Brakial pleksus",
    "region": "toraks",
    "fractionation": "hipofraksiyon",
    "metric": "Dmax",
    "limit": "< 50-52 Gy",
    "endpoint": "Pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-lungs-v20-sbrt-3fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "V20Gy",
    "limit": "< 10-12%",
    "endpoint": "Radyasyon pnömonisi < %10",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0236 / AAPM TG-101",
    "context": "Periferik akciğer SBRT (3 fx).",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-v12-sbrt-3fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "V12.5Gy",
    "limit": "< 15%",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0236 / AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-v5-sbrt-3fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "V5Gy",
    "limit": "< 26-30%",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0236 / AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-mean-sbrt-3fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmean",
    "limit": "< 8 Gy",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0236 / AAPM TG-101",
    "context": "Ortalama akciğer dozu (MLD).",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-cord-sbrt-3fx",
    "organ": "Spinal kord",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 18 Gy",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "V14Gy < 1.2 cc; D0.035cc < 18 Gy.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-heart-sbrt-3fx",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 30 Gy",
    "endpoint": "Perikardit / kardiyak olaylar",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / TG-101",
    "context": "V24Gy < 15 cc.",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-pbt-sbrt-3fx",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 30 Gy",
    "endpoint": "Fatal hemoptizi / bronşiyal nekroz (RTOG 0813 / SUNSET)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / SUNSET",
    "context": "Santral tümörlerde kritik; V24Gy < 0.5 cc.",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-esophagus-sbrt-3fx",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 27 Gy",
    "endpoint": "Ülserasyon / perforasyon / fistül",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / TG-101",
    "context": "V24Gy < 0.5 cc.",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "thorax-brachial-sbrt-3fx",
    "organ": "Brakial pleksus",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 24 Gy",
    "endpoint": "Pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "Apikal/Pancoast SBRT için kritik; V20Gy < 0.2 cc.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-vessels-sbrt-3fx",
    "organ": "Büyük damarlar & aort",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 45 Gy",
    "endpoint": "Psödoanevrizma & rüptür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-chestwall-sbrt-3fx",
    "organ": "Göğüs duvarı & kaburga",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "V30Gy",
    "limit": "< 30 cc",
    "endpoint": "Kosta kırığı & kronik ağrı",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Dunlap et al. / TG-101",
    "context": "Dmax < 40 Gy.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-trachea-sbrt-3fx",
    "organ": "Trakea & ana bronşlar",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 30 Gy",
    "endpoint": "Nekroz / fistül",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-skin-sbrt-3fx",
    "organ": "Cilt (Skin)",
    "region": "toraks",
    "fractionation": "sbrt-3fx",
    "metric": "Dmax",
    "limit": "< 30 Gy",
    "endpoint": "Cilt ülserasyonu",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-lungs-v20-sbrt-5fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V20Gy",
    "limit": "< 12-15%",
    "endpoint": "Radyasyon pnömonisi < %10",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / AAPM TG-101",
    "context": "Santral ve periferik akciğer SBRT (5 fx).",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-v12-sbrt-5fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V12.5Gy",
    "limit": "< 15%",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-v5-sbrt-5fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V5Gy",
    "limit": "< 26-30%",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-lungs-mean-sbrt-5fx",
    "organ": "Bilateral akciğer (GTV hariç)",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmean",
    "limit": "< 8 Gy",
    "endpoint": "Radyasyon pnömonisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / AAPM TG-101",
    "context": "Ortalama akciğer dozu (MLD).",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-cord-sbrt-5fx-dmax",
    "organ": "Spinal kord",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 23-25 Gy",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "D0.035cc < 25 Gy.",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-cord-sbrt-5fx-v20",
    "organ": "Spinal kord",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V20Gy",
    "limit": "< 0.5 cc",
    "endpoint": "Miyelopati",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "breast",
      "esophagus",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-heart-sbrt-5fx-dmax",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 38-40 Gy",
    "endpoint": "Perikardit / kardiyak olaylar",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / TG-101",
    "context": "D0.035cc < 40 Gy.",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-heart-sbrt-5fx-v32",
    "organ": "Kalp",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V32Gy",
    "limit": "< 15 cc",
    "endpoint": "Perikardit / kardiyak olaylar",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / TG-101",
    "context": "V32Gy < 15 cc hacim sınırlaması.",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ]
  },
  {
    "id": "thorax-pbt-sbrt-5fx-dmax",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 38-40 Gy",
    "endpoint": "Fatal hemoptizi / bronşiyal nekroz (RTOG 0813 / SUNSET)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / SUNSET",
    "context": "Santral akciğer SBRT kilit kısıtı.",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-pbt-sbrt-5fx-d0035",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "D0.035cc",
    "limit": "< 40 Gy",
    "endpoint": "Fatal hemoptizi / bronşiyal nekroz",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / SUNSET",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-pbt-sbrt-5fx-v35",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V35Gy",
    "limit": "< 0.5 cc",
    "endpoint": "Fatal hemoptizi / bronşiyal nekroz",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / SUNSET",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-esophagus-sbrt-5fx",
    "organ": "Özofagus",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 32-35 Gy",
    "endpoint": "Ülserasyon / perforasyon / fistül",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0813 / TG-101",
    "context": "D0.035cc < 35 Gy; V30Gy < 0.5 cc.",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "stomach-pancreas",
      "breast"
    ]
  },
  {
    "id": "thorax-brachial-sbrt-5fx",
    "organ": "Brakial pleksus",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 30-32 Gy",
    "endpoint": "Pleksopati",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "Clinical Guidelines",
    "context": "D0.035cc < 32 Gy.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-vessels-sbrt-5fx",
    "organ": "Büyük damarlar & aort",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 50 Gy",
    "endpoint": "Psödoanevrizma & rüptür",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "AAPM TG-101",
    "context": "V47Gy < 1.5 cc.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-chestwall-sbrt-5fx-v30",
    "organ": "Göğüs duvarı & kaburga",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V30Gy",
    "limit": "< 30 cc",
    "endpoint": "Kosta kırığı & kronik ağrı",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Dunlap et al. / TG-101",
    "context": "",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-chestwall-sbrt-5fx-v35",
    "organ": "Göğüs duvarı & kaburga",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "V35Gy",
    "limit": "< 10 cc",
    "endpoint": "Kosta kırığı & kronik ağrı",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Dunlap et al. / TG-101",
    "context": "Dmax < 50 Gy.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "thorax-trachea-sbrt-5fx",
    "organ": "Trakea & ana bronşlar",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 38-40 Gy",
    "endpoint": "Nekroz / fistül",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "",
    "tumorSites": [
      "thorax-lung",
      "esophagus",
      "breast"
    ]
  },
  {
    "id": "thorax-skin-sbrt-5fx",
    "organ": "Cilt (Skin)",
    "region": "toraks",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 36-38 Gy",
    "endpoint": "Cilt ülserasyonu",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Clinical Guidelines",
    "context": "V32Gy < 10 cc.",
    "tumorSites": [
      "thorax-lung"
    ]
  },
  {
    "id": "liver-spared-volume-5fx",
    "organ": "Sağlam karaciğer (toplam karaciğer - GTV)",
    "region": "abdomen",
    "fractionation": "sbrt-5fx",
    "metric": "V15Gy",
    "limit": "≥ 700 cc (≤ 15 Gy)",
    "endpoint": "Karaciğer rezervinin korunması; RILD toksisite riski < %5",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "NRG/RTOG 1112 protocol; eviQ hepatic metastases SABR",
    "context": "En az 700 cc fonksiyonel karaciğer dokusu <= 15 Gy almalıdır.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "duodenum-conv-dmax",
    "organ": "Duodenum",
    "region": "abdomen",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "Duodenal ülser, perforasyon ve kanama",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC / NCCN Pancreatic Guidelines (2025)",
    "context": "Pankreas ve üst karın radyoterapisinde primer doz sınırlayıcı kritik yapıdır.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "duodenum-conv-v50",
    "organ": "Duodenum",
    "region": "abdomen",
    "fractionation": "konvansiyonel",
    "metric": "V50Gy",
    "limit": "< 10%",
    "endpoint": "Duodenal ülserasyon",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC",
    "context": "",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "duodenum-sbrt-5fx-dmax",
    "organ": "Duodenum",
    "region": "abdomen",
    "fractionation": "sbrt-5fx",
    "metric": "Dmax",
    "limit": "< 33 Gy",
    "endpoint": "Duodenal perforasyon ve fatal kanama",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "HyTEC Upper GI SBRT; NCCN Pancreatic v1.2025",
    "context": "Pankreas SBRT’de mutlak güvenlik tavanı.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "duodenum-sbrt-5fx-d05",
    "organ": "Duodenum",
    "region": "abdomen",
    "fractionation": "sbrt-5fx",
    "metric": "D0.5cc",
    "limit": "< 30 Gy",
    "endpoint": "Duodenal perforasyon",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "HyTEC Upper GI SBRT",
    "context": "D0.5cc hacim dozu kısıtı.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "stomach-conv",
    "organ": "Mide",
    "region": "abdomen",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50-54 Gy",
    "endpoint": "Gastrik ülserasyon ve mukozal kanama",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC (2010)",
    "context": "Pankreas ve üst batın planlamasında mide duvarı doz tavanı.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "stomach-sbrt-5fx",
    "organ": "Mide",
    "region": "abdomen",
    "fractionation": "sbrt-5fx",
    "metric": "D0.5cc",
    "limit": "≤ 30 Gy",
    "endpoint": "Ülserasyon, kanama ve gastrointestinal toksisite",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "eviQ hepatic metastases stereotactic EBRT protocol",
    "context": "5 fraksiyon SBRT referansı.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "kidneys-bilateral-conv-dmean",
    "organ": "Böbrekler (Bilateral)",
    "region": "abdomen",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 15-18 Gy",
    "endpoint": "Kronik radyasyon nefropatisi ve renal yetmezlik",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Renal Review (2010); INT-0116",
    "context": "Bilateral ortalama böbrek dozu < 15-18 Gy; en az 1 böbrek Dmean < 12 Gy.",
    "tumorSites": [
      "stomach-pancreas",
      "cervix-gyn"
    ]
  },
  {
    "id": "kidneys-bilateral-conv-v20",
    "organ": "Böbrekler (Bilateral)",
    "region": "abdomen",
    "fractionation": "konvansiyonel",
    "metric": "V20Gy",
    "limit": "< 30%",
    "endpoint": "Kronik radyasyon nefropatisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Renal Review (2010)",
    "context": "",
    "tumorSites": [
      "stomach-pancreas",
      "cervix-gyn"
    ]
  },
  {
    "id": "kidney-contra-sbrt-3fx",
    "organ": "Kontralateral böbrek",
    "region": "abdomen",
    "fractionation": "sbrt-3fx",
    "metric": "Dmean",
    "limit": "≤ 8 Gy",
    "endpoint": "Renal fonksiyonun korunması",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "eviQ Renal Cell Carcinoma Stereotactic EBRT",
    "context": "Böbrek SBRT’de sağlam karşı böbreği koruma kısıtı.",
    "tumorSites": [
      "stomach-pancreas",
      "cervix-gyn"
    ]
  },
  {
    "id": "bowel-small-sbrt-3fx",
    "organ": "İnce bağırsak (Small bowel)",
    "region": "abdomen",
    "fractionation": "sbrt-3fx",
    "metric": "D0.03cc",
    "limit": "≤ 30 Gy",
    "endpoint": "Akut ve geç gastrointestinal perforasyon / ülserasyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "eviQ renal cell carcinoma definitive stereotactic EBRT protocol",
    "context": "D0.03cc nokta dozu limiti.",
    "tumorSites": [
      "stomach-pancreas"
    ]
  },
  {
    "id": "rectum-conv-v50",
    "organ": "Rektum",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V50Gy",
    "limit": "< 50%",
    "endpoint": "Geç rektal toksisite ve kanama",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Rectum (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.11.003",
    "context": "Konvansiyonel prostat RT DVH referansı.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "rectum-conv-v65",
    "organ": "Rektum",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V65Gy",
    "limit": "< 25%",
    "endpoint": "Geç rektal toksisite ve kanama",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Rectum (2010)",
    "context": "Grade >= 2 rektal kanama riskini <%10 seviyesinde tutar.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "rectum-conv-v70",
    "organ": "Rektum",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V70Gy",
    "limit": "< 20%",
    "endpoint": "Geç rektal toksisite ve kanama",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Rectum (2010)",
    "context": "Yüksek doz alan rektum hacmi sınırlandırılmalıdır.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "bladder-conv-v65",
    "organ": "Mesane",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V65Gy",
    "limit": "< 50%",
    "endpoint": "Geç üriner toksisite, sistit ve hematüri",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Bladder (2010)",
    "context": "Konvansiyonel prostat ve pelvik RT.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "bladder-conv-v70",
    "organ": "Mesane",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V70Gy",
    "limit": "< 35%",
    "endpoint": "Geç üriner toksisite",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Bladder (2010)",
    "context": "",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "bowelbag-v45-conv",
    "organ": "Peritoneal boşluk / bowel bag",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V45Gy",
    "limit": "< 195 cc",
    "endpoint": "Akut ve geç ince bağırsak toksisitesi (Grade >= 3 enterit)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Small Bowel (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.05.074",
    "context": "Peritoneal boşluk/bowel-bag konturu içindir; tek tek bağırsak ansı limiti değildir.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "small-bowel-loops-v15",
    "organ": "İnce bağırsak (Small bowel)",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V15Gy",
    "limit": "< 120 cc",
    "endpoint": "Akut ince bağırsak komplikasyonları",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Small Bowel (2010)",
    "context": "Tek tek çizilen bağırsak ansları içindir.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "sigmoid-conv-dmax",
    "organ": "Sigmoid kolon",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60 Gy",
    "endpoint": "Sigmoidit, perforasyon ve obstrüksiyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Pelvic RT Guidelines",
    "context": "Prostat ve pelvik lenfatik ışınlamasında sigmoid kolon kısıtı.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "sigmoid-embrace2",
    "organ": "Sigmoid kolon",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "D2cc EQD2 α/β=3",
    "limit": "< 70-75 Gy (hedef < 70 Gy, limit < 75 Gy)",
    "endpoint": "Sigmoid ülserasyonu, striktür ve fistül",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "EMBRACE II Protocol",
    "sourceUrl": "https://doi.org/10.1016/j.ctro.2018.01.001",
    "context": "Serviks kanserinde kümülatif EBRT + 3D/4D brakiterapi EQD2 kısıtı.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "femur-heads-conv-dmax",
    "organ": "Bilateral femur başları",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50 Gy",
    "endpoint": "Femur başı avasküler nekrozu ve subkapital kırık",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "Rektum, prostat ve jinekolojik pelvik RT’de kalça eklemlerini koruyun.",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "femur-heads-conv-v40",
    "organ": "Bilateral femur başları",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "V40Gy",
    "limit": "< 20%",
    "endpoint": "Femur başı avasküler nekrozu",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "penile-bulb-conv",
    "organ": "Penil bulb",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 50 Gy (tercihen < 40-50 Gy)",
    "endpoint": "Radyasyona bağlı erektil disfonksiyon (empotans)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Penile Bulb (2010)",
    "context": "Prostat ve rektum RT planlamasında erektil fonksiyon koruması.",
    "tumorSites": [
      "prostate"
    ]
  },
  {
    "id": "genital-vagina-conv",
    "organ": "Genital organlar / vajina",
    "region": "pelvis",
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 40-50 Gy",
    "endpoint": "Vajinal stenoz, disparoni ve cilt/mukozal nekroz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "ESTRO / Anal & Rectal Cancer Guidelines",
    "context": "Rektum ve anal kanal RT’sinde perineal organ koruma.",
    "tumorSites": [
      "cervix-gyn",
      "rectum-bladder"
    ]
  },
  {
    "id": "cord-spine-conv",
    "organ": "Spinal kord",
    "region": "omurilik",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "≤ 50 Gy (tercihen ≤ 45 Gy)",
    "endpoint": "Radyasyon miyelopatisi riski",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Spinal Cord (2010)",
    "context": "Konvansiyonel fraksiyonasyon (1.8-2 Gy/fx).",
    "tumorSites": []
  },
  {
    "id": "cord-spine-sbrt-2fx",
    "organ": "Spinal kord",
    "region": "omurilik",
    "fractionation": "sbrt-2fx",
    "metric": "Dmax",
    "limit": "< 17 Gy",
    "endpoint": "Radyasyon miyelopatisi",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC Spine SBRT / RTOG 0631",
    "context": "2 fraksiyon omurga SBRT (8.5 Gy x 2) kısıtı.",
    "tumorSites": []
  },
  {
    "id": "cord-paraaortic-conv",
    "organ": "Spinal kord (Paraaortik alan)",
    "region": "omurilik",
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45 Gy",
    "endpoint": "Radyasyon miyelopatisi",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Spinal Cord (2010)",
    "context": "Jinekolojik genişletilmiş alan paraaortik lenfatik ışınlamasında omurilik koruması.",
    "tumorSites": []
  },
  {
    "id": "hn-brain-conv-dmax",
    "organ": "Normal beyin dokusu (Brain - GTV)",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "parotid"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60 Gy",
    "endpoint": "Semptomatik radyasyon nekrozu",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Brain (2010)",
    "sourceUrl": "https://doi.org/10.1016/j.ijrobp.2009.07.1753",
    "context": "Baş-boyun, nazofarinks ve parotis planlarında temporal lob ve normal beyin dokusu sınırlanmalıdır."
  },
  {
    "id": "hn-chiasm-conv",
    "organ": "Optik kiazma",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "cranial-cns"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "Radyasyon kaynaklı optik nöropati (RION) < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Optic Pathway (2010)",
    "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/20171519/",
    "context": "Nazofarinks ve paranazal sinüs RT’de kiazma dozu sıkı kontrol edilmelidir."
  },
  {
    "id": "hn-optic-nerve-conv",
    "organ": "Optik sinir",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "cranial-cns"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "İskemik optik nöropati (RION) < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Optic Pathway (2010)",
    "context": "Bilateral optik sinir dozu kısıtlanmalıdır (Dmax < 54 Gy)."
  },
  {
    "id": "hn-eye-globe-dmax",
    "organ": "Bulbus okuli / Göz küresi",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "cranial-cns"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45-50 Gy",
    "endpoint": "Neovasküler glokom, kornea ülserasyonu ve görme kaybı",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC / Clinical Guidelines",
    "context": "Maksiller sinüs ve nazofarinks planlamasında ipsilateral/kontralateral göz küresi korunmalıdır."
  },
  {
    "id": "hn-eye-globe-dmean",
    "organ": "Bulbus okuli / Göz küresi",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "cranial-cns"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 35 Gy",
    "endpoint": "Oküler toksisite ve retinal iskemi",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC / Clinical Guidelines",
    "context": "Göz küresi ortalama dozu sınırlanmalıdır."
  },
  {
    "id": "hn-pituitary-conv",
    "organ": "Hipofiz bezi",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck",
      "cranial-cns"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 54 Gy",
    "endpoint": "Hipopitüitarizm ve endokrin yetmezlik",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC",
    "context": "Nazofarinks ve kafa tabanı ışınlamalarında hipofiz aksı korunmalıdır."
  },
  {
    "id": "hn-thyroid-conv-dmean-45",
    "organ": "Tiroid bezi",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 45 Gy",
    "endpoint": "Radyasyon kaynaklı hipotiroidizm",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Head and Neck Planning Guidelines / QUANTEC",
    "context": "Tiroid ortalama dozu < 45 Gy ve V30Gy < %50 tutulduğunda hipotiroidizm riski belirgin azalır."
  },
  {
    "id": "hn-thyroid-conv-v30-50",
    "organ": "Tiroid bezi",
    "region": "bas-boyun",
    "tumorSites": [
      "head-neck"
    ],
    "fractionation": "konvansiyonel",
    "metric": "V30Gy",
    "limit": "< 50%",
    "endpoint": "Radyasyon kaynaklı hipotiroidizm",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Head and Neck Planning Guidelines",
    "context": "Tiroid dokusunun %50’sinden fazlasının 30 Gy alması hipotiroidi riskini artırır."
  },
  {
    "id": "cns-chiasm-srs-1fx",
    "organ": "Optik kiazma",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 8-10 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "Tek fraksiyon SRS nokta dozu Dmax; D0.2cc < 8 Gy."
  },
  {
    "id": "cns-chiasm-srs-3fx",
    "organ": "Optik kiazma",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "3 fraksiyon SRS; D0.2cc < 15 Gy."
  },
  {
    "id": "cns-chiasm-srs-5fx",
    "organ": "Optik kiazma",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 20-22 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "5 fraksiyon SRS; D0.2cc < 17.5-20 Gy."
  },
  {
    "id": "cns-optic-nerve-srs-1fx",
    "organ": "Optik sinir",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 8-10 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "Tek fraksiyon SRS; D0.2cc < 8 Gy."
  },
  {
    "id": "cns-optic-nerve-srs-3fx",
    "organ": "Optik sinir",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "3 fraksiyon SRS."
  },
  {
    "id": "cns-optic-nerve-srs-5fx",
    "organ": "Optik sinir",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 20-22 Gy",
    "endpoint": "RION < %1",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "HyTEC / AAPM TG-101",
    "context": "5 fraksiyon SRS."
  },
  {
    "id": "cns-eye-globe-srs-1fx",
    "organ": "Bulbus okuli / Göz küresi",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-1fx",
    "metric": "Dmax",
    "limit": "< 8-10 Gy",
    "endpoint": "Oküler toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "Tek fraksiyon SRS oküler tolerans."
  },
  {
    "id": "cns-eye-globe-srs-3fx",
    "organ": "Bulbus okuli / Göz küresi",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-3fx",
    "metric": "Dmax",
    "limit": "< 15 Gy",
    "endpoint": "Oküler toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "3 fraksiyon SRS."
  },
  {
    "id": "cns-eye-globe-srs-5fx",
    "organ": "Bulbus okuli / Göz küresi",
    "region": "kranial",
    "tumorSites": [
      "cranial-cns"
    ],
    "fractionation": "srs-5fx",
    "metric": "Dmax",
    "limit": "< 20 Gy",
    "endpoint": "Oküler toksisite",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "AAPM TG-101",
    "context": "5 fraksiyon SRS."
  },
  {
    "id": "breast-contra-mean-2-3",
    "organ": "Kontralateral meme",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 2-3 Gy",
    "endpoint": "İkincil radyasyon ilişkili kontralateral meme kanseri riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC / ESTRO Guidelines",
    "context": "Karşı memeye saçılan saçılma dozu en aza indirilmelidir (Dmean < 2-3 Gy)."
  },
  {
    "id": "breast-heart-mean-2-4",
    "organ": "Kalp",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 2-4 Gy",
    "endpoint": "İskemik kalp hastalığı, kardiyak mortalite ve MI riski",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "Darby et al. (NEJM 2013) / ESTRO / QUANTEC",
    "context": "Her 1 Gy ortalama kalp dozu artışı koroner olay riskini %7.4 artırır. DIBH tekniği ile tercihen Dmean < 2 Gy hedeflenir."
  },
  {
    "id": "breast-heart-v25-5",
    "organ": "Kalp",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "V25Gy",
    "limit": "< 5%",
    "endpoint": "Uzun dönem kardiyak toksisite",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "ESTRO Consensus / RTOG Guidelines",
    "context": "Kalbin yüksek doz alan hacmi sıkı kısıtlanmalıdır (V25Gy < %5)."
  },
  {
    "id": "breast-ipsi-lung-v20-30",
    "organ": "İpsilateral akciğer",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "V20Gy",
    "limit": "< 30% (tercihen < 20%)",
    "endpoint": "Semptomatik radyasyon pnömonisi ve pulmoner fibrozis riski",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC / FAST-Forward (Lancet 2020)",
    "context": "Meme ve göğüs duvarı ışınlamasında ipsilateral akciğer V20Gy < %30 (tercihen < %20)."
  },
  {
    "id": "breast-carina-55",
    "organ": "Proksimal bronşiyal ağaç & ana karina",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 55 Gy",
    "endpoint": "Bronşiyal darlık ve trakeal nekroz riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Thoracic Guidelines",
    "context": "Supraklavikuler ve iç meme ışınlamalarında trakeobronşiyal geçişi koruyun."
  },
  {
    "id": "breast-esophagus-34",
    "organ": "Özofagus",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 34 Gy",
    "endpoint": "Akut özofajit ve disfaji riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Esophagus (2010)",
    "context": "Supraklavikuler ve parasternal nodal alanlarda özofagus dozu kısıtlanır."
  },
  {
    "id": "breast-cord-45-48",
    "organ": "Spinal kord",
    "region": "toraks",
    "tumorSites": [
      "breast"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 45-48 Gy",
    "endpoint": "Radyasyon miyelopatisi",
    "priority": "hard",
    "alphaBeta": 2,
    "source": "QUANTEC Spinal Cord (2010)",
    "context": "Supraklavikuler lenf nodu ışınlamasında omurilik mutlak tavanı."
  },
  {
    "id": "lung-liver-dmean-30",
    "organ": "Karaciğer (Sağlam karaciğer)",
    "region": "toraks",
    "tumorSites": [
      "thorax-lung"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 30 Gy",
    "endpoint": "Radyasyon ilişkili karaciğer hastalığı (RILD)",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC Liver (2010)",
    "context": "Alt lob akciğer ve toraks lezyonlarında karaciğer ortalama dozu < 30 Gy tutulmalıdır."
  },
  {
    "id": "lung-spleen-dmean-10-15",
    "organ": "Dalak",
    "region": "toraks",
    "tumorSites": [
      "thorax-lung",
      "stomach-pancreas"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 10-15 Gy",
    "endpoint": "Hiposplenizm, trombositopeni ve immün disfonksiyon",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Thoracic & Abdominal Planning Guidelines",
    "context": "Sol alt lob toraks lezyonlarında ve üst batın planlarında dalak ortalama dozu sınırlanmalıdır."
  },
  {
    "id": "prostate-femur-v50-5",
    "organ": "Bilateral femur başları",
    "region": "pelvis",
    "tumorSites": [
      "prostate",
      "cervix-gyn",
      "rectum-bladder"
    ],
    "fractionation": "konvansiyonel",
    "metric": "V50Gy",
    "limit": "< 5%",
    "endpoint": "Femur başı avasküler nekrozu",
    "priority": "soft",
    "alphaBeta": 2,
    "source": "QUANTEC (2010)",
    "context": "V50Gy < %5 AVN riskini minimal seviyede tutar."
  },
  {
    "id": "gyn-broad-ligament",
    "organ": "Geniş ligaman (Broad ligament)",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50-55 Gy",
    "endpoint": "Pelvik parametrial fibrozis ve vasküler hasar",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "GYN RT Guidelines",
    "context": "Pelvik parametriyum ve ligaman dokularında normal doku toleransı korunmalıdır."
  },
  {
    "id": "gyn-uterus",
    "organ": "Uterus",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 50-55 Gy",
    "endpoint": "Myometrial nekroz ve fibrozis",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "GYN Planning Guidelines",
    "context": "Primer serviks dışındaki sağlam uterus myometriyumu korunmalıdır."
  },
  {
    "id": "gyn-vagina-d2cc-65-85",
    "organ": "Vajina",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "D2cc EQD2 α/β=3",
    "limit": "< 65-85 Gy EQD2",
    "endpoint": "Vajinal stenoz, disparoni ve mukozal nekroz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "EMBRACE II / ICRU 89",
    "context": "Alt ve orta vajina dozları kısıtlanmalı; dilatatör kullanımıyla kombine edilmelidir."
  },
  {
    "id": "gyn-vagina-dmean-40-50",
    "organ": "Vajina",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 40-50 Gy",
    "endpoint": "Vajinal stenoz önlenmesi",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "EMBRACE II Guidelines",
    "context": ""
  },
  {
    "id": "gyn-bone-marrow-v10-90",
    "organ": "Pelvik kemik iliği",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Pelvik V10Gy",
    "limit": "< 90%",
    "endpoint": "Grade >= 3 hematolojik toksisite (nötropeni/lökopeni) ve kemoterapi kesintisi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0418 / INTERLACE Protocol / EMBRACE",
    "context": "Eşzamanlı sisplatin alan hastalarda pelvik kemik iliği (iliak kanatlar, lumbosakral omurga, iskium/pubis) V10Gy < %90 tutulmalıdır."
  },
  {
    "id": "gyn-bone-marrow-v20-75",
    "organ": "Pelvik kemik iliği",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Pelvik V20Gy",
    "limit": "< 75%",
    "endpoint": "Şiddetli miyelosüpresyonun önlenmesi",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "RTOG 0418 / INTERLACE Protocol",
    "context": "Pelvik kemik iliği V20Gy < %75 hematolojik toleransı belirgin iyileştirir."
  },
  {
    "id": "gyn-ivc-dmax-60-65",
    "organ": "Vena kava inferior",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60-65 Gy",
    "endpoint": "Vena kava trombozu ve vasküler stenoz",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Retroperitoneal Vascular Guidelines",
    "context": "Paraaortik lenf nodu ışınlamasında retroperitoneal venöz dönüş korunmalıdır."
  },
  {
    "id": "gyn-aorta-dmax-60-65",
    "organ": "Abdominal aort",
    "region": "pelvis",
    "tumorSites": [
      "cervix-gyn"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60-65 Gy",
    "endpoint": "Aortik psödoanevrizma, vaskülit ve duvar nekrozu",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "Vascular OAR Guidelines",
    "context": "Paraaortik nodal ışınlamada aortik duvar dozu sınırlandırılmalıdır."
  },
  {
    "id": "upper-gi-aorta-60-65",
    "organ": "Abdominal aort",
    "region": "abdomen",
    "tumorSites": [
      "stomach-pancreas"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmax",
    "limit": "< 60-65 Gy",
    "endpoint": "Psödoanevrizma ve vasküler rüptür riski",
    "priority": "soft",
    "alphaBeta": 3,
    "source": "QUANTEC / AAPM TG-101",
    "context": "Pankreas ve mide ışınlamasında çölyak trunkus ve abdominal aort dozu sınırlanmalıdır."
  },
  {
    "id": "upper-gi-liver-28-30",
    "organ": "Karaciğer (Sağlam karaciğer)",
    "region": "abdomen",
    "tumorSites": [
      "stomach-pancreas"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 28-30 Gy",
    "endpoint": "Radyasyon ilişkili karaciğer hastalığı (RILD)",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Liver (2010)",
    "context": "Mide ve pankreas RT’sinde sağlam karaciğer parankiminin Dmean < 28-30 Gy tutulması şarttır."
  },
  {
    "id": "eso-heart-mean-26-30",
    "organ": "Kalp",
    "region": "toraks",
    "tumorSites": [
      "esophagus"
    ],
    "fractionation": "konvansiyonel",
    "metric": "Dmean",
    "limit": "< 26-30 Gy",
    "endpoint": "Perikardit, majör kardiyovasküler olaylar ve MI",
    "priority": "hard",
    "alphaBeta": 3,
    "source": "QUANTEC Cardiac (2010) / CROSS Trial",
    "context": "Özofagus kanseri RT’sinde kalp ortalama dozu Dmean < 26-30 Gy hedeflenmelidir (dar anatomik komşuluk)."
  }
];
