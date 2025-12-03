import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTickets, listTicketCategories, getTicketStats } from '../lib/api/services';
import type { Ticket, TicketCategory, TicketStats } from '../apiTypes';
import { COLORS } from '../utils/styles';
import { getStoredUser } from '../lib/api';

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
            case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            case 'waiting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
            case 'solved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
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
            case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
            case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
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
            <div className="container mx-auto px-4 py-8">
                <div className={`text-center ${COLORS.TEXT_PRIMARY}`}>Memuat tiket...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY}`}>Manajemen Tiket</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`px-4 py-2 rounded-lg ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} hover:opacity-80 transition-opacity`}
                >
                    ← Kembali ke Dashboard
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-4 text-center border ${COLORS.BORDER}`}>
                        <div className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY}`}>{stats.total}</div>
                        <div className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Total</div>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-4 text-center border ${COLORS.BORDER}`}>
                        <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
                        <div className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Terbuka</div>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-4 text-center border ${COLORS.BORDER}`}>
                        <div className="text-3xl font-bold text-yellow-600">{stats.in_progress}</div>
                        <div className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Proses</div>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-4 text-center border ${COLORS.BORDER}`}>
                        <div className="text-3xl font-bold text-orange-600">{stats.waiting}</div>
                        <div className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Menunggu</div>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-4 text-center border ${COLORS.BORDER}`}>
                        <div className="text-3xl font-bold text-green-600">{stats.solved}</div>
                        <div className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Selesai</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 mb-6 border ${COLORS.BORDER}`}>
                <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>Filter</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 text-sm font-medium`}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                        >
                            <option value="">Semua Status</option>
                            <option value="open">Terbuka</option>
                            <option value="in_progress">Dalam Proses</option>
                            <option value="waiting">Menunggu</option>
                            <option value="solved">Selesai</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 text-sm font-medium`}>
                            Kategori
                        </label>
                        <select
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 text-sm font-medium`}>
                            Pencarian
                        </label>
                        <input
                            type="text"
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                            placeholder="Cari tiket..."
                            className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleFilterChange}
                        className={`px-6 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity`}
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {/* Tickets List */}
            <div className={`${COLORS.BG_SECONDARY} rounded-lg border ${COLORS.BORDER}`}>
                {tickets.length === 0 ? (
                    <div className={`p-8 text-center ${COLORS.TEXT_SECONDARY}`}>
                        Tidak ada tiket ditemukan
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${COLORS.BG_PRIMARY} border-b ${COLORS.BORDER}`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Token
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Judul
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Kategori
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Status
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Prioritas
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Ditangani
                                    </th>
                                    <th className={`px-6 py-3 text-left text-sm font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className={`border-b ${COLORS.BORDER} hover:bg-opacity-50 hover:${COLORS.BG_PRIMARY} cursor-pointer transition-colors`}
                                        onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
                                    >
                                        <td className={`px-6 py-4 text-sm ${COLORS.TEXT_PRIMARY} font-mono`}>
                                            {ticket.token}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${COLORS.TEXT_PRIMARY}`}>
                                            {ticket.title}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${COLORS.TEXT_SECONDARY}`}>
                                            {ticket.category_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                                                {getPriorityLabel(ticket.priority)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${COLORS.TEXT_SECONDARY}`}>
                                            {ticket.assigned_to || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/tickets/${ticket.id}`);
                                                }}
                                                className={`${COLORS.TEXT_ACCENT} hover:underline`}
                                            >
                                                Detail →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTicketsPage;
