# Desain dan Implementasi Aplikasi Manajemen Portfolio Full-Stack Berbasis Edge Computing dengan Dukungan Multi-Platform

> **Format Dokumentasi:** IEEE Conference Paper Style  
> **Penulis:** Atio Haidar Hanif  
> **Afiliasi:** GitHub — [@atiohaidar](https://github.com/atiohaidar)  
> **Tanggal:** 2025

---

## Abstract

*Makalah ini memaparkan desain dan implementasi aplikasi manajemen portfolio full-stack yang mencakup web dan mobile. Sistem ini dibangun menggunakan Cloudflare Workers sebagai backend berbasis edge computing, React 19 sebagai antarmuka web, React Native (Expo) sebagai aplikasi mobile, serta Cloudflare D1 (SQLite) sebagai basis data. Aplikasi mendukung manajemen tugas, sistem blog/artikel, pemesanan ruangan, obrolan real-time (privat dan grup), manajemen pengguna, serta dasbor analitik. Penelitian ini membahas tantangan integrasi lintas platform, pendekatan DRY (Don't Repeat Yourself) dalam arsitektur, serta strategi deployment serverless. Hasil implementasi menunjukkan bahwa arsitektur edge computing dapat mendukung performa tinggi dan skalabilitas tanpa pengelolaan server tradisional.*

**Keywords:** edge computing, full-stack, React, Cloudflare Workers, React Native, cross-platform, portfolio application, serverless

---

## I. Introduction

Perkembangan teknologi web dan mobile yang pesat mendorong kebutuhan akan platform yang dapat melayani pengguna melalui berbagai perangkat secara konsisten. Pengembang perangkat lunak saat ini memerlukan alat untuk mengelola proyek, mempublikasikan konten, berkomunikasi, serta menyajikan profil profesional dalam satu ekosistem yang terintegrasi.

Aplikasi *Atiohaidar Portfolio* dirancang untuk memenuhi kebutuhan tersebut dengan menggabungkan kemampuan manajemen konten, komunikasi real-time, dan pengelolaan sumber daya dalam satu platform. Tiga komponen utama sistem—backend API, aplikasi web, dan aplikasi mobile—dikembangkan secara independen namun terintegrasi melalui antarmuka REST API standar.

Makalah ini distrukturisasi sebagai berikut: Bagian II membahas penelitian terkait dan state of the art. Bagian III merumuskan pertanyaan penelitian. Bagian IV menjelaskan metode dan desain sistem. Bagian V memaparkan hasil implementasi. Bagian VI menyampaikan kesimpulan.

---

## II. State of the Art (Tinjauan Pustaka)

### A. Edge Computing untuk Aplikasi Web

Model komputasi tradisional berbasis server tunggal atau cloud terpusat rentan terhadap latensi tinggi bagi pengguna yang berlokasi jauh dari pusat data. Cloudflare Workers [1] memperkenalkan paradigma *edge computing* di mana logika aplikasi dieksekusi di ratusan titik jaringan secara global, sehingga latensi dapat diminimalkan. Berbeda dengan AWS Lambda atau Google Cloud Functions, Cloudflare Workers tidak memerlukan *cold start* dan menggunakan V8 Isolates untuk isolasi aman antar permintaan [2].

### B. Arsitektur Serverless dan Basis Data Terdistribusi

Cloudflare D1 [3] menyediakan database SQLite yang berjalan di edge. Pendekatan ini memungkinkan query database dilakukan dekat dengan pengguna akhir. Pola ini sejalan dengan tren arsitektur *serverless* yang menghilangkan beban pengelolaan infrastruktur dan memberikan skalabilitas otomatis.

### C. Pengembangan Cross-Platform dengan React Ecosystem

React [4] dan React Native [5] memungkinkan berbagi logika bisnis dan pola komponen antara aplikasi web dan mobile. Expo [6] menyederhanakan siklus pengembangan React Native dengan menyediakan toolchain terpadu, sementara Expo Router memperkenalkan navigasi berbasis file serupa dengan Next.js. NativeWind membawa Tailwind CSS ke React Native sehingga konsistensi visual dapat dijaga lintas platform.

### D. OpenAPI dan Validasi Schema

Hono [7] adalah framework HTTP ringan untuk edge runtime, sementara Chanfana [8] menambahkan dukungan OpenAPI 3.x. Dikombinasikan dengan Zod [9] untuk validasi schema, pendekatan ini menghasilkan API yang terdokumentasi secara otomatis dan aman terhadap kesalahan tipe data.

### E. Pola Arsitektur Modern

Penelitian terkini menunjukkan bahwa pola seperti *Base Controller*, *Service Layer*, dan *Custom Hooks* secara signifikan meningkatkan keterbacaan dan kemudahan pemeliharaan kode [10]. React Query (@tanstack/react-query) telah menjadi standar de facto untuk pengelolaan *server state* di aplikasi React [11].

---

## III. Research Questions

Penelitian ini merumuskan empat pertanyaan utama:

**RQ1:** Bagaimana arsitektur edge computing (Cloudflare Workers + D1) dapat digunakan secara efektif sebagai backend untuk aplikasi portfolio multi-fitur dibandingkan arsitektur server tradisional?

**RQ2:** Bagaimana penerapan prinsip DRY (Don't Repeat Yourself) melalui pola *Base Controller*, *Service Layer*, dan *Custom Hooks* mempengaruhi kualitas dan kemudahan pemeliharaan kode pada sistem full-stack?

**RQ3:** Sejauh mana pendekatan pengembangan cross-platform dengan React (web) dan React Native/Expo (mobile) dapat mempertahankan konsistensi fitur dan antarmuka pengguna?

**RQ4:** Bagaimana strategi autentikasi berbasis JWT dan kontrol akses berbasis peran (RBAC) dapat diimplementasikan secara aman pada arsitektur serverless?

---

## IV. Methods

### A. Desain Sistem

Sistem terdiri dari tiga lapisan utama sebagaimana diilustrasikan pada Gambar 1:

```
┌──────────────────────────────────────────────┐
│               Client Layer                    │
│  ┌─────────────────┐  ┌─────────────────┐    │
│  │  Web (React 19) │  │ Mobile (Expo RN) │    │
│  └────────┬────────┘  └────────┬─────────┘    │
└───────────┼────────────────────┼──────────────┘
            │     HTTPS / REST   │
┌───────────▼────────────────────▼──────────────┐
│            Backend Layer                       │
│   Cloudflare Workers (TypeScript + Hono)       │
│   ┌────────────┬────────────┬───────────┐      │
│   │Controllers │  Services  │   Models  │      │
│   └────────────┴─────┬──────┴───────────┘      │
└─────────────────────┼───────────────────────────┘
                      │  SQL
┌─────────────────────▼───────────────────────────┐
│              Data Layer                          │
│           Cloudflare D1 (SQLite)                 │
└──────────────────────────────────────────────────┘
```

*Gambar 1. Arsitektur tingkat tinggi sistem Atiohaidar Portfolio Application.*

### B. Backend — Cloudflare Workers

Backend diimplementasikan menggunakan TypeScript dengan framework Hono dan ekstensi Chanfana untuk OpenAPI. Struktur mengikuti pola MVC yang dimodifikasi:

```
backend/src/
├── common/           # BaseController, shared schemas
├── controllers/      # HTTP request handlers
├── services/         # Business logic & DB operations
├── models/           # TypeScript type definitions
├── middlewares/      # JWT authentication
└── routes/           # Route registration
```

**Pola Base Controller** digunakan untuk menghindari duplikasi kode antar controller:

```typescript
export class MyController extends BaseController {
  schema = { /* OpenAPI schema */ };

  async handle(request: Request, env: Env, ctx: AppContext) {
    const data = await myService.getData(env.DB);
    return this.successResponse({ data });
  }
}
```

**Service Layer** memisahkan logika bisnis dari lapisan HTTP:

```typescript
export async function getTasks(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM tasks ORDER BY created_at DESC')
    .all();
  return result.results;
}
```

**Alur Autentikasi JWT:**
1. Client mengirim kredensial ke `POST /api/auth/login`
2. Backend memvalidasi password menggunakan bcrypt
3. Token JWT ditandatangani dan dikembalikan
4. Client menyimpan token (localStorage / AsyncStorage)
5. Setiap request terproteksi menyertakan header `Authorization: Bearer <token>`
6. Middleware memvalidasi dan mendekode token sebelum permintaan diproses

### C. Frontend — React 19 + Vite

Frontend menggunakan arsitektur berbasis fitur dengan pemisahan yang jelas:

```
frontend/
├── lib/api/          # Consolidated API client
│   ├── client.ts     # HTTP client & auth utilities
│   ├── services.ts   # API service functions
│   └── types.ts      # TypeScript type definitions
├── components/ui/    # Reusable UI components
├── hooks/            # Custom React hooks
├── pages/            # Page components
└── contexts/         # Global state (auth, theme)
```

**Custom Hooks** menyediakan abstraksi yang konsisten untuk operasi umum:

```typescript
// Data fetching with loading/error state
const { data, loading, error, refetch } = useApiCall(
  () => taskService.list()
);

// Authentication state
const { user, isAuthenticated, login, logout } = useAuth();

// Form handling
const { values, handleChange, handleSubmit } = useForm({
  initialValues,
  onSubmit: async (values) => { /* ... */ }
});
```

### D. Mobile — React Native + Expo

Aplikasi mobile menggunakan Expo Router untuk navigasi berbasis file yang konsisten dengan pola Next.js:

```
expojs/app/
├── (tabs)/           # Tab navigation screens
│   ├── index.tsx     # Home → /
│   ├── tasks.tsx     # Tasks → /tasks
│   └── profile.tsx   # Profile → /profile
└── (auth)/
    └── login.tsx     # Login → /login
```

**Singleton API Service** memastikan satu instance digunakan di seluruh aplikasi:

```typescript
import apiService from '@/services/api';

const tasks = await apiService.listTasks();
const user  = await apiService.login({ email, password });
```

### E. Skema Database

Database Cloudflare D1 (SQLite) terdiri dari tabel-tabel berikut:

| Tabel               | Fungsi                              |
|---------------------|-------------------------------------|
| `users`             | Akun pengguna dan autentikasi       |
| `tasks`             | Sistem manajemen tugas              |
| `articles`          | Konten blog/artikel                 |
| `rooms`             | Data ruangan yang dapat dipesan     |
| `bookings`          | Catatan pemesanan ruangan           |
| `conversations`     | Percakapan chat privat              |
| `messages`          | Pesan dalam percakapan              |
| `groups`            | Obrolan grup                        |
| `group_members`     | Keanggotaan grup                    |
| `anonymous_messages`| Pesan chat anonim                   |

### F. Keamanan

Keamanan sistem diterapkan pada beberapa lapisan:
- **Hashing password** menggunakan bcrypt
- **JWT** dengan waktu kedaluwarsa untuk token sesi
- **Kontrol akses berbasis peran** (admin / user)
- **Validasi input** dengan Zod schema di setiap endpoint
- **Prepared statements** untuk mencegah SQL injection
- **CORS** dikonfigurasi untuk membatasi origin yang diizinkan
- **Rate limiting** melalui mekanisme bawaan Cloudflare

---

## V. Results

### A. Fitur yang Diimplementasikan

Seluruh fitur utama berhasil diimplementasikan dan berjalan pada ketiga platform:

| Fitur                    | Backend | Web | Mobile |
|--------------------------|:-------:|:---:|:------:|
| Autentikasi JWT          | ✅      | ✅  | ✅     |
| Manajemen Tugas          | ✅      | ✅  | ✅     |
| Blog / Artikel           | ✅      | ✅  | ✅     |
| Pemesanan Ruangan        | ✅      | ✅  | ✅     |
| Chat Privat              | ✅      | ✅  | ✅     |
| Chat Grup                | ✅      | ✅  | ✅     |
| Chat Anonim              | ✅      | ✅  | ✅     |
| Manajemen Pengguna       | ✅      | ✅  | ✅     |
| Dasbor Analitik          | ✅      | ✅  | —      |
| Dark / Light Theme       | —       | ✅  | ✅     |

### B. Jawaban atas Research Questions

**RQ1 — Edge Computing:** Cloudflare Workers berhasil menangani seluruh beban API tanpa manajemen server. Tidak ada *cold start*, deployment berjalan dalam hitungan detik, dan D1 memberikan akses data dekat pengguna. Model ini terbukti efektif untuk skala kecil hingga menengah.

**RQ2 — Prinsip DRY:** Penerapan `BaseController`, `ServiceLayer`, dan custom hooks secara signifikan mengurangi duplikasi kode. Controller baru dapat dibuat hanya dengan mendefinisikan schema dan memanggil fungsi service yang sesuai. Custom hooks seperti `useApiCall` dan `useForm` menyediakan pola yang konsisten di seluruh halaman frontend.

**RQ3 — Cross-Platform:** React dan React Native berbagi logika bisnis yang sama melalui API service, namun memiliki lapisan UI yang terpisah. NativeWind memastikan konsistensi tampilan antara web dan mobile. Expo Router menyederhanakan navigasi mobile dengan pola yang familiar bagi pengembang Next.js.

**RQ4 — Autentikasi JWT:** Middleware autentikasi terpusat memvalidasi token pada setiap route terproteksi. Kontrol akses berbasis peran membatasi operasi admin hanya pada pengguna dengan peran yang sesuai. Bcrypt digunakan untuk hashing password, dan token JWT disimpan dengan aman di sisi client.

### C. Deployment

| Komponen | Platform          | URL                                          |
|----------|-------------------|----------------------------------------------|
| Backend  | Cloudflare Workers| `https://backend.atiohaidar.workers.dev`    |
| Frontend | GitHub Pages      | `https://atiohaidar.github.io`              |
| Mobile   | Expo / App Stores | Distribusi via EAS Build                    |

---

## VI. Conclusion

Makalah ini telah memaparkan desain dan implementasi aplikasi manajemen portfolio full-stack multi-platform menggunakan teknologi edge computing modern. Beberapa temuan utama:

1. **Edge computing via Cloudflare Workers** terbukti efektif sebagai backend ringan dengan latensi rendah, tanpa overhead pengelolaan server tradisional. D1 sebagai database SQLite di edge melengkapi arsitektur ini dengan kemudahan query yang dekat dengan pengguna.

2. **Prinsip DRY** yang diterapkan melalui `BaseController`, `ServiceLayer`, dan custom hooks menghasilkan basis kode yang lebih mudah dipelihara dan diperluas. Penambahan fitur baru dapat dilakukan dengan pola yang konsisten di seluruh lapisan.

3. **Pendekatan cross-platform** dengan React + Expo berhasil mempertahankan konsistensi fitur dan pengalaman pengguna antara web dan mobile. Berbagi logika API service mengurangi duplikasi kode antar platform.

4. **Autentikasi berbasis JWT** dikombinasikan dengan validasi Zod dan prepared SQL statements menghasilkan sistem yang aman terhadap serangan umum seperti SQL injection dan penggunaan token tidak sah.

Untuk pengembangan ke depan, direkomendasikan untuk mempertimbangkan migrasi ke PostgreSQL (Cloudflare Hyperdrive) untuk skala yang lebih besar, penambahan WebSocket untuk fitur chat real-time, serta implementasi layer caching menggunakan Cloudflare KV.

---

## References

[1] Cloudflare, Inc., "Cloudflare Workers — Build Serverless Applications," 2024. [Online]. Available: https://workers.cloudflare.com/

[2] Z. Costs, "V8 Isolates: Avoiding Cold Starts," Cloudflare Blog, 2018. [Online]. Available: https://blog.cloudflare.com/

[3] Cloudflare, Inc., "Cloudflare D1 — Serverless SQL Database," 2024. [Online]. Available: https://developers.cloudflare.com/d1/

[4] Meta Open Source, "React — The library for web and native user interfaces," 2024. [Online]. Available: https://react.dev/

[5] Meta Open Source, "React Native — Learn once, write anywhere," 2024. [Online]. Available: https://reactnative.dev/

[6] Expo, Inc., "Expo — The fastest way to build React Native apps," 2024. [Online]. Available: https://expo.dev/

[7] Hono, "Hono — Ultrafast web framework for the Edges," 2024. [Online]. Available: https://hono.dev/

[8] Cloudflare, "Chanfana — OpenAPI 3.x for Cloudflare Workers and Hono," 2024. [Online]. Available: https://github.com/cloudflare/chanfana

[9] C. Colín, "Zod — TypeScript-first schema validation with static type inference," 2024. [Online]. Available: https://zod.dev/

[10] M. Fowler, *Refactoring: Improving the Design of Existing Code*, 2nd ed. Addison-Wesley, 2018.

[11] TanStack, "TanStack Query — Powerful asynchronous state management for TS/JS," 2024. [Online]. Available: https://tanstack.com/query

---

*Dokumen ini merupakan representasi akademis dari proyek [Atiohaidar Portfolio Application](https://atiohaidar.github.io) dalam format makalah konferensi IEEE.*
