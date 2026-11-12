import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const sites = [
  { name: "main", base: mainBase, routes: ["/", "/layanan/", "/harga/", "/cerita/", "/kontak/"] },
  { name: "demo", base: demoBase, routes: ["/", "/katalog-whatsapp/", "/menu-qr/", "/website-katalog/", "/bot-umkm/"] }
];
const widths = [320, 360, 390];
const outputDir = "audit-results";
fs.mkdirSync(outputDir, { recursive: true });
const report = {
  date: new Date().toISOString(),
  standard: "WCAG 2.0 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA",
  viewportWidths: widths,
  pages: [],
  overflow: [],
  violations: [],
  summary: {}
};
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  for (const site of sites) {
    for (const route of site.routes) {
      const url = site.base + route;
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      assert.ok(response && response.ok(), "Page failed to load: " + url);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 });
        const dimensions = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const offenders = Array.from(document.querySelectorAll("body *")).map((element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            const className = typeof element.className === "string" ? element.className.trim().split(" ").filter(Boolean).join(".") : "";
            return {
              selector: element.id ? "#" + element.id : element.tagName.toLowerCase() + (className ? "." + className : ""),
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              width: Math.round(rect.width * 10) / 10,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
              overflowX: style.overflowX
            };
          }).filter((item) => item.right > viewport + 1 || item.left < -1)
            .sort((a, b) => b.right - a.right).slice(0, 30);
          return {
            viewport,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
            offenders
          };
        });
        if (dimensions.document > dimensions.viewport + 1 || dimensions.body > dimensions.viewport + 1) {
          report.overflow.push({ site: site.name, route, width, ...dimensions });
        }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      report.pages.push({
        site: site.name,
        route,
        url,
        violations: result.violations.length,
        passes: result.passes.length,
        incomplete: result.incomplete.length
      });
      for (const violation of result.violations) {
        report.violations.push({
          site: site.name,
          route,
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary }))
        });
      }
      if (site.name === "main" && route === "/") {
        const menu = page.locator(".menu-toggle");
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"), "true", "Mobile nav must expose expanded state");
        assert.equal(await page.locator("#primary-nav").isVisible(), true, "Expanded mobile nav must be visible");
        const expanded = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        for (const violation of expanded.violations) {
          report.violations.push({
            site: site.name,
            route: route + " [mobile menu open]",
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary }))
          });
        }
        await menu.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false", "Escape must close mobile nav");
      }
    }
  }
} finally {
  await browser.close();
}
const impacts = ["critical", "serious", "moderate", "minor"];
const counts = {};
for (const impact of impacts) {
  counts[impact] = report.violations
    .filter((item) => item.impact === impact)
    .reduce((sum, item) => sum + item.nodes.length, 0);
}
report.summary = {
  pageScans: report.pages.length,
  pageScansWithViolations: report.pages.filter((item) => item.violations > 0).length,
  violationRules: report.violations.length,
  affectedNodesByImpact: counts,
  horizontalOverflowCases: report.overflow.length,
  widthsChecked: widths
};
fs.writeFileSync(path.join(outputDir, "accessibility-mobile.json"), JSON.stringify(report, null, 2) + "\n");
console.log("Mobile accessibility / WCAG audit");
console.log(JSON.stringify(report.summary, null, 2));
if (report.overflow.length) console.error("Horizontal overflow findings: " + JSON.stringify(report.overflow, null, 2));
if (report.violations.length) {
  for (const item of report.violations) {
    console.error("[" + item.impact + "] " + item.site + item.route + ": " + item.id + " — " + item.help);
    for (const node of item.nodes) console.error("  " + node.target.join(", ") + " " + (node.summary || ""));
  }
}
const blocking = counts.critical + counts.serious;
assert.equal(report.overflow.length, 0, "Mobile pages must not have horizontal overflow");
assert.equal(blocking, 0, "WCAG audit found critical or serious issues");
