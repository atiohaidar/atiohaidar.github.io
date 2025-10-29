import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listForms, deleteForm } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { Form } from '../apiTypes';

const DashboardFormsPage: React.FC = () => {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadForms = async () => {
        try {
            setLoading(true);
            const data = await listForms();
            setForms(data);
        } catch (err) {
            setError('Gagal memuat formulir');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForms();
    }, []);

    const handleDelete = async (formId: string, title: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus formulir "${title}"?`)) {
            return;
        }

        try {
            await deleteForm(formId);
            setForms(forms.filter((f) => f.id !== formId));
        } catch (err) {
            alert('Gagal menghapus formulir');
            console.error(err);
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
                    <p className={COLORS.TEXT_SECONDARY}>Memuat formulir...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl md:text-3xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                    Formulir Saya
                </h1>
                <Link
                    to="/dashboard/forms/new"
                    className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                >
                    + Buat Formulir Baru
                </Link>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {forms.length === 0 ? (
                <div className={`${COLORS.BG_SECONDARY} rounded-lg p-12 text-center`}>
                    <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                        Anda belum memiliki formulir. Buat formulir pertama Anda sekarang!
                    </p>
                    <Link
                        to="/dashboard/forms/new"
                        className={`inline-block ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                        Buat Formulir
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                                        {form.title}
                                    </h2>
                                    {form.description && (
                                        <p className={`${COLORS.TEXT_SECONDARY} mb-3`}>
                                            {form.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                            Token:
                                        </span>
                                        <code className={`${COLORS.BG_PRIMARY} px-3 py-1 rounded text-sm ${COLORS.TEXT_ACCENT} font-mono`}>
                                            {form.token}
                                        </code>
                                        <button
                                            onClick={() => copyTokenToClipboard(form.token)}
                                            className="text-coral-pink hover:text-coral-pink/80 transition-colors"
                                            title="Salin token"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/dashboard/forms/${form.id}/responses`}
                                        className="text-blue-500 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                                        title="Lihat Respons"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </Link>
                                    <Link
                                        to={`/dashboard/forms/${form.id}/edit`}
                                        className="text-yellow-500 hover:text-yellow-400 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(form.id, form.title)}
                                        className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Hapus"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {form.created_at && (
                                <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                    Dibuat: {new Date(form.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardFormsPage;
