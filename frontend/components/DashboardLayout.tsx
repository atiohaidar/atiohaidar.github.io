import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useApi';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface StoredUser {
    username: string;
    name: string;
    role: string;
}

interface DashboardLayoutProps {
    user: StoredUser;
    children: React.ReactNode;
}

interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
    {
        id: 'tasks',
        label: 'Todo List',
        icon: '📝',
        path: '/dashboard/tasks',
    },
    {
        id: 'chat',
        label: 'Chat',
        icon: '💬',
        path: '/dashboard/chat',
    },
    {
        id: 'rooms',
        label: 'Ruangan',
        icon: '🏢',
        path: '/dashboard/rooms',
    },
    {
        id: 'bookings',
        label: 'Booking',
        icon: '📅',
        path: '/dashboard/bookings',
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
    // Mudah untuk menambah menu baru di sini
    // {
    //     id: 'settings',
    //     label: 'Settings',
    //     icon: '⚙️',
    //     path: '/dashboard/settings',
    // },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    const baseText = theme === 'light' ? 'text-[#1A2136]' : 'text-white';
    const accentText = palette.sidebar.textMuted;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const filteredMenuItems = menuItems.filter(
        (item) => !item.adminOnly || user.role === 'admin'
    );

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`min-h-screen flex transition-colors duration-300 ${palette.appBg} ${baseText}`}>
            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } transition-all duration-300 flex flex-col ${palette.sidebar.bg} ${palette.sidebar.border}`}
            >
                {/* Sidebar Header */}
                <div className={`p-4 flex items-center justify-between ${palette.sidebar.border}`}>
                    {isSidebarOpen ? (
                        <>
                            <h2 className={`text-xl font-bold ${palette.sidebar.text}`}>Dashboard</h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className={`transition-colors ${palette.sidebar.toggleIcon}`}
                            >
                                ◀
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`transition-colors mx-auto ${palette.sidebar.toggleIcon}`}
                        >
                            ▶
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div className={`p-4 ${palette.sidebar.border}`}>
                    {isSidebarOpen ? (
                        <div>
                            <p className={`font-semibold truncate ${palette.sidebar.text}`}>{user.name}</p>
                            <p className={`text-sm truncate ${palette.sidebar.textMuted}`}>@{user.username}</p>
                            <span
                                className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                    user.role === 'admin'
                                        ? palette.sidebar.badgeAdmin
                                        : palette.sidebar.badgeDefault
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className={`w-10 h-10 rounded-full bg-accent-blue/20 text-accent-blue font-bold mx-auto flex items-center justify-center`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredMenuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive(item.path)
                                    ? palette.sidebar.linkActive
                                    : `${palette.sidebar.linkBase} ${palette.sidebar.linkHover}`
                            }`}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className={`p-4 space-y-2 ${palette.sidebar.border}`}>
                    {/* Theme Toggle */}
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center'}`}>
                        <ThemeToggle />
                    </div>
                    
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${palette.sidebar.linkBase} ${palette.sidebar.linkHover}`}
                        title={!isSidebarOpen ? 'Landing Page' : undefined}
                    >
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span className="font-medium">Landing Page</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/20"
                        title={!isSidebarOpen ? 'Logout' : undefined}
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden ${palette.contentBg}`}>
                {/* Top Header */}
                <header className={`px-6 py-4 backdrop-blur-sm sticky top-0 z-10 ${palette.header.bg} ${palette.header.border}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold ${palette.sidebar.text}`}>
                                {filteredMenuItems.find((item) => isActive(item.path))?.label ||
                                    'Dashboard'}
                            </h1>
                            <p className={`text-sm ${palette.header.subtitle}`}>
                                Kelola aplikasi Anda dengan mudah
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
