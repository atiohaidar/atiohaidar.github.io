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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } transition-all duration-300 flex flex-col ${palette.sidebar.bg} ${palette.sidebar.border}
                fixed md:static inset-y-0 left-0 z-50
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:w-64 md:${isSidebarOpen ? 'w-64' : 'w-20'}`}
            >
                {/* Sidebar Header */}
                <div className={`p-4 flex items-center justify-between ${palette.sidebar.border}`}>
                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`md:hidden text-2xl ${palette.sidebar.toggleIcon}`}
                    >
                        ✕
                    </button>

                    {/* Desktop toggle */}
                    {isSidebarOpen ? (
                        <div className="hidden md:flex items-center justify-between w-full">
                            <h2 className={`text-xl font-bold ${palette.sidebar.text}`}>Dashboard</h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className={`transition-colors ${palette.sidebar.toggleIcon}`}
                            >
                                ◀
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`hidden md:block transition-colors mx-auto ${palette.sidebar.toggleIcon}`}
                        >
                            ▶
                        </button>
                    )}

                    {/* Mobile: Always show Dashboard title */}
                    <h2 className={`md:hidden text-xl font-bold ${palette.sidebar.text} flex-1 text-center`}>Dashboard</h2>
                    <div className="md:hidden w-8"></div> {/* Spacer for centering */}
                </div>

                {/* User Info */}
                <div className={`p-4 ${palette.sidebar.border}`}>
                    {/* On mobile, always show full info */}
                    <div className="md:hidden">
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

                    {/* On desktop, responsive to sidebar state */}
                    <div className="hidden md:block">
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
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive(item.path)
                                    ? palette.sidebar.linkActive
                                    : `${palette.sidebar.linkBase} ${palette.sidebar.linkHover}`
                            }`}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className={`font-medium ${isSidebarOpen ? '' : 'md:hidden'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className={`p-4 space-y-2 ${palette.sidebar.border}`}>
                    {/* Theme Toggle */}
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'md:justify-center justify-start px-4'}`}>
                        <ThemeToggle />
                    </div>
                    
                    <Link
                        to="/"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${palette.sidebar.linkBase} ${palette.sidebar.linkHover}`}
                        title={!isSidebarOpen ? 'Landing Page' : undefined}
                    >
                        <span className="text-xl">🏠</span>
                        <span className={`font-medium ${isSidebarOpen ? '' : 'md:hidden'}`}>Landing Page</span>
                    </Link>
                    <button
                        onClick={() => {
                            setIsMobileSidebarOpen(false);
                            handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/20"
                        title={!isSidebarOpen ? 'Logout' : undefined}
                    >
                        <span className="text-xl">🚪</span>
                        <span className={`font-medium ${isSidebarOpen ? '' : 'md:hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden ${palette.contentBg} w-full md:w-auto`}>
                {/* Top Header */}
                <header className={`px-4 md:px-6 py-4 backdrop-blur-sm sticky top-0 z-10 ${palette.header.bg} ${palette.header.border}`}>
                    <div className="flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden text-2xl mr-3"
                        >
                            ☰
                        </button>

                        <div className="flex-1">
                            <h1 className={`text-xl md:text-2xl font-bold ${palette.sidebar.text}`}>
                                {filteredMenuItems.find((item) => isActive(item.path))?.label ||
                                    'Dashboard'}
                            </h1>
                            <p className={`text-xs md:text-sm ${palette.header.subtitle}`}>
                                Kelola aplikasi Anda dengan mudah
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
