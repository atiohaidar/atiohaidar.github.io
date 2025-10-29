import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormByToken, submitFormResponse } from '../lib/api/services';
import { COLORS, LAYOUT } from '../utils/styles';
import type { FormWithQuestions } from '../apiTypes';

const FormFillPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormWithQuestions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respondentName, setRespondentName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

    if (loading) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_ACCENT}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-pink mx-auto mb-4"></div>
                    <p className="text-xl">Memuat formulir...</p>
                </div>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY}`}>
                <div className="text-center px-4">
                    <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>Error</h1>
                    <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>{error || 'Formulir tidak ditemukan'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY}`}>
                <div className="text-center px-4 max-w-md">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>Terima Kasih!</h1>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                            Jawaban Anda telah berhasil dikirim. Kami menghargai waktu Anda untuk mengisi formulir ini.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} py-12 px-4`}>
            <div className="container mx-auto max-w-3xl">
                <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-xl p-8 md:p-12`}>
                    <h1 className={`text-3xl md:text-4xl font-bold ${COLORS.TEXT_PRIMARY} mb-3`}>
                        {formData.form.title}
                    </h1>
                    {formData.form.description && (
                        <p className={`${COLORS.TEXT_SECONDARY} mb-8`}>
                            {formData.form.description}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label htmlFor="respondent_name" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Nama Anda (Opsional)
                            </label>
                            <input
                                type="text"
                                id="respondent_name"
                                value={respondentName}
                                onChange={(e) => setRespondentName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                            />
                        </div>

                        <div className="border-t border-gray-700 pt-8">
                            {formData.questions.map((question, index) => (
                                <div key={question.id} className="mb-8">
                                    <label htmlFor={`question-${question.id}`} className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                        {index + 1}. {question.question_text} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id={`question-${question.id}`}
                                        value={answers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder="Masukkan jawaban Anda"
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink resize-none`}
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className={`flex-1 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormFillPage;
