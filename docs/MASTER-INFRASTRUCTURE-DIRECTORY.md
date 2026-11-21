# Seiton.id Master Infrastructure Directory

Snapshot konfigurasi: **15 November 2026**  
Dokumen aman untuk repository: tidak menyimpan nilai secret, password, payload QRIS, token privat, atau URL mailbox individual.

## 1. Arsitektur ringkas

Seiton.id memiliki dua jenis runtime:
- Website utama dan pusat demo: Astro static build pada Cloudflare Pages.
- Aplikasi operasional: Cloudflare Workers dengan D1, KV, Durable Objects, R2, Workers AI, service bindings, Telegram Bot API, dan Google Sheets reporting mirror.

Repository:
- Website (publik): https://github.com/midznight/seiton.id
- Backend (privat): https://github.com/midznight/Automation-Commerce

Akses penuh ke dua repository dan Cloudflare diperlukan untuk memahami seluruh implementasi.

## 2. Direktori domain

### 2.1 Website publik

| URL | Fungsi | Platform/status |
|---|---|---|
| https://seiton.biz.id | Website utama, profil, layanan, harga, cerita, kontak, legal | Pages project seiton-biz-id; production aktif |
| https://www.seiton.biz.id | Alias website utama, canonical ke apex | Pages project seiton-biz-id; aktif |
| https://demo.seiton.biz.id | Pusat demonstrasi fiktif | Pages project seiton-demo; production aktif, noindex |

### 2.2 Worker domains

Semua hostname berikut ditemukan enabled pada environment production saat pembacaan Cloudflare tanggal 15 Nov 2026.

| URL | Worker | Fungsi |
|---|---|---|
| https://admin.seiton.biz.id | seiton-site-admin | Owner control panel |
| https://owner.seiton.biz.id | seiton-site-admin | Alias owner control panel |
| https://umkm.seiton.biz.id | seiton-order-bot | Admin workspace dan operasi order |
| https://automate-bot.seiton.biz.id | seiton-order-bot | Host backend, Telegram webhook, health |
| https://otp.seiton.biz.id | seiton-otp-portal | Portal mailbox privat |
| https://mail.seiton.biz.id | seiton-mail-automation | Panel dan API email automation |

Host alias tidak berarti Worker berbeda:
- admin + owner adalah satu Worker.
- umkm + automate-bot adalah satu Worker.

### 2.3 Domain email

- inbox.seiton.biz.id adalah domain penerima alias yang disiapkan.
- mail.seiton.biz.id adalah aplikasi/panel automation, bukan alamat penerima.
- otp.seiton.biz.id adalah portal akses mailbox, bukan domain email masuk.
- Status Email Routing harus diperiksa terpisah. Pada snapshot terakhir OTP_EMAIL_ROUTING_READY=false.

## 3. Cloudflare Pages

| Project | Kegunaan | Branch | Build command | Output | Domain |
|---|---|---|---|---|---|
| seiton-biz-id | Website production | main | npm run build:site | dist | seiton.biz.id, www.seiton.biz.id |
| seiton-demo | Demo production | main | npm run build:demo | dist-demo | demo.seiton.biz.id |
| seiton-main-preview | Preview website | rebuild | npm run build:site | dist | seiton-main-preview.pages.dev |
| seiton-demo-preview | Preview demo | rebuild | npm run build:demo | dist-demo | seiton-demo-preview.pages.dev |

Catatan:
- Website dan demo production menyelesaikan build dan deploy dengan sukses pada 15 Nov 2026.
- Commit website: 91258f58be8eacac91dd1482877bbb4adad7cd9b.
- Deployment website: 04448bd6-9b8a-40ec-8676-a668540ab975.
- Deployment demo: d04da812-322e-4500-a852-51808c762a43.
- Project preview hanya menerima branch rebuild dan menonaktifkan production deployments. Status skipped pada preview bukan kegagalan deployment production.
- Website utama berupa static site. Pages tidak menyimpan data transaksi. Harga dimuat saat runtime dari Site Admin API.

## 4. Detail Cloudflare Workers

### 4.1 seiton-order-bot

Hostname:
- https://umkm.seiton.biz.id
- https://automate-bot.seiton.biz.id

