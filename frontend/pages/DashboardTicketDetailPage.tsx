import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTicket,
    updateTicket,
    getTicketComments,
    addTicketComment,
    getTicketAssignments,
    assignTicket,
    listUsers,
    listTicketCategories,
} from '../lib/api/services';
import type { Ticket, TicketComment, TicketAssignment, User, TicketCategory } from '../apiTypes';
import { COLORS } from '../utils/styles';
import { getStoredUser } from '../apiClient';

const DashboardTicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [assignments, setAssignments] = useState<TicketAssignment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

    // Forms
    const [newComment, setNewComment] = useState('');
    const [isInternalComment, setIsInternalComment] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [assignTo, setAssignTo] = useState('');
    const [assignNotes, setAssignNotes] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        category_id: 0,
        status: '',
        priority: '',
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const user = getStoredUser();
        if (user) {
            setCurrentUser(user);
        }
        loadData();
    }, [ticketId]);

    const loadData = async () => {
        if (!ticketId) return;
        setLoading(true);
        setError(null);
        try {
            const [ticketData, commentsData, assignmentsData, usersData, categoriesData] = await Promise.all([
                getTicket(Number(ticketId)),
                getTicketComments(Number(ticketId), true),
                getTicketAssignments(Number(ticketId)),
                listUsers(),
                listTicketCategories(),
            ]);
            setTicket(ticketData);
            setComments(commentsData);
            setAssignments(assignmentsData);
            setUsers(usersData);
            setCategories(categoriesData);
            setEditData({
                title: ticketData.title,
                description: ticketData.description,
                category_id: ticketData.category_id,
                status: ticketData.status,
                priority: ticketData.priority,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket || !newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const comment = await addTicketComment(ticket.id, {
                comment_text: newComment.trim(),
                is_internal: isInternalComment,
            });
            setComments([...comments, comment]);
            setNewComment('');
            setIsInternalComment(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to add comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket || !assignTo) return;

        setIsAssigning(true);
        try {
            const assignment = await assignTicket(ticket.id, {
                assigned_to: assignTo,
                notes: assignNotes.trim() || undefined,
            });
            setAssignments([assignment, ...assignments]);
            setAssignTo('');
            setAssignNotes('');
            // Reload ticket to get updated assigned_to
            const updatedTicket = await getTicket(ticket.id);
            setTicket(updatedTicket);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to assign ticket');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;

        setIsUpdating(true);
        try {
            const updatedTicket = await updateTicket(ticket.id, {
                ...editData,
                status: editData.status as any,
                priority: editData.priority as any
            });
            setTicket(updatedTicket);
            setEditMode(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update ticket');
        } finally {
            setIsUpdating(false);
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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className={`text-center ${COLORS.TEXT_PRIMARY}`}>Memuat tiket...</div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{error || 'Ticket not found'}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY}`}>Detail Tiket</h1>
                <button
                    onClick={() => navigate('/dashboard/tickets')}
                    className={`px-4 py-2 rounded-lg ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} hover:opacity-80 transition-opacity`}
                >
                    ← Kembali
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Details */}
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 border ${COLORS.BORDER}`}>
                        {!editMode ? (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className={`text-2xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                                        {ticket.title}
                                    </h2>
                                    {currentUser?.role === 'admin' && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className={`px-4 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} text-sm hover:opacity-90`}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                                        {getPriorityLabel(ticket.priority)}
                                    </span>
                                </div>

                                <div className={`${COLORS.TEXT_SECONDARY} space-y-2 mb-4`}>
                                    <p><strong>Token:</strong> <code className="font-mono">{ticket.token}</code></p>
                                    <p><strong>Kategori:</strong> {ticket.category_name}</p>
                                    <p><strong>Pelapor:</strong> {ticket.submitter_name || 'Anonim'} {ticket.submitter_email && `(${ticket.submitter_email})`}</p>
                                    <p><strong>Ditangani oleh:</strong> {ticket.assigned_to || 'Belum ditugaskan'}</p>
                                    <p><strong>Dibuat:</strong> {new Date(ticket.created_at || '').toLocaleString('id-ID')}</p>
                                    <p><strong>Terakhir diperbarui:</strong> {new Date(ticket.updated_at || '').toLocaleString('id-ID')}</p>
                                </div>

                                <div className={`${COLORS.TEXT_PRIMARY} whitespace-pre-wrap`}>
                                    <strong>Deskripsi:</strong>
                                    <p className="mt-2">{ticket.description}</p>
                                </div>

                                {ticket.reference_link && (
                                    <div className="mt-4">
                                        <a
                                            href={ticket.reference_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${COLORS.TEXT_ACCENT} hover:underline`}
                                        >
                                            🔗 Link Referensi
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        rows={6}
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none`}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                            Kategori
                                        </label>
                                        <select
                                            value={editData.category_id}
                                            onChange={(e) => setEditData({ ...editData, category_id: Number(e.target.value) })}
                                            className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                            Status
                                        </label>
                                        <select
                                            value={editData.status}
                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                            className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                        >
                                            <option value="open">Terbuka</option>
                                            <option value="in_progress">Dalam Proses</option>
                                            <option value="waiting">Menunggu</option>
                                            <option value="solved">Selesai</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                        Prioritas
                                    </label>
                                    <select
                                        value={editData.priority}
                                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                    >
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                        <option value="critical">Kritis</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`flex-1 px-4 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                                    >
                                        {isUpdating ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(false)}
                                        className={`flex-1 px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} hover:opacity-80`}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Comments */}
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 border ${COLORS.BORDER}`}>
                        <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                            Komentar
                        </h3>

                        {comments.length === 0 ? (
                            <p className={`${COLORS.TEXT_SECONDARY} text-center py-4`}>
                                Belum ada komentar
                            </p>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`${COLORS.BG_PRIMARY} rounded-lg p-4 border ${COLORS.BORDER} ${comment.is_internal ? 'border-l-4 border-l-yellow-500' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                                    {comment.commenter_name}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${comment.commenter_type === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
                                                    {comment.commenter_type === 'user' ? 'Staff' : 'Tamu'}
                                                </span>
                                                {comment.is_internal && (
                                                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                                                        Internal
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                                {new Date(comment.created_at || '').toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <p className={`${COLORS.TEXT_PRIMARY} whitespace-pre-wrap`}>
                                            {comment.comment_text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {ticket.status !== 'solved' && (
                            <form onSubmit={handleAddComment} className="space-y-4">
                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                        Tambahkan Komentar
                                    </label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Tulis komentar..."
                                        required
                                        rows={4}
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none`}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isInternalComment}
                                            onChange={(e) => setIsInternalComment(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                            Komentar Internal (hanya untuk staff)
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingComment}
                                        className={`ml-auto px-6 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                                    >
                                        {isSubmittingComment ? 'Mengirim...' : 'Kirim'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Assignment */}
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 border ${COLORS.BORDER}`}>
                        <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                            Penugasan
                        </h3>

                        {currentUser?.role === 'admin' && ticket.status !== 'solved' && (
                            <form onSubmit={handleAssign} className="space-y-4 mb-6">
                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 text-sm font-medium`}>
                                        Tugaskan ke
                                    </label>
                                    <select
                                        value={assignTo}
                                        onChange={(e) => setAssignTo(e.target.value)}
                                        required
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                    >
                                        <option value="">Pilih user...</option>
                                        {users.map((user) => (
                                            <option key={user.username} value={user.username}>
                                                {user.name} ({user.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block ${COLORS.TEXT_PRIMARY} mb-2 text-sm font-medium`}>
                                        Catatan (opsional)
                                    </label>
                                    <textarea
                                        value={assignNotes}
                                        onChange={(e) => setAssignNotes(e.target.value)}
                                        placeholder="Catatan untuk penugasan..."
                                        rows={3}
                                        className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isAssigning}
                                    className={`w-full px-4 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                                >
                                    {isAssigning ? 'Menugaskan...' : 'Tugaskan'}
                                </button>
                            </form>
                        )}

                        {/* Assignment History */}
                        <div>
                            <h4 className={`font-semibold ${COLORS.TEXT_PRIMARY} mb-2`}>
                                Riwayat Penugasan
                            </h4>
                            {assignments.length === 0 ? (
                                <p className={`${COLORS.TEXT_SECONDARY} text-sm`}>
                                    Belum ada riwayat penugasan
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className={`${COLORS.BG_PRIMARY} rounded p-3 text-sm border ${COLORS.BORDER}`}
                                        >
                                            <div className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                                {assignment.assigned_from ? `${assignment.assigned_from} →` : ''} {assignment.assigned_to}
                                            </div>
                                            <div className={`text-xs ${COLORS.TEXT_SECONDARY}`}>
                                                oleh {assignment.assigned_by}
                                            </div>
                                            {assignment.notes && (
                                                <div className={`text-xs ${COLORS.TEXT_SECONDARY} mt-1`}>
                                                    {assignment.notes}
                                                </div>
                                            )}
                                            <div className={`text-xs ${COLORS.TEXT_SECONDARY} mt-1`}>
                                                {new Date(assignment.created_at || '').toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTicketDetailPage;
