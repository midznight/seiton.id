import fs from "node:fs";
import path from "node:path";

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
  const cssBytes = totalBytes(cssFiles);
  const jsBytes = totalBytes(jsFiles);

  console.log(output + " — CSS " + kb(cssBytes) + " / 100 KB; JavaScript " +
    kb(jsBytes) + " / 40 KB; HTML documents " + htmlFiles.length + ".");

  if (cssBytes > budgets.css) errors.push(output + " CSS melebihi budget: " + kb(cssBytes));
  if (jsBytes > budgets.js) errors.push(output + " JavaScript melebihi budget: " + kb(jsBytes));

  for (const file of [...htmlFiles, ...cssFiles]) {
    const content = fs.readFileSync(file, "utf8");
    if (/fonts\.(googleapis|gstatic)\.com/i.test(content)) {
      errors.push("Referensi font eksternal ditemukan di " + path.relative(root, file));
    }
  }

  const externalStylesheets = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return [...html.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*href=["']https?:/gi)]
      .map(() => path.relative(root, file));
  });
  const externalScripts = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return [...html.matchAll(/<script\b[^>]*src=["']https?:/gi)]
      .map(() => path.relative(root, file));
  });
  if (externalStylesheets.length) errors.push("Stylesheet eksternal ditemukan di " + output + ": " + externalStylesheets.join(", "));
  if (externalScripts.length) errors.push("JavaScript eksternal ditemukan di " + output + ": " + externalScripts.join(", "));
}

if (errors.length) {
  console.error("Performance budget check failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log("Performance budget passed: no third-party font/style/script requests; CSS and JavaScript stay within budget.");
