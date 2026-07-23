/**
 * lib/schema.ts
 * JSON-LD schema builders for ER G Platform.
 *
 * All builders return plain objects — pages render them with:
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(buildXxxSchema()) }} />
 *
 * SITE_URL is the single source of truth — imported from lib/seo.
 * No builder emits undefined or empty properties.
 */

import { SITE_URL, SITE_NAME_FULL, SITE_NAME } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Shared publisher block — reused across Article, Dataset, etc.
// ---------------------------------------------------------------------------
export function publisherBlock() {
  return {
    "@type": "Organization",
    name: SITE_NAME_FULL,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
  };
}

// ---------------------------------------------------------------------------
// WebSite + SearchAction
// Enables Google Sitelinks Search Box.
// ---------------------------------------------------------------------------
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME_FULL,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/district-rate?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// Organization
// Telephone is omitted when undefined.
// ---------------------------------------------------------------------------
export function buildOrganizationSchema() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_FULL,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Kathmandu",
    },
    ...(phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: phone,
            contactType: "customer service",
            areaServed: "NP",
            availableLanguage: ["Nepali", "English"],
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// Accepts the same breadcrumb array your existing <Breadcrumb> component uses.
// ---------------------------------------------------------------------------
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}` }
        : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// WebPage — used on static pages (about, contact, privacy, terms)
// ---------------------------------------------------------------------------
export function buildWebPageSchema({
  title,
  description,
  path,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME_FULL },
    ...(dateModified ? { dateModified } : {}),
  };
}

// ---------------------------------------------------------------------------
// CollectionPage — district rate listing /district-rate
// ---------------------------------------------------------------------------
export function buildCollectionPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "District Rate Database Nepal",
    description:
      "Official district rates for all 77 districts of Nepal. Free PDF download.",
    url: `${SITE_URL}/district-rate`,
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME_FULL },
  };
}

// ---------------------------------------------------------------------------
// Dataset — individual district rate page
// ---------------------------------------------------------------------------
export function buildDatasetSchema({
  districtName,
  provinceName,
  fiscalYear,
  slug,
  publishedAt,
  description,
}: {
  districtName: string;
  provinceName: string;
  fiscalYear: string;
  slug: string;
  publishedAt?: Date | null;
  description?: string | null;
}) {
  const url = `${SITE_URL}/district-rate/${slug}`;
  const name = `District Rate of ${districtName} ${fiscalYear}`;
  const desc =
    description ??
    `Official district rate of ${districtName}, ${provinceName} for fiscal year ${fiscalYear}. Published by the Government of Nepal.`;

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description: desc,
    url,
    keywords: [
      `district rate ${districtName}`,
      `${districtName} ${fiscalYear}`,
      "nepal district rate",
      "construction cost nepal",
    ],
    creator: publisherBlock(),
    publisher: publisherBlock(),
    license: "https://www.nepal.gov.np",
    isAccessibleForFree: true,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/pdf",
        contentUrl: url,
      },
    ],
    ...(publishedAt
      ? { datePublished: publishedAt.toISOString() }
      : {}),
    spatialCoverage: {
      "@type": "Place",
      name: `${districtName}, ${provinceName}, Nepal`,
    },
    temporalCoverage: fiscalYear,
  };
}

// ---------------------------------------------------------------------------
// FAQPage — used on district rate slug pages
// ---------------------------------------------------------------------------
export function buildFaqSchema(
  districtName: string,
  fiscalYear: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the district rate of ${districtName} for ${fiscalYear}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The official district rate of ${districtName} for fiscal year ${fiscalYear} is published by the Government of Nepal and available for free download on ER G Platform. It is used for construction cost estimation and BOQ preparation.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I download the district rate PDF of ${districtName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Click the Download PDF button on the ${districtName} district rate page on ER G Platform to instantly download the official PDF. No registration is required.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I get the ${districtName} district rate in Word or Excel format?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Contact ER G Platform via WhatsApp, phone, or email to request the district rate of ${districtName} in editable Word or Excel format for professional use.`,
        },
      },
      {
        "@type": "Question",
        name: `Is the ${districtName} district rate ${fiscalYear} free to download?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. All district rates on ER G Platform are completely free to download. No account or payment is required.`,
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Article — blog post pages
// ---------------------------------------------------------------------------
export function buildArticleSchema({
  title,
  excerpt,
  date,
  author,
  image,
  slug,
  tags,
  bloggerUrl,
}: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  slug: string;
  tags: string[];
  bloggerUrl: string;
}) {
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const ogImage = image.startsWith("/") ? `${SITE_URL}${image}` : image;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    image: ogImage,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Person",
      name: author,
      url: SITE_URL,
    },
    publisher: publisherBlock(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: tags.join(", "),
    url: canonicalUrl,
    sameAs: [bloggerUrl],
  };
}

