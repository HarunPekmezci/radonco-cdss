{/* Orta Metin ve Medikal Özellikler */}
<div className="relative z-10 max-w-xl my-auto py-8">
  <h2 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-tight">
    Radyasyon Onkolojisi <br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
      Tedavi Karar Destek Platformu
    </span>
  </h2>
  <p className="text-xs font-semibold text-blue-400/90 tracking-wide uppercase mb-3">
    Kılavuz Konsensüsleri ve Landmark Klinik Kanıtlar Ekseninde
  </p>
  <p className="text-sm text-slate-300 leading-relaxed mb-6">
    Primer tümör evresi ve klinik risk faktörlerine göre küratif SBRT/SRS, hipofraksiyonasyon ve konvansiyonel fraksiyonasyon protokollerinin yapılandırılmış klinik özeti.
  </p>

  <div className="grid grid-cols-2 gap-3.5">
    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
      <Layers className="w-5 h-5 text-blue-400 mb-2" />
      <div className="text-xs font-bold text-white">Doz-Hacim Kısıtları & OAR</div>
      <div className="text-[11px] text-slate-400 mt-0.5">QUANTEC, HyTEC ve EMBRACE II tolerans sınırları</div>
    </div>
    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
      <Zap className="w-5 h-5 text-amber-400 mb-2" />
      <div className="text-xs font-bold text-white">Radyobiyoloji (BED & EQD2)</div>
      <div className="text-[11px] text-slate-400 mt-0.5">Dokuya özgü α/β ile lineer-kuadratik modelleme</div>
    </div>
  </div>
</div>