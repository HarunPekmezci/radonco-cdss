const fs = require('fs');

let pageContent = fs.readFileSync('src/app/doz-kisitlari/page.tsx', 'utf-8');

const filteredItemsBlock = `
  const filteredItems = useMemo(() => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const terms = query.trim().toLocaleLowerCase(locale).split(/\\s+/).filter(Boolean);
    return oarConstraintsData.filter(item => {
      if (!regionMatches(region, item.region) || !fractionationMatches(fractionation, item.fractionation)) return false;
      const searchable = [
        item.organ,
        organLabel(item.organ, language),
        item.metric,
        item.limit,
        item.endpoint,
        item.source,
        item.context,
        fractionationLabel(item.fractionation, language),
      ].join(' ').toLocaleLowerCase(locale);
      return terms.every(term => searchable.includes(term));
    });
  }, [fractionation, language, query, region]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, typeof filteredItems[0] & { metricsList: { metric: string, limit: string }[] }>();
    for (const item of filteredItems) {
      const key = item.organ + '|' + item.fractionation;
      if (!map.has(key)) {
        map.set(key, { ...item, metricsList: [] });
      }
      map.get(key)!.metricsList.push({ metric: item.metric, limit: item.limit });
    }
    return Array.from(map.values());
  }, [filteredItems]);`;

pageContent = pageContent.replace(/  const filteredItems = useMemo\(\(\) => \{[\s\S]*?\}, \[fractionation, language, query, region\]\);/, filteredItemsBlock.trim());

const renderBlockOld = `
          <p className="mt-4 text-xs text-slate-400" aria-live="polite">
            {language === 'en'
              ? \`Showing \${filteredItems.length} records\`
              : \`\${filteredItems.length} kayıt gösteriliyor\`}
          </p>
        </section>

        {filteredItems.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredItems.map(item => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 transition hover:border-slate-700 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{organLabel(item.organ, language)}</h2>
                    <span className="mt-1 inline-flex rounded border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200">NTCP ceiling</span>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{fractionationLabel(item.fractionation, language)} · α/β {item.alphaBeta ?? '—'}</p>
                  </div>
                  <span className={\`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold \${item.priority === 'hard' ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}\`}>
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    {item.priority === 'hard'
                      ? (language === 'en' ? 'Mandatory · Hard' : 'Zorunlu · Hard')
                      : 'Optimal · Soft'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {language === 'en' ? 'Dose Metric' : 'Dozimetrik Kriter'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-cyan-200">{item.metric}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="text-rose-300">{language === 'en' ? 'NTCP Ceiling' : 'NTCP Tavan Sınırı'}</span>
                    </div>
                    <div className="mt-1 max-w-64 text-sm font-bold text-white">{item.limit}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5">
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Clinical endpoint: ' : 'Klinik endpoint: '}</span>
                    <span className="text-slate-400">{item.endpoint}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Context: ' : 'Bağlam: '}</span>
                    <span className="text-slate-400">{item.context}</span>
                  </p>
                  <p className="text-slate-400">
                    {language === 'en' ? 'Source: ' : 'Kaynak: '}
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:text-sky-200">{item.source}</a>
                    ) : item.source}
                  </p>
                </div>

                <Link
                  href={{
                    pathname: '/doz-hesaplayici',
                    query: { organ: item.organ, metric: item.metric, limit: item.limit, fractionation: item.fractionation },
                  }}`;

const renderBlockNew = `
          <p className="mt-4 text-xs text-slate-400" aria-live="polite">
            {language === 'en'
              ? \`Showing \${groupedItems.length} records\`
              : \`\${groupedItems.length} kayıt gösteriliyor\`}
          </p>
        </section>

        {groupedItems.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {groupedItems.map(item => (
              <article key={item.id + item.fractionation} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 transition hover:border-slate-700 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{organLabel(item.organ, language)}</h2>
                    <span className="mt-1 inline-flex rounded border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200">NTCP ceiling</span>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{fractionationLabel(item.fractionation, language)} · α/β {item.alphaBeta ?? '—'}</p>
                  </div>
                  <span className={\`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold \${item.priority === 'hard' ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}\`}>
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    {item.priority === 'hard'
                      ? (language === 'en' ? 'Mandatory · Hard' : 'Zorunlu · Hard')
                      : 'Optimal · Soft'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-[#0a0f1d] p-3">
                  <div className="flex justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{language === 'en' ? 'Dose Metric' : 'Dozimetrik Kriter'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">{language === 'en' ? 'NTCP Ceiling' : 'NTCP Tavan Sınırı'}</span>
                  </div>
                  {item.metricsList.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="font-semibold text-sky-400 text-sm">{m.metric}</span>
                      <span className="font-mono font-bold text-slate-100 text-sm max-w-64 text-right">{m.limit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5">
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Clinical endpoint: ' : 'Klinik endpoint: '}</span>
                    <span className="text-slate-400">{item.endpoint}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-300">{language === 'en' ? 'Context: ' : 'Bağlam: '}</span>
                    <span className="text-slate-400">{item.context}</span>
                  </p>
                  <p className="text-slate-400">
                    {language === 'en' ? 'Source: ' : 'Kaynak: '}
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:text-sky-200">{item.source}</a>
                    ) : item.source}
                  </p>
                </div>

                <Link
                  href={{
                    pathname: '/doz-hesaplayici',
                    query: { organ: item.organ, metric: item.metricsList[0].metric, limit: item.metricsList[0].limit, fractionation: item.fractionation },
                  }}`;

pageContent = pageContent.replace(renderBlockOld, renderBlockNew);
fs.writeFileSync('src/app/doz-kisitlari/page.tsx', pageContent, 'utf-8');
console.log('UI updated.');
