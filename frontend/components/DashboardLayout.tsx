import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useApi';
import { COLORS, TYPOGRAPHY } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import SpyTooltip from './SpyTooltip';
import { useBackendLoader } from '../contexts/BackendLoaderContext';

// Get API base URL for server host display
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const parsedUrl = new URL(API_BASE_URL);
const serverHost = parsedUrl.host;
const isSecure = parsedUrl.protocol === 'https:';

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
        id: 'overview',
        label: 'Ringkasan',
        icon: '📊',
        path: '/dashboard',
    },
    {
        id: 'tasks',
        label: 'Daftar Tugas',
        icon: '📝',
        path: '/dashboard/tasks',
    },
    {
        id: 'chat',
        label: 'Obrolan',
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
        label: 'Pemesanan',
        icon: '📅',
        path: '/dashboard/bookings',
    },
    {
        id: 'forms',
        label: 'Formulir',
        icon: '📋',
        path: '/dashboard/forms',
    },
    {
        id: 'items',
        label: 'Barang',
        icon: '📦',
        path: '/dashboard/items',
    },
    {
        id: 'item-borrowings',
        label: 'Peminjaman Barang',
        icon: '🔄',
        path: '/dashboard/item-borrowings',
    },
    {
        id: 'tickets',
        label: 'Tiket',
        icon: '🎫',
        path: '/dashboard/tickets',
    },
    {
        id: 'events',
        label: 'Acara',
        icon: '🎉',
        path: '/dashboard/events',
    },
    {
        id: 'users',
        label: 'Manajemen Pengguna',
        icon: '👥',
        path: '/dashboard/users',
        adminOnly: true,
    },
    {
        id: 'finance',
        label: 'Keuangan',
        icon: '💰',
        path: '/dashboard/finance',
        adminOnly: true,
    },
    {
        id: 'articles',
        label: 'Artikel',
        icon: '📰',
        path: '/dashboard/articles',
    },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const { showLoader, updateLoader } = useBackendLoader(); // Use global hook
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isLogoTooltipOpen, setIsLogoTooltipOpen] = useState(false);
    const logoRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    // Determine current section title
    const currentMenuItem = menuItems.find((item) => {
        if (item.path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(item.path);
    });
    const pageTitle = currentMenuItem?.label || 'Dashboard';

    const handleLogout = async () => {
        const startTime = performance.now();

        // Show global loader immediately
        showLoader({
            title: "Keluar",
            subtitle: "Mengakhiri sesi Anda",
            endpoint: "/api/auth/logout",
            method: "POST",
            serverHost: serverHost,
            isSecure: isSecure,
            completeDelay: 500, // Short delay to see success
        });

        // Simulate a small delay for animation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Perform actual logout logic
        const latency = Math.round(performance.now() - startTime);
        logout();

        // Update loader to success state
        updateLoader({
            status: 'success',
            actualLatency: latency,
            actualStatusCode: 200,
            successMessage: "Sampai jumpa lagi."
        });

        // Navigate immediately behind the loader!
        navigate('/login', { replace: true });
    };

    const filteredMenuItems = menuItems.filter(
        (item) => !item.adminOnly || user.role === 'admin'
    );

    const isActive = (path: string) => {
        // Handle root dashboard path specially to avoid matching everything
        if (path === '/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`min-h-screen flex ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} transition-colors duration-500 overflow-hidden relative`}>
            {/* Notebook Lines Overlay for the whole dashboard background */}
            <div className="absolute inset-0 notebook-lines opacity-10 pointer-events-none z-0"></div>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in-up"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Note: styling as a notebook margin/binder) */}
            <aside
                className={`fixed md:relative z-50 flex flex-col transition-all duration-300 ease-spring
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isSidebarOpen ? 'w-72' : 'w-24'}
                    h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:ml-4
                    rounded-r-xl md:rounded-2xl border-r-2 md:border-2 border-dashed ${COLORS.BORDER}
                    ${theme === 'dark' ? 'bg-slate-900' : 'bg-white/90'}
                    shadow-xl
                    animate-slide-in-left animation-delay-200
                    overflow-hidden
                `}
            >
                {/* Spiral/Binder holes visual (Left side) */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-evenly py-4 pointer-events-none opacity-50 z-0 border-r border-dashed border-gray-300 dark:border-gray-700">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} border border-gray-400 dark:border-gray-600`}></div>
                    ))}
                </div>

                {/* Sidebar Header */}
                <div className={`p-6 flex items-center justify-between relative z-10 ${isSidebarOpen ? 'pl-10' : 'pl-2 justify-center'}`}>
                    {/* Logo Area */}
                    <div
                        ref={logoRef}
                        className={`flex items-center gap-3 relative cursor-pointer group`}
                        onMouseEnter={() => setIsLogoTooltipOpen(true)}
                        onMouseLeave={() => setIsLogoTooltipOpen(false)}
                        onClick={() => setIsLogoTooltipOpen(!isLogoTooltipOpen)}
                    >
                        <div className={`w-10 h-10 rounded-lg border-2 border-dashed ${COLORS.BORDER} flex items-center justify-center font-bold text-xl group-hover:rotate-6 transition-transform shadow-sm`}>
                            <span className="font-patrick text-blue-500 dark:text-blue-400">AH</span>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden md:block'}`}>
                            <h2 className={`${TYPOGRAPHY.HEADING_SECTION} text-lg whitespace-nowrap`}>
                                AtioHaidar
                            </h2>
                        </div>

                        <SpyTooltip
                            visible={isLogoTooltipOpen}
                            title="SYSTEM"
                            items={[
                                { label: 'APP', value: 'Dashboard' },
                                { label: 'VER', value: 'NB-Theme' },
                                { label: 'SEC', value: 'Active' }
                            ]}
                            targetRef={logoRef}
                        />
                    </div>

                    {/* Desktop toggle */}
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={`hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${COLORS.TEXT_SECONDARY}`}
                        >
                            ◀
                        </button>
                    )}

                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`md:hidden text-2xl p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${COLORS.TEXT_PRIMARY}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Collapsed Toggle (Center) */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`hidden md:flex w-full items-center justify-center py-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${COLORS.TEXT_SECONDARY}`}
                    >
                        ▶
                    </button>
                )}

                {/* User Info Card (Sticker Style) */}
                <div className={`mx-4 mb-4 p-3 rounded-xl border-2 border-dashed ${COLORS.BORDER} ${theme === 'dark' ? 'bg-white/5' : 'bg-yellow-50'} transform rotate-1 transition-all hover:rotate-0 relative z-10 ${!isSidebarOpen && 'mx-2 p-2'}`}>
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 ${COLORS.BORDER} flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} text-sm font-bold shadow-sm`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm truncate font-patrick ${COLORS.TEXT_PRIMARY}`}>{user.name}</p>
                                <p className={`text-xs truncate font-mono ${COLORS.TEXT_SECONDARY}`}>@{user.username}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent py-2 relative z-10 pl-8">
                    {filteredMenuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-patrick text-lg
                                    ${active
                                        ? `${COLORS.TEXT_ACCENT} font-bold bg-blue-50 dark:bg-blue-900/20 md:translate-x-1 border-l-4 border-blue-400`
                                        : `${COLORS.TEXT_SECONDARY} hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5`
                                    }
                                    ${isSidebarOpen ? 'justify-start' : 'justify-center px-0'}
                                `}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                <span className={`text-xl ${active ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                                {isSidebarOpen && (
                                    <span className="whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 space-y-3 mt-auto relative z-10 pl-8">
                    <div className={`${isSidebarOpen ? 'px-2' : 'flex justify-center'}`}>
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={() => {
                            setIsMobileSidebarOpen(false);
                            handleLogout();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-patrick font-bold ${!isSidebarOpen && 'justify-center px-0'}`}
                        title={!isSidebarOpen ? 'Logout' : undefined}
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`
                    relative flex-1 flex flex-col 
                    min-h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-2
                    md:rounded-2xl overflow-hidden
                    transition-all duration-300
                    ${theme === 'dark' ? 'bg-[#151a23]/90' : 'bg-white/80'}
                    border-2 border-dashed ${COLORS.BORDER}
                    md:shadow-xl
                    z-10
                    animate-fade-in-up animation-delay-500 opacity-0
                `}
            >
                {/* Top Header (Paper Header) */}
                <header className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md border-b-2 border-dotted ${COLORS.BORDER} bg-opacity-90 ${theme === 'dark' ? 'bg-[#0D111A]' : 'bg-white'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className={`md:hidden text-2xl p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${COLORS.TEXT_PRIMARY}`}
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                                {pageTitle}
                                <span className="hidden sm:inline-block w-8 h-0.5 bg-gray-300 dark:bg-gray-700 mx-2"></span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 font-caveat tracking-wide">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell (Mock) */}
                        <button className={`p-2 rounded-full relative hover:scale-110 transition-transform ${COLORS.TEXT_SECONDARY}`}>
                            🔔
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-black animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent p-4 md:p-8">
                    {/* Inner Paper background visual */}
                    <div className="absolute inset-0 notebook-lines opacity-5 pointer-events-none -z-10"></div>
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
