import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useApi';
import { COLORS } from '../utils/styles';
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

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const filteredMenuItems = menuItems.filter(
        (item) => !item.adminOnly || user.role === 'admin'
    );

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`min-h-screen bg-light-bg dark:bg-deep-navy flex transition-colors duration-300`}>
            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } transition-all duration-300 border-r border-gray-200 dark:border-light-slate/20 flex flex-col bg-white dark:bg-deep-navy`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-light-slate/20 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <>
                            <h2 className="text-xl font-bold text-light-text dark:text-white">Dashboard</h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-light-muted dark:text-soft-gray hover:text-light-text dark:hover:text-white transition-colors"
                            >
                                ◀
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-light-muted dark:text-soft-gray hover:text-light-text dark:hover:text-white transition-colors mx-auto"
                        >
                            ▶
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-light-slate/20">
                    {isSidebarOpen ? (
                        <div>
                            <p className="text-light-text dark:text-white font-semibold truncate">{user.name}</p>
                            <p className="text-light-muted dark:text-soft-gray text-sm truncate">@{user.username}</p>
                            <span
                                className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                    user.role === 'admin'
                                        ? 'bg-light-accent/20 text-light-accent dark:bg-accent-blue/20 dark:text-accent-blue'
                                        : 'bg-gray-200 text-light-muted dark:bg-soft-gray/20 dark:text-soft-gray'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-light-accent/20 dark:bg-accent-blue/20 flex items-center justify-center text-light-accent dark:text-accent-blue font-bold mx-auto">
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
                                    ? 'bg-light-accent/20 text-light-accent dark:bg-accent-blue/20 dark:text-accent-blue'
                                    : 'text-light-muted dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-light-slate/10 hover:text-light-text dark:hover:text-white'
                            }`}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-light-slate/20 space-y-2">
                    {/* Theme Toggle */}
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center'}`}>
                        <ThemeToggle />
                    </div>
                    
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-light-muted dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-light-slate/10 hover:text-light-text dark:hover:text-white`}
                        title={!isSidebarOpen ? 'Landing Page' : undefined}
                    >
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span className="font-medium">Landing Page</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10`}
                        title={!isSidebarOpen ? 'Logout' : undefined}
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Top Header */}
                <header className="px-6 py-4 border-b border-gray-200 dark:border-light-slate/20 bg-white/80 dark:bg-navy-darker/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-light-text dark:text-white">
                                {filteredMenuItems.find((item) => isActive(item.path))?.label ||
                                    'Dashboard'}
                            </h1>
                            <p className="text-sm text-light-muted dark:text-soft-gray">
                                Kelola aplikasi Anda dengan mudah
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-deep-navy">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
