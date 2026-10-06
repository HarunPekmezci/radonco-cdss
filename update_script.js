const fs = require('fs');

// --- 1. Update page.tsx for Grouping ---
let pageContent = fs.readFileSync('src/app/doz-kisitlari/page.tsx', 'utf-8');

const filteredItemsMemoEnd = `    });
  }, [fractionation, language, query, region]);`;

const groupedItemsCode = `

  const groupedItems = useMemo(() => {
    const map = new Map<string, any>();
    for (const item of filteredItems) {
      const key = item.organ + '|' + item.fractionation;
      if (!map.has(key)) {
        map.set(key, { ...item, metricsList: [] });
      }
      map.get(key).metricsList.push({ metric: item.metric, limit: item.limit });
    }
    return Array.from(map.values());
  }, [filteredItems]);`;

if (!pageContent.includes('const groupedItems')) {
  pageContent = pageContent.replace(filteredItemsMemoEnd, filteredItemsMemoEnd + groupedItemsCode);
  pageContent = pageContent.replace(/filteredItems\.length/g, 'groupedItems.length');
  pageContent = pageContent.replace(/filteredItems\.map/g, 'groupedItems.map');

  const oldMetricBlockRegex = /<div className="mt-4 grid grid-cols-\[minmax\(0,1fr\)_auto\] items-end gap-3 rounded-xl border border-slate-800 bg-\[#0a0f1d\] p-3">[\s\S]*?<\/div>\s*<\/div>/;

  const newMetricBlock = `<div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
                  <div className="flex justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{language === 'en' ? 'Dose Metric' : 'Dozimetrik Kriter'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">{language === 'en' ? 'NTCP Ceiling' : 'NTCP Tavan Sınırı'}</span>
                  </div>
                  {item.metricsList.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="font-semibold text-sky-400 text-sm">{m.metric}</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">{m.limit}</span>
                    </div>
                  ))}
                </div>`;

  pageContent = pageContent.replace(oldMetricBlockRegex, newMetricBlock);
  fs.writeFileSync('src/app/doz-kisitlari/page.tsx', pageContent, 'utf-8');
  console.log('page.tsx updated.');
}

// --- 2. Update oarConstraintsData.ts for Thoracic Hypofractionation ---
let dataContent = fs.readFileSync('src/data/oarConstraintsData.ts', 'utf-8');

const newThoraxItems = `
  // === THORAX (HYPOFRACTIONATION) ===
  {
    id: 'thorax-lungs-v20-hypo',
    organ: 'Bilateral Akciğer (GTV hariç)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'V20Gy',
    limit: 'V20Gy < 25-28%',
    endpoint: 'Semptomatik radyasyon pnömonisi < 10-15%',
    priority: 'hard',
    alphaBeta: 3,
    source: 'QUANTEC / Moderate HypoThorax trials',
    context: '',
  },
  {
    id: 'thorax-lungs-mean-hypo',
    organ: 'Bilateral Akciğer (GTV hariç)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmean',
    limit: 'Dmean < 15-18 Gy',
    endpoint: 'Semptomatik radyasyon pnömonisi < 10-15%',
    priority: 'hard',
    alphaBeta: 3,
    source: 'QUANTEC / Moderate HypoThorax trials',
    context: '',
  },
  {
    id: 'thorax-lungs-v5-hypo',
    organ: 'Bilateral Akciğer (GTV hariç)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'V5Gy',
    limit: 'V5Gy < 55%',
    endpoint: 'Semptomatik radyasyon pnömonisi < 10-15%',
    priority: 'hard',
    alphaBeta: 3,
    source: 'QUANTEC / Moderate HypoThorax trials',
    context: '',
  },
  {
    id: 'thorax-spinal-cord-hypo',
    organ: 'Spinal Kord',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmax',
    limit: 'Dmax < 40-42 Gy (EQD2 < 45-50 Gy)',
    endpoint: 'Miyelopati',
    priority: 'hard',
    alphaBeta: 2,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-heart-mean-hypo',
    organ: 'Kalp (Heart)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmean',
    limit: 'Dmean < 15-20 Gy',
    endpoint: 'Perikardit & major kardiyak yan etkiler',
    priority: 'hard',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-heart-v30-hypo',
    organ: 'Kalp (Heart)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'V30Gy',
    limit: 'V30Gy < 30%',
    endpoint: 'Perikardit & major kardiyak yan etkiler',
    priority: 'hard',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-heart-v40-hypo',
    organ: 'Kalp (Heart)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'V40Gy',
    limit: 'V40Gy < 20%',
    endpoint: 'Perikardit & major kardiyak yan etkiler',
    priority: 'hard',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-esophagus-mean-hypo',
    organ: 'Özofagus (Esophagus)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmean',
    limit: 'Dmean < 25-30 Gy',
    endpoint: 'Grade >= 2 akut/geç özofajit',
    priority: 'soft',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-esophagus-max-hypo',
    organ: 'Özofagus (Esophagus)',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmax',
    limit: 'Dmax < 50-52 Gy',
    endpoint: 'Grade >= 2 akut/geç özofajit',
    priority: 'soft',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-brachial-hypo',
    organ: 'Brakial Pleksus',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmax',
    limit: 'Dmax < 50-52 Gy',
    endpoint: 'Pleksopati',
    priority: 'soft',
    alphaBeta: 2,
    source: 'Clinical Guidelines',
    context: '',
  },
  {
    id: 'thorax-bronchial-tree-hypo',
    organ: 'Proksimal Bronşiyal Ağaç & Ana Karina',
    region: 'toraks',
    fractionation: 'hipofraksiyon',
    metric: 'Dmax',
    limit: 'Dmax < 52-55 Gy',
    endpoint: 'Ciddi darlık / bronşiyal nekroz',
    priority: 'soft',
    alphaBeta: 3,
    source: 'Clinical Guidelines',
    context: '',
  },
`;

if (!dataContent.includes('thorax-lungs-v20-hypo')) {
  const arrayStartMarker = "export const oarConstraintsData: OARNTPCeiling[] = [";
  const idx = dataContent.indexOf(arrayStartMarker) + arrayStartMarker.length;
  dataContent = dataContent.slice(0, idx) + newThoraxItems + dataContent.slice(idx);
  fs.writeFileSync('src/data/oarConstraintsData.ts', dataContent, 'utf-8');
  console.log('oarConstraintsData.ts updated.');
}
