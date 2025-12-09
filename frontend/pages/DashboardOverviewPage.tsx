import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { getStoredUser } from '../apiClient';
import { useDashboardStats, useTickets, useEvents, useUser } from '../hooks/useApi';
import TransferModal from '../components/TransferModal';
import TopUpModal from '../components/TopUpModal';
import { useState } from 'react';

const DashboardOverviewPage: React.FC = () => {
    const { theme } = useTheme();
    const storedUser = getStoredUser();
    const { data: user } = useUser(storedUser?.username);
    const palette = DASHBOARD_THEME[theme];
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    // Fetch real data
    const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
    const { data: ticketsData, isLoading: isTicketsLoading } = useTickets();
    const { data: eventsData, isLoading: isEventsLoading } = useEvents();

    // Calculate stats
    const totalTasks = statsData?.totalTasks || 0;
    const pendingTickets = ticketsData?.filter(t => t.status !== 'solved').length || 0;
    const upcomingEventsCount = eventsData?.filter(e => new Date(e.event_date) > new Date()).length || 0;

    // Mock for now until chat API is ready in frontend
    const unreadMessages = 0;

    const stats = [
        {
            title: 'Total Tasks',
            value: isStatsLoading ? '...' : totalTasks.toString(),
            trend: 'Check tasks',
            icon: '📝',
            color: 'from-blue-500 to-cyan-400'
        },
        {
            title: 'Unread Messages',
            value: unreadMessages.toString(),
            trend: 'Chat system',
            icon: '💬',
            color: 'from-blue-600 to-indigo-500'
        },
        {
            title: 'Active Tickets',
            value: isTicketsLoading ? '...' : pendingTickets.toString(),
            trend: 'Open issues',
            icon: '🎫',
            color: 'from-orange-500 to-red-500'
        },
        {
            title: 'Upcoming Events',
            value: isEventsLoading ? '...' : upcomingEventsCount.toString(),
            trend: 'Next: Soon',
            icon: '🎉',
            color: 'from-teal-500 to-emerald-400'
        },
    ];

    // Combine recent activities
    const recentTickets = ticketsData?.slice(0, 3).map(t => ({
        id: `ticket-${t.id}`,
        type: 'Ticket',
        title: t.title,
        time: new Date(t.created_at || Date.now()).toLocaleDateString(),
        status: t.status
    })) || [];

    const recentEvents = eventsData?.slice(0, 2).map(e => ({
        id: `event-${e.id}`,
        type: 'Event',
        title: e.title,
        time: new Date(e.event_date).toLocaleDateString(),
        status: 'Upcoming'
    })) || [];

    // Simple merge and sort could be done here, but for now just show tickets as activity
    const recentActivities = [...recentTickets, ...recentEvents].slice(0, 5);

    // Get current greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl p-8 shadow-2xl">
                {/* Background Gradient Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-indigo-600/20 backdrop-blur-3xl z-0`} />
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className={`text-4xl md:text-5xl font-bold ${palette.panel.text} tracking-tight`}>
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user?.name || storedUser?.name}</span>
                        </h1>
                        <p className={`mt-2 text-lg ${palette.panel.textMuted}`}>
                            Here's what's happening with your projects today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-800'} backdrop-blur-md shadow-lg`}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance Card */}
                <div
                    className={`relative group p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1A2230]/60 border-white/5' : 'bg-white/60 border-gray-100'} backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
                >
                    <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-400 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 text-white shadow-lg`}>
                                    <span className="text-xl">💰</span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-green-100 text-green-700'}`}>
                                    Wallet
                                </div>
                            </div>
                            <h3 className={`text-3xl font-bold ${palette.panel.text} mb-1`}>
                                Rp {(user?.balance || 0).toLocaleString()}
                            </h3>
                            <p className={`text-sm font-medium ${palette.panel.textMuted}`}>Total Balance</p>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200/10">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setIsTopUpModalOpen(true)}
                                    className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95`}
                                >
                                    Top Up
                                </button>
                            )}
                            <button
                                onClick={() => setIsTransferModalOpen(true)}
                                className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg hover:shadow-green-500/20 active:scale-95`}
                            >
                                Transfer
                            </button>
                        </div>
                    </div>
                </div>

                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`relative group p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1A2230]/60 border-white/5' : 'bg-white/60 border-gray-100'} backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
                    >
                        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                    <span className="text-xl">{stat.icon}</span>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-black/5 text-gray-600'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className={`text-3xl font-bold ${palette.panel.text} mb-1`}>{stat.value}</h3>
                            <p className={`text-sm font-medium ${palette.panel.textMuted}`}>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                currentBalance={user?.balance || 0}
            />

            <TopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Chart / Large Widget */}
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#1A2230]/60 border-white/5' : 'bg-white/60 border-gray-100'} backdrop-blur-xl shadow-xl`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-xl font-bold ${palette.panel.text}`}>Productivity Overview</h2>
                        <select className={`bg-transparent border-none text-sm font-medium ${palette.panel.textMuted} focus:ring-0 cursor-pointer`}>
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    {/* Placeholder for Chart */}
                    <div className="h-64 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-dashed border-gray-500/20">
                        <p className={palette.panel.textMuted}>Chart Visualization Area</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#1A2230]/60 border-white/5' : 'bg-white/60 border-gray-100'} backdrop-blur-xl shadow-xl`}>
                    <h2 className={`text-xl font-bold ${palette.panel.text} mb-6`}>Recent Activity</h2>
                    <div className="space-y-6">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => (
                                <div key={activity.id} className="flex gap-4 items-start group">
                                    <div className={`mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]`} />
                                    <div>
                                        <h4 className={`text-sm font-medium ${palette.panel.text} group-hover:text-blue-400 transition-colors`}>
                                            {activity.title}
                                        </h4>
                                        <p className={`text-xs ${palette.panel.textMuted} mt-1`}>
                                            {activity.type} • {activity.time} • {activity.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={`text-sm ${palette.panel.textMuted}`}>No recent activity.</p>
                        )}
                    </div>

                    <button className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold transition-all ${theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        : 'bg-black/5 hover:bg-black/10 text-gray-800'
                        }`}>
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverviewPage;
