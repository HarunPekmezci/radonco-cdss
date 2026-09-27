import { SignIn } from '@clerk/nextjs';
import { Radiation, ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] p-4 text-slate-100 font-sans">
      
      {/* ÜST LOGO VE KURUMSAL MEDİKAL BAŞLIK */}
      <div className="w-full max-w-[420px] mb-6 flex flex-col items-center text-center">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow- mb-3">
          <Radiation className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          RadOnc CDSS
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Radyasyon Onkolojisi Klinik Karar Destek Sistemi
        </p>

        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[11px] font-semibold text-blue-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Yalnızca Yetkili Sağlık Profesyonelleri İçindir
        </div>
      </div>

      {/* CLERK GİRİŞ KARTI (GOOGLE KALDIRILMIŞ, DERİN MEDİKAL TEMA) */}
      <div className="w-full max-w-[420px] flex justify-center">
        <SignIn
          appearance={{
            elements: {
              // 1. Google ile Girişi ve "or" Çizgisini Tamamen Yok Et
              socialButtons: 'hidden',
              socialButtonsBlockButton: 'hidden',
              dividerRow: 'hidden',
              
              // 2. Clerk Yazısını Gizle
              footer: 'hidden',
              footerAction: 'hidden',

              // 3. Şık Medikal Koyu Tema Kartı
              card: 'bg-[#0e1726]/95 border border-slate-800/90 shadow-2xl shadow-black/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl w-full',
              headerTitle: 'text-white font-bold text-lg text-center',
              headerSubtitle: 'text-slate-400 text-xs text-center mb-4',
              
              // 4. Form Alanları ve Okunabilir İnputlar
              formFieldLabel: 'text-xs font-semibold text-slate-300',
              formFieldInput: 'bg-[#131f33] border border-slate-700/80 text-white rounded-xl py-2.5 px-3.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 transition-all',
              
              // 5. Giriş Butonu
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 w-full mt-2 normal-case',
              
              identityPreviewText: 'text-slate-300 text-xs',
              identityPreviewEditButton: 'text-blue-400 hover:text-blue-300 text-xs',
            },
          }}
        />
      </div>

      {/* ALT BİLGİ */}
      <div className="mt-8 text-center text-[11px] text-slate-500 font-medium">
        🔒 256-Bit Şifreli Klinik Karar Altyapısı • NCCN & ASTRO Kılavuz Standartları
      </div>
    </div>
  );
}