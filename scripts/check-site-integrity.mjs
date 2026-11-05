import { readFileSync } from "node:fs";
import { join } from "node:path";

const errors = [];
const read = path => readFileSync(join(process.cwd(), path), "utf8");
const sitemap = read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);

if (urls.length !== 14) errors.push("Expected 14 public URLs in sitemap.xml; found " + urls.length);

const pages = urls.map(url => {
  const pathname = new URL(url).pathname;
  const file = pathname === "/" ? "index.html" : pathname.replace(/^\/+|\/+$/g, "") + "/index.html";
  try {
    return { file, html: read(file) };
  } catch {
    errors.push("Sitemap page has no matching file: " + file);
    return null;
  }
}).filter(Boolean);

for (const page of pages) {
  if (!/<meta\b[^>]*name=["']theme-color["'][^>]*content=["']#F5F5F4["']/.test(page.html)) {
    errors.push(page.file + ": theme-color must match the page background");
  }
  if (!/<main\b/.test(page.html)) errors.push(page.file + ": main landmark is missing");
  if (!/<a\b[^>]*href=["']#main["']/.test(page.html)) errors.push(page.file + ": skip link is missing");
}

const home = read("index.html");
const services = read("layanan/index.html");
const prices = read("harga/index.html");
const catalogue = read("layanan/website-katalog/index.html");
const about = read("tentang/index.html");
const portfolio = read("portofolio/index.html");
const terms = read("ketentuan/index.html");

for (const [label, source, href, name] of [
  ["homepage", home, "/harga/#profile", "Website Profile Usaha"],
  ["homepage", home, "/harga/#telegram", "Bot Pesanan Telegram"],
  ["homepage", home, "/harga/#paket-website-telegram", "Paket Website &amp; Telegram"],
  ["service index", services, "/harga/#profile", "Website Profile Usaha"],
  ["service index", services, "/harga/#telegram", "Bot Pesanan Telegram"],
  ["service index", services, "/harga/#paket-website-telegram", "Paket Website &amp; Telegram"]
]) {
  if (!source.includes('href="' + href + '"') || !source.includes(name)) {
    errors.push(label + ": missing catalogue entry " + name);
  }
}

if (!/id="' \+ cardId \+ '"/.test(prices) ||
    !prices.includes("const unitTotal = packageParts.reduce") ||
    !prices.includes("Harga paket")) {
  errors.push("harga/index.html: dynamic product anchors or package comparison are missing");
}
if (prices.includes("Rp299.000") || prices.includes("DEFAULT_HARGA_SEITON")) {
  errors.push("harga/index.html: outdated hard-coded price fallback remains");
}
if (!catalogue.includes("Panel admin untuk menambah, mengubah, atau menghapus produk dan harga tidak termasuk")) {
  errors.push("Website Katalog page: admin CRUD exclusion is not explicit");
}
if (!about.includes("berbasis di Jember, Jawa Timur") ||
    !about.includes("Bot Pesanan WhatsApp belum tersedia")) {
  errors.push("About page: operating context or WhatsApp availability note is missing");
}
if (!portfolio.includes('id="telegram-order-bot"') ||
    !portfolio.includes("Demo publik belum ditampilkan")) {
  errors.push("Portfolio page: Telegram workflow illustration or honest demo disclaimer is missing");
}
if (!terms.includes("Jangan membayar DP sebelum rincian pembatalan dan pengembalian dana")) {
  errors.push("Terms page: pre-DP cancellation/refund checklist is missing");
}

if (errors.length) {
  console.error("Site integrity check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Site integrity check passed for " + pages.length + " sitemap pages and service/pricing consistency.");
}
