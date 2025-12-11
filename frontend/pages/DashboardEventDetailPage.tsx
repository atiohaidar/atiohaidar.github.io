import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
    getEvent,
    deleteEvent,
    listEventAttendees,
    registerForEvent,
    updateAttendeeStatus,
    unregisterFromEvent,
    listEventAdmins,
    assignEventAdmin,
    removeEventAdmin,
} from '../lib/api/services';
import { getStoredUser } from '../apiClient';
import { COLORS } from '../utils/styles';
import type { EventAttendee, EventAdmin, AttendeeStatus } from '../apiTypes';

const DashboardEventDetailPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = getStoredUser();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [newAdminUsername, setNewAdminUsername] = useState('');

    // Fetch event data
    const { data: event, isLoading: loadingEvent } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEvent(eventId!),
        enabled: !!eventId,
    });

    // Fetch attendees
    const { data: attendees, isLoading: loadingAttendees } = useQuery({
        queryKey: ['event-attendees', eventId],
        queryFn: () => listEventAttendees(eventId!),
        enabled: !!eventId,
    });

    // Fetch admins
    const { data: admins, isLoading: loadingAdmins } = useQuery({
        queryKey: ['event-admins', eventId],
        queryFn: () => listEventAdmins(eventId!),
        enabled: !!eventId,
    });

    // Check if current user is registered
    const currentUserAttendee = attendees?.find(a => a.user_username === user?.username);
    const isRegistered = !!currentUserAttendee;

    // Check if current user is admin/creator
    const isCreator = user?.username === event?.created_by;
    const isAdmin = user?.role === 'admin';
    const isEventAdmin = admins?.some(a => a.user_username === user?.username);
    const canManage = isCreator || isAdmin || isEventAdmin;

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: () => registerForEvent(eventId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
        },
    });

    // Unregister mutation
    const unregisterMutation = useMutation({
        mutationFn: (attendeeId: string) => unregisterFromEvent(eventId!, attendeeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ attendeeId, status }: { attendeeId: string; status: AttendeeStatus }) =>
            updateAttendeeStatus(eventId!, attendeeId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
        },
    });

    // Delete event mutation
    const deleteMutation = useMutation({
        mutationFn: () => deleteEvent(eventId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            navigate('/dashboard/events');
        },
    });

    // Assign admin mutation
    const assignAdminMutation = useMutation({
        mutationFn: (username: string) => assignEventAdmin(eventId!, username),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-admins', eventId] });
            setShowAdminModal(false);
            setNewAdminUsername('');
        },
    });

    // Remove admin mutation
    const removeAdminMutation = useMutation({
        mutationFn: (username: string) => removeEventAdmin(eventId!, username),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-admins', eventId] });
        },
    });

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

    const getStatusColor = (status: AttendeeStatus) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'absent':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusText = (status: AttendeeStatus) => {
        switch (status) {
            case 'present':
                return 'Hadir';
            case 'absent':
                return 'Tidak Hadir';
            default:
                return 'Terdaftar';
        }
    };

    const handleShowQR = (attendee: EventAttendee) => {
        setSelectedAttendee(attendee);
        setShowQRModal(true);
    };

    const handleDownloadQR = () => {
        if (!selectedAttendee) return;

        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `qr-${selectedAttendee.user_username}-${eventId}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (loadingEvent || loadingAttendees || loadingAdmins) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
                <div className={`${COLORS.BG_SECONDARY} p-8 rounded-lg border ${COLORS.BORDER} text-center`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p className={COLORS.TEXT_SECONDARY}>Memuat detail acara...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
                <div className={`${COLORS.BG_SECONDARY} p-8 rounded-lg border ${COLORS.BORDER} text-center`}>
                    <p className="text-red-500">Acara tidak ditemukan</p>
                </div>
            </div>
        );
    }

    const stats = {
        total: attendees?.length || 0,
        present: attendees?.filter(a => a.status === 'present').length || 0,
        registered: attendees?.filter(a => a.status === 'registered').length || 0,
    };

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard/events')}
                        className={`${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_PRIMARY} mb-4 flex items-center`}
                    >
                        ← Kembali ke Daftar Acara
                    </button>

                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {isCreator && (
                                    <span className="px-3 py-1 bg-accent-blue text-white rounded-full text-sm">
                                        Pembuat Acara
                                    </span>
                                )}
                                {isEventAdmin && !isCreator && (
                                    <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                                        Admin Acara
                                    </span>
                                )}
                                {isRegistered && (
                                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                                        Anda Terdaftar
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {!isRegistered && (
                                <button
                                    onClick={() => registerMutation.mutate()}
                                    disabled={registerMutation.isPending}
                                    className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50`}
                                >
                                    {registerMutation.isPending ? 'Mendaftar...' : 'Daftar Acara'}
                                </button>
                            )}
                            {isRegistered && currentUserAttendee && (
                                <button
                                    onClick={() => handleShowQR(currentUserAttendee)}
                                    className={`px-4 py-2 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ON_ACCENT} rounded-lg hover:opacity-90 transition-opacity`}
                                >
                                    Lihat QR Code Saya
                                </button>
                            )}
                            {canManage && (
                                <>
                                    <Link
                                        to={`/dashboard/events/${eventId}/edit`}
                                        className={`px-4 py-2 ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 border ${COLORS.BORDER}`}
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        to={`/dashboard/events/${eventId}/scan`}
                                        className={`px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors`}
                                    >
                                        Scan QR
                                    </Link>
                                    <Link
                                        to={`/dashboard/events/${eventId}/history`}
                                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors`}
                                    >
                                        Riwayat Scan
                                    </Link>
                                </>
                            )}
                            {(isCreator || isAdmin) && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Event Info */}
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER} mb-6`}>
                    {event.description && (
                        <p className={`${COLORS.TEXT_PRIMARY} mb-4`}>{event.description}</p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">📅</span>
                            <div>
                                <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Tanggal & Waktu</p>
                                <p className={COLORS.TEXT_PRIMARY}>{formatDate(event.event_date)}</p>
                            </div>
                        </div>
                        {event.location && (
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">📍</span>
                                <div>
                                    <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Lokasi</p>
                                    <p className={COLORS.TEXT_PRIMARY}>{event.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                        <p className={`text-sm ${COLORS.TEXT_SECONDARY} mb-1`}>Total Pendaftar</p>
                        <p className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY}`}>{stats.total}</p>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                        <p className={`text-sm ${COLORS.TEXT_SECONDARY} mb-1`}>Hadir</p>
                        <p className="text-3xl font-bold text-green-500">{stats.present}</p>
                    </div>
                    <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                        <p className={`text-sm ${COLORS.TEXT_SECONDARY} mb-1`}>Belum Hadir</p>
                        <p className="text-3xl font-bold text-orange-500">{stats.registered}</p>
                    </div>
                </div>

                {/* Tabs for Attendees and Admins */}
                {canManage && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Attendees */}
                        <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                            <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                Daftar Peserta ({attendees?.length || 0})
                            </h2>

                            {!attendees || attendees.length === 0 ? (
                                <p className={`${COLORS.TEXT_SECONDARY} text-center py-8`}>
                                    Belum ada peserta yang mendaftar
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {attendees.map((attendee) => (
                                        <div
                                            key={attendee.id}
                                            className={`${COLORS.BG_PRIMARY} p-4 rounded-lg border ${COLORS.BORDER}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className={`font-medium ${COLORS.TEXT_PRIMARY}`}>
                                                        {attendee.user_username}
                                                    </p>
                                                    <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                                        Terdaftar: {new Date(attendee.registered_at || '').toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(attendee.status)}`}>
                                                    {getStatusText(attendee.status)}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleShowQR(attendee)}
                                                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    QR Code
                                                </button>
                                                {attendee.status !== 'present' && (
                                                    <button
                                                        onClick={() => updateStatusMutation.mutate({ attendeeId: attendee.id, status: 'present' })}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                                    >
                                                        Tandai Hadir
                                                    </button>
                                                )}
                                                {attendee.status !== 'absent' && (
                                                    <button
                                                        onClick={() => updateStatusMutation.mutate({ attendeeId: attendee.id, status: 'absent' })}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                                                    >
                                                        Tidak Hadir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admins */}
                        {(isCreator || isAdmin) && (
                            <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                                        Admin Acara ({admins?.length || 0})
                                    </h2>
                                    <button
                                        onClick={() => setShowAdminModal(true)}
                                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                                    >
                                        + Tambah Admin
                                    </button>
                                </div>

                                {!admins || admins.length === 0 ? (
                                    <p className={`${COLORS.TEXT_SECONDARY} text-center py-8`}>
                                        Belum ada admin yang ditugaskan
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {admins.map((admin) => (
                                            <div
                                                key={admin.id}
                                                className={`${COLORS.BG_PRIMARY} p-4 rounded-lg border ${COLORS.BORDER} flex justify-between items-center`}
                                            >
                                                <div>
                                                    <p className={`font-medium ${COLORS.TEXT_PRIMARY}`}>
                                                        {admin.user_username}
                                                    </p>
                                                    <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                                        Ditugaskan oleh: {admin.assigned_by}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeAdminMutation.mutate(admin.user_username)}
                                                    disabled={removeAdminMutation.isPending}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg max-w-md w-full`}>
                            <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                Hapus Acara?
                            </h3>
                            <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                                Tindakan ini tidak dapat dibatalkan. Semua data peserta dan admin akan terhapus.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className={`flex-1 px-4 py-2 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER}`}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        deleteMutation.mutate();
                                        setShowDeleteConfirm(false);
                                    }}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code Modal */}
                {showQRModal && selectedAttendee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg max-w-md w-full`}>
                            <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                QR Code Kehadiran
                            </h3>
                            <div className="bg-white p-6 rounded-lg mb-4 flex justify-center">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={selectedAttendee.attendance_token}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className={`text-center ${COLORS.TEXT_SECONDARY} mb-2`}>
                                {selectedAttendee.user_username}
                            </p>
                            <p className={`text-center text-sm ${COLORS.TEXT_SECONDARY} mb-4`}>
                                Token: {selectedAttendee.attendance_token}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className={`flex-1 px-4 py-2 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER}`}
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={handleDownloadQR}
                                    className={`flex-1 px-4 py-2 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ON_ACCENT} rounded-lg hover:opacity-90`}
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Admin Modal */}
                {showAdminModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg max-w-md w-full`}>
                            <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                Tambah Admin Acara
                            </h3>
                            <input
                                type="text"
                                value={newAdminUsername}
                                onChange={(e) => setNewAdminUsername(e.target.value)}
                                placeholder="Username"
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} mb-4`}
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowAdminModal(false);
                                        setNewAdminUsername('');
                                    }}
                                    className={`flex-1 px-4 py-2 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER}`}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => assignAdminMutation.mutate(newAdminUsername)}
                                    disabled={!newAdminUsername || assignAdminMutation.isPending}
                                    className={`flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50`}
                                >
                                    {assignAdminMutation.isPending ? 'Menambahkan...' : 'Tambah'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardEventDetailPage;
