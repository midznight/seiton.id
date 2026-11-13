# Google Analytics 4 (GA4) dan Google Tag Manager

Status diperbarui: 13 November 2026  
Production: `https://seiton.biz.id`

## Identitas

- Google Tag Manager: `GTM-K3LKMTF3`
- GA4 Measurement ID: `G-9Z02GKBZQX`

## Implementasi production

- Website utama dan halaman legal memakai controller consent pihak pertama `/analytics-consent.js`.
- Kondisi awal seluruh consent Analytics dan advertising adalah `denied`.
- GTM hanya dimuat setelah pengunjung memilih **Izinkan analitik**.
- **Tolak analitik** menyimpan status denied dan tidak memuat GTM.
- Pengunjung dapat membuka kembali atau mengubah pilihan melalui **Pengaturan privasi** di footer.
- Keputusan disimpan pada localStorage dengan key `seiton-analytics-consent-v1`.
- Consent advertising tetap denied meskipun pengunjung mengizinkan Analytics.
- GTM hanya aktif pada `seiton.biz.id` dan `www.seiton.biz.id` pada build production.
- Preview dan Pusat Demonstrasi tidak memuat container GA4.
- Cloudflare Google Tag Gateway dinonaktifkan di zone `seiton.biz.id`; `setUpTag=false`. Ini mencegah injeksi first-party GTM sebelum controller consent website berjalan.

Pola ini adalah Basic Consent Mode / explicit opt-in: Google tags diblokir sampai pengunjung memberikan izin.

## Isi container setelah pembersihan

Daftar tag yang diperiksa di GTM:
- **Google Analytics G-9Z02GKBZQX**, trigger `Initialization - All Pages`.
- **CookieHub CMP Tag** telah dihapus dan perubahan dipublikasikan.
- GTM Workspace menunjukkan `Workspace Changes: 0` pada screenshot setelah publikasi.

CookieHub dihapus karena website sudah memiliki consent controller sendiri. Microsoft UET tidak lagi terdeteksi pada pengujian production setelah pembersihan.

## Pengujian production

Pengujian browser pada 13 November 2026 menghasilkan:
1. Kunjungan awal: banner consent Seiton.id terlihat; tidak ada request GTM/GA4, CookieHub, atau UET.
2. Memilih Tolak analitik: pilihan `denied` tersimpan; tidak ada request Google.
3. Membuka Pengaturan privasi: banner dapat dibuka kembali.
4. Memilih Izinkan analitik: loader GTM dimasukkan, lalu request GA4 dengan `tid=G-9Z02GKBZQX` dan event `en=page_view` terlihat.
5. Setelah publikasi CookieHub dihapus: tidak ada dialog CookieHub atau resource Microsoft UET pada sesi pengujian.
6. Halaman `/harga/`, `/privasi/`, dan `/ketentuan/` merespons HTTP 200 pada pengujian consent.

Bukti request `page_view` menunjukkan browser berhasil mengirim event ke endpoint GA4. Hal ini belum sama dengan verifikasi tampilan laporan **Realtime** atau **DebugView** di antarmuka akun Google Analytics.

## Retensi data GA4

Administrator properti telah mengubah Data Retention menjadi **14 bulan**. Pengaturan event-level dan user-level perlu dipertahankan pada nilai tersebut. Retensi event/user tidak sama dengan ketersediaan laporan agregat standar GA4.

## Batasan verifikasi akun

Repository dan koneksi Cloudflare/GitHub tidak memiliki akses ke Admin GA4 atau laporan Realtime. Karena itu:
- Kepemilikan dan role admin properti Google belum diverifikasi secara langsung dari konektor.
- Nilai retensi 14 bulan didasarkan pada konfirmasi administrator properti.
- Request GA4 `page_view` sudah diamati di browser, tetapi angka Realtime/DebugView perlu dilihat langsung pada properti Google.

## Prinsip keselamatan

- Jangan memuat GTM di preview, build lokal, atau demo.
- Jangan mengaktifkan kembali Cloudflare Google Tag Gateway selama consent controller website menjadi satu-satunya pengelola izin.
- Jangan menambahkan CMP kedua tanpa evaluasi desain consent.
- Jika menambah tag iklan atau marketing baru, periksa consent category, trigger, vendor, tujuan pemrosesan, dan disclosure privasi terlebih dahulu.
