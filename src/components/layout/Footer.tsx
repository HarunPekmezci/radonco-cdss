import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#0a0f1d] text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>RadOnco CDSS · Clinical decision support for qualified healthcare professionals.</p>
        <Link href="/yasal-uyari" className="font-medium text-sky-400 transition hover:text-sky-300">
          Medical disclaimer
        </Link>
      </div>
    </footer>
  );
}
