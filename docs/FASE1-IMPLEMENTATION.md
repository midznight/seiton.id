# Implementasi Fase 1 — Seiton.id

**Peta teknis:** 13 November 2026  
**Sumber kebutuhan:** Dokumen Master Fase 1 yang diberikan pemilik (Single Source of Truth).  
**Ruang lingkup:** website `seiton.biz.id`, portal `otp.seiton.biz.id`, bot Telegram Seiton.id, dan materi Google Business Profile.

## 1. Tujuan dan batas fase

Fase 1 menambah penjualan produk digital dan jasa otomasi AI, portal mailbox OTP untuk domain yang dimiliki/diotorisasi, serta onboarding paket Muse Bisnis. Semua berjalan di Cloudflare Workers, KV, Durable Objects, dan D1. VM Muse (9Router, Muse Bridge, Stock Server port 8767) **tidak dijalankan** pada Fase 1.

WhatsApp belum diaktifkan. Kanal yang dipakai untuk order dan administrasi saat ini adalah Telegram; integrasi WhatsApp hanya dilakukan setelah jalur resmi dan akses sah tersedia.

## 2. Pemetaan kebutuhan master ke kondisi sistem

| Kebutuhan master | Implementasi sekarang | Status |
|---|---|---|
| Produk `muse_starter` Rp25.000, hanya di bot | SKU internal `MUSE-STARTER`, tidak dipajang di website/GBP | Sudah ada; penjualan masih terkunci |
| Produk `muse_bisnis` Rp150.000 | SKU `MUSE-BISNIS`; website menawarkan jasa Setup AI Gateway & Bot Asisten 24/7 | Katalog website tersedia |
| `otp_setup` Rp100.000 | Layanan Setup Portal OTP & Email Custom Domain | Katalog website tersedia |
| Portal `otp.seiton.biz.id` | Worker terpisah `seiton-otp-portal`, domain Worker sudah terpasang | Worker OTP generasi DO/session telah di-deploy; pengujian email nyata masih menunggu Email Routing |
| OTP_KV: 5 pesan, TTL 1 jam | Namespace `OTP_KV`; Worker baru menyimpan 5 pesan dan TTL 3600 detik | Kode dan tes disiapkan |
| MUSE_KV: stok/log/tunnel | Namespace `MUSE_KV` sudah ada; saat ini dipakai sebagai cache/index mailbox, bukan penyimpanan password plaintext | Namespace siap, tidak berisi stok |
| Perintah admin Telegram | Worker produksi sudah memiliki `/cekstok`, `/addstock`, `/delstock`, `/cekorder`, `/approve` | Kode aktif; perlu uji end-to-end setelah email siap |
| Form `SETUP | ...` | Bot menerima format `SETUP | Nama Usaha | Token Bot Telegram | Deskripsi Layanan` setelah order Muse Bisnis memenuhi syarat | Kode aktif |
| Stok habis dan antrean prioritas | Digital fulfillment memiliki status `WAITING_STOCK`; bot memberi pesan pembeli dan notifikasi admin | Kode aktif |
| Klaim stok Fase 1 → Fase 2 | `ACTIVE_TUNNEL_URL` belum diaktifkan; tidak ada VM Muse yang dijalankan | Fase 2 belum aktif |
| Google Business Profile | Draft deskripsi, layanan, dan checklist ada di `docs/GOOGLE-BUSINESS-PROFILE-UPDATE.md` | Belum dipublikasikan |
| Semua domain `.biz.id` | Akun Cloudflare saat ini hanya memiliki zone aktif `seiton.biz.id` | Domain pelanggan lain harus diverifikasi dan dikonfigurasi per zone |

## 3. Keputusan arsitektur dan keamanan

### 3.1 Penyimpanan stok

Dokumen master memberi contoh array JSON `stock:muse_starter` / `stock:muse_bisnis` di KV yang berisi email dan password secara langsung. Implementasi produksi yang ditemukan sudah lebih aman dan lebih tahan race condition:

- D1 `seiton-transactions-prod` adalah sumber kebenaran order, reservasi stok, fulfillment, dan audit.
- Kredensial stok disimpan pada tabel `digital_stock_accounts` dalam bentuk AES-GCM ciphertext; email diindeks dengan SHA-256. Password tidak ditulis sebagai plaintext ke KV.
- Klaim stok dilakukan melalui transaksi terkoordinasi dan idempotent; satu akun tidak dapat diklaim dua order secara bersamaan.
- `MUSE_KV` tetap disediakan untuk cache/index ringan dan kompatibilitas fase berikutnya, bukan sebagai sumber kebenaran paralel yang dapat berbeda dari D1.
- `digital_fulfillments` dan `digital_setup_requests` menyimpan status fulfillment dan onboarding. Token bot pada form setup disimpan terenkripsi.

