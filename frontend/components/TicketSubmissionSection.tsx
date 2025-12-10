import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { COLORS, LAYOUT } from '../utils/styles';
import { listTicketCategories, submitTicket } from '../lib/api/services';
import type { TicketCategory, TicketCreate, TicketPriority } from '../apiTypes';

const TicketSubmissionSection: React.FC = () => {
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [formData, setFormData] = useState<TicketCreate & { submitter_name?: string; submitter_email?: string }>({
        title: '',
        description: '',
        category_id: 0,
        priority: 'medium',
        submitter_name: '',
        submitter_email: '',
        reference_link: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; token?: string } | null>(null);
    const [showTokenModal, setShowTokenModal] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await listTicketCategories();
                setCategories(cats);
                if (cats.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: cats[0].id }));
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await submitTicket(formData);
            setSubmitResult({
                success: true,
                message: response.message,
                token: response.ticket.token,
            });
            setShowTokenModal(true);

            // Reset form
            setFormData({
                title: '',
                description: '',
                category_id: categories[0]?.id || 0,
                priority: 'medium',
                submitter_name: '',
                submitter_email: '',
                reference_link: '',
            });
        } catch (error) {
            setSubmitResult({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to submit ticket',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'category_id' ? Number(value) : value }));
    };

    return (
        <section id="ticket-submission" className={`py-16 md:py-20 ${COLORS.BG_PRIMARY}`}>
            <div className="container mx-auto px-4 max-w-3xl">
                <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-xl p-8 md:p-12`}>
                    <h2 className={`text-3xl md:text-4xl font-bold ${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                        Ajukan Komplain / Keluhan
                    </h2>
                    <p className={`${COLORS.TEXT_SECONDARY} text-center mb-8`}>
                        Sampaikan keluhan atau komplain Anda. Anda akan mendapatkan token untuk melacak status pengaduan.
                    </p>

                    {submitResult && !showTokenModal && (
                        <div className={`mb-6 p-4 rounded-lg ${submitResult.success ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}`}>
                            {submitResult.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="submitter_name" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                    Nama (Opsional)
                                </label>
                                <input
                                    type="text"
                                    id="submitter_name"
                                    name="submitter_name"
                                    value={formData.submitter_name || ''}
                                    onChange={handleChange}
                                    placeholder="Nama Anda"
                                    className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                />
                            </div>

                            <div>
                                <label htmlFor="submitter_email" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                    Email (Opsional)
                                </label>
                                <input
                                    type="email"
                                    id="submitter_email"
                                    name="submitter_email"
                                    value={formData.submitter_email || ''}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category_id" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                    Prioritas <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                >
                                    <option value="low">Rendah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="high">Tinggi</option>
                                    <option value="critical">Kritis</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="title" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Judul <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ringkasan singkat keluhan Anda"
                                required
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Deskripsi Lengkap <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Jelaskan keluhan Anda secara detail..."
                                required
                                rows={6}
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink resize-none`}
                            />
                        </div>

                        <div>
                            <label htmlFor="reference_link" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Link Referensi (Opsional)
                            </label>
                            <input
                                type="url"
                                id="reference_link"
                                name="reference_link"
                                value={formData.reference_link || ''}
                                onChange={handleChange}
                                placeholder="https://example.com/screenshot atau link terkait"
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Keluhan'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Token Modal */}
            {showTokenModal && submitResult?.success && submitResult.token && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className={`${COLORS.BG_SECONDARY} rounded-lg p-8 max-w-md w-full shadow-2xl`}>
                        <h3 className={`text-2xl font-bold ${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                            Keluhan Berhasil Dikirim! ✅
                        </h3>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-4 text-center`}>
                            Token pelacakan Anda:
                        </p>
                        <div className={`${COLORS.BG_PRIMARY} p-4 rounded-lg mb-4 text-center`}>
                            <code className={`text-2xl font-mono font-bold ${COLORS.TEXT_ACCENT}`}>
                                {submitResult.token}
                            </code>
                        </div>
                        <p className={`${COLORS.TEXT_SECONDARY} text-sm mb-6 text-center`}>
                            Simpan token ini untuk melacak status keluhan Anda di bawah ini.
                        </p>
                        <button
                            onClick={() => setShowTokenModal(false)}
                            className={`w-full ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                        >
                            Tutup
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default TicketSubmissionSection;
