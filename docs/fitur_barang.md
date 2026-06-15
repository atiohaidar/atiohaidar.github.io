# Dokumentasi Fitur Manajemen Barang (Inventory)

## Deskripsi Umum
Fitur Manajemen Barang memungkinkan pelacakan inventaris aset atau barang yang dapat dipinjam antar pengguna. Sistem ini mendukung konsep *Community Inventory* di mana pengguna juga bisa berkontribusi barang miliknya.

## Komponen Utama
- **Halaman**: `frontend/pages/DashboardItemsPage.tsx`
- **Service API**: `frontend/lib/api/services.ts` (`itemService`)
- **Tipe Data**: `Item` (id, name, description, stock, attachment_link, owner_username)

## Fitur Fungsional

### 1. Daftar Inventaris
Menampilkan semua barang dalam format grid kartu. Informasi yang ditampilkan meliputi:
- **Nama & Deskripsi**: Detail barang.
- **Stok**: Jumlah ketersediaan saat ini.
- **Link Lampiran**: Tautan ke manual atau dokumen terkait (eksternal).
- **Pemilik**: Username pemilik barang (untuk transparansi kepemilikan).

### 2. Manajemen Barang (CRUD)
- **Tambah Barang**: Formulir modal untuk mendaftarkan barang baru dengan validasi input (stok min. 1).
- **Edit & Hapus**: 
  - Logika Izin (`canModifyItem`): Tombol Edit/Hapus hanya muncul jika pengguna adalah **Admin** ATAU **Pemilik Barang** tersebut.
  - Dialog konfirmasi sebelum penghapusan.

### 3. Navigasi Peminjaman
Terdapat tombol cepat "Lihat Peminjaman" yang mengarahkan ke halaman `/dashboard/item-borrowings` untuk mengelola transaksi peminjaman barang tersebut.

## Implementasi Teknis

### Manajemen State Lokal
- `items`: Menyimpan array data barang.
- `showAddModal` / `showEditModal`: Mengontrol visibilitas modal form.
- `formData`: State tunggal untuk menangani input form baik untuk create maupun update.

### Penanganan Error
Menggunakan `alert()` standar browser untuk feedback cepat jika operasi gagal, namun memiliki state `error` untuk menampilkan pesan kesalahan pada pemuatan data awal di area konten utama.

### Izin Partisipatif
Fitur unik di sini adalah desentralisasi kepemilikan, di mana pengguna selain admin juga diberikan hak untuk mengelola barang yang mereka unggah sendiri (`owner_username === currentUser.username`).
