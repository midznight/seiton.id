import fs from "node:fs";
import path from "node:path";

const required = [
  "dist/index.html",
  "dist/layanan/index.html",
  "dist/layanan/paket-etalase/index.html",
  "dist/layanan/katalog-produk/index.html",
  "dist/layanan/menu-qr/index.html",
  "dist/layanan/profil-google/index.html",
  "dist/layanan/website-katalog/index.html",
  "dist/layanan/website-profile/index.html",
  "dist/layanan/paket-template/index.html",
  "dist/layanan/bot-telegram/index.html",
  "dist/layanan/sistem-bot-umkm/index.html",
  "dist/layanan/paket-combo/index.html",
  "dist/harga/index.html",
  "dist/contoh/index.html",
  "dist/cerita/index.html",
  "dist/pendiri/index.html",
  "dist/tentang/index.html",
  "dist/kontak/index.html",
  "dist/ketentuan/index.html",
  "dist/privasi/index.html",
  "dist/logo-horizontal.png",
  "dist-demo/index.html",
  "dist-demo/katalog-whatsapp/index.html",
  "dist-demo/menu-qr/index.html",
  "dist-demo/google-business-profile/index.html",
  "dist-demo/website-katalog/index.html",
  "dist-demo/website-katalog/tentang/index.html",
  "dist-demo/website-katalog/katalog/index.html",
  "dist-demo/website-katalog/kontak/index.html",
  "dist-demo/bot-umkm/index.html",
  "dist-demo/paket-combo/index.html",
  "dist-demo/assets/menu-demo-qr.svg"
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Build verification failed. Missing output:", missing.join(", "));
  process.exit(1);
}

const demoPages = required.filter((file) => file.startsWith("dist-demo/") && file.endsWith(".html"));
const missingNoindex = demoPages.filter((file) => {
  const html = fs.readFileSync(file, "utf8");
  return !/name=["']robots["'] content=["']noindex, nofollow["']/.test(html);
});
if (missingNoindex.length) {
  console.error("Demo pages missing noindex metadata:", missingNoindex.join(", "));
  process.exit(1);
}

if (process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH !== "main") {
  const previewLegalPages = ["dist/ketentuan/index.html", "dist/privasi/index.html"];
  const missingPreviewRobots = previewLegalPages.filter((file) =>
    !/name=["']robots["'] content=["']noindex, nofollow["']/.test(fs.readFileSync(file, "utf8"))
  );
  if (missingPreviewRobots.length) {
    console.error("Preview legal pages missing noindex metadata:", missingPreviewRobots.join(", "));
    process.exit(1);
  }
}

const mainHome = fs.readFileSync("dist/index.html", "utf8");
const demoHome = fs.readFileSync("dist-demo/index.html", "utf8");
if (!mainHome.includes("https://seiton.biz.id/")) {
  console.error("Main website canonical metadata is missing.");
  process.exit(1);
}
if (!demoHome.includes("https://demo.seiton.biz.id/")) {
  console.error("Demo website canonical metadata is missing.");
  process.exit(1);
}


const optimizedDemoMap = JSON.parse(fs.readFileSync("src/data/demo-images.json", "utf8"));
for (const [sku, image] of Object.entries(optimizedDemoMap)) {
  for (const [variant, maxBytes] of [[480, 140 * 1024], [960, 320 * 1024]]) {
    const relative = "assets/optimized-demo-products/" + sku + "_" + variant + ".webp";
    const file = path.resolve("dist-demo", relative);
    if (!fs.existsSync(file)) {
      console.error("Demo build missing optimized image:", relative);
      process.exit(1);
    }
    if (fs.statSync(file).size > maxBytes) {
      console.error("Demo build image exceeds size budget:", relative);
      process.exit(1);
    }
  }
}
for (const [directory, label] of [
  ["dist/assets/dummy-products", "main source uploads"],
  ["dist/assets/optimized-demo-products", "main demo-only images"],
  ["dist-demo/assets/dummy-products", "demo source uploads"]
]) {
  if (fs.existsSync(directory)) {
    console.error("Unnecessary image files were included in deployment (" + label + "):", directory);
    process.exit(1);
  }
}


const forbiddenDeploymentAssets = [
  ["dist", "assets/dummy-products", "main source uploads"],
  ["dist", "assets/optimized-demo-products", "demo-only WebP variants"],
  ["dist", "assets/menu-demo-qr.svg", "demo QR artwork"],
  ["dist", "assets/foto-profil-terang.png", "unused profile photograph"],
  ["dist", "assets/es-teh-manis.webp", "unused legacy drink photograph"],
  ["dist", "assets/roti-keju-susu.webp", "unused legacy bread photograph"],
  ["dist", "assets/roti-sobek-cokelat.webp", "demo-only hero photograph"],
  ["dist-demo", "assets/dummy-products", "original Google Flow uploads"],
  ["dist-demo", "assets/foto-profil-terang.png", "unused profile photograph"],
  ["dist-demo", "assets/es-teh-manis.webp", "unused legacy drink photograph"],
  ["dist-demo", "assets/roti-keju-susu.webp", "unused legacy bread photograph"],
  ["dist-demo", "assets/roti-sobek-cokelat.webp", "replaced legacy hero photograph"]
];
for (const [output, relative, label] of forbiddenDeploymentAssets) {
  if (fs.existsSync(path.resolve(output, relative))) {
    console.error("Unnecessary asset remains in " + output + " (" + label + "): " + relative);
    process.exit(1);
  }
}

console.log("Static output verification passed:", required.length, "paths checked, 30 optimized demo variants, and unused/source uploads excluded.");
