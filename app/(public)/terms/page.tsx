import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service – Er G Engineering Hub Nepal",
  description: "Terms of Service for Er G – Engineering Hub Nepal. Please read these terms before using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container-erg py-16 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Terms of Service</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: July 2025</p>

      <div className="prose-erg space-y-8">

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By accessing and using Er G – Engineering Hub Nepal (<strong>erg.com.np</strong>), you accept
            and agree to be bound by these Terms of Service. If you do not agree to these terms, please
            do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Er G provides a free engineering resource platform including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-3">
            <li>District Rate database with free PDF downloads for all 77 districts of Nepal.</li>
            <li>Engineering blog (TheGaneshPost) with articles on civil engineering topics.</li>
            <li>Job vacancy listings for engineering professionals.</li>
            <li>AI-powered engineering assistant for general guidance.</li>
            <li>Engineering consultancy contact services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Use of District Rate Documents</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            District rate documents available on Er G are sourced from Government of Nepal publications.
            These documents are provided for informational and professional use. You may:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-3">
            <li>Download and use district rates for professional engineering estimates and BOQ preparation.</li>
            <li>Share links to our platform with other professionals.</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
            You may not redistribute the downloaded PDFs as your own work or sell them commercially.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Accuracy of Information</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            While we strive to provide accurate and up-to-date district rates and engineering information,
            Er G makes no warranties regarding the completeness or accuracy of the content. Always verify
            critical engineering data with official government sources before use in formal project submissions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. AI Assistant</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The AI assistant on Er G is provided for general engineering guidance only. It is powered by
            Google Gemini and may occasionally produce inaccurate information. Do not rely solely on AI
            responses for critical engineering decisions, safety calculations, or formal project submissions.
            Always consult a qualified engineer for professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. User Conduct</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            When using Er G, you agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Submit false or misleading information through contact forms.</li>
            <li>Attempt to hack, disrupt, or overload our servers.</li>
            <li>Use automated tools to scrape or download content in bulk.</li>
            <li>Misrepresent your identity or professional credentials.</li>
            <li>Use the platform for any illegal activities under Nepal law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The Er G platform design, original written content, and engineering guides are the intellectual
            property of Ganesh Chapagain. Government district rate documents remain the property of the
            Government of Nepal. Blog articles published on TheGaneshPost are the property of the respective
            author.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Disclaimer of Liability</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Er G is provided &quot;as is&quot; without any warranty. We are not liable for any damages arising
            from use of this platform, including errors in district rate data, AI assistant responses, or
            engineering information. Use of this platform is entirely at your own professional risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We reserve the right to update these Terms of Service at any time. Changes will be posted on
            this page with an updated date. Continued use of Er G after changes constitutes acceptance
            of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Governing Law</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These Terms are governed by the laws of Nepal. Any disputes arising from use of Er G shall
            be subject to the jurisdiction of courts in Kathmandu, Nepal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Contact</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            For questions about these Terms, please contact:
          </p>
          <div className="mt-4 p-5 bg-navy-50 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800 rounded-xl">
            <p className="font-semibold text-gray-900 dark:text-white">Ganesh Chapagain</p>
            <p className="text-sm text-gray-500 mt-1">Er G – Engineering Hub Nepal</p>
            <p className="text-sm text-gray-500">Kathmandu, Nepal</p>
            <a href="mailto:chapagainganeshutube98@gmail.com" className="text-sm text-navy-600 dark:text-blue-400 hover:underline mt-1 block">
              chapagainganeshutube98@gmail.com
            </a>
            <a href="tel:+9779847805353" className="text-sm text-navy-600 dark:text-blue-400 hover:underline mt-1 block">
              +977 9847805353
            </a>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
        <Link href="/" className="text-sm text-navy-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
