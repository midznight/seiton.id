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
  "sistem-bot-umkm", "paket-combo", "setup-ai-gateway", "setup-portal-otp"
];

check(new Set(slugs).size === slugs.length, "Slug layanan harus unik.");
for (const slug of requiredServices) check(slugs.includes(slug), "Layanan hilang: " + slug);
check(!site.navigation.some((item) => item.href === "/kontak/"), "Navigasi Kontak tidak boleh menduplikasi tombol Konsultasi.");
check(read("src/components/Header.astro").includes('href={path("/kontak/")}>Konsultasi</a>'), "Aksi Konsultasi utama belum mengarah ke kontak.");
check(site.navigation.some((item) => item.href === "/cerita/"), "Navigasi Cerita belum tersedia.");
check(!site.navigation.some((item) => item.href === "/pendiri/"), "Navigasi Pendiri pribadi tidak boleh berada pada website company.");
check(!site.navigation.some((item) => item.href === "/tentang/"), "Informasi perusahaan sudah digabung ke halaman Cerita.");
check(site.navigation.length === 5, "Navigasi utama harus memiliki lima menu dan satu aksi Konsultasi.");
check(site.contacts.some((item) => item.label === "WhatsApp" && item.url === "https://wa.me/6285117557133"), "Kontak WhatsApp resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "Email" && item.url === "mailto:seiton.id@gmail.com"), "Kontak email resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "Instagram" && item.value === "@seiton.id" && item.url === "https://www.instagram.com/seiton.id"), "Kontak Instagram resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "TikTok" && item.value === "@seiton.id" && item.url === "https://www.tiktok.com/@seiton.id"), "Kontak TikTok resmi tidak sesuai.");
check(site.contacts.some((item) => item.label === "Threads" && item.value === "@seiton.id" && item.url === "https://www.threads.com/@seiton.id"), "Kontak Threads resmi tidak sesuai.");
check(site.contacts.length === 5, "Kontak resmi harus memiliki lima kanal yang terdaftar.");
const footerComponent = read("src/components/Footer.astro");
const contactBlock = read("src/components/ContactBlock.astro");
const whatsappCta = read("src/components/WhatsAppCTA.astro");
check(footerComponent.includes('import ContactBlock from "./ContactBlock.astro";') &&
  footerComponent.includes('class="footer-contact-heading"') && footerComponent.includes("<ContactBlock/>"),
  "Footer harus menampilkan ContactBlock dengan label Kontak Seiton.id.");
check(contactBlock.includes("site.contacts.map") && contactBlock.includes('class="contact-item"'),
  "ContactBlock harus merender kanal dari satu sumber site.json.");
check(whatsappCta.includes('import site from "../data/site.json";') &&
  whatsappCta.includes('site.contacts.find((contact) => contact.label === "WhatsApp")') &&
  !whatsappCta.includes("6285117557133"),
  "WhatsApp CTA harus menggunakan satu sumber kontak pada site.json, tanpa nomor hard-coded.");
check(read("src/styles/site.css").includes(".footer-contact-block .contact-item{min-height:48px"),
  "Tautan kontak di footer harus memiliki target sentuh minimal 44 piksel.");
check(site.founderProfileUrl === "", "Tautan profil pendiri harus tetap kosong sampai alamat website terpisah tersedia.");

