import { SignUp } from '@clerk/nextjs';
import { Radiation } from 'lucide-react';

export default function SignUpPage() {
  return (
    <main className="auth-screen min-h-screen w-full flex items-center justify-center bg-[#060a12] p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radiation className="w-7 h-7 text-amber-400" aria-hidden="true" />
          <span className="text-xl font-black text-white">RadOnc CDSS Kayıt</span>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          appearance={{
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
              card: 'auth-clerk-card border border-slate-800 shadow-2xl bg-[#0d1527]/95 rounded-2xl w-full',
              headerTitle: 'auth-clerk-title text-white text-xl font-bold',
              headerSubtitle: 'auth-clerk-subtitle text-slate-400 text-xs',
              socialButtonsBlockButton: 'auth-clerk-social bg-[#131e36] border border-slate-700/80 text-white hover:bg-[#1a2947]',
              formButtonPrimary: 'auth-clerk-primary bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
              formFieldInput: 'auth-clerk-input border-slate-700 bg-[#131e36] text-white',
              footerActionLink: 'auth-clerk-link text-blue-400 hover:text-blue-300',
            },
          }}
        />
      </div>
    </main>
  );
}
