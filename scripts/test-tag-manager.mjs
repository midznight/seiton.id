import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const containerId = "GTM-K3LKMTF3";
const scriptUrl = "https://www.googletagmanager.com/gtm.js?id=" + containerId;

const baseSource = fs.readFileSync("src/layouts/Base.astro", "utf8");
const legalSources = [
  fs.readFileSync("public/ketentuan/index.html", "utf8"),
  fs.readFileSync("public/privasi/index.html", "utf8")
];
assert.ok(baseSource.includes(containerId), "Production layout must retain the GTM container ID.");
assert.ok(baseSource.includes("!demoSite && !isPreviewBuild"), "Main production layout must suppress GTM in preview and demo builds.");
for (const source of legalSources) {
  assert.ok(source.includes(scriptUrl), "Main legal source must retain the GTM container loader.");
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const tagRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("www.googletagmanager.com/gtm.js") &&
        new URL(request.url()).searchParams.get("id") === containerId) {
      tagRequests.push(request.url());
    }
  });

  for (const route of ["/", "/harga/", "/ketentuan/", "/privasi/"]) {
    await page.goto(mainBase + route, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator('script[src="' + scriptUrl + '"]').count(), 0,
      "Preview route must not load the production GTM container: " + route);
    assert.equal(await page.evaluate(() => Array.isArray(window.dataLayer)), false,
      "Preview route must not initialize Analytics dataLayer: " + route);
  }

  await page.goto(demoBase + "/", { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator('script[src="' + scriptUrl + '"]').count(), 0,
    "Fictional demo must not load the main website's GTM container.");
  assert.equal(tagRequests.length, 0,
    "Preview and demo browsing must not send requests to the main GTM container.");

  console.log("Google Tag Manager production-gate test passed: " + containerId +
    " retained in production source; preview, legal preview copies, and demo are excluded.");
} finally {
  await browser.close();
}