Source authoritative:
- Repository midznight/Automation-Commerce
- Root worker.js, transaction-layer.js, messaging-core.mjs, digital-products.mjs, qris.mjs

Entry point: worker.js  
Compatibility date: 2026-11-03

Fungsi utama:
- Telegram webhook dan command handler.
- Katalog, keranjang multi-item, checkout, order status, dan payment evidence.
- Admin Workspace single-store.
- Tambah/edit produk dan pengelolaan harga, stok, foto.
- Dashboard penjualan, laporan Telegram, dan ekspor CSV.
- Pickup/receipt workflow.
- Messaging Core: conversation mode, opt-out, human handoff, inbound dedupe, outbox.
- Reporting mirror ke Google Sheets.
- Foto/media produk melalui R2.

Bindings/resource yang telah teridentifikasi:
- D1 DB → seiton-transactions-prod.
- Durable Object ORDER_COORDINATOR → OrderCoordinator.
- KV MUSE_KV dan OTP_KV.
- R2 PRODUCT_MEDIA → seiton-product-media.
- Workers AI binding AI untuk screening gambar bukti.
- Rate limiter login admin.
- Telegram, Google Service Account, admin, serta encryption secrets. Nilai secret tidak didokumentasikan.

Rute:
- GET /health — status Worker dan transaction store.
- POST /telegram — Telegram webhook dengan secret header.
- GET / atau /admin — Admin Workspace.
- /pickup — proses pickup/receipt sesuai alur aplikasi.

Status:
- Audit 14 Nov 2026 melaporkan health pada kedua host sebagai ok dan transaction_store READY.
- Audit tidak melakukan order customer baru, pembayaran nyata, atau tes approval transaksi baru.
- Jangan mengarang username Telegram atau tautan t.me yang belum diverifikasi.

### 4.2 seiton-site-admin

Hostname:
- https://admin.seiton.biz.id
- https://owner.seiton.biz.id

Source authoritative: Automation-Commerce/site-admin/worker.js  
Compatibility date: 2026-11-04

Fungsi:
- Owner panel Seiton.id.
- Edit harga layanan dan add-on website.
- Public read-only pricing API.
- Owner sessions, audit trail, dan data sesi.
- Provisioning/admin OTP melalui integrasi service internal.

Bindings:
- D1 SITE_DB → seiton-site-content-prod.
- Service ORDER_BACKEND → seiton-order-bot.
- Service OTP_BACKEND → seiton-otp-portal.
- OTP_INTERNAL_SECRET sebagai secret antarservice.

Rute penting:
- GET / — owner panel; fitur mutasi memerlukan login.
- GET /api/pricing — harga publik read-only, dipakai halaman /harga/.
- GET /api/session — status sesi.
- /api/admin/pricing — pengelolaan harga oleh owner terautentikasi.
- /api/admin/audit dan /api/admin/sessions — audit dan sesi, wajib autentikasi.
- /otp — halaman pengelolaan/provisioning mailbox, wajib sesi owner.

Pemeriksaan audit:
- Sesi tanpa autentikasi dilaporkan authenticated:false.
- Endpoint admin tanpa sesi ditolak HTTP 401.
- Owner panel tidak ditampilkan di navigasi website publik.
- API public pricing tidak memiliki fungsi edit harga.

### 4.3 seiton-otp-portal

Hostname: https://otp.seiton.biz.id  
Source: Automation-Commerce/otp-portal/  
Entry point production: index.js  
Compatibility date: 2026-11-13  
Compatibility flag: nodejs_compat

Fungsi:
- Inbox privat bagi mailbox yang didaftarkan dan diotorisasi oleh pemilik domain.
- Akses per mailbox dengan token privat.
- Penyimpanan pesan dengan enkripsi AES-GCM dan TTL 3600 detik sesuai dokumentasi backend.
- Token akses disimpan sebagai hash, bukan nilai mentah.
- Durable Object MAILBOX_INDEX / MailboxIndex; KV MUSE_KV dan OTP_KV.

