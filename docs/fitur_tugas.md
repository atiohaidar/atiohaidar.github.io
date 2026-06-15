# Dokumentasi Fitur Manajemen Tugas (Todo List)

## Deskripsi Umum
Fitur Manajemen Tugas memungkinkan pengguna untuk mencatat, mengelola, dan melacak pekerjaan atau tugas pribadi mereka dalam bentuk daftar Todo List sederhana namun fungsional.

## Komponen Utama
- **Halaman**: `frontend/pages/DashboardTasksPage.tsx`
- **Komponen Fungsional**: `frontend/components/TasksManager.tsx`
- **Hooks API**: 
  - `useTasks`: Mengambil daftar tugas.
  - `useCreateTask`: Membuat tugas baru.
  - `useDeleteTask`: Menghapus tugas.

## Fitur Fungsional

### 1. Daftar Tugas
- Menampilkan daftar tugas dalam kartu-kartu yang rapi.
- Indikator status visual:
  - **Selesai (Hijau)**: Tugas yang sudah ditandai selesai.
  - **Pending (Kuning)**: Tugas yang belum diselesaikan.
- Menampilkan metadata waktu pembuatan dan pembaharuan tugas.

### 2. Pembuatan Tugas (Create)
- Pengguna dapat membuka formulir pembuatan tugas dengan tombol "Buat Tugas Baru".
- **Field Input**:
  - `Nama Tugas` (Wajib)
  - `Deskripsi` (Opsional, Textarea)
  - `Tandai sebagai selesai` (Checkbox awal)
- Animasi transisi saat formulir dibuka/ditutup.

### 3. Filter Tugas
- Dropdown filter untuk menyaring tampilan:
  - **Semua Tugas**: Menampilkan seluruh riwayat.
  - **Selesai**: Hanya menampilkan tugas yang sudah rampung.
  - **Belum Selesai**: Hanya menampilkan tugas aktif.

### 4. Tindakan (Actions)
- **Hapus**: Tombol hapus pada setiap kartu tugas dengan konfirmasi dialog (`window.confirm`) untuk mencegah penghapusan tidak sengaja.
- **Mark as Done**: Dilakukan melalui edit (saat ini implementasi edit detail mungkin ada di komponen terpisah atau dikembangkan lebih lanjut, namun status ditampilkan jelas).

## Desain & UX
- **Glassmorphism**: Menggunakan gaya panel semi-transparan (`glass-panel`).
- **Elemen Dekoratif**: Aksen selotip ("tape decoration") pada formulir input untuk memberikan kesan menempel catatan di papan tulis.
- **Responsif**: Layout fleksibel yang menyesuaikan tampilan kolom pada perangkat mobile dan desktop.
