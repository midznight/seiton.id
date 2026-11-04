# Admin Internal Seiton.id

Cloudflare Worker untuk mengelola harga layanan dan add-on pada halaman Harga website utama.

## Domain

- Panel pemilik: https://admin.seiton.biz.id/
- API harga read-only: https://admin.seiton.biz.id/api/pricing
- Dashboard katalog/pesanan UMKM: https://umkm.seiton.biz.id/
- Worker transaksi/bot: `seiton-order-bot` (domain bot `automate-bot.seiton.biz.id` tetap terpisah)

## Routes

| Route | Fungsi | Akses |
| --- | --- | --- |
| `GET /` | UI panel internal | Publik, halaman noindex; edit tetap memerlukan login |
| `GET /api/session` | Status sesi login | Cookie sesi |
| `POST /api/login` | Login pemilik | Didelegasikan ke `seiton-order-bot` |
| `POST /api/logout` | Logout | Cookie sesi |
| `GET /api/pricing` | Data harga layanan & add-on | Read-only, CORS website Seiton |
| `GET /api/admin/pricing` | Membaca data harga | Sesi admin |
| `PUT /api/admin/pricing` | Menambah, mengedit, menghapus, dan menyusun harga | Sesi admin |

## Cloudflare bindings

- D1 `SITE_DB`: `seiton-site-content-prod`.
- Service binding `ORDER_BACKEND`: Worker `seiton-order-bot`; panel memakai password admin existing dan token backend bertanda tangan sebagai sesi. Tidak ada password kedua yang disimpan di Worker ini.

## Database

Jalankan `migrations/0001_initial.sql` pada D1 baru untuk membuat tabel dan seed harga awal. Database production sudah dibuat dengan migration yang sama dan seed awal sudah diverifikasi.

## Batas produk UMKM saat ini

Panel UMKM yang aktif sekarang merupakan dashboard single-store yang memakai database transaksi `seiton-transactions-prod` dan integrasi bot Telegram yang sudah ada. Fitur yang tersedia: katalog/foto/harga/stok, pesanan, verifikasi pembayaran, dashboard penjualan, serta ekspor laporan CSV.

Panel tersebut belum multi-tenant self-service. Sebelum menjual akses ke beberapa UMKM secara bersamaan, setiap pelanggan perlu diprovisikan dengan database/Worker terisolasi atau backend perlu dimigrasikan ke skema tenant_id dan otorisasi per tenant. Jangan membagikan satu login admin/DB yang sama kepada beberapa toko.