check(dataset.period.fictional === true, "Dataset demo harus ditandai fiktif.");
const demoImages = json("src/data/demo-images.json");
for (const [sku, image] of Object.entries(demoImages)) {
  check(dataset.products.some((product) => product.sku === sku), "Pemetaan foto memiliki SKU yang tidak dikenal: " + sku);
  check(typeof image.src === "string" && image.src.startsWith("/assets/"), "Path foto demo tidak valid untuk " + sku);
  check(typeof image.alt === "string" && image.alt.trim().length > 0, "Teks alt foto belum tersedia untuk " + sku);
  check(typeof image.source === "string" && image.source.startsWith("/assets/dummy-products/"), "Path foto sumber tidak valid untuk " + sku);
  check(image.src === "/assets/optimized-demo-products/" + sku + "_480.webp", "Path thumbnail WebP tidak valid untuk " + sku);
  check(typeof image.srcset === "string" &&
    image.srcset.includes(sku + "_480.webp 480w") &&
    image.srcset.includes(sku + "_960.webp 960w"), "srcset responsif 480w/960w belum lengkap untuk " + sku);
  const sourcePath = path.resolve("public", "." + image.source);
  check(sourcePath.startsWith(path.resolve("public") + path.sep) && fs.existsSync(sourcePath), "File foto sumber tidak ditemukan untuk " + sku);
}
check(fs.existsSync("public/assets/dummy-products/.gitkeep"), "Folder upload foto dummy belum tersedia.");
check(fs.existsSync("assets.md"), "Panduan foto dan prompt Google Flow belum tersedia.");
check(read("assets.md").includes("Master style prompt Google Flow"), "Master prompt Google Flow belum tersedia di assets.md.");
check(JSON.parse(read("package.json")).scripts["check:assets"] === "node scripts/check-demo-assets.mjs", "Pemeriksaan aset demo belum terdaftar.");
check(JSON.parse(read("package.json")).scripts["prepare:assets"] === "node scripts/optimize-demo-assets.mjs", "Langkah optimasi gambar belum terdaftar.");
check(JSON.parse(read("package.json")).dependencies.sharp === "0.35.5", "Versi Sharp untuk optimasi gambar belum dipatok.");
check(fs.existsSync("scripts/optimize-demo-assets.mjs"), "Skrip optimasi WebP responsif belum tersedia.");
check(fs.existsSync("scripts/strip-source-demo-assets.mjs"), "Penghapusan file sumber dari output deployment belum tersedia.");
check(read("scripts/strip-source-demo-assets.mjs").includes("/analytics-consent.js") &&
  read("scripts/strip-source-demo-assets.mjs").includes("/analytics-consent.css"),
  "Pusat demonstrasi harus menghapus controller dan stylesheet Analytics milik website utama.");
check(read("scripts/strip-source-demo-assets.mjs").includes('candidates.push("analytics-consent.js", "analytics-consent.css", "sitemap.xml")') &&
  read("scripts/strip-source-demo-assets.mjs").includes('User-agent: *\\nAllow: /\\n'),
  "Pusat demonstrasi harus menghapus sitemap utama dan membuat robots.txt yang tidak merujuk sitemap domain utama.");
check(fs.existsSync("scripts/check-performance-budget.mjs"), "Audit budget CSS/JS belum tersedia.");
check(json("package.json").scripts["check:performance"] === "node scripts/check-performance-budget.mjs", "Perintah audit performa belum terdaftar.");
check(dataset.products.length === 15, "Dataset demo harus memiliki 15 produk.");
check(dataset.summary.orders === 263 && dataset.summary.units === 354 && dataset.summary.grossRevenue === 4668000, "Ringkasan dataset demo berubah dari data yang disetujui.");

const botService = services.find((item) => item.slug === "sistem-bot-umkm");
const comboService = services.find((item) => item.slug === "paket-combo");
check(botService?.features.some((feature) => feature.toLowerCase().includes("menambah, mengubah, dan menghapus produk")), "Ruang lingkup panel admin Sistem Bot UMKM belum disebutkan.");
check(comboService?.features.some((feature) => feature.toLowerCase().includes("website profil")), "Paket Combo belum mencakup website profil.");
const aiSetup = services.find((item) => item.slug === "setup-ai-gateway");
const otpSetup = services.find((item) => item.slug === "setup-portal-otp");
check(aiSetup?.name === "Setup AI Gateway & Bot Asisten 24/7", "Layanan Setup AI Gateway belum memakai nama publik yang disetujui.");
check(aiSetup?.description.toLowerCase().includes("akun serta lisensi") && aiSetup?.description.toLowerCase().includes("tidak termasuk penjualan akun pihak ketiga"), "Layanan AI harus menggunakan akun/lisensi pelanggan dan tidak boleh menjual akun mentah.");
check(otpSetup?.name === "Setup Portal OTP & Email Custom Domain", "Layanan Setup Portal OTP belum memakai nama publik yang disetujui.");
check(otpSetup?.description.toLowerCase().includes("tautan akses privat") && otpSetup?.description.toLowerCase().includes("bukan inbox publik"), "Deskripsi portal OTP harus menjelaskan mailbox privat.");
check(!JSON.stringify(services).toLowerCase().includes("akun polosan"), "Istilah penjualan akun mentah tidak boleh tampil pada katalog publik.");

