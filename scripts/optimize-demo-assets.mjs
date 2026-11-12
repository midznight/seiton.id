import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const dataset = JSON.parse(await fs.readFile("src/data/demo-dataset.json", "utf8"));
const imageMap = JSON.parse(await fs.readFile("src/data/demo-images.json", "utf8"));
const publicRoot = path.resolve("public");
const outputDir = path.resolve(publicRoot, "assets/optimized-demo-products");
const variants = [
  { width: 480, maxBytes: 140 * 1024 },
  { width: 960, maxBytes: 320 * 1024 }
];
const qualityFallbacks = [80, 76, 72];
const errors = [];
let sourceBytes = 0;
let smallBytes = 0;
let largeBytes = 0;

const resolvePublic = (urlPath, label) => {
  if (typeof urlPath !== "string" || !urlPath.startsWith("/assets/")) {
    throw new Error("Path " + label + " tidak valid: " + urlPath);
  }
  const fullPath = path.resolve(publicRoot, "." + urlPath);
  if (!fullPath.startsWith(publicRoot + path.sep)) {
    throw new Error("Path " + label + " keluar dari folder public: " + urlPath);
  }
  return fullPath;
};

if (dataset.products.length !== 15) {
  throw new Error("Optimizer mengharapkan 15 SKU demo, ditemukan " + dataset.products.length);
}
if (Object.keys(imageMap).length !== dataset.products.length) {
  throw new Error("Semua SKU harus mempunyai pemetaan gambar sebelum optimasi.");
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const product of dataset.products) {
  const image = imageMap[product.sku];
  if (!image) {
    errors.push("Pemetaan gambar hilang untuk " + product.sku);
    continue;
  }

  const inputPath = resolvePublic(image.source, "source " + product.sku);
  const sourceStat = await fs.stat(inputPath).catch(() => null);
  if (!sourceStat?.isFile()) {
    errors.push("Foto sumber tidak ditemukan untuk " + product.sku + ": " + image.source);
    continue;
  }

  const metadata = await sharp(inputPath, { failOn: "error" }).metadata();
  if (!metadata.width || !metadata.height) {
    errors.push("Dimensi foto sumber tidak dapat dibaca untuk " + product.sku);
    continue;
  }
  sourceBytes += sourceStat.size;

  for (const variant of variants) {
    const outputPath = path.join(outputDir, product.sku + "_" + variant.width + ".webp");
    const temporaryPath = outputPath + ".tmp.webp";
    let accepted = false;
    let finalStat;
    let chosenQuality = qualityFallbacks[0];

    for (const quality of qualityFallbacks) {
      chosenQuality = quality;
      await fs.rm(temporaryPath, { force: true });
      await sharp(inputPath, { failOn: "error" })
        .rotate()
        .resize(variant.width, variant.width, {
          fit: "cover",
          position: "attention",
          kernel: sharp.kernel.lanczos3
        })
        .webp({
          quality,
          effort: 6,
          smartSubsample: true,
          alphaQuality: 90
        })
        .toFile(temporaryPath);

      finalStat = await fs.stat(temporaryPath);
      if (finalStat.size <= variant.maxBytes || quality === qualityFallbacks.at(-1)) {
        accepted = finalStat.size <= variant.maxBytes;
        if (accepted) await fs.rename(temporaryPath, outputPath);
        break;
      }
    }

    if (!accepted) {
      await fs.rm(temporaryPath, { force: true });
      errors.push("Hasil WebP " + variant.width + " px melewati batas " +
        Math.round(variant.maxBytes / 1024) + " KB untuk " + product.sku +
        ": " + Math.round(finalStat.size / 1024) + " KB");
      continue;
    }

    if (variant.width === 480) smallBytes += finalStat.size;
    else largeBytes += finalStat.size;

    const outputMeta = await sharp(outputPath).metadata();
    console.log(product.sku + " " + variant.width + "w: " +
      metadata.width + "x" + metadata.height + " -> " +
      outputMeta.width + "x" + outputMeta.height + ", " +
      Math.round(finalStat.size / 1024) + " KB (q" + chosenQuality + ")");
  }
}

if (errors.length) {
  console.error("Demo image optimization failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + " MB";
const reduction = sourceBytes ? (1 - largeBytes / sourceBytes) * 100 : 0;
console.log("Original Google Flow photos: " + mb(sourceBytes) + " (15 files).");
console.log("Optimized 480w thumbnails: " + mb(smallBytes) + ".");
console.log("Optimized 960w images: " + mb(largeBytes) + ".");
console.log("960w payload reduction against originals: " + reduction.toFixed(1) + "%.");
console.log("Original source files were preserved; responsive WebP derivatives are ready for Astro.");
