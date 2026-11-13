# Seiton.id — Website dan Pusat Demonstrasi

Repositori ini menyiapkan dua keluaran website statis dengan Astro:

- **Website utama**: profil Seiton.id, layanan, harga, contoh produk, pendiri, kontak, ketentuan, dan privasi.
- **Pusat demonstrasi**: katalog WhatsApp, menu QR, panduan persiapan Google Business Profile, website usaha fiktif, simulasi Sistem Bot UMKM, dan Paket Combo.

## Teknologi

- Astro dengan output statis.
- HTML, CSS, dan JavaScript ringan.
- Tidak ada database atau backend untuk website utama maupun demonstrasi.
- Tidak menggunakan framework UI tambahan.
- Dataset demonstrasi berada di `src/data/demo-dataset.json` dan bersifat fiktif.
- Kontak dan navigasi berada di `src/data/site.json`.
- Data layanan berada di `src/data/services.json`.

## Perintah build

Build dilakukan oleh GitHub Actions atau Cloudflare Pages pada mesin remote. Pengguna tidak perlu memasang Node.js atau menjalankan build di perangkat lokal.

```bash
npm install
npm run build:site
npm run build:demo
npm run check
npm run check:build
```

Hasil build:
- `npm run build:site` menghasilkan `dist/`.
- `npm run build:demo` menghasilkan `dist-demo/`.

## Target Cloudflare Pages

| Tujuan | Project | Branch | Build command | Output |
|---|---|---|---|---|
| Website utama production | `seiton-biz-id` | `main` | `npm run build:site` | `dist` |
| Pusat demonstrasi production | `seiton-demo` | `main` | `npm run build:demo` | `dist-demo` |
| Preview website utama | `seiton-main-preview` | `rebuild` | `npm run build:site` | `dist` |
| Preview demo | `seiton-demo-preview` | `rebuild` | `npm run build:demo` | `dist-demo` |

Domain production: `seiton.biz.id` dan `www.seiton.biz.id` untuk website utama; `demo.seiton.biz.id` untuk Pusat Demonstrasi. Project preview tetap terpisah dan tidak menerima custom domain production. Build production mengikuti branch `main`; preview mengikuti branch `rebuild` dan deployment production pada project preview dinonaktifkan.

## Harga dan layanan

Harga layanan lama tetap dimuat dari API harga resmi `https://admin.seiton.biz.id/api/pricing`. Halaman tidak menampilkan angka cadangan saat API gagal. Harga Sistem Bot UMKM dan Paket Combo tidak direka; calon pelanggan diarahkan meminta penawaran tertulis.

Bot Pesanan Telegram merupakan layanan terpisah dari Sistem Bot UMKM. Kanal, metode pembayaran, autentikasi panel, dan kebutuhan legal pihak ketiga ditetapkan setelah pemeriksaan kesiapan dan kesepakatan ruang lingkup.

## Privasi, legal, dan demonstrasi

- Halaman Ketentuan dan Privasi statis berada di `public/ketentuan/` dan `public/privasi/`; isi legal disalin dari sumber lama dan dipertahankan.
- Demonstrasi menggunakan usaha dan data fiktif. Tidak ada pesan atau transaksi nyata.
- Seluruh halaman di subdomain demo harus memakai metadata noindex.
- Contoh internal Seiton.id tidak boleh disebut sebagai proyek klien.
- Folder `workers/` merupakan proyek terpisah dan tidak termasuk build Astro.

## Pemeriksaan

GitHub Actions pada branch `rebuild` memvalidasi struktur sumber, layanan, kontak, dataset, sitemap, teks legal, sumber harga, dan keluaran statis kedua website.


## Preview Cloudflare Pages

Dua project preview terpisah disiapkan dengan Git integration dari repository yang sama. Keduanya hanya menerima branch `rebuild` untuk deployment preview dan menonaktifkan deployment production; tidak ada custom domain produksi yang dipasang.

| Project preview | Build command | Output | Branch preview |
|---|---|---|---|
| `seiton-main-preview` | `npm run build:site` | `dist` | `rebuild` |
| `seiton-demo-preview` | `npm run build:demo` | `dist-demo` | `rebuild` |

Project Pages produksi yang telah ada (`seiton-biz-id`) tidak diubah. Domain `seiton.biz.id` dan `demo.seiton.biz.id` belum dipindahkan atau ditautkan ke project preview.


## Fase 1 — ekspansi produk digital (draft katalog)

Dua halaman jasa baru disiapkan pada branch `feat/fase-1-digital-services`:
- Setup AI Gateway & Bot Asisten 24/7.
- Setup Portal OTP & Email Custom Domain.

Nama akun Muse Starter dan rincian penjualan akun mentah tidak dimasukkan ke katalog publik. Kedua layanan masih berstatus persiapan sampai backend, akses domain, keamanan, dan QA Fase 1 selesai. Worker bot production dan Email Routing belum diubah pada commit website ini.
