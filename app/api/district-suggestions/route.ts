import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Prevent Next.js from caching this route as static — each `q` must hit the DB fresh.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Only 77 districts exist in total, so instead of asking Postgres to rank
// fuzzy/typo matches (which it can't do well with plain `contains`), we pull
// the small full list once, cache it in memory for a short window, and do
// the ranking here. This keeps the API fast without adding a search engine.
// ---------------------------------------------------------------------------

interface DistrictRow {
  name: string;
  slug: string;
  province: string;
}

let cache: { data: DistrictRow[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — district list almost never changes

async function getAllDistricts(): Promise<DistrictRow[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const districts = await prisma.district.findMany({
    select: {
      name: true,
      slug: true,
      province: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const data = districts.map((d) => ({
    name: d.name,
    slug: d.slug,
    province: d.province.name,
  }));

  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

// Standard Levenshtein edit distance (insert / delete / substitute), O(n*m).
// District names are short (<20 chars) so this is negligible cost even when
// run against every candidate and several comparison windows per candidate.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prevRow = new Array(n + 1);
  const currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      );
    }
    for (let j = 0; j <= n; j++) prevRow[j] = currRow[j];
  }

  return prevRow[n];
}

// ---------------------------------------------------------------------------
// In-order subsequence match: every character of `query` must appear in
// `target` in the same order, but NOT necessarily contiguously.
// This is what makes abbreviation-style typing work — "ktm" is not a typo
// of "Kathmandu" (edit distance is too high), it's a set of letters picked
// out in order (k-a-T-h-M-a-n-d-u). Same idea VS Code / Sublime use for
// fuzzy file search. Returns null if no match, otherwise how "tight" the
// match was (a smaller span between the matched letters = a better match).
// ---------------------------------------------------------------------------
function subsequenceMatch(query: string, target: string): { firstIndex: number; span: number } | null {
  let searchFrom = 0;
  let firstIndex = -1;
  let lastIndex = -1;

  for (let i = 0; i < query.length; i++) {
    const foundAt = target.indexOf(query[i], searchFrom);
    if (foundAt === -1) return null;
    if (firstIndex === -1) firstIndex = foundAt;
    lastIndex = foundAt;
    searchFrom = foundAt + 1;
  }

  return { firstIndex, span: lastIndex - firstIndex + 1 };
}

// Normalized edit-distance check for typo tolerance ("kathmdu", "kathmando").
// Compares the query against several windows of the name (not just a single
// same-length slice) so typos caused by a missing/extra/swapped letter near
// the start don't throw off the whole comparison, and also compares against
// the FULL name so near-complete, near-correct spellings score well.
function bestEditRatio(query: string, name: string): number {
  const windows = new Set<string>([
    name,
    name.slice(0, query.length),
    name.slice(0, query.length + 1),
    query.length > 1 ? name.slice(0, query.length - 1) : "",
  ]);

  let best = Infinity;
  for (const w of windows) {
    if (!w) continue;
    const dist = levenshtein(query, w);
    const ratio = dist / Math.max(query.length, w.length, 1);
    if (ratio < best) best = ratio;
  }
  return best;
}

// Combines both fuzzy strategies into a single sortable score (lower = better
// match). A candidate qualifies for the fuzzy tier if EITHER strategy thinks
// it's a plausible match — abbreviations pass via subsequence, typos pass via
// edit distance, and either score can win depending on which fits better.
function fuzzyScore(query: string, name: string): number | null {
  if (query.length < 2) return null; // too short to fuzzy match meaningfully

  const sub = subsequenceMatch(query, name);
  const subScore = sub ? sub.span - query.length + sub.firstIndex * 0.15 : Infinity;

  const editRatio = bestEditRatio(query, name);
  // Threshold tuned against the 77 real district names: loose enough to
  // catch genuine typos/abbreviations, tight enough to avoid noisy
  // near-unrelated matches padding out the result list.
  const editScore = editRatio <= 0.35 ? editRatio * 10 : Infinity;

  const best = Math.min(subScore, editScore);
  return Number.isFinite(best) ? best : null;
}

interface RankedResult extends DistrictRow {
  tier: number; // 0 = exact, 1 = startsWith, 2 = word startsWith, 3 = contains, 4 = fuzzy
  score: number; // lower is better within a tier
}

function rankDistricts(districts: DistrictRow[], rawQuery: string): RankedResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results: RankedResult[] = [];

  for (const d of districts) {
    const name = d.name.toLowerCase();

    // Tier 0 — exact match
    if (name === query) {
      results.push({ ...d, tier: 0, score: 0 });
      continue;
    }

    // Tier 1 — exact prefix match ("kat" -> "kathmandu")
    if (name.startsWith(query)) {
      results.push({ ...d, tier: 1, score: name.length });
      continue;
    }

    // Tier 2 — word-start match. Not exercised by today's single-word
    // Nepali district names, but keeps ranking correct if multi-word names
    // (or another searchable field) are ever added — a query matching the
    // start of a later word should outrank a mid-word substring match.
    const words = name.split(/[\s-]+/);
    const wordStartIdx = words.findIndex((w, idx) => idx > 0 && w.startsWith(query));
    if (wordStartIdx !== -1) {
      results.push({ ...d, tier: 2, score: wordStartIdx });
      continue;
    }

    // Tier 3 — substring match anywhere in the name
    const containsIdx = name.indexOf(query);
    if (containsIdx !== -1) {
      results.push({ ...d, tier: 3, score: containsIdx });
      continue;
    }

    // Tier 4 — fuzzy: abbreviations ("ktm") and typos ("kathmdu", "kathmando")
    const fscore = fuzzyScore(query, name);
    if (fscore !== null) {
      results.push({ ...d, tier: 4, score: fscore });
    }
  }

  results.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.score !== b.score) return a.score - b.score;
    if (a.name.length !== b.name.length) return a.name.length - b.name.length;
    return a.name.localeCompare(b.name);
  });

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const allDistricts = await getAllDistricts();
  const ranked = rankDistricts(allDistricts, q).slice(0, 8);

  return NextResponse.json({
    suggestions: ranked.map(({ name, slug, province }) => ({ name, slug, province })),
  });
}
