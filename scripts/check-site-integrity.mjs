import fs from "node:fs";
import path from "node:path";

const errors = [];
const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const json = (file) => JSON.parse(read(file));
const check = (condition, message) => { if (!condition) errors.push(message); };

const site = json("src/data/site.json");
const services = json("src/data/services.json");
const dataset = json("src/data/demo-dataset.json");
const slugs = services.map((service) => service.slug);
const requiredServices = [
  "paket-etalase", "katalog-produk", "menu-qr", "profil-google",
  "website-katalog", "website-profile", "paket-template", "bot-telegram",
  "sistem-bot-umkm", "paket-combo"
];

check(new Set(slugs).size === slugs.length, "Slug layanan harus unik.");
for (const slug of requiredServices) check(slugs.includes(slug), "Layanan hilang: " + slug);
check(site.navigation.some((item) => item.href === "/kontak/"), "Navigasi Kontak belum tersedia.");
check(site.navigation.some((item) => item.href === "/cerita/"), "Navigasi Cerita belum tersedia.");
check(!site.navigation.some((item) => item.href === "/pendiri/"), "Navigasi Pendiri pribadi tidak boleh berada pada website company.");
check(site.contacts.some((item) => item.label === "WhatsApp" && item.url === "https://wa.me/6285117557133"), "Kontak WhatsApp resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "Email" && item.url === "mailto:seiton.id@gmail.com"), "Kontak email resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "Instagram" && item.url === "https://www.instagram.com/seiton.id"), "Kontak Instagram resmi tidak sesuai.");
check(site.founderProfileUrl === "", "Tautan profil pendiri harus tetap kosong sampai alamat website terpisah tersedia.");

check(dataset.period.fictional === true, "Dataset demo harus ditandai fiktif.");
check(dataset.products.length === 15, "Dataset demo harus memiliki 15 produk.");
check(dataset.summary.orders === 263 && dataset.summary.units === 354 && dataset.summary.grossRevenue === 4668000, "Ringkasan dataset demo berubah dari data yang disetujui.");

const botService = services.find((item) => item.slug === "sistem-bot-umkm");
const comboService = services.find((item) => item.slug === "paket-combo");
check(botService?.features.some((feature) => feature.toLowerCase().includes("menambah, mengubah, dan menghapus produk")), "Ruang lingkup panel admin Sistem Bot UMKM belum disebutkan.");
check(comboService?.features.some((feature) => feature.toLowerCase().includes("website profil")), "Paket Combo belum mencakup website profil.");

const sitemap = read("public/sitemap.xml");
for (const slug of requiredServices) {
  check(sitemap.includes("https://seiton.biz.id/layanan/" + slug + "/"), "Sitemap belum mencantumkan layanan " + slug + ".");
}
for (const route of ["/", "/layanan/", "/harga/", "/contoh/", "/cerita/", "/tentang/", "/kontak/", "/ketentuan/", "/privasi/"]) {
  check(sitemap.includes("<loc>https://seiton.biz.id" + route + "</loc>"), "Sitemap belum mencantumkan " + route);
}

const terms = read("public/ketentuan/index.html");
const privacy = read("public/privasi/index.html");
check(terms.includes("BERLAKU MULAI 5 NOVEMBER 2026"), "Tanggal Ketentuan Layanan berubah.");
check(terms.includes("uang muka yang telah dibayarkan dianggap hangus dan tidak dapat diminta kembali atau dikembalikan"), "Aturan pembatalan DP pada Ketentuan tidak ditemukan.");
check(privacy.includes("BERLAKU MULAI 4 NOVEMBER 2026"), "Tanggal Kebijakan Privasi berubah.");
check(privacy.includes("Informasi konsultasi dan komunikasi disimpan paling lama 24 bulan"), "Aturan retensi pada Kebijakan Privasi tidak ditemukan.");
check(fs.existsSync("public/logo-horizontal.png"), "Logo halaman legal belum tersedia di folder publik.");

const pricing = read("src/pages/harga/index.astro");
check(pricing.includes("https://admin.seiton.biz.id/api/pricing"), "Sumber harga lama harus tetap digunakan.");
check(pricing.includes("angka cadangan") && pricing.includes("tidak menampilkan angka"), "Halaman harga harus menghindari angka fallback.");
check(pricing.includes("Sistem Bot UMKM dan Paket Combo"), "Penawaran layanan lanjutan belum ada.");

const detail = read("src/pages/layanan/[slug].astro");
check(detail.includes('"/bot-umkm/"'), "Halaman Sistem Bot belum memiliki tautan demo sendiri.");
check(detail.includes('"/paket-combo/"'), "Halaman Paket Combo belum memiliki tautan demo sendiri.");
check(read("src/demo/pages/bot-umkm/index.astro").includes("noindex={true}"), "Demo bot belum noindex.");
check(read("src/demo/pages/paket-combo/index.astro").includes("noindex={true}"), "Demo Combo belum noindex.");
check(read("public/_headers").includes("https://demo.seiton.biz.id/*"), "Header noindex untuk domain demo belum tersedia.");
const baseLayout = read("src/layouts/Base.astro");
check(/noindex\s*\?\s*["']noindex, nofollow["']/.test(baseLayout), "Layout belum merender metadata noindex.");

if (errors.length) {
  console.error("Source integrity check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

console.log("Source integrity check passed: services, contacts, dataset, sitemap, legal text, pricing source, and demo indexing.");