Batas readiness:
- /health pernah merespons ready pada audit.
- Portal ready bukan bukti Email Routing masuk sudah aktif.
- OTP_EMAIL_ROUTING_READY=false pada order Worker di snapshot terakhir.
- Catch-all routing dan real mailbox ingestion belum dinyatakan lulus end-to-end.
- Riwayat migration Durable Object harus dicocokkan sebelum deploy Worker OTP baru.
- Root URL portal bukan link mailbox; URL akses privat per mailbox tidak boleh dipublikasikan.

### 4.4 seiton-mail-automation

Hostname: https://mail.seiton.biz.id  
Database: seiton-mail-automation-prod

Fungsi yang teridentifikasi:
- Panel email automation owner.
- Inbound email handler dan scheduled handler.
- D1 menyimpan metadata serta body pesan terenkripsi.
- Machine-authenticated API untuk polling pesan dan membaca detail berdasarkan ownership alias dan auth.
- Email parser untuk ekstraksi verification code.

Batasan:
- Source lengkap Worker ini belum tersedia pada dua repository utama saat snapshot.
- Uji HTTP end-to-end ke domain tidak selesai dari lingkungan pemeriksaan terakhir; akses langsung diblokir oleh lingkungan koneksi.
- Jangan mengklaim semua format email sudah dapat diparse.
- Hanya proses mailbox dan akun yang dimiliki atau secara sah diotorisasi pemiliknya.
- Jangan menulis route token-bearing atau detail mailbox privat dalam dokumen publik.

## 5. Storage, data, dan integrasi

| Resource | Peran |
|---|---|
| D1 seiton-transactions-prod | Orders, order items, inventory, payment ledger, audit, messaging, digital fulfillment |
| D1 seiton-site-content-prod | Data layanan/harga/add-on serta owner sessions/audit terkait |
| D1 seiton-mail-automation-prod | Metadata dan body pesan email terenkripsi |
| D1 seiton-preview-transactions-20261109 | Resource preview/testing; bukan transaksi production |
| R2 seiton-product-media | Media/foto produk |
| KV MUSE_KV | Cache dan state produk digital tertentu |
| KV OTP_KV | State/index/akses mailbox sesuai kontrak aplikasi |
| Durable Object OrderCoordinator | Koordinasi checkout dan serialisasi operasi stok |
| Durable Object MailboxIndex | Indeks mailbox OTP |
| Google Sheets | Reporting mirror dan ekspor ringkasan |

D1 adalah sumber kebenaran transaksi. Google Sheets hanya mirror best-effort dan dapat tertinggal jika Google API gagal. Jangan mengedit stok atau status order langsung di Sheet setelah transaction store READY.

### Transaksi dan stok

Alur umum:
1. Telegram menerima permintaan pelanggan.
2. Worker membaca produk dan stok dari D1.
3. Keranjang multi-item dibangun.
4. Durable Object mengoordinasikan checkout.
5. D1 batch menyimpan order, items, dan stock movements.
6. Inventory triggers dan conditional writes melindungi stok dan status.
7. Admin meninjau pembayaran dan mengubah status.
8. Receipt/pickup mengikuti status transaksi.

Idempotency, stock reservation, approval pembayaran, dan penerbitan receipt harus diuji pada tiap perubahan. Khusus approve pembayaran berulang, pertahankan invariant satu transisi sah dan satu receipt, bukan menggandakan receipt.

## 6. QRIS dan batas verifikasi pembayaran

- Merchant/acquirer: GoPay Merchant Seiton.id.
- Engine internal tersedia di qris.mjs, dengan fungsi buildDynamicQrisPayload().
- Engine menyusun ulang payload QRIS MPM dari template statis merchant: POI 11 menjadi 12, mengisi tag 54 dengan nominal, dan menghitung CRC16/CCITT-FALSE.
- Engine tidak membuat tagihan melalui GoPay API, Midtrans, Xendit, atau gateway lain.
- Feature flags production terakhir: QRIS_INTERNAL_ENABLED=false dan QRIS_STATIC_FALLBACK_ENABLED=true.
- Artinya QRIS statis masih menjadi fallback production.
- QRIS_STATIC_PAYLOAD adalah secret. Jangan pernah menyalin payload asli ke GitHub, issue, atau chat.
- Nominal order menggunakan suffix acak tiga digit 001–999; D1 memiliki unique index untuk expected amount. Kapasitas suffix terbatas untuk nominal dasar yang sama dan perlu dipantau.
- QuickChart digunakan untuk render gambar QR dari payload saja; itu image renderer, bukan payment gateway.
- Tidak ada GoPay settlement callback/API pada rancangan yang terdokumentasi.
- Screenshot/OCR/Workers AI hanya screening; admin harus memeriksa transaksi nyata di GoPay Merchant.
- Jangan klaim QR dibatalkan, kedaluwarsa, atau single-use tanpa bukti dari acquirer.

