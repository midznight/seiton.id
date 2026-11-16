import fs from "node:fs";
import path from "node:path";

const fail = [];
const check = (condition, message) => { if (!condition) fail.push(message); };
const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const parseJson = (file) => JSON.parse(read(file));
const words = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;

const guides = parseJson("src/data/guides.json");
const services = parseJson("src/data/services.json");
const sitemap = read("public/sitemap.xml");
const serviceSlugs = new Set(services.map((service) => service.slug));
const guideSlugs = new Set(guides.map((guide) => guide.slug));
const guideTitles = new Set();
const metaTitles = new Set();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);

check(guides.length >= 4, "Pusat panduan harus memiliki minimal empat artikel substantif.");
check(services.length === 12, "Jumlah layanan publik berubah dari 12; periksa apakah ada layanan yang terhapus.");
check(sitemapUrls.length === sitemapSet.size, "Sitemap mengandung URL duplikat.");
check(sitemapUrls.every((url) => url.startsWith("https://seiton.biz.id/")), "Sitemap hanya boleh memuat URL canonical domain utama.");

for (const guide of guides) {
  check(Boolean(guide.slug && guide.title && guide.metaTitle && guide.metaDescription && guide.summary && guide.intro),
    "Panduan memiliki field identitas atau metadata yang kosong: " + (guide.slug || "tanpa-slug"));
  check(!guideTitles.has(guide.title), "Judul panduan duplikat: " + guide.title);
  guideTitles.add(guide.title);
  check(!metaTitles.has(guide.metaTitle), "Meta title duplikat: " + guide.metaTitle);
  metaTitles.add(guide.metaTitle);
  check(guide.metaTitle.length <= 70, "Meta title terlalu panjang: " + guide.slug);
  check(guide.metaDescription.length >= 100 && guide.metaDescription.length <= 160,
    "Meta description harus memiliki 100–160 karakter: " + guide.slug);
  check(words(guide.intro + " " + guide.sections.flatMap((section) => [
    ...(section.paragraphs || []), ...(section.bullets || [])
  ]).join(" ") + " " + guide.faq.map((item) => item.question + " " + item.answer).join(" ")) >= 500,
    "Panduan terlalu tipis; perlu minimal 500 kata substansial: " + guide.slug);
  check(guide.sections.length >= 5, "Panduan perlu memiliki minimal lima bagian: " + guide.slug);
  check(guide.checklist?.length >= 4, "Checklist panduan belum memadai: " + guide.slug);
  check(guide.faq?.length >= 2, "FAQ panduan belum memadai: " + guide.slug);
  check(guide.relatedServices?.length >= 1 && guide.relatedServices.every((slug) => serviceSlugs.has(slug)),
    "Referensi layanan terkait tidak valid: " + guide.slug);
  check((guide.sources || []).every((source) => /^https:\/\//.test(source.url)),
    "Sumber panduan harus berupa HTTPS: " + guide.slug);
  check(sitemapSet.has("https://seiton.biz.id/panduan/" + guide.slug + "/"),
    "URL panduan belum masuk sitemap: " + guide.slug);
}

for (const service of services) {
  check(Boolean(service.metaTitle && service.metaDescription), "Metadata SEO layanan belum tersedia: " + service.slug);
  check(service.metaTitle.length <= 70, "Meta title layanan lebih dari 70 karakter: " + service.slug);
  check(service.metaDescription.length >= 100 && service.metaDescription.length <= 160,
    "Meta description layanan di luar 100–160 karakter: " + service.slug);
  check(!metaTitles.has(service.metaTitle), "Meta title layanan duplikat: " + service.slug);
  metaTitles.add(service.metaTitle);
  check(service.faq?.length >= 2, "FAQ layanan belum cukup: " + service.slug);
  check(sitemapSet.has("https://seiton.biz.id/layanan/" + service.slug + "/"),
    "URL layanan belum masuk sitemap: " + service.slug);
}

const home = read("src/pages/index.astro");
const interactiveHome = read("src/components/InteractiveHome.astro");
const localLanding = read("src/pages/jasa-website-umkm-jember.astro");
const guideDetail = read("src/pages/panduan/[slug].astro");
const serviceDetail = read("src/pages/layanan/[slug].astro");
const baseLayout = read("src/layouts/Base.astro");
const footer = read("src/components/Footer.astro");

check(home.includes("Katalog Digital, Menu QR & Website UMKM"), "Homepage belum memakai target pencarian utama.");
check(interactiveHome.includes("<h1>Jasa katalog digital<br /><span>&amp; website UMKM.</span></h1>"),
  "H1 homepage harus menyebut layanan katalog digital dan website UMKM, sambil mempertahankan tagline brand.");
check(!interactiveHome.includes('alt="Contoh foto produk pertama"') &&
  !interactiveHome.includes('alt="Contoh foto produk kedua"') &&
  !interactiveHome.includes('alt="Contoh foto produk ketiga"'),
  "Alt text gambar pratinjau website katalog tidak boleh berupa label generik.");
check(home.includes("Berbasis di Jember"), "Homepage belum menjelaskan jangkauan layanan dengan akurat.");
check(localLanding.includes("Jasa website dan solusi digital untuk UMKM Jember"), "Landing page lokal Jember tidak ditemukan.");
check(localLanding.includes("melayani secara online") || localLanding.includes("online untuk usaha"),
  "Landing page lokal harus menjelaskan layanan online tanpa mengarang kantor fisik.");
check(!localLanding.includes("@type: \"LocalBusiness\"") && !localLanding.includes('"@type": "LocalBusiness"'),
  "Jangan menambahkan LocalBusiness tanpa bukti lokasi usaha yang memenuhi syarat.");
check(localLanding.includes('"@type": "City", name: "Jember"'), "Area lokal Jember harus dijelaskan melalui Service schema.");
check(guideDetail.includes('"@type": "Article"') && guideDetail.includes("guide.metaTitle") &&
  guideDetail.includes("guide.metaDescription") && guideDetail.includes("guide.faq"),
  "Halaman panduan harus memakai Article schema, metadata unik, dan FAQ yang terlihat.");
check(serviceDetail.includes("service.metaTitle") && serviceDetail.includes("service.metaDescription") &&
  serviceDetail.includes("service.faq"), "Halaman detail layanan belum memakai metadata unik dan FAQ.");
check(baseLayout.includes('"@type": "BreadcrumbList"') && baseLayout.includes("whatsappNumber"),
  "Layout harus menyertakan breadcrumb dan nomor kontak internasional dari URL WhatsApp resmi.");
check(footer.includes('root + "/panduan/"'), "Footer belum menautkan pusat panduan untuk internal discovery.");
check(sitemapSet.has("https://seiton.biz.id/jasa-website-umkm-jember/"),
  "Landing page lokal Jember belum masuk sitemap.");

if (fail.length) {
  console.error("SEO content checks failed:");
  for (const item of fail) console.error(" - " + item);
  process.exit(1);
}
console.log("SEO content checks passed: " + guides.length + " substantive guides, " + services.length +
  " unique service metadata sets, verified internal references, local landing page, and " +
  sitemapUrls.length + " unique sitemap URLs.");
