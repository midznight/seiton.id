# P2 Website Closeout — Seiton.id

Tanggal penutupan: 13 November 2026

## Ruang lingkup

P2 website mencakup website utama, katalog halaman layanan, harga berbasis API, halaman legal, consent Analytics, dan Pusat Demonstrasi. Perubahan backend bot Telegram, master data produk, harga, pesanan, dan transaksi tidak termasuk dalam penutupan ini; perubahan tersebut menunggu instruksi update berikutnya.

## Lima tahap penutupan

### 1. Google Analytics dan consent

- GTM: `GTM-K3LKMTF3`
- GA4: `G-9Z02GKBZQX`
- Tag GA4 menggunakan trigger `Initialization - All Pages`.
- CookieHub CMP tag telah dihapus dari container dan dipublikasikan; website hanya memakai consent controller milik Seiton.id.
- Consent default adalah `denied`; GTM baru dimuat sesudah pengunjung memilih Izinkan analitik.
- Tolak analitik menyimpan `denied` dan tidak memuat GTM.
- Google Tag Gateway zone-level dinonaktifkan (`enabled=false`, `setUpTag=false`).
- Pengujian browser production mengamati request GA4 `page_view` setelah consent granted; tidak ada request sebelum consent.
- Administrator properti mengonfirmasi retensi event/user GA4 telah diubah menjadi 14 bulan.
- Batas verifikasi: laporan GA4 Realtime/DebugView tidak dibaca langsung dari akun Google pada sesi ini.

### 2. Website utama production

- Cloudflare Pages project: `seiton-biz-id`
- Production branch: `main`
- Build: `npm run build:site`
- Output: `dist`
- Domain: `seiton.biz.id`, `www.seiton.biz.id`
- Harga tetap dibaca dari API resmi `https://admin.seiton.biz.id/api/pricing`; tidak ada harga cadangan yang dipasang.
- Sitemap source utama berisi 18 URL.
- Halaman legal dipertahankan; catatan retensi GA4 diselaraskan dengan konfigurasi 14 bulan.

### 3. Pusat Demonstrasi production

- Cloudflare Pages project: `seiton-demo`
- Production branch: `main`
- Build: `npm run build:demo`
- Output: `dist-demo`
- Domain: `demo.seiton.biz.id`
- CNAME Cloudflare: `demo.seiton.biz.id -> seiton-demo.pages.dev`
- Sepuluh rute demo diuji HTTP 200.
- Canonical demo memakai `https://demo.seiton.biz.id/`.
- Semua halaman demo memakai `noindex, nofollow` melalui meta dan header.
- Demo tidak memuat GTM, GA4, CookieHub, atau Microsoft UET.
- Semua data usaha, katalog, transaksi, dan laporan demo adalah fiktif serta hanya simulasi browser.
- Sitemap utama tidak disertakan pada output demo; robots.txt demo hanya mengizinkan crawler membaca metadata noindex tanpa merujuk sitemap domain utama.

### 4. Audit kualitas production

- Website utama: rute sitemap, title, H1, canonical, deskripsi, robots, menu mobile, dan API harga diperiksa.
- Harga API diverifikasi sebagai GET read-only.
- Consent production diuji pada alur awal, tolak, buka pengaturan, dan izinkan.
- Demo diuji pada sepuluh rute, canonical, noindex, aset, serta ketiadaan Analytics.
- GitHub Actions pada branch rebuild sebelumnya lulus untuk build kedua website, site integrity, customer journey, mobile accessibility, Lighthouse, dan consent.
- Cloudflare Pages production build adalah validasi akhir dari konfigurasi main dan demo.

### 5. Dokumentasi dan housekeeping

- README.md diperbarui dengan empat project Pages (dua production, dua preview).
- ANALYTICS.md diperbarui dengan hasil tes consent dan batas verifikasi Google account.
- Kebijakan Privasi diperbarui untuk mencerminkan retensi 14 bulan.
- PR #14 ditutup sebagai superseded oleh source Astro production.
- PR #15 ditutup sebagai baseline audit lama yang sudah tidak mewakili source build aktif.
- Build check menegakkan isolasi aset demo, noindex, consent, serta pemisahan sitemap/robots.

## Konfigurasi Pages

| Tujuan | Project | Branch | Build | Output |
|---|---|---|---|---|
| Website utama production | `seiton-biz-id` | `main` | `npm run build:site` | `dist` |
| Demo production | `seiton-demo` | `main` | `npm run build:demo` | `dist-demo` |
| Website utama preview | `seiton-main-preview` | `rebuild` | `npm run build:site` | `dist` |
| Demo preview | `seiton-demo-preview` | `rebuild` | `npm run build:demo` | `dist-demo` |

Kedua project preview tetap terisolasi: custom preview branch `rebuild`, production deployments dinonaktifkan, dan tidak ada domain production yang diarahkan ke preview.

## Di luar cakupan dan handoff

P2 website ditutup tanpa mengubah:
- Worker/bot Telegram production, webhook, database, pembayaran, ataupun pesanan.
- Master daftar produk/katalog milik Seiton.id.
- Harga layanan dan data transaksi pada API/D1.
- Integrasi WhatsApp resmi atau layanan pihak ketiga lainnya.

Perubahan bot Telegram dan produk website berikutnya harus dikerjakan sebagai update terpisah dengan preview, review diff, test, dan deployment tersendiri.
