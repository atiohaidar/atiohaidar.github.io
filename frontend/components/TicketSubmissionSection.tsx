import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COLORS, LAYOUT } from '../utils/styles';
import { Typography, Heading, Text } from './ui';
import { listTicketCategories, submitTicket } from '../lib/api/services';
import type { TicketCategory, TicketCreate, TicketPriority } from '../apiTypes';
import BackendLoader from './BackendLoader';

// Get API base URL for server host display
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const parsedUrl = new URL(API_BASE_URL);
const serverHost = parsedUrl.host;
const isSecure = parsedUrl.protocol === 'https:';

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

    // Loader state
    const [showLoader, setShowLoader] = useState(false);
    const [loaderStatus, setLoaderStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [loaderLatency, setLoaderLatency] = useState<number | undefined>(undefined);
    const [loaderStatusCode, setLoaderStatusCode] = useState<number | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const requestStartTime = useRef<number>(0);

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

        // Show loader immediately
        setShowLoader(true);
        setLoaderStatus('loading');
        setErrorMessage(null);
        setLoaderLatency(undefined);
        setLoaderStatusCode(undefined);
        requestStartTime.current = performance.now();

        try {
            const response = await submitTicket(formData);

            // Calculate latency
            const latency = Math.round(performance.now() - requestStartTime.current);
            setLoaderLatency(latency);
            setLoaderStatusCode(201); // Created

            setCreatedToken(response.ticket.token);
            setSubmitResult({
                success: true,
                message: response.message,
                token: response.ticket.token,
            });
            setLoaderStatus('success');

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
            const latency = Math.round(performance.now() - requestStartTime.current);
            setLoaderLatency(latency);
            setLoaderStatusCode(400);

            const errMsg = error instanceof Error ? error.message : 'Failed to submit ticket';
            setErrorMessage(errMsg);
            setSubmitResult({
                success: false,
                message: errMsg,
            });
            setLoaderStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoaderComplete = () => {
        setShowLoader(false);
        if (loaderStatus === 'success') {
            setShowTokenModal(true);
        }
    };

    const handleLoaderDismiss = () => {
        setShowLoader(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'category_id' ? Number(value) : value }));
    };

    return (
        <section id="ticket-submission" className={`py-16 md:py-20 ${COLORS.BG_PRIMARY}`}>
            {/* Loading Overlay */}
            {showLoader && createPortal(
                <BackendLoader
                    status={loaderStatus}
                    onComplete={handleLoaderComplete}
                    onDismiss={handleLoaderDismiss}
                    title="Submitting Ticket"
                    subtitle="Processing your complaint"
                    successMessage={createdToken ? `Ticket created! Token: ${createdToken}` : 'Ticket submitted successfully!'}
                    errorMessage={errorMessage}
                    responseData={createdToken ? { token: createdToken } : undefined}
                    endpoint="/api/tickets/public"
                    method="POST"
                    actualLatency={loaderLatency}
                    actualStatusCode={loaderStatusCode}
                    serverHost={serverHost}
                    isSecure={isSecure}
                    completeDelay={800}
                />,
                document.body
            )}

            <div className="container mx-auto px-4 max-w-3xl">
                <div className={`glass-panel p-8 md:p-12 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/50 via-purple-500/50 to-pink-500/50 opacity-30"></div>

                    <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                        Ajukan Komplain / Keluhan
                    </Heading>
                    <Text className={`${COLORS.TEXT_SECONDARY} text-center mb-8 text-xl`}>
                        Sampaikan keluhan atau komplain Anda. Anda akan mendapatkan token untuk melacak status pengaduan.
                    </Text>

                    {submitResult && !showTokenModal && (
                        <div className={`mb-6 p-4 rounded-lg transform rotate-1 border-2 border-dashed ${submitResult.success ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300'} font-patrick`}>
                            {submitResult.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="h4" as="label" htmlFor="submitter_name" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                    Nama (Opsional)
                                </Typography>
                                <input
                                    type="text"
                                    id="submitter_name"
                                    name="submitter_name"
                                    value={formData.submitter_name || ''}
                                    onChange={handleChange}
                                    placeholder="Nama Anda"
                                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                                />
                            </div>

                            <div>
                                <Typography variant="h4" as="label" htmlFor="submitter_email" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                    Email (Opsional)
                                </Typography>
                                <input
                                    type="email"
                                    id="submitter_email"
                                    name="submitter_email"
                                    value={formData.submitter_email || ''}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="h4" as="label" htmlFor="category_id" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                    Kategori <span className="text-red-500">*</span>
                                </Typography>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 appearance-none cursor-pointer`}
                                    style={{ backgroundImage: 'none' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id} className="dark:bg-slate-800">{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Typography variant="h4" as="label" htmlFor="priority" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                    Prioritas <span className="text-red-500">*</span>
                                </Typography>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 appearance-none cursor-pointer`}
                                >
                                    <option value="low" className="dark:bg-slate-800">Rendah</option>
                                    <option value="medium" className="dark:bg-slate-800">Sedang</option>
                                    <option value="high" className="dark:bg-slate-800">Tinggi</option>
                                    <option value="critical" className="dark:bg-slate-800">Kritis</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Typography variant="h4" as="label" htmlFor="title" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                Judul <span className="text-red-500">*</span>
                            </Typography>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ringkasan singkat keluhan Anda"
                                required
                                className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                            />
                        </div>

                        <div>
                            <Typography variant="h4" as="label" htmlFor="description" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                Deskripsi Lengkap <span className="text-red-500">*</span>
                            </Typography>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Jelaskan keluhan Anda secara detail..."
                                required
                                rows={6}
                                className={`w-full px-4 py-3 bg-transparent border-2 border-dashed ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 resize-none`}
                            />
                        </div>

                        <div>
                            <Typography variant="h4" as="label" htmlFor="reference_link" className={`block ${COLORS.TEXT_PRIMARY} mb-2`}>
                                Link Referensi (Opsional)
                            </Typography>
                            <input
                                type="url"
                                id="reference_link"
                                name="reference_link"
                                value={formData.reference_link || ''}
                                onChange={handleChange}
                                placeholder="https://example.com/screenshot atau link terkait"
                                className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full glass-button ${COLORS.TEXT_PRIMARY} py-3 px-6 rounded-lg font-bold font-patrick text-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Keluhan'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Token Modal */}
            {showTokenModal && submitResult?.success && submitResult.token && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-patrick">
                    <div className={`glass-panel p-8 max-w-md w-full shadow-2xl relative`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-50"></div>
                        <Heading level={3} className={`${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                            Keluhan Berhasil! ✅
                        </Heading>
                        <Text className={`${COLORS.TEXT_SECONDARY} mb-4 text-center text-lg`}>
                            Token pelacakan Anda:
                        </Text>
                        <div className={`bg-white/50 dark:bg-black/30 p-4 rounded-lg mb-6 text-center border-2 border-dashed ${COLORS.BORDER} transform -rotate-1`}>
                            <code className={`text-3xl font-patrick font-bold ${COLORS.TEXT_ACCENT} tracking-wider`}>
                                {submitResult.token}
                            </code>
                        </div>
                        <p className={`${COLORS.TEXT_MUTED} text-sm mb-8 text-center font-sans`}>
                            Simpan token ini untuk melacak status keluhan Anda.
                        </p>
                        <button
                            onClick={() => setShowTokenModal(false)}
                            className={`w-full glass-button ${COLORS.TEXT_PRIMARY} py-3 px-6 rounded-xl font-bold text-lg`}
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
