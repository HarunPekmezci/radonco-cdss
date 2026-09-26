import { SignIn, SignUp } from '@clerk/nextjs';
import { Activity, Layers, Radiation, ShieldCheck } from 'lucide-react';

const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#0d1527',
    colorForeground: '#f8fafc',
    colorMutedForeground: '#94a3b8',
    colorInput: '#131e36',
    colorInputForeground: '#ffffff',
    colorBorder: '#334155',
    colorRing: '#3b82f6',
  },
  elements: {
    card: 'auth-clerk-card border border-slate-800 shadow-2xl bg-[#0d1527]/90 backdrop-blur-xl rounded-2xl',
    headerTitle: 'auth-clerk-title text-white text-xl font-bold',
    headerSubtitle: 'auth-clerk-subtitle text-slate-400 text-xs',
    socialButtonsBlockButton: 'auth-clerk-social bg-[#131e36] border border-slate-700/80 text-white hover:bg-[#1a2947]',
    formButtonPrimary: 'auth-clerk-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25',
    formFieldInput: 'auth-clerk-input border-slate-700 focus:border-blue-500 bg-[#131e36] text-white',
    footerActionLink: 'auth-clerk-link text-blue-400 hover:text-blue-300 font-medium',
  },
};

const features = [
  {
    icon: Activity,
    title: 'İzodoz & OAR kısıtları',
    description: 'Hedef kapsamı ve kritik organ dozlarının birlikte değerlendirilmesi.',
  },
  {
    icon: Layers,
    title: 'Biyolojik modelleme',
    description: 'BED / EQD2 dönüşümleriyle fraksiyonasyonun klinik özeti.',
  },
  {
    icon: ShieldCheck,
    title: '12 organ + Benign rehberi',
    description: 'Organ bazlı kılavuzlar ve benign radyoterapi karar desteği.',
  },
];

type AuthScreenProps = {
  mode: 'sign-in' | 'sign-up';
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const AuthComponent = mode === 'sign-in' ? SignIn : SignUp;

  return (
    <main className="auth-screen grid min-h-screen grid-cols-1 bg-[#070b14] lg:grid-cols-12">
      <section className="relative isolate flex min-h-[560px] flex-col overflow-hidden bg-gradient-to-br from-[#070b14] via-[#0d1629] to-[#0a1936] px-6 py-8 sm:px-10 lg:col-span-7 lg:min-h-screen lg:px-14 lg:py-12">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40"
          viewBox="0 0 960 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="isodose-glow">
              <stop stopColor="#2563eb" stopOpacity=".2" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            <pattern id="isodose-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" stroke="#64748b" strokeOpacity=".1" />
            </pattern>
          </defs>
          <rect width="960" height="900" fill="url(#isodose-grid)" />
          <circle cx="760" cy="400" r="360" fill="url(#isodose-glow)" />
          <g stroke="#60a5fa" strokeOpacity=".17" strokeWidth="1.2">
            <path d="M545 452c0-122 99-221 221-221s221 99 221 221-99 221-221 221-221-99-221-221Z" />
            <path d="M585 452c0-100 81-181 181-181s181 81 181 181-81 181-181 181-181-81-181-181Z" />
            <path d="M625 452c0-78 63-141 141-141s141 63 141 141-63 141-141 141-141-63-141-141Z" />
            <path d="M766 120v136m0 392v136M434 452h136m392 0h136M531 217l96 96m278 278 96 96m0-470-96 96m-278 278-96 96" />
          </g>
        </svg>

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10 text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.18)]">
            <Radiation className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">RadOnc CDSS</p>
            <p className="text-xs text-slate-400">Radyasyon Onkolojisi Klinik Karar Desteği</p>
          </div>
        </div>

        <div className="relative my-auto max-w-2xl py-12 lg:py-16">
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            NCCN v1.2025 <span className="text-blue-300/60">•</span> ESTRO <span className="text-blue-300/60">•</span> ASTRO <span className="text-blue-300/60">•</span> DEGRO
          </div>

          <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
            Hassas Radyoterapi,
            <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
              Kanıta Dayalı Karar.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Klinik veriyi tutarlı bir reçete ve planlama çerçevesine dönüştüren, radyasyon onkolojisi iş akışları için tasarlanmış karar destek ortamı.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <Icon className="mb-3 h-5 w-5 text-blue-300" aria-hidden="true" />
                <h2 className="text-xs font-semibold text-slate-100">{title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <p className="relative text-xs leading-5 text-slate-500">
          Yalnızca yetkili radyasyon onkologları ve klinik araştırmacılar içindir.
        </p>
      </section>

      <section className="flex min-h-[620px] items-center justify-center border-t border-slate-800/80 bg-[#090d16] p-5 sm:p-8 lg:col-span-5 lg:min-h-screen lg:border-l lg:border-t-0 lg:p-6">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center lg:hidden">
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-300">GÜVENLİ KLİNİK ERİŞİM</p>
          </div>
          <AuthComponent appearance={clerkAppearance} />
        </div>
      </section>
    </main>
  );
}
