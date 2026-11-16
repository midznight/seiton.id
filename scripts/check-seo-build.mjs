import fs from "node:fs";
import path from "node:path";

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const parseJson = (file) => JSON.parse(read(file));
const extract = (html, regex) => html.match(regex)?.[1] ?? "";
const guides = parseJson("src/data/guides.json");
const services = parseJson("src/data/services.json");
const sitemap = read("dist/sitemap.xml");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueLocations = new Set(locations);
const productionOutput = process.env.CF_PAGES !== "1" || process.env.CF_PAGES_BRANCH === "main";

check(locations.length === uniqueLocations.size, "Generated sitemap contains duplicate URLs.");
check(locations.length === 26, "Expected 26 main-site sitemap URLs; received " + locations.length + ".");
check(read("dist/robots.txt").includes("https://seiton.biz.id/sitemap.xml"),
  "Production robots.txt does not reference the main sitemap.");

const sitemapPaths = locations.map((location) => new URL(location).pathname);
const expectedPaths = [
  "/",
  "/layanan/",
  "/harga/",
  "/contoh/",
  "/cerita/",
  "/kontak/",
  "/panduan/",
  "/jasa-website-umkm-jember/",
  ...services.map((service) => "/layanan/" + service.slug + "/"),
  ...guides.map((guide) => "/panduan/" + guide.slug + "/"),
  "/ketentuan/",
  "/privasi/"
];
const baseLayoutPaths = expectedPaths.filter((pagePath) => pagePath !== "/ketentuan/" && pagePath !== "/privasi/");

for (const pagePath of sitemapPaths) {
  const outputPath = pagePath === "/"
    ? "dist/index.html"
    : path.join("dist", pagePath.replace(/^\//, ""), "index.html");
  check(fs.existsSync(path.resolve(outputPath)), "Sitemap points to a page missing from build output: " + pagePath);
  if (!fs.existsSync(path.resolve(outputPath))) continue;
  const html = read(outputPath);
  const canonicalHref = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  check(canonicalHref === "https://seiton.biz.id" + pagePath,
    "Sitemap route has a missing or mismatched canonical: " + pagePath);
}

for (const pagePath of baseLayoutPaths) {
  const outputPath = pagePath === "/"
    ? "dist/index.html"
    : path.join("dist", pagePath.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(path.resolve(outputPath))) continue;

  const html = read(outputPath);
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i);
  const canonicalHref = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  const robots = extract(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  check(Boolean(title) && title.length <= 85, "Missing/overlong title on " + pagePath);
  check(description.length >= 80 && description.length <= 180,
    "Missing/overlong meta description on " + pagePath + " (" + description.length + ")");
  check(canonicalHref === "https://seiton.biz.id" + pagePath, "Canonical mismatch on " + pagePath);
  if (productionOutput) {
    check(robots.includes("index") && !robots.includes("noindex"),
      "Production indexable page is unexpectedly blocked by robots meta: " + pagePath);
  } else {
    check(robots.includes("noindex") && robots.includes("nofollow"),
      "Preview page must remain noindex,nofollow: " + pagePath);
  }
  check(h1Count === 1, "Expected exactly one H1 on " + pagePath + ", found " + h1Count);

  const scriptMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  check(Boolean(scriptMatch), "JSON-LD is missing from " + pagePath);
  if (scriptMatch) {
    try {
      const data = JSON.parse(scriptMatch[1]);
      const graph = Array.isArray(data["@graph"]) ? data["@graph"] : [];
      check(graph.some((item) => item["@type"] === "Organization"),
        "Organization schema missing from " + pagePath);
      if (pagePath !== "/") {
        check(graph.some((item) => item["@type"] === "BreadcrumbList"),
          "BreadcrumbList schema missing from " + pagePath);
      }
      if (pagePath.startsWith("/panduan/") && pagePath !== "/panduan/") {
        check(graph.some((item) => item["@type"] === "Article"),
          "Article schema missing from " + pagePath);
        check(/property=["']og:type["']\s+content=["']article["']/.test(html),
          "Open Graph article type missing from " + pagePath);
      }
      if (pagePath === "/jasa-website-umkm-jember/") {
        const service = graph.find((item) => item["@type"] === "Service");
        check(Boolean(service?.areaServed?.some((area) => area.name === "Jember")),
          "Jember service area schema is missing.");
      }
      const organization = graph.find((item) => item["@type"] === "Organization");
      const phone = organization?.contactPoint?.[0]?.telephone;
      check(/^\+\d{10,15}$/.test(phone || ""), "Organization contactPoint telephone is not E.164 on " + pagePath);
    } catch (error) {
      errors.push("Invalid JSON-LD on " + pagePath + ": " + error.message);
    }
  }
}

const homepage = read("dist/index.html");
check(homepage.includes("Katalog Digital, Menu QR &amp; Website UMKM"),
  "Homepage keyword-aligned title missing in build output.");
const localPage = read("dist/jasa-website-umkm-jember/index.html");
check(localPage.includes("UMKM Jember"), "Jember page is missing local intent in built output.");

const demoPages = [
  "dist-demo/index.html",
  "dist-demo/katalog-whatsapp/index.html",
  "dist-demo/menu-qr/index.html"
];
for (const file of demoPages) {
  const html = read(file);
  check(/name=["']robots["']\s+content=["']noindex, nofollow["']/.test(html),
    "Demo must retain noindex,nofollow: " + file);
  check(!/<script\s+type=["']application\/ld\+json["']/.test(html),
    "Fictional demo output must not inherit main-site structured data: " + file);
}

for (const location of locations) {
  const url = new URL(location);
  check(url.hostname === "seiton.biz.id", "Sitemap contains a non-primary host: " + location);
}

if (errors.length) {
  console.error("SEO build verification failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log("SEO build verification passed: " + locations.length +
  " sitemap URLs, unique canonicals, titles, descriptions, H1s, breadcrumbs, JSON-LD, article metadata, and noindex demo pages.");