Release gates sebelum QR dinamis diaktifkan:
1. Scan menggunakan GoPay, DANA, dan minimal satu aplikasi bank.
2. Merchant dan nominal yang ditampilkan harus benar.
3. Uji pembayaran riil bernilai kecil dari akun pembayar terpisah.
4. Pastikan dana masuk ke store GoPay Merchant Seiton.
5. Dapatkan konfirmasi GoPay/acquirer bahwa cara komposisi payload lokal diizinkan.
6. Uji checkout Telegram, ledger D1, payment proof, review admin, receipt tunggal, dan mirror report.
7. Baru setelah lolos, lakukan perubahan feature flag dengan izin owner. Static fallback harus tetap tersedia.

Jangan membuat converter kedua. Lanjutkan dan audit qris.mjs yang sudah ada.

Rujukan: Automation-Commerce/docs/INTERNAL-QRIS-ENGINE.md dan TELEGRAM-QRIS-SETUP.md.

## 7. Kanal dan Messaging Core

- Telegram adalah adapter aktif/utama.
- Messaging Core menormalkan conversation event, memproses command, mencatat inbound events, conversation modes, handoff, dan outbound outbox.
- Perintah yang didokumentasikan: MENU/HELP, KATALOG, PESANAN, STATUS, BELI, ADMIN/BANTUAN ADMIN, STOP, START.
- WhatsApp Business Platform adapter dan sender belum menjadi alur production.
- Tidak ada gateway QR/session tidak resmi yang dianggap resmi.
- WhatsApp CTA pada website adalah kanal konsultasi, bukan bukti bot WhatsApp aktif.

Rujukan: Automation-Commerce/docs/messaging-core.md.

## 8. Endpoint dan link operasional

| URL | Tujuan | Akses yang tepat |
|---|---|---|
| https://seiton.biz.id | Website publik | Publik |
| https://demo.seiton.biz.id | Demo fiktif | Publik |
| https://admin.seiton.biz.id | Owner panel | Owner login |
| https://admin.seiton.biz.id/otp | Pengelolaan mailbox | Owner login |
| https://umkm.seiton.biz.id | Admin Workspace | Admin login |
| https://automate-bot.seiton.biz.id/health | Health check order Worker | Operasional |
| https://automate-bot.seiton.biz.id/telegram | Telegram webhook | Telegram, POST dan secret valid |
| https://otp.seiton.biz.id/health | Health check OTP Portal | Operasional |
| https://mail.seiton.biz.id | Email automation panel | Owner login |
| https://admin.seiton.biz.id/api/pricing | Public read-only price API | Website |

automate-bot URL bukan tautan bot Telegram pelanggan. Jangan menuliskan atau membagikan mailbox URL privat.

## 9. Website routes yang dipublikasikan

### Main site

Canonical: https://seiton.biz.id  
Sitemap: https://seiton.biz.id/sitemap.xml  
Robots: https://seiton.biz.id/robots.txt

Sitemap memuat 26 URL:
- /
- /layanan/
- /layanan/paket-etalase/
- /layanan/katalog-produk/
- /layanan/menu-qr/
- /layanan/profil-google/
- /layanan/website-katalog/
- /layanan/website-profile/
- /layanan/paket-template/
- /layanan/bot-telegram/
- /layanan/sistem-bot-umkm/
- /layanan/paket-combo/
- /layanan/setup-ai-gateway-bot/
- /layanan/setup-portal-otp/
- /harga/
- /contoh/
- /cerita/
- /kontak/
- /panduan/
- /panduan/katalog-digital-umkm/
- /panduan/menu-digital-qr/
- /panduan/google-business-profile-umkm/
- /panduan/website-katalog-atau-marketplace/
- /jasa-website-umkm-jember/
- /ketentuan/
- /privasi/

