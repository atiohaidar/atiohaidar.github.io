# Portofolio Tio Haidar Hanif

Ini adalah kode sumber untuk website portofolio pribadi Tio Haidar Hanif. Proyek ini dibangun menggunakan React dan Tailwind CSS, dengan fokus pada desain yang bersih, minimalis, dan profesional. Aplikasi ini dirancang agar mudah dipelihara dan diperbarui melalui file data JSON.

## Fitur Utama

- **Single Page Application (SPA)**: Semua informasi disajikan dalam satu halaman dengan navigasi *smooth-scrolling*.
- **Desain Responsif**: Tampilan yang dioptimalkan untuk perangkat desktop, tablet, dan mobile.
- **Didukung Data JSON**: Seluruh konten (profil, proyek, pengalaman, dll.) dikelola melalui file JSON, memisahkan data dari logika tampilan.
- **Animasi Halus**: Animasi bertahap saat page load untuk pengalaman pengguna yang lebih menarik.
- **Fitur Cetak ke PDF**: Terdapat fitur untuk mencetak atau menyimpan portofolio sebagai file PDF yang rapi dan profesional dengan warna yang dipertahankan.
- **Interactive Social Media**: FAB (Floating Action Button) dan dropdown social media yang elegant.
- **Print Optimization**: Layout khusus untuk print dengan page breaks yang optimal dan tanpa halaman kosong.
- **Kode Terdokumentasi**: Setiap komponen dan fungsi memiliki dokumentasi JSDoc untuk kemudahan pemeliharaan.

## Teknologi yang Digunakan

### Frontend Framework & Library
- **[React 19.1.1](https://reactjs.org/)** - Frontend library untuk membangun user interface
- **[TypeScript 5.8.2](https://www.typescriptlang.org/)** - Static type checking untuk JavaScript
- **[Vite 6.2.0](https://vitejs.dev/)** - Build tool dan development server yang cepat

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework via CDN
- **[Google Fonts](https://fonts.google.com/)** - Inter & Poppins font families
- **Custom CSS** - Print optimization dan advanced styling

### Development Tools
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[npm](https://www.npmjs.com/)** - Package manager
- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** - Vite plugin untuk React
- **[@types/node](https://www.npmjs.com/package/@types/node)** - TypeScript definitions untuk Node.js

### Hosting & Deployment
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD untuk automated deployment

### Development Environment
- **[Visual Studio Code](https://code.visualstudio.com/)** - Code editor
- **[GitHub Codespaces](https://github.com/features/codespaces)** - Cloud development environment
- **[Git](https://git-scm.com/)** - Version control system

### AI Development Tools
- **[AI Studio Google](https://aistudio.google.com/)** - Advanced AI coding assistant untuk complex problem solving, architecture design, dan code optimization
- **[GitHub Copilot](https://github.com/features/copilot)** - AI pair programmer untuk code completion, refactoring, dan best practices implementation
- **AI-Powered Development Workflow** - Menggunakan kombinasi AI tools untuk meningkatkan produktivitas, code quality, dan maintainability

### Design & Assets
- **Custom SVG Icons** - Hand-crafted social media dan navigation icons
- **CSS Grid & Flexbox** - Modern layout techniques
- **CSS Animations** - Smooth transitions dan fade-in effects
- **Print CSS** - Optimized untuk PDF generation dengan color preservation

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

---

## Optimasi Print & PDF

Portofolio ini dioptimalkan khusus untuk pencetakan dan export PDF dengan fitur-fitur berikut:

### Fitur Print
- **Color Preservation**: Warna website dipertahankan dalam PDF menggunakan `print-color-adjust: exact`
- **Smart Page Breaks**: Sistem page break yang cerdas menghindari halaman kosong
- **Compact Layout**: Spacing dan margin yang dioptimalkan untuk print
- **Clickable Links**: Semua link eksternal tetap berfungsi di PDF
- **Professional Format**: Layout yang konsisten dengan website namun dioptimalkan untuk kertas

### Cara Mendapatkan PDF Terbaik
1. Klik tombol Print (🖨️) di pojok kanan bawah
2. Ikuti instruksi popup untuk mengaktifkan "Background graphics"
3. Pilih "Save as PDF" untuk hasil optimal
4. PDF yang dihasilkan akan memiliki warna dan link yang aktif

---

## Credits & Acknowledgments

### Open Source Technologies
Proyek ini dimungkinkan berkat kontribusi komunitas open source:

- **React Team** - Untuk React library yang powerful
- **Tailwind Labs** - Untuk Tailwind CSS framework
- **Vite Team** - Untuk build tool yang sangat cepat
- **TypeScript Team** - Untuk static typing yang robust
- **Google Fonts** - Untuk font Inter dan Poppins yang beautiful
- **GitHub** - Untuk hosting gratis melalui GitHub Pages

### Development Tools
- **Microsoft** - Visual Studio Code dan GitHub Codespaces
- **Vercel** - Inspirasi untuk developer experience yang excellent
- **MDN Web Docs** - Referensi web standards yang comprehensive

### Design Inspiration
- **Modern portfolio websites** - Inspirasi untuk clean design
- **Material Design** - Untuk FAB dan interaction patterns
- **Minimalism philosophy** - Less is more approach

---

## Lisensi

Proyek ini menggunakan lisensi MIT. Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikan kode ini dengan tetap mencantumkan credit yang sesuai.

### MIT License
```
Copyright (c) 2025 Tio Haidar Hanif

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## AI-Powered Development Process

Website ini dikembangkan dengan memanfaatkan AI tools modern untuk mengoptimalkan kualitas kode dan efisiensi development:

### AI Studio Google Integration
- **Architecture Planning**: Menggunakan AI Studio untuk merancang struktur komponen dan data flow yang optimal
- **Problem Solving**: AI assistance dalam menyelesaikan complex challenges seperti print optimization dan responsive design
- **Code Review**: AI-powered analysis untuk memastikan best practices dan code quality
- **Performance Optimization**: AI recommendations untuk improving loading times dan user experience

### GitHub Copilot Workflow
- **Smart Code Completion**: Accelerated development dengan intelligent code suggestions
- **Refactoring Assistance**: AI-guided refactoring untuk maintainable dan scalable code structure
- **Documentation Generation**: Auto-generated JSDoc comments dan comprehensive documentation
- **Testing Strategy**: AI-assisted test planning dan implementation guidance

### Hybrid Development Approach
- **Human Creativity + AI Efficiency**: Menggabungkan creative vision manusia dengan AI capabilities untuk optimal results
- **Iterative Development**: AI-assisted iteration cycles untuk continuous improvement
- **Quality Assurance**: AI tools untuk code validation, error detection, dan performance monitoring
- **Best Practices Implementation**: AI guidance dalam applying modern React patterns dan TypeScript conventions

---

## Contact & Support

Jika Anda memiliki pertanyaan atau saran untuk proyek ini:

- **Portfolio**: [https://atiohaidar.github.io](https://atiohaidar.github.io)
- **GitHub**: [https://github.com/atiohaidar](https://github.com/atiohaidar)
- **LinkedIn**: [Connect with me](https://linkedin.com/in/your-profile)

---

**Made with ❤️ and 🤖 by Tio Haidar Hanif**
*Developed using AI Studio Google and GitHub Copilot*