Ini adalah deviasi sadar dari contoh JSON plaintext pada master. Semantik produk, jumlah stok, pengiriman, log order, dan migrasi Fase 2 dipertahankan tanpa menurunkan keamanan data.

### 3.2 Portal OTP

Desain portal yang ditambahkan ke repository menggunakan:

- Domain allowlist dari `OTP_ALLOWED_DOMAINS`; alamat email saja tidak pernah cukup untuk membuka inbox.
- Provision mailbox secara eksplisit, setelah pemilik domain atau pihak yang diberi otorisasi diverifikasi.
- Token acak 256-bit; yang disimpan pada Durable Object adalah hash token.
- Token akses ditukar menjadi cookie sesi `__Host-otp_session` dengan atribut `HttpOnly; Secure; SameSite=Strict`, masa sesi 30 menit.
- Durable Object `MailboxIndex` mengelola status mailbox, sesi, retensi, rotasi, dan pencabutan.
- `OTP_KV` menyimpan maksimal lima pesan per mailbox dengan `expirationTtl: 3600`.
- Isi yang disimpan dibatasi pada teks email; lampiran tidak disimpan. Preview dibatasi 1.600 karakter dan kandidat kode numerik 4–8 digit hanya merupakan hasil ekstraksi, bukan bukti keaslian OTP.
- Rotasi menonaktifkan sesi/link lama; revoke menghapus pesan dan sesi yang terkait.
- Link Telegram generasi pertama dengan bentuk `/?email=...#token` harus tetap didukung selama migrasi, agar link yang mungkin sudah diterbitkan tidak putus.

Portal hanya digunakan untuk mailbox pada domain yang dimiliki atau diotorisasi. Jangan mengaktifkan penerimaan semua local-part sebelum pemetaan alamat email domain dan pengujian aturan spesifik selesai.

### 3.3 Integrasi Worker

- `seiton-order-bot` tetap menjadi Worker transaksi dan webhook Telegram; source produksinya diambil dari Cloudflare untuk audit karena file repository sebelumnya tertinggal.
- `seiton-otp-portal` adalah Worker terpisah dengan Email Routing handler.
- `seiton-site-admin` adalah panel pemilik yang sudah berjalan. Source live memiliki validasi sesi/audit yang lebih baru daripada file repository. Integrasi mailbox harus ditambahkan ke versi live tanpa mengganti lapisan sesi tersebut.
- Worker admin dan bot memakai service binding internal ke OTP Worker serta secret internal yang sama. Endpoint `/internal/*` tidak boleh dipanggil tanpa secret.
- `OTP_EMAIL_ROUTING_READY=false` tetap menjadi gate sampai Email Routing dan alur mailbox teruji. Dengan gate ini, bot tidak boleh menjual/mengirim produk digital ketika portal tidak siap.

## 4. Kondisi Cloudflare saat audit

- Zone `seiton.biz.id` aktif.
- Worker `seiton-order-bot`, `seiton-site-admin`, dan `seiton-otp-portal` sudah ada.
- `otp.seiton.biz.id` sudah terhubung ke Worker OTP.
- Namespace `OTP_KV` dan `MUSE_KV` sudah ada dan saat audit tidak berisi key.
- D1 produksi sudah memiliki tabel `digital_stock_accounts`, `digital_fulfillments`, `digital_setup_requests`, dan tabel transaksi terkait. Belum ada order digital fase ini.
- `OTP_EMAIL_ROUTING_READY` pada Worker bot masih `false`.
- Email Routing zone masih `unconfigured/disabled`; catch-all belum diaktifkan. Tidak ada mailbox pelanggan yang boleh diasumsikan sudah menerima email.
- Hanya zone `seiton.biz.id` yang terlihat di akun Cloudflare; domain `.biz.id` lain tidak otomatis terhubung.

## 4A. Deployment runtime (13 November 2026)