// ---------------------------------------------------------------------------
// Person — about page (Ganesh Chapagain)
// ---------------------------------------------------------------------------
export function buildPersonSchema() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ganesh Chapagain",
    alternateName: [
      "Er. Ganesh Chapagain",
      "Er Ganesh Chapagain",
      "Er Ganesh",
      "Engineer Ganesh",
      "Ganesh Engineer",
      "Ganesh Chapagain Engineer",
      "Nepali Engineer Ganesh Chapagain",
      "Best Engineer Nepal Ganesh Chapagain",
      "Ganesh Chapagain Kathmandu",
      "Ganesh Chapagain Panchthar",
      "Ganesh Chapagain Khwopa Engineering College",
      "ganesh",
      "Ganesh",
      "Chapagain Ganesh",
      "Ganesh chapagain",
      "ganesh chapagain",
      "Ganesh Chapagain",
      "Engineer Ganesh",
      "Ganesh YT",
      "Prashant yt",
      "Prashant yt Ganesh",
      "Prashant yt Ganesh Chapagain",
      
    ],
    jobTitle: "Registered Civil Engineer",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Khwopa Engineering College",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bhaktapur",
        addressCountry: "NP",
      },
    },
    description: "Er. Ganesh Chapagain is a Registered Civil Engineer from Khwopa Engineering College, based in Kathmandu, Nepal. Founder of Er G Platform — Nepal's leading engineering resource hub for district rates, construction data, and consultancy. Originally from Panchthar, Nepal.",
    image: `${SITE_URL}/ganesh.jpg`,
    url: `${SITE_URL}/about`,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME_FULL,
      url: SITE_URL,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
    homeLocation: {
      "@type": "Place",
      name: "Panchthar, Koshi Province, Nepal",
    },
    nationality: "Nepali",
    knowsAbout: [
      "Civil Engineering",
      "District Rate Nepal",
      "Construction Cost Estimation",
      "BOQ Preparation",
      "Building Design Nepal",
      "Structural Engineering",
      "Engineering Consultancy Nepal",
    ],
    sameAs: [
      "https://www.facebook.com/Ganesh9817",
      "https://np.linkedin.com/in/ganesh-chapagain-a16906244",
      SITE_URL,
    ],
    ...(phone ? { telephone: phone } : {}),
  };
}

// ---------------------------------------------------------------------------
// ItemList — homepage latest rates section
// ---------------------------------------------------------------------------
export function buildItemListSchema(
  rates: Array<{
    slug: string;
    districtName: string;
    fiscalYear: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest District Rates Nepal",
    description: "Recently published official district rates for Nepal",
    url: `${SITE_URL}/district-rate`,
    itemListElement: rates.map((rate, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `District Rate of ${rate.districtName} ${rate.fiscalYear}`,
      url: `${SITE_URL}/district-rate/${rate.slug}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// ContactPage — /contact
// ---------------------------------------------------------------------------
export function buildContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ER G Platform",
    description:
      "Contact ER G Platform for district rates, engineering consultancy, or professional inquiries.",
    url: `${SITE_URL}/contact`,
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME_FULL },
  };
}