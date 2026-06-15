# Dokumentasi Fitur Peminjaman Ruangan (Rooms & Bookings)

## Deskripsi Umum
Fitur ini memfasilitasi kebutuhan reservasi ruangan dalam organisasi. Sistem membagi fitur ini menjadi dua halaman utama: manajemen ruangan (inventaris) dan manajemen pemesanan (reservasi).

## Arsitektur & Komponen
- **Halaman Ruangan**: `frontend/pages/DashboardRoomsPage.tsx`
- **Halaman Pemesanan**: `frontend/pages/DashboardBookingsPage.tsx`
- **Komponen UI**:
  - `RoomList`: Menampilkan daftar ruangan yang tersedia.
  - `BookingList`: Menampilkan jadwal pemesanan.

## Fitur Fungsional

### 1. Manajemen Ruangan (Room Inventory)
- **Daftar Ruangan**: Menampilkan semua ruangan yang terdaftar di sistem.
- **Akses Admin**:
  - Judul halaman menyesuaikan ("Manajemen Ruangan" vs "Daftar Ruangan").
  - Tombol **"+ Tambah Ruangan"** hanya muncul untuk pengguna dengan role `admin`.
  - Admin memiliki kontrol penuh untuk menambah, mengedit, atau menghapus data ruangan.
- **Informasi Ruangan**: Mencakup nama ruangan, kapasitas, fasilitas, dan status ketersediaan.

### 2. Manajemen Pemesanan (Bookings)
- **Jadwal Booking**: Menampilkan daftar booking yang aktif, yang akan datang, maupun history masa lalu.
- **Booking Baru**: Tombol **"+ Booking Baru"** memungkinkan anggota untuk melakukan reservasi ruangan.
- **Status Booking**: Melacak status persetujuan (jika ada workflow approval) atau konfirmasi waktu penggunaan.

## Desain Antarmuka
Menggunakan `DASHBOARD_THEME` untuk konsistensi tampilan dengan tema aktif (Dark/Light Mode).
- **Header**: Terpisah jelas antara judul dan aksi utama.
- **Panel**: Konten utama dibungkus dalam panel dengan border dan background yang responsif terhadap tema.

## Alur Kerja
1. Pengguna melihat daftar ruangan di menu "Ruangan" untuk mengecek spesifikasi.
2. Pengguna berpindah ke menu "Pemesanan" untuk membuat reservasi baru.
3. Admin memantau penggunaan ruangan melalui kedua halaman tersebut.
