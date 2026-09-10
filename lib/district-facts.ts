/**
 * lib/district-facts.ts
 *
 * Real, static facts about each of Nepal's districts — population (2021 census),
 * area, headquarters, and a one-line original note on what the district is known for.
 *
 * WHY THIS FILE EXISTS:
 * Every /district-rate/[slug] page was built from one shared template, so the
 * "About This Rate" paragraph and FAQ wording were nearly identical across all
 * 77+ pages (only the district name and year changed). Google's August 2026
 * spam update targets exactly this pattern — near-identical pages published at
 * scale — and erganesh.com.np's rankings and impressions dropped to zero
 * starting Aug 27-29, 2026, right after that update rolled out.
 *
 * This file gives generateMetadata() and the page body real, district-specific
 * facts to build genuinely unique sentences from, instead of just swapping the
 * district name into an identical template.
 *
 * Sources: NSO National Population and Housing Census 2021 (population, area,
 * headquarters). The `highlight` field is written fresh for this site — it is
 * NOT copied from any other website, to keep this content original.
 *
 * Keyed by the exact `slug` values used in prisma/seed.ts.
 *
 * NOTE: this file matches the current live database (76 real districts —
 * Chitwan included in Bagmati, the fake "mahakali" 10th Sudurpashchim entry
 * removed). prisma/seed.ts has been synced to match on 2026-09-10.
 */

export interface DistrictFact {
  /** 2021 census population */
  population: number;
  /** Official area in km² */
  areaKm2: number;
  /** District headquarters town */
  headquarters: string;
  /** One original sentence — what the district is known for. Not copied from any source. */
  highlight: string;
}

