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

for (const [sku, image] of Object.entries(imageMap)) {
  const product = expected.get(sku);
  if (!product) {
    errors.push("SKU pada demo-images.json tidak ditemukan di dataset: " + sku);
    continue;
  }
  if (!image || typeof image.src !== "string" || !image.src.startsWith("/assets/")) {
    errors.push("Path gambar tidak valid untuk " + sku);
    continue;
  }
  if (!image.alt || typeof image.alt !== "string" || !image.alt.trim()) {
    errors.push("Teks alt kosong untuk " + sku);
  }

  const diskPath = path.resolve(publicRoot, "." + image.src);
  if (!diskPath.startsWith(publicRoot + path.sep)) {
    errors.push("Path gambar keluar dari public untuk " + sku);
    continue;
  }
  if (!fs.existsSync(diskPath) || !fs.statSync(diskPath).isFile()) {
    errors.push("File gambar yang dipetakan tidak ditemukan: " + image.src + " (" + sku + ")");
    continue;
  }
  mapped.push({ sku, name: product.name, src: image.src });
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

console.log("Demo product image coverage: " + mapped.length + "/" + dataset.products.length + " SKU mapped.");
console.log("Google Flow files uploaded but not mapped: " + uploadedButUnmapped.length + ".");
for (const item of uploadedButUnmapped) {
  console.log(" - READY TO MAP " + item.sku + " — " + item.file);
}
console.log("Products still waiting for an image: " + pending.length + ".");
for (const item of pending) {
  console.log(" - PENDING " + item.sku + " — " + item.name);
}
console.log("All currently mapped image paths and alt texts are valid.");
