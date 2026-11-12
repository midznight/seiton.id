import fs from "node:fs";
import path from "node:path";

const outputDirectory = process.argv[2];
if (!outputDirectory || !fs.existsSync(outputDirectory)) {
  throw new Error("Direktori output build tidak ditemukan: " + String(outputDirectory));
}

const isCloudflarePreview =
  process.env.CF_PAGES === "1" &&
  process.env.CF_PAGES_BRANCH !== "main";

if (!isCloudflarePreview) {
  console.log("Preview robots safeguard skipped for non-preview build.");
  process.exit(0);
}

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(fullPath);
  }
  return files;
}

let updated = 0;
let analyticsRemoved = 0;
const gtmLoader = '<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-K3LKMTF3"></script>';
const gtmInitializer = [
  "<script>",
  "  window.dataLayer = window.dataLayer || [];",
  "  function gtag(){dataLayer.push(arguments);}",
  "  gtag('js', new Date());",
  "</script>"
].join("\n");
for (const file of collectHtml(outputDirectory)) {
  const originalHtml = fs.readFileSync(file, "utf8");
  let html = originalHtml.replace(gtmLoader, "").replace(gtmInitializer, "");
  if (html !== originalHtml) analyticsRemoved += 1;

  const existingTag = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i);
  if (existingTag && /content=["']noindex,\s*nofollow["']/i.test(existingTag[0])) {
    if (html !== originalHtml) fs.writeFileSync(file, html);
    updated += 1;
    continue;
  }

  let nextHtml;
  if (existingTag) {
    nextHtml = html.replace(existingTag[0], '<meta name="robots" content="noindex, nofollow"/>');
  } else {
    if (!/<\/head>/i.test(html)) {
      throw new Error("Dokumen HTML preview tidak memiliki penutup head: " + file);
    }
    nextHtml = html.replace(/<\/head>/i, '<meta name="robots" content="noindex, nofollow"/>\n</head>');
  }

  fs.writeFileSync(file, nextHtml);
  updated += 1;
}
console.log("GTM disabled on preview output; " + analyticsRemoved + " HTML document(s) had analytics removed.");

console.log("Preview robots safeguard applied to " + updated + " HTML document(s) in " + outputDirectory + ".");