const sitemap = read("public/sitemap.xml");
for (const slug of requiredServices) {
  check(sitemap.includes("https://seiton.biz.id/layanan/" + slug + "/"), "Sitemap belum mencantumkan layanan " + slug + ".");
}
for (const route of ["/", "/layanan/", "/harga/", "/contoh/", "/cerita/", "/kontak/", "/ketentuan/", "/privasi/"]) {
  check(sitemap.includes("<loc>https://seiton.biz.id" + route + "</loc>"), "Sitemap belum mencantumkan " + route);
}

const terms = read("public/ketentuan/index.html");
const privacy = read("public/privasi/index.html");
check(terms.includes("BERLAKU MULAI 5 NOVEMBER 2026"), "Tanggal Ketentuan Layanan berubah.");
check(terms.includes("uang muka yang telah dibayarkan dianggap hangus dan tidak dapat diminta kembali atau dikembalikan"), "Aturan pembatalan DP pada Ketentuan tidak ditemukan.");
check(privacy.includes("BERLAKU MULAI 13 NOVEMBER 2026"), "Tanggal Kebijakan Privasi berubah.");
check(privacy.includes("Informasi konsultasi dan komunikasi disimpan paling lama 24 bulan"), "Aturan retensi pada Kebijakan Privasi tidak ditemukan.");
for (const [file, content] of [["public/ketentuan/index.html", terms], ["public/privasi/index.html", privacy]]) {
  check(!content.includes("fonts.googleapis.com") && !content.includes("fonts.gstatic.com"),
    "Halaman legal masih memuat font pihak ketiga: " + file);
  check(!content.includes("favicon-32.png") && !content.includes("favicon-180.png"),
    "Halaman legal masih merujuk ikon yang tidak tersedia: " + file);
}
check(!read("public/site.css").includes("Poppins"), "Legacy legal CSS belum memakai system font stack.");
check(fs.existsSync("public/logo-horizontal.png"), "Logo halaman legal belum tersedia di folder publik.");
check(fs.existsSync("public/assets/logo-horizontal-transparan.png"), "Logo horizontal resmi Seiton belum tersedia di folder publik.");
check(read("public/_redirects").includes("/tentang/ /cerita/ 301"), "URL Tentang lama belum diarahkan ke halaman Cerita.");

