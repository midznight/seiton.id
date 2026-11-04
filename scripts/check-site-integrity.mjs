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
    return { url, file, html: read(file) };
  } catch {
    errors.push("Sitemap page has no matching file: " + file);
    return null;
  }
}).filter(Boolean);

function linksFrom(markup) {
  return [...markup.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)]
    .map(match => ({
      href: match[1].trim(),
      label: match[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()
    }));
}

let expectedPrimaryLinks = null;
for (const page of pages) {
  const primaryNav = page.html.match(/<nav\b[^>]*class=["']primary-nav["'][^>]*>([\s\S]*?)<\/nav>/);
  const footerNav = page.html.match(/<nav\b[^>]*aria-label=["']Navigasi footer["'][^>]*>([\s\S]*?)<\/nav>/);

  if (!primaryNav) errors.push(page.file + ": primary navigation is missing");
  else {
    const links = linksFrom(primaryNav[1]);
    const signature = JSON.stringify(links.map(link => [link.href, link.label]));
    if (expectedPrimaryLinks === null) expectedPrimaryLinks = signature;
    else if (signature !== expectedPrimaryLinks) errors.push(page.file + ": primary navigation differs from the site-wide menu");

    const exampleLink = links.find(link => link.href === "/portofolio/");
    if (!exampleLink || exampleLink.label !== "Contoh") errors.push(page.file + ': /portofolio/ must be labelled "Contoh"');
    if (!links.some(link => link.href === "/harga/")) errors.push(page.file + ": Harga is missing from the primary navigation");
  }

  if (!footerNav) errors.push(page.file + ": footer navigation is missing");
  else if (!linksFrom(footerNav[1]).some(link => link.href === "/harga/")) errors.push(page.file + ": Harga is missing from the footer navigation");

  if ((page.html.match(/<main\b/g) || []).length !== 1) errors.push(page.file + ": expected exactly one main landmark");
  if (!/<link\b[^>]*rel=["']canonical["']/.test(page.html)) errors.push(page.file + ": canonical URL is missing");
  if (!/<meta\b[^>]*property=["']og:image["']/.test(page.html)) errors.push(page.file + ": Open Graph image is missing");
  if (!/<meta\b[^>]*name=["']twitter:card["']/.test(page.html)) errors.push(page.file + ": Twitter card metadata is missing");

  const publicLinks = linksFrom(page.html);
  if (publicLinks.some(link => /^https:\/\/(admin|umkm|automate-bot)\.seiton\.biz\.id(?:\/|$)/i.test(link.href))) {
    errors.push(page.file + ": internal admin or Worker hostname must not be linked publicly");
  }
}

const placeholderChecks = [
  ["tentang/index.html", /\[(?:ISI NAMA|ISI PERAN|ISI ALASAN MEMULAI SEITON\.ID|ISI FOTO)\]/i],
  ["layanan/menu-qr/index.html", /\[(?:ISI HARGA|ISI ESTIMASI WAKTU)\]/i]
];
for (const [file, pattern] of placeholderChecks) {
  if (pattern.test(read(file))) errors.push(file + ": public placeholder text is still present");
}

const serviceNumbers = [
  ["layanan/katalog-produk/index.html", "01", "/layanan/katalog-produk/"],
  ["layanan/menu-qr/index.html", "02", "/layanan/menu-qr/"],
  ["layanan/profil-google/index.html", "03", "/layanan/profil-google/"],
  ["layanan/website-katalog/index.html", "04", "/layanan/website-katalog/"],
  ["layanan/paket-template/index.html", "05", "/layanan/paket-template/"]
];
const serviceList = read("layanan/index.html");
for (const [file, expected, href] of serviceNumbers) {
  const html = read(file);
  const actual = html.match(/LAYANAN SEITON\s*\/\s*(\d{2})/)?.[1];
  if (actual !== expected) errors.push(file + ": expected service number " + expected + ", found " + (actual ?? "none"));
  const item = serviceList.match(new RegExp('<a\\b[^>]*href="' + href + '"[^>]*>([\\s\\S]*?)<\\/a>'));
  const listed = item?.[1].match(/<span>(\d{2})<\/span>/)?.[1];
  if (listed !== expected) errors.push("layanan/index.html: " + href + " should be numbered " + expected);
}

const pricePage = read("harga/index.html");
if (pricePage.includes("DEFAULT_HARGA_SEITON") || pricePage.includes("Rp299.000")) {
  errors.push("harga/index.html: outdated hard-coded price fallback remains");
}
if (!pricePage.includes("admin.seiton.biz.id/api/pricing")) {
  errors.push("harga/index.html: live pricing API is not configured");
}
if (!pricePage.includes('role="status" aria-live="polite"')) {
  errors.push("harga/index.html: accessible price loading/fallback status is missing");
}

if (errors.length) {
  console.error("Site integrity check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Site integrity check passed for " + pages.length + " sitemap pages.");
}
