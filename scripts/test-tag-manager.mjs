import assert from "node:assert/strict";
import { chromium } from "playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const containerId = "GTM-K3LKMTF3";
const scriptUrl = "https://www.googletagmanager.com/gtm.js?id=" + containerId;
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

  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("www.googletagmanager.com/gtm.js") &&
      new URL(response.url()).searchParams.get("id") === containerId,
    { timeout: 30000 }
  );
  await page.goto(mainBase + "/", { waitUntil: "domcontentloaded" });
  const tagResponse = await responsePromise;

  assert.equal(await page.locator('script[src="' + scriptUrl + '"]').count(), 1,
    "Main website must include exactly one GTM container script.");
  assert.equal(tagResponse.status(), 200,
    "Google Tag Manager script must respond with HTTP 200; received " + tagResponse.status());

  await page.waitForFunction(() => Array.isArray(window.dataLayer) &&
    window.dataLayer.some((entry) => entry && entry[0] === "js"), null, { timeout: 10000 });
  const dataLayerReady = await page.evaluate(() => ({
    isArray: Array.isArray(window.dataLayer),
    hasJsEvent: window.dataLayer.some((entry) => entry && entry[0] === "js")
  }));
  assert.equal(dataLayerReady.isArray, true, "window.dataLayer must be initialized.");
  assert.equal(dataLayerReady.hasJsEvent, true, "dataLayer must contain the GTM initialization event.");

  for (const route of ["/harga/", "/ketentuan/", "/privasi/"]) {
    await page.goto(mainBase + route, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator('script[src="' + scriptUrl + '"]').count(), 1,
      "GTM must be included once on main route " + route);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow",
      "Preview route must retain noindex metadata: " + route);
  }

  const beforeDemo = tagRequests.length;
  await page.goto(demoBase + "/", { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator('script[src="' + scriptUrl + '"]').count(), 0,
    "Fictional demo must not load the main website's GTM container.");
  assert.equal(tagRequests.length, beforeDemo,
    "Navigating to the demo must not request the main website's GTM container.");

  console.log("Google Tag Manager test passed: " + containerId +
    " loaded with HTTP " + tagResponse.status() +
    "; dataLayer initialization verified; main routes covered; demo excluded.");
} finally {
  await browser.close();
}
