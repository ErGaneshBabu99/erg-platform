import { cache } from "react";
import { PdfViewerButton } from "@/components/district/pdf-viewer-button";
import type { Metadata } from "next";
import { buildMetadata, buildDistrictKeywords, SITE_URL } from "@/lib/seo";
import { notFound, redirect, RedirectType } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/district/download-button";
import { ContactBox } from "@/components/district/contact-box";
import { RelatedRates } from "@/components/district/related-rates";
import { NeighboringDistricts } from "@/components/district/neighboring-districts";
import { DistrictStatsLive } from "@/components/district/district-stats-live";
import { formatNumber, formatDate, formatFileSize } from "@/lib/utils";
import { Download, Calendar, FileText, MapPin, ArrowLeft, Users, Landmark } from "lucide-react";
import { getDistrictFact } from "@/lib/district-facts";
import { getDistrictNepaliName, ALL_77_DISTRICTS } from "@/lib/district-nepali-names";
import {
  getCanonicalRateSlug,
  getMigratedRedirectTarget,
  getLegacyLookupSlug,
  isDistrictMigrated,
} from "@/lib/slug-migration";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const rates = await prisma.districtRate.findMany({
      where: { status: "PUBLISHED" },
      include: { district: true, fiscalYear: true },
    });

    if (rates && rates.length > 0) {
      return rates.map((r) => {
        const canonicalSlug = getCanonicalRateSlug(r.district.slug, r.fiscalYear.year);
        return { slug: canonicalSlug };
      });
    }
  } catch (error) {
    console.warn(
      "[generateStaticParams] Database not reachable during build. Pages will be generated on demand at runtime.",
      error
    );
  }

  // Return empty array when DB is unreachable so next build doesn't crash prerendering
  return [];
}

export const dynamicParams = true;
export const revalidate = 86400;

const getDistrictRate = cache(async (slug: string) => {
  try {
    const legacySlug = getLegacyLookupSlug(slug);

    return await prisma.districtRate.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [{ slug }, { slug: legacySlug }],
      },
      include: {
        district: { include: { province: true } },
        fiscalYear: true,
      },
    });
  } catch (error) {
    console.warn(`[getDistrictRate] DB query failed for slug ${slug}:`, error);
    return null;
  }
});

