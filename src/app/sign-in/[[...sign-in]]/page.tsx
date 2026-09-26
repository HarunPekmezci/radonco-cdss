import { SignIn } from '@clerk/nextjs';
import { Radiation } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#fafbfc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* SOL PANEL: SAF VE NEFES ALAN MİMALİST MEDİKAL VİTRİN (7 Kolon) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 xl:p-20 relative">
        
        {/* Zarif & Aydınlık Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Radiation className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            RadOncCDSS
          </span>
        </div>

        {/* Tek ve Vurucu Başlık (Gereksiz paragraflar yok) */}
        <div className="max-w-md my-auto">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Radyasyon Onkolojisi <br />
            <span className="text-blue-600 font-bold">Tedavi Karar Destek Platformu</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Klinik evreleme, fraksiyonasyon ve dozimetrik güvenlik kısıtları.
          </p>

          {/* Sadece Saç Teli İnceliğinde Saf Bir Dozimetre Çizgisi */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-sm">
            <div className="h-14 w-full">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 60">
                <path
                  d="M 0,5 Q 230,5 250,22 T 270,58 L 300,60"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M 0,18 Q 80,32 160,45 T 260,58 L 300,60"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
              <span>PTV D95%</span>
              <span>OAR Toleransı</span>
            </div>
          </div>
        </div>

        {/* Alt Kurumsal İmza */}
        <div className="text-xs text-slate-400">
          Yalnızca yetkili sağlık profesyonelleri içindir.
        </div>
      </div>

      {/* SAĞ PANEL: SAF VE UYUMLU GİRİŞ ALANI (5 Kolon) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white lg:border-l lg:border-slate-100">
        
        {/* Mobil Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Radiation className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">RadOncCDSS</span>
        </div>

        {/* Tertemiz Clerk Giriş Kartı */}
        <div className="w-full max-w-[380px]">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
      </div>

    </div>
  );
}