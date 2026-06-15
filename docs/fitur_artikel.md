# Dokumentasi Fitur Artikel

## Deskripsi Umum
Fitur Artikel memungkinkan pengguna untuk melihat daftar artikel yang dipublikasikan dan membaca konten lengkap artikel tersebut dengan format Markdown yang kaya. Fitur ini dirancang sebagai blog pribadi atau catatan perjalanan.

## Arsitektur & Komponen

### Halaman Utama (`frontend/pages/ArticlesPage.tsx`)
Halaman ini memiliki dua mode tampilan utama:
1. **Daftar Artikel (Grid View)**: Menampilkan kartu-kartu artikel dengan judul, tanggal, dan cuplikan konten.
2. **Detail Artikel (Detail View)**: Menampilkan isi lengkap artikel saat pengguna memilih salah satu kartu.

### Integrasi Backend
Data artikel diambil dari backend menggunakan fungsi-fungsi helper dari `apiService`:
- `listArticles({ page, published })`: Mengambil daftar metadata artikel yang sudah dipublikasikan.
- `getArticle(slug)`: Mengambil konten lengkap artikel berdasarkan slug uniknya.

## Detail Implementasi Teknis

### Rendering Markdown
Konten artikel disimpan dalam format Markdown dan dirender menggunakan `react-markdown`.
- **Plugin**:
  - `remark-gfm`: Mendukung format GitHub Flavored Markdown (tabel, strikethrough, dll).
  - `rehype-raw`: Mengizinkan rendering HTML mentah jika diperlukan.
- **Kustomisasi Komponen**:
  - Tautan (`a`) dirender dengan warna biru dan efek hover.
  - Blok Kode (`code`) memiliki gaya khusus dengan font monospace dan latar belakang yang kontras.

### Logika Ekstrak (Excerpt)
Fungsi `buildArticleExcerpt` digunakan untuk membuat cuplikan teks di halaman daftar secara otomatis:
- Membersihkan baris baru.
- Mengambil maksimal 3 blok paragraf atau 400 karakter.
- Menambahkan tanda "..." jika konten dipotong.

### Penanganan State dan Efek
- **Loading State**: Menampilkan indikator loading kustom saat mengambil data awal atau detail artikel.
- **Error Handling**: Menampilkan pesan kesalahan dalam kartu jika terjadi kegagalan jaringan atau API.
- **Scroll Management**: Otomatis menggulir ke atas saat membuka detail artikel.

### Elemen Visual dan Interaksi
- **Parallax**: Latar belakang memiliki ornamen bulat yang bergerak sesuai posisi scroll menggunakan hook `useMultiParallax`.
- **ScrollReveal**: Komponen pembungkus untuk memberikan efek animasi muncul saat elemen masuk ke viewport.
- **Desain Kartu**: Menggunakan gaya "glass" (transparan/blur) dengan rotasi acak kecil (ganjil/genap) untuk memberikan kesan organik seperti tumpukan kertas.

## Manajemen Akses
Meskipun halaman ini bersifat publik, terdapat logika `getAuthToken` untuk mendeteksi apakah pengguna yang melihat adalah admin/user terdaftar, yang kemudian menampilkan tombol "Kelola Artikel" untuk akses ke dashboard editorial.