const homePage = read("src/pages/index.astro");
const servicesPage = read("src/pages/layanan/index.astro");
const examplesPage = read("src/pages/contoh/index.astro");
const uiStyles = read("src/styles/site.css");
const pageStyles = read("src/styles/pages.css");
const siteUrls = read("src/utils/site-urls.js");
check(homePage.includes('class="card-grid service-grid"'), "Grid layanan unggulan beranda belum memakai layout khusus.");
check(!homePage.includes("showcase-float"), "Label mengambang yang berpotensi menimpa pratinjau harus dihapus.");
check(!uiStyles.includes("showcase-float"), "CSS label mengambang yang sudah tidak digunakan masih tersisa.");
check(!uiStyles.includes(".split{") && !uiStyles.includes(".pill{"), "Aturan layout lama yang tidak terpakai masih tersisa.");
check(servicesPage.includes("service-directory-grid"), "Daftar layanan belum memakai grid katalog yang seimbang.");
check(examplesPage.includes("demo-grid") && (examplesPage.match(/<article class="card">/g) || []).length === 6, "Halaman contoh harus menampilkan enam kartu demo dalam grid.");
check(!examplesPage.includes('href="/tentang/"'), "Tautan internal masih mengarah ke halaman Tentang lama.");
check(examplesPage.includes('href="/cerita/"'), "Halaman contoh belum mengarah ke Cerita Seiton.");
check(uiStyles.includes("--font-ui") && uiStyles.includes("font-family:var(--font-ui)"), "Sistem font utama belum didefinisikan secara konsisten.");
check(uiStyles.includes(":focus-visible"), "Indikator fokus keyboard belum tersedia.");
check(homePage.includes('role="tablist" aria-orientation="horizontal"') && homePage.includes("activateTab") && homePage.includes('event.key === "Home"') && homePage.includes('event.key === "End"'), "Interaksi tab pratinjau beranda tidak lengkap.");
const tabIds = [...homePage.matchAll(/data-showcase-tab="([^"]+)"/g)].map((match) => match[1]);
const panelIds = [...homePage.matchAll(/data-showcase-panel="([^"]+)"/g)].map((match) => match[1]);
check(tabIds.length === 3 && [...tabIds].sort().join(",") === [...panelIds].sort().join(","), "Setiap tab pratinjau harus memiliki satu panel yang sesuai.");
check(uiStyles.includes("font-size:16px"), "Ukuran teks dasar belum memenuhi ukuran baca yang nyaman.");
check(uiStyles.includes(".service-grid{grid-template-columns:repeat(4"), "Grid layanan unggulan desktop belum memiliki empat kolom.");
check(uiStyles.includes(".service-directory-grid{grid-template-columns:repeat(2"), "Grid daftar layanan belum memakai dua kolom.");
check(pageStyles.includes(".demo-notice{"), "Keterangan demonstrasi belum dipisahkan dari grid demo.");


const pricing = read("src/pages/harga/index.astro");
check(pricing.includes("https://admin.seiton.biz.id/api/pricing"), "Sumber harga lama harus tetap digunakan.");
check(pricing.includes("angka cadangan") && pricing.includes("tidak menampilkan angka"), "Halaman harga harus menghindari angka fallback.");
check(pricing.includes("Sistem Bot UMKM dan Paket Combo"), "Penawaran layanan lanjutan belum ada.");

const detail = read("src/pages/layanan/[slug].astro");
check(detail.includes('"/bot-umkm/"'), "Halaman Sistem Bot belum memiliki tautan demo sendiri.");
check(detail.includes('"/paket-combo/"'), "Halaman Paket Combo belum memiliki tautan demo sendiri.");
check(read("src/demo/pages/bot-umkm/index.astro").includes("noindex={true}"), "Demo bot belum noindex.");
for (const file of [
  "src/demo/pages/menu-qr/index.astro",
  "src/demo/pages/katalog-whatsapp/index.astro",
  "src/demo/pages/website-katalog/index.astro",
  "src/demo/pages/website-katalog/katalog/index.astro",
  "src/demo/pages/bot-umkm/index.astro"
]) {
  const content = read(file);
  check(content.includes("srcset={image.srcset}") && content.includes('decoding="async"') && content.includes("sizes="),
    "Gambar produk belum memakai responsive srcset, sizes, dan async decoding: " + file);
}
check(read("src/demo/pages/paket-combo/index.astro").includes("noindex={true}"), "Demo Combo belum noindex.");
check(read("public/_headers").includes("https://demo.seiton.biz.id/*"), "Header noindex untuk domain demo belum tersedia.");
const baseLayout = read("src/layouts/Base.astro");
const analyticsConsent = read("public/analytics-consent.js");
check(baseLayout.includes('src="/analytics-consent.js"') && baseLayout.includes("!demoSite"),
  "Main layout harus memuat pengelola persetujuan Analytics dan mengecualikan demo.");
check(!baseLayout.includes("googletagmanager.com/gtm.js"), "GTM tidak boleh dimuat langsung sebelum persetujuan.");
check(analyticsConsent.includes("GTM-K3LKMTF3") && analyticsConsent.includes("seiton.biz.id") &&
  analyticsConsent.includes("analytics_storage") && analyticsConsent.includes('"denied"'),
  "Kontrol GTM produksi dan status consent default denied harus tersedia.");
