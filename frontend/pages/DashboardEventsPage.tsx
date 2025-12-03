import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { listEvents } from '../lib/api/services';
import { getStoredUser } from '../lib/api';
import { COLORS } from '../utils/styles';
import type { Event } from '../apiTypes';

const DashboardEventsPage: React.FC = () => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    const { data: events, isLoading, error, refetch } = useQuery({
        queryKey: ['events'],
        queryFn: listEvents,
    });

    const filterEvents = (events: Event[] | undefined) => {
        if (!events) return [];
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return events.filter(e => new Date(e.event_date) >= now);
            case 'past':
                return events.filter(e => new Date(e.event_date) < now);
            default:
                return events;
        }
    };

    const filteredEvents = filterEvents(events);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isUpcoming = (dateString: string) => {
        return new Date(dateString) >= new Date();
    };

    if (error) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                    <p className={`${COLORS.TEXT_ERROR}`}>Error: {(error as Error).message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                            Manajemen Acara
                        </h1>
                        <p className={COLORS.TEXT_SECONDARY}>
                            Kelola acara, pendaftaran, dan presensi peserta
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/events/new')}
                        className={`px-6 py-3 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} rounded-lg hover:opacity-90 transition-opacity`}
                    >
                        + Buat Acara Baru
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'all'
                                ? `${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST}`
                                : `${COLORS.BG_SECONDARY} ${COLORS.TEXT_SECONDARY} hover:${COLORS.BG_HOVER}`
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'upcoming'
                                ? `${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST}`
                                : `${COLORS.BG_SECONDARY} ${COLORS.TEXT_SECONDARY} hover:${COLORS.BG_HOVER}`
                        }`}
                    >
                        Akan Datang
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'past'
                                ? `${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST}`
                                : `${COLORS.BG_SECONDARY} ${COLORS.TEXT_SECONDARY} hover:${COLORS.BG_HOVER}`
                        }`}
                    >
                        Telah Lewat
                    </button>
                </div>

                {/* Events List */}
                {isLoading ? (
                    <div className={`${COLORS.BG_SECONDARY} p-8 rounded-lg border ${COLORS.BORDER} text-center`}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                        <p className={COLORS.TEXT_SECONDARY}>Memuat acara...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className={`${COLORS.BG_SECONDARY} p-8 rounded-lg border ${COLORS.BORDER} text-center`}>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-4`}>
                            {filter === 'all' ? 'Belum ada acara.' : `Tidak ada acara ${filter === 'upcoming' ? 'yang akan datang' : 'yang telah lewat'}.`}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/dashboard/events/new')}
                                className={`px-6 py-3 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} rounded-lg hover:opacity-90 transition-opacity`}
                            >
                                Buat Acara Pertama
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEvents.map((event) => {
                            const upcoming = isUpcoming(event.event_date);
                            const isCreator = user?.username === event.created_by;
                            
                            return (
                                <Link
                                    key={event.id}
                                    to={`/dashboard/events/${event.id}`}
                                    className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER} hover:${COLORS.BG_HOVER} transition-colors group`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-semibold ${COLORS.TEXT_PRIMARY} mb-1 group-hover:text-accent-blue transition-colors`}>
                                                {event.title}
                                            </h3>
                                            {isCreator && (
                                                <span className="inline-block px-2 py-1 text-xs bg-accent-blue text-white rounded">
                                                    Pembuat
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-2xl ${upcoming ? '' : 'opacity-50'}`}>
                                            {upcoming ? '🎉' : '📅'}
                                        </span>
                                    </div>
                                    
                                    {event.description && (
                                        <p className={`${COLORS.TEXT_SECONDARY} mb-4 line-clamp-2`}>
                                            {event.description}
                                        </p>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm">
                                            <span className="mr-2">📅</span>
                                            <span className={COLORS.TEXT_SECONDARY}>
                                                {formatDate(event.event_date)}
                                            </span>
                                        </div>
                                        
                                        {event.location && (
                                            <div className="flex items-center text-sm">
                                                <span className="mr-2">📍</span>
                                                <span className={COLORS.TEXT_SECONDARY}>
                                                    {event.location}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!upcoming && (
                                        <div className={`mt-4 pt-4 border-t ${COLORS.BORDER}`}>
                                            <span className="text-sm text-gray-500">
                                                Acara telah selesai
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardEventsPage;
