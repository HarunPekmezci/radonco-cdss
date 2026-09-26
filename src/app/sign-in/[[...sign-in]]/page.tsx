import { SignIn } from '@clerk/nextjs';
import { Radiation, Shield, Activity, Target } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#060913] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* İNCE AMBİYANS IŞIKLARI (RADYASYON ALANI DERİNLİĞİ) */}
      <div className="absolute top-[-25%] left-[-15%] w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] rounded-full bg-indigo-600/5 blur-[160px] pointer-events-none" />

      {/* ========================================================
          SOL KOLON: KLİNİK KARAR DESTEK İŞ İSTASYONU (7 Kolon)
      ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 xl:p-16 border-r border-slate-800/60 bg-gradient-to-br from-[#060913] via-[#090e1c] to-[#071126]">
        
        {/* Üst Kurumsal Kimlik */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
              <Radiation className="w-5 h-5 text-amber-400/90" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                RadOnc CDSS
              </h1>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide">
                Radiation Oncology Clinical Decision Support System
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 tracking-wider border border-slate-800 px-3 py-1 rounded bg-slate-900/40">
            NCCN • ESTRO • ASTRO
          </div>
        </div>

        {/* Orta Bölüm: Ağırbaşlı Tipografi ve Hassas Dozimetri Çerçevesi */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="flex items-center gap-2 text-[11px] font-mono text-blue-400 tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Klinik Kanıt Temelli Tedavi Çerçevesi
          </div>
          
          <h2 className="text-3xl xl:text-4xl font-semibold text-white tracking-tight leading-[1.2] mb-4">
            Klinik Evrelemeden <br />
            <span className="text-slate-400 font-normal">
              Fraksiyonasyon ve Doz Kısıtlarına.
            </span>
          </h2>
          
          <p className="text-sm text-slate-400 leading-relaxed font-normal mb-8">
            Uluslararası konsensüs kılavuzları ve randomize faz III çalışmalar doğrultusunda yapılandırılmış anatomik hedef hacimler, fraksiyonasyon şemaları ve normal doku güvenlik limitleri.
          </p>

          {/* HASSAS MEDİKAL VEKTÖR KARTI (DOZİMETRİK GÜVENLİK ZARFI) */}
          <div className="w-full rounded-xl bg-slate-900/40 border border-slate-800/80 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4 text-xs font-mono">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                Dozimetrik Güvenlik ve Tolerans Zarfı
              </span>
              <span className="text-slate-500 text-[11px]">QUANTEC / HyTEC Standartları</span>
            </div>

            {/* Hassas Saç Teli İnceliğinde İzodoz Grafiği */}
            <div className="relative h-20 w-full mb-4">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 80">
                {/* İnce Kılavuz Izgarası */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="100" y1="0" x2="100" y2="80" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="250" y1="0" x2="250" y2="80" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="330" y1="0" x2="330" y2="80" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* Hedef Hacim Kapsamı (PTV) */}
                <path
                  d="M 0,8 Q 320,8 340,30 T 360,78 L 400,80"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                />
                {/* Riskli Organ Toleransı (OAR) */}
                <path
                  d="M 0,22 Q 120,40 220,62 T 330,76 L 400,80"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            {/* 3'lü Klinik Gösterge */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800/60 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Hedef Kapsamı</div>
                <div className="font-semibold text-slate-200 mt-0.5">D95% ≥ Reçete</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Normal Doku Kısıtı</div>
                <div className="font-semibold text-slate-200 mt-0.5">Organ Toleransı (OAR)</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Biyolojik Modelleme</div>
                <div className="font-semibold text-slate-200 mt-0.5">BED₁₀ / EQD₂ Eşitlemesi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kurumsal Dipnot */}
        <div className="relative z-10 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-4">
          <span>© 2026 RadOnc CDSS Platformu</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Yalnızca Yetkili Sağlık Profesyonelleri
          </span>
        </div>
      </div>

      {/* ========================================================
          SAĞ KOLON: KARANLIK VE ENTEGRE EDİLMİŞ GİRİŞ ALANI (5 Kolon)
      ======================================================== */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 relative z-10 bg-[#060913]">
        
        {/* Mobil Başlık */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Radiation className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">RadOnc CDSS</h1>
            <p className="text-[10px] text-slate-400 font-mono">Klinik Karar Destek Sistemi</p>
          </div>
        </div>

        {/* Koyu Temalı, Zarif Çerçeveli Clerk Kartı Kapsayıcısı */}
        <div className="w-full max-w-[390px] rounded-2xl bg-slate-900/30 border border-slate-800/80 p-1 shadow-2xl backdrop-blur-md">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="mt-8 text-center text-[11px] font-mono text-slate-500 max-w-xs leading-relaxed">
          Sistem erişimi ve hasta verisi güvenliği KVKK ve kurumsal bilgi güvenliği standartlarına tabidir.
        </div>
      </div>

    </div>
  );
}