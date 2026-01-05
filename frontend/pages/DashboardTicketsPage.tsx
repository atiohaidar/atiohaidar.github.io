import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTickets, listTicketCategories, getTicketStats } from '../lib/api/services';
import type { Ticket, TicketCategory, TicketStats } from '../apiTypes';
import { COLORS } from '../utils/styles';
import { getStoredUser } from '../apiClient';
import { Card, Button, Select, Input, Typography, Heading, Text } from '../components/ui';

const DashboardTicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        categoryId: '',
        searchQuery: '',
    });
    const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

    useEffect(() => {
        const user = getStoredUser();
        if (user) {
            setCurrentUser(user);
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [ticketsData, categoriesData, statsData] = await Promise.all([
                listTickets(),
                listTicketCategories(),
                getTicketStats(),
            ]);
            setTickets(ticketsData);
            setCategories(categoriesData);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filters.status) params.status = filters.status;
            if (filters.categoryId) params.categoryId = Number(filters.categoryId);
            if (filters.searchQuery) params.searchQuery = filters.searchQuery;

            const ticketsData = await listTickets(params);
            setTickets(ticketsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to filter tickets');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100/80 text-blue-900 border-blue-300 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-700';
            case 'in_progress': return 'bg-yellow-100/80 text-yellow-900 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-100 dark:border-yellow-700';
            case 'waiting': return 'bg-orange-100/80 text-orange-900 border-orange-300 dark:bg-orange-900/50 dark:text-orange-100 dark:border-orange-700';
            case 'solved': return 'bg-green-100/80 text-green-900 border-green-300 dark:bg-green-900/50 dark:text-green-100 dark:border-green-700';
            default: return 'bg-gray-100/80 text-gray-900 border-gray-300 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Terbuka';
            case 'in_progress': return 'Dalam Proses';
            case 'waiting': return 'Menunggu';
            case 'solved': return 'Selesai';
            default: return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-gray-100/80 text-gray-900 border-gray-300 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600';
            case 'medium': return 'bg-blue-100/80 text-blue-900 border-blue-300 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-700';
            case 'high': return 'bg-orange-100/80 text-orange-900 border-orange-300 dark:bg-orange-900/50 dark:text-orange-100 dark:border-orange-700';
            case 'critical': return 'bg-red-100/80 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-700';
            default: return 'bg-gray-100/80 text-gray-900 border-gray-300 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Rendah';
            case 'medium': return 'Sedang';
            case 'high': return 'Tinggi';
            case 'critical': return 'Kritis';
            default: return priority;
        }
    };

    if (loading && !tickets.length) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
                <Text className={`text-xl animate-pulse ${COLORS.TEXT_PRIMARY}`}>Sedang membuka buku catatan...</Text>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <Heading level={1} className={`${COLORS.TEXT_PRIMARY}`}>Manajemen Tiket</Heading>
                <Button
                    variant="glass"
                    onClick={() => navigate('/dashboard')}
                    className={`${COLORS.TEXT_PRIMARY} font-bold font-patrick text-sm hover:scale-[1.02] transition-transform`}
                >
                    ← Kembali ke Dashboard
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-2 border-dashed border-red-300 font-patrick transform -rotate-1">
                    ⚠️ {error}
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card variant="glass" className={`p-4 text-center group`}>
                        <Heading level={2} className={`${COLORS.TEXT_PRIMARY} group-hover:scale-110 transition-transform`}>{stats.total}</Heading>
                        <Text variant="caption" className={`font-bold ${COLORS.TEXT_SECONDARY}`}>Total</Text>
                    </Card>
                    <Card variant="glass" className={`p-4 text-center group border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20`}>
                        <Heading level={2} className="text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">{stats.open}</Heading>
                        <Text variant="caption" className="font-bold text-blue-700 dark:text-blue-200">Terbuka</Text>
                    </Card>
                    <Card variant="glass" className={`p-4 text-center group border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20`}>
                        <Heading level={2} className="text-yellow-600 dark:text-yellow-300 group-hover:scale-110 transition-transform">{stats.in_progress}</Heading>
                        <Text variant="caption" className="font-bold text-yellow-700 dark:text-yellow-200">Proses</Text>
                    </Card>
                    <Card variant="glass" className={`p-4 text-center group border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20`}>
                        <Heading level={2} className="text-orange-600 dark:text-orange-300 group-hover:scale-110 transition-transform">{stats.waiting}</Heading>
                        <Text variant="caption" className="font-bold text-orange-700 dark:text-orange-200">Menunggu</Text>
                    </Card>
                    <Card variant="glass" className={`p-4 text-center group border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20`}>
                        <Heading level={2} className="text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform">{stats.solved}</Heading>
                        <Text variant="caption" className="font-bold text-green-700 dark:text-green-200">Selesai</Text>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card variant="glass" className={`p-6 mb-8 relative z-20 overflow-visible`}>
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full border-2 border-gray-400 bg-white dark:bg-slate-800 flex items-center justify-center text-xl font-bold shadow-sm z-30 transform -rotate-12">
                    🔍
                </div>
                <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4`}>Filter Data</Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Select
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            variant="glass"
                        >
                            <option value="" className="dark:bg-slate-800">Semua Status</option>
                            <option value="open" className="dark:bg-slate-800">Terbuka</option>
                            <option value="in_progress" className="dark:bg-slate-800">Dalam Proses</option>
                            <option value="waiting" className="dark:bg-slate-800">Menunggu</option>
                            <option value="solved" className="dark:bg-slate-800">Selesai</option>
                        </Select>
                    </div>

                    <div>
                        <Select
                            label="Kategori"
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            variant="glass"
                        >
                            <option value="" className="dark:bg-slate-800">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id} className="dark:bg-slate-800">
                                    {cat.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            label="Pencarian"
                            type="text"
                            variant="glass"
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                            placeholder="Cari judul..."
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        variant="glass"
                        onClick={handleFilterChange}
                        className={`${COLORS.TEXT_PRIMARY} font-bold font-patrick py-2 px-6`}
                    >
                        Terapkan Filter
                    </Button>
                </div>
            </Card>

            {/* Tickets List */}
            <Card variant="glass" className={`overflow-hidden p-0`}>
                {tickets.length === 0 ? (
                    <div className={`p-12 text-center text-xl`}>
                        <Text className={COLORS.TEXT_SECONDARY}>Tidak ada tiket yang ditemukan di halaman ini...</Text>
                        <p className="text-3xl mt-2">🍃</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={`bg-black/5 dark:bg-white/5 border-b-2 border-dashed ${COLORS.BORDER}`}>
                                <tr>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Token</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Judul</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Kategori</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Status</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Prioritas</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Ditangani</Typography>
                                    </th>
                                    <th className={`px-6 py-4`}>
                                        <Typography variant="caption" className={`font-bold ${COLORS.TEXT_PRIMARY}`}>Aksi</Typography>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className={`hover:bg-yellow-50 dark:hover:bg-white/5 cursor-pointer transition-colors group`}
                                        onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
                                    >
                                        <td className={`px-6 py-4 text-sm ${COLORS.TEXT_PRIMARY} font-mono tracking-wide`}>
                                            {ticket.token}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Typography variant="body" className={`text-base font-medium group-hover:text-blue-500 ${COLORS.TEXT_PRIMARY}`}>
                                                {ticket.title}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Typography variant="small" className={COLORS.TEXT_SECONDARY}>
                                                {ticket.category_name}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-md border text-xs font-bold font-patrick shadow-sm ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-md border text-xs font-bold font-patrick shadow-sm ${getPriorityColor(ticket.priority)}`}>
                                                {getPriorityLabel(ticket.priority)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Typography variant="body" className={COLORS.TEXT_SECONDARY}>
                                                {ticket.assigned_to ? `✍️ ${ticket.assigned_to}` : '-'}
                                            </Typography>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/tickets/${ticket.id}`);
                                                }}
                                                className={`text-blue-500 hover:text-blue-600 font-patrick font-bold hover:underline`}
                                            >
                                                Buka
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DashboardTicketsPage;
