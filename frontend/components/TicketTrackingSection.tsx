import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../utils/styles';
import { Typography, Heading, Text } from './ui';
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

    return (
        <section id="ticket-tracking" className={`py-16 md:py-20 ${COLORS.BG_PRIMARY}`}>
            <div className="container mx-auto px-4 max-w-4xl">
                <div className={`glass-panel p-8 md:p-12 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

                    <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                        Lacak Status Keluhan
                    </Heading>
                    <Text className={`${COLORS.TEXT_SECONDARY} text-center mb-8 text-xl`}>
                        Masukkan token untuk melihat progress dan status keluhan Anda
                    </Text>

                    <form onSubmit={handleTrack} className="space-y-6 mb-12 relative z-10">
                        <div>
                            <Typography variant="h4" as="label" htmlFor="token" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                Token Pelacakan
                            </Typography>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    id="token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Contoh: TKT-ABC12345"
                                    className={`flex-1 px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 font-patrick tracking-wider`}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`glass-button ${COLORS.TEXT_PRIMARY} py-3 px-8 rounded-lg font-bold font-patrick text-lg hover:scale-[1.05] transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? 'Memuat...' : 'Lacak'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="mb-8 p-4 rounded-lg transform -rotate-1 border-2 border-dashed bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 font-patrick text-center">
                            {error}
                        </div>
                    )}

                    {ticket && (
                        <div className="space-y-8 animate-fade-in-up">
                            {/* Ticket Details */}
                            <div className={`p-6 border-2 border-dashed ${COLORS.BORDER} rounded-xl relative`}>
                                <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-12">
                                    <div className={`px-4 py-1 ${getStatusColor(ticket.status)} border-2 rounded-lg font-bold font-patrick shadow-sm`}>
                                        {getStatusLabel(ticket.status)}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <Heading level={3} className={`${COLORS.TEXT_PRIMARY} mb-2`}>
                                        {ticket.title}
                                    </Heading>
                                    <div className="flex gap-2 mb-4">
                                        <span className={`px-3 py-1 border rounded-full text-sm font-bold font-patrick ${getPriorityColor(ticket.priority)}`}>
                                            Prioritas: {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </div>
                                </div>

                                <div className={`${COLORS.TEXT_SECONDARY} space-y-2 mb-6 font-patrick border-b-2 border-dashed ${COLORS.BORDER} pb-4`}>
                                    <p><strong>Kategori:</strong> {ticket.category_name}</p>
                                    <p><strong>Dibuat:</strong> {new Date(ticket.created_at || '').toLocaleString('id-ID')}</p>
                                    <p><strong>Terakhir diperbarui:</strong> {new Date(ticket.updated_at || '').toLocaleString('id-ID')}</p>
                                    {ticket.assigned_to && (
                                        <p><strong>Ditangani oleh:</strong> {ticket.assigned_to}</p>
                                    )}
                                </div>

                                <div className={`${COLORS.TEXT_PRIMARY} whitespace-pre-wrap font-sans`}>
                                    <strong className="font-patrick text-lg block mb-2">Deskripsi:</strong>
                                    <p className="leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-dashed ${COLORS.BORDER}">
                                        {ticket.description}
                                    </p>
                                </div>

                                {ticket.reference_link && (
                                    <div className="mt-4">
                                        <a
                                            href={ticket.reference_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${COLORS.TEXT_ACCENT} hover:underline font-patrick font-bold flex items-center gap-2`}
                                        >
                                            <span className="text-xl">🔗</span> Link Referensi
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div className="mt-8">
                                <Heading level={4} className={`${COLORS.TEXT_PRIMARY} mb-6 flex items-center gap-2`}>
                                    <span>💬</span> Riwayat Komunikasi
                                </Heading>

                                {comments.length === 0 ? (
                                    <p className={`${COLORS.TEXT_SECONDARY} text-center py-8 italic font-patrick text-xl border-2 border-dashed ${COLORS.BORDER} rounded-xl opacity-60`}>
                                        Belum ada komentar
                                    </p>
                                ) : (
                                    <div className="space-y-6 mb-8">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className={`p-5 rounded-xl border-2 ${comment.commenter_type === 'user' ? `border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 ml-8` : `border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 mr-8`}`}>
                                                <div className="flex items-center justify-between mb-3 border-b border-dashed border-gray-300 dark:border-gray-600 pb-2">
                                                    <span className={`font-bold font-patrick text-lg ${COLORS.TEXT_PRIMARY}`}>
                                                        {comment.commenter_name}
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${comment.commenter_type === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                                            {comment.commenter_type === 'user' ? 'Admin' : 'Tamu'}
                                                        </span>
                                                    </span>
                                                    <span className={`text-sm ${COLORS.TEXT_SECONDARY} font-patrick`}>
                                                        {new Date(comment.created_at || '').toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <Text as="p" className={`${COLORS.TEXT_PRIMARY} whitespace-pre-wrap leading-relaxed`}>
                                                    {comment.comment_text}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Form */}
                                {ticket.status !== 'solved' && (
                                    <form onSubmit={handleAddComment} className="space-y-4 mt-8 pt-6 border-t-2 border-dashed ${COLORS.BORDER}">
                                        <Heading level={4} className={`${COLORS.TEXT_PRIMARY} mb-4`}>Balas Tiket</Heading>
                                        <div>
                                            <Typography variant="h4" as="label" htmlFor="commenterName" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                                Nama Anda (Opsional)
                                            </Typography>
                                            <input
                                                type="text"
                                                id="commenterName"
                                                value={commenterName}
                                                onChange={(e) => setCommenterName(e.target.value)}
                                                placeholder={ticket.submitter_name || 'Guest'}
                                                className={`w-full px-4 py-2 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                                            />
                                        </div>
                                        <div>
                                            <Typography variant="h4" as="label" htmlFor="newComment" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                                Tambahkan Komentar
                                            </Typography>
                                            <textarea
                                                id="newComment"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Tambahkan informasi atau pertanyaan..."
                                                required
                                                rows={4}
                                                className={`w-full px-4 py-3 bg-transparent border-2 border-dashed ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick rounded-lg hover:bg-black/5 dark:hover:bg-white/5 resize-none`}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingComment}
                                                className={`glass-button ${COLORS.TEXT_PRIMARY} py-2 px-6 rounded-lg font-bold font-patrick hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isSubmittingComment ? 'Mengirim...' : 'Kirim Komentar'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {ticket.status === 'solved' && (
                                    <div className="mt-8 p-6 rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-100 text-center font-patrick text-xl">
                                        ✅ Tiket ini telah diselesaikan. <br />
                                        <span className="text-base opacity-80">Komentar tidak dapat ditambahkan lagi.</span>
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
