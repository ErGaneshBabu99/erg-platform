/**
 * AnalyticsProvider — Step 4
 * Loads Google Analytics, Google Search Console verification,
 * and Microsoft Clarity via environment variables.
 *
 * Add to app/layout.tsx inside <head>:
 *   import AnalyticsProvider from "@/components/analytics/analytics-provider";
 *   ...
 *   <head>
 *     <AnalyticsProvider />
 *   </head>
 *
 * Required .env.local variables:
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *   NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
 *   NEXT_PUBLIC_GSC_VERIFICATION=xxxxxxxxxx
 */

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export default function AnalyticsProvider() {
  // Skip analytics in development
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Google Search Console Verification */}
      {GSC_VERIFICATION && (
        <meta
          name="google-site-verification"
          content={GSC_VERIFICATION}
        />
      )}

      {/* Google Analytics 4 */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {CLARITY_ID && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
