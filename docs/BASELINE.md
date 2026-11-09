# Baseline audit — seiton.id public site

**Snapshot:** 2026-11-09  
**Audited branch:** `main`  
**Audited commit:** `bcb21ae056eac4df27748aea1972d047482a3354`  
**Audit branch:** `feat/baseline-audit-2026-11-09`  
**Purpose:** read-only baseline before the public-site/contact/founder-page work. No production Pages publish was performed.

## 1. Site architecture and structure

The repository is a static Cloudflare Pages site. It uses plain HTML, CSS, and JavaScript; there is no framework, package manifest, build command, database, or backend in the public-site root.

| Path | Responsibility |
|---|---|
| `index.html` | Homepage |
| `layanan/index.html` | Services overview |
| `layanan/*/index.html` | Six service detail pages |
| `harga/index.html` | Pricing |
| `portofolio/index.html` | Concept/simulation portfolio examples |
| `tentang/index.html` | About Seiton.id |
| `kontak/index.html` | Contact |
| `ketentuan/index.html` | Terms |
| `privasi/index.html` | Privacy |
| `site.css` | Shared stylesheet |
| `site.js` | Shared menu behavior and WhatsApp link handling |
| `sitemap.xml`, `robots.txt` | Search indexing |
| `_headers` | Static response security headers |
| `scripts/check-site-integrity.mjs` | Public-site integrity contract check |
| `assets/` | Brand, portfolio, and profile assets |
| `workers/` | Old Worker copies, schema, and Worker notes; not the authoritative runtime repository |

## 2. Public URL/route inventory

The current sitemap contains **14 public URLs**:

1. `/`
2. `/layanan/`
3. `/harga/`
4. `/layanan/paket-etalase/`
5. `/layanan/katalog-produk/`
6. `/layanan/menu-qr/`
7. `/layanan/profil-google/`
8. `/layanan/website-katalog/`
9. `/layanan/paket-template/`
10. `/portofolio/`
11. `/tentang/`
12. `/kontak/`
13. `/ketentuan/`
14. `/privasi/`

There is no `/pendiri/` page in the current sitemap or repository tree.

## 3. Existing contact and founder assets

- `site.js` stores the WhatsApp number in one `WHATSAPP_NUMBER` constant and expands anchors with class `.wa` using `data-message`.
- The current contact page publishes WhatsApp and Instagram only.
- The current public site does not yet publish the final email, TikTok, or Threads entries supplied by the owner for the next site phase.
- Existing profile image assets are `assets/foto-profil-gelap.png` and `assets/foto-profil-terang.png`. They are PNG files today; a founder page and WebP derivatives do not yet exist.
- The existing About page describes Seiton.id as based in Jember, East Java. The current page describes the brand, not a standalone founder profile.

## 4. Database and runtime bindings

The public Pages root has no D1, Durable Object, R2, service, or Worker binding in its static-site structure. The `workers/` directory contains old deployment notes/configuration and duplicated Worker source; those files are not the authoritative production backend.

Specific duplicated material present:

- `workers/order-bot/README.md`
- `workers/order-bot/migrations/0002_multi_item_cart.sql`
- `workers/site-admin/README.md`
- `workers/site-admin/migrations/0001_initial.sql`
- `workers/site-admin/worker.js`
- `workers/site-admin/wrangler.toml`

The authoritative runtime repository is `midznight/Automation-Commerce`. The source copy in this frontend repository must not be modified as if it were the deployed Worker without a deliberate synchronization plan.

The frontend copy of `0002_multi_item_cart.sql` creates `order_items`, `order_item_inventory_movements`, and the related inventory guard/reserve/release triggers. This migration file is not in the backend repository's current `migrations/` directory even though the corresponding schema objects are visible in the production transaction D1.

## 5. Pricing data and owner panel references

- The public `harga/` page is integrated with the owner pricing API documented under `workers/site-admin/`.
- `workers/site-admin/migrations/0001_initial.sql` creates/seed tables `site_services`, `site_addons`, and `site_meta`, as well as `site_login_attempts`.
- Those files are documentation/legacy copies in this repo, not the source of the live Worker implementation.
- Prices are deliberately not reproduced in this baseline document to avoid introducing a second source of truth.

## 6. CI/test baseline

### Workflows

| Workflow | Trigger | Commands / behavior |
|---|---|---|
| `.github/workflows/site-integrity.yml` | Push to branches; PR to main | `node scripts/check-site-integrity.mjs` |
| `.github/workflows/optimize-portfolio-images.yml` | Push to `fix/p2-performance-seo-security` with matching image/HTML paths | Installs Pillow, converts any `assets/*.jfif` to WebP, rewrites HTML references, and commits the optimization if there are changes |

### Latest observed GitHub Actions evidence

For main commit `bcb21ae056eac4df27748aea1972d047482a3354` on 2026-11-05:

- `node scripts/check-site-integrity.mjs`: **passed**.
- Check output: `Site integrity check passed for 14 sitemap pages and service/pricing consistency.`

The log belongs to the current main commit and was inspected as baseline CI evidence. A fresh local run was not possible in this execution environment because `git clone` could not resolve `github.com`; no test result is represented as a local run.

## 7. Verified differences from the next requested site scope

1. No founder page or `/pendiri/` URL exists.
2. Profile PNG assets already exist, but have not been converted to WebP for a founder page.
3. Current public contact information is incomplete relative to the owner's final contact list: Instagram and WhatsApp are present; email, TikTok, and Threads are not yet published.
4. The current footer/contact pattern is not yet a shared labelled **Kontak Seiton.id** component across footer, contact page, and founder page.
5. The old `workers/` copy is present and overlaps with the backend repo; deletion is not part of this baseline phase.

## 8. Not changed / deferred

- No public HTML/CSS/JS/assets were changed.
- No Cloudflare Pages deployment or Cloudflare account configuration was changed.
- No prices or Worker bindings were edited.
- Founder-page copy must use only verified owner-provided facts and repository evidence; missing biography details remain `[DATA_DIBUTUHKAN]`.
- Contact additions, Threads URL validation, shared contact component, founder page, JSON-LD, sitemap/navigation updates, and accessibility checks are deferred to the relevant approved implementation phase.