- Worker `seiton-otp-portal` berhasil diunggah dengan `fetch` dan `email` handler, Durable Object `MailboxIndex` (migration tag `v1`), binding `OTP_KV`, `MUSE_KV`, dan secret internal.
- Versi OTP aktif: `726c0db8-8fa5-4124-b925-84cdd57de46a`; deployment `d6a9fdd4-ae7c-4c7d-9df9-8f3c2672068b` (deployment aktif 100%).
- Worker `seiton-site-admin` diperbarui dari **source live** (bukan file lama repository), mempertahankan sesi revocable, audit, D1, dan `ORDER_BACKEND`. Ditambahkan service binding `OTP_BACKEND`, secret internal, menu Portal OTP, endpoint provision/list/rotate/revoke, dan UI yang menampilkan link privat hanya satu kali.
- Versi admin aktif: `1be3dc58-cb73-443c-87a8-3c974304b23f`; deployment `c6f9fce0-2db6-498c-8901-cedcd490c2ca`.
- Domain Worker `otp.seiton.biz.id`, `admin.seiton.biz.id`, dan `owner.seiton.biz.id` tetap terpasang dan enabled.
- Source live admin yang telah di-patch disinkronkan kembali ke `workers/site-admin/worker.js` pada branch `rebuild` agar perubahan tidak hilang pada deploy berikutnya. Aksi mutasi pada panel menerima Origin hanya dari `admin.seiton.biz.id` dan `owner.seiton.biz.id`. Endpoint harga publik juga mengizinkan Origin staging yang spesifik `https://rebuild.seiton-main-preview.pages.dev`; tidak ada wildcard Pages.dev.
- Pemeriksaan metadata deployment dan binding Cloudflare berhasil.
- Smoke test menggunakan Cloudflare Browser Rendering (13 November 2026):
  - `GET https://otp.seiton.biz.id/health` → HTTP 200, `{"ok":true,"service":"otp-portal","status":"ready"}`.
  - `GET https://otp.seiton.biz.id/` → HTTP 200, judul Portal OTP Privat, `noindex,nofollow`, `Cache-Control: no-store, private`, `X-Frame-Options: DENY`, dan halaman meminta tautan akses privat.
  - `GET https://admin.seiton.biz.id/otp/` tanpa sesi → redirect ke halaman login; UI provision mailbox tidak terlihat.
  - `GET https://admin.seiton.biz.id/api/admin/otp/mailboxes` tanpa sesi → HTTP 401.
  - `GET https://otp.seiton.biz.id/internal/mailboxes` tanpa secret → HTTP 401 Unauthorized.
- CI GitHub Actions terakhir pada commit `c39da47ba471a01c79ac1852657317e854f02308` sukses penuh: tes Worker OTP, build website utama/demo, static output, performance budget, aset demo, consent GTM, customer journey/responsive, Axe WCAG, dan Lighthouse mobile. Run: `43467441035`; site integrity: `43467440866`.
- Preview Pages main dan demo pada commit tersebut sukses di `b7f79ae3.seiton-main-preview.pages.dev` dan `63450ee5.seiton-demo-preview.pages.dev`. Project produksi `seiton-biz-id` tetap mempertahankan deployment production branch `main`; perubahan Worker admin/OTP tidak mempromosikan website `rebuild` ke `main`.
- Pengiriman email nyata belum diuji karena Email Routing zone masih disabled/unconfigured dan belum ada verified destination address. Jangan menyatakan portal siap menerima email produksi atau membuka penjualan sampai uji email yang sah selesai.

### Transparansi harga Fase 1 pada staging

- Halaman daftar layanan production memuat kedua detail layanan AI Gateway dan Portal OTP.
- D1 harga sumber tetap memuat Rp150.000 dan Rp100.000, tetapi status layanan masih `available=false` agar pemesanan online belum dibuka.
- Pada branch `rebuild`, halaman `/harga/` sekarang menampilkan "Harga acuan" untuk dua layanan tersebut bersamaan dengan status "Belum tersedia sementara — pemesanan belum dibuka." CTA order tidak dirender untuk item nonaktif.
- CORS API harga admin hanya menambahkan origin staging yang tepat `https://rebuild.seiton-main-preview.pages.dev` agar harga bisa diuji pada preview. Origin production `seiton.biz.id` dan `www.seiton.biz.id` tetap diizinkan.
- Verifikasi Browser Rendering staging: halaman `/harga/` menampilkan kedua nominal dari API dan status order closed. Perubahan ini masih berada di branch `rebuild`; belum dipromosikan ke `main`.

## 5. Harga dan penempatan kanal

