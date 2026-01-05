import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/styles';
import { getStoredUser } from '../apiClient';
import { useDashboardStats, useTickets, useEvents, useUser } from '../hooks/useApi';
import TransferModal from '../components/TransferModal';
import TopUpModal from '../components/TopUpModal';
import { Card, Button, Select, Typography, Heading, Text } from '../components/ui';

const DashboardOverviewPage: React.FC = () => {
    const { theme } = useTheme();
    const storedUser = getStoredUser();
    const { data: user } = useUser(storedUser?.username);
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

    const stats = [
        {
            title: 'Total Tugas',
            value: isStatsLoading ? '...' : totalTasks.toString(),
            trend: 'Cek tugas',
            icon: '📝',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            borderColor: 'border-blue-300 dark:border-blue-700',
            textColor: 'text-blue-800 dark:text-blue-200'
        },
        {
            title: 'Tiket Aktif',
            value: isTicketsLoading ? '...' : pendingTickets.toString(),
            trend: 'Masalah terbuka',
            icon: '🎫',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            borderColor: 'border-orange-300 dark:border-orange-700',
            textColor: 'text-orange-800 dark:text-orange-200'
        },
        {
            title: 'Acara Mendatang',
            value: isEventsLoading ? '...' : upcomingEventsCount.toString(),
            trend: 'Segera',
            icon: '🎉',
            bgColor: 'bg-teal-100 dark:bg-teal-900/30',
            borderColor: 'border-teal-300 dark:border-teal-700',
            textColor: 'text-teal-800 dark:text-teal-200'
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
        status: 'Mendatang'
    })) || [];

    const recentActivities = [...recentTickets, ...recentEvents].slice(0, 5);

    // Get current greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Sore';

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className={`relative overflow-hidden rounded-xl p-8 shadow-sm border-b-2 border-dashed ${COLORS.BORDER}`}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Heading level={1} className={`${COLORS.TEXT_PRIMARY} tracking-tight`}>
                            {greeting}, <br className="md:hidden" />
                            <span className="relative inline-block ml-0 md:ml-2">
                                <span className={`${COLORS.TEXT_ACCENT}`}>
                                    {user?.name || storedUser?.name}
                                </span>
                                <span className="absolute -bottom-1 left-0 w-full h-3 bg-yellow-300/40 dark:bg-yellow-600/30 -z-10 hand-drawn-underline"></span>
                            </span>
                        </Heading>
                        <Text variant="h4" as="p" className={`mt-2 ${COLORS.TEXT_SECONDARY}`}>
                            Jadi inilah yang terjadi hari ini, have a nice day!
                        </Text>
                    </div>
                    <div className="flex gap-3 transform -rotate-2">
                        <span className={`px-4 py-2 rounded-lg text-lg font-patrick border-2 border-dashed ${COLORS.BORDER} bg-white/50 dark:bg-black/20 shadow-sm`}>
                            📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance Card (Special styling) */}
                <Card variant="glass" className="relative group overflow-hidden p-6">
                    {/* Sticker effect */}
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg border-2 border-green-500 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 shadow-sm`}>
                                    <span className="text-xl">💰</span>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-xs font-bold font-mono border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300`}>
                                    DOMPET
                                </div>
                            </div>
                            <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-1 tracking-wide`}>
                                Rp {(user?.balance || 0).toLocaleString()}
                            </Heading>
                            <Text variant="caption" className={`font-bold ${COLORS.TEXT_SECONDARY}`}>Total Saldo</Text>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                            {user?.role === 'admin' && (
                                <Button
                                    variant="glass"
                                    onClick={() => setIsTopUpModalOpen(true)}
                                    className={`flex-1 text-xs font-bold !bg-purple-50 hover:!bg-purple-100 dark:!bg-purple-900/20 dark:hover:!bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700`}
                                >
                                    Top Up
                                </Button>
                            )}
                            <Button
                                variant="glass"
                                onClick={() => setIsTransferModalOpen(true)}
                                className={`flex-1 text-xs font-bold !bg-green-50 hover:!bg-green-100 dark:!bg-green-900/20 dark:hover:!bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700`}
                            >
                                Transfer
                            </Button>
                        </div>
                    </div>
                </Card>

                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        variant="glass"
                        className={`p-6 relative group hover:-translate-y-1 transition-transform duration-300`}
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg border-2 ${stat.borderColor} ${stat.bgColor} ${stat.textColor} shadow-sm`}>
                                    <span className="text-xl">{stat.icon}</span>
                                </div>
                                <span className={`text-xs font-bold font-mono px-2 py-1 rounded-md border border-dashed ${COLORS.BORDER} bg-gray-50 dark:bg-white/5`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-1`}>{stat.value}</Heading>
                            <Text variant="caption" className={`font-bold ${COLORS.TEXT_SECONDARY}`}>{stat.title}</Text>
                        </div>
                    </Card>
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
                <Card variant="glass" className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-gray-400/30 pb-2">
                        <Heading level={2} className={`${COLORS.TEXT_PRIMARY}`}>Ringkasan Produktivitas</Heading>
                        <Select
                            variant="glass"
                            containerClassName="w-auto"
                            className={`border-none !border-b-0 text-sm font-bold font-patrick ${COLORS.TEXT_SECONDARY} focus:ring-0 cursor-pointer hover:text-blue-500`}
                        >
                            <option>Minggu Ini</option>
                            <option>Minggu Lalu</option>
                        </Select>
                    </div>
                    {/* Placeholder for Chart */}
                    <div className="h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 notebook-lines opacity-20 pointer-events-none"></div>
                        <Typography variant="h3" className={`${COLORS.TEXT_SECONDARY} transform -rotate-3`}>
                            Akan segera hadir... ✏️
                        </Typography>
                        <Text variant="caption" className={`mt-2 ${COLORS.TEXT_MUTED} font-mono`}>Area Visualisasi Grafik</Text>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card variant="glass" className="p-6 relative">
                    {/* Tape decoration */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-yellow-200/80 dark:bg-yellow-800/50 shadow-sm rotate-1 z-20"></div>

                    <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-6 text-center mt-2`}>Aktivitas Terbaru</Heading>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => (
                                <div key={activity.id} className={`flex gap-4 items-start group p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0`}>
                                    <div className={`mt-1 w-3 h-3 rounded-full border border-gray-400 ${activity.type === 'Ticket' ? 'bg-orange-400' : 'bg-blue-400'} shadow-sm`} />
                                    <div>
                                        <Heading level={4} className={`${COLORS.TEXT_PRIMARY} group-hover:text-blue-500 transition-colors leading-tight`}>
                                            {activity.title}
                                        </Heading>
                                        <Text variant="caption" className={`${COLORS.TEXT_SECONDARY} mt-1 font-mono opacity-80`}>
                                            {activity.type} • {activity.time}
                                        </Text>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Text className={`text-center py-8 text-xl ${COLORS.TEXT_SECONDARY}`}>Tidak ada aktivitas terbaru.</Text>
                        )}
                    </div>

                    <Button variant="glass" className="mt-8 w-full font-bold font-patrick py-3">
                        Lihat Semua Aktivitas
                    </Button>
                </Card>
            </div>
        </div >
    );
};

export default DashboardOverviewPage;
