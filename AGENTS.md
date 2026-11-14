# Panduan agent untuk Seiton.id

## Pekerjaan UI/UX
- Sebelum merancang, meninjau, atau mengubah antarmuka, baca `.agents/skills/ui-ux-pro-max/SKILL.md`.
- Baca `design-system/seiton-id/MASTER.md` dan override halaman yang sedang disentuh.
- Untuk keputusan Astro, gunakan `.agents/skills/ui-ux-pro-max/data/stacks/astro.csv`; untuk audit umum, gunakan `.agents/skills/ui-ux-pro-max/references/quick-reference.md`.
- Gunakan mesin pencarian lokal skill dengan Python 3: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Seiton.id"`.
- Pertahankan Astro static-first, aksesibilitas keyboard, reflow mobile, kontras, dan dukungan `prefers-reduced-motion`.
- Jangan membuat testimoni, logo klien, angka performa, sertifikasi, harga, atau klaim transaksi yang tidak bersumber dari data proyek.
- Semua katalog dan tampilan demo harus tetap menyebut bahwa data contohnya fiktif.
- Harga layanan yang ditampilkan ke publik harus berasal dari API harga resmi; jangan menyalin angka harga API ke HTML/CSS.
- Jangan deploy ke produksi atau mengubah Worker, database, DNS, dan konfigurasi analitik untuk tugas visual tanpa instruksi eksplisit.
