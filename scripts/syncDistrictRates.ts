import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const supabase = getSupabaseAdmin();

const BUCKET = "district-rates";
const YEAR = process.argv[2];

if (!YEAR) {
  console.log("Usage:");
  console.log("npm run sync-rates -- 2082-83");
  process.exit(0);
}

async function main() {
  console.log(`Syncing ${YEAR}...\n`);

  // Read PDFs from Storage
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(YEAR);

  if (error) throw error;
  console.log(files);
console.log("Total files:", files?.length);
console.log("YEAR =", YEAR);

  // Fiscal year id
  const { data: fiscal } = await supabase
    .from("fiscal_years")
    .select("id")
    .eq("year", YEAR)
    .single();

  if (!fiscal) {
    console.log("Fiscal year not found.");
    return;
  }

  for (const file of files) {
    if (!file.name.endsWith(".pdf")) continue;

    const slug = file.name.replace(".pdf", "");

    // Find district
    const { data: district } = await supabase
      .from("districts")
      .select("id,name")
      .eq("slug", slug)
      .single();

    if (!district) {
      console.log(`❌ District not found: ${slug}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${YEAR}/${file.name}`);

    // Upsert
 const { error: upsertError } = await supabase
  .from("district_rates")
  .insert({
  id: crypto.randomUUID(),
  districtId: district.id,
  fiscalYearId: fiscal.id,
  slug: `${slug}-${YEAR}`,
  pdfUrl: publicUrl,
  status: "PUBLISHED",
  publishedAt: new Date(),
  downloadCount: 0,
  viewCount: 0,
});

    if (upsertError) {
      console.log(`❌ ${district.name}`);
      console.log(upsertError);
    } else {
      console.log(`✅ ${district.name}`);
    }
  }

  console.log("\nFinished.");
}

main();