1. **Muse Starter — Rp25.000:** hanya melalui bot Telegram, bukan halaman website atau GBP. Kredensial hanya boleh dimasukkan apabila akun dan hak pemindahtangannya memang dimiliki/diotorisasi Seiton.id.
2. **Setup AI Gateway & Bot Asisten 24/7 — Rp150.000:** layanan setup. Stack 9Router, Bridge, dan Hermes baru dipasang setelah pemeriksaan kompatibilitas dan akses. Biaya API/model/server pihak ketiga harus dijelaskan; VM Muse tidak menjadi prasyarat Fase 1.
3. **Setup Portal OTP & Email Custom Domain — Rp100.000:** jasa konfigurasi untuk domain yang dimiliki/diotorisasi pelanggan; mailbox diverifikasi dan diaktifkan satu per satu sebelum routing diperluas.

## 6. Google Business Profile

Materi draft berada di `docs/GOOGLE-BUSINESS-PROFILE-UPDATE.md`. Tidak ada perubahan GBP yang dilakukan dari sesi implementasi ini. Publikasi hanya boleh dilakukan setelah kelayakan usaha, lokasi/service-area, kategori, dan kemampuan nyata menyediakan kedua layanan diperiksa. Jangan memasang harga promosi, token, password, tautan portal privat, atau klaim penjualan akun pada deskripsi publik.

## 7. Checklist aktivasi dan penerimaan

### Infrastruktur dan portal
- [ ] Deploy Worker OTP dengan Durable Object `MailboxIndex`, KV, allowlist, dan internal secret.
- [ ] Uji `/health`, halaman publik, akses anonim, tautan tidak valid, sesi valid, logout, rotate, dan revoke.
- [ ] Pastikan link legacy dari bot dapat ditukar menjadi sesi HttpOnly tanpa mengungkap token di URL setelah pertukaran.
- [ ] Uji parser MIME untuk subject encoded, plain text, HTML fallback, quoted-printable/base64, dan attachment (lampiran tidak disimpan).
- [ ] Uji batas lima pesan dan TTL satu jam.

### Email Routing
- [ ] Petakan dahulu semua alamat domain yang saat ini harus tetap menerima email.
- [ ] Pastikan record MX dan routing aktif tanpa mengubah alamat existing secara tidak sengaja.
- [ ] Provision satu mailbox uji milik Seiton.id.
- [ ] Buat aturan spesifik ke Worker untuk mailbox uji; kirim email dari Gmail dengan subjek `Kode Verifikasi: 849201`.
- [ ] Pastikan email tampil dalam lima detik, kandidat `849201` diekstrak, dan email kedaluwarsa setelah satu jam.
- [ ] Baru setelah aturan spesifik berhasil dan fallback dipahami, putuskan apakah catch-all aman diaktifkan.

### Bot Telegram dan stok
- [ ] Uji keamanan admin: akun Telegram non-admin tidak dapat menjalankan perintah admin.
- [ ] Masukkan hanya stok uji yang sah/diotorisasi; uji `/addstock`, `/cekstok`, dan `/delstock`.
- [ ] Uji order Starter sampai pembayaran dikonfirmasi; pastikan email, password, dan link portal terkirim di bawah 10 detik setelah fulfillment siap.
- [ ] Pastikan stok berkurang tepat satu kali dan klaim ulang tidak membocorkan/mengirim akun lain.
- [ ] Uji `/cekorder`, order stok habis, antrean prioritas, penambahan stok, serta `/approve`.
- [ ] Uji paket Bisnis dan `SETUP | ...`; pastikan data sampai ke `ADMIN_CHAT_ID` dan token bot tersimpan terenkripsi.
- [ ] Setelah pengujian email berhasil, baru ubah `OTP_EMAIL_ROUTING_READY` menjadi `true`.

### Website dan GBP
- [ ] Verifikasi dua layanan pada preview website dan detail page, harga, CTA, sitemap, dan tampilan mobile.
- [ ] Pastikan produk Muse Starter tidak tampil terbuka di website/GBP.
- [ ] Tinjau draft GBP berdasarkan kelayakan usaha dan kebijakan Google sebelum publikasi.

## 8. Batas rilis

Worker portal dan panel pemilik sudah ter-deploy, tetapi Email Routing zone masih `unconfigured`/`enabled=false`; catch-all masih `disabled` dengan aksi `drop`. Record MX, SPF, dan DKIM Cloudflare terlihat pada DNS. Karena itu portal belum menerima email masuk melalui routing dan penjualan digital masih terkunci oleh `OTP_EMAIL_ROUTING_READY=false`.

Jangan mengaktifkan catch-all atau membuka penjualan produk digital hanya karena Worker berhasil deploy. Keduanya menunggu tes email nyata, validasi keamanan admin, dan uji transaksi end-to-end. Fase 2 (VM Muse dan `ACTIVE_TUNNEL_URL`) tetap nonaktif hingga direncanakan terpisah.
