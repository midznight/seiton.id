import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const containerId = "GTM-K3LKMTF3";
const ga4Id = "G-9Z02GKBZQX";
const tagRequest = (url) =>
  (url.includes("www.googletagmanager.com/gtm.js") && new URL(url).searchParams.get("id") === containerId) ||
  url.includes("google-analytics.com/g/collect") ||
  url.includes("analytics.google.com/g/collect");

const baseSource = fs.readFileSync("src/layouts/Base.astro", "utf8");
const consentSource = fs.readFileSync("public/analytics-consent.js", "utf8");
const privacySource = fs.readFileSync("public/privasi/index.html", "utf8");
const legalSources = [fs.readFileSync("public/ketentuan/index.html", "utf8"), privacySource];

assert.ok(baseSource.includes('/analytics-consent.js'), "Main layout must load the first-party consent controller.");
assert.ok(baseSource.includes('!demoSite &&'), "Analytics consent UI must not be included in the fictional demo.");
assert.ok(baseSource.includes('isProductionBuild ? "true" : "false"'), "The layout must distinguish production and preview builds.");
assert.ok(consentSource.includes(containerId), "The production GTM container ID must remain in the consent controller.");
assert.ok(consentSource.includes("analytics_storage") && consentSource.includes('"default"'), "Consent Mode default state must be initialized.");
assert.ok(consentSource.includes('"denied"'), "Analytics must be denied before user choice.");
assert.ok(consentSource.includes("seiton.biz.id") && consentSource.includes("www.seiton.biz.id"), "GTM must be restricted to approved production hosts.");
assert.ok(consentSource.includes("localStorage"), "The user's analytics preference must persist locally.");
assert.ok(privacySource.includes("Google Analytics 4") && privacySource.includes(ga4Id), "Privacy notice must identify GA4 and its destination.");
assert.ok(privacySource.includes("14 bulan") && privacySource.includes("persetujuan eksplisit"), "Privacy notice must state retention and consent basis.");
for (const source of [baseSource, ...legalSources]) {
  assert.equal(source.includes("https://www.googletagmanager.com/gtm.js"), false, "No page may load GTM before consent.");
  assert.ok(source.includes("analytics-consent.js"), "Every main/legal page must load the consent controller.");
}
for (const source of legalSources) assert.ok(source.includes("analytics-consent.css"), "Legal pages must load consent styles.");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const tagRequests = [];
  page.on("request", (request) => { if (tagRequest(request.url())) tagRequests.push(request.url()); });
  await page.goto(mainBase + "/", { waitUntil: "domcontentloaded" });
  await page.locator("#analytics-consent-banner").waitFor({ state: "visible" });
  const initialConsent = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((item) => Array.from(item));
    const defaults = commands.find((item) => item[0] === "consent" && item[1] === "default");
    return { dataLayerPresent: Array.isArray(window.dataLayer), analyticsStorage: defaults?.[2]?.analytics_storage || null, adStorage: defaults?.[2]?.ad_storage || null };
  });
  assert.equal(initialConsent.dataLayerPresent, true);
  assert.equal(initialConsent.analyticsStorage, "denied");
  assert.equal(initialConsent.adStorage, "denied");
  assert.equal(tagRequests.length, 0, "No Google request may occur before consent.");

  await page.locator("#analytics-consent-reject").click();
  assert.equal(await page.locator("#analytics-consent-banner").isVisible(), false);
  assert.equal(await page.evaluate(() => localStorage.getItem("seiton-analytics-consent-v1")), "denied");
  assert.equal(tagRequests.length, 0, "Reject must not load GTM or send Analytics events.");

  await page.locator("#analytics-settings").click();
  assert.equal(await page.locator("#analytics-consent-banner").isVisible(), true);
  await page.locator("#analytics-consent-accept").click();
  assert.equal(await page.evaluate(() => localStorage.getItem("seiton-analytics-consent-v1")), "granted");
  const acceptedConsent = await page.evaluate(() =>
    (window.dataLayer || []).map((item) => Array.from(item)).find((item) => item[0] === "consent" && item[1] === "update")?.[2]?.analytics_storage || null
  );
  assert.equal(acceptedConsent, "granted");
  assert.equal(tagRequests.length, 0, "Preview must never load production GTM even after a test consent choice.");

  for (const route of ["/harga/", "/ketentuan/", "/privasi/"]) {
    const legalPage = await browser.newPage();
    const legalRequests = [];
    legalPage.on("request", (request) => { if (tagRequest(request.url())) legalRequests.push(request.url()); });
    await legalPage.goto(mainBase + route, { waitUntil: "domcontentloaded" });
    await legalPage.locator("#analytics-consent-banner").waitFor({ state: "visible" });
    assert.equal(legalRequests.length, 0, "Preview legal route must not request Google Analytics: " + route);
    assert.ok(await legalPage.locator("#analytics-settings").count(), "Legal footer must expose privacy settings: " + route);
    await legalPage.close();
  }

  const demo = await browser.newPage();
  const demoRequests = [];
  demo.on("request", (request) => { if (tagRequest(request.url())) demoRequests.push(request.url()); });
  await demo.goto(demoBase + "/", { waitUntil: "domcontentloaded" });
  assert.equal(await demo.locator("#analytics-consent-banner").count(), 0, "Demo must not show the main-site consent UI.");
  assert.equal(await demo.locator('script[src="/analytics-consent.js"]').count(), 0, "Demo must not load the consent controller.");
  assert.equal(demoRequests.length, 0, "Demo must never request the main-site Analytics property.");
  console.log("GA4 consent test passed: default denied, explicit accept/reject, reversible footer settings, preview isolation, and demo exclusion. " + containerId + " / " + ga4Id);
} finally { await browser.close(); }