async function getRelatedRates(districtId: string, currentId: string) {
  try {
    return await prisma.districtRate.findMany({
      where: {
        districtId,
        status: "PUBLISHED",
        id: { not: currentId },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        district: { include: { province: { select: { name: true } } } },
        fiscalYear: { select: { year: true } },
      },
    });
  } catch (error) {
    console.warn("[getRelatedRates] DB query failed:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rate = await getDistrictRate(slug);

  if (!rate) {
    return buildMetadata({
      title: "District Rate Not Found",
      description: "The requested district rate could not be found.",
      path: `/district-rate/${slug}`,
      noIndex: true,
    });
  }

  const districtName = rate.district.name;
  const fiscalYear = rate.fiscalYear.year;
  const provinceName = rate.district.province.name;
  const nameNp = rate.district.nameNp || getDistrictNepaliName(rate.district.slug);
  const fact = getDistrictFact(rate.district.slug);
  const canonicalSlug = getCanonicalRateSlug(rate.district.slug, fiscalYear);

  // High-ranking, Google-compliant Title under 60 chars (template appends " | ER G Platform")
  const title = nameNp
    ? `${districtName} District Rate ${fiscalYear} (${nameNp} दररेट) PDF`
    : `${districtName} District Rate ${fiscalYear} PDF Download`;

  // Unique, fact-enriched description blending rate facts and district info
  const description = fact
    ? `Download official ${districtName} (${nameNp}) district rate for FY ${fiscalYear} (2083/84). Free verified PDF for BOQ & construction cost estimation. HQ: ${fact.headquarters}, ${provinceName}. ${fact.highlight}`
    : `Download official ${districtName} (${nameNp}) district rate for fiscal year ${fiscalYear}. Free PDF download for civil engineering cost estimation and BOQ in ${provinceName}, Nepal.`;

  return buildMetadata({
    title,
    description,
    keywords: buildDistrictKeywords(districtName, fiscalYear, provinceName, nameNp),
    path: `/district-rate/${canonicalSlug}`,
    ogType: "article",
    publishedTime: rate.publishedAt?.toISOString(),
  });
}

export default async function DistrictRatePage({ params }: PageProps) {
  const { slug } = await params;

  // Single-hop 301 redirect for migrated districts if accessed via old -2083-84 slug
  const redirectTarget = getMigratedRedirectTarget(slug);
  if (redirectTarget) {
    redirect(`/district-rate/${redirectTarget}`, RedirectType.replace);
  }

  const rate = await getDistrictRate(slug);
  if (!rate) notFound();

  const districtName = rate.district.name;
  const fiscalYear = rate.fiscalYear.year;
  const provinceName = rate.district.province.name;
  const provinceSlug = rate.district.province.slug;
  const nameNp = rate.district.nameNp || getDistrictNepaliName(rate.district.slug);
  const fact = getDistrictFact(rate.district.slug);
  const canonicalSlug = getCanonicalRateSlug(rate.district.slug, fiscalYear);

  const directDownloads = (rate.downloadCount ?? 0) + (rate.downloadCountAfter ?? 0);
  const totalViews = (rate.viewCount ?? 0) + (rate.viewCountAfter ?? 0);
  const totalDownloads = directDownloads + totalViews;

  const related = await getRelatedRates(rate.districtId, rate.id);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "District Rates", href: "/district-rate" },
    { label: provinceName, href: `/district-rate?province=${encodeURIComponent(provinceName)}` },
    { label: `${districtName} ${fiscalYear}` },
  ];

  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "District Rates",
        item: `${SITE_URL}/district-rate`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: provinceName,
        item: `${SITE_URL}/district-rate?province=${encodeURIComponent(provinceName)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${districtName} District Rate ${fiscalYear}`,
        item: `${SITE_URL}/district-rate/${canonicalSlug}`,
      },
    ],
  };

  // DigitalDocument JSON-LD Schema (publisher is Er G, not Government of Nepal)
  const digitalDocumentSchema = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: `${districtName} District Rate ${fiscalYear} PDF (${nameNp})`,
    description: `Official district rate list and construction schedule of rates for ${districtName} (${nameNp}) fiscal year ${fiscalYear}.`,
    url: rate.pdfUrl,
    encodingFormat: "application/pdf",
    publisher: {
      "@type": "Organization",
      name: "ER G – Engineering Hub Nepal",
      url: SITE_URL,
    },
    author: {
      "@type": "Organization",
      name: "ER G – Engineering Hub Nepal",
      url: SITE_URL,
    },
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the district rate of ${districtName} (${nameNp}) for ${fiscalYear}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The official district rate of ${districtName} (${nameNp} जिल्ला दररेट) for fiscal year ${fiscalYear} is available for free download on Er G Nepal. It contains standard construction materials rates, labor wages, and equipment transport rates.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I download the ${districtName} district rate PDF?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Click the "Download PDF" button on this page to instantly download the official district rate of ${districtName} (${nameNp}) for ${fiscalYear}. No registration required.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I get the district rate of ${districtName} in Word or Excel format?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Contact Er G Nepal via WhatsApp, phone, or email to request editable format rates for ${districtName}.`,
        },
      },
      ...(fact
        ? [
            {
              "@type": "Question",
              name: `Where is ${districtName} district and what is its headquarters?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${districtName} (${nameNp}) is in ${provinceName}, with its administrative headquarters at ${fact.headquarters}. It covers ${fact.areaKm2.toLocaleString()} km² with a population of ${fact.population.toLocaleString()}.`,
              },
            },
          ]
        : []),
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(digitalDocumentSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4">
        <div className="container-erg">
          <Breadcrumb items={breadcrumbs} className="mb-5 text-navy-300" />
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <Badge variant="navy" className="text-xs">{provinceName}</Badge>
            <Badge variant="gold">{fiscalYear}</Badge>
            {nameNp && (
              <Badge variant="navy" className="text-xs bg-navy-800/80 text-blue-200 border border-blue-400/20">
                {nameNp}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            District Rate of {districtName}
            <span className="block text-accent text-2xl md:text-3xl font-semibold mt-1">
              {nameNp ? `${nameNp} जिल्ला दररेट २०८३-८४` : `जिल्ला दररेट २०८३-८४`} (FY {fiscalYear})
            </span>
          </h1>

          <div className="flex flex-wrap gap-6 text-navy-200 text-sm mt-3">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Download className="w-4 h-4 text-accent" />
              {formatNumber(totalDownloads)} downloads
            </span>
            {rate.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Published {formatDate(rate.publishedAt)}
              </span>
            )}
            {rate.pdfSize && (
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {formatFileSize(rate.pdfSize)}
                {rate.pdfPages ? ` · ${rate.pdfPages} pages` : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-erg py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Download Card */}
            <div className="card-base p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {districtName} {nameNp ? `(${nameNp})` : ""} District Rate {fiscalYear}
                  </div>
                  <div className="text-sm text-gray-500">
                    Official PDF · {rate.pdfSize ? formatFileSize(rate.pdfSize) : "PDF"}
                    {rate.pdfPages ? ` · ${rate.pdfPages} pages` : ""}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <DownloadButton
                  districtRateId={rate.id}
                  pdfUrl={rate.pdfUrl}
                  fileName={`district-rate-${districtName.toLowerCase()}-${fiscalYear}.pdf`}
                />
                <PdfViewerButton
                  pdfUrl={rate.pdfUrl}
                  districtName={`${districtName} (${fiscalYear})`}
                  districtRateId={rate.id}
                  fileName={`district-rate-${districtName.toLowerCase()}-${fiscalYear}.pdf`}
                />
              </div>
            </div>

            {/* Description / About This Rate */}
            <div className="card-base p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                About {districtName} {nameNp ? `(${nameNp})` : ""} District Rate
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {nameNp ? `${nameNp} (${districtName})` : districtName} जिल्लाको आर्थिक वर्ष {fiscalYear} को आधिकारिक निर्माण सामग्री तथा ज्याला दररेट। Download the complete approved government rate list for BOQ preparation, tender bidding, and project cost estimation.
              </p>
              {fact && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
                  {districtName} district has its headquarters at {fact.headquarters} with a population of {fact.population.toLocaleString()} spread across {fact.areaKm2.toLocaleString()} km² in {provinceName}. {fact.highlight}
                </p>
              )}
            </div>

            {/* District Snapshot */}
            {fact && (
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {districtName} {nameNp ? `(${nameNp})` : ""} District Snapshot
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <Landmark className="w-3.5 h-3.5" /> Headquarters
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{fact.headquarters}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <Users className="w-3.5 h-3.5" /> Population (2021)
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{fact.population.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Area
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{fact.areaKm2.toLocaleString()} km²</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Province
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{provinceName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Interactive Total Downloads Activity */}
            <DistrictStatsLive
              slug={canonicalSlug}
              districtName={districtName}
              initialTotalDownloads={totalDownloads}
              initialDirectDownloads={directDownloads}
              initialViews={totalViews}
            />

            {/* Neighbouring Districts in Same Province */}
            <NeighboringDistricts
              currentDistrictSlug={rate.district.slug}
              provinceName={provinceName}
              provinceSlug={provinceSlug}
            />

            {/* FAQ */}
            <div className="card-base p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions ({nameNp ? `${nameNp} दररेट प्रश्नहरू` : "FAQs"})
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: `What is the district rate of ${districtName} (${nameNp}) for ${fiscalYear}?`,
                    a: `The official district rate of ${districtName} (${nameNp}) for fiscal year ${fiscalYear} is published by the District Administration / Rate Fixation Committee and available for free download above. It contains standard rates for cement, steel, sand, aggregate, bricks, and labor wages.`,
                  },
                  {
                    q: `How do I download the ${districtName} district rate PDF?`,
                    a: `Click the "Download PDF" button above to immediately save the verified rate document to your device.`,
                  },
                  {
                    q: `Can I get this rate in Word or Excel format?`,
                    a: `Yes. Contact Er G Nepal via WhatsApp or email to request editable format copies for BOQ preparation.`,
                  },
                ].map((faq, i) => (
                  <details key={i} className="group border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <summary className="flex justify-between items-center p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors list-none">
                      {faq.q}
                      <span className="text-gray-400 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">▾</span>
                    </summary>
                    <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Related Rates (Other Fiscal Years of this District) */}
            {related.length > 0 && (
              <RelatedRates rates={related as any} districtName={districtName} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Meta Card */}
            <div className="card-base p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                Details
              </h3>
              <dl className="space-y-3">
                {[
                  { label: "District", value: `${districtName} ${nameNp ? `(${nameNp})` : ""}` },
                  { label: "Province", value: provinceName },
                  { label: "Fiscal Year", value: fiscalYear },
                  { label: "Total Downloads", value: formatNumber(totalDownloads) },
                  rate.pdfPages ? { label: "Pages", value: String(rate.pdfPages) } : null,
                  rate.pdfSize ? { label: "File Size", value: formatFileSize(rate.pdfSize) } : null,
                  rate.publishedAt ? { label: "Published", value: formatDate(rate.publishedAt) } : null,
                ].filter(Boolean).map((item) => (
                  <div key={item!.label} className="flex justify-between gap-4">
                    <dt className="text-sm text-gray-500">{item!.label}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white text-right">{item!.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Contact Box */}
            <ContactBox districtName={districtName} districtRateId={rate.id} />

            {/* Back Link */}
            <Link
              href="/district-rate"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all district rates
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
