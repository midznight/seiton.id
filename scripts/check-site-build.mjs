import fs from "node:fs";
import path from "node:path";

const required = [
  "dist/index.html",
  "dist/layanan/index.html",
  "dist/harga/index.html",
  "dist/contoh/index.html",
  "dist/pendiri/index.html",
  "dist/tentang/index.html",
  "dist/kontak/index.html",
  "dist/ketentuan/index.html",
  "dist/privasi/index.html",
  "dist/layanan/sistem-bot-umkm/index.html",
  "dist/layanan/paket-combo/index.html",
  "dist-demo/index.html",
  "dist-demo/menu-qr/index.html",
  "dist-demo/website-katalog/index.html",
  "dist-demo/website-katalog/tentang/index.html",
  "dist-demo/website-katalog/katalog/index.html",
  "dist-demo/website-katalog/kontak/index.html",
  "dist-demo/bot-umkm/index.html",
  "dist-demo/paket-combo/index.html",
  "dist-demo/google-business-profile/index.html",
  "dist-demo/assets/menu-demo-qr.svg"
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Build verification failed. Missing output:", missing.join(", "));
  process.exit(1);
}

const demoHtml = fs.readFileSync("dist-demo/bot-umkm/index.html", "utf8");
if (!/name=["']robots["'] content=["']noindex, nofollow["']/.test(demoHtml)) {
  console.error("Bot demo is missing noindex metadata.");
  process.exit(1);
}

console.log("Static output verification passed:", required.length, "paths checked.");
