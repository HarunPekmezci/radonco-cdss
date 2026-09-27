'use client';

import { useEffect, useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { Moon, Radiation, Sun } from 'lucide-react';

export default function SignUpPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('radonco-theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('radonco-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <div className="auth-screen relative min-h-screen w-full flex items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} className="absolute right-6 top-6 rounded-lg border border-slate-200 bg-white p-2 text-amber-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radiation className="w-7 h-7 text-amber-400" />
          <span className="text-xl font-black text-slate-900 dark:text-white">RadOnc CDSS Kayıt</span>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: '#2563eb',
              colorBackground: theme === 'dark' ? '#0f172a' : '#ffffff',
            },
          }}
        />
      </div>
    </div>
  );
}