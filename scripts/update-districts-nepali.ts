import { prisma } from "../lib/prisma";
import { ALL_77_DISTRICTS } from "../lib/district-nepali-names";

async function main() {
  console.log("🇳🇵 Updating Nepali names (nameNp) for all 77 districts in DB...");

  let updatedCount = 0;
  for (const item of ALL_77_DISTRICTS) {
    const res = await prisma.district.updateMany({
      where: { slug: item.slug },
      data: { nameNp: item.nameNp },
    });
    if (res.count > 0) {
      updatedCount += res.count;
      console.log(`✅ ${item.name} -> ${item.nameNp}`);
    } else {
      console.warn(`⚠️ District not found in DB with slug: ${item.slug}`);
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} districts with official Nepali names!`);
}

main()
  .catch((err) => {
    console.error("Error updating district Nepali names:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
