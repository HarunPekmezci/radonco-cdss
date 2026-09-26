import { SignIn } from '@clerk/nextjs';
import { Radiation, Target, ShieldCheck, Activity, CheckCircle2, Layers } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* HAFİF RADYASYON KOORDİNAT IZGARASI & AMBİYANS IŞIKLARI */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-blue-100/70 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-100/60 blur-[150px] pointer-events-none" />

      {/* ========================================================
          SOL PANEL: TIER-1 MEDİKAL İŞ İSTASYONU VİTRİNİ (7 Kolon)
      ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 xl:p-16 border-r border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/80 to-blue-50/40 backdrop-blur-xl">
        
        {/* Üst Kurumsal Logo & Akreditasyon Rozeti */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* KOYU OLMAYAN, AYDINLIK VE ŞIK RADYASYON SİMGESİ */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/90 border border-amber-300/60 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-500/10">
              <Radiation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  RadOncCDSS
                </h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                  Klinik Konsol
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Radiation Oncology Clinical Decision Support System
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            NCCN v1.2025 • ESTRO • ASTRO
          </div>
        </div>

        {/* Orta Bölüm: Orijinal İfade ve Zarif Medikal Vitrin */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md mb-4 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Kanıta Dayalı Karar Mimarisi
          </div>
          
          <h2 className="text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-[1.15] mb-3">
            Radyasyon Onkolojisi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
              Tedavi Karar Destek Platformu
            </span>
          </h2>
          
          <p className="text-sm text-slate-600 leading-relaxed font-normal mb-8">
            Primer tümör evresi ve klinik risk faktörlerine göre küratif SBRT/SRS, hipofraksiyonasyon ve OAR kısıtlarını anında yapılandıran canlı onkolojik karar konsolu.
          </p>

          {/* LÜKS SERAMİK BEYAZI DOZİMETRİ KARTI */}
          <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-5 shadow- backdrop-blur-md relative overflow-hidden">
            
            {/* Kart Üst Barı */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 tracking-wide">Doz-Hacim Güvenlik Zarfı (DVH)</div>
                  <div className="text-[10px] text-slate-400">Hedef Hacim ve Kritik Organ Toleransı</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> QUANTEC & HyTEC
              </span>
            </div>

            {/* Hassas DVH Çizimi (Gözü Yormayan Aydınlık Vektör) */}
            <div className="relative h-24 w-full bg-gradient-to-b from-slate-50/80 to-slate-100/40 rounded-xl p-2.5 border border-slate-100 mb-4 flex flex-col justify-between overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 360 80">
                <defs>
                  <linearGradient id="ptvAreaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Arka Plan Kılavuz Çizgileri */}
                <line x1="0" y1="20" x2="360" y2="20" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="50" x2="360" y2="50" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                <line x1="120" y1="0" x2="120" y2="80" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
                <line x1="260" y1="0" x2="260" y2="80" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />

                {/* PTV Alanı Dolgusu */}
                <path
                  d="M 0,10 Q 280,10 300,28 T 320,78 L 360,80 L 0,80 Z"
                  fill="url(#ptvAreaGlow)"
                />

                {/* PTV Eğrisi (Vurgulu Canlı Mavi) */}
                <path
                  d="M 0,10 Q 280,10 300,28 T 320,78 L 360,80"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                />

                {/* OAR Normal Doku Toleransı (Zarif Gri Kesikli) */}
                <path
                  d="M 0,26 Q 90,45 180,62 T 290,76 L 360,80"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.6"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 z-10 pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-blue-700"><span className="w-2.5 h-0.5 bg-blue-600 rounded-full" /> PTV Kapsamı (D95%)</span>
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-0.5 bg-slate-500 rounded-full" /> OAR Tolerans Sınırı</span>
                </div>
                <span className="font-mono text-slate-600">Reçete Dozu</span>
              </div>
            </div>

            {/* 3'lü Klinik Gösterge */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hedef Kapsamı</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">D95% ≥ Reçete</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal Doku Kısıtı</div>
                <div className="text-xs font-black text-blue-600 mt-0.5">QUANTEC Sınırı</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biyolojik Modelleme</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">BED₁₀ / EQD₂</div>
              </div>
            </div>

          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/80 pt-4">
          <span>© 2026 RadOncCDSS • Çok Disiplinli Karar Mimarisi</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Kurumsal Hekim Portalı
          </span>
        </div>
      </div>

      {/* ========================================================
          SAĞ PANEL: KUSURSUZ ENTEGRE EDİLMİŞ GİRİŞ ALANI (5 Kolon)
      ======================================================== */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 relative z-10 bg-gradient-to-b from-slate-50/60 to-slate-100/40">
        
        {/* Mobil Başlık */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Radiation className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">RadOncCDSS</h1>
            <p className="text-[11px] text-slate-500 font-medium">Tedavi Karar Destek Platformu</p>
          </div>
        </div>

        {/* Apple / Linear Tarzı Buzlu Seramik Çerçeveli Giriş Kartı */}
        <div className="w-full max-w-[400px] rounded-3xl bg-white/90 border border-slate-200/90 p-2.5 shadow- backdrop-blur-xl">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
          Erişim yalnızca yetkili hekimler ve radyasyon onkolojisi uzmanları içindir.
        </div>
      </div>

    </div>
  );
}