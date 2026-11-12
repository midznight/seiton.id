# Seiton.id — Asset Guide

Dokumen ini menjadi panduan aset visual website utama dan pusat demonstrasi. Folder upload foto dummy dari Google Flow sudah disiapkan di:

`public/assets/dummy-products/`

**Branch kerja:** `rebuild`  
**Jangan upload langsung ke `main` atau mengubah domain production untuk pekerjaan ini.**

## 1. Kondisi aset demo saat ini

Dataset demo menggunakan usaha fiktif **Kedai Roti & Teh Contoh** dan memiliki 15 SKU. Pembaruan 12 November 2026: seluruh 15 SKU telah memiliki foto di folder `public/assets/dummy-products/`. Ekstensi file mengikuti hasil ekspor aktual Google Flow: empat file roti berformat WebP, satu file roti dan seluruh minuman/pastry/paket berformat JPG. Seluruh 15 foto kini dipetakan ke `src/data/demo-images.json`.

| SKU | Produk | Status saat ini | Nama file Google Flow |
|---|---|---|---|
| RT-001 | Roti Sobek Cokelat | Foto tersedia dan dipetakan | `RT-001_roti-sobek-cokelat.webp` |
| RT-002 | Roti Keju Susu | Foto tersedia dan dipetakan | `RT-002_roti-keju-susu.webp` |
| RT-003 | Roti Srikaya | Foto tersedia dan dipetakan | `RT-003_roti-srikaya.webp` |
| RT-004 | Roti Pisang Cokelat | Foto tersedia dan dipetakan | `RT-004_roti-pisang-cokelat.webp` |
| RT-005 | Roti Abon | Foto tersedia dan dipetakan | `RT-005_roti-abon.jpg` |
| PS-001 | Croissant Butter | Foto tersedia dan dipetakan | `PS-001_croissant-butter.jpg` |
| PS-002 | Donat Gula | Foto tersedia dan dipetakan | `PS-002_donat-gula.jpg` |
| PS-003 | Donat Cokelat | Foto tersedia dan dipetakan | `PS-003_donat-cokelat.jpg` |
| PS-004 | Brownies Potong | Foto tersedia dan dipetakan | `PS-004_brownies-potong.jpg` |
| PS-005 | Pisang Bolen | Foto tersedia dan dipetakan | `PS-005_pisang-bolen.jpg` |
| MN-001 | Teh Original 250 ml | Foto tersedia dan dipetakan | `MN-001_teh-original-250ml.jpg` |
| MN-002 | Teh Lemon 250 ml | Foto tersedia dan dipetakan | `MN-002_teh-lemon-250ml.jpg` |
| MN-003 | Teh Susu 250 ml | Foto tersedia dan dipetakan | `MN-003_teh-susu-250ml.jpg` |
| MN-004 | Kopi Susu 250 ml | Foto tersedia dan dipetakan | `MN-004_kopi-susu-250ml.jpg` |
| PK-001 | Paket Roti & Teh | Foto tersedia dan dipetakan | `PK-001_paket-roti-teh.jpg` |

Semua 15 foto di folder upload saat ini digunakan langsung oleh katalog demo. Prompt masing-masing SKU tetap disimpan di bawah untuk dokumentasi dan regenerasi aset di kemudian hari.

## 2. Spesifikasi gambar yang disarankan

Gunakan spesifikasi yang sama untuk seluruh produk agar katalog terlihat sebagai satu sesi pemotretan:

- Komposisi persegi **1:1**.
- Resolusi target **1024 × 1024 piksel** atau lebih tinggi.
- Foto produk realistis, bukan ilustrasi, render 3D, atau gambar kartun.
- Satu jenis produk sebagai fokus utama; jangan membuat kolase beberapa produk.
- Latar krem hangat, alas kayu atau batu berwarna netral, cahaya alami lembut dari kiri atas.
- Produk terlihat jelas, tekstur makanan alami, warna tidak terlalu jenuh.
- Tanpa tulisan, logo, label merek, harga, watermark, bingkai, atau elemen UI.
- Simpan sebagai PNG bila tersedia. JPG/JPEG juga dapat digunakan; pertahankan ekstensi sesuai format file yang sebenarnya.
- Target ukuran file sekitar 0,3–1,5 MB per foto setelah optimasi, tanpa membuat teksturnya pecah.

**Penting:** seluruh produk dan nama usaha pada halaman demo adalah data fiktif. Foto yang dibuat harus diperlakukan sebagai ilustrasi produk contoh, bukan bukti produk atau foto usaha klien nyata.

## 3. Master style prompt Google Flow

Gunakan master prompt ini bersama salah satu prompt produk pada bagian berikutnya. Jika Google Flow hanya menyediakan satu kolom prompt, gabungkan master prompt dan prompt produk dalam satu instruksi.

```text
Create a photorealistic commercial food product photograph for a fictional Indonesian neighborhood bakery and tea shop.

Visual direction: warm, inviting, clean editorial food photography. Use a consistent warm ivory or light cream background, a subtle natural wood or neutral stone surface, soft diffused window light coming from the upper left, gentle realistic shadows, natural appetizing colors, crisp food texture, and a premium but approachable small-business catalog aesthetic.

Composition: square 1:1 image, 1024 x 1024 pixels or higher, one clear hero product centered with comfortable negative space around it, photographed at a natural 45-degree three-quarter angle unless the product prompt specifies otherwise. Keep the product fully inside the frame. The food must look edible, freshly prepared, and physically realistic.

Keep the same lighting direction, background tone, camera distance, styling restraint, and overall color treatment across the entire product photo collection. Use only minimal neutral props when they help identify the product. The product itself must remain the visual focus.

Do not add any text, letters, numbers, price tags, logos, brand names, labels, packaging graphics, watermark, QR code, interface elements, decorative frames, collage, multiple panels, hands, people, or unrelated products. Do not invent readable packaging. No illustration, no cartoon, no CGI, no plastic-looking food.
```

## 4. Prompt per produk

Salin **Master style prompt** lalu tambahkan satu prompt produk di bawah ini. Buat satu gambar terpisah untuk setiap SKU. Gunakan nama file pada tabel inventaris tanpa mengganti kode SKU.

### Roti

**RT-001 — Roti Sobek Cokelat**  
Nama file: `RT-001_roti-sobek-cokelat.webp`

```text
Hero subject: one freshly baked Indonesian pull-apart chocolate bread loaf (roti sobek cokelat). Show several soft connected bread sections with a naturally torn edge revealing rich chocolate filling inside. Golden-brown glossy top crust, very soft airy crumb, subtle melted chocolate, appetizing realistic detail. Place the loaf on a simple matte ceramic plate. No slices of other bread and no chocolate bar packaging.
```

**RT-002 — Roti Keju Susu**  
Nama file: `RT-002_roti-keju-susu.webp`

```text
Hero subject: one freshly baked Indonesian soft cheese-and-milk bread roll (roti keju susu). Show a plump golden soft bun with a delicate melted cheese topping and a small cut edge revealing a creamy cheese-and-milk filling. The bread should look fluffy and tender, with realistic cheese texture, not excessive cheese sauce. Place it on a simple matte ceramic plate.
```

**RT-003 — Roti Srikaya**  
Nama file: `RT-003_roti-srikaya.webp`

```text
Hero subject: one freshly baked soft Indonesian bread bun filled with pandan kaya custard (roti srikaya). Show the bun slightly opened or cut once so a smooth, rich golden-green pandan srikaya filling is clearly visible. Soft pillowy crumb, gently golden surface, subtle coconut-custard texture. Keep the filling natural and believable, not neon green. Place on a simple matte ceramic plate.
```

**RT-004 — Roti Pisang Cokelat**  
Nama file: `RT-004_roti-pisang-cokelat.webp`

```text
Hero subject: one golden Indonesian soft bread roll filled with banana and chocolate (roti pisang cokelat). Show one clean cut end revealing soft banana pieces and rich chocolate filling inside a fluffy bread crumb. Lightly glossy golden crust, realistic banana texture, chocolate visible but not overflowing. Place on a simple matte ceramic plate.
```

**RT-005 — Roti Abon**  
Nama file: `RT-005_roti-abon.jpg`

```text
Hero subject: one freshly baked Indonesian savory shredded-meat floss bun (roti abon). Show a soft oval bread roll with a generous but natural topping of fine toasted abon flakes, lightly brushed savory glaze, and a small visible cut edge showing the fluffy interior. Golden-brown bread, realistic dry floss strands, appetizing savory presentation. Avoid extra meat dishes or unrelated toppings.
```

### Pastry & Camilan

**PS-001 — Croissant Butter**  
Nama file: `PS-001_croissant-butter.jpg`

```text
Hero subject: one classic all-butter croissant, freshly baked. Show a curved crescent shape with distinct crisp laminated layers, flaky golden crust, delicate buttery sheen, and a few natural crumbs on the plate. The interior at one end may be slightly visible to communicate an airy honeycomb crumb. Place on a simple matte ceramic plate. No filling, chocolate, or toppings.
```

**PS-002 — Donat Gula**  
Nama file: `PS-002_donat-gula.jpg`

```text
Hero subject: one classic Indonesian soft ring donut coated lightly and evenly with fine white sugar. Clearly visible round center hole, soft golden fried dough, delicate sugar crystals, realistic fluffy texture. Place on a simple matte ceramic plate. No glaze, chocolate, sprinkles, filling, or additional donuts.
```

**PS-003 — Donat Cokelat**  
Nama file: `PS-003_donat-cokelat.jpg`

```text
Hero subject: one soft ring donut with a smooth rich chocolate glaze. Clearly visible round center hole, golden soft fried dough, glossy dark cocoa topping with realistic highlights, a small amount of natural glaze settling near the edge. Place on a simple matte ceramic plate. No sprinkles, no sugar coating, no filling, and no additional donuts.
```

**PS-004 — Brownies Potong**  
Nama file: `PS-004_brownies-potong.jpg`

```text
Hero subject: one generous square cut of Indonesian-style fudgy chocolate brownie. Show a dense moist dark chocolate crumb, a delicate thin crackled top, and a clean cut side so the rich interior is visible. Place the single hero brownie piece on a simple matte ceramic plate, with only a few natural crumbs. No frosting, no colorful toppings, no nuts unless naturally subtle.
```

**PS-005 — Pisang Bolen**  
Nama file: `PS-005_pisang-bolen.jpg`

```text
Hero subject: one Indonesian banana bolen pastry (pisang bolen), a small rectangular baked puff pastry with golden flaky layers. Show one whole pastry and a single cut half beside it, revealing soft banana filling inside the layered pastry. Realistic crisp pastry flakes, warm golden surface, appetizing baked texture. Place on a simple matte ceramic plate. No unrelated pastries.
```

### Minuman

**MN-001 — Teh Original 250 ml**  
Nama file: `MN-001_teh-original-250ml.jpg`

```text
Hero subject: one clear unbranded 250 ml transparent PET bottle containing original Indonesian brewed black tea. Show a clean amber-brown tea color, subtle natural light passing through the liquid, a plain neutral screw cap, and simple condensation droplets kept minimal. The bottle must have no label, no logo, no printed text, and no branding. Upright centered product photograph with a few tea leaves placed subtly in the background.
```

**MN-002 — Teh Lemon 250 ml**  
Nama file: `MN-002_teh-lemon-250ml.jpg`

```text
Hero subject: one clear unbranded 250 ml transparent PET bottle containing Indonesian lemon tea. Show translucent golden-amber tea with a fresh natural lemon slice beside the bottle and a very subtle hint of lemon peel. Use a plain neutral screw cap and minimal condensation. The bottle must have no label, no logo, no printed text, and no branding. Keep the lemon as a supporting prop, not a second hero product.
```

**MN-003 — Teh Susu 250 ml**  
Nama file: `MN-003_teh-susu-250ml.jpg`

```text
Hero subject: one clear unbranded 250 ml transparent PET bottle containing Indonesian milk tea. Show a smooth light caramel-beige tea-and-milk color, natural creamy appearance, and a plain neutral screw cap. Keep the liquid opaque enough to read as milk tea but still realistic. The bottle must have no label, no logo, no printed text, and no branding. No straw and no café cup.
```

**MN-004 — Kopi Susu 250 ml**  
Nama file: `MN-004_kopi-susu-250ml.jpg`

```text
Hero subject: one clear unbranded 250 ml transparent PET bottle containing Indonesian iced milk coffee (kopi susu). Show a natural coffee-brown and creamy milk gradient inside the bottle, gently blending rather than forming artificial sharp stripes. Plain neutral screw cap, subtle condensation, realistic coffee color. The bottle must have no label, no logo, no printed text, and no branding. No coffee cup and no other beverage.
```

### Paket

**PK-001 — Paket Roti & Teh**  
Nama file: `PK-001_paket-roti-teh.jpg`

```text
Hero subject: one simple Indonesian bakery combo consisting of one freshly baked soft bread roll and one clear unbranded 250 ml bottle of original amber tea. Arrange both items together as a single product bundle on a neutral matte serving tray. The bread is the food component and the plain tea bottle is the drink component. Keep the bottle unlabelled, without any logo or text. Make the bundle composition clear and appetizing, with balanced negative space and the same warm cream background.
```

## 5. Cara upload ke GitHub

1. Buka repository `midznight/seiton.id`.
2. Pilih branch **`rebuild`**, bukan `main`.
3. Buka folder `public/assets/dummy-products/`.
4. Pilih **Add file → Upload files**.
5. Upload gambar dengan nama file yang persis sama seperti tabel SKU.
6. Commit perubahan langsung ke branch `rebuild` dengan pesan, misalnya: `Add Google Flow dummy product photos`.

Contoh struktur setelah foto diunggah:

```text
public/
└── assets/
    └── dummy-products/
        ├── RT-001_roti-sobek-cokelat.webp
        ├── RT-002_roti-keju-susu.webp
        ├── RT-003_roti-srikaya.webp
        ├── RT-004_roti-pisang-cokelat.webp
        ├── RT-005_roti-abon.jpg
        ├── PS-001_croissant-butter.jpg
        ├── PS-002_donat-gula.jpg
        ├── PS-003_donat-cokelat.jpg
        ├── PS-004_brownies-potong.jpg
        ├── PS-005_pisang-bolen.jpg
        ├── MN-001_teh-original-250ml.jpg
        ├── MN-002_teh-lemon-250ml.jpg
        ├── MN-003_teh-susu-250ml.jpg
        ├── MN-004_kopi-susu-250ml.jpg
        └── PK-001_paket-roti-teh.jpg
```

Jika ada foto pengganti di masa mendatang, pertahankan ekstensi sesuai format asli (JPG/JPEG/WebP/PNG). Path pada `src/data/demo-images.json` harus mengikuti nama dan ekstensi file yang sebenarnya.

## 6. Menghubungkan gambar ke katalog

Upload file saja belum otomatis mengganti placeholder. Setelah upload selesai, pemetaan SKU dilakukan di:

`src/data/demo-images.json`

Contoh satu entri:

```json
{
  "RT-003": {
    "src": "/assets/dummy-products/RT-003_roti-srikaya.webp",
    "alt": "Roti srikaya dengan isian pandan"
  }
}
```

Pemetaan mempertahankan relasi satu foto untuk satu SKU. Nama file dan ekstensi dipakai persis seperti yang tersimpan di GitHub; tidak ada penggantian ekstensi secara semu dan tidak diperlukan upload ulang.

## 7. Pemeriksaan aset

Di repository tersedia perintah:

```bash
npm run check:assets
```

Pemeriksaan ini memverifikasi bahwa setiap gambar yang sudah dipetakan benar-benar ada di dalam `public/`, menampilkan SKU yang sudah terhubung, dan menunjukkan SKU yang belum memiliki gambar. Foto yang belum dibuat tidak akan menggagalkan build website; tetapi path gambar yang sudah dipetakan namun file-nya tidak ada akan dianggap sebagai error.

## 8. Aset lain yang sudah digunakan

| File | Penggunaan |
|---|---|
| `public/assets/logo-horizontal-transparan.png` | Logo Seiton pada header/footer website utama |
| `public/logo-horizontal.png` | Logo pada halaman Ketentuan dan Privasi |
| `public/assets/roti-sobek-cokelat.webp` | Gambar produk RT-001 saat ini |
| `public/assets/roti-keju-susu.webp` | Gambar produk RT-002 saat ini |
| `public/assets/es-teh-manis.webp` | Gambar produk MN-001 saat ini |
| `public/assets/menu-demo-qr.svg` | QR contoh untuk demo Menu QR |

**Prinsip penggunaan:** aset foto produk baru harus konsisten, fiktif, tidak mengandung merek pihak lain, dan tidak boleh memberi kesan bahwa Kedai Roti & Teh Contoh adalah klien nyata Seiton.id.
