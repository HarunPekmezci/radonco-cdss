import { SignIn } from '@clerk/nextjs';
import { Radiation, Shield, Activity, Target, CheckCircle2 } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* HAFİF MİMARİ ARKA PLAN DOKUSU & IŞIKLARI */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-[140px] pointer-events-none" />

      {/* ========================================================
          SOL PANEL: AYDINLIK MEDİKAL İŞ İSTASYONU (7 Kolon)
      ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 xl:p-16 border-r border-slate-200/90 bg-gradient-to-br from-white/90 via-slate-50/70 to-blue-50/30 backdrop-blur-md">
        
        {/* Üst Kurumsal Logo & Akreditasyon */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-md">
              <Radiation className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                RadOncCDSS
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Radiation Oncology Clinical Decision Support System
              </p>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-600 border border-slate-200/80 px-3 py-1 rounded-full bg-white/80 shadow-sm">
            NCCN v1.2025 • ESTRO • ASTRO
          </div>
        </div>

        {/* Orta Bölüm: İstediğiniz Orijinal Başlık ve Açıklama */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Kanıta Dayalı Klinik Karar Mimarisi
          </div>
          
          <h2 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-[1.2] mb-3">
            Radyasyon Onkolojisi <br />
            <span className="text-blue-600">Tedavi Karar Destek Platformu</span>
          </h2>
          
          <p className="text-sm text-slate-600 leading-relaxed font-normal mb-8">
            Primer tümör evresi ve klinik risk faktörlerine göre küratif SBRT/SRS, hipofraksiyonasyon ve OAR kısıtlarını anında yapılandıran canlı onkolojik karar konsolu.
          </p>

          {/* APPLE & HEALTHINEERS TARZI BEYAZ MEDİKAL DOZİMETRİ KARTI */}
          <div className="w-full rounded-2xl bg-white/95 border border-slate-200/90 p-5 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.06)] backdrop-blur-md">
            
            {/* Kart Başlığı */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">Doz-Hacim Kısıtları & Güvenlik Zarfı</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> QUANTEC & HyTEC Uyumlu
              </span>
            </div>

            {/* Hassas Aydınlık DVH Vektörü */}
            <div className="relative h-24 w-full bg-slate-50/70 rounded-xl p-2 border border-slate-100 mb-3 flex flex-col justify-between overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 360 80">
                <defs>
                  <linearGradient id="ptvLightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Arka Plan Kılavuz Çizgileri */}
                <line x1="0" y1="20" x2="360" y2="20" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="360" y2="50" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* PTV Alanı Dolgusu */}
                <path
                  d="M 0,10 Q 280,10 300,28 T 320,78 L 360,80 L 0,80 Z"
                  fill="url(#ptvLightGradient)"
                />

                {/* PTV Eğrisi (Derin Kobalt) */}
                <path
                  d="M 0,10 Q 280,10 300,28 T 320,78 L 360,80"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />

                {/* OAR 1 Eğrisi (Slate) */}
                <path
                  d="M 0,25 Q 100,42 190,60 T 300,76 L 360,80"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 z-10 pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-blue-700 font-semibold"><span className="w-2 h-0.5 bg-blue-600 rounded" /> PTV Kapsamı</span>
                  <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-0.5 bg-slate-500 rounded" /> Normal Doku Toleransı</span>
                </div>
                <span>Doz Eşitlemesi</span>
              </div>
            </div>

            {/* 3'lü Klinik Gösterge */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Hedef Kapsamı</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">D95% ≥ Reçete</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Kritik Organlar</div>
                <div className="text-xs font-bold text-blue-600 mt-0.5">QUANTEC Sınırları</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Radyobiyoloji</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">BED₁₀ / EQD₂</div>
              </div>
            </div>

          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/80 pt-4">
          <span>© 2026 RadOncCDSS • Çok Disiplinli Klinik Karar Mimarisi</span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Kurumsal Hekim Portalı
          </span>
        </div>
      </div>

      {/* ========================================================
          SAĞ PANEL: UYUMLU, LÜKS SERAMİK GİRİŞ ALANI (5 Kolon)
      ======================================================== */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 relative z-10 bg-slate-50/50">
        
        {/* Mobil Başlık */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400">
            <Radiation className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">RadOncCDSS</h1>
            <p className="text-[11px] text-slate-500 font-medium">Tedavi Karar Destek Platformu</p>
          </div>
        </div>

        {/* Apple Tarzı Çerçeveli Clerk Kartı */}
        <div className="w-full max-w-[400px] rounded-3xl bg-white border border-slate-200/90 p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 max-w-xs leading-relaxed">
          Erişim yalnızca yetkili hekimler ve radyasyon onkolojisi uzmanları içindir.
        </div>
      </div>

    </div>
  );
}