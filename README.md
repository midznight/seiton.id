# Seiton.id

Situs profil statis untuk layanan penataan informasi digital usaha lokal.

## Struktur
- `index.html`: beranda
- `layanan/`: daftar layanan dan enam halaman detail
- `portofolio/`: ilustrasi konsep, bukan proyek klien
- `tentang/`, `kontak/`, `ketentuan/`, `privasi/`: informasi pendukung
- `site.css`: satu-satunya stylesheet
- `site.js`: satu-satunya JavaScript untuk menu dan tautan WhatsApp
- `sitemap.xml`, `robots.txt`: indeks mesin pencari
- `og-seiton.svg`: gambar Open Graph 1200 × 630
- `favicon.svg`, `favicon-32.png`, `favicon-180.png`, `favicon-192.png`: ikon situs

## Teknologi
HTML, CSS, dan JavaScript biasa. Tidak ada framework, database, proses build, atau backend. Poppins dimuat satu kali per halaman melalui Google Fonts.

## Pengaturan WhatsApp
Nomor WhatsApp hanya ditetapkan sekali sebagai konstanta `WHATSAPP_NUMBER` di `site.js`. Semua tautan konsultasi menggunakan kelas `.wa` dan atribut `data-message`.

## Konten yang perlu dikonfirmasi pendiri
- Jam layanan.
- Ketentuan uang muka 50%, dua kali revisi, waktu mulai dihitung setelah materi lengkap, akun atas nama klien, dan izin tertulis foto/data.
- Harga final per layanan.
- Detail contoh tetap fiktif sampai ada materi proyek nyata dengan izin publikasi.

## Hosting
Struktur ini ditujukan untuk hosting statis. Proyek sebelumnya memakai Cloudflare Pages [TERBUKTI dari konfigurasi proyek]. Batas unggah, batas jumlah berkas, dan batas ukuran aset paket akun yang digunakan belum diperiksa pada sesi ini [PERLU DIVERIFIKASI]. Tidak ada fungsi server atau proses build yang diperlukan.

## Pemeriksaan sebelum unggah
1. Pastikan seluruh halaman memakai `/site.css` dan `/site.js`.
2. Pastikan nomor WhatsApp benar pada satu konstanta di `site.js`.
3. Konfirmasi isi halaman Ketentuan dan jam layanan.
4. Uji tautan, tampilan 360 px, navigasi keyboard, dan tombol WhatsApp.
5. Pastikan sitemap dan metadata Open Graph terbaca setelah deploy.
