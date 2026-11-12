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
    check(await page.locator('meta[name="robots"]').getAttribute("content") === "noindex, nofollow",
      "Halaman preview utama harus noindex: " + route);
    if (route === "/ketentuan/" || route === "/privasi/") {
      const legalNav = await page.locator("#primary-nav a").evaluateAll((items) => items.map((item) => ({
        label: item.textContent.trim(),
        href: item.getAttribute("href")
      })));
      check(JSON.stringify(legalNav) === JSON.stringify(expectedNav.map(([label, href]) => ({ label, href }))),
        "Navigasi halaman legal tidak konsisten dengan navigasi utama: " + route);
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
  check(await page.locator('meta[name="robots"]').getAttribute("content") === "noindex, nofollow",
    "Preview utama harus diberi noindex.");
  const whatsappCtas = page.locator('a.button-primary[target="_blank"][href^="https://wa.me/"]');
  check(await whatsappCtas.count() >= 2, "CTA WhatsApp utama dan penutup beranda harus tersedia.");
  const unsafeExternalLinks = await page.locator('a[target="_blank"]').evaluateAll((items) =>
    items.filter((item) => !/(^|\s)noopener(\s|$)/.test(item.rel) || !/(^|\s)noreferrer(\s|$)/.test(item.rel))
      .map((item) => item.href)
  );
  check(unsafeExternalLinks.length === 0, "Tautan tab baru tidak memiliki rel noopener noreferrer: " + unsafeExternalLinks.join(", "));

  check(await page.locator("[data-showcase-tab]").count() === 3, "Pratinjau beranda harus memiliki tiga tab.");
  await page.getByRole("tab", { name: "Menu QR" }).click();
  check(await page.locator("#showcase-panel-menu").isVisible(), "Tab Menu QR tidak menampilkan panelnya.");
  check(await page.locator("#showcase-panel-katalog").isHidden(), "Panel Katalog masih terlihat setelah tab Menu QR dipilih.");
  await page.getByRole("tab", { name: "Menu QR" }).press("ArrowRight");
  check(await page.locator("#showcase-tab-pesanan").getAttribute("aria-selected") === "true",
    "Navigasi keyboard ArrowRight tidak berpindah ke tab Pesanan.");
  await page.getByRole("tab", { name: "Pesanan" }).press("Home");
  check(await page.locator("#showcase-tab-katalog").getAttribute("aria-selected") === "true",
    "Tombol Home tidak memindahkan fokus ke tab pertama.");
  await page.getByRole("tab", { name: "Katalog" }).press("End");
  check(await page.locator("#showcase-tab-pesanan").getAttribute("aria-selected") === "true",
    "Tombol End tidak memindahkan fokus ke tab terakhir.");

  const needs = page.locator("[data-need-selector]");
  await needs.locator('[data-need-choice="website"]').click();
  check((await needs.locator("[data-need-title]").textContent()).includes("Bangun website"),
    "Pilihan kebutuhan website tidak memperbarui rekomendasi.");
  check(await needs.locator("[data-need-link]").getAttribute("href") === "/layanan/website-katalog/",
    "Tautan rekomendasi website tidak sesuai.");
  const websiteMessage = new URL(await needs.locator("[data-need-contact]").getAttribute("href")).searchParams.get("text");
  check(websiteMessage.includes("pembuatan website"), "Pesan WhatsApp belum mengikuti pilihan website.");
  check(await needs.locator("[data-need-contact]").getAttribute("target") === "_blank",
    "CTA hasil pemilih kebutuhan harus membuka WhatsApp pada tab baru.");
  await needs.locator('[data-need-choice="pesanan"]').click();
  check((await needs.locator("[data-need-title]").textContent()).includes("Rapikan alur pemesanan"),
    "Pilihan kebutuhan pesanan tidak memperbarui rekomendasi.");
  check(await needs.locator("[data-need-link]").getAttribute("href") === "/layanan/bot-telegram/",
    "Tautan rekomendasi sistem pesanan tidak sesuai.");

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

  await page.goto(mainBase + "/contoh/", { waitUntil: "domcontentloaded" });
  const demoLinks = await page.locator(".demo-grid a[href]").evaluateAll((items) => items.map((item) => item.href));
  check(demoLinks.length === 6 && demoLinks.every((href) => href.startsWith(demoBase + "/")),
    "Kartu demonstrasi harus menuju project demo preview, bukan domain production.");
  await page.goto(mainBase + "/layanan/sistem-bot-umkm/", { waitUntil: "domcontentloaded" });
  check(await page.locator(".aside-demo-link").getAttribute("href") === demoBase + "/bot-umkm/",
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
  for (const route of ["/menu-qr/", "/bot-umkm/"]) {
    await demoPage.goto(demoBase + route, { waitUntil: "domcontentloaded" });
    const productImages = await demoPage.locator('img[src*="/assets/optimized-demo-products/"]').evaluateAll(async (images) => {
      await Promise.all(images.map(async (image) => {
        image.loading = "eager";
        try { await image.decode(); } catch {}
      }));
      return images.map((image) => ({
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        alt: image.alt,
        complete: image.complete,
        loading: image.loading,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        responsive: image.getAttribute("srcset"),
        sizes: image.getAttribute("sizes")
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
        /_(480|960)\\.webp$/.test(image.src),
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
  check(demoNavHrefs.every((href, index) => href === mainBase + expectedNav[index][1]),
    "Navigasi pada demo harus kembali ke website utama preview.");
  const comboResponse = await demoPage.goto(demoBase + "/paket-combo/", { waitUntil: "domcontentloaded" });
  check(Boolean(comboResponse && comboResponse.ok()), "Demo Paket Combo gagal dimuat.");
  check(await demoPage.locator('a[href="' + mainBase + '/kontak/"]').count() > 0,
    "CTA Paket Combo masih mengarah ke domain production.");

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
      const choices = rect(".need-choices");
      const result = rect(".need-result");
      const heroCopy = rect(".hero-copy");
      const heroVisual = rect(".hero-visual");
      const grid = document.querySelector(".service-grid");
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        choicesOverlap: overlaps(choices, result),
        heroOverlap: overlaps(heroCopy, heroVisual),
        serviceColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
        tabsWithinShell: Array.from(document.querySelectorAll(".showcase-tabs button")).every((button) => {
          const box = button.getBoundingClientRect();
          const shell = document.querySelector(".showcase-shell").getBoundingClientRect();
          return box.left >= shell.left - 1 && box.right <= shell.right + 1;
        }),
        menuToggleVisible: getComputedStyle(document.querySelector(".menu-toggle")).display !== "none"
      };
    });
    check(metrics.documentWidth <= metrics.viewport + 1,
      "Horizontal overflow pada lebar " + width + " px (" + metrics.documentWidth + " px).");
    check(!metrics.choicesOverlap, "Panel pemilih kebutuhan saling bertumpuk pada lebar " + width + " px.");
    check(!metrics.heroOverlap, "Hero copy dan pratinjau saling bertumpuk pada lebar " + width + " px.");
    check(metrics.tabsWithinShell, "Tab pratinjau keluar dari kartu pada lebar " + width + " px.");
    check(metrics.menuToggleVisible === (width <= 1100),
      "Breakpoint navigasi tidak sesuai pada lebar " + width + " px.");
  }

  check(pageErrors.length === 0, "JavaScript exception ditemukan: " + pageErrors.join(" | "));
  console.log("Customer journey passed: " + assertions + " assertions; " +
    mainRoutes.length + " main routes, " + demoRoutes.length + " demo routes, " +
    "navigation, WhatsApp CTA, tabs, need selector, pricing success/failure, and 8 responsive widths.");
} finally {
  await browser.close();
}
