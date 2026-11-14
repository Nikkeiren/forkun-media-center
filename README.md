# Forkun — Personal Media Center

Forkun adalah ruang pribadi berbasis web untuk mengimpor, melihat, dan mengelola foto serta video.

## Status saat ini

**MVP awal — penyimpanan lokal browser.** Antarmuka dan alur impor media sudah dibuat. Ini belum menjadi layanan cloud dan belum siap menyimpan media sensitif.

### Fitur yang tersedia
- Dashboard ringkasan jumlah foto, video, dan ukuran media.
- Impor beberapa foto/video dari perangkat.
- Penyimpanan media di IndexedDB browser.
- Perpustakaan dengan pencarian nama file dan filter tipe.
- Hapus media dari perpustakaan lokal.
- Layout responsif untuk layar ponsel dan desktop.
- App shell service worker dasar untuk penggunaan offline setelah pertama kali dimuat.

### Belum tersedia
- Akun pengguna dan sinkronisasi cloud.
- Supabase, Cloudflare R2, atau backend.
- Private Vault, enkripsi media, PIN, master password, biometrik, dan recovery key.
- Deteksi tautan TikTok, Instagram, dan X dengan penjelasan batas integrasi.
- Impor file media langsung dari URL publik jika server mengizinkan CORS dan responsnya benar-benar berupa foto/video.
- Album/koleksi yang dapat diedit.

**Penting:** IndexedDB adalah penyimpanan browser pada perangkat/origin ini, bukan backup. Browser dapat menerapkan kuota atau menghapus data situs. Jangan jadikan versi awal ini satu-satunya salinan file penting. Private Vault belum aktif dan jangan gunakan aplikasi ini untuk menyimpan media rahasia.

## Menjalankan proyek

Tidak ada proses build atau dependensi npm untuk versi awal ini.

1. Deploy repository ke layanan hosting statis yang mendukung HTTPS, atau jalankan server lokal.
2. Buka URL aplikasi melalui browser modern.
3. Pilih **Impor media** untuk menambahkan foto/video.
4. Buka **Perpustakaan** untuk mencari, memfilter, atau menghapus file.

Untuk pengembangan lokal, jalankan server HTTP statis dari folder proyek. Jangan hanya membuka `index.html` sebagai file lokal karena modul JavaScript dan service worker memerlukan origin yang sesuai.

## Struktur proyek

```
.
├── index.html
├── manifest.webmanifest
├── service-worker.js
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js
        └── storage.js
```

## Prinsip keamanan

- Jangan menyimpan kredensial, token, atau secret di frontend.
- Jangan mengklaim media terlindungi sebelum enkripsi dan pengelolaan kunci benar-benar diterapkan serta diuji.
- Kriptografi nantinya harus menggunakan Web Crypto API dan algoritma standar yang telah ditinjau; jangan membuat algoritma enkripsi sendiri.
- Integrasi impor dari layanan lain harus memakai API/metode resmi dan menghormati izin pemilik konten serta ketentuan platform.
- Sebelum mengaktifkan cloud, wajib merancang autentikasi, aturan akses database/storage, backup, penghapusan data, dan pemulihan akun.

## Rencana pengembangan

1. Memperkuat pengalaman perpustakaan lokal: metadata, preview, validasi file, dan penanganan kuota.
2. Meneliti integrasi resmi/berizin untuk platform sosial; deteksi tautan saja tidak berarti media bisa diunduh.
3. Merancang model akun dan backend cloud, termasuk kebijakan akses.
4. Mengimplementasikan sinkronisasi cloud dan backup.
5. Mendesain Private Vault dengan enkripsi sisi klien, master password, Recovery Key, dan biometrik yang didukung perangkat.
6. Melakukan audit dan pengujian keamanan sebelum Vault menerima file sungguhan.

## Lisensi

Belum ditentukan.
