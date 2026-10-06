const fs = require('fs');

let file = fs.readFileSync('src/app/doz-kisitlari/page.tsx', 'utf-8');

// 1. Insert groupedItems useMemo after filteredItems useMemo
const filteredItemsMemoEnd = `    });
  }, [fractionation, language, query, region]);`;

const groupedItemsCode = `

  const groupedItems = useMemo(() => {
    const map = new Map();
    for (const item of filteredItems) {
      const key = item.organ + '|' + item.fractionation;
      if (!map.has(key)) {
        map.set(key, { ...item, metricsList: [] });
      }
      map.get(key).metricsList.push({ metric: item.metric, limit: item.limit });
    }
    return Array.from(map.values());
  }, [filteredItems]);`;

file = file.replace(filteredItemsMemoEnd, filteredItemsMemoEnd + groupedItemsCode);

// 2. Change filteredItems.length to groupedItems.length
file = file.replace(/filteredItems\.length/g, 'groupedItems.length');

// 3. Change filteredItems.map to groupedItems.map
file = file.replace(/filteredItems\.map/g, 'groupedItems.map');

// 4. Update the card metric rendering block
const oldMetricBlockRegex = /<div className="mt-4 grid grid-cols-\[minmax\(0,1fr\)_auto\] items-end gap-3 rounded-xl border border-slate-800 bg-\[#0a0f1d\] p-3">[\s\S]*?<\/div>\s*<\/div>/;

const newMetricBlock = `<div className="mt-4 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3 space-y-2">
                  {item.metricsList.map((m: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-4 py-1 border-b border-slate-800/60 last:border-0">
                      <span className="font-semibold text-cyan-200 text-sm">{m.metric}</span>
                      <span className="font-bold text-white text-sm text-right">{m.limit}</span>
                    </div>
                  ))}
                </div>`;

file = file.replace(oldMetricBlockRegex, newMetricBlock);

fs.writeFileSync('src/app/doz-kisitlari/page.tsx', file, 'utf-8');
console.log('Update page.tsx complete');
