# Seiton.id — Business, Product & Operating Knowledge

Snapshot katalog dan bisnis: **15 November 2026**

Dokumen ini menguraikan Seiton.id dari sisi identitas bisnis, positioning, pasar, portofolio layanan, produk internal, proses komersial, kanal komunikasi, operasi, teknologi, dan arah pengembangan. AI baru harus membaca dokumen ini bersama AI-START-HERE.md dan MASTER-INFRASTRUCTURE-DIRECTORY.md.

## 1. Identitas bisnis

| Elemen | Informasi |
|---|---|
| Nama | Seiton.id |
| Tagline | Tata Usahamu, Mudahkan Pelanggan |
| Pengelola | Abdul Hamid Maulana |
| Basis lokasi | Jember, Jawa Timur, Indonesia |
| Jangkauan | Online di seluruh Indonesia |
| Website | https://seiton.biz.id |
| Demo | https://demo.seiton.biz.id |
| Fokus | Solusi digital praktis untuk UMKM |

Seiton.id membantu UMKM merapikan cara usaha menampilkan informasi, memperkenalkan produk, menerima pertanyaan, dan mengelola pesanan. Teknologi adalah alat untuk menyelesaikan kebutuhan operasional sehari-hari, bukan tujuan akhir.

### Positioning

Seiton.id membantu UMKM memulai digitalisasi dari hal yang paling dibutuhkan: informasi usaha yang jelas, katalog produk, menu digital, website usaha, serta proses pemesanan yang lebih terstruktur. Solusi dipilih sesuai skala, kesiapan, dan cara kerja masing-masing usaha.

### Prinsip merek

1. Jelas: deliverable, biaya, jadwal, akses, dan pengecualian disampaikan sebelum pengerjaan.
2. Praktis: mulai dari masalah nyata; hindari fitur yang tidak diperlukan.
3. Bertahap: digitalisasi dapat dimulai dari solusi sederhana lalu berkembang.
4. Transparan: harga dan biaya pihak ketiga tidak disamarkan.
5. Bertanggung jawab: materi klien tidak menjadi portofolio tanpa izin tertulis.

## 2. Target pelanggan dan kebutuhan

### Segmen utama
- UMKM kuliner: warung, kedai, kafe, bakery, restoran, penjual makanan/minuman.
- Toko retail dan usaha lokal.
- Penyedia jasa yang memerlukan profil online.
- Usaha yang menerima banyak pertanyaan atau order melalui chat.
- Usaha yang masih mencatat pesanan secara manual.
- Pemilik domain yang membutuhkan email custom-domain dan mailbox privat yang sah.

### Masalah yang ditangani
- Produk, harga, dan foto tersebar di chat atau media sosial.
- Pelanggan berulang kali menanyakan daftar menu, harga, atau ketersediaan.
- Menu cetak sulit diperbarui.
- Usaha belum memiliki website profil/katalog sendiri.
- Pesanan dan pembayaran sulit dilacak.
- Pemilik memerlukan laporan penjualan yang lebih rapi.
- Integrasi tertentu membutuhkan onboarding resmi dan persyaratan pihak ketiga.

Pisahkan layanan sederhana dari fitur yang memerlukan legalitas atau approval provider. Jangan mensyaratkan dokumen yang tidak relevan, tetapi jangan menjanjikan persyaratan resmi platform/acquirer dapat dilewati.

## 3. Portofolio layanan yang dipublikasikan

Website saat ini memuat 12 halaman detail layanan pada src/data/services.json. Listing halaman bukan jaminan layanan tersebut sedang tersedia untuk dipesan; status komersial harus diperiksa pada API harga.

### A. Tampil profesional

| Layanan | Ringkasan |
|---|---|
| Paket Etalase | Penataan katalog WhatsApp Business, menu QR, dan panduan Google Business Profile sesuai kelayakan |
| Katalog Produk WhatsApp Business | Struktur kategori, foto, informasi produk, dan tautan katalog |
| Menu QR | Halaman menu responsif dan QR untuk dibagikan/dicetak |
| Google Business Profile | Pemeriksaan kelayakan, penyusunan informasi, serta panduan foto dan pembaruan profil |
| Website Katalog UMKM | Website profil dan katalog produk bergambar dengan tautan kontak/pemesanan |
| Website Profile Usaha | Beranda, profil, layanan/produk, dan kontak; dua revisi sesuai scope awal |

### B. Kelola pesanan

| Layanan | Ringkasan |
|---|---|
| Paket Template Operasional | Template balasan cepat dan pencatatan dasar |
| Bot Pesanan Telegram | Percakapan dan pemesanan melalui Telegram sesuai penawaran |
| Sistem Bot UMKM | Katalog, cart, pencatatan order, pembayaran, panel produk/harga, dashboard, laporan, bantuan |
| Paket Combo Website + Bot UMKM | Website profil/katalog digabung dengan order flow dan panel pengelolaan |

### C. Integrasi dan otomasi

| Layanan | Ringkasan |
|---|---|
| Setup AI Gateway & Bot Asisten 24/7 | Evaluasi model/provider, konfigurasi gateway, bot Telegram, prompt, test, dan serah terima |
| Setup Portal OTP & Email Custom Domain | DNS/domain review, Email Routing, mailbox privat, retensi, revoke, dan pengujian |

Gunakan src/data/services.json dan halaman detail sebagai definisi ruang lingkup. Jangan memperluas deliverable hanya berdasarkan nama paket.

### Availability terakhir yang terdokumentasikan

Audit backend 14 Nov 2026 mencatat Telegram, website katalog, profile, dan package available pada data harga yang diperiksa. WhatsApp bot, AI Gateway setup, dan OTP setup tercatat unavailable. Sistem Bot UMKM dan Paket Combo memakai penawaran berdasarkan kebutuhan, bukan harga hardcoded.

**Wajib:** periksa https://admin.seiton.biz.id/api/pricing sebelum memberi harga/status terbaru.

## 4. Produk dan sistem internal

### 4.1 Website utama

Website menjadi storefront publik untuk menjelaskan brand, layanan, harga, contoh, cerita, dan kontak. Dibangun dengan Astro static-first di Cloudflare Pages. Website tidak mengelola transaksi bot secara langsung. Halaman Harga membaca data dari Site Admin API.

Owner panel tidak ditampilkan pada navigasi website publik.

### 4.2 Pusat demonstrasi

Demo menunjukkan katalog WhatsApp, menu QR, Google Business Profile, website katalog, simulasi bot UMKM, dan Paket Combo. Semua nama usaha, produk, SKU, harga, order, dan laporan adalah fiktif.

Demo:
- Tidak memproses transaksi atau pelanggan sungguhan.
- Bukan bukti proyek klien, testimoni, atau portofolio.
- Menggunakan noindex/nofollow.
- Tidak memuat GTM/GA4.

### 4.3 Telegram Order Bot dan Admin Workspace

Satu sistem operasional yang menghubungkan pelanggan, katalog, checkout, admin, status order, laporan, dan pickup.

Kemampuan dalam source/backend:
- Katalog produk dengan foto.
- Availability label untuk produk aktif, nonaktif, atau sold out.
- Cart multi-item.
- Parent order dan order items.
- Inventory ledger dan stock reservation dalam transaksi D1.
- Wizard tambah/edit produk, termasuk foto/deskripsi.
- Pengelolaan harga, stok, dan produk melalui admin.
- Dashboard penjualan dan ekspor CSV.
- Laporan Telegram admin.
- Payment evidence screening dan review admin.
- Pickup/receipt workflow.
- Messaging Core: opt-out, conversation state, outbox, dan human handoff.

Google Sheets adalah mirror pelaporan; D1 menjadi sumber kebenaran. Jika mirror gagal, data transaksi tetap di D1.

### 4.4 Dua aplikasi panel admin

**Panel Owner Seiton.id**
- URL: https://admin.seiton.biz.id
- Alias: https://owner.seiton.biz.id
- Mengelola harga layanan/add-on website, audit, owner session, dan provisioning mailbox.
- Terpisah dari navigasi publik.

**UMKM Admin Workspace**
- URL: https://umkm.seiton.biz.id
- Mengelola katalog, produk, harga, stok, pesanan, pembayaran, dashboard dan laporan untuk workspace bot.
- Implementasi saat ini masih single-store.

### 4.5 Multi-tenant masa depan

Keputusan bisnis owner:
- Setiap UMKM pembeli harus memiliki akun/admin yang terpisah.
- Data, katalog, transaksi, dan kredensial pelanggan tidak boleh bercampur dengan akun utama atau tenant lain.
- Arsitektur yang harus dievaluasi: database/Worker terisolasi per pelanggan atau shared platform dengan tenant_id dan authorization boundary ketat.
- Rancang provisioning, secret isolation, backup, quota, billing, domain, akses support, dan offboarding sebelum menjual sebagai produk multi-tenant.

Jangan menyebut workspace saat ini sebagai SaaS multi-tenant sampai provisioning dan isolation test lulus.

## 5. Kanal komunikasi dan keputusan WhatsApp/Telegram

### Kontak resmi yang tercantum di website

- WhatsApp: 0888 0929 4868 — https://wa.me/6288809294868
- Email: seiton.id@gmail.com
- Instagram: @seiton.id — https://www.instagram.com/seiton.id
- TikTok: @seiton.id — https://www.tiktok.com/@seiton.id
- Threads: @seiton.id — https://www.threads.com/@seiton.id

### WhatsApp

- Nomor kontak bisnis terbaru: 0888 0929 4868.
- Semua tautan wa.me wajib memakai nomor canonical 6288809294868.
- WhatsApp dipakai untuk konsultasi dan CTA website.
- Integrasi bot WhatsApp Business Platform/Cloud API ditunda karena onboarding dan persyaratan provider.
- Tidak ada adapter WhatsApp resmi yang aktif di order bot saat snapshot.
- Hindari gateway QR/session tidak resmi seperti metode yang rawan disconnect, perubahan protokol, atau pembatasan akun.
- Jangan menyimpulkan bot WhatsApp aktif karena halaman layanan atau kontak WhatsApp tersedia.

### Telegram

- Telegram adalah kanal bot utama saat ini.
- Webhook menggunakan POST /telegram pada host automate-bot.
- Token dan webhook secret disimpan di Cloudflare Worker Secrets.
- Operator sebelumnya mengonfirmasi setWebhook berhasil; audit 14 Nov tidak meminta getWebhookInfo lagi karena token tidak dibaca.
- Username bot pelanggan belum terverifikasi di dokumen; jangan mengarang link t.me.

## 6. Proses penjualan dan delivery

Alur kerja standar sesuai halaman Harga dan Ketentuan:
1. Pelanggan menghubungi Seiton.id melalui kanal resmi.
2. Tim memahami nama/jenis usaha, masalah, bahan, dan proses sekarang.
3. Scope, deliverable, biaya, jadwal, bahan, akses, serta dependensi pihak ketiga ditulis.
4. Konsultasi awal tidak dikenakan biaya.
5. Pembayaran standar: DP 50% setelah scope/biaya disetujui.
6. Waktu kerja dimulai setelah DP dan semua bahan/akses yang disepakati diterima lengkap.
7. Hasil diuji dan diperiksa pelanggan sebelum dipublikasikan.
8. Pelunasan 50% setelah pekerjaan selesai dan sebelum serah terima akhir.
9. Maintenance atau perubahan pasca-serah-terima hanya termasuk jika tertulis dalam penawaran.

### Data intake yang relevan
- Nama dan kategori usaha.
- Produk/layanan yang dijual.
- Masalah utama dan hasil yang diharapkan.
- Kanal komunikasi dan proses pesanan saat ini.
- Foto, logo, deskripsi, daftar produk, harga, dan tautan.
- Kebutuhan domain, hosting, akses, serta integrasi pihak ketiga.

### Ketentuan komersial penting

- Harga final mengikuti API harga resmi atau penawaran tertulis.
- Domain, hosting, langganan, API, dan layanan pihak ketiga tidak termasuk kecuali disebut tertulis.
- Website tidak menerima pembayaran online secara langsung.
- Ketentuan website menyatakan DP 50% yang dibayar hangus jika pembeli membatalkan setelah pembayaran diterima.
- Website katalog dan website profile mencakup dua kali revisi sesuai deskripsi penawaran/harga; layanan lain mengikuti scope tertulis.
- Akun pihak ketiga tetap atas nama dan kendali pelanggan. Gunakan invitation/collaborator, bukan berbagi password jika tersedia.
- Materi pelanggan tidak boleh dipublikasikan sebagai portofolio tanpa izin tertulis terpisah.

## 7. Legalitas dan persyaratan platform

Seiton.id ingin membantu UMKM yang masih minim dokumen administrasi. Pedoman:
- Jangan mensyaratkan NIB untuk pekerjaan yang tidak membutuhkannya.
- Jangan menjanjikan platform/provider menerima usaha tanpa persyaratan verifikasi.
- Google Business Profile harus melalui pemeriksaan kelayakan kebijakan Google.
- WhatsApp Business Platform harus mengikuti proses resmi ketika integrasi diaktifkan.
- Email Routing hanya untuk domain yang dimiliki atau diotorisasi secara tertulis.
- QRIS mengikuti aturan merchant/acquirer; komposisi payload lokal bukan bukti hak acquiring atau settlement.
- Jangan menggunakan mailbox atau akun yang bukan milik atau tidak diotorisasi pelanggan.

## 8. Pembayaran dan transaksi

### Sumber data transaksi
- D1 seiton-transactions-prod: sumber kebenaran order, items, stok, payment ledger, dan status.
- Durable Object OrderCoordinator: koordinasi checkout/stok.
- R2 seiton-product-media: gambar/media produk.
- Google Sheets: reporting mirror.
- Status paid memerlukan proses admin terverifikasi dan conditional D1 write.

### QRIS GoPay Merchant

- QRIS merchant milik Seiton.id diterbitkan melalui GoPay Merchant.
- Library lokal sudah ada pada qris.mjs; fungsi utama buildDynamicQrisPayload().
- Converter mengubah static QR payload ke payload dengan nominal dan menghitung ulang CRC.
- Ini tidak memanggil GoPay bill API atau payment gateway.
- Flag production terakhir: QRIS_INTERNAL_ENABLED=false; QRIS_STATIC_FALLBACK_ENABLED=true.
- Karena itu checkout produksi masih memakai fallback QRIS statis.
- Nominal order memuat suffix unik 3 digit 001–999.
- Belum ada GoPay settlement callback/API; OCR/Workers AI hanya menyaring bukti.
- Admin harus memeriksa transaksi aktual di GoPay Merchant sebelum approval.
- Jangan klaim QR expired/cancelled/single-use tanpa konfirmasi acquirer.

Release gate sebelum mengaktifkan dynamic QR:
1. Scan GoPay, DANA, dan setidaknya satu mobile banking.
2. Cocokkan merchant dan nominal.
3. Lakukan transaksi nyata kecil dari akun pembayar terpisah.
4. Pastikan dana masuk ke akun/store GoPay Merchant Seiton.
5. Minta konfirmasi GoPay/acquirer tentang izin metode komposisi lokal.
6. Uji checkout, D1 ledger, bukti, approval admin, receipt satu kali, dan reporting mirror.
7. Baru lakukan tinjauan feature flag dengan persetujuan owner.

Jangan membuat library converter kedua; lanjutkan engine yang ada.

## 9. OTP Portal dan Mail Automation

Ada dua Worker terpisah:
- OTP Portal: otp.seiton.biz.id.
- Mail Automation: mail.seiton.biz.id.

OTP portal dirancang untuk mailbox yang diotorisasi pemilik domain, menggunakan token akses privat per mailbox, token hash, enkripsi AES-GCM, dan TTL 3600 detik menurut dokumentasi backend.

Mail Automation menggunakan D1 untuk metadata/body terenkripsi dan API machine terproteksi.

Batas terkini:
- OTP_EMAIL_ROUTING_READY=false pada snapshot terakhir.
- Catch-all Email Routing dan inbox ingestion nyata belum dinyatakan lulus E2E.
- Status health portal ready tidak membuktikan Email Routing berjalan.
- Mail Automation source belum ada secara lengkap di dua repository utama.
- Provisioning wajib memeriksa ownership domain, allowlist, akses privat, expiry/revoke, dan tes email kirim/terima.
- Isi email/OTP hanya boleh diakses pada mailbox yang dimiliki atau diotorisasi.

## 10. Brand voice dan design system

- Gunakan bahasa Indonesia yang jelas, lugas, dan menjelaskan hasil.
- Hindari hiperbola, jaminan omzet, ranking Google, atau performa tanpa bukti.
- Jangan membuat testimoni, review, client logo, customer count, revenue, atau angka bisnis fiktif.
- Gaya visual: minimalism/Swiss structure dengan foto produk dan product previews yang informatif.
- Brand tokens:
  - Ink #1F2937
  - Ink soft #354253
  - Orange #FF6B35
  - Orange deep #B94A22
  - Text accent #A94420
  - Bone #F7F5EF
  - Surface #FFFFFF
  - Sage #E7EDE4
  - Border #DFE1DC
  - Muted #5E6874
- Orange #FF6B35 di atas putih tidak cukup kontras untuk teks kecil; gunakan warna gelap pada tombol orange atau deep orange pada permukaan putih.
- Pertahankan system font stack, responsive layout, keyboard access, visible focus, image alt, dan reduced motion.
- Rujukan: design-system/seiton-id/MASTER.md.

## 11. Website yang telah dipublikasikan

### Website utama

- https://seiton.biz.id/
- https://seiton.biz.id/layanan/
- https://seiton.biz.id/harga/
- https://seiton.biz.id/contoh/
- https://seiton.biz.id/cerita/
- https://seiton.biz.id/kontak/
- https://seiton.biz.id/ketentuan/
- https://seiton.biz.id/privasi/

### Dua belas halaman detail layanan

- https://seiton.biz.id/layanan/paket-etalase/
- https://seiton.biz.id/layanan/katalog-produk/
- https://seiton.biz.id/layanan/menu-qr/
- https://seiton.biz.id/layanan/profil-google/
- https://seiton.biz.id/layanan/website-katalog/
- https://seiton.biz.id/layanan/website-profile/
- https://seiton.biz.id/layanan/paket-template/
- https://seiton.biz.id/layanan/bot-telegram/
- https://seiton.biz.id/layanan/sistem-bot-umkm/
- https://seiton.biz.id/layanan/paket-combo/
- https://seiton.biz.id/layanan/setup-ai-gateway-bot/
- https://seiton.biz.id/layanan/setup-portal-otp/

Sitemap production berisi 20 URL. Rute /tentang/ dan /pendiri/ redirect ke /cerita/. Profil personal pendiri yang terpisah belum tertaut dari website; founderProfileUrl masih kosong pada data website.

### Pusat demonstrasi

- https://demo.seiton.biz.id/
- https://demo.seiton.biz.id/katalog-whatsapp/
- https://demo.seiton.biz.id/menu-qr/
- https://demo.seiton.biz.id/google-business-profile/
- https://demo.seiton.biz.id/website-katalog/
- https://demo.seiton.biz.id/website-katalog/katalog/
- https://demo.seiton.biz.id/website-katalog/tentang/
- https://demo.seiton.biz.id/website-katalog/kontak/
- https://demo.seiton.biz.id/bot-umkm/
- https://demo.seiton.biz.id/paket-combo/

Demo menggunakan usaha fiktif Kedai Roti & Teh Contoh, data produk simulasi, dan bukan transaksi nyata.

## 12. Analytics dan privasi

- GTM container: GTM-K3LKMTF3.
- GA4 Measurement ID: G-9Z02GKBZQX.
- Default consent analytics denied.
- GTM hanya dimuat sesudah izin analytics eksplisit.
- Pengunjung dapat membuka pengaturan privasi lagi dari footer.
- Demo dan preview tidak memuat Analytics.
- Retensi user/event 14 bulan berdasarkan konfirmasi administrator properti.
- Request page_view terlihat dalam tes browser pasca-consent sebelumnya; laporan Realtime/DebugView belum diverifikasi langsung.
- Kebijakan privasi menjelaskan data konsultasi/proyek, provider pihak ketiga, analytics consent, retensi, dan permintaan data.

## 13. Roadmap dan keputusan owner

1. Stabilkan Telegram order flow, transaksi D1, inventory, approval idempotent, dan receipt tunggal.
2. Lanjutkan QRIS internal dengan cross-wallet tests, transaksi kecil, dan persetujuan acquirer; jangan aktifkan otomatis.
3. Pertahankan WhatsApp sebagai kanal konsultasi; tunda bot resmi sampai onboarding dan persyaratan layak. Jangan beralih ke gateway tidak resmi.
4. Selesaikan OTP/email dengan ownership, routing, privacy, dan E2E checks.
5. Pertahankan pemisahan Owner Admin dan UMKM Workspace.
6. Desain multi-tenant dengan akun dan data terisolasi untuk setiap UMKM sebelum penjualan multi-customer.
7. Jaga sinkronisasi source website, pricing API, dan demo.
8. Catat bukti test dan status setiap deployment agar AI baru bisa melanjutkan tanpa mengulang asumsi.

## 14. Aturan untuk AI/developer

- Baca docs/AI-START-HERE.md dan docs/MASTER-INFRASTRUCTURE-DIRECTORY.md lebih dulu.
- Website: kerjakan di repository midznight/seiton.id.
- Backend Worker, transaksi, QRIS, Site Admin, Messaging Core, dan OTP Portal: gunakan repository privat Automation-Commerce.
- Jangan menjadikan Worker salinan dalam website repo sebagai authoritative backend.
- Jangan hardcode harga.
- Jangan menyebut layanan unavailable sebagai siap dijual.
- Jangan mengklaim WhatsApp bot, QRIS dinamis, OTP email routing, atau multi-tenant live tanpa bukti runtime.
- Jangan deploy atau mengubah resource production tanpa instruksi eksplisit.
- Laporan akhir harus memisahkan perubahan source, unit/regression test, preview, production deploy, dan E2E evidence.

## 15. Sumber referensi utama

Website:
- src/data/site.json
- src/data/services.json
- src/pages/
- src/demo/pages/
- public/sitemap.xml
- design-system/seiton-id/MASTER.md
- README.md, AGENTS.md, ANALYTICS.md, PERFORMANCE.md
- docs/P2-CLOSEOUT.md
- public/ketentuan/index.html
- public/privasi/index.html

Backend:
- README.md
- worker.js, transaction-layer.js, messaging-core.mjs, qris.mjs, digital-products.mjs
- migrations/ dan tests/
- docs/FINAL-OPERATIONAL-AUDIT-2026-11-14.md
- docs/PRODUCTION-RUNTIME-RECONCILIATION-2026-11-14.md
- docs/TRANSACTION_CORE.md
- docs/INTERNAL-QRIS-ENGINE.md
- docs/TELEGRAM-QRIS-SETUP.md
- docs/messaging-core.md
- otp-portal/README.md
- site-admin/README.md