# ⚡ Quick Reference - Menambah Fitur Dashboard

## 📝 Template: Fitur Baru

### 1. Buat Halaman (Copy & Paste)

```tsx
// frontend/pages/Dashboard[NamaFitur]Page.tsx
import React from 'react';
import { COLORS } from '../utils/styles';

const Dashboard[NamaFitur]Page: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                    [Judul Halaman]
                </h2>
                <p className="text-soft-gray text-sm">
                    [Deskripsi halaman]
                </p>
            </div>

            {/* Content Section */}
            <div className="bg-navy-darker rounded-lg border border-light-slate/20 p-6">
                {/* Header dengan Action Button */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        [Judul Section]
                    </h3>
                    <button
                        className={`px-4 py-2 ${COLORS.BG_ACCENT} text-white rounded-lg hover:bg-accent-blue/80 transition-colors`}
                    >
                        + Tambah [Item]
                    </button>
                </div>

                {/* Konten Utama */}
                <div className="space-y-4">
                    {/* Isi konten di sini */}
                    <p className="text-soft-gray">Konten halaman Anda</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard[NamaFitur]Page;
```

### 2. Tambah Menu Item

```tsx
// frontend/components/DashboardLayout.tsx
// Cari array menuItems, lalu tambah:

{
    id: '[nama-fitur]',
    label: '[Label Menu]',
    icon: '[emoji-icon]',
    path: '/dashboard/[nama-fitur]',
    // adminOnly: true,  // Uncomment jika hanya untuk admin
},
```

### 3. Tambah Route

```tsx
// frontend/App.tsx
// 1. Import halaman:
import Dashboard[NamaFitur]Page from './pages/Dashboard[NamaFitur]Page';

// 2. Tambah route di dalam <Route path="/dashboard" ...>:
<Route path="[nama-fitur]" element={<Dashboard[NamaFitur]Page />} />

// Atau jika admin-only:
<Route 
    path="[nama-fitur]" 
    element={
        <ProtectedRoute requireAdmin>
            <Dashboard[NamaFitur]Page />
        </ProtectedRoute>
    } 
/>
```

---

## 🎯 Contoh Praktis

### Contoh 1: Halaman Settings (Public)

**1. Halaman:**
```tsx
// frontend/pages/DashboardSettingsPage.tsx
import React from 'react';
import { COLORS } from '../utils/styles';

const DashboardSettingsPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                    Pengaturan
                </h2>
                <p className="text-soft-gray text-sm">
                    Kelola preferensi aplikasi Anda
                </p>
            </div>

            <div className="bg-navy-darker rounded-lg border border-light-slate/20 p-6">
                <p className="text-white">Settings page content</p>
            </div>
        </div>
    );
};

export default DashboardSettingsPage;
```

**2. Menu:**
```tsx
{
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/dashboard/settings',
},
```

**3. Route:**
```tsx
import DashboardSettingsPage from './pages/DashboardSettingsPage';

<Route path="settings" element={<DashboardSettingsPage />} />
```

---

### Contoh 2: Halaman Reports (Admin Only)

**1. Halaman:**
```tsx
// frontend/pages/DashboardReportsPage.tsx
import React from 'react';
import { COLORS } from '../utils/styles';

const DashboardReportsPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                    Laporan & Statistik
                </h2>
                <p className="text-soft-gray text-sm">
                    View laporan dan analitik (Admin Only)
                </p>
            </div>

            <div className="bg-navy-darker rounded-lg border border-light-slate/20 p-6">
                <p className="text-white">Reports content</p>
            </div>
        </div>
    );
};

export default DashboardReportsPage;
```

**2. Menu:**
```tsx
{
    id: 'reports',
    label: 'Reports',
    icon: '📊',
    path: '/dashboard/reports',
    adminOnly: true,  // ← Penting!
},
```

**3. Route:**
```tsx
import DashboardReportsPage from './pages/DashboardReportsPage';

<Route 
    path="reports" 
    element={
        <ProtectedRoute requireAdmin>
            <DashboardReportsPage />
        </ProtectedRoute>
    } 
/>
```

---

## 🎨 Icon Reference

Gunakan emoji atau icon library:

```tsx
// Emoji Icons (Copy & Paste)
'📝'  // Tasks, Notes, Writing
'👥'  // Users, People, Team
'📰'  // Articles, News, Blog
'⚙️'  // Settings, Configuration
'📊'  // Analytics, Reports, Charts
'🔔'  // Notifications, Alerts
'📁'  // Files, Documents
'🎨'  // Design, Themes, Styling
'🔐'  // Security, Admin, Lock
'💼'  // Business, Work
'📦'  // Products, Packages
'🎯'  // Goals, Targets
'📧'  // Email, Messages
'🏠'  // Home, Dashboard
'🚪'  // Logout, Exit
'❓'  // Help, Support
'🔍'  // Search
'📝'  // Forms, Input
```

---

## 🔗 API Integration Template

```tsx
// 1. Define types
interface MyData {
    id: number;
    name: string;
    // ... other fields
}

// 2. Create hooks (dalam hooks/useApi.ts)
export const useMyData = () => {
    return useQuery({
        queryKey: ['myData'],
        queryFn: async () => {
            const response = await apiClient.get('/api/my-data');
            return response.data;
        }
    });
};

export const useCreateMyData = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: Omit<MyData, 'id'>) => {
            const response = await apiClient.post('/api/my-data', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myData'] });
        }
    });
};

// 3. Use in component
const DashboardMyDataPage: React.FC = () => {
    const { data, isLoading, error } = useMyData();
    const createMutation = useCreateMyData();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* render data */}
        </div>
    );
};
```

---

## 🎨 Styling Classes Reference

```tsx
// Containers
"max-w-6xl mx-auto"                    // Max width container
"bg-navy-darker rounded-lg border border-light-slate/20 p-6"  // Card

// Text
"text-xl font-semibold text-white"     // Heading
"text-soft-gray text-sm"               // Description
"text-accent-blue"                     // Accent text

// Buttons
`px-4 py-2 ${COLORS.BG_ACCENT} text-white rounded-lg hover:bg-accent-blue/80 transition-colors`

// Spacing
"mb-6"     // Margin bottom
"space-y-4"  // Vertical spacing between children
"gap-3"    // Gap in flex/grid
```

---

## ✅ Checklist

Sebelum commit, pastikan:

- [ ] File page sudah dibuat dengan nama yang konsisten
- [ ] Menu item sudah ditambahkan di `DashboardLayout.tsx`
- [ ] Route sudah ditambahkan di `App.tsx`
- [ ] Import statements sudah benar
- [ ] TypeScript tidak ada error (cek dengan `npm run build`)
- [ ] Styling konsisten dengan halaman lain
- [ ] Admin-only page menggunakan `ProtectedRoute` dan `adminOnly: true`
- [ ] Test manual: navigasi, responsiveness, role access

---

## 🚀 Commands

```bash
# Check TypeScript errors
npm run build

# Run dev server
npm run dev

# Format code
npm run format  # jika ada prettier

# Lint
npm run lint    # jika ada eslint
```

---

## 📚 File Locations

```
frontend/
├── components/
│   ├── DashboardLayout.tsx    ← Edit untuk menu
│   └── ProtectedRoute.tsx     ← Untuk admin routes
├── pages/
│   └── Dashboard*.tsx         ← Buat page baru di sini
├── hooks/
│   └── useApi.ts              ← Tambah API hooks di sini
└── App.tsx                    ← Tambah routes di sini
```

---

**Pro Tip:** Bookmark file ini untuk referensi cepat! 🔖
