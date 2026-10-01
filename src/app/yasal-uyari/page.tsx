import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

const sections = [
  {
    title: 'Kullanım amacı ve kapsam',
    body: 'RadOnco CDSS eğitim ve klinik karar desteği amacıyla sunulur. Sistem; tanı koymaz, tedavi reçete etmez ve hekim değerlendirmesi, multidisipliner tümör konseyi veya kurum protokolünün yerine geçmez.',
  },
  {
    title: 'Nihai klinik sorumluluk',
    body: 'Tanı, evre, tedavi endikasyonu, doz, fraksiyonasyon, hedef hacimler ve organ riskindeki nihai karar hastayı değerlendiren yetkili klinik ekibe aittir. Çıktılar tedavi planına aktarılmadan önce radyasyon onkoloğu ve medikal fizikçi tarafından doğrulanmalıdır.',
  },
  {
    title: 'Kanıt ve algoritma sınırları',
    body: 'İçerik kaynak ve sürüm bakımından değişebilir; her öneri tüm klinik senaryolara uygulanamaz. OAR metrikleri fraksiyonasyon, kontur tanımı, eşzamanlı tedavi, önceki ışınlama ve hasta özelliklerine bağlıdır. Eksik veya belirsiz verilerde güncel protokol ve birincil yayın esas alınmalıdır.',
  },
  {
    title: 'Hasta verisi ve gizlilik',
    body: 'Bu portala veya harici AI araçlarına doğrudan tanımlayıcı, hassas veya gizli hasta bilgisi girmeyin. Klinik örnekler paylaşılacaksa kurumunuzun veri koruma, etik kurul ve yetkilendirme süreçlerine uyun.',
  },
] as const;

export default function DisclaimerPage() {
  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-start gap-3">
          <span className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-2.5 text-rose-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">Clinical governance</div>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Yasal Uyarı ve Klinik Sorumluluk</h1>
          </div>
        </header>
        <div className="space-y-3">
          {sections.map(section => (
            <section key={section.title} className="rounded-2xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-xs leading-6 text-slate-400">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs font-semibold leading-5 text-amber-100">
          RadOnco CDSS çıktıları doğrudan tedavi kararı veya hastaya yönelik tıbbi öneri olarak kullanılmamalıdır.
        </p>
        <Link href="/" className="mt-4 inline-flex text-xs font-semibold text-sky-300 hover:text-sky-200">Portal ana sayfasına dön</Link>
      </div>
    </main>
  );
}
