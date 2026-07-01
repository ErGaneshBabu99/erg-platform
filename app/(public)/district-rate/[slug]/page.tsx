import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/district/download-button";
import { ContactBox } from "@/components/district/contact-box";
import { RelatedRates } from "@/components/district/related-rates";
import { formatNumber, formatDate, formatFileSize, getAbsoluteUrl } from "@/lib/utils";
import { Download, Eye, Calendar, FileText, MapPin, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getDistrictRate(slug: string) {
  return prisma.districtRate.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      district: { include: { province: true } },
      fiscalYear: true,
    },
  });
}

async function getRelatedRates(districtId: string, currentId: string) {
  return prisma.districtRate.findMany({
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
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rate = await getDistrictRate(slug);
  if (!rate) return { title: "Not Found" };

  const title = rate.seoTitle ??
    `District Rate of ${rate.district.name} ${rate.fiscalYear.year} – Download PDF | Er G Nepal`;
  const description = rate.seoDescription ??
    `Download the official district rate of ${rate.district.name} for fiscal year ${rate.fiscalYear.year}. Free PDF download. ${rate.district.province.name}, Nepal.`;
  const url = getAbsoluteUrl(`/district-rate/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: { card: "summary", title, description },
  };
}

export async function generateStaticParams() {
  const rates = await prisma.districtRate.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rates.map((r: { slug: string }) => ({ slug: r.slug }));
}

export const revalidate = 3600;

export default async function DistrictRatePage({ params }: PageProps) {
  const { slug } = await params;
  const rate = await getDistrictRate(slug);
  if (!rate) notFound();

  const related = await getRelatedRates(rate.districtId, rate.id);

  // Increment view count (async, non-blocking)
  prisma.districtRate.update({
    where: { id: rate.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "District Rates", href: "/district-rate" },
    { label: rate.district.province.name, href: `/district-rate?province=${encodeURIComponent(rate.district.province.name)}` },
    { label: `${rate.district.name} ${rate.fiscalYear.year}` },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the district rate of ${rate.district.name} for ${rate.fiscalYear.year}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The official district rate of ${rate.district.name} for fiscal year ${rate.fiscalYear.year} is available for free download on Er G Nepal. This rate is published by the Government of Nepal and is used for construction cost estimation.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I download the district rate PDF of ${rate.district.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Click the Download PDF button on this page to instantly download the official district rate of ${rate.district.name} for ${rate.fiscalYear.year}. No registration required.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I get the district rate of ${rate.district.name} in Word or Excel format?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Contact Er G Nepal via WhatsApp, phone, or email to request the district rate in Word or Excel format. We also provide editable formats for professional use.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-700 py-12 px-4">
        <div className="container-erg">
          <Breadcrumb items={breadcrumbs} className="mb-5 text-navy-300" />
          <div className="flex flex-wrap items-start gap-3 mb-3">
            <Badge variant="navy" className="text-xs">{rate.district.province.name}</Badge>
            <Badge variant="gold">{rate.fiscalYear.year}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            District Rate of {rate.district.name}
            <span className="block text-navy-200 text-2xl md:text-3xl font-semibold mt-1">
              Fiscal Year {rate.fiscalYear.year}
            </span>
          </h1>
          <div className="flex flex-wrap gap-6 text-navy-200 text-sm">
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              {formatNumber(rate.downloadCount)} downloads
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatNumber(rate.viewCount)} views
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
                    {rate.district.name} District Rate {rate.fiscalYear.year}
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
                  fileName={`district-rate-${rate.district.name.toLowerCase()}-${rate.fiscalYear.year}.pdf`}
                />
                <Link
                  href={rate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-center"
                >
                  <Eye className="w-4 h-4" />
                  View PDF
                </Link>
              </div>
            </div>

            {/* Description */}
            {rate.description && (
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  About This Rate
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {rate.description}
                </p>
              </div>
            )}

            {/* FAQ */}
            <div className="card-base p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: `What is the district rate of ${rate.district.name} for ${rate.fiscalYear.year}?`,
                    a: `The official district rate of ${rate.district.name} for fiscal year ${rate.fiscalYear.year} is available for free download above. This rate is published by the Government of Nepal and used for construction and engineering cost estimation.`,
                  },
                  {
                    q: `How do I download the ${rate.district.name} district rate PDF?`,
                    a: `Click the "Download PDF" button above to instantly download the PDF. No registration is required. The file will be downloaded directly to your device.`,
                  },
                  {
                    q: `Is this the latest district rate for ${rate.district.name}?`,
                    a: `This is the ${rate.fiscalYear.year} fiscal year district rate for ${rate.district.name}. For the most recent fiscal year, please check our district rate database.`,
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

            {/* Related Rates */}
            {related.length > 0 && (
              <RelatedRates rates={related as any} districtName={rate.district.name} />
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
                  { label: "District", value: rate.district.name },
                  { label: "Province", value: rate.district.province.name },
                  { label: "Fiscal Year", value: rate.fiscalYear.year },
                  { label: "Downloads", value: formatNumber(rate.downloadCount) },
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
            <ContactBox districtName={rate.district.name} districtRateId={rate.id} />

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
