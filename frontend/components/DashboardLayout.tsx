import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useApi';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import SpyTooltip from './SpyTooltip';

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
        label: 'Overview',
        icon: '📊',
        path: '/dashboard',
    },
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
        label: 'User Management',
        icon: '👥',
        path: '/dashboard/users',
        adminOnly: true,
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: '💰',
        path: '/dashboard/finance',
        adminOnly: true,
    },
    {
        id: 'articles',
        label: 'Articles',
        icon: '📰',
        path: '/dashboard/articles',
    },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isLogoTooltipOpen, setIsLogoTooltipOpen] = useState(false);
    const logoRef = React.useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    const baseText = theme === 'light' ? 'text-[#1A2136]' : 'text-white';

    // Modern Glass Styles (Overrides basic utilities mostly)
    const glassPanel = theme === 'dark'
        ? 'bg-[#121721]/80 backdrop-blur-xl border border-white/5'
        : 'bg-white/80 backdrop-blur-xl border border-white/40';

    const navItemBase = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300';

    const handleLogout = () => {
        logout();
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
        <div className={`min-h-screen flex ${palette.appBg} ${baseText} transition-colors duration-500 overflow-hidden`}>
            {/* Ambient Background Gradient (Animated) */}
            <div className={`fixed inset-0 z-0 opacity-40 pointer-events-none`}>
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Floating & Glass on Desktop) */}
            <aside
                className={`fixed md:relative z-50 flex flex-col transition-all duration-300 ease-spring
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isSidebarOpen ? 'w-72' : 'w-24'}
                    h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:ml-4
                    rounded-r-3xl md:rounded-3xl shadow-2xl md:shadow-xl
                    ${glassPanel}
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between">
                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`md:hidden text-2xl ${palette.sidebar.toggleIcon}`}
                    >
                        ✕
                    </button>

                    {/* Logo Area */}
                    <div
                        ref={logoRef}
                        className={`flex items-center gap-3 relative ${!isSidebarOpen && 'md:justify-center w-full'}`}
                        onMouseEnter={() => setIsLogoTooltipOpen(true)}
                        onMouseLeave={() => setIsLogoTooltipOpen(false)}
                        onClick={() => setIsLogoTooltipOpen(!isLogoTooltipOpen)}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                            A
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden md:block'}`}>
                            <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                AtioHaidar
                            </h2>
                        </div>

                        <SpyTooltip
                            visible={isLogoTooltipOpen}
                            title="SYSTEM"
                            items={[
                                { label: 'APP', value: 'Dashboard' },
                                { label: 'VER', value: 'v2.5.0' },
                                { label: 'SEC', value: 'Encrypted' }
                            ]}
                            targetRef={logoRef}
                        />
                    </div>

                    {/* Desktop toggle */}
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={`hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/10 ${palette.sidebar.toggleIcon}`}
                        >
                            ◀
                        </button>
                    )}
                </div>

                {/* Collapsed Toggle (Centered) */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`hidden md:flex w-full items-center justify-center py-2 hover:text-white transition-colors text-gray-400`}
                    >
                        ▶
                    </button>
                )}

                {/* User Info Card */}
                <div className={`mx-4 mb-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} transition-all`}>
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${palette.sidebar.text}`}>{user.name}</p>
                                <p className={`text-xs truncate ${palette.sidebar.textMuted}`}>@{user.username}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-2">
                    {filteredMenuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className={`${navItemBase} ${active
                                    ? `bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]`
                                    : `text-gray-400 hover:bg-white/5 hover:text-gray-200`
                                    } ${isSidebarOpen ? 'justify-start' : 'justify-center'
                                    }`}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                <span className={`text-xl ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} transition-transform`}>{item.icon}</span>
                                {isSidebarOpen && (
                                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {active && isSidebarOpen && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 space-y-2 mt-auto">
                    <div className={`${isSidebarOpen ? 'px-2' : 'flex justify-center'}`}>
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={() => {
                            setIsMobileSidebarOpen(false);
                            handleLogout();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Logout' : undefined}
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area (Also Floating glass on Desktop) */}
            <main
                className={`
                    relative flex-1 flex flex-col 
                    min-h-[100dvh] md:h-[calc(100vh-2rem)] md:my-4 md:mr-4 md:ml-6
                    md:rounded-3xl shadow-2xl overflow-hidden
                    transition-all duration-300
                    ${theme === 'dark' ? 'bg-[#0D111A]/60' : 'bg-[#F3F4F6]/80'}
                    backdrop-blur-sm
                    z-10
                `}
            >
                {/* Top Header (Floating inside main) */}
                <header className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl border-b ${theme === 'dark' ? 'border-white/5 bg-[#0D111A]/80' : 'border-gray-200/50 bg-white/60'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden text-2xl p-2 rounded-lg hover:bg-white/10"
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {filteredMenuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell (Mock) */}
                        <button className={`p-2 rounded-full relative ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-600'}`}>
                            🔔
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-[#0D111A]"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600/20 scrollbar-track-transparent p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
