import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../utils/styles';
import { getTicketByToken, getTicketCommentsByToken, addTicketCommentByToken } from '../lib/api/services';
import type { Ticket, TicketComment } from '../apiTypes';

interface TicketTrackingSectionProps {
    prefillToken?: string | null;
    onPrefillConsumed?: () => void;
}

const TicketTrackingSection: React.FC<TicketTrackingSectionProps> = ({ prefillToken, onPrefillConsumed }) => {
    const [token, setToken] = useState('');
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [commenterName, setCommenterName] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const fetchTicket = useCallback(async (tokenValue: string) => {
        setIsLoading(true);
        setError(null);
        setTicket(null);
        setComments([]);

        try {
            const ticketData = await getTicketByToken(tokenValue);
            setTicket(ticketData);

            const commentsData = await getTicketCommentsByToken(tokenValue);
            setComments(commentsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat tiket');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = token.trim();
        if (!trimmed) {
            return;
        }
        await fetchTicket(trimmed);
    };

    useEffect(() => {
        if (prefillToken && prefillToken.trim()) {
            const trimmed = prefillToken.trim();
            setToken(trimmed);
            fetchTicket(trimmed).finally(() => {
                onPrefillConsumed?.();
            });
        }
    }, [prefillToken, fetchTicket, onPrefillConsumed]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket || !newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const comment = await addTicketCommentByToken(
                token.trim(),
                newComment.trim(),
                commenterName.trim() || ticket.submitter_name || 'Guest'
            );
            setComments([...comments, comment]);
            setNewComment('');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal menambahkan komentar');
        } finally {
            setIsSubmittingComment(false);
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

    return (
        <section id="ticket-tracking" className={`py-16 md:py-20 ${COLORS.BG_PRIMARY}`}>
            <div className="container mx-auto px-4 max-w-4xl">
                <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-xl p-8 md:p-12`}>
                    <h2 className={`text-3xl md:text-4xl font-bold ${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                        Lacak Status Keluhan
                    </h2>
                    <p className={`${COLORS.TEXT_SECONDARY} text-center mb-8`}>
                        Masukkan token untuk melihat progress dan status keluhan Anda
                    </p>

                    <form onSubmit={handleTrack} className="space-y-6 mb-8">
                        <div>
                            <label htmlFor="token" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Token Pelacakan
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    id="token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Contoh: TKT-ABC12345"
                                    className={`flex-1 px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? 'Memuat...' : 'Lacak'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                            {error}
                        </div>
                    )}

                    {ticket && (
                        <div className="space-y-6">
                            {/* Ticket Details */}
                            <div className={`${COLORS.BG_PRIMARY} rounded-lg p-6 border ${COLORS.BORDER}`}>
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <h3 className={`text-2xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                                        {ticket.title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                                            {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </div>
                                </div>

                                <div className={`${COLORS.TEXT_SECONDARY} space-y-2 mb-4`}>
                                    <p><strong>Kategori:</strong> {ticket.category_name}</p>
                                    <p><strong>Dibuat:</strong> {new Date(ticket.created_at || '').toLocaleString('id-ID')}</p>
                                    <p><strong>Terakhir diperbarui:</strong> {new Date(ticket.updated_at || '').toLocaleString('id-ID')}</p>
                                    {ticket.assigned_to && (
                                        <p><strong>Ditangani oleh:</strong> {ticket.assigned_to}</p>
                                    )}
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
                            </div>

                            {/* Comments Section */}
                            <div className={`${COLORS.BG_PRIMARY} rounded-lg p-6 border ${COLORS.BORDER}`}>
                                <h4 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                    Riwayat Komunikasi
                                </h4>

                                {comments.length === 0 ? (
                                    <p className={`${COLORS.TEXT_SECONDARY} text-center py-4`}>
                                        Belum ada komentar
                                    </p>
                                ) : (
                                    <div className="space-y-4 mb-6">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className={`${COLORS.BG_SECONDARY} rounded-lg p-4 border ${COLORS.BORDER}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                                        {comment.commenter_name}
                                                        <span className={`ml-2 text-xs ${COLORS.TEXT_SECONDARY}`}>
                                                            ({comment.commenter_type === 'user' ? 'Admin' : 'Tamu'})
                                                        </span>
                                                    </span>
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

                                {/* Add Comment Form */}
                                {ticket.status !== 'solved' && (
                                    <form onSubmit={handleAddComment} className="space-y-4">
                                        <div>
                                            <label htmlFor="commenterName" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                                Nama Anda (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                id="commenterName"
                                                value={commenterName}
                                                onChange={(e) => setCommenterName(e.target.value)}
                                                placeholder={ticket.submitter_name || 'Guest'}
                                                className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="newComment" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                                Tambahkan Komentar
                                            </label>
                                            <textarea
                                                id="newComment"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Tambahkan informasi atau pertanyaan..."
                                                required
                                                rows={4}
                                                className={`w-full px-4 py-2 rounded-lg ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink resize-none`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingComment}
                                            className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isSubmittingComment ? 'Mengirim...' : 'Kirim Komentar'}
                                        </button>
                                    </form>
                                )}

                                {ticket.status === 'solved' && (
                                    <div className="mt-4 p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-center">
                                        ✅ Tiket ini telah diselesaikan. Komentar tidak dapat ditambahkan lagi.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TicketTrackingSection;
