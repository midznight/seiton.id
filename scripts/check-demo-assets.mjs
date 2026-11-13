import fs from "node:fs";
import path from "node:path";

const dataset = JSON.parse(fs.readFileSync("src/data/demo-dataset.json", "utf8"));
const imageMap = JSON.parse(fs.readFileSync("src/data/demo-images.json", "utf8"));
const publicRoot = path.resolve("public");
const uploadDirectory = path.resolve("public/assets/dummy-products");
const errors = [];
const mapped = [];
const uploadedButUnmapped = [];
const pending = [];
const expected = new Map(dataset.products.map((product) => [product.sku, product]));
const totals = { source: 0, small: 0, large: 0 };
const maxBytes = { 480: 140 * 1024, 960: 320 * 1024 };

const resolvePublic = (urlPath) => {
  if (typeof urlPath !== "string" || !urlPath.startsWith("/assets/")) return null;
  const fullPath = path.resolve(publicRoot, "." + urlPath);
  return fullPath.startsWith(publicRoot + path.sep) ? fullPath : null;
};

for (const [sku, image] of Object.entries(imageMap)) {
  const product = expected.get(sku);
  if (!product) {
    errors.push("SKU pada demo-images.json tidak ditemukan di dataset: " + sku);
    continue;
  }
  if (!image || typeof image.alt !== "string" || !image.alt.trim()) {
    errors.push("Teks alt kosong untuk " + sku);
    continue;
  }
  const sourcePath = resolvePublic(image.source);
  if (!sourcePath || !image.source.startsWith("/assets/dummy-products/") ||
      !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    errors.push("File sumber Google Flow tidak ditemukan atau path tidak valid untuk " + sku);
    continue;
  }
  totals.source += fs.statSync(sourcePath).size;

  const candidates = typeof image.srcset === "string"
    ? image.srcset.split(",").map((entry) => entry.trim().split(/\s+/))
    : [];
  const widths = candidates.map((entry) => Number.parseInt((entry[1] || "").replace("w", ""), 10));
  if (candidates.length !== 2 || widths[0] !== 480 || widths[1] !== 960 ||
      image.src !== candidates[0][0]) {
    errors.push("srcset responsif harus memiliki varian 480w dan 960w untuk " + sku);
    continue;
  }

  let valid = true;
  for (let i = 0; i < candidates.length; i++) {
    const [urlPath] = candidates[i];
    const fullPath = resolvePublic(urlPath);
    const width = widths[i];
    if (!fullPath || !urlPath.startsWith("/assets/optimized-demo-products/") ||
        !urlPath.endsWith(".webp") || !fs.existsSync(fullPath) ||
        !fs.statSync(fullPath).isFile()) {
      errors.push("Varian WebP " + width + "w tidak ditemukan untuk " + sku + ": " + urlPath);
      valid = false;
      continue;
    }
    const bytes = fs.statSync(fullPath).size;
    if (bytes > maxBytes[width]) {
      errors.push("Varian " + width + "w melebihi budget untuk " + sku + ": " +
        Math.round(bytes / 1024) + " KB");
      valid = false;
      continue;
    }
    totals[width === 480 ? "small" : "large"] += bytes;
  }
  if (valid) mapped.push({ sku, name: product.name, src: image.src });
}

const slugify = (value) => value
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

for (const product of dataset.products) {
  if (imageMap[product.sku]) continue;
  const stem = product.sku + "_" + slugify(product.name);
  const candidates = [".png", ".jpg", ".jpeg", ".webp"].map((extension) =>
    path.join(uploadDirectory, stem + extension)
  );
  const uploaded = candidates.find((file) => fs.existsSync(file));
  if (uploaded) uploadedButUnmapped.push({ sku: product.sku, name: product.name, file: path.basename(uploaded) });
  else pending.push({ sku: product.sku, name: product.name });
}

if (errors.length) {
  console.error("Demo asset check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + " MB";
const reduction = totals.source ? (1 - totals.large / totals.source) * 100 : 0;
console.log("Demo product image coverage: " + mapped.length + "/" + dataset.products.length + " SKU mapped.");
console.log("Google Flow files uploaded but not mapped: " + uploadedButUnmapped.length + ".");
for (const item of uploadedButUnmapped) console.log(" - READY TO MAP " + item.sku + " — " + item.file);
console.log("Products still waiting for an image: " + pending.length + ".");
console.log("Original source files: " + mb(totals.source) + ".");
console.log("Responsive 480w total: " + mb(totals.small) + " (max 140 KB/file).");
console.log("Responsive 960w total: " + mb(totals.large) + " (max 320 KB/file).");
console.log("960w payload reduction against originals: " + reduction.toFixed(1) + "%.");
console.log("All source files, optimized WebP variants, responsive mappings, and alt texts are valid.");
