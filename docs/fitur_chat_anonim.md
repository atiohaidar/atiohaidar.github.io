# Dokumentasi Fitur Chat Anonim (Anonymous Chat)

## Deskripsi Umum
Fitur Chat Anonim adalah ruang percakapan publik di mana pengguna dapat mengirim pesan tanpa perlu login (otentikasi). Identitas pengguna disamarkan menggunakan ID unik yang dihasilkan di perangkat.

## Komponen Utama
- **Halaman**: `frontend/pages/FullscreenAnonymousChatPage.tsx`
- **Service**: 
  - `frontend/services/chatService.ts` (API REST)
  - `frontend/services/websocketService.ts` (Real-time)

## Arsitektur Real-time

### WebSocket Service
Fitur ini memprioritaskan koneksi WebSocket untuk pengalaman real-time:
1. **Inisialisasi**: Saat halaman dimuat, `webSocketService.ensureConnected()` dipanggil.
2. **Event Handling**: 
   - `new_message`: Menerima pesan baru secara langsung tanpa polling.
   - `connections_update`: Memperbarui jumlah pengguna online secara real-time.
   - `clear_messages`: Menghapus tampilan pesan saat ada perintah reset dari server.
3. **Fallback**: Jika WebSocket terputus, pengiriman pesan secara otomatis fallback ke REST API standar (`sendAnonymousMessage`).

## Mekanisme Identitas Anonim
- **ID Pengguna**: Sistem membuat ID unik format `anon-<timestamp>-<random>` yang disimpan di `localStorage` (`anonymous_sender_id`).
- **Persistensi**: Pengguna akan dikenali dengan ID yang sama selama mereka menggunakan browser yang sama dan tidak menghapus data lokal.

## Fungsionalitas UI
- **Scroll Otomatis**: Logika pintar (`checkIfAtBottom`) untuk menentukan kapan harus auto-scroll ke pesan terbaru atau membiarkan pengguna membaca pesan lama (history).
- **Pengelompokan Tanggal**: Pesan dikelompokkan secara visual berdasarkan tanggal (Hari Ini, Kemarin, dll) menggunakan `useMemo` untuk performa.
- **Indikator Online**: Menampilkan jumlah pengguna aktif yang terhubung ke socket yang sama.
- **Manajemen Pesan**:
  - **Balas (Reply)**: Konteks balasan ditampilkan di atas input.
  - **Reset Chat**: Opsi untuk menghapus seluruh riwayat pesan (biasanya untuk maintenance atau moderasi).

## Keamanan & Privasi
Meskipun anonim, ID pengirim tetap dikirim ke server untuk keperluan moderasi dasar (misal blocking jika diperlukan di sisi server), namun tidak ada data pribadi (email/nama) yang dikumpulkan.
