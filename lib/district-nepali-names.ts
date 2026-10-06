/**
 * lib/district-nepali-names.ts
 *
 * Official Nepali names (Devanagari) and canonical district mapping
 * for all 77 constitutional districts of Nepal.
 */

export interface DistrictInfo {
  name: string;
  nameNp: string;
  slug: string;
  provinceSlug: string;
  provinceName: string;
}

export const ALL_77_DISTRICTS: DistrictInfo[] = [
  // --- Koshi Province (14) ---
  { name: "Bhojpur", nameNp: "भोजपुर", slug: "bhojpur", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Dhankuta", nameNp: "धनकुटा", slug: "dhankuta", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Ilam", nameNp: "इलाम", slug: "ilam", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Jhapa", nameNp: "झापा", slug: "jhapa", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Khotang", nameNp: "खोटाङ", slug: "khotang", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Morang", nameNp: "मोरङ", slug: "morang", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Okhaldhunga", nameNp: "ओखलढुङ्गा", slug: "okhaldhunga", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Panchthar", nameNp: "पाँचथर", slug: "panchthar", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Sankhuwasabha", nameNp: "संखुवासभा", slug: "sankhuwasabha", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Solukhumbu", nameNp: "सोलुखुम्बु", slug: "solukhumbu", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Sunsari", nameNp: "सुनसरी", slug: "sunsari", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Taplejung", nameNp: "ताप्लेजुङ", slug: "taplejung", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Terhathum", nameNp: "तेह्रथुम", slug: "terhathum", provinceSlug: "koshi", provinceName: "Koshi Province" },
  { name: "Udayapur", nameNp: "उदयपुर", slug: "udayapur", provinceSlug: "koshi", provinceName: "Koshi Province" },

  // --- Madhesh Province (8) ---
  { name: "Bara", nameNp: "बारा", slug: "bara", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Dhanusha", nameNp: "धनुषा", slug: "dhanusha", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Mahottari", nameNp: "महोत्तरी", slug: "mahottari", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Parsa", nameNp: "पर्सा", slug: "parsa", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Rautahat", nameNp: "रौतहट", slug: "rautahat", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Saptari", nameNp: "सप्तरी", slug: "saptari", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Sarlahi", nameNp: "सर्लाही", slug: "sarlahi", provinceSlug: "madhesh", provinceName: "Madhesh Province" },
  { name: "Siraha", nameNp: "सिरहा", slug: "siraha", provinceSlug: "madhesh", provinceName: "Madhesh Province" },

  // --- Bagmati Province (13) ---
  { name: "Bhaktapur", nameNp: "भक्तपुर", slug: "bhaktapur", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Chitwan", nameNp: "चितवन", slug: "chitwan", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Dhading", nameNp: "धादिङ", slug: "dhading", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Dolakha", nameNp: "दोलखा", slug: "dolakha", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Kathmandu", nameNp: "काठमाडौँ", slug: "kathmandu", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Kavrepalanchok", nameNp: "काभ्रेपलाञ्चोक", slug: "kavrepalanchok", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Lalitpur", nameNp: "ललितपुर", slug: "lalitpur", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Makwanpur", nameNp: "मकवानपुर", slug: "makwanpur", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Nuwakot", nameNp: "नुवाकोट", slug: "nuwakot", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Ramechhap", nameNp: "रामेछाप", slug: "ramechhap", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Rasuwa", nameNp: "रसुवा", slug: "rasuwa", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Sindhuli", nameNp: "सिन्धुली", slug: "sindhuli", provinceSlug: "bagmati", provinceName: "Bagmati Province" },
  { name: "Sindhupalchok", nameNp: "सिन्धुपाल्चोक", slug: "sindhupalchok", provinceSlug: "bagmati", provinceName: "Bagmati Province" },

  // --- Gandaki Province (11) ---
  { name: "Baglung", nameNp: "बागलुङ", slug: "baglung", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Gorkha", nameNp: "गोरखा", slug: "gorkha", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Kaski", nameNp: "कास्की", slug: "kaski", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Lamjung", nameNp: "लमजुङ", slug: "lamjung", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Manang", nameNp: "मनाङ", slug: "manang", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Mustang", nameNp: "मुस्ताङ", slug: "mustang", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Myagdi", nameNp: "म्याग्दी", slug: "myagdi", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Nawalpur", nameNp: "नवलपुर", slug: "nawalpur", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Parbat", nameNp: "पर्वत", slug: "parbat", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Syangja", nameNp: "स्याङ्जा", slug: "syangja", provinceSlug: "gandaki", provinceName: "Gandaki Province" },
  { name: "Tanahun", nameNp: "तनहुँ", slug: "tanahun", provinceSlug: "gandaki", provinceName: "Gandaki Province" },

  // --- Lumbini Province (12) ---
  { name: "Arghakhanchi", nameNp: "अर्घाखाँची", slug: "arghakhanchi", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Banke", nameNp: "बाँके", slug: "banke", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Bardiya", nameNp: "बर्दिया", slug: "bardiya", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Dang", nameNp: "दाङ", slug: "dang", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Eastern Rukum", nameNp: "रुकुम पूर्व", slug: "eastern-rukum", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Gulmi", nameNp: "गुल्मी", slug: "gulmi", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Kapilvastu", nameNp: "कपिलवस्तु", slug: "kapilvastu", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Nawalparasi West", nameNp: "नवलपरासी पश्चिम", slug: "nawalparasi-west", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Palpa", nameNp: "पाल्पा", slug: "palpa", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Pyuthan", nameNp: "प्युठान", slug: "pyuthan", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Rolpa", nameNp: "रोल्पा", slug: "rolpa", provinceSlug: "lumbini", provinceName: "Lumbini Province" },
  { name: "Rupendehi", nameNp: "रूपन्देही", slug: "rupendehi", provinceSlug: "lumbini", provinceName: "Lumbini Province" },

  // --- Karnali Province (10) ---
  { name: "Dailekh", nameNp: "दैलेख", slug: "dailekh", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Dolpa", nameNp: "डोल्पा", slug: "dolpa", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Humla", nameNp: "हुम्ला", slug: "humla", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Jajarkot", nameNp: "जाजरकोट", slug: "jajarkot", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Jumla", nameNp: "जुम्ला", slug: "jumla", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Kalikot", nameNp: "कालिकोट", slug: "kalikot", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Mugu", nameNp: "मुगु", slug: "mugu", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Salyan", nameNp: "सल्यान", slug: "salyan", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Surkhet", nameNp: "सुर्खेत", slug: "surkhet", provinceSlug: "karnali", provinceName: "Karnali Province" },
  { name: "Western Rukum", nameNp: "रुकुम पश्चिम", slug: "western-rukum", provinceSlug: "karnali", provinceName: "Karnali Province" },

  // --- Sudurpashchim Province (9) ---
  { name: "Achham", nameNp: "अछाम", slug: "achham", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Baitadi", nameNp: "बैतडी", slug: "baitadi", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Bajhang", nameNp: "बझाङ", slug: "bajhang", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Bajura", nameNp: "बाजुरा", slug: "bajura", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Dadeldhura", nameNp: "डडेल्धुरा", slug: "dadeldhura", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Darchula", nameNp: "दार्चुला", slug: "darchula", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Doti", nameNp: "डोटी", slug: "doti", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Kailali", nameNp: "कैलाली", slug: "kailali", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
  { name: "Kanchanpur", nameNp: "कञ्चनपुर", slug: "kanchanpur", provinceSlug: "sudurpashchim", provinceName: "Sudurpashchim Province" },
];

export const DISTRICT_MAP = new Map<string, DistrictInfo>(
  ALL_77_DISTRICTS.map((d) => [d.slug, d])
);

export function getDistrictInfo(slug: string): DistrictInfo | undefined {
  return DISTRICT_MAP.get(slug);
}

export function getDistrictNepaliName(slug: string): string {
  return DISTRICT_MAP.get(slug)?.nameNp ?? "";
}