check(privacy.includes("Google Analytics 4") && privacy.includes("G-9Z02GKBZQX") &&
  privacy.includes("14 bulan") && privacy.includes("persetujuan eksplisit"),
  "Kebijakan Privasi harus mengidentifikasi GA4, retensi, dan persetujuan.");
check(terms.includes("/analytics-consent.js") && privacy.includes("/analytics-consent.js"),
  "Halaman legal harus memuat pengelola persetujuan Analytics.");

check(/noindex\s*\|\|\s*isPreviewBuild\s*\?\s*["\x27]noindex, nofollow["\x27]/.test(baseLayout), "Layout belum merender metadata noindex otomatis pada preview.");


check(siteUrls.includes('process.env.CF_PAGES_BRANCH !== "main"'), "Pemilihan URL preview harus mengikuti branch Cloudflare Pages.");
check(siteUrls.includes("https://rebuild.seiton-main-preview.pages.dev") && siteUrls.includes("https://rebuild.seiton-demo-preview.pages.dev"), "Alias preview kedua project belum ditetapkan.");
check(read("src/components/Header.astro").includes("siteUrls.main"), "Header demo harus menggunakan URL utama sesuai environment.");
check(read("src/components/Footer.astro").includes("siteUrls.main"), "Footer demo harus menggunakan URL utama sesuai environment.");
check(read("src/pages/contoh/index.astro").includes("siteUrls.demo"), "Kartu demo harus menggunakan URL demo sesuai environment.");
check(detail.includes("siteUrls.demo"), "Tautan demo pada detail layanan harus menggunakan URL sesuai environment.");
check(read("src/demo/pages/paket-combo/index.astro").includes("siteUrls.main"), "CTA Paket Combo harus menggunakan URL utama sesuai environment.");
check(baseLayout.includes("isPreviewBuild") && baseLayout.includes("noindex, nofollow"), "Preview harus diberi metadata noindex secara otomatis.");
const needContactAnchor = homePage.match(/<a class="result-contact"[^>]*>/)?.[0] || "";
check(needContactAnchor.includes('data-need-contact href=') && needContactAnchor.includes('target="_blank" rel="noopener noreferrer"'), "CTA pemilih kebutuhan harus memakai perilaku tautan yang aman.");
check((needContactAnchor.match(/target="_blank"/g) || []).length === 1 && (needContactAnchor.match(/rel="noopener noreferrer"/g) || []).length === 1, "CTA pemilih kebutuhan tidak boleh memiliki atribut tautan ganda.");
check(pricing.includes("new AbortController()") && pricing.includes("clearTimeout(timeoutId)") && pricing.includes("grid.replaceChildren()"), "Loader harga harus memiliki timeout dan mengganti kartu secara atomik.");
check(fs.existsSync("scripts/test-customer-journey.mjs"), "Pengujian perjalanan pelanggan belum tersedia.");
check(json("package.json").scripts["test:journey"] === "node scripts/test-customer-journey.mjs", "Perintah test:journey belum terdaftar.");


for (const legalPath of ["public/ketentuan/index.html", "public/privasi/index.html"]) {
  const legalHtml = read(legalPath);
  check(!legalHtml.includes('href="/portofolio/"'), "Navigasi legal masih mengarah ke rute Portofolio yang tidak tersedia: " + legalPath);
  check(!legalHtml.includes('href="/tentang/"'), "Navigasi legal masih memakai menu Tentang lama: " + legalPath);
  check(legalHtml.includes('href="/contoh/">Contoh</a>') && legalHtml.includes('href="/cerita/">Cerita</a>'), "Navigasi legal belum mengikuti menu Contoh dan Cerita: " + legalPath);
  check(legalHtml.includes('href="/kontak/" class="button button-orange nav-cta">Konsultasi</a>'), "CTA Konsultasi halaman legal harus menuju halaman Kontak seperti halaman lain: " + legalPath);
}

