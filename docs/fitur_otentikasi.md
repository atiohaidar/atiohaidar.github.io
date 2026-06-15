# Dokumentasi Fitur Otentikasi (Authentication)

## Deskripsi Umum
Fitur Otentikasi menangani proses masuk (login) dan pendaftaran (register) pengguna ke dalam aplikasi. Sistem ini memastikan keamanan akses dashboard dan fitur-fitur yang dilindungi.

## Arsitektur & Komponen

### Halaman Utama
Fitur ini terdiri dari dua halaman utama:
1. **LoginPage** (`frontend/pages/LoginPage.tsx`)
2. **RegisterPage** (`frontend/pages/RegisterPage.tsx`)

### Integrasi Service
Otentikasi menggunakan layanan terpusat untuk komunikasi dengan backend:
- **Service**: `authService` (`frontend/lib/api/services`)
- **Fungsi Utama**:
  - `login(username, password)`: Mengirim kredensial untuk mendapatkan token JWT.
  - `register(username, name, password)`: Mendaftarkan akun baru.
- **Penyimpanan Token**: Token JWT disimpan menggunakan utilitas `getAuthToken` dan `setAuthToken` (biasanya di `localStorage` atau cookies).

## Alur Kerja (Workflow)

### 1. Proses Login
1. Pengguna memasukkan username dan password pada `LoginPage`.
2. Sistem memvalidasi input lokal (seperti field kosong).
3. Permintaan dikirim ke endpoint login backend melalui `authService`.
4. Jika berhasil:
   - Token JWT dan data user diterima.
   - Token disimpan di penyimpanan lokal.
   - Pengguna diarahkan ke `/dashboard`.
5. Jika gagal, pesan kesalahan ditampilkan.

### 2. Proses Registrasi
1. Pengguna mengisi formulir pendaftaran (Username, Nama Lengkap, Password, Konfirmasi Password) pada `RegisterPage`.
2. Validasi dilakukan untuk:
   - Kecocokan password dan konfirmasi password.
   - Panjang minimum password (min. 6 karakter).
3. Data dikirim ke backend.
4. Jika berhasil, pengguna menerima konfirmasi dan diarahkan ke halaman login setelah jeda singkat.

## Detail Implementasi Teknis

### Manajemen State & Efek
- **`useState`**: Digunakan untuk mengelola input form (username, password), status loading, error, dan animasi mounting.
- **`useEffect`**:
  - Memeriksa apakah pengguna sudah login saat halaman dimuat (redirect otomatis ke dashboard jika ya).
  - Mengatur animasi transisi halaman.

### Antarmuka Pengguna (UI)
- **Komponen**: Menggunakan komponen UI standar seperti `Input`, `Button`, `Card` dari `frontend/components/ui`.
- **Tema**: Mendukung mode gelap/terang melalui `ThemeToggle`.
- **Estetika**: Desain menggunakan gaya "glass morphism" dan ornamen dekoratif (lingkaran, garis buku catatan) untuk memberikan kesan modern namun artistik.

### Keamanan
- Validasi input di sisi klien sebelum pengiriman.
- Token otentikasi (JWT) menjadi kunci akses untuk rute yang dilindungi di backend.
- Pengalihan otomatis (Redirect) mencegah pengguna yang sudah login untuk mengakses halaman login kembali.
