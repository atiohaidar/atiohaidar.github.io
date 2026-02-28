# Atiohaidar Portfolio & Management Application

Aplikasi full-stack untuk portfolio personal dan manajemen organisasi dengan dukungan web dan mobile.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Memulai](#memulai)
- [Dokumentasi](#dokumentasi)
- [Deployment](#deployment)
- [Penulis](#penulis)

## Tentang Proyek

Aplikasi ini terdiri dari tiga komponen utama:

1. **Backend API** — Serverless API menggunakan Cloudflare Workers dengan database D1 (SQLite).
2. **Frontend Web** — Aplikasi web berbasis React 19 + Vite dengan Tailwind CSS.
3. **Mobile App** — Aplikasi mobile berbasis React Native + Expo dengan NativeWind.

Selain itu terdapat modul tambahan:
- **Game** — Mini-game berbasis Svelte + Vite (direktori `game/`).
- **3D** — Halaman web statis untuk konten 3D (direktori `3d/`).
- **Flutter Mobile** — Versi alternatif aplikasi mobile menggunakan Flutter (direktori `mobile_flutter/`).
- **Android Native** — Proyek Android native dengan Gradle (direktori `android/`).

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| **Manajemen Tugas** | Membuat, mengedit, dan menghapus tugas dengan status dan tenggat waktu |
| **Blog / Artikel** | Sistem artikel dengan fitur draft dan publish, termasuk halaman publik |
| **Pemesanan Ruangan** | Booking ruangan dengan jadwal, status persetujuan, dan manajemen kapasitas |
| **Chat** | Percakapan langsung antar pengguna, grup chat, dan chat anonim |
| **WebSocket Real-time** | Komunikasi real-time untuk chat melalui Cloudflare Durable Objects |
| **Manajemen Pengguna** | CRUD pengguna dengan peran admin dan member |
| **Dashboard Statistik** | Ringkasan data dan analitik di halaman dashboard |
| **Formulir Dinamis** | Membuat dan mengisi formulir dengan token akses publik |
| **Peminjaman Barang** | Manajemen inventaris dan alur peminjaman barang |
| **Forum Diskusi** | Forum diskusi dengan dukungan anonim dan balasan |
| **Sistem Tiket** | Tiket dukungan dengan kategori, prioritas, dan penugasan |
| **Manajemen Event** | Acara dengan registrasi peserta, scan kehadiran QR, dan admin event |
| **Keuangan** | Saldo pengguna, transfer antar pengguna, dan top-up |
| **Farming Game** | Mini-game simulasi pertanian dengan tanaman, toko, inventaris, quest, dan leaderboard |
| **Dark / Light Theme** | Dukungan tema gelap dan terang di web dan mobile |

## Teknologi

### Backend

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Cloudflare Workers |
| Bahasa | TypeScript |
| Framework | Hono + Chanfana (OpenAPI) |
| Database | Cloudflare D1 (SQLite) |
| Autentikasi | JWT (jose) + bcryptjs |
| Validasi | Zod |
| Real-time | WebSocket via Durable Objects |

### Frontend Web

| Komponen | Teknologi |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| State | React Query (TanStack) |
| Animasi | tsParticles, D3.js |
| Mobile Wrapper | Capacitor |

### Mobile (Expo)

| Komponen | Teknologi |
|----------|-----------|
| Framework | React Native + Expo 54 |
| Bahasa | TypeScript |
| Styling | NativeWind (Tailwind CSS) |
| Navigasi | Expo Router |
| HTTP Client | Axios |
| State | TanStack React Query |
| Native | Camera, Barcode Scanner, Location, Haptics |

## Struktur Proyek

```
atiohaidar.github.io/
├── backend/              # Cloudflare Workers API
│   ├── src/
│   │   ├── common/       # BaseController & shared schemas
│   │   ├── controllers/  # 23 controller files (request handler)
│   │   ├── services/     # 15 service files (business logic)
│   │   ├── models/       # Type definitions (types.ts, game.types.ts)
│   │   ├── middlewares/   # Autentikasi JWT (auth.ts)
│   │   ├── routes/       # Registrasi route (index.ts)
│   │   └── durable-objects/ # WebSocket ChatRoom
│   └── migrations/       # 12 file migrasi database SQL
│
├── frontend/             # React web application
│   ├── lib/api/          # API client terpusat (client, services, types)
│   ├── components/       # 71+ komponen UI
│   │   └── ui/           # Komponen reusable (Button, Input, Card, dll.)
│   ├── pages/            # 37 halaman
│   ├── hooks/            # 7 custom hooks
│   ├── contexts/         # 3 context provider (Theme, BackendLoader, LandingData)
│   └── utils/            # Utilitas
│
├── expojs/               # React Native mobile app (Expo)
│   ├── app/              # File-based routing (auth, tabs, public)
│   ├── screens/          # 18 direktori screen
│   ├── components/       # Komponen mobile
│   ├── services/         # 18 modul API + 5 utilitas
│   └── hooks/            # 5 custom hooks
│
├── game/                 # Svelte mini-game
├── 3d/                   # Halaman web 3D statis
├── mobile_flutter/       # Aplikasi Flutter (alternatif)
├── android/              # Proyek Android native
├── docs/                 # Dokumentasi
└── run_dev.sh            # Script menjalankan backend + frontend
```

## Memulai

### Prasyarat

- Node.js 18+
- npm
- Akun Cloudflare (untuk deployment backend)
- Akun Expo (untuk deployment mobile)

### Instalasi

```bash
# Clone repository
git clone https://github.com/atiohaidar/atiohaidar.github.io.git
cd atiohaidar.github.io

# Install semua dependensi
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd expojs && npm install && cd ..
```

### Menjalankan Development Server

```bash
# Jalankan backend dan frontend sekaligus
./run_dev.sh

# Atau jalankan terpisah:

# Backend (port 8787)
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Mobile
cd expojs && npx expo start
```

### Environment Variables

```bash
# Frontend - frontend/.env.development
VITE_API_URL=http://localhost:8787

# Frontend - frontend/.env.production
VITE_API_URL=https://backend.atiohaidar.workers.dev

# Mobile - expojs/.env (opsional)
EXPO_PUBLIC_API_BASE_URL=https://backend.atiohaidar.workers.dev
```

Backend dikonfigurasi melalui `backend/wrangler.jsonc` untuk binding database D1.

## Dokumentasi

### Untuk Pengguna Umum

- **[Panduan Pengguna](docs/USER_GUIDE.md)** — Penjelasan fitur-fitur aplikasi untuk pengguna umum

### Untuk Developer

- **[Dokumentasi Teknis](docs/TECHNICAL.md)** — Arsitektur, API, database, dan panduan pengembangan
- **[Indeks Dokumentasi](docs/README.md)** — Daftar lengkap semua dokumentasi
- **[Panduan Maintenance](MAINTENANCE.md)** — Panduan pemeliharaan dan tugas umum development

### Dokumentasi Fitur

| Dokumen | Deskripsi |
|---------|-----------|
| [Sistem Chat](CHAT_DOCUMENTATION.md) | Dokumentasi fitur chat (private, grup, anonim) |
| [WebSocket Guide](WEBSOCKET_IMPLEMENTATION_GUIDE.md) | Implementasi WebSocket dengan Durable Objects |
| [Sistem Tiket](TICKETING_SYSTEM_DOCUMENTATION.md) | Dokumentasi sistem tiket dukungan |
| [Dashboard Guide](frontend/DASHBOARD_GUIDE.md) | Panduan penggunaan dan pengembangan dashboard |
| [Mobile App Guide](expojs/MOBILE_APP_GUIDE.md) | Panduan pengembangan aplikasi mobile |
| [Arsitektur](docs/ARCHITECTURE.md) | Arsitektur sistem dan pola desain |

## Deployment

### Backend

```bash
cd backend
npm run deploy  # Deploy ke Cloudflare Workers
```

### Frontend

```bash
cd frontend
npm run build   # Build untuk production
# Deploy otomatis via GitHub Pages saat push ke branch main
```

### Mobile

```bash
cd expojs
eas build --platform android  # Build APK Android
eas build --platform ios       # Build untuk iOS
```

## Penulis

**Atio Haidar Hanif**

- GitHub: [@atiohaidar](https://github.com/atiohaidar)
- Website: [atiohaidar.github.io](https://atiohaidar.github.io)