check(fs.existsSync("scripts/finalize-preview.mjs"), "Langkah pengamanan indeks preview belum tersedia.");
check(json("package.json").scripts["build:site"].includes("finalize-preview.mjs dist") && json("package.json").scripts["build:demo"].includes("finalize-preview.mjs dist-demo"), "Kedua target build harus menjalankan pengamanan indeks preview.");


const otpWorker = read("workers/otp-portal/src/index.js");
const otpParser = read("workers/otp-portal/src/email-parser.js");
const otpTests = read("workers/otp-portal/test/otp-portal.test.js");
const otpWrangler = read("workers/otp-portal/wrangler.toml");
const ownerWorker = read("workers/site-admin/worker.js");
const ownerWrangler = read("workers/site-admin/wrangler.toml");
check(otpWorker.includes("ensureLegacyMailbox") && otpWorker.includes("OTP_KV.get(\"mailbox:\" + mailboxId)"),
  "Portal OTP harus mempertahankan dan memigrasikan link mailbox legacy dari bot Telegram.");
check(otpWorker.includes("encryptOtpRecord(this.env, body.record)") && otpWorker.includes("decryptOtpRecord(this.env, value)") &&
  otpWorker.includes("MESSAGE_TTL_SECONDS = 3600") && otpWorker.includes("MAX_MESSAGES_PER_MAILBOX = 5"),
  "Isi email OTP harus dienkripsi AES-GCM dan dibatasi lima pesan dengan TTL satu jam.");
check(otpWorker.includes("OTP_EMAIL_ENCRYPTION_KEY_MISSING") && otpWorker.includes("OTP_EMAIL_ENCRYPTION_KEY_INVALID"),
  "Worker OTP harus menolak konfigurasi kunci enkripsi yang hilang atau tidak valid.");
check(otpWorker.includes("async email(message, env)") && otpWorker.includes("MAILBOX_INDEX") &&
  otpWorker.includes("HttpOnly") && otpWorker.includes("SameSite=Strict"),
  "Worker OTP harus memiliki Email Routing handler, Durable Object, dan sesi cookie yang aman.");
check(otpParser.includes("export function parseEmail") && otpParser.includes("quoted-printable"),
  "Parser MIME lokal harus tersedia tanpa dependency runtime eksternal.");
check(otpTests.includes("legacy Telegram mailbox links migrate") && otpTests.includes("encrypted.ciphertext") &&
  otpTests.includes("OTP_EMAIL_ENCRYPTION_KEY"),
  "Tes portal harus meliputi link legacy dan enkripsi pesan OTP.");
check(otpWrangler.includes('binding = "OTP_KV"') && otpWrangler.includes('binding = "MUSE_KV"') &&
  otpWrangler.includes('class_name = "MailboxIndex"'),
  "Binding portal OTP, MUSE_KV, dan Durable Object harus tercantum pada konfigurasi.");
check(ownerWorker.includes("async function activeSession") && ownerWorker.includes("function sameOriginAdmin") &&
  ownerWorker.includes("function callOtpBackend") && ownerWorker.includes("function otpPage()"),
  "Panel pemilik harus mempertahankan autentikasi live dan memiliki UI/backend Portal OTP.");
check(ownerWorker.includes('u.pathname==="/api/admin/otp/mailboxes"') &&
  ownerWorker.includes('u.pathname==="/api/admin/otp/mailboxes/rotate"') &&
  ownerWorker.includes('u.pathname==="/api/admin/otp/mailboxes/revoke"') &&
  ownerWorker.includes("OTP_INTERNAL_SECRET") && ownerWorker.includes("href='/otp/'"),
  "Panel pemilik harus menyediakan endpoint provision/list/rotate/revoke Portal OTP.");
check(ownerWrangler.includes('binding = "OTP_BACKEND"') &&
  ownerWrangler.includes('service = "seiton-otp-portal"'),
  "Site admin harus menggunakan service binding OTP_BACKEND.");

if (errors.length) {
  console.error("Source integrity check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

console.log("Source integrity check passed: services, contacts, dataset, demo image mappings, asset upload guide, sitemap, legal text, pricing source, and demo indexing.");