Rute /tentang/ dan /pendiri/ diarahkan ke /cerita/.

### Pusat demo

Domain: https://demo.seiton.biz.id

Sepuluh rute:
- /
- /katalog-whatsapp/
- /menu-qr/
- /google-business-profile/
- /website-katalog/
- /website-katalog/katalog/
- /website-katalog/tentang/
- /website-katalog/kontak/
- /bot-umkm/
- /paket-combo/

Semua bisnis, SKU, foto produk contoh, transaksi, dan laporan demo bersifat fiktif. Demo memakai noindex/nofollow dan tidak memuat Analytics.

## 10. Pricing API dan Analytics

### Pricing
- Halaman /harga/ memakai GET https://admin.seiton.biz.id/api/pricing.
- Data harga dan add-on bersumber dari D1 Site Admin.
- Tidak ada fallback angka hardcoded jika API gagal.
- Sistem Bot UMKM dan Paket Combo menggunakan penawaran berbasis kebutuhan.
- Cek API live sebelum memberikan penawaran.

### Analytics
- Google Tag Manager: GTM-K3LKMTF3.
- GA4 Measurement ID: G-9Z02GKBZQX.
- Default consent analytics adalah denied.
- GTM dimuat hanya setelah opt-in eksplisit.
- Consent controller: /analytics-consent.js.
- Preview dan demo tidak memuat Analytics.
- Retensi event/user 14 bulan berdasarkan konfirmasi administrator; akses Realtime/DebugView belum diverifikasi langsung oleh audit.

Rujukan: ANALYTICS.md dan docs/P2-CLOSEOUT.md.

## 11. Repository dan branch authority

| Repository | Branch | Otoritas |
|---|---|---|
| midznight/seiton.id | main | Source website production |
| midznight/Automation-Commerce | main | Source Worker/backend yang direkonsiliasi dengan runtime pada audit |

Snapshot commit 15 Nov 2026:
- Website main: 91258f58be8eacac91dd1482877bbb4adad7cd9b.
- Backend main: 4395866758b6d7a8707609ea289f1d3da3472e38.

Folder legacy `workers/` telah dihapus dari repository website (`seiton.id`). Seluruh source authoritative Worker (termasuk Site Admin, Order Bot, OTP Portal, dan Mail Automation) berada di repository backend (`Automation-Commerce`).

## 12. Checklist sebelum perubahan produksi

- [ ] Verifikasi health Worker dan transaction_store.
- [ ] Periksa migration yang sudah diaplikasikan dan target D1 yang benar.
- [ ] Jangan menjadikan Google Sheets sebagai sumber transaksi.
- [ ] Jangan mengambil/mencatat nilai secrets.
- [ ] Pertahankan static QRIS fallback sampai acceptance test dan acquirer approval.
- [ ] Jangan aktifkan Email Routing sebelum ownership, allowlist, fallback, dan E2E tervalidasi.
- [ ] Jangan menganggap OTP Portal ready sama dengan email routing ready.
- [ ] Jangan membagikan token mailbox, OTP, atau bukti pembayaran.
- [ ] Jangan memasarkan single-store sebagai multi-tenant.
- [ ] Uji idempotensi approval dan receipt.
- [ ] Gunakan preview dan regression checks untuk perubahan website.
- [ ] Minta instruksi eksplisit sebelum deploy atau mengubah konfigurasi produksi.

## 13. Referensi

Website repo:
- README.md
- AGENTS.md
- ANALYTICS.md
- PERFORMANCE.md
- docs/P2-CLOSEOUT.md
- design-system/seiton-id/MASTER.md

Backend repo:
- README.md
- docs/FINAL-OPERATIONAL-AUDIT-2026-11-14.md
- docs/PRODUCTION-RUNTIME-RECONCILIATION-2026-11-14.md
- docs/TRANSACTION_CORE.md
- docs/INTERNAL-QRIS-ENGINE.md
- docs/TELEGRAM-QRIS-SETUP.md
- docs/messaging-core.md
- otp-portal/README.md
- site-admin/README.md