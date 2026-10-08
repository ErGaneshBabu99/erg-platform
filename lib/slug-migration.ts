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
 * ACTIVE MIGRATED DISTRICTS:
 * Active: BATCH_1 + BATCH_2 (50 districts total).
 */
export const MIGRATED_DISTRICT_SLUGS = new Set<string>([...BATCH_1, ...BATCH_2]);

export function isDistrictMigrated(districtSlug: string): boolean {
  return MIGRATED_DISTRICT_SLUGS.has(districtSlug);
}

/**
 * Returns the active canonical slug for a district's rate.
 * - If migrated: returns `${districtSlug}-2083-2084`
 * - If pending: returns `${districtSlug}-2083-84`
 * - For older fiscal years (e.g. 2082-83): returns `${districtSlug}-${fiscalYear}`
 */
export function getCanonicalRateSlug(districtSlug: string, fiscalYear: string = "2083-84"): string {
  if (fiscalYear === "2083-84" || fiscalYear === "2083-2084") {
    return isDistrictMigrated(districtSlug)
      ? `${districtSlug}-2083-2084`
      : `${districtSlug}-2083-84`;
  }
  return `${districtSlug}-${fiscalYear}`;
}

/**
 * Checks if a requested slug is a legacy `-2083-84` slug that should 301 redirect
 * to `-2083-2084`. Returns the target slug if redirect is needed, null otherwise.
 */
export function getMigratedRedirectTarget(slug: string): string | null {
  if (!slug.endsWith("-2083-84")) return null;
  const districtSlug = slug.replace(/-2083-84$/, "");
  if (isDistrictMigrated(districtSlug)) {
    return `${districtSlug}-2083-2084`;
  }
  return null;
}

/**
 * Returns the fallback/legacy DB slug if the record in the DB hasn't been renamed yet.
 */
export function getLegacyLookupSlug(slug: string): string {
  if (slug.endsWith("-2083-2084")) {
    return slug.replace(/-2083-2084$/, "-2083-84");
  }
  return slug;
}
