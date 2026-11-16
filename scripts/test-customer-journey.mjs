import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const mainBase = (process.env.MAIN_BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");
const demoBase = (process.env.DEMO_BASE_URL || "http://127.0.0.1:4322").replace(/\/+$/, "");
const apiUrl = "https://admin.seiton.biz.id/api/pricing";
const site = JSON.parse(fs.readFileSync("src/data/site.json", "utf8"));
const services = JSON.parse(fs.readFileSync("src/data/services.json", "utf8"));
const mainRoutes = [
  "/", "/layanan/", "/harga/", "/contoh/", "/cerita/", "/kontak/",
  "/ketentuan/", "/privasi/",
  ...services.map((service) => "/layanan/" + service.slug + "/")
];
const demoRoutes = [
  "/", "/katalog-whatsapp/", "/menu-qr/", "/google-business-profile/",
  "/website-katalog/", "/website-katalog/tentang/", "/website-katalog/katalog/",
  "/website-katalog/kontak/", "/bot-umkm/", "/paket-combo/"
];
const expectedNav = [
  ["Beranda", "/"],
  ["Layanan", "/layanan/"],
  ["Harga", "/harga/"],
  ["Contoh", "/contoh/"],
  ["Cerita", "/cerita/"],
  ["Konsultasi", "/kontak/"]
];
let assertions = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  assertions += 1;
};
const fixture = {
  produk: [
    { id: "katalog", nama: "Katalog Produk", harga: 259000, deskripsi: "Katalog digital", fitur: ["Foto produk"] },
    { id: "profile", nama: "Website Profile Usaha", harga: 349000, deskripsi: "Website profil", fitur: ["Profil usaha"] },
    { id: "telegram", nama: "Bot Pesanan Telegram", harga: 499000, deskripsi: "Bot pemesanan", fitur: ["Alur pesanan"] }
  ],
  tambahan: [
    { nama: "Domain biz.id", harga: 49000, satuan: "1 tahun", catatan: "Opsional" }
  ]
};
async function waitForServer(base) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Server preview lokal tidak tersedia: " + base);
}

