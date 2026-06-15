# Dokumentasi Fitur Dashboard (Overview)

## Deskripsi Umum
Dashboard adalah pusat kendali utama aplikasi yang menampilkan ringkasan aktivitas, statistik penting, dan navigasi ke seluruh modul manajemen sistem. Halaman ini dirancang untuk memberikan wawasan cepat (at-a-glance) kepada pengguna setelah login.

## Arsitektur & Layout

### Layout Dashboard (`frontend/components/DashboardLayout.tsx`)
Seluruh halaman di dalam rute `/dashboard/*` dibungkus oleh komponen `DashboardLayout`.
- **Sidebar Navigasi**:
  - Menu responsif (dapat diciutkan/sidebar drawer di mobile).
  - Berisi tautan ke modul: Ringkasan, Tugas, Chat, Ruangan, Pemesanan, Formulir, Barang, Tiket, Acara, Artikel, dll.
  - Memfilter menu berdasarkan peran (Role-Based Access Control) untuk menu admin seperti "Keuangan" dan "Manajemen Pengguna".
- **Header**:
  - Menampilkan judul halaman aktif secara dinamis.
  - Menampilkan tanggal hari ini.
  - Tombol notifikasi dan menu hamburger untuk mobile.
- **Pemuat Global (Global Loader)**:
  - Menggunakan `useBackendLoader` untuk menampilkan indikator loading layar penuh yang estetis saat operasi berat seperti Logout.

### Halaman Ringkasan (`frontend/pages/DashboardOverviewPage.tsx`)
Ini adalah halaman "landing" setelah login.

#### Fitur Utama:
1. **Sapaan Personal**: Menyapa pengguna berdasarkan waktu hari (Pagi/Siang/Sore) dengan nama mereka.
2. **Kartu Statistik (Stats Grid)**:
   - **Dompet**: Menampilkan saldo pengguna saat ini. Mendukung fitur Top Up dan Transfer (jika admin/diaktifkan).
   - **Total Tugas**: Jumlah tugas yang dimiliki pengguna.
   - **Tiket Aktif**: Masalah/tiket dukungan yang belum terselesaikan.
   - **Acara Mendatang**: Jumlah acara yang akan segera berlangsung.
3. **Grafik Produktivitas**: (Placeholder) Area yang disiapkan untuk visualisasi data mingguan.
4. **Aktivitas Terbaru**: Feed gabungan dari tiket terbaru dan acara mendatang, memberikan log kronologis pendek tentang apa yang terjadi di sistem.

## Detail Implementasi Teknis

### Pengambilan Data
Menggunakan custom hooks dari `frontend/hooks/useApi.ts` untuk mengambil data secara paralel:
- `useDashboardStats()`: Mengambil ringkasan tugas.
- `useTickets()`: Mengambil dan memfilter data tiket.
- `useEvents()`: Mengambil data acara.
- `useUser()`: Mengambil data detail pengguna (saldo, profil).

### Komponen Visual
- **Kartu Kaca (Glass Card)**: Menggunakan komponen UI `Card` dengan varian `glass` untuk memberikan efek blur transparan modern.
- **Micro-Interactions**: Efek hover pada kartu, animasi rotasi halus pada elemen dekoratif, dan transisi halaman (`animate-fade-in-up`).
- **Tema Notebook**: Menggunakan latar belakang garis buku (`notebook-lines`) dan elemen desain "binder" pada sidebar untuk estetika yang konsisten.

## Kontrol Akses
- Memvalidasi token JWT pada saat mounting (`useEffect` di `DashboardPage.tsx`).
- Menampilkan state loading saat "Memeriksa sesi pengguna".
- Redirect otomatis ke `/login` jika sesi tidak valid atau kadaluarsa.
