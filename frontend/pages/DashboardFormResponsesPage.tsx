import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getForm, getFormResponses } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { FormWithQuestions, FormResponse } from '../apiTypes';

const DashboardFormResponsesPage: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormWithQuestions | null>(null);
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (formId) {
            loadData();
        }
    }, [formId]);

    const loadData = async () => {
        if (!formId) return;

        try {
            setLoading(true);
            const [form, responsesData] = await Promise.all([
                getForm(formId),
                getFormResponses(formId),
            ]);
            setFormData(form);
            setResponses(responsesData);
        } catch (err) {
            setError('Gagal memuat data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyTokenToClipboard = (token: string) => {
        navigator.clipboard.writeText(token);
        alert('Token berhasil disalin ke clipboard!');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-pink mx-auto mb-4"></div>
                    <p className={COLORS.TEXT_SECONDARY}>Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div>
                <button
                    onClick={() => navigate('/dashboard/forms')}
                    className={`${COLORS.TEXT_ACCENT} hover:underline mb-4`}
                >
                    ← Kembali ke Formulir
                </button>
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error || 'Formulir tidak ditemukan'}
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => navigate('/dashboard/forms')}
                className={`${COLORS.TEXT_ACCENT} hover:underline mb-4`}
            >
                ← Kembali ke Formulir
            </button>

            <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md mb-6`}>
                <h1 className={`text-2xl md:text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                    {formData.form.title}
                </h1>
                {formData.form.description && (
                    <p className={`${COLORS.TEXT_SECONDARY} mb-4`}>
                        {formData.form.description}
                    </p>
                )}
                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                        Token:
                    </span>
                    <code className={`${COLORS.BG_PRIMARY} px-3 py-1 rounded text-sm ${COLORS.TEXT_ACCENT} font-mono`}>
                        {formData.form.token}
                    </code>
                    <button
                        onClick={() => copyTokenToClipboard(formData.form.token)}
                        className="text-coral-pink hover:text-coral-pink/80 transition-colors"
                        title="Salin token"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
                <div className={`text-lg font-semibold ${COLORS.TEXT_PRIMARY}`}>
                    Total Respons: {responses.length}
                </div>
            </div>

            {responses.length === 0 ? (
                <div className={`${COLORS.BG_SECONDARY} rounded-lg p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className={`${COLORS.TEXT_SECONDARY}`}>
                        Belum ada respons untuk formulir ini
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                        Daftar Respons
                    </h2>
                    {responses.map((response) => (
                        <Link
                            key={response.id}
                            to={`/dashboard/forms/${formId}/responses/${response.id}`}
                            className={`block ${COLORS.BG_SECONDARY} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                        {response.respondent_name || 'Anonim'}
                                    </p>
                                    <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                        {response.submitted_at
                                            ? new Date(response.submitted_at).toLocaleString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : 'Tanggal tidak tersedia'}
                                    </p>
                                </div>
                                <svg className="w-6 h-6 text-coral-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardFormResponsesPage;
