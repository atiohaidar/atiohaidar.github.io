# Portofolio Tio Haidar Hanif

Ini adalah kode sumber untuk website portofolio pribadi Tio Haidar Hanif. Proyek ini dibangun menggunakan React dan Tailwind CSS, dengan fokus pada desain yang bersih, minimalis, dan profesional. Aplikasi ini dirancang agar mudah dipelihara dan diperbarui melalui file data JSON.

## Fitur Utama

- **Single Page Application (SPA)**: Semua informasi disajikan dalam satu halaman dengan navigasi *smooth-scrolling*.
- **Desain Responsif**: Tampilan yang dioptimalkan untuk perangkat desktop, tablet, dan mobile.
- **Didukung Data JSON**: Seluruh konten (profil, proyek, pengalaman, dll.) dikelola melalui file JSON, memisahkan data dari logika tampilan.
- **Animasi Halus**: Animasi *fade-in-on-scroll* yang subtle untuk pengalaman pengguna yang lebih menarik.
- **Fitur Cetak ke PDF**: Terdapat fitur untuk mencetak atau menyimpan portofolio sebagai file PDF yang rapi dan profesional.
- **Kode Terdokumentasi**: Setiap komponen dan fungsi memiliki dokumentasi JSDoc untuk kemudahan pemeliharaan.

## Struktur Proyek

Proyek ini mengikuti arsitektur berbasis komponen yang terstruktur untuk skalabilitas dan kemudahan pemeliharaan.

```
/
├── public/
│   └── data/               # Folder berisi semua data konten dalam format JSON
│       ├── about.json
│       ├── education.json
│       ├── experiences.json
│       ├── profile.json
│       ├── projects.json
│       └── research.json
├── src/
│   ├── components/         # Komponen UI yang dapat digunakan kembali
│   │   ├── Icons.tsx
│   │   ├── Navbar.tsx
│   │   ├── Section.tsx     # Komponen wrapper untuk setiap bagian halaman
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   └── useIntersectionObserver.ts
│   ├── api.ts              # Logika untuk mengambil data dari file JSON (bisa diubah ke API sungguhan)
│   ├── constants.ts        # Konstanta aplikasi (misal: link navigasi)
│   ├── types.ts            # Definisi tipe TypeScript
│   └── App.tsx             # Komponen utama aplikasi
├── index.html              # File HTML utama
└── ... (file konfigurasi lainnya)
```

---

## Cara Pemeliharaan (Maintenance)

Memelihara dan memperbarui portofolio ini sangatlah mudah dan tidak memerlukan perubahan kode pada komponen React.

### 1. Memperbarui Konten

Semua konten teks, proyek, pengalaman kerja, dan data lainnya disimpan di dalam folder `public/data`. Untuk memperbarui informasi di website, cukup edit file JSON yang relevan:

-   **Profil & Info Kontak**: Edit `data/profile.json` untuk mengubah nama, bio, tautan sosial media, atau logo (Base64).
-   **Tentang Saya**: Edit `data/about.json` untuk mengubah deskripsi, *core values*, atau *interests*.
-   **Penelitian**: Tambah atau edit item di dalam array pada `data/research.json`.
-   **Portofolio Proyek**: Tambah atau edit proyek di dalam array pada `data/projects.json`.
-   **Pengalaman & Pendidikan**: Edit file `data/experiences.json` dan `data/education.json`.

Setelah menyimpan perubahan pada file JSON, website akan secara otomatis menampilkan data yang baru.

### 2. Menjalankan Proyek Secara Lokal

Untuk melihat perubahan secara lokal sebelum melakukan *deploy*, Anda memerlukan Node.js dan npm.

```bash
# 1. Clone repository
git clone https://github.com/TioHaidarHanif/TioHaidarHanif.github.io.git
cd TioHaidarHanif.github.io

# 2. Install dependencies (hanya perlu dilakukan sekali)
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser Anda dan kunjungi `http://localhost:5173` (atau port lain yang ditampilkan di terminal).

---

## Cara Menambah Fitur Baru (Contoh: Menambah Bagian "Sertifikasi")

Arsitektur proyek ini memudahkan penambahan bagian (section) baru. Ikuti langkah-langkah berikut:

#### Langkah 1: Buat File Data JSON Baru

-   Buat file baru di `public/data/certifications.json`.
-   Isi dengan data sertifikasi Anda dalam format array JSON.
    ```json
    [
      {
        "name": "Nama Sertifikasi",
        "issuer": "Lembaga Penerbit",
        "date": "Jan 2025",
        "url": "https://example.com/sertifikat"
      }
    ]
    ```

#### Langkah 2: Definisikan Tipe Data

-   Buka `src/types.ts`.
-   Tambahkan interface baru untuk `Certification`.
    ```typescript
    /**
     * Merepresentasikan sebuah sertifikasi.
     */
    export interface Certification {
      name: string;
      issuer: string;
      date: string;
      url: string;
    }
    ```

#### Langkah 3: Tambahkan Fungsi API

-   Buka `src/api.ts`.
-   Tambahkan fungsi baru untuk mengambil data sertifikasi.
    ```typescript
    export const getCertifications = () => fetchData<Certification[]>('certifications');
    ```

#### Langkah 4: Buat Komponen Section Baru

-   Buat file komponen baru di `src/components/Certifications.tsx`.
-   Komponen ini akan menerima data sebagai props dan menggunakan komponen `Section` yang sudah ada.

    ```tsx
    import React from 'react';
    import { Section } from './Section';
    import type { Certification } from '../types';

    // ... (kode komponen)
    ```

#### Langkah 5: Tambahkan Link Navigasi

-   Buka `src/constants.ts`.
-   Tambahkan entri baru ke dalam array `NAV_LINKS`. Jangan lupa menyesuaikan nomor urutnya.

#### Langkah 6: Integrasikan di `App.tsx`

-   Buka `src/App.tsx`.
-   **Fetch Data**: Impor `getCertifications` dan `Certification`, lalu tambahkan state baru dan panggil fungsinya di dalam `useEffect`.
-   **Render Komponen**: Impor komponen `Certifications` yang baru Anda buat dan render di posisi yang diinginkan di dalam `<main>`.

Dengan mengikuti pola ini, Anda dapat memperluas portofolio dengan bagian-bagian baru secara konsisten dan terstruktur.
