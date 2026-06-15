# Dokumentasi Fitur Manajemen Acara (Events)

## Deskripsi Umum
Fitur Manajemen Acara berfungsi untuk menampilkan jadwal kegiatan, webinar, atau pertemuan yang diselenggarakan. Pengguna dapat melihat acara yang akan datang maupun arsip acara yang telah berlalu.

## Komponen Utama
- **Halaman**: `frontend/pages/DashboardEventsPage.tsx`
- **Library External**: `@tanstack/react-query` untuk manajemen state server (caching, loading).
- **Service API**: `listEvents` dari layanan terpusat.

## Fitur Fungsional

### 1. Tab Navigasi (Filter Waktu)
Sistem menyediakan tiga tab utama untuk memfilter acara berdasarkan waktu:
- **Semua**: Menampilkan seluruh kalender acara.
- **Akan Datang (Upcoming)**: Memfilter acara dengan `event_date >= sekarang`.
- **Telah Lewat (Past)**: Memfilter acara dengan `event_date < sekarang`.

### 2. Tampilan Kartu Acara
Setiap acara ditampilkan dalam kartu yang informatif:
- **Judul & Ikon**: Ikon berbeda untuk acara mendatang (🎉) dan acara lewat (📅).
- **Label Pembuat**: Jika pengguna yang login adalah pembuat acara, label "Pembuat" akan muncul.
- **Informasi Waktu & Lokasi**: Format tanggal lokal Indonesia yang lengkap (Hari, Tanggal Bulan Tahun, Jam).
- **Status Selesai**: Indikator visual khusus untuk acara yang sudah lampau.

### 3. Manajemen Acara
- Tombol **"+ Buat Acara Baru"** di header mengarahkan pengguna ke formulir pembuatan acara (`/dashboard/events/new`).
- Mengklik kartu acara akan mengarahkan ke halaman detail (`/dashboard/events/:id`) untuk melihat informasi lengkap atau melakukan pendaftaran (RSVP).

## Implementasi Teknis

### React Query
Penggunaan `useQuery` memberikan keuntungan:
- **Loading State Otomatis**: Menampilkan spinner saat data sedang diambil.
- **Error Handling**: Menampilkan pesan error yang ramah jika pengambilan data gagal.
- **Caching**: Data acara disimpan di cache browser untuk navigasi cepat antar halaman tanpa request berulang.

### Logika Client-Side Filtering
Filtering (Upcoming/Past) dilakukan di sisi klien (`filterEvents` function) untuk responsivitas instan tanpa perlu memanggil API ulang setiap kali tab berpindah.
