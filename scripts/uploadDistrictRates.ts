import dotenv from "dotenv";

// .env load
dotenv.config();

import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

const BUCKET = "district-rates";
const FOLDER = process.argv[2];

if (!FOLDER) {
  console.log("");
  console.log("Usage:");
  console.log("npm run upload-rates -- 2082-83");
  process.exit(0);
}

async function main() {
  console.log("");
  console.log("=================================");
  console.log("District Rate Auto Import");
  console.log("=================================");
  console.log("");

  console.log("Bucket :", BUCKET);
  console.log("Folder :", FOLDER);
  console.log("");

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list();

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} files\n`);

  data.forEach((file) => {
    console.log(file.name);
  });
}

main();