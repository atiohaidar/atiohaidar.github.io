# Dokumentasi Fitur Manajemen Tiket (Ticketing)

## Deskripsi Umum
Fitur Manajemen Tiket adalah sistem pelaporan masalah atau permintaan dukungan. Fitur ini memungkinkan pengguna untuk melihat status tiket mereka dan memungkinkan administrator untuk memantau isu-isu yang masuk.

## Komponen Utama
- **Halaman**: `frontend/pages/DashboardTicketsPage.tsx`
- **Service API**: `frontend/lib/api/services.ts` (fungsi `listTickets`, `listTicketCategories`, `getTicketStats`)

## Fitur Fungsional

### 1. Statistik (Dashboard Mini)
Di bagian atas halaman, terdapat kartu ringkasan jumlah tiket berdasarkan status:
- **Total**: Keseluruhan tiket.
- **Terbuka (Open)**: Tiket baru yang belum diproses.
- **Dalam Proses (In Progress)**: Sedang ditangani.
- **Menunggu (Waiting)**: Menunggu respon pengguna/pihak ketiga.
- **Selesai (Solved)**: Masalah telah teratasi.

### 2. Pencarian & Filter Canggih
Pengguna dapat menyaring daftar tiket menggunakan:
- **Status**: Menyaring berdasarkan siklus hidup tiket.
- **Kategori**: Menyaring berdasarkan jenis masalah (misal: Teknis, Akun, Billing).
- **Pencarian Teks**: Mencari berdasarkan judul tiket.

### 3. Daftar Tiket (Tabel)
Data ditampilkan dalam format tabel responsif yang mencakup:
- **Token**: ID unik tiket (format pendek/hash).
- **Judul**: Ringkasan masalah.
- **Kategori & Status**: Dengan label warna-warni (Badges) untuk keterbacaan cepat.
- **Prioritas**: Indikator urgensi (Rendah, Sedang, Tinggi, Kritis).
- **Assigned To**: Menampilkan siapa staf yang menangani tiket tersebut.
- **Aksi**: Tombol cepat untuk membuka detail tiket.

## Kode Warna & Visual
Sistem menggunakan skema warna konsisten untuk status dan prioritas:
- **Status**:
  - Open: Biru
  - In Progress: Kuning
  - Waiting: Oranye
  - Solved: Hijau
- **Prioritas**:
  - Low: Abu-abu
  - Medium: Biru
  - High: Oranye
  - Critical: Merah

## Integrasi Data
Data diambil secara paralel menggunakan `Promise.all` saat halaman dimuat untuk efisiensi:
1. Daftar Tiket
2. Daftar Kategori (untuk filter)
3. Statistik (untuk kartu atas)

## Catatan Penggunaan
- Halaman ini bertindak sebagai "List View".
- Detail percakapan tiket dapat diakses dengan mengklik baris tabel atau tombol "Buka", yang mengarah ke `/dashboard/tickets/:id`.
