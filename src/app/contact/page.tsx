import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-10 text-slate-100 sm:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          ← Back to Decision Support Matrix
        </Link>
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0e1726] p-6 shadow-xl sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">RadOnc CDSS</div>
          <h1 className="mt-2 text-2xl font-bold text-white">Contact &amp; Protocol Contribution</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Share feedback, report an issue, or suggest a clinical protocol or evidence source for review.
            Contributions are reviewed before any clinical content is incorporated.
          </p>
          <a
            href="mailto:harun.pekmezci@sbu.edu.tr?subject=RadOnc%20CDSS%20Protocol%20Contribution"
            className="mt-6 inline-flex items-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            Email protocol contribution
          </a>
          <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-100/80">
            Please do not include patient-identifiable or confidential clinical information in feedback or protocol submissions.
          </p>
        </div>
      </div>
    </main>
  );
}
