import { SignIn } from '@clerk/nextjs';
import { Radiation, Activity, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#050811] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* ARKA PLAN AMBİYANS IŞIKLARI (FOTON HUZMELERİ) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* ========================================================
          SOL KOLON: MEDİKAL İŞ İSTASYONU VİTRİNİ & DVH GÖRSELİ (7 Kolon)
      ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-10 xl:p-14 border-r border-slate-800/80 bg-gradient-to-br from-[#060a14]/90 via-[#0a1224]/80 to-[#071329]/90 backdrop-blur-xl">
        
        {/* Üst Logo & Konsensüs Rozeti */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 shadow-">
              <Radiation className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">RadOnc CDSS</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Radiation Oncology Clinical Decision Support System</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs font-semibold backdrop-blur shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            NCCN v1.2025 • ESTRO • ASTRO
          </div>
        </div>

        {/* Orta Başlık & Dozimetri Görsel Paneli */}
        <div className="relative z-10 my-auto py-6">
          <div className="inline-block text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2">
            Klinik İş İstasyonu & Dozimetri Mimarisi
          </div>
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3 tracking-tight">
            Radyasyon Onkolojisi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              Tedavi Karar Destek Platformu
            </span>
          </h2>
          <p className="text-xs xl:text-sm text-slate-300 leading-relaxed max-w-xl mb-6 font-normal">
            Primer tümör evresi ve risk faktörlerine göre küratif SBRT/SRS, hipofraksiyonasyon ve OAR kısıtlarını anında yapılandıran canlı onkolojik karar motoru.
          </p>

          {/* === GÖRSEL DOZ-HACİM (DVH) & İZODOZ KARTI === */}
          <div className="w-full max-w-xl rounded-2xl bg-[#0b1325]/90 border border-slate-800 p-5 shadow-2xl shadow-black/60 relative overflow-hidden group hover:border-slate-700 transition">
            
            {/* Kart Üst Başlık */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">Doz-Hacim Histogramı (DVH) & Dozimetri Özeti</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> QUANTEC Uyumlu
              </span>
            </div>

            {/* Vektörel DVH Simülasyon Grafiği */}
            <div className="relative h-28 w-full bg-[#070d1a] rounded-lg p-2 border border-slate-800/60 flex flex-col justify-between">
              {/* Doz Izgarası (Grid) */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-15 pointer-events-none">
                <div className="border-r border-b border-slate-400" />
                <div className="border-r border-b border-slate-400" />
                <div className="border-r border-b border-slate-400" />
                <div className="border-r border-b border-slate-400" />
                <div className="border-r border-b border-slate-400" />
                <div className="border-b border-slate-400" />
              </div>

              {/* DVH Eğrileri (SVG) */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                {/* PTV Eğrisi (Kırmızı / Magenta) */}
                <path
                  d="M 0,5 Q 240,5 260,20 T 280,95 L 300,100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                />
                {/* Mesane / Bladder OAR (Sarı) */}
                <path
                  d="M 0,25 Q 80,45 160,75 T 260,95 L 300,100"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="1.8"
                  opacity="0.85"
                />
                {/* Rektum / OAR (Mavi / Cyan) */}
                <path
                  d="M 0,35 Q 60,65 140,85 T 240,98 L 300,100"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.8"
                  opacity="0.85"
                />
              </svg>

              {/* Grafik Alt Lejantı */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 z-10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-red-400 font-semibold"><span className="w-2 h-0.5 bg-red-500 rounded" /> PTV D95%</span>
                  <span className="flex items-center gap-1 text-yellow-400"><span className="w-2 h-0.5 bg-yellow-400 rounded" /> OAR 1</span>
                  <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-0.5 bg-cyan-400 rounded" /> OAR 2</span>
                </div>
                <span>100% Reçete Dozu (EQD2)</span>
              </div>
            </div>

            {/* Alt İki Metrik Kartı */}
            <div className="grid grid-cols-3 gap-2.5 mt-3">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Biyolojik Modelleme</div>
                <div className="text-xs font-bold text-white mt-0.5 font-mono">BED₁₀ / EQD₂</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Kritik Organ Kısıtları</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5 font-mono">QUANTEC / HyTEC</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Kapsam</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">13 Organ + Benign</div>
              </div>
            </div>

          </div>
        </div>

        {/* Alt Sorumluluk Notu */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>© 2026 RadOnc CDSS • Çok Disiplinli Klinik Karar Mimarisi</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Kurumsal Hekim Ağı
          </span>
        </div>
      </div>

      {/* ========================================================
          SAĞ KOLON: KUSURSUZ ENTEGRE CLERK GİRİŞ ALANI (5 Kolon)
      ======================================================== */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10 bg-[#050811]">
        
        {/* Mobil Başlık */}
        <div className="lg:hidden flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radiation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">RadOnc CDSS</h1>
            <p className="text-[11px] text-slate-400">Radyasyon Onkolojisi Karar Destek</p>
          </div>
        </div>

        {/* Clerk Giriş Kartı */}
        <div className="w-full max-w-[400px]">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Alt Güvenlik İbaresi */}
        <div className="mt-8 text-center text-[11px] text-slate-500 max-w-xs leading-relaxed">
          Erişim yalnızca yetkili hekimler ve radyasyon onkologları içindir.
        </div>
      </div>

    </div>
  );
}