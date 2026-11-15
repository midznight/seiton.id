# AI Start Here — Seiton.id

Snapshot dokumentasi: 15 November 2026

Dokumen ini adalah titik masuk wajib bagi AI coding agent, developer, auditor teknis, dan mitra baru yang menangani Seiton.id.

- Website utama: https://seiton.biz.id
- Pusat demo: https://demo.seiton.biz.id
- Repository website (publik): https://github.com/midznight/seiton.id
- Repository backend (privat): https://github.com/midznight/Automation-Commerce

## 1. Seiton.id dalam satu menit

Seiton.id adalah bisnis layanan digital berbasis Jember, Jawa Timur, yang membantu UMKM di Indonesia menata informasi usaha, katalog, menu QR, website, dan alur pemesanan. Slogan: **Tata Usahamu, Mudahkan Pelanggan**.

Ekosistemnya terbagi menjadi:
1. Website publik dan demo, dibangun dengan Astro static site dan Cloudflare Pages.
2. Sistem operasional pesanan, menggunakan Cloudflare Workers, Telegram, D1, Durable Objects, R2, Workers AI, dan Google Sheets sebagai mirror laporan.
3. Panel pemilik, portal OTP, dan otomasi email yang berjalan pada Worker terpisah.

Dua repository utama memiliki tanggung jawab berbeda. AI yang hanya memiliki akses ke repository website tidak otomatis memiliki seluruh source backend atau konfigurasi Cloudflare.

## 2. Urutan baca wajib

Sebelum membuat rencana atau mengubah sistem, baca secara berurutan:

1. AGENTS.md — aturan kerja agent.
2. Dokumen ini — orientasi proyek dan sumber kebenaran.
3. docs/MASTER-INFRASTRUCTURE-DIRECTORY.md — domain, Pages, Worker, storage, API, dan status operasional.
4. docs/SEITON-BUSINESS-AND-PRODUCT-KNOWLEDGE.md — profil bisnis, layanan, pelanggan, komersial, dan roadmap.
5. README.md, ANALYTICS.md, PERFORMANCE.md, docs/P2-CLOSEOUT.md — website dan kualitas publikasi.
6. design-system/seiton-id/MASTER.md — design system.
7. Repository Automation-Commerce: README.md, docs/FINAL-OPERATIONAL-AUDIT-2026-11-14.md, docs/PRODUCTION-RUNTIME-RECONCILIATION-2026-11-14.md, docs/TRANSACTION_CORE.md, docs/INTERNAL-QRIS-ENGINE.md, docs/TELEGRAM-QRIS-SETUP.md, docs/messaging-core.md, otp-portal/README.md, site-admin/README.md.

Dokumen audit yang lebih baru mengalahkan petunjuk bootstrap lama apabila terdapat perbedaan.

## 3. Peta repository dan sumber kebenaran

| Repository | Fungsi | Otoritas |
|---|---|---|
| midznight/seiton.id | Website Astro, konten, design system, SEO, legal, demo, workflow website | Website publik |
| midznight/Automation-Commerce | Order Worker, transaksi, QRIS, Messaging Core, produk digital, Site Admin, OTP portal, migration, tests, audit backend | Backend dan Worker |

Sumber kebenaran per area:
- Website publik: source Astro dan data pada repository seiton.id.
- Harga layanan: D1 Site Admin melalui API resmi /api/pricing; jangan menyalin nilai ke HTML.
- Katalog, stok, order, payment ledger, dan status transaksi: D1 seiton-transactions-prod.
- Google Sheets: mirror pelaporan; bukan primary transaction store setelah migrasi D1.
- QRIS: qris.mjs dan release gates pada repository backend ditambah feature flags Cloudflare.
- OTP Portal: repository backend dan binding/runtime Cloudflare.
- Mail Automation: Worker runtime Cloudflare; source belum menjadi bagian lengkap dari dua repository utama.
- Domain, bindings, Pages deployment, Worker versions, dan feature flags: konfigurasi runtime Cloudflare.

## 4. Status penting agar AI tidak salah klaim

| Area | Status bukti terakhir | Makna |
|---|---|---|
| Website utama | Production Pages deploy sukses pada 15 Nov 2026 | Aktif |
| Demo | Production deploy sukses; data fiktif, noindex | Demo publik, bukan transaksi |
| Telegram bot | Kanal utama; secret bindings ada; webhook pernah dikonfirmasi terset | Cek health dan Telegram webhook sebelum klaim uji E2E terbaru |
| WhatsApp bot | Adapter resmi belum aktif; onboarding ditunda | Hanya kanal kontak/katalog, bukan bot operasional |
| Order database | Audit 14 Nov melaporkan D1 transaction store READY | D1 sumber kebenaran |
| Sheets | Reporting mirror best-effort | Tidak untuk mengubah stok/status transaksi |
| QRIS dinamis | Library sudah ada, flag produksi nonaktif; static fallback aktif | Jangan buat converter kedua atau aktifkan flag tanpa release gate |
| OTP Portal | Health pernah ready | Tidak membuktikan Email Routing atau inbox ingestion siap |
| Email Routing | OTP_EMAIL_ROUTING_READY=false pada pemeriksaan terakhir | Catch-all/ingestion belum dinyatakan lolos E2E |
| Mail Automation | Worker aktif terkonfigurasi; uji HTTP E2E masih terbatas | Jangan klaim seluruh pipeline tervalidasi |
| Multi-tenant | Order workspace masih single-store | Belum produk SaaS multi-tenant |
| AI Gateway / OTP setup | Detail layanan ada di website, namun audit availability terakhir unavailable | Cek API availability dan kesiapan aktual |

Ini adalah snapshot historis bertanggal, bukan jaminan status tidak berubah. Lakukan inspeksi read-only sebelum mengambil keputusan produksi.

## 5. Konflik dokumen yang sudah diketahui

- Deployment Guide awal menjelaskan Google Sheets sebagai database utama. Arsitektur terbaru menggunakan D1 sebagai sumber transaksi dan Sheets sebagai mirror; ikuti docs/TRANSACTION_CORE.md.
- Halaman detail layanan yang dipublikasikan tidak otomatis berarti layanan available untuk dipesan. Periksa API harga.
- QRIS engine lokal sudah diimplementasikan tetapi QRIS dinamis belum aktif di produksi.
- Salinan Worker Site Admin di repository website bukan source authoritative terbaru. Gunakan repository Automation-Commerce/site-admin.
- Mail Automation Worker belum memiliki source lengkap pada dua repository utama.
- Klaim jumlah halaman pada dokumen lama dapat tertinggal; sitemap production terbaru adalah referensi rute website.

## 6. Keamanan dan privasi

- Jangan pernah menulis nilai token Telegram, webhook secret, password admin, service-account private key, QRIS payload, encryption key, session secret, token mailbox, atau credential lain ke repository, issue, log, atau jawaban publik.
- Dokumentasikan nama binding dan tipe saja, bukan nilai secret.
- Jangan mempublikasikan URL mailbox privat, hash fragment, isi email pengguna, OTP, atau data pribadi pelanggan.
- Jangan mengakses mailbox hanya berdasarkan alamat email. Wajib ada ownership/otorisasi, allowlist, token privat, dan masa akses yang benar.
- Screenshot pembayaran atau OCR bukan bukti settlement. Admin harus memeriksa transaksi aktual di GoPay Merchant.
- Jangan mengaktifkan Email Routing catch-all sebelum domain fallback, allowlist, ownership, dan QA end-to-end disetujui.
- Jangan menjalankan migration pada database yang salah. Pastikan database, environment, schema, backup, dan urutan migration.
- Semua data demo fiktif; jangan dijadikan testimoni, portofolio klien, atau angka kinerja.
- Patuhi ketentuan pihak ketiga. Jangan membuat bypass terhadap onboarding, legalitas, verifikasi, atau pembatasan provider.
- Jangan mengarang legalitas, sertifikasi, klien, revenue, rating, SLA, atau keberhasilan transaksi.

## 7. Protokol perubahan

1. Pastikan repository, branch, environment, tujuan, dan batas ruang lingkup.
2. Baca source serta dokumentasi fitur dan periksa kondisi runtime secara read-only.
3. Catat baseline sebelum mengubah kode, database, atau konfigurasi.
4. Buat perubahan sekecil mungkin dengan backward compatibility.
5. Jalankan unit, integration, regression, build, integrity, dan accessibility checks yang relevan.
6. Tinjau diff untuk secret, data pelanggan, perubahan tak terkait, dan file hasil build.
7. Gunakan preview/staging dan smoke test jika tersedia.
8. Jangan deploy production atau mengubah DNS, secret, webhook, Email Routing, D1 production, R2 object, atau feature flag berisiko tanpa instruksi eksplisit.
9. Laporkan secara terpisah: perubahan source, test, preview, deployment, E2E test, dan risiko yang belum selesai.

## 8. Panduan website dan UI

Untuk pekerjaan UI:
- Baca design-system/seiton-id/MASTER.md dan override halaman terkait.
- Baca .agents/skills/ui-ux-pro-max/SKILL.md.
- Pertahankan Astro static-first, bahasa Indonesia, aksesibilitas keyboard, responsive mobile, reduced motion, dan brand palette.
- Harga publik harus selalu berasal dari API resmi.
- Demo harus tetap diberi label data fiktif, noindex/nofollow, dan tanpa Analytics.
- Hindari klaim pemasaran yang tidak didukung bukti.

## 9. Checklist orientasi AI baru

Sebelum mengusulkan perubahan, pastikan dapat menjelaskan:
- Apa bisnis dan layanan inti Seiton.id?
- Apa beda website publik, demo, Owner Admin, UMKM Workspace, OTP Portal, dan Mail Automation?
- Repository mana yang authoritative untuk source website dan Worker?
- D1 mana yang menjadi sumber transaksi dan apa peran Google Sheets?
- Mengapa QRIS dinamis belum dinyalakan walaupun library tersedia?
- Apa batas readiness OTP dan email routing?
- Mengapa WhatsApp bot tidak aktif?
- Mengapa workspace saat ini belum multi-tenant?
- Apa yang benar-benar sudah live, apa yang hanya listing, dan apa yang masih rencana?

Jika bukti tidak cukup, nyatakan belum diverifikasi. Jangan mengubah asumsi menjadi fakta.

## Panel admin terpadu — spesifikasi pengembangan

Permintaan owner untuk menyatukan seluruh kegiatan admin dalam satu panel sudah dipetakan. Spesifikasi teknis dan UX authoritative berada di repository backend privat: [UNIFIED-OWNER-CONTROL-CENTER.md](https://github.com/midznight/Automation-Commerce/blob/main/docs/UNIFIED-OWNER-CONTROL-CENTER.md).

Dokumen itu adalah baseline arsitektur dan roadmap, **bukan bukti panel terpadu telah selesai**. Target antarmuka tunggal adalah admin.seiton.biz.id; backend order, site, OTP, dan mail tetap terpisah di belakang satu owner session/BFF. AI baru wajib membacanya sebelum mengubah panel admin.
