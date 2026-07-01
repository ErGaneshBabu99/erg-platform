import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROVINCES = [
  { name: "Koshi Province", nameNp: "कोशी प्रदेश", slug: "koshi", sortOrder: 1 },
  { name: "Madhesh Province", nameNp: "मधेश प्रदेश", slug: "madhesh", sortOrder: 2 },
  { name: "Bagmati Province", nameNp: "बागमती प्रदेश", slug: "bagmati", sortOrder: 3 },
  { name: "Gandaki Province", nameNp: "गण्डकी प्रदेश", slug: "gandaki", sortOrder: 4 },
  { name: "Lumbini Province", nameNp: "लुम्बिनी प्रदेश", slug: "lumbini", sortOrder: 5 },
  { name: "Karnali Province", nameNp: "कर्णाली प्रदेश", slug: "karnali", sortOrder: 6 },
  { name: "Sudurpashchim Province", nameNp: "सुदूरपश्चिम प्रदेश", slug: "sudurpashchim", sortOrder: 7 },
];

// All 77 districts grouped by province
const DISTRICTS: { provinceName: string; districts: { name: string; slug: string }[] }[] = [
  {
    provinceName: "Koshi Province",
    districts: [
      { name: "Taplejung", slug: "taplejung" },
      { name: "Panchthar", slug: "panchthar" },
      { name: "Ilam", slug: "ilam" },
      { name: "Jhapa", slug: "jhapa" },
      { name: "Morang", slug: "morang" },
      { name: "Sunsari", slug: "sunsari" },
      { name: "Dhankuta", slug: "dhankuta" },
      { name: "Terhathum", slug: "terhathum" },
      { name: "Sankhuwasabha", slug: "sankhuwasabha" },
      { name: "Bhojpur", slug: "bhojpur" },
      { name: "Solukhumbu", slug: "solukhumbu" },
      { name: "Okhaldhunga", slug: "okhaldhunga" },
      { name: "Khotang", slug: "khotang" },
      { name: "Udayapur", slug: "udayapur" },
    ],
  },
  {
    provinceName: "Madhesh Province",
    districts: [
      { name: "Saptari", slug: "saptari" },
      { name: "Siraha", slug: "siraha" },
      { name: "Dhanusha", slug: "dhanusha" },
      { name: "Mahottari", slug: "mahottari" },
      { name: "Sarlahi", slug: "sarlahi" },
      { name: "Rautahat", slug: "rautahat" },
      { name: "Bara", slug: "bara" },
      { name: "Parsa", slug: "parsa" },
    ],
  },
  {
    provinceName: "Bagmati Province",
    districts: [
      { name: "Kathmandu", slug: "kathmandu" },
      { name: "Lalitpur", slug: "lalitpur" },
      { name: "Bhaktapur", slug: "bhaktapur" },
      { name: "Kavrepalanchok", slug: "kavrepalanchok" },
      { name: "Sindhupalchok", slug: "sindhupalchok" },
      { name: "Rasuwa", slug: "rasuwa" },
      { name: "Nuwakot", slug: "nuwakot" },
      { name: "Dhading", slug: "dhading" },
      { name: "Makwanpur", slug: "makwanpur" },
      { name: "Sindhuli", slug: "sindhuli" },
      { name: "Ramechhap", slug: "ramechhap" },
      { name: "Dolakha", slug: "dolakha" },
    ],
  },
  {
    provinceName: "Gandaki Province",
    districts: [
      { name: "Gorkha", slug: "gorkha" },
      { name: "Manang", slug: "manang" },
      { name: "Mustang", slug: "mustang" },
      { name: "Myagdi", slug: "myagdi" },
      { name: "Kaski", slug: "kaski" },
      { name: "Lamjung", slug: "lamjung" },
      { name: "Tanahun", slug: "tanahun" },
      { name: "Nawalpur", slug: "nawalpur" },
      { name: "Syangja", slug: "syangja" },
      { name: "Parbat", slug: "parbat" },
      { name: "Baglung", slug: "baglung" },
    ],
  },
  {
    provinceName: "Lumbini Province",
    districts: [
      { name: "Palpa", slug: "palpa" },
      { name: "Nawalparasi East", slug: "nawalparasi-east" },
      { name: "Rupendehi", slug: "rupendehi" },
      { name: "Kapilvastu", slug: "kapilvastu" },
      { name: "Arghakhanchi", slug: "arghakhanchi" },
      { name: "Gulmi", slug: "gulmi" },
      { name: "Dang", slug: "dang" },
      { name: "Banke", slug: "banke" },
      { name: "Bardiya", slug: "bardiya" },
      { name: "Rolpa", slug: "rolpa" },
      { name: "Pyuthan", slug: "pyuthan" },
      { name: "Eastern Rukum", slug: "eastern-rukum" },
    ],
  },
  {
    provinceName: "Karnali Province",
    districts: [
      { name: "Dolpa", slug: "dolpa" },
      { name: "Mugu", slug: "mugu" },
      { name: "Humla", slug: "humla" },
      { name: "Jumla", slug: "jumla" },
      { name: "Kalikot", slug: "kalikot" },
      { name: "Dailekh", slug: "dailekh" },
      { name: "Jajarkot", slug: "jajarkot" },
      { name: "Western Rukum", slug: "western-rukum" },
      { name: "Salyan", slug: "salyan" },
      { name: "Surkhet", slug: "surkhet" },
    ],
  },
  {
    provinceName: "Sudurpashchim Province",
    districts: [
      { name: "Kanchanpur", slug: "kanchanpur" },
      { name: "Kailali", slug: "kailali" },
      { name: "Achham", slug: "achham" },
      { name: "Doti", slug: "doti" },
      { name: "Bajhang", slug: "bajhang" },
      { name: "Bajura", slug: "bajura" },
      { name: "Dadeldhura", slug: "dadeldhura" },
      { name: "Baitadi", slug: "baitadi" },
      { name: "Darchula", slug: "darchula" },
      { name: "Mahakali", slug: "mahakali" },
    ],
  },
];

const FISCAL_YEARS = [
  { year: "2083-84", yearAd: "2026-27", isCurrent: true, sortOrder: 1 },
  { year: "2082-83", yearAd: "2025-26", isCurrent: false, sortOrder: 2 },
  { year: "2081-82", yearAd: "2024-25", isCurrent: false, sortOrder: 3 },
  { year: "2080-81", yearAd: "2023-24", isCurrent: false, sortOrder: 4 },
  { year: "2079-80", yearAd: "2022-23", isCurrent: false, sortOrder: 5 },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Provinces
  console.log("Creating provinces...");
  for (const province of PROVINCES) {
    await prisma.province.upsert({
      where: { slug: province.slug },
      update: province,
      create: province,
    });
  }

  // Fiscal Years
  console.log("Creating fiscal years...");
  for (const fy of FISCAL_YEARS) {
    await prisma.fiscalYear.upsert({
      where: { year: fy.year },
      update: fy,
      create: fy,
    });
  }

  // Districts
  console.log("Creating districts...");
  for (const group of DISTRICTS) {
    const province = await prisma.province.findFirst({
      where: { name: group.provinceName },
    });
    if (!province) continue;

    for (const district of group.districts) {
      await prisma.district.upsert({
        where: { slug: district.slug },
        update: { ...district, provinceId: province.id },
        create: { ...district, provinceId: province.id },
      });
    }
  }

  // Admin user
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin@123456!", 12);
  await prisma.user.upsert({
    where: { email: "admin@erg.com.np" },
    update: {},
    create: {
      email: "admin@erg.com.np",
      name: "Er G Admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Seed complete!");
  console.log("Admin credentials: admin@erg.com.np / Admin@123456!");
  console.log("⚠️  IMPORTANT: Change the admin password immediately after first login!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
