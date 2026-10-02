'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const sections = {
  tr: [
    {
      title: 'Kapsam ve veri minimizasyonu',
      body: 'Bu portal klinik karar desteği ve eğitim amacıyla sunulur. Gerçek hastalara ait ad, doğum tarihi, dosya numarası, görüntü veya başka tanımlayıcı sağlık bilgilerini forma ya da yapay zeka aracına girmeyin. Mümkün olduğunda yalnızca anonimleştirilmiş ve gerekli en az bilgiyi kullanın.',
    },
    {
      title: 'Dil tercihi ve tarayıcı depolaması',
      body: 'TR/EN seçiminiz, sayfalar arasında tercihi korumak için tarayıcınızın yerel depolamasında “language” anahtarıyla saklanır. Bu tercih hasta verisi içermez ve dil menüsünden değiştirilebilir.',
    },
    {
      title: 'İletişim formu',
      body: 'İletişim formu verileri bu siteye göndermez. Gönderim, seçtiğiniz konu ve mesajı içeren bir e-posta taslağını cihazınızdaki e-posta uygulamasında açar. E-postayı siz inceler ve gönderirsiniz; gönderdiğiniz e-posta, e-posta sağlayıcınızın ve alıcının uygulamalarına tabi olur.',
    },
    {
      title: 'Klinik araçlar ve harici hizmetler',
      body: 'Dağıtıma göre, sohbet API’sine gönderilen mesajlar ve etkin vaka bağlamı, GEMINI_API_KEY yapılandırılmışsa Google Gemini hizmetine iletilebilir. Rapor çıkarım API’si, rapor metnini uygulama sunucusunun yapılandırdığı Ollama hizmetine iletir; hizmetin konumu ve günlük saklama davranışı dağıtım yapılandırmasına bağlıdır. Bu araçlarda tanımlanabilir hasta bilgisi kullanmayın.',
    },
    {
      title: 'Kimlik doğrulama, günlükler ve saklama',
      body: 'Kimlik doğrulama özellikleri etkin olduğunda Clerk oturum hizmetleri kullanılabilir. Sunucu erişim günlükleri, güvenlik kayıtları ve üçüncü taraf hizmetlerinin saklama süreleri barındırma ve dağıtım yapılandırmasına bağlıdır; bu portal için merkezi bir saklama süresi beyan edilmemiştir. Dağıtım sorumlusu, yürürlükteki mevzuata uygun aydınlatma metnini ve saklama politikasını ayrıca sağlamalıdır.',
    },
  ],
  en: [
    {
      title: 'Scope and data minimization',
      body: 'This portal is provided for clinical decision support and education. Do not enter real patients’ names, dates of birth, record numbers, images, or other identifiable health information into forms or AI tools. Use only the minimum necessary, de-identified information whenever possible.',
    },
    {
      title: 'Language preference and browser storage',
      body: 'Your TR/EN selection is stored in your browser’s local storage under the “language” key so the preference persists between pages. This preference contains no patient data and can be changed from the language menu.',
    },
    {
      title: 'Contact form',
      body: 'The contact form does not submit its contents to this site. Submitting opens an email draft in your device’s mail application with the selected topic and message. You review and send the email; sent messages are subject to your email provider and the recipient’s systems.',
    },
    {
      title: 'Clinical tools and external services',
      body: 'Depending on deployment, messages and active case context sent to the chat API may be forwarded to Google Gemini when GEMINI_API_KEY is configured. The report-extraction API forwards report text to the Ollama service configured on the application server; its location and log-retention behavior depend on deployment settings. Do not use identifiable patient information in these tools.',
    },
    {
      title: 'Authentication, logs, and retention',
      body: 'Clerk session services may be used when authentication features are enabled. Server access logs, security records, and third-party service retention depend on hosting and deployment configuration; no centralized retention period is declared for this portal. The deployment operator must provide any additional notice and retention policy required by applicable law.',
    },
  ],
} as const;

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-full bg-[#0a0f1d] px-3 py-6 text-slate-100 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-start gap-3">
          <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              {language === 'en' ? 'Data protection' : 'Veri koruma'}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {language === 'en' ? 'Privacy Notice' : 'Gizlilik Bildirimi'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {language === 'en'
                ? 'An implementation-level overview of how this portal handles language preferences, contact messages, and clinical tool inputs.'
                : 'Bu portalın dil tercihlerini, iletişim mesajlarını ve klinik araç girdilerini nasıl işlediğine ilişkin uygulama düzeyinde genel bilgilendirme.'}
            </p>
          </div>
        </header>

        <div className="space-y-3">
          {sections[language].map(section => (
            <section key={section.title} className="rounded-xl border border-slate-800 bg-[#0e1726] p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm leading-6 text-amber-100">
          {language === 'en'
            ? 'This notice does not identify the data controller, legal basis, or jurisdiction-specific rights for every deployment. The organization operating a deployment must publish the applicable formal privacy notice.'
            : 'Bu bildirim her dağıtım için veri sorumlusunu, hukuki işleme nedenini veya ülkeye özgü hakları tanımlamaz. Dağıtımı işleten kurum, geçerli resmi gizlilik aydınlatmasını ayrıca yayımlamalıdır.'}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          <Link href="/yasal-uyari" className="text-sky-300 hover:text-sky-200">
            {language === 'en' ? 'Medical disclaimer' : 'Tıbbi sorumluluk reddi'}
          </Link>
          <Link href="/iletisim" className="text-sky-300 hover:text-sky-200">
            {language === 'en' ? 'Contact' : 'İletişim'}
          </Link>
        </div>
      </div>
    </main>
  );
}
