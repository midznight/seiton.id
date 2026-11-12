import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const targets = [
  { site: "main", name: "home", url: mainBase + "/" },
  { site: "main", name: "pricing", url: mainBase + "/harga/" },
  { site: "demo", name: "home", url: demoBase + "/" },
  { site: "demo", name: "catalog", url: demoBase + "/website-katalog/" }
];
const cli = path.resolve("node_modules/lighthouse/cli/index.js");
const outputDir = "audit-results/lighthouse";
fs.mkdirSync(outputDir, { recursive: true });
assert.ok(fs.existsSync(cli), "Lighthouse CLI was not installed.");
const chromePath = chromium.executablePath();
const results = [];
for (const target of targets) {
  const reportPath = path.resolve(outputDir, target.site + "-" + target.name + ".json");
  console.log("Running mobile Lighthouse: " + target.site + " " + target.name + " " + target.url);
  execFileSync(process.execPath, [
    cli,
    target.url,
    "--output=json",
    "--output-path=" + reportPath,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--form-factor=mobile",
    "--throttling-method=simulate",
    "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
    "--chrome-path=" + chromePath,
    "--quiet"
  ], { stdio: "inherit", timeout: 180000 });
  const data = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const auditValue = (id) => data.audits[id] ? data.audits[id].numericValue : null;
  const categoryScore = (id) => {
    const category = data.categories[id];
    return category && typeof category.score === "number" ? Math.round(category.score * 100) : null;
  };
  const item = {
    site: target.site,
    page: target.name,
    url: target.url,
    scores: {
      performance: categoryScore("performance"),
      accessibility: categoryScore("accessibility"),
      bestPractices: categoryScore("best-practices"),
      seo: categoryScore("seo")
    },
    metrics: {
      LCP_ms: auditValue("largest-contentful-paint"),
      CLS: auditValue("cumulative-layout-shift"),
      TBT_ms: auditValue("total-blocking-time"),
      FCP_ms: auditValue("first-contentful-paint"),
      SpeedIndex_ms: auditValue("speed-index"),
      INP_ms: auditValue("interaction-to-next-paint")
    }
  };
  results.push(item);
  console.log(JSON.stringify(item, null, 2));
}
const summary = {
  date: new Date().toISOString(),
  mode: "Lighthouse mobile simulated throttling (lab test)",
  note: "LCP and CLS are lab observations; TBT is a responsiveness diagnostic, not INP. Field Core Web Vitals require sufficient real-user CrUX data.",
  results
};
fs.writeFileSync(path.resolve(outputDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log("Lighthouse mobile summary written to " + path.resolve(outputDir, "summary.json"));
