import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormByToken, submitFormResponse } from '../lib/api/services';
import { useLandingData } from '../contexts/LandingDataContext';
import { useMultiParallax } from '../hooks/useParallax';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import type { FormWithQuestions } from '../apiTypes';

const FormFillPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    // Get pre-fetched data from context for Navbar/Footer
    const { data } = useLandingData();
    const { profile } = data;

    // Parallax effect for background layers
    const parallax = useMultiParallax();

    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormWithQuestions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respondentName, setRespondentName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const authToken = getAuthToken();
        const storedUser = getStoredUser();
        if (authToken && storedUser) {
            setLoggedInUser(storedUser.username);
        }
    }, []);

    useEffect(() => {
        const loadForm = async () => {
            if (!token) {
                setError('Token tidak valid');
                setLoading(false);
                return;
            }

            try {
                const data = await getFormByToken(token);
                setFormData(data);

                // Initialize answers
                const initialAnswers: Record<string, string> = {};
                data.questions.forEach((q) => {
                    initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (err) {
                setError('Formulir tidak ditemukan atau token tidak valid');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [token]);

    const handleLogout = () => {
        clearAuth();
        setLoggedInUser(null);
        navigate('/', { replace: true });
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !formData) return;

        // Validate all questions are answered
        const unanswered = formData.questions.filter((q) => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
            alert('Mohon jawab semua pertanyaan');
            return;
        }

        setSubmitting(true);

        try {
            const responseData = {
                respondent_name: respondentName.trim() || undefined,
                answers: formData.questions.map((q) => ({
                    question_id: q.id,
                    answer_text: answers[q.id],
                })),
            };

            await submitFormResponse(token, responseData);
            setSubmitted(true);
        } catch (err) {
            alert('Gagal mengirim jawaban. Silakan coba lagi.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Default profile if data not loaded yet
    const defaultProfile = {
        logoSrc: './PP-Tio.jpg',
        socials: {
            github: 'https://github.com/atiohaidar',
            linkedin: 'https://www.linkedin.com/in/atiohaidar/',
            instagram: 'https://www.instagram.com/tiohaidarhanif'
        },
        copyright: '© 2024 Tio Haidar. All rights reserved.'
    };

    const activeProfile = profile || defaultProfile;

    // Loading State
    if (loading) {
        return (
            <div className="relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden flex items-center justify-center">
                {/* Background */}
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />
                <div
                    className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                    style={{ transform: `translateY(${parallax.getOffset(0.05, 'down')}px)` }}
                />

                <div className="text-center relative z-10">
                    <div className="inline-block w-12 h-12 border-3 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                    <p className="text-xl text-light-muted dark:text-soft-gray">Memuat formulir...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !formData) {
        return (
            <div className="relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />
                <div
                    className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                />

                <Navbar
                    logoSrc={activeProfile.logoSrc}
                    socials={activeProfile.socials}
                    loggedInUser={loggedInUser}
                    onLogout={handleLogout}
                />

                <main className="mx-auto relative z-10 pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center px-4">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-3xl font-bold text-light-text dark:text-white mb-4">Error</h1>
                        <p className="text-light-muted dark:text-soft-gray mb-6">{error || 'Formulir tidak ditemukan'}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </main>

                <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />
            </div>
        );
    }

    // Success State
    if (submitted) {
        return (
            <div className="relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />
                <div
                    className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-green-500/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                />

                <Navbar
                    logoSrc={activeProfile.logoSrc}
                    socials={activeProfile.socials}
                    loggedInUser={loggedInUser}
                    onLogout={handleLogout}
                />

                <main className="mx-auto relative z-10 pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
                    <ScrollReveal delay={100}>
                        <div className="text-center px-4 max-w-md">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-light-text dark:text-white mb-4">Terima Kasih!</h1>
                            <p className="text-light-muted dark:text-soft-gray mb-8">
                                Jawaban Anda telah berhasil dikirim. Kami menghargai waktu Anda untuk mengisi formulir ini.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </ScrollReveal>
                </main>

                <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />
            </div>
        );
    }

    // Form Fill State
    return (
        <div className="relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden">
            {/* Global Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />

            {/* Animated Orbs with Parallax (Fixed) */}
            <div
                className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.05, 'down')}px)` }}
            />
            <div
                className="fixed bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.08, 'down')}px)` }}
            />

            {/* Navbar */}
            <Navbar
                logoSrc={activeProfile.logoSrc}
                socials={activeProfile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="mx-auto relative z-10 pt-32 pb-16">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <ScrollReveal delay={100}>
                        <div className="glass-card rounded-2xl p-6 md:p-8 lg:p-12">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-light-text dark:text-white mb-3">
                                {formData.form.title}
                            </h1>
                            {formData.form.description && (
                                <p className="text-light-muted dark:text-soft-gray mb-8">
                                    {formData.form.description}
                                </p>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label htmlFor="respondent_name" className="block text-light-text dark:text-white mb-2 font-medium">
                                        Nama Anda (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        id="respondent_name"
                                        value={respondentName}
                                        onChange={(e) => setRespondentName(e.target.value)}
                                        placeholder="Masukkan nama Anda"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                                    />
                                </div>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-8 space-y-6">
                                    {formData.questions.map((question, index) => (
                                        <div key={question.id}>
                                            <label htmlFor={`question-${question.id}`} className="block text-light-text dark:text-white mb-2 font-medium">
                                                {index + 1}. {question.question_text} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id={`question-${question.id}`}
                                                value={answers[question.id] || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                placeholder="Masukkan jawaban Anda"
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="flex-1 glass-button px-6 py-3 rounded-full text-sm font-medium text-light-muted dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </ScrollReveal>
                </div>
            </main>

            {/* Footer */}
            <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />
        </div>
    );
};

export default FormFillPage;