const browser = await chromium.launch({ headless: true });
const pageErrors = [];
const isPreviewBuild = process.env.CF_PAGES_BRANCH !== "main";
const expectedDemoBase = isPreviewBuild ? demoBase : new URL(site.brand.demo).origin;
const expectedMainBase = isPreviewBuild ? mainBase : new URL(site.brand.website).origin;
const staticLegalRoutes = new Set(["/ketentuan/", "/privasi/"]);
const previewHeaderRules = fs.readFileSync("public/_headers", "utf8");
const previewPagesHeader = previewHeaderRules.match(/https:\/\/:project\.pages\.dev\/\*([\s\S]*?)(?:\n\n|$)/);
const previewPagesNoindex = Boolean(previewPagesHeader?.[1].includes("X-Robots-Tag: noindex"));
try {
  await waitForServer(mainBase);
  await waitForServer(demoBase);

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route(apiUrl, (route) => route.fulfill({
    status: 200,
    headers: { "access-control-allow-origin": "*", "content-type": "application/json" },
    body: JSON.stringify(fixture)
  }));

  for (const route of mainRoutes) {
    const response = await page.goto(mainBase + route, { waitUntil: "domcontentloaded" });
    check(Boolean(response && response.ok()), "Halaman utama gagal dimuat: " + route);
    const robotsMeta = page.locator('meta[name="robots"]');
    const robots = await robotsMeta.count() ? await robotsMeta.getAttribute("content") : null;
    if (robots === null) {
      check(staticLegalRoutes.has(route),
        "Halaman utama tidak memiliki meta robots dan bukan halaman legal statis: " + route);
      if (isPreviewBuild) {
        check(previewPagesNoindex,
          "Halaman legal statis pada preview harus dilindungi X-Robots-Tag: noindex.");
      }
    } else {
      check(isPreviewBuild
        ? robots === "noindex, nofollow"
        : Boolean(robots.includes("index") && !robots.includes("noindex")),
        (isPreviewBuild ? "Halaman preview utama harus noindex: " : "Halaman production utama harus indexable: ") + route);
    }
    if (route === "/ketentuan/" || route === "/privasi/") {
      const legalNav = await page.locator("#primary-nav a").evaluateAll((items) => items.map((item) => ({
        label: item.textContent.trim(),
        href: item.getAttribute("href")
      })));
      check(JSON.stringify(legalNav) === JSON.stringify(expectedNav.map(([label, href]) => ({ label, href }))),
        "Navigasi halaman legal tidak konsisten dengan navigasi utama: " + route);
      if (route === "/privasi/") {
        const privacyText = await page.locator("body").innerText();
        check(privacyText.includes("Cloudflare Web Analytics") &&
          privacyText.includes("tidak mengikuti toggle persetujuan GA4"),
          "Kebijakan Privasi harus menjelaskan Cloudflare Web Analytics secara terpisah dari GA4.");
        check(await page.locator('a[href="https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/"]').count() === 1,
          "Kebijakan Privasi harus menyediakan sumber dokumentasi Cloudflare Web Analytics.");
      }
    }
  }

  await page.goto(mainBase + "/", { waitUntil: "domcontentloaded" });
  const logoOk = await page.locator(".brand-logo").evaluate((img) => img.complete && img.naturalWidth > 0);
  check(logoOk, "Logo utama tidak berhasil dimuat.");
  const navItems = await page.locator("#primary-nav a").evaluateAll((items) => items.map((item) => ({
    label: item.textContent.trim(),
    href: item.getAttribute("href")
  })));
  check(JSON.stringify(navItems) === JSON.stringify(expectedNav.map(([label, href]) => ({ label, href }))),
    "Urutan label atau tujuan navigasi utama tidak konsisten.");

  check(await page.locator("main h1").count() === 1, "Beranda harus memiliki satu judul utama.");
  const homeRobotsMeta = page.locator('meta[name="robots"]');
  const homeRobots = await homeRobotsMeta.count() ? await homeRobotsMeta.getAttribute("content") : null;
  check(isPreviewBuild
    ? homeRobots === "noindex, nofollow"
    : Boolean(homeRobots && homeRobots.includes("index") && !homeRobots.includes("noindex")),
    isPreviewBuild ? "Preview utama harus diberi noindex." : "Homepage production harus indexable.");
  const whatsappCtas = page.locator('#ih-send-whatsapp[target="_blank"][href^="https://wa.me/6288809294868"]');
  check(await whatsappCtas.count() === 1, "Generator konsultasi harus memakai nomor WhatsApp resmi Seiton.");
  const unsafeExternalLinks = await page.locator('a[target="_blank"]').evaluateAll((items) =>
    items.filter((item) => !/(^|\s)noopener(\s|$)/.test(item.rel) || !/(^|\s)noreferrer(\s|$)/.test(item.rel))
      .map((item) => item.href)
  );
  check(unsafeExternalLinks.length === 0, "Tautan tab baru tidak memiliki rel noopener noreferrer: " + unsafeExternalLinks.join(", "));

  const moduleCards = page.locator("[data-module-choice]");
  check(await moduleCards.count() === 5, "Beranda harus menampilkan lima kartu modul utama.");
  await page.locator('[data-module-index="4"]').click();
  check((await page.locator("[data-module-title]").textContent()).includes("Website Katalog"),
    "Memilih modul website harus memperbarui panel penjelasan.");
  check(await page.locator("[data-module-link]").getAttribute("href") === "/layanan/website-katalog/",
    "Tautan modul website tidak mengarah ke halaman layanan yang benar.");
  check((await page.locator("[data-kinetic-benefit]").textContent()).includes("alamat web"),
    "Definisi dinamis belum mengikuti modul yang dipilih.");
  await page.locator("[data-kinetic-trigger]").click();
  check(await page.locator("[data-kinetic-number]").textContent() === "01",
    "Kontrol definisi dinamis tidak berpindah ke modul berikutnya.");

  check(await page.locator("[data-sim-tab]").count() === 5, "Simulasi beranda harus memiliki lima tab.");
  await page.locator('[data-sim-tab="menu"]').click();
  check(await page.locator("#ih-panel-menu").isVisible(), "Tab Menu QR tidak menampilkan panel simulasi.");
  check(await page.locator("#ih-panel-katalog").isHidden(), "Panel Katalog masih terlihat setelah tab Menu QR dipilih.");
  await page.locator('[data-sim-tab="menu"]').press("ArrowRight");
  check(await page.locator('[data-sim-tab="profil"]').getAttribute("aria-selected") === "true",
    "Navigasi keyboard ArrowRight tidak berpindah ke tab Profil Google.");
  await page.locator('[data-sim-tab="profil"]').press("Home");
  check(await page.locator('[data-sim-tab="katalog"]').getAttribute("aria-selected") === "true",
    "Tombol Home tidak memindahkan fokus ke tab pertama.");
  await page.locator('[data-sim-tab="katalog"]').press("End");
  check(await page.locator('[data-sim-tab="telegram"]').getAttribute("aria-selected") === "true",
    "Tombol End tidak memindahkan fokus ke tab terakhir.");

  await page.locator('[data-comparison-mode="before"]').click();
  check(await page.locator("[data-comparison-panel]").getAttribute("data-comparison-panel") === "before",
    "Mode perbandingan sebelum ditata tidak aktif.");
  check(await page.locator(".ih-chat-share-card").isHidden(),
    "Kartu tautan etalase harus tersembunyi pada mode sebelum ditata.");
  await page.locator('[data-comparison-mode="after"]').click();
  check(await page.locator(".ih-chat-share-card").isVisible(),
    "Kartu tautan etalase harus terlihat pada mode sesudah ditata.");
  await page.locator("[data-chat-replay]").click();

  await page.locator('[data-process-step="1"]').click();
  check((await page.locator("[data-process-title]").textContent()).includes("Susun sesuai kesepakatan"),
    "Pemilih timeline tidak memperbarui isi tahap kedua.");
  check(await page.locator("[data-process-slider]").inputValue() === "1",
    "Slider timeline tidak mengikuti tahap yang dipilih.");
  await page.locator("[data-process-slider]").focus();
  await page.locator("[data-process-slider]").press("ArrowRight");
  check(await page.locator("[data-process-title]").textContent() === "Periksa hasil dan serah terima",
    "Slider timeline tidak mengaktifkan tahap serah terima.");

  await page.locator('[data-blueprint-node="produk"]').click();
  check(await page.locator("[data-blueprint-title-output]").textContent() === "Produk dan layanan",
    "Diagram anatomi tidak memperbarui komponen yang dipilih.");
  await page.locator("[data-benefit-toggle]").first().click();
  check(await page.locator("[data-benefit-toggle]").first().getAttribute("aria-pressed") === "true",
    "Saklar manfaat tidak berpindah ke kondisi sesudah ditata.");
  check(await page.locator("[data-benefit-after]").first().isVisible(),
    "Penjelasan manfaat sesudah ditata belum terlihat.");
  await page.locator("[data-benefits-reset]").click();
  check(await page.locator("[data-benefit-toggle]").first().getAttribute("aria-pressed") === "false",
    "Tombol atur ulang tidak mengembalikan kondisi awal kartu manfaat.");

  await page.locator("#ih-business-name").fill("Kedai Kopi Uji");
  await page.locator("#ih-business-type").selectOption({ label: "Kuliner / makanan dan minuman" });
  await page.locator('input[name="requestedService"][value="Menu QR"]').check();
  await page.locator("#ih-business-need").fill("Saya ingin menata menu dan informasi produk.");
  const messageDraft = await page.locator("#ih-message-draft").textContent();
  check(messageDraft.includes("Kedai Kopi Uji") && messageDraft.includes("Menu QR") &&
    messageDraft.includes("menata menu"), "Draft konsultasi tidak mengikuti isian formulir.");
  const messageUrl = new URL(await page.locator("#ih-send-whatsapp").getAttribute("href"));
  check(messageUrl.hostname === "wa.me" && messageUrl.pathname === "/6288809294868",
    "Tautan generator konsultasi tidak mengarah ke nomor Seiton resmi.");
  check((messageUrl.searchParams.get("text") || "").includes("Kedai Kopi Uji"),
    "Pesan WhatsApp hasil generator tidak memuat data formulir.");
  check(await page.locator("#ih-send-whatsapp").getAttribute("target") === "_blank",
    "Tautan WhatsApp dari formulir harus terbuka pada tab baru.");
  const pricingPage = await browser.newPage();
  pricingPage.on("pageerror", (error) => pageErrors.push(error.message));
  await pricingPage.route(apiUrl, (route) => route.fulfill({
    status: 200,
    headers: { "access-control-allow-origin": "*", "content-type": "application/json" },
    body: JSON.stringify(fixture)
  }));
  await pricingPage.goto(mainBase + "/harga/", { waitUntil: "domcontentloaded" });
  await pricingPage.locator("#price-status").waitFor({ state: "hidden", timeout: 8000 });
  check(await pricingPage.locator(".price-card").count() === 3, "Data harga API sukses tidak membentuk tiga kartu.");
  check(await pricingPage.locator(".price-addon").count() === 1, "Biaya tambahan dari API tidak ditampilkan.");
  await pricingPage.unroute(apiUrl);
  await pricingPage.route(apiUrl, (route) => route.fulfill({
    status: 503,
    headers: { "access-control-allow-origin": "*" },
    body: "temporarily unavailable"
  }));
  await pricingPage.goto(mainBase + "/harga/", { waitUntil: "domcontentloaded" });
  await pricingPage.locator('#price-status[data-state="error"]').waitFor({ state: "visible", timeout: 8000 });
  check(await pricingPage.locator(".price-card").count() === 0, "Harga gagal dimuat tetapi kartu harga parsial masih terlihat.");
  check((await pricingPage.locator("#price-status").textContent()).includes("belum dapat diakses"),
    "Pesan kegagalan API harga tidak informatif.");
  await pricingPage.close();

  for (const route of mainRoutes) {
    await page.goto(mainBase + route, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator("a[href]").evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")).filter(Boolean)
    );
    for (const href of [...new Set(hrefs)]) {
      if (href.startsWith("#")) {
        const id = decodeURIComponent(href.slice(1));
        if (id) check(await page.locator('[id="' + id + '"]').count() > 0,
          "Target anchor hilang pada " + route + ": " + href);
        continue;
      }
      const target = new URL(href, mainBase + route);
      if (target.origin !== new URL(mainBase).origin) continue;
      const response = await page.request.get(target.href);
      check(response.ok(), "Tautan internal gagal (" + response.status() + "): " + target.href);
    }
  }


  const fontAuditPage = await browser.newPage();
  const thirdPartyFontRequests = [];
  fontAuditPage.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/i.test(request.url())) {
      thirdPartyFontRequests.push(request.url());
    }
  });
  for (const route of ["/ketentuan/", "/privasi/"]) {
    await fontAuditPage.goto(mainBase + route, { waitUntil: "networkidle" });
    check(await fontAuditPage.locator('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').count() === 0,
      "Halaman legal tidak boleh memuat stylesheet font pihak ketiga: " + route);
    check(await fontAuditPage.locator('link[href="/favicon-32.png"], link[href="/favicon-180.png"]').count() === 0,
      "Halaman legal tidak boleh meminta favicon yang tidak tersedia: " + route);
  }
  check(thirdPartyFontRequests.length === 0,
    "Permintaan font pihak ketiga masih terjadi: " + thirdPartyFontRequests.join(", "));
  await fontAuditPage.close();

  await page.goto(mainBase + "/contoh/", { waitUntil: "domcontentloaded" });
  const demoLinks = await page.locator(".demo-grid a[href]").evaluateAll((items) => items.map((item) => item.href));
  check(demoLinks.length === 6 && demoLinks.every((href) => href.startsWith(expectedDemoBase + "/")),
    "Kartu demonstrasi harus menuju domain demo untuk environment deployment saat ini.");
  await page.goto(mainBase + "/layanan/sistem-bot-umkm/", { waitUntil: "domcontentloaded" });
  check(await page.locator(".aside-demo-link").getAttribute("href") === expectedDemoBase + "/bot-umkm/",
    "Tautan demo pada halaman detail layanan tidak konsisten.");

  const demoPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  demoPage.on("pageerror", (error) => pageErrors.push(error.message));
  for (const route of demoRoutes) {
    const response = await demoPage.goto(demoBase + route, { waitUntil: "domcontentloaded" });
    check(Boolean(response && response.ok()), "Halaman demonstrasi gagal dimuat: " + route);
    check(await demoPage.locator('meta[name="robots"]').getAttribute("content") === "noindex, nofollow",
      "Halaman preview demo harus noindex: " + route);
    const demoHrefs = await demoPage.locator("a[href]").evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")).filter(Boolean)
    );
    for (const href of [...new Set(demoHrefs)]) {
      if (href.startsWith("#")) {
        const id = decodeURIComponent(href.slice(1));
        if (id) check(await demoPage.locator('[id="' + id + '"]').count() > 0,
          "Target anchor demo hilang pada " + route + ": " + href);
        continue;
      }
      const target = new URL(href, demoBase + route);
      if (target.origin !== new URL(demoBase).origin) continue;
      const linkResponse = await demoPage.request.get(target.href);
      check(linkResponse.ok(), "Tautan internal demo gagal (" + linkResponse.status() + "): " + target.href);
    }
  }
  for (const route of ["/menu-qr/", "/website-katalog/katalog/", "/bot-umkm/"]) {
    await demoPage.goto(demoBase + route, { waitUntil: "domcontentloaded" });
    const productImages = await demoPage.locator('img[src*="/assets/optimized-demo-products/"]').evaluateAll(async (images) => {
      return await Promise.all(images.map(async (image) => {
        const declaredLoading = image.getAttribute("loading");
        image.loading = "eager";
        try { await image.decode(); } catch {}
        return {
          src: new URL(image.currentSrc || image.src, location.href).pathname,
          alt: image.alt,
          complete: image.complete,
          loading: declaredLoading,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          responsive: image.getAttribute("srcset"),
          sizes: image.getAttribute("sizes")
        };
      }));
    });
    check(productImages.length === 15,
      "Halaman " + route + " harus memuat tepat 15 foto produk demo.");
    check(new Set(productImages.map((image) => image.src)).size === 15,
      "Halaman " + route + " harus menampilkan 15 file foto yang unik.");
    for (const image of productImages) {
      check(Boolean(image.alt && image.alt.trim()),
        "Teks alt foto produk kosong: " + image.src);
      check(image.src.startsWith("/assets/optimized-demo-products/") &&
        /_(480|960)\.webp$/.test(image.src),
        "Fallback foto belum menggunakan thumbnail WebP: " + image.src);
      check(image.responsive?.includes("_480.webp 480w") &&
        image.responsive.includes("_960.webp 960w") && Boolean(image.sizes),
        "srcset/sizes responsif tidak lengkap: " + image.src);
      check(image.loading === "lazy", "Foto produk harus dimuat secara lazy: " + image.src);
      check(image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 &&
        image.naturalWidth <= 960,
        "Foto produk gagal dimuat atau ukurannya tidak sesuai: " + image.src + " (" +
          image.naturalWidth + "x" + image.naturalHeight + ").");
    }
  }

  await demoPage.goto(demoBase + "/", { waitUntil: "domcontentloaded" });
  check(await demoPage.locator('meta[name="robots"]').getAttribute("content") === "noindex, nofollow",
    "Preview demo harus diberi noindex.");
  const demoNavHrefs = await demoPage.locator("#primary-nav a").evaluateAll((items) =>
    items.map((item) => item.getAttribute("href"))
  );
  check(demoNavHrefs.every((href, index) => href === expectedMainBase + expectedNav[index][1]),
    "Navigasi demo harus kembali ke website utama untuk environment deployment saat ini.");
  const comboResponse = await demoPage.goto(demoBase + "/paket-combo/", { waitUntil: "domcontentloaded" });
  check(Boolean(comboResponse && comboResponse.ok()), "Demo Paket Combo gagal dimuat.");
  check(await demoPage.locator('a[href="' + expectedMainBase + '/kontak/"]').count() > 0,
    "CTA Paket Combo harus menuju website utama untuk environment deployment saat ini.");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => pageErrors.push(error.message));
  await mobile.goto(mainBase + "/", { waitUntil: "domcontentloaded" });
  const mobileNav = mobile.locator("#primary-nav");
  const menuToggle = mobile.locator(".menu-toggle");
  check(!(await mobileNav.isVisible()), "Navigasi mobile harus tertutup pada kondisi awal.");
  await menuToggle.click();
  check(await mobileNav.isVisible(), "Tombol hamburger tidak membuka navigasi mobile.");
  check(await menuToggle.getAttribute("aria-expanded") === "true", "aria-expanded tidak berubah ketika menu dibuka.");
  await mobileNav.getByRole("link", { name: "Layanan", exact: true }).click();
  check(new URL(mobile.url()).pathname === "/layanan/", "Navigasi mobile tidak membuka halaman yang dipilih.");
  check(!(await mobileNav.isVisible()), "Menu mobile tidak menutup setelah tautan dipilih.");
  await menuToggle.click();
  await mobile.keyboard.press("Escape");
  check(await menuToggle.getAttribute("aria-expanded") === "false", "Tombol Escape tidak menutup menu.");
  check(await menuToggle.evaluate((el) => el === document.activeElement), "Fokus keyboard tidak kembali ke tombol menu.");

  const legalMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  legalMobile.on("pageerror", (error) => pageErrors.push(error.message));
  await legalMobile.goto(mainBase + "/ketentuan/", { waitUntil: "domcontentloaded" });
  const legalMenu = legalMobile.locator(".menu-toggle");
  check(!(await legalMobile.locator("#primary-nav").isVisible()), "Navigasi legal mobile harus tertutup pada awal.");
  await legalMenu.click();
  check(await legalMobile.locator("#primary-nav").isVisible(), "Navigasi legal mobile tidak terbuka.");
  await legalMobile.keyboard.press("Escape");
  check(await legalMenu.getAttribute("aria-expanded") === "false", "Escape tidak menutup menu halaman legal.");
  check(await legalMenu.evaluate((el) => el === document.activeElement), "Fokus Escape pada halaman legal tidak kembali ke tombol menu.");
  await legalMobile.close();

  for (const width of [1440, 1100, 1024, 900, 768, 600, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(mainBase + "/", { waitUntil: "domcontentloaded" });
    const metrics = await page.evaluate(() => {
      const overlaps = (a, b) => Boolean(a && b &&
        Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1);
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      };
      const moduleGrid = rect(".ih-module-grid");
      const moduleInspector = rect(".ih-module-inspector");
      const heroCopy = rect(".ih-hero-copy");
      const heroVisual = rect(".ih-hero-visual");
      const grid = document.querySelector(".ih-featured-links");
      const dock = rect(".ih-sim-dock");
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        moduleInspectorOverlap: overlaps(moduleGrid, moduleInspector),
        heroOverlap: overlaps(heroCopy, heroVisual),
        serviceColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
        tabsWithinShell: Boolean(dock && dock.left >= -1 && dock.right <= window.innerWidth + 1),
        menuToggleVisible: getComputedStyle(document.querySelector(".menu-toggle")).display !== "none"
      };
    });
    check(metrics.documentWidth <= metrics.viewport + 1,
      "Horizontal overflow pada lebar " + width + " px (" + metrics.documentWidth + " px).");
    check(!metrics.moduleInspectorOverlap, "Panel modul bertumpuk dengan penjelasan pada lebar " + width + " px.");
    check(!metrics.heroOverlap, "Hero copy dan ilustrasi saling bertumpuk pada lebar " + width + " px.");
    check(metrics.tabsWithinShell, "Dock tab simulasi keluar dari viewport pada lebar " + width + " px.");
    check(metrics.menuToggleVisible === (width <= 1100),
      "Breakpoint navigasi tidak sesuai pada lebar " + width + " px.");
  }

  check(pageErrors.length === 0, "JavaScript exception ditemukan: " + pageErrors.join(" | "));
  console.log("Customer journey passed: " + assertions + " assertions; " +
    mainRoutes.length + " main routes, " + demoRoutes.length + " demo routes, " +
    "navigation, module cards, five simulation tabs, chat comparison, timeline, blueprint, benefit toggles, consultation generator, pricing success/failure, and responsive widths.");
} finally {
  await browser.close();
}
