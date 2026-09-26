import { SignIn } from '@clerk/nextjs';
import { Radiation, Layers, Zap, Shield } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#060a12] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* SOL PANEL: RADYASYON ONKOLOJİSİ KLİNİK KİMLİK (7 KOLON) */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-[#060a12] via-[#0b1324] to-[#081938]">
        {/* Üst Rozet ve Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            NCCN v1.2025 • ESTRO • ASTRO • DEGRO
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radiation className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">RadOnc CDSS</h1>
              <p className="text-xs text-slate-400 font-medium">Radiation Oncology Clinical Decision Support System</p>
            </div>
          </div>
        </div>

        {/* Orta Başlık: 2. ALTERNATİF AKADEMİK METİNLER */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2 tracking-tight">
            Radyasyon Onkolojisi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              Tedavi Karar Destek Platformu
            </span>
          </h2>
          <p className="text-xs font-semibold text-blue-400/90 tracking-wide uppercase mb-4">
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

        {/* Alt Sorumluluk Notu */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-4">
          <span>© 2026 RadOnc CDSS Platformu</span>
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Kurumsal Hekim Portalı</span>
        </div>
      </div>

      {/* SAĞ PANEL: CLERK GİRİŞ FORMU (5 KOLON) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-10 bg-[#070b14]">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Radiation className="w-6 h-6 text-amber-400" />
            <span className="text-lg font-bold text-white">RadOnc CDSS</span>
          </div>

          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#0d1527',
                colorText: '#f8fafc',
                colorTextSecondary: '#94a3b8',
                colorInputBackground: '#131e36',
                colorInputText: '#ffffff',
              },
              elements: {
                card: 'border border-slate-800 shadow-2xl bg-[#0d1527]/95 backdrop-blur-xl rounded-2xl w-full',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-slate-400 text-xs',
                socialButtonsBlockButton: 'bg-[#131e36] border border-slate-700/80 text-white hover:bg-[#1a2947] transition',
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25',
                formFieldInput: 'border-slate-700 focus:border-blue-500 bg-[#131e36] text-white',
                footerActionLink: 'text-blue-400 hover:text-blue-300 font-medium',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}