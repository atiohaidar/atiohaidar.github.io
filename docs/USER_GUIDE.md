# Panduan Pengguna

Panduan ini menjelaskan fitur-fitur yang tersedia pada aplikasi Atiohaidar Portfolio & Management. Aplikasi dapat diakses melalui **web browser** maupun **aplikasi mobile** (Android/iOS).

## Daftar Isi

- [Akses Aplikasi](#akses-aplikasi)
- [Registrasi dan Login](#registrasi-dan-login)
- [Dashboard](#dashboard)
- [Manajemen Tugas](#manajemen-tugas)
- [Artikel / Blog](#artikel--blog)
- [Chat](#chat)
- [Pemesanan Ruangan](#pemesanan-ruangan)
- [Formulir](#formulir)
- [Peminjaman Barang](#peminjaman-barang)
- [Forum Diskusi](#forum-diskusi)
- [Sistem Tiket](#sistem-tiket)
- [Event dan Kehadiran](#event-dan-kehadiran)
- [Keuangan](#keuangan)
- [Farming Game](#farming-game)
- [Pengaturan Tampilan](#pengaturan-tampilan)

---

## Akses Aplikasi

### Web

Buka alamat website di browser:

```
https://atiohaidar.github.io
```

Halaman utama menampilkan portfolio dan informasi publik. Untuk mengakses fitur manajemen, silakan login terlebih dahulu.

### Mobile

Aplikasi mobile tersedia untuk Android dan iOS melalui Expo. Setelah terinstal, buka aplikasi dan login untuk mengakses semua fitur.

---

## Registrasi dan Login

### Membuat Akun Baru

1. Buka halaman **Register** (melalui menu atau tautan di halaman login).
2. Isi formulir: username, nama, dan password.
3. Klik tombol **Register**.
4. Setelah berhasil, Anda akan diarahkan untuk login.

### Login

1. Buka halaman **Login**.
2. Masukkan username dan password.
3. Klik tombol **Login**.
4. Jika berhasil, Anda akan diarahkan ke **Dashboard**.

### Lupa Password

1. Pada halaman login, klik tautan **Forgot Password**.
2. Masukkan informasi yang diminta.
3. Ikuti instruksi untuk mereset password.

### Peran Pengguna

Ada dua peran dalam sistem:

| Peran | Kemampuan |
|-------|-----------|
| **Member** | Mengakses semua fitur standar (tugas, artikel, chat, booking, dll.) |
| **Admin** | Semua fitur member + manajemen pengguna, persetujuan booking, pengelolaan tiket |

---

## Dashboard

Setelah login, halaman **Dashboard** menampilkan ringkasan statistik:

- Jumlah pengguna terdaftar
- Jumlah tugas
- Jumlah artikel
- Jumlah ruangan dan booking

Dari dashboard, Anda dapat mengakses semua fitur melalui menu sidebar (di web) atau tab navigasi (di mobile).

---

## Manajemen Tugas

Fitur ini memungkinkan Anda membuat dan mengelola daftar tugas.

### Membuat Tugas

1. Buka menu **Tasks** dari dashboard.
2. Klik tombol untuk menambah tugas baru.
3. Isi nama tugas, deskripsi (opsional), dan tenggat waktu (opsional).
4. Simpan tugas.

### Mengelola Tugas

- **Menandai selesai**: Ubah status tugas menjadi selesai.
- **Mengedit**: Klik tugas untuk mengubah detailnya.
- **Menghapus**: Hapus tugas yang tidak diperlukan.

Setiap tugas memiliki field: nama, deskripsi, status selesai/belum, dan tenggat waktu.

---

## Artikel / Blog

### Membaca Artikel (Publik)

Artikel yang sudah dipublikasikan dapat dibaca oleh siapa saja tanpa login melalui halaman **Articles** di bagian publik website.

### Mengelola Artikel (Login Diperlukan)

1. Buka menu **Articles** di dashboard.
2. **Membuat artikel**: Klik tombol buat, isi judul dan konten.
3. **Draft & Publish**: Artikel bisa disimpan sebagai draft atau langsung dipublikasikan.
4. **Mengedit**: Klik artikel untuk mengedit judul atau konten.
5. **Menghapus**: Hapus artikel yang tidak diperlukan.

---

## Chat

Fitur chat memiliki tiga mode komunikasi:

### Chat Langsung (Private)

1. Buka menu **Chat** di dashboard.
2. Pilih pengguna yang ingin diajak berkomunikasi.
3. Ketik pesan dan kirim.
4. Pesan juga mendukung fitur balas (reply).

### Grup Chat

1. Buat grup baru dengan menentukan nama dan deskripsi.
2. Tambahkan anggota ke dalam grup.
3. Anggota grup memiliki peran: **admin** atau **member**.
4. Admin grup dapat mengubah nama, deskripsi, dan mengelola anggota.

### Chat Anonim

1. Buka fitur **Anonymous Chat**.
2. Kirim pesan tanpa menampilkan identitas Anda.
3. Semua pengguna yang bergabung dapat melihat pesan anonim.

---

## Pemesanan Ruangan

### Melihat Ruangan

1. Buka menu **Rooms** untuk melihat daftar ruangan beserta kapasitas dan deskripsinya.

### Membuat Booking

1. Pilih ruangan yang tersedia.
2. Tentukan waktu mulai dan waktu selesai.
3. Isi tujuan pemesanan.
4. Kirim permintaan booking.

### Status Booking

Setiap booking memiliki status:

| Status | Keterangan |
|--------|-----------|
| **Pending** | Menunggu persetujuan |
| **Approved** | Disetujui oleh admin |
| **Rejected** | Ditolak oleh admin |
| **Cancelled** | Dibatalkan oleh pemesan |

Admin dapat menyetujui atau menolak permintaan booking.

---

## Formulir

### Membuat Formulir

1. Buka menu **Forms** di dashboard.
2. Klik buat formulir baru.
3. Isi judul, deskripsi, dan tambahkan pertanyaan.
4. Simpan formulir — sistem akan menghasilkan **token** unik.

### Mengisi Formulir (Publik)

Formulir bisa diisi oleh siapa saja (tanpa login) melalui tautan token:

```
https://atiohaidar.github.io/form/{token}
```

### Melihat Respons

Pembuat formulir dapat melihat semua respons yang masuk melalui dashboard.

---

## Peminjaman Barang

### Melihat Barang

1. Buka menu **Items** untuk melihat daftar barang beserta stok yang tersedia.

### Meminjam Barang

1. Pilih barang yang ingin dipinjam.
2. Tentukan jumlah, tanggal mulai, dan tanggal selesai.
3. Kirim permintaan peminjaman.

### Status Peminjaman

| Status | Keterangan |
|--------|-----------|
| **Pending** | Menunggu persetujuan |
| **Approved** | Disetujui |
| **Rejected** | Ditolak |
| **Returned** | Barang sudah dikembalikan |
| **Damaged** | Barang rusak |
| **Extended** | Perpanjangan waktu peminjaman |

---

## Forum Diskusi

### Membuat Diskusi

1. Buka menu **Discussions**.
2. Klik buat diskusi baru.
3. Isi judul dan konten. Anda dapat memilih untuk memposting secara **anonim**.

### Membalas Diskusi

1. Buka diskusi yang ingin dibalas.
2. Tulis balasan. Anda juga bisa membalas secara anonim.

---

## Sistem Tiket

### Membuat Tiket (Publik)

Tiket dapat dibuat oleh siapa saja tanpa login:

1. Buka halaman pembuatan tiket publik.
2. Isi judul, deskripsi, kategori, prioritas, dan informasi kontak.
3. Kirim tiket — Anda akan mendapatkan **token** untuk melacak tiket.

Kategori tiket yang tersedia: Umum, Teknis, Keuangan, Fasilitas, dan Lainnya.

### Melacak Tiket

Gunakan token untuk mengecek status tiket dan menambahkan komentar melalui halaman publik.

### Mengelola Tiket (Admin)

Admin dapat:
- Melihat semua tiket.
- Mengubah status tiket: **Open**, **In Progress**, **Waiting**, **Solved**.
- Mengubah prioritas: **Low**, **Medium**, **High**, **Critical**.
- Menugaskan tiket ke pengguna tertentu.
- Menambahkan komentar (termasuk komentar internal).

---

## Event dan Kehadiran

### Melihat Event

Buka menu **Events** untuk melihat daftar event yang tersedia beserta tanggal, lokasi, dan deskripsinya.

### Registrasi Event

1. Pilih event yang ingin diikuti.
2. Klik tombol registrasi.
3. Anda akan terdaftar sebagai peserta.

### Scan Kehadiran

Pada hari acara, admin event dapat melakukan scan kehadiran menggunakan fitur QR code di aplikasi mobile. Scan kehadiran mencatat waktu dan lokasi GPS.

### Status Kehadiran

| Status | Keterangan |
|--------|-----------|
| **Registered** | Sudah terdaftar |
| **Present** | Hadir (sudah di-scan) |
| **Absent** | Tidak hadir |

---

## Keuangan

### Saldo

Setiap pengguna memiliki saldo yang dapat digunakan dalam sistem.

### Top-Up

Admin dapat melakukan top-up saldo untuk pengguna tertentu.

### Transfer

Pengguna dapat mentransfer saldo ke pengguna lain:

1. Buka fitur **Transfer**.
2. Pilih pengguna tujuan.
3. Masukkan jumlah transfer dan deskripsi (opsional).
4. Konfirmasi transfer.

### Riwayat Transaksi

Semua transaksi (top-up dan transfer) tercatat dan dapat dilihat melalui riwayat transaksi.

---

## Farming Game

Aplikasi ini memiliki mini-game simulasi pertanian yang dapat diakses setelah login.

### Bermain

- **Menanam**: Pilih bibit dari daftar tanaman yang tersedia dan tanam di petak lahan.
- **Menyiram**: Siram tanaman agar tumbuh lebih cepat.
- **Memanen**: Panen tanaman yang sudah matang untuk mendapatkan gold.
- **Toko**: Beli item dan bibit menggunakan gold atau gems.
- **Inventaris**: Kelola item yang dimiliki.
- **Perluas Lahan**: Tambah petak lahan baru (dimulai dengan 9 petak, maksimal 49 petak).
- **Rintangan**: Hapus rintangan di lahan dengan biaya tertentu.

### Fitur Lainnya

- **Quest Harian**: Selesaikan misi harian untuk mendapatkan hadiah gold dan gems.
- **Pencapaian**: Raih achievement dan klaim hadiah.
- **Leaderboard**: Bandingkan skor Anda dengan pemain lain.
- **Prestige**: Reset profil game untuk memulai dengan bonus tertentu.
- **Tukar Mata Uang**: Konversi saldo akun ke gems atau gold (dan sebaliknya).

---

## Pengaturan Tampilan

### Dark / Light Mode

Aplikasi mendukung dua tema:

- **Light Mode**: Tampilan terang (default).
- **Dark Mode**: Tampilan gelap untuk kenyamanan di malam hari.

Anda dapat beralih tema melalui tombol toggle tema yang tersedia di navigasi (web) atau pengaturan (mobile). Pilihan tema disimpan secara otomatis.
