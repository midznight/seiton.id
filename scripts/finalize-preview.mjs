import fs from "node:fs";
import path from "node:path";

const outputDirectory = process.argv[2];
if (!outputDirectory || !fs.existsSync(outputDirectory)) {
  throw new Error("Direktori output build tidak ditemukan: " + String(outputDirectory));
}

const isCloudflareProduction =
  process.env.CF_PAGES === "1" &&
  process.env.CF_PAGES_BRANCH === "main";
const isCloudflarePreview =
  process.env.CF_PAGES === "1" &&
  process.env.CF_PAGES_BRANCH !== "main";

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(fullPath);
  }
  return files;
}

if (isCloudflareProduction) {
  console.log("Production build: GTM is retained; preview robots safeguard skipped.");
  process.exit(0);
}

const gtmLoader = '<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-K3LKMTF3"></script>';
const gtmInitializer = [
  "<script>",
  "  window.dataLayer = window.dataLayer || [];",
  "  function gtag(){dataLayer.push(arguments);}",
  "  gtag('js', new Date());",
  "</script>"
].join("\n");

let updated = 0;
let analyticsRemoved = 0;
for (const file of collectHtml(outputDirectory)) {
  const originalHtml = fs.readFileSync(file, "utf8");
  let html = originalHtml.replace(gtmLoader, "").replace(gtmInitializer, "");
  if (html !== originalHtml) analyticsRemoved += 1;

  if (isCloudflarePreview) {
    const existingTag = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i);
    if (!(existingTag && /content=["']noindex,\s*nofollow["']/i.test(existingTag[0]))) {
      if (existingTag) {
        html = html.replace(existingTag[0], '<meta name="robots" content="noindex, nofollow"/>');
      } else {
        if (!/<\/head>/i.test(html)) {
          throw new Error("Dokumen HTML preview tidak memiliki penutup head: " + file);
        }
        html = html.replace(/<\/head>/i, '<meta name="robots" content="noindex, nofollow"/>\n</head>');
      }
    }
  }

  if (html !== originalHtml) {
    fs.writeFileSync(file, html);
    updated += 1;
  }
}

if (isCloudflarePreview) {
  console.log("Preview robots safeguard applied to " + updated + " HTML document(s) in " + outputDirectory + ".");
} else {
  console.log("Local non-production build: GTM suppressed; " + updated + " HTML document(s) updated.");
}
console.log("GTM removed from " + analyticsRemoved + " non-production HTML document(s).");
