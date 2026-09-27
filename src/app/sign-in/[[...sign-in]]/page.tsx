import { SignIn } from '@clerk/nextjs';
import { Radiation, ShieldCheck, Activity } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex font-sans">
      
      {/* ==============================================================
          1. SOL SÜTUN (YALNIZCA MASAÜSTÜNDE GÖRÜNÜR - SPLIT HERO EKRANI)
         ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-slate-800/80 bg-[#0a101d] bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_70%)] relative overflow-hidden">
        
        {/* Üst Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
            <Radiation className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block">RadOnc CDSS</span>
            <span className="text-[11px] text-slate-400 font-medium">Klinik Karar Destek Platformu</span>
          </div>
        </div>

        {/* Orta Başlık & Dozimetri Grafiği */}
        <div className="my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Yetkili Onkoloji Hekimleri İçin
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Radyasyon Onkolojisi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Tedavi Karar Destek
            </span> <br />
            Platformu
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed font-normal">
            Klinik evreleme, fraksiyonasyon felsefesi ve ICRU 83 / QUANTEC dozimetrik güvenlik kısıtları.
          </p>

          {/* Doz Eğrisi (DVH Eğrisi Görseli) */}
          <div className="mt-8 p-5 rounded-2xl bg-[#0e1726]/80 border border-slate-800 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-mono">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Activity className="w-4 h-4" /> PTV D95% Kapsamı
              </span>
              <span className="text-emerald-400">OAR Toleransı: Güvenli</span>
            </div>
            {/* SVG Doz-Hacim Eğrisi */}
            <svg viewBox="0 0 300 60" className="w-full h-14 overflow-visible">
              <path
                d="M 0 10 Q 180 12 220 18 T 260 55 L 300 58"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              />
              <path
                d="M 0 35 Q 120 38 180 48 T 260 56 L 300 58"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
              <span>0 Gy</span>
              <span>Reçete Dozu (EQD2)</span>
              <span>Dmax Limit</span>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="text-xs text-slate-500 font-medium">
          Kayseri Şehir Eğitim ve Araştırma Hastanesi • NCCN v1.2025 Standartları
        </div>
      </div>

      {/* ==============================================================
          2. SAĞ SÜTUN (MASAÜSTÜNDE SAĞDA, MOBİLDE TAM EKRAN ORTADA)
         ============================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen">
        
        {/* Yalnızca Mobilde Görünen Üst Logo */}
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md mb-2.5">
            <Radiation className="w-7 h-7 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">RadOnc CDSS</span>
          <span className="text-xs text-slate-400 mt-0.5">Klinik Karar Destek Sistemi</span>
        </div>

        {/* Clerk Giriş Kartı */}
        <div className="w-full max-w-[420px] flex justify-center">
          <SignIn
            appearance={{
              elements: {
                // GOOGLE BUTONUNU VE "OR" AYIRICISINI ZORLA YOK ET
                socialButtons: '!hidden',
                socialButtonsBlockButton: '!hidden',
                socialButtonsProviderIcon: '!hidden',
                socialButtonsIconButton: '!hidden',
                dividerRow: '!hidden',
                dividerText: '!hidden',
                
                // CLERK LOGOSUNU GİZLE
                footer: '!hidden',
                footerAction: '!hidden',

                // MODERN KOYU TEMA KARTI
                card: 'bg-[#0e1726] border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full',
                headerTitle: 'text-white font-bold text-lg text-center',
                headerSubtitle: 'text-slate-400 text-xs text-center mb-4',
                
                // İNPUT ALANLARI
                formFieldLabel: 'text-xs font-semibold text-slate-300',
                formFieldInput: 'bg-[#131f33] border border-slate-700 text-white rounded-xl py-2.5 px-3.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500',
                
                // GİRİŞ BUTONU
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 w-full mt-2 normal-case transition-all',
              },
            }}
          />
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          🔒 256-Bit Şifreli Altyapı • Yalnızca Yetkili Hekimler İçindir
        </div>
      </div>

    </div>
  );
}