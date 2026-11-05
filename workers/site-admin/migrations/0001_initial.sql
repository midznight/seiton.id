CREATE TABLE IF NOT EXISTS site_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK(price >= 0),
  available INTEGER NOT NULL DEFAULT 1 CHECK(available IN (0,1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
  description TEXT NOT NULL DEFAULT '',
  features_json TEXT NOT NULL DEFAULT '[]',
  message TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK(price >= 0),
  unit TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO site_services(id,name,price,available,featured,description,features_json,message,sort_order,updated_at) VALUES
('paket-website-telegram','Paket Website & Telegram',1107000,1,1,'Gabungan Website Katalog UMKM, Website Profile Usaha, dan Bot Pesanan Telegram. Harga paket sama dengan total harga satuan; domain tidak termasuk.','["Website Katalog UMKM — Rp259.000","Website Profile Usaha — Rp349.000","Bot Pesanan Telegram — Rp499.000"]','Halo Seiton, saya tertarik dengan Paket Website & Telegram.',1,CURRENT_TIMESTAMP),
('katalog','Website Katalog UMKM',259000,1,0,'Halaman katalog untuk menampilkan produk dan menerima pesanan.','["Sampai 20 produk","Tombol pesan ke WhatsApp","Revisi 2x"]','Halo Seiton, saya tertarik dengan Website Katalog UMKM.',2,CURRENT_TIMESTAMP),
('profile','Website Profile Usaha',349000,1,0,'Halaman informasi utama untuk memperkenalkan usahamu.','["Beranda","Tentang","Layanan","Kontak","Revisi 2x"]','Halo Seiton, saya tertarik dengan Website Profile Usaha.',3,CURRENT_TIMESTAMP),
('telegram','Bot Pesanan Telegram',499000,1,0,'Bot untuk merekap pesanan dan mengirimkannya otomatis ke penjual.','["Merekap pesanan","Mengirim pesanan otomatis ke penjual"]','Halo Seiton, saya tertarik dengan Bot Pesanan Telegram.',4,CURRENT_TIMESTAMP),
('whatsapp','Bot Pesanan WhatsApp',0,0,0,'Belum tersedia sementara. Integrasi WhatsApp Business API masih ditunda, sehingga Seiton belum menerima pesanan atau pembayaran untuk layanan ini.','[]','',5,CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO site_addons(id,name,price,unit,note,sort_order,updated_at) VALUES
('maintenance-telegram','Perawatan Bot Telegram (opsional)',99000,'per bulan','Layanan opsional untuk Bot Pesanan Telegram.',1,CURRENT_TIMESTAMP),
('domain-biz-id','Domain biz.id 1 tahun',49000,'tambahan di luar paket','Untuk nama domain biz.id yang tersedia.',2,CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO site_meta(key,value,updated_at) VALUES ('pricing_version','1',CURRENT_TIMESTAMP);