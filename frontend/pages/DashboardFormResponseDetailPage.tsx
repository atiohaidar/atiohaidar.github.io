import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormResponseDetail } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { FormResponseDetail } from '../apiTypes';

const DashboardFormResponseDetailPage: React.FC = () => {
    const { formId, responseId } = useParams<{ formId: string; responseId: string }>();
    const navigate = useNavigate();
    const [responseData, setResponseData] = useState<FormResponseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (formId && responseId) {
            loadResponse();
        }
    }, [formId, responseId]);

    const loadResponse = async () => {
        if (!formId || !responseId) return;

        try {
            setLoading(true);
            const data = await getFormResponseDetail(formId, responseId);
            setResponseData(data);
        } catch (err) {
            setError('Gagal memuat detail respons');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p className={COLORS.TEXT_SECONDARY}>Memuat detail respons...</p>
                </div>
            </div>
        );
    }

    if (error || !responseData) {
        return (
            <div>
                <button
                    onClick={() => navigate(`/dashboard/forms/${formId}/responses`)}
                    className={`${COLORS.TEXT_ACCENT} hover:underline mb-4`}
                >
                    ← Kembali ke Daftar Respons
                </button>
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error || 'Respons tidak ditemukan'}
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => navigate(`/dashboard/forms/${formId}/responses`)}
                className={`${COLORS.TEXT_ACCENT} hover:underline mb-4`}
            >
                ← Kembali ke Daftar Respons
            </button>

            <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md mb-6`}>
                <h1 className={`text-2xl md:text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                    Detail Respons
                </h1>
                <div className="space-y-2">
                    <p className={COLORS.TEXT_SECONDARY}>
                        <span className="font-semibold">Responden:</span>{' '}
                        {responseData.response.respondent_name || 'Anonim'}
                    </p>
                    <p className={COLORS.TEXT_SECONDARY}>
                        <span className="font-semibold">Tanggal:</span>{' '}
                        {responseData.response.submitted_at
                            ? new Date(responseData.response.submitted_at).toLocaleString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : 'Tanggal tidak tersedia'}
                    </p>
                </div>
            </div>

            <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md`}>
                <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-6`}>
                    Jawaban
                </h2>
                <div className="space-y-6">
                    {responseData.answers.map((answer, index) => (
                        <div key={answer.question_id} className={`pb-6 ${index !== responseData.answers.length - 1 ? 'border-b border-gray-700' : ''}`}>
                            <p className={`font-semibold ${COLORS.TEXT_PRIMARY} mb-3`}>
                                {index + 1}. {answer.question_text}
                            </p>
                            <div className={`${COLORS.BG_PRIMARY} rounded-lg p-4`}>
                                <p className={`${COLORS.TEXT_SECONDARY} whitespace-pre-wrap`}>
                                    {answer.answer_text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardFormResponseDetailPage;
