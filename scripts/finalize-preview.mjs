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
for (const file of collectHtml(outputDirectory)) {
  const html = fs.readFileSync(file, "utf8");
  const existingTag = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i);
  if (existingTag && /content=["']noindex,\s*nofollow["']/i.test(existingTag[0])) continue;

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

console.log("Preview robots safeguard applied to " + updated + " HTML document(s) in " + outputDirectory + ".");
