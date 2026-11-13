# Implementasi Fase 1 — Seiton.id

Tanggal peta: 13 November 2026  
Sumber kebutuhan: Dokumen Master Fase 1 yang diberikan pemilik.

## Ruang lingkup

Fase ini menambahkan dua layanan publik (AI Gateway dan Portal OTP), infrastruktur privat untuk mailbox OTP, serta rancangan integrasi dengan bot Telegram. Sistem produksi pesanan UMKM yang telah berjalan tetap dipisahkan.

## Peta kebutuhan dan status

| Kebutuhan Master | Implementasi | Status |
|---|---|---|
| Produk jasa AI tampil di website | Layanan setup-ai-gateway, rute detail otomatis, harga D1 Rp150.000 | Source disiapkan; menunggu build preview |
| Produk jasa Portal OTP tampil di website | Layanan setup-portal-otp, rute detail otomatis, harga D1 Rp100.000 | Source disiapkan; menunggu build preview |
| Dua namespace KV | OTP_KV dan MUSE_KV telah dibuat | Selesai |
| Portal OTP otp.seiton.biz.id | Worker terpisah dengan email handler, UI noindex, private mailbox dan token akses | Source disiapkan; belum dideploy |
| TTL pesan 1 jam dan lima pesan terakhir | KV expirationTtl 3600, Durable Object mailbox index dan alarm penghapusan | Source dan tes disiapkan |
| OTP otomatis | Ekstraksi kandidat numerik 4–8 digit dari subjek/teks; nilai tetap perlu dicocokkan manual oleh penerima | Source disiapkan |
| Private mailbox per pemilik | Domain allowlist, provisioning eksplisit, token acak, hash token, sesi HttpOnly Secure, revoke dan rotate | Source disiapkan |
| Email Routing catch-all | Zone Email Routing masih disabled/unconfigured; catch-all belum diaktifkan | Belum diaktifkan |
| Admin Telegram commands | Source seiton-order-bot tidak tersedia di repository. Worker aktif memakai D1/DO/R2 dan rahasia produksi | Blocked pada source worker |
| Hybrid stock claim Fase 1 → Fase 2 | Namespace MUSE_KV tersedia; binding dan kode claim belum ditambahkan ke Worker pesanan yang aktif | Belum terintegrasi |
| Form SETUP paket bisnis ke ADMIN_CHAT_ID | Belum diubah pada Worker Telegram aktif karena source produksi tidak tersedia | Belum terintegrasi |
| Google Business Profile | Copy layanan dan checklist kelayakan disiapkan | Belum dipublikasikan |
| Multi-domain .biz.id | Saat ini hanya zone seiton.biz.id yang terhubung ke akun Cloudflare ini | Menunggu verifikasi tiap domain lain |

## Perubahan katalog publik

Dua layanan yang ditambahkan:

1. **Setup AI Gateway & Bot Asisten 24/7 — Rp150.000**  
   Biaya pada website adalah harga acuan jasa setup, bukan harga akun AI atau pemakaian API. Pelanggan menggunakan akun/lisensi provider miliknya sendiri. Tidak ada akun pihak ketiga, password, lisensi yang dialihkan, atau stok akun mentah yang dijual.

2. **Setup Portal OTP & Email Custom Domain — Rp100.000**  
   Biaya pada website adalah harga acuan jasa konfigurasi. Portal dibuat privat untuk pemilik mailbox yang telah diprovisikan. Akses tidak boleh diberikan hanya berdasarkan alamat email.

Kedua layanan masuk ke src/data/services.json, sitemap dan D1 seiton-site-content-prod. Halaman detail dihasilkan otomatis dari slug data layanan.

## Rancangan keamanan Portal OTP

- Hanya domain yang ditetapkan melalui OTP_ALLOWED_DOMAINS yang diterima.
- Setiap mailbox harus diprovisikan setelah pemeriksaan kepemilikan/pengelolaan domain.
- Identitas mailbox menggunakan hash alamat; email tidak dijadikan password.
- Akses pertama memakai token acak 256-bit yang dikirim hanya saat provisioning. Worker hanya menyimpan hash token.
- Browser menukar token fragment menjadi cookie __Host-otp_session dengan atribut HttpOnly, Secure, SameSite=Strict dan masa 30 menit.
- Email disimpan dalam OTP_KV maksimal satu jam dan index Durable Object membatasi lima pesan terbaru.
- Hanya teks email yang disimpan; lampiran tidak disimpan. Preview teks dibatasi 1.600 karakter.
- Ekstraksi 4–8 digit menghasilkan kandidat OTP, bukan validasi keaslian kode. Penerima tetap harus memeriksa konteks pengirim dan layanan asal.
- Pemilik dapat mencabut mailbox atau mengganti tautan akses; sesi lama ikut dihapus.
- Tidak ada endpoint publik untuk membaca mailbox hanya dengan parameter alamat email.

## Batas routing email

Cloudflare Email Routing untuk seiton.biz.id masih berstatus disabled/unconfigured. DNS saat pemeriksaan sudah memiliki record MX, SPF, dan DKIM Cloudflare, tetapi catch-all belum aktif dan belum ada destination address yang terverifikasi.

Sebelum catch-all diaktifkan:
1. Pastikan semua alamat lama yang masih dipakai tidak kehilangan email sah.
2. Provision mailbox yang memang diperlukan.
3. Uji aturan alamat tertentu terlebih dahulu.
4. Hanya setelah penerimaan dan fallback dipastikan, ubah catch-all ke Worker.

Alamat yang tidak diprovisikan akan ditolak. Karena catch-all mencakup semua local-part, jangan mengaktifkannya sebelum memetakan alamat domain yang perlu tetap menerima email.

## Batas integrasi Telegram dan alasan

Worker seiton-order-bot aktif di Cloudflare, tetapi source lengkap tidak ditemukan dalam repository. Repository hanya memiliki dokumentasi dan migration multi-item cart. Binding produksinya mencakup D1, Durable Object, R2, dan secret Telegram. Mengunggah ulang Worker baru tanpa source lengkap berisiko mengganti handler yang saat ini melayani pesanan.

Oleh sebab itu, Fase 1 tidak mengubah webhook, command, atau logika order Telegram. MUSE_KV sudah dibuat untuk integrasi berikutnya, tetapi tidak dipasang ke Worker order yang aktif. Untuk melanjutkan command /cekstok, /addstock, /delstock, /cekorder, /approve, claimStock, dan SETUP | ..., source Worker aktif perlu dimasukkan ke repository atau diekspor dari pipeline deploy yang sebenarnya.

## Penanganan produk akun mentah

Master menyebut muse_starter sebagai akun mentah berisi email dan password. Implementasi ini tidak membuat mekanisme penjualan, penyimpanan, atau pengiriman kredensial tersebut. Keberadaan alamat email pada domain tidak membuktikan bahwa suatu akun/provider boleh dipindahtangankan. Produk publik diarahkan menjadi jasa setup pada akun/lisensi milik pelanggan. MUSE_KV tidak diisi password akun pihak ketiga.

## Google Business Profile

Materi yang disiapkan ada pada docs/GOOGLE-BUSINESS-PROFILE-UPDATE.md. Dua layanan boleh disajikan sebagai layanan nyata yang benar-benar dikerjakan, bukan sebagai akun atau produk virtual. Profil Google harus tetap mencerminkan identitas, lokasi, dan model pelayanan Seiton.id yang benar. Tidak ada edit GBP yang dilakukan dari sesi ini.

## Domain tambahan

Worker ini dibangun dengan domain allowlist. Penambahan domain pelanggan memerlukan pemeriksaan kepemilikan dan konfigurasi Email Routing/DNS yang sah untuk setiap zone. Zone lain tidak otomatis ditangani oleh Worker hanya karena domain berakhiran .biz.id.

## Tahap aktivasi berikutnya

1. Jalankan test Worker dan seluruh CI website.
2. Deploy Worker OTP terpisah, secret internal, binding OTP_KV/MUSE_KV dan DO.
3. Tambahkan domain otp.seiton.biz.id dan uji /health, akses anonim, sesi valid, dan revoke.
4. Integrasikan internal provisioning pada panel admin yang sudah login.
5. Aktifkan Email Routing melalui aturan spesifik untuk QA lebih dahulu; uji kirim dari Gmail.
6. Setelah QA dan audit routing, putuskan apakah catch-all aman diaktifkan.
7. Integrasikan Worker Telegram hanya setelah source produksi tersedia.
8. Publikasikan perubahan website setelah preview dan production build lulus.
