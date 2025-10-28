# Dashboard dengan Sidebar - Panduan Menambah Fitur Baru

## 📁 Struktur Dashboard Baru

Dashboard sekarang menggunakan **sidebar layout** yang memudahkan penambahan fitur baru. Strukturnya:

```
frontend/
├── components/
│   └── DashboardLayout.tsx      # Layout dengan sidebar
├── pages/
│   ├── DashboardPage.tsx        # Main wrapper untuk dashboard
│   ├── DashboardTasksPage.tsx   # Halaman Tasks
│   ├── DashboardUsersPage.tsx   # Halaman Users (Admin only)
│   └── DashboardArticlesPage.tsx # Halaman Articles (contoh)
└── App.tsx                      # Routing configuration
```

## ✨ Cara Menambah Fitur/Menu Baru

### Langkah 1: Buat Halaman Baru

Buat file baru di `frontend/pages/`, misalnya `DashboardSettingsPage.tsx`:

```tsx
import React from 'react';
import { COLORS } from '../utils/styles';

const DashboardSettingsPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Pengaturan</h2>
                <p className="text-soft-gray text-sm">
                    Kelola pengaturan aplikasi Anda
                </p>
            </div>

            <div className="bg-navy-darker rounded-lg border border-light-slate/20 p-6">
                {/* Konten halaman Anda di sini */}
                <p className="text-white">Halaman Settings</p>
            </div>
        </div>
    );
};

export default DashboardSettingsPage;
```

### Langkah 2: Tambahkan Menu di Sidebar

Edit `frontend/components/DashboardLayout.tsx`, tambahkan item menu baru di array `menuItems`:

```tsx
const menuItems: MenuItem[] = [
    {
        id: 'tasks',
        label: 'Todo List',
        icon: '📝',
        path: '/dashboard/tasks',
    },
    {
        id: 'users',
        label: 'User Management',
        icon: '👥',
        path: '/dashboard/users',
        adminOnly: true,
    },
    {
        id: 'articles',
        label: 'Articles',
        icon: '📰',
        path: '/dashboard/articles',
    },
    // ✅ Tambahkan menu baru di sini
    {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        path: '/dashboard/settings',
    },
];
```

### Langkah 3: Tambahkan Route

Edit `frontend/App.tsx`, tambahkan route baru:

```tsx
import DashboardSettingsPage from './pages/DashboardSettingsPage';

// ...

<Route path="/dashboard" element={<DashboardPage />}>
    <Route index element={<Navigate to="/dashboard/tasks" replace />} />
    <Route path="tasks" element={<DashboardTasksPage />} />
    <Route path="users" element={<DashboardUsersPage />} />
    <Route path="articles" element={<DashboardArticlesPage />} />
    {/* ✅ Tambahkan route baru di sini */}
    <Route path="settings" element={<DashboardSettingsPage />} />
</Route>
```

**Selesai!** Menu baru Anda akan muncul di sidebar dan bisa diakses.

## 🎨 Fitur Sidebar

### 1. **Collapsible Sidebar**
- Klik tombol `◀` / `▶` untuk collapse/expand
- Saat collapsed, hanya menampilkan icon
- Hover pada icon untuk melihat tooltip

### 2. **User Info**
- Menampilkan nama dan username user yang login
- Badge role (admin/user)
- Avatar dengan initial nama

### 3. **Active Menu Highlighting**
- Menu yang sedang aktif ditandai dengan background biru
- Otomatis highlight berdasarkan URL path

### 4. **Role-Based Access**
- Menu dengan `adminOnly: true` hanya muncul untuk admin
- Contoh: User Management

### 5. **Quick Navigation**
- Link ke Landing Page
- Tombol Logout

## 🔧 Customisasi

### Mengubah Icon Menu

Gunakan emoji atau icon library seperti React Icons:

```tsx
icon: '🎨',  // Emoji
icon: '⚙️',  // Emoji
// atau gunakan React Icons
```

### Membuat Sub-Menu

Untuk fitur lebih kompleks, Anda bisa extend `menuItems` dengan nested structure:

```tsx
interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    adminOnly?: boolean;
    children?: MenuItem[];  // Untuk sub-menu
}
```

### Mengatur Lebar Sidebar

Edit `DashboardLayout.tsx`:

```tsx
<aside className={`${
    isSidebarOpen ? 'w-64' : 'w-20'  // Ubah nilai ini
} transition-all duration-300 ...`}>
```

## 🚀 Integrasi dengan Backend API

Untuk menghubungkan halaman baru dengan backend API yang sudah ada:

### 1. Gunakan API Hooks

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../apiClient';

const DashboardArticlesPage: React.FC = () => {
    // Fetch data
    const { data: articles, isLoading } = useQuery({
        queryKey: ['articles'],
        queryFn: () => apiClient.get('/api/articles')
    });

    // Create/Update/Delete
    const createMutation = useMutation({
        mutationFn: (newArticle) => apiClient.post('/api/articles', newArticle),
        onSuccess: () => {
            // Refresh data
        }
    });

    return (
        // ... JSX
    );
};
```

### 2. Atau Gunakan Custom Hooks

Edit `frontend/hooks/useApi.ts` untuk menambah hooks baru:

```tsx
export const useArticles = () => {
    return useQuery({
        queryKey: ['articles'],
        queryFn: async () => {
            const response = await apiClient.get('/api/articles');
            return response.data;
        }
    });
};
```

## 📱 Responsive Design

Sidebar sudah responsive:
- Desktop: Sidebar selalu terlihat
- Tablet/Mobile: Bisa collapse untuk menghemat space
- Touch-friendly buttons

## 🎯 Best Practices

1. **Konsisten dengan Naming**: Gunakan format `Dashboard{Feature}Page.tsx`
2. **Reusable Components**: Pisahkan logic kompleks ke components terpisah
3. **Type Safety**: Selalu define TypeScript interfaces
4. **Error Handling**: Tambahkan error boundaries dan loading states
5. **Accessibility**: Gunakan semantic HTML dan ARIA labels

## 📚 Contoh Use Cases

### 1. Dashboard Analytics
```tsx
{
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    path: '/dashboard/analytics',
}
```

### 2. Dashboard Notifications
```tsx
{
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    path: '/dashboard/notifications',
}
```

### 3. Dashboard Profile
```tsx
{
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    path: '/dashboard/profile',
}
```

## 🐛 Troubleshooting

**Q: Menu baru tidak muncul?**
- Pastikan sudah menambahkan di `menuItems` array
- Check apakah ada `adminOnly` flag dan role user Anda

**Q: Route tidak berfungsi?**
- Pastikan path di `menuItems` sama dengan path di `App.tsx`
- Check console untuk error

**Q: Sidebar tidak responsive?**
- Pastikan Tailwind CSS sudah dikonfigurasi dengan benar
- Check browser console untuk CSS errors

---

## 🎉 Selamat!

Anda sekarang memiliki dashboard yang modular dan mudah dikembangkan. Tambahkan fitur sebanyak yang Anda mau dengan mengikuti 3 langkah sederhana di atas!
