# 🔧 Konfigurasi API - Development vs Production

## 📋 Ringkasan

Frontend sekarang **otomatis** menggunakan backend yang berbeda tergantung environment:

| Environment | Command | Backend URL |
|------------|---------|-------------|
| **Development** | `npm run dev` | `http://localhost:8787` |
| **Production Build** | `npm run build` | `https://backend.atiohaidar.workers.dev` |
| **Preview Build** | `npm run preview` | `https://backend.atiohaidar.workers.dev` |

## ⚙️ Cara Kerja

### 1. Environment Files

Frontend sekarang memiliki 3 file environment:

```
frontend/
├── .env.development      ← Untuk development (npm run dev)
├── .env.production       ← Untuk production build (npm run build)
└── .env.example          ← Template untuk dokumentasi
```

### 2. Automatic Loading

Vite **otomatis** memilih file yang tepat:

```bash
# Development
npm run dev
# ↓ Loads .env.development
# ↓ API_BASE_URL = http://localhost:8787

# Production Build
npm run build
# ↓ Loads .env.production
# ↓ API_BASE_URL = https://backend.atiohaidar.workers.dev
```

### 3. Smart Fallback

Jika file `.env` tidak ada, kode akan fallback ke nilai yang benar:

```typescript
// apiClient.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
        ? 'https://backend.atiohaidar.workers.dev'  // Production fallback
        : 'http://localhost:8787');                  // Development fallback
```

## 🚀 Usage

### Development (Local Backend)

```bash
# 1. Pastikan backend local berjalan
cd backend
wrangler dev  # Backend runs on http://localhost:8787

# 2. Jalankan frontend di terminal lain
cd frontend
npm run dev   # Frontend runs on http://localhost:3000
              # Automatically connects to http://localhost:8787
```

### Production Build (Production Backend)

```bash
cd frontend
npm run build

# Build output di folder: frontend/dist
# API calls akan otomatis ke: https://backend.atiohaidar.workers.dev
```

### Test Production Build Locally

```bash
cd frontend
npm run build    # Build dengan production config
npm run preview  # Preview di http://localhost:4173
                 # Masih pakai production API URL!
```

## 🔐 Environment Variables

### .env.development
```bash
VITE_API_URL=http://localhost:8787
```

### .env.production
```bash
VITE_API_URL=https://backend.atiohaidar.workers.dev
```

### Override untuk Testing

Jika ingin test dengan backend custom:

```bash
# Buat file .env.local (tidak di-commit ke git)
echo "VITE_API_URL=https://backend-staging.example.com" > .env.local

# .env.local akan override nilai dari .env.development atau .env.production
npm run dev
```

**Priority Order:** `.env.local` > `.env.[mode]` > `.env`

## 📝 File Changes

### 1. apiClient.ts
Sekarang dengan smart fallback:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
        ? 'https://backend.atiohaidar.workers.dev' 
        : 'http://localhost:8787');
```

### 2. vite-env.d.ts (NEW)
TypeScript type definitions untuk Vite env:
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly MODE: string;
}
```

### 3. .env files (NEW)
- `.env.development` - Development config
- `.env.production` - Production config

## 🔍 Debugging

### Cek API URL yang sedang dipakai:

Tambahkan di `App.tsx` atau component manapun:
```tsx
console.log('API Base URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
```

### Common Issues

**❌ Problem: Build menggunakan localhost**
```
Solution: Pastikan ada file .env.production
```

**❌ Problem: Dev menggunakan production URL**
```
Solution: Pastikan ada file .env.development
          atau hapus .env.local jika ada
```

**❌ Problem: CORS error**
```
Solution: 
1. Pastikan backend Cloudflare Workers sudah deploy
2. Cek CORS headers di backend (seharusnya sudah ada)
3. Cek URL backend benar: https://backend.atiohaidar.workers.dev
```

## 🌐 Deployment

### Deploy ke GitHub Pages (atau hosting static lainnya)

```bash
# 1. Build dengan production config
cd frontend
npm run build

# 2. Folder 'dist' berisi:
# - HTML, CSS, JS yang sudah di-bundle
# - API calls ke https://backend.atiohaidar.workers.dev

# 3. Deploy folder 'dist' ke hosting pilihan:
# - GitHub Pages
# - Netlify
# - Vercel
# - Cloudflare Pages
# - dll
```

### Verify Deployment

Setelah deploy, buka browser console dan cek:
```javascript
// Di app yang sudah di-deploy
console.log('API URL:', API_BASE_URL);
// Should output: https://backend.atiohaidar.workers.dev
```

## 🔒 Security

### Environment Variables Best Practices

1. **Jangan commit secrets** - File `.env.local` dan `.env` (jika ada) di-ignore oleh git
2. **Prefix dengan VITE_** - Hanya variables dengan prefix `VITE_` yang exposed ke client
3. **No sensitive data** - Jangan taruh API keys atau secrets di env frontend
4. **Backend handles auth** - Semua authentication di backend, bukan frontend

### Gitignore

Pastikan `.gitignore` sudah include:
```
.env.local
.env*.local
```

File yang **aman** untuk di-commit:
- `.env.development` ✅
- `.env.production` ✅
- `.env.example` ✅

## 📊 Summary Table

| Scenario | Backend URL | Notes |
|----------|------------|-------|
| `npm run dev` | http://localhost:8787 | Need local backend running |
| `npm run build` | https://backend.atiohaidar.workers.dev | Production API |
| `npm run preview` | https://backend.atiohaidar.workers.dev | Same as build |
| With `.env.local` | Custom URL | Override for testing |

## ✅ Checklist

Sebelum deploy to production:

- [ ] Backend sudah deploy ke Cloudflare Workers
- [ ] Test backend API: `https://backend.atiohaidar.workers.dev/health`
- [ ] File `.env.production` ada dan benar
- [ ] Run `npm run build` sukses
- [ ] Test di browser: login dan CRUD operations
- [ ] Cek console untuk errors
- [ ] Test di mobile browser juga

---

**🎉 Sekarang aplikasi Anda production-ready!**

Frontend akan otomatis connect ke backend yang tepat tergantung environment.
