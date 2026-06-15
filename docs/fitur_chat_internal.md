# Dokumentasi Fitur Chat Internal (Dashboard)

## Deskripsi Umum
Fitur Chat Internal memungkinkan komunikasi real-time antar pengguna yang terdaftar di dalam dashboard. Fitur ini mendukung percakapan pribadi (Direct Message) dan percakapan grup.

## Komponen Utama
- **Halaman**: `frontend/pages/DashboardChatPage.tsx`
- **Service**: `frontend/services/chatService.ts`

## Fitur Fungsional

### 1. Daftar Percakapan (Sidebar)
- **Tab Navigasi**: Beralih antara tab "Chat Langsung" dan "Grup".
- **Indikator Chat**: Menampilkan avatar inisial, nama pengguna, dan cuplikan pesan terakhir.
- **Manajemen Chat**:
  - Tombol **Refresh** untuk memuat ulang daftar.
  - Tombol **Chat Baru** untuk memulai percakapan baru dengan username tertentu.
  - Tombol **Kelola Grup** (hanya di tab Grup) untuk membuat grup baru.

### 2. Area Pesan (Chat Area)
- **Header**: Menampilkan nama lawan bicara dan status (Online/Grup).
- **Bubble Pesan**:
  - Membedakan pesan masuk (kiri) dan pesan keluar (kanan, berwarna khusus).
  - Mendukung indentasi untuk pesan balasan (reply context).
- **Input Pesan**:
  - Kolom teks untuk mengetik pesan.
  - Tombol kirim dan fitur tekan Enter untuk mengirim.
  - Tampilan khusus saat membalas pesan tertentu.

### 3. Logika Memulai Percakapan
Menggunakan fungsi `getOrCreateConversation(targetUsername)`:
- Memeriksa apakah percakapan sudah ada.
- Jika ada, mengembalikan ID percakapan.
- Jika tidak, membuat percakapan baru di backend.
- Validasi username (tidak bisa chat diri sendiri).

## Detail Teknis

### State Management
- `activeTab`: 'direct' | 'group' - Menentukan mode tampilan daftar chat.
- `selectedChat`: ID percakapan yang sedang aktif.
- `chatType`: 'conversation' | 'group' - Menentukan konteks API saat mengambil pesan.
- `messages`: Array pesan yang dimuat untuk chat aktif.
- `replyTo`: State untuk menyimpan referensi pesan yang sedang dibalas.

### Integrasi API
- `getConversations()` & `getGroups()`: Mengambil daftar percakapan.
- `getConversationMessages(id)` & `getGroupMessages(id)`: Mengambil riwayat pesan.
- `sendMessage(data)`: Mengirim pesan baru (termasuk parameter `reply_to_id` jika ada).

### Desain (UI/UX)
- Menggunakan tema responsif (Dark/Light mode) melalui `DASHBOARD_THEME`.
- Desain responsif dengan sidebar yang dapat disembunyikan/ditampilkan di perangkat mobile (`isMobileChatListOpen`).
- Interaksi modern seperti bubble chat dengan sudut membulat dan warna kontras untuk pengirim/penerima.
