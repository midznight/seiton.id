import fs from "node:fs/promises";
import path from "node:path";

const outputDirectory = process.argv[2];
const outputMode = process.argv[3];
if (!["dist", "dist-demo"].includes(outputDirectory) ||
    !["main", "demo"].includes(outputMode)) {
  throw new Error("Gunakan: node scripts/strip-source-demo-assets.mjs dist main atau dist-demo demo.");
}

const root = path.resolve(outputDirectory);
const candidates = [
  "assets/dummy-products",
  "assets/foto-profil-terang.png",
  "assets/es-teh-manis.webp",
  "assets/roti-keju-susu.webp",
  "assets/roti-sobek-cokelat.webp"
];
if (outputMode === "main") {
  candidates.push(
    "assets/optimized-demo-products",
    "assets/menu-demo-qr.svg"
  );
}

const textFiles = [];
const walk = async (directory) => {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else if (/\.(html|css|js|mjs)$/i.test(entry.name)) textFiles.push(fullPath);
  }
};
await walk(root);

let removedBytes = 0;
for (const relative of candidates) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) {
    throw new Error("Target pembersihan keluar dari folder build: " + relative);
  }

  const stat = await fs.stat(target).catch(() => null);
  if (!stat) continue;

  const reference = "/" + relative.replace(/\\/g, "/");
  const matches = [];
  for (const file of textFiles) {
    const content = await fs.readFile(file, "utf8");
    if (content.includes(reference)) matches.push(path.relative(root, file));
  }
  if (matches.length) {
    throw new Error("Aset tidak boleh dihapus karena masih direferensikan: " +
      reference + " oleh " + matches.join(", "));
  }

  const measure = async (item) => {
    const info = await fs.stat(item);
    if (info.isFile()) return info.size;
    let total = 0;
    for (const child of await fs.readdir(item)) total += await measure(path.join(item, child));
    return total;
  };
  removedBytes += await measure(target);
  await fs.rm(target, { recursive: true, force: true });
  console.log("Unused deployment asset removed: " + reference);
}

console.log(outputMode + " deployment: " +
  (removedBytes / 1024).toFixed(1) + " KB of unused/source assets excluded.");
