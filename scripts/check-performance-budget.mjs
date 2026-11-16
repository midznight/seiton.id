import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const outputs = ["dist", "dist-demo"];
const budgets = { css: 100 * 1024, js: 40 * 1024 };
const errors = [];
const walk = (directory) => {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(fullPath));
    else result.push(fullPath);
  }
  return result;
};
const totalBytes = (files) => files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const kb = (bytes) => (bytes / 1024).toFixed(1) + " KB";

const referencedCssForPage = (htmlFile, root) => {
  const html = fs.readFileSync(htmlFile, "utf8");
  const assets = new Set();
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
    if (!rel.split(/\s+/).includes("stylesheet") || !href || /^https?:/i.test(href)) continue;
    const pathname = new URL(href, pathToFileURL(path.join(root, "index.html"))).pathname;
    const asset = path.resolve(root, "." + pathname);
    if (asset.startsWith(root + path.sep) && fs.existsSync(asset) && asset.endsWith(".css")) assets.add(asset);
  }
  const inlineCssBytes = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .reduce((sum, match) => sum + Buffer.byteLength(match[1], "utf8"), 0);
  return { files: [...assets], bytes: totalBytes([...assets]) + inlineCssBytes };
};

for (const output of outputs) {
  const root = path.resolve(output);
  if (!fs.existsSync(root)) {
    errors.push("Folder output tidak ditemukan: " + output);
    continue;
  }
  const files = walk(root);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const cssFiles = files.filter((file) => file.endsWith(".css"));
  const jsFiles = files.filter((file) => /\.m?js$/i.test(file));
  const jsBytes = totalBytes(jsFiles);

  const pageBudgets = htmlFiles.map((file) => ({
    page: path.relative(root, file),
    ...referencedCssForPage(file, root)
  })).sort((a, b) => b.bytes - a.bytes);
  const largestPage = pageBudgets[0] || { page: "(tidak ada halaman)", bytes: 0, files: [] };
  const totalCssBytes = totalBytes(cssFiles);

  console.log(output + " — CSS maksimum per halaman " + kb(largestPage.bytes) +
    " / 100 KB (" + largestPage.page + "); semua CSS unik " + kb(totalCssBytes) +
    "; JavaScript " + kb(jsBytes) + " / 40 KB; HTML documents " + htmlFiles.length + ".");

  if (largestPage.bytes > budgets.css) {
    errors.push(output + " CSS halaman terbesar melebihi budget: " + kb(largestPage.bytes));
  }
  if (jsBytes > budgets.js) errors.push(output + " JavaScript melebihi budget: " + kb(jsBytes));

  for (const file of [...htmlFiles, ...cssFiles]) {
    const content = fs.readFileSync(file, "utf8");
    if (/fonts\.(googleapis|gstatic)\.com/i.test(content)) {
      errors.push("Referensi font eksternal ditemukan di " + path.relative(root, file));
    }
  }

  const externalStylesheets = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return [...html.matchAll(/<link\b[^>]*>/gi)]
      .filter((match) => {
        const tag = match[0];
        return (tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "").split(/\s+/).includes("stylesheet") &&
          /^https?:/i.test(tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "");
      })
      .map(() => path.relative(root, file));
  });
  const approvedGtm = "https://www.googletagmanager.com/gtm.js?id=GTM-K3LKMTF3";
  const externalScripts = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return [...html.matchAll(/<script\b[^>]*src=["'](https?:[^"']+)["'][^>]*>/gi)]
      .filter((match) => !(output === "dist" && match[1] === approvedGtm))
      .map(() => path.relative(root, file));
  });
  if (externalStylesheets.length) errors.push("Stylesheet eksternal ditemukan di " + output + ": " + externalStylesheets.join(", "));
  if (externalScripts.length) errors.push("JavaScript eksternal yang tidak diizinkan ditemukan di " + output + ": " + externalScripts.join(", "));
}

if (errors.length) {
  console.error("Performance budget check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log("Performance budget passed: per-page CSS/JavaScript are within budget, no third-party fonts/styles, and only the approved GTM container is allowed on production pages.");
