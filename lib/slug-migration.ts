/**
 * lib/slug-migration.ts
 *
 * Explicit control for rolling slug migration from `[district]-2083-84` to `[district]-2083-2084`.
 * 25 districts per batch.
 *
 * To promote the next batch, add its district slugs to `MIGRATED_DISTRICT_SLUGS` and redeploy.
 */

export const BATCH_1: string[] = [
  "kathmandu",
  "lalitpur",
  "bhaktapur",
  "kaski",
  "morang",
  "chitwan",
  "rupendehi",
  "jhapa",
  "sunsari",
  "kavrepalanchok",
  "makwanpur",
  "dhanusha",
  "parsa",
  "banke",
  "dang",
  "kailali",
  "kanchanpur",
  "gorkha",
  "tanahun",
  "palpa",
  "syangja",
  "nuwakot",
  "dhading",
  "ilam",
  "surkhet",
];

export const BATCH_2: string[] = [
  "bhojpur",
  "dhankuta",
  "khotang",
  "okhaldhunga",
  "panchthar",
  "sankhuwasabha",
  "solukhumbu",
  "taplejung",
  "terhathum",
  "udayapur",
  "bara",
  "mahottari",
  "rautahat",
  "saptari",
  "sarlahi",
  "siraha",
  "dolakha",
  "ramechhap",
  "rasuwa",
  "sindhuli",
  "sindhupalchok",
  "baglung",
  "lamjung",
  "manang",
  "mustang",
];

export const BATCH_3: string[] = [
  "myagdi",
  "nawalpur",
  "parbat",
  "arghakhanchi",
  "bardiya",
  "eastern-rukum",
  "gulmi",
  "kapilvastu",
  "nawalparasi-west",
  "pyuthan",
  "rolpa",
  "dailekh",
  "dolpa",
  "humla",
  "jajarkot",
  "jumla",
  "kalikot",
  "mugu",
  "salyan",
  "western-rukum",
  "achham",
  "baitadi",
  "bajhang",
  "bajura",
  "dadeldhura",
];

export const BATCH_4: string[] = [
  "darchula",
  "doti",
];

/**
 * Slug migration disabled.
 * All canonical district rate URLs match database records: `[district]-2083-84`.
 * No redirects are emitted.
 */
export const MIGRATED_DISTRICT_SLUGS = new Set<string>();

export function isDistrictMigrated(_districtSlug: string): boolean {
  return false;
}

/**
 * Returns the active canonical slug for a district's rate.
 * Matches DB entries directly: `${districtSlug}-2083-84` for FY 2083-84.
 */
export function getCanonicalRateSlug(districtSlug: string, fiscalYear: string = "2083-84"): string {
  const fy = fiscalYear === "2083-2084" ? "2083-84" : fiscalYear;
  return `${districtSlug}-${fy}`;
}

/**
 * No redirect target — redirects have been removed to preserve indexation of canonical URLs.
 */
export function getMigratedRedirectTarget(_slug: string): string | null {
  return null;
}

/**
 * Slugs match database directly.
 */
export function getLegacyLookupSlug(slug: string): string {
  return slug;
}

