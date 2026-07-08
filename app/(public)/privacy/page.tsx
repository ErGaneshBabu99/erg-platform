import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Er G Engineering Hub Nepal",
  description: "Privacy Policy for Er G – Engineering Hub Nepal. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-erg py-16 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-navy-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Privacy Policy</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: July 2025</p>

      <div className="prose-erg space-y-8">

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Welcome to Er G – Engineering Hub Nepal (<strong>erg.com.np</strong>). This Privacy Policy explains
            how we collect, use, and protect information when you visit our website. By using Er G, you agree
            to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong>Contact form submissions</strong> — name, email address, phone number, and message content when you contact us.</li>
            <li><strong>Download activity</strong> — we track which district rate documents are downloaded to improve our service.</li>
            <li><strong>Usage data</strong> — pages visited, search queries on our platform, and general browsing patterns via analytics tools.</li>
            <li><strong>Device information</strong> — browser type, IP address, and device type for security and performance purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>To respond to your inquiries and provide engineering consultancy.</li>
            <li>To improve our district rate database and website experience.</li>
            <li>To send updates about new district rates if you have subscribed.</li>
            <li>To maintain website security and prevent abuse.</li>
            <li>To analyse usage patterns and improve our services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We use essential cookies to maintain website functionality and analytics cookies to understand
            how visitors use our site. You can disable cookies in your browser settings, though some features
            may not work correctly without them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Third-Party Services</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Er G uses the following third-party services which have their own privacy policies:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong>Google Analytics</strong> — website traffic analysis.</li>
            <li><strong>Vercel</strong> — website hosting and deployment.</li>
            <li><strong>Blogger / TheGaneshPost</strong> — engineering blog content.</li>
            <li><strong>Google Gemini API</strong> — AI assistant responses.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Data Storage & Security</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your data is stored securely using industry-standard practices. Contact form submissions are
            stored in our PostgreSQL database with appropriate access controls. We do not sell your personal
            information to any third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            You have the right to access, correct, or request deletion of any personal information we hold
            about you. To exercise these rights, please contact us at{" "}
            <a href="mailto:chapagainganeshutube98@gmail.com" className="text-navy-600 dark:text-blue-400 hover:underline">
              chapagainganeshutube98@gmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page
            with an updated date. Continued use of our website after changes constitutes acceptance of
            the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            For any questions about this Privacy Policy, please contact:
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
