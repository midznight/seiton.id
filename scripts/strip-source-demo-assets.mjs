import fs from "node:fs/promises";
import path from "node:path";

const outputDirectory = process.argv[2];
const outputMode = process.argv[3];
if (!["dist", "dist-demo"].includes(outputDirectory) ||
    !["main", "demo"].includes(outputMode)) {
  throw new Error("Gunakan: node scripts/strip-source-demo-assets.mjs dist main atau dist-demo demo.");
}

const root = path.resolve(outputDirectory);
const sourceAssets = path.resolve(root, "assets/dummy-products");
await fs.rm(sourceAssets, { recursive: true, force: true });
console.log("Original Google Flow uploads excluded from deployment: " + sourceAssets);

if (outputMode === "main") {
  const optimizedAssets = path.resolve(root, "assets/optimized-demo-products");
  await fs.rm(optimizedAssets, { recursive: true, force: true });
  console.log("Demo-only WebP variants excluded from main website: " + optimizedAssets);
}