export const DISTRICT_FACTS: Record<string, DistrictFact> = {
  // ---------------- Koshi Province ----------------
  taplejung: { population: 120590, areaKm2: 3646, headquarters: "Phungling", highlight: "Home to Kanchenjunga, the world's third-highest peak, and the Pathibhara temple trek." },
  panchthar: { population: 172400, areaKm2: 1241, headquarters: "Phidim", highlight: "A Limbu-heartland hill district in the far east, centred on the bazaar town of Phidim." },
  ilam: { population: 279534, areaKm2: 1703, headquarters: "Ilam", highlight: "Nepal's best-known tea-growing district, with orthodox tea gardens dating back to the 1860s." },
  jhapa: { population: 998054, areaKm2: 1606, headquarters: "Bhadrapur (Chandragadhi)", highlight: "Nepal's easternmost district, a flat, fertile Tarai belt bordering India." },
  morang: { population: 1148156, areaKm2: 1855, headquarters: "Biratnagar", highlight: "Home to Biratnagar, Nepal's eastern industrial hub and one of its busiest customs points." },
  sunsari: { population: 926962, areaKm2: 1257, headquarters: "Inaruwa", highlight: "Anchors the Dharan–Itahari corridor and the Koshi Tappu Wildlife Reserve." },
  dhankuta: { population: 150599, areaKm2: 891, headquarters: "Dhankuta", highlight: "Hilly former regional headquarters town known for oranges and orange groves." },
  terhathum: { population: 88731, areaKm2: 679, headquarters: "Myanglung", highlight: "One of Nepal's smallest hill districts, gateway to the Tinjure-Milke rhododendron trail." },
  sankhuwasabha: { population: 158041, areaKm2: 3480, headquarters: "Khandbari", highlight: "Stretches from the Arun valley up to Makalu, the world's fifth-highest peak." },
  bhojpur: { population: 157923, areaKm2: 1507, headquarters: "Bhojpur", highlight: "A rugged eastern hill district traditionally known for khukuri-making." },
  solukhumbu: { population: 104851, areaKm2: 3312, headquarters: "Salleri", highlight: "Everest's home district, covering the Khumbu region and Sagarmatha National Park." },
  okhaldhunga: { population: 139552, areaKm2: 1074, headquarters: "Okhaldhunga", highlight: "A quiet mid-hill district along the old trade route between Kathmandu and the east." },
  khotang: { population: 175298, areaKm2: 1591, headquarters: "Diktel", highlight: "Home to the Halesi Mahadev cave shrine, sacred to Hindus, Buddhists, and Kirats alike." },
  udayapur: { population: 340721, areaKm2: 2063, headquarters: "Gaighat (Triyuga)", highlight: "An inner-Tarai district and site of Nepal's state-owned Udayapur Cement Industry." },

  // ---------------- Madhesh Province ----------------
  saptari: { population: 706255, areaKm2: 1363, headquarters: "Rajbiraj", highlight: "A Tarai district on the Koshi Barrage, with the Chhinnamasta shakti pith pilgrimage site." },
  siraha: { population: 739953, areaKm2: 1188, headquarters: "Siraha", highlight: "Home to Lahan's Sagarmatha Choudhary Eye Hospital, one of Nepal's largest eye-care centres." },
  dhanusha: { population: 867747, areaKm2: 1180, headquarters: "Janakpur (Janakpurdham)", highlight: "Seat of Madhesh Province, centred on the historic Janaki Mandir." },
  mahottari: { population: 706994, areaKm2: 1002, headquarters: "Jaleshwar", highlight: "Where the BP Highway meets the East-West Highway near Bardibas." },
  sarlahi: { population: 862470, areaKm2: 1259, headquarters: "Malangwa", highlight: "A densely subdivided Tarai district known for vegetable farming around Lalbandi." },
  rautahat: { population: 813573, areaKm2: 1126, headquarters: "Gaur", highlight: "Bajjika-speaking Tarai belt with more local municipalities than any other Nepali district." },
  bara: { population: 763137, areaKm2: 1190, headquarters: "Kalaiya", highlight: "Site of Gadhimai's famous quinquennial festival and the historic ruins of Simraungadh." },
  parsa: { population: 654471, areaKm2: 1353, headquarters: "Birgunj", highlight: "Home to Birgunj, Nepal's principal land-trade gateway to India, and Parsa National Park." },

  // ---------------- Bagmati Province ----------------
  kathmandu: { population: 2041587, areaKm2: 395, headquarters: "Kathmandu", highlight: "Nepal's capital district and by far its most populous and densely built-up." },
  lalitpur: { population: 551667, areaKm2: 385, headquarters: "Lalitpur (Patan)", highlight: "Home to Patan Durbar Square and a long tradition of Newar fine metalwork." },
  bhaktapur: { population: 432132, areaKm2: 119, headquarters: "Bhaktapur", highlight: "Nepal's smallest district by area, built around the medieval Newar city of Bhaktapur Durbar Square." },
  kavrepalanchok: { population: 364039, areaKm2: 1396, headquarters: "Dhulikhel", highlight: "Historic Newar towns of Dhulikhel, Banepa and Panauti sit along the old Kathmandu-Tibet trade road." },
  sindhupalchok: { population: 262624, areaKm2: 2542, headquarters: "Chautara", highlight: "Along the Bhote Koshi gorge on the road to Tibet, source of Kathmandu's Melamchi drinking water." },
  rasuwa: { population: 46689, areaKm2: 1544, headquarters: "Dhunche", highlight: "Home to the Langtang valley, the Gosainkunda lakes, and the Rasuwagadhi border crossing to China." },
  nuwakot: { population: 263391, areaKm2: 1121, headquarters: "Bidur", highlight: "Site of the seven-storey Nuwakot Durbar, from where Nepal's unification campaign was launched." },
  dhading: { population: 325710, areaKm2: 1926, headquarters: "Dhading Besi (Nilkantha)", highlight: "Sits beneath the Ganesh Himal range, split by the Prithvi Highway west of Kathmandu." },
  makwanpur: { population: 466073, areaKm2: 2426, headquarters: "Hetauda", highlight: "Home to Hetauda, provincial capital of Bagmati Province, below the Daman viewpoint." },
  sindhuli: { population: 300026, areaKm2: 2491, headquarters: "Sindhulimadhi (Kamalamai)", highlight: "Site of Sindhuli Gadhi fort, where Gorkhali forces once repelled a British expedition." },
  ramechhap: { population: 170302, areaKm2: 1546, headquarters: "Manthali", highlight: "Home to Manthali airport, a busy seasonal alternative gateway for Lukla-Everest flights." },
  dolakha: { population: 172767, areaKm2: 2191, headquarters: "Charikot (Bhimeshwar)", highlight: "Site of the Kalinchok shrine and the Upper Tamakoshi hydropower plant, Nepal's largest." },
  chitwan: { population: 719859, areaKm2: 2218, headquarters: "Bharatpur", highlight: "Home to Chitwan National Park, Nepal's first, and Bharatpur, Bagmati Province's second-largest city." },

  // ---------------- Gandaki Province ----------------
  gorkha: { population: 251027, areaKm2: 3610, headquarters: "Gorkha", highlight: "Cradle of Nepal's unification under Prithvi Narayan Shah, and home to Manaslu (8,163 m)." },
  manang: { population: 5658, areaKm2: 2246, headquarters: "Chame", highlight: "Nepal's least populous district, a trans-Himalayan valley below the Thorong La pass." },
  mustang: { population: 14452, areaKm2: 3573, headquarters: "Jomsom", highlight: "Home to the walled city of Lo Manthang and Muktinath, in the rain-shadow trans-Himalaya." },
  myagdi: { population: 107033, areaKm2: 2297, headquarters: "Beni", highlight: "Sits below Dhaulagiri I (8,167 m), with the Poon Hill viewpoint and Tatopani hot springs nearby." },
  kaski: { population: 600051, areaKm2: 2017, headquarters: "Pokhara", highlight: "Home to Pokhara, Nepal's tourism capital, set beneath Machhapuchhre and the Annapurnas." },
  lamjung: { population: 155852, areaKm2: 1692, headquarters: "Besisahar", highlight: "Besisahar is the trailhead for the Annapurna Circuit trek." },
  tanahun: { population: 321153, areaKm2: 1546, headquarters: "Damauli (Vyas)", highlight: "Birthplace of poet Bhanubhakta Acharya and home to the hilltop Newar town of Bandipur." },
  nawalpur: { population: 378079, areaKm2: 1433, headquarters: "Kawasoti", highlight: "Gandaki Province's only Tarai-belt district, on the Narayani river plain." },
  syangja: { population: 253024, areaKm2: 1164, headquarters: "Putalibazar", highlight: "One of Nepal's leading orange-growing districts, and home to the Kaligandaki-A power station." },
  parbat: { population: 130887, areaKm2: 494, headquarters: "Kusma", highlight: "Known for canyon-spanning suspension bridges and one of the world's highest bungee jumps." },
  baglung: { population: 249211, areaKm2: 1784, headquarters: "Baglung", highlight: "Often called Nepal's 'district of suspension bridges', it is the gateway to Dhorpatan." },

  // ---------------- Lumbini Province ----------------
  palpa: { population: 245027, areaKm2: 1373, headquarters: "Tansen", highlight: "Hill bazaar of Tansen, known for Palpali dhaka weaving and Sen-era history." },
  "nawalparasi-east": { population: 386868, areaKm2: 729, headquarters: "Parasi (Ramgram)", highlight: "Home to the Ramgram stupa, said to hold one of the Buddha's original relics never opened." },
  rupendehi: { population: 1121957, areaKm2: 1360, headquarters: "Siddharthanagar (Bhairahawa)", highlight: "Gateway to Lumbini, birthplace of the Buddha, and the fast-growing Butwal-Bhairahawa corridor." },
  kapilvastu: { population: 682961, areaKm2: 1738, headquarters: "Taulihawa (Kapilvastu)", highlight: "Home to Tilaurakot, the excavated remains of ancient Kapilavastu where Prince Siddhartha grew up." },
  arghakhanchi: { population: 177086, areaKm2: 1193, headquarters: "Sandhikharka", highlight: "Home to the Supa Deurali shrine, in a hill district known for heavy foreign labour migration." },
  gulmi: { population: 246494, areaKm2: 1149, headquarters: "Tamghas (Resunga)", highlight: "Often called the birthplace of Nepali coffee cultivation, beneath the sacred Resunga hill." },
  dang: { population: 674993, areaKm2: 2955, headquarters: "Ghorahi", highlight: "The Dang and Deukhuri valleys form a Tharu heartland and Lumbini Province's capital district." },
  banke: { population: 603194, areaKm2: 2337, headquarters: "Nepalgunj", highlight: "Home to Nepalgunj, the main gateway city of the western Tarai, and Banke National Park." },
  bardiya: { population: 459900, areaKm2: 2025, headquarters: "Gulariya", highlight: "Home to Bardiya National Park, the Tarai's largest, known for tigers and wild elephants." },
  rolpa: { population: 234793, areaKm2: 1879, headquarters: "Liwang", highlight: "A Magar highland district now part of the Guerrilla Trek route." },
  pyuthan: { population: 232019, areaKm2: 1309, headquarters: "Pyuthan (Khalanga)", highlight: "Home to Swargadwari, a hilltop pilgrimage site whose name translates to 'gateway to heaven'." },
  "eastern-rukum": { population: 56786, areaKm2: 1660, headquarters: "Rukumkot", highlight: "A Kham Magar highland district beneath Putha Hiunchuli, sharing the Dhorpatan Hunting Reserve." },

  // ---------------- Karnali Province ----------------
  dolpa: { population: 42774, areaKm2: 7889, headquarters: "Dunai (Thuli Bheri)", highlight: "Nepal's largest district by area, home to Shey Phoksundo National Park and Phoksundo Lake." },
  mugu: { population: 64549, areaKm2: 3535, headquarters: "Gamgadhi (Chhayanath Rara)", highlight: "Home to Rara, Nepal's largest lake, in one of the country's most remote districts." },
  humla: { population: 55394, areaKm2: 5655, headquarters: "Simikot", highlight: "Nepal's remotest district, with the Limi valley and the Hilsa route to Mount Kailash." },
  jumla: { population: 118349, areaKm2: 2531, headquarters: "Jumla Khalanga (Chandannath)", highlight: "Known for organic apples and high-altitude Jumli Marsi rice in the Sinja valley." },
  kalikot: { population: 145292, areaKm2: 1741, headquarters: "Manma (Khandachakra)", highlight: "A rugged mid-Karnali district along the steep Karnali Highway gorge road." },
  dailekh: { population: 252313, areaKm2: 1502, headquarters: "Dailekh (Narayan)", highlight: "Home to Dullu's medieval Khasa-empire stone inscriptions and the Panchakoshi pilgrimage." },
  jajarkot: { population: 189360, areaKm2: 2230, headquarters: "Khalanga (Bheri)", highlight: "A Bheri-basin hill district at the epicentre of Nepal's November 2023 earthquake." },
  "western-rukum": { population: 166740, areaKm2: 1217, headquarters: "Musikot", highlight: "The Karnali half of old Rukum district, historically linked to the Maoist insurgency." },
  salyan: { population: 238515, areaKm2: 1462, headquarters: "Salyan Khalanga (Sharada)", highlight: "Karnali Province's southern hill district and a leading ginger-producing area." },
  surkhet: { population: 415126, areaKm2: 2451, headquarters: "Birendranagar", highlight: "Home to Birendranagar, Karnali Province's capital, and the 12th-century Kakrebihar temple." },

  // ---------------- Sudurpashchim Province ----------------
  kanchanpur: { population: 513757, areaKm2: 1610, headquarters: "Mahendranagar (Bhimdatta)", highlight: "Home to Shuklaphanta National Park, known for one of the world's largest swamp deer herds." },
  kailali: { population: 904666, areaKm2: 3235, headquarters: "Dhangadhi", highlight: "Home to Dhangadhi city, Ghodaghodi Lake, and Nepal's only cable-stayed bridge over the Karnali." },
  achham: { population: 228852, areaKm2: 1680, headquarters: "Mangalsen", highlight: "Home to the Ramaroshan lakes and meadows on the southern flank of Khaptad." },
  doti: { population: 204831, areaKm2: 2025, headquarters: "Dipayal Silgadhi", highlight: "Once the seat of the medieval Doti kingdom, home to the Shaileshwari temple." },
  bajhang: { population: 189085, areaKm2: 3422, headquarters: "Chainpur (Jayaprithvi)", highlight: "Home to Saipal Himal (7,031 m) in Nepal's far northwest." },
  bajura: { population: 138523, areaKm2: 2188, headquarters: "Martadi (Badimalika)", highlight: "Home to the Badimalika temple pilgrimage in the remote far-western high country." },
  dadeldhura: { population: 139602, areaKm2: 1538, headquarters: "Dadeldhura (Amargadhi)", highlight: "Site of Amargadhi Fort, a stronghold of the Nepali general Amar Singh Thapa." },
  baitadi: { population: 242157, areaKm2: 1519, headquarters: "Baitadi Khalanga (Dasharathchand)", highlight: "Home to the Tripurasundari temple in Nepal's far west." },
  darchula: { population: 133310, areaKm2: 2322, headquarters: "Darchula Khalanga (Mahakali)", highlight: "Home to Api Himal (7,132 m) along the Mahakali river frontier with India." },
  // "mahakali" slug intentionally has no entry — it is not a real, separate
  // district (Sudurpashchim has 9, not 10). It was a data-entry duplicate
  // that has since been removed from the live database and from seed.ts.
};

/** Returns the fact entry for a slug, or null if none exists (e.g. the "mahakali" data bug). */
export function getDistrictFact(slug: string): DistrictFact | null {
  return DISTRICT_FACTS[slug] ?? null;
}
