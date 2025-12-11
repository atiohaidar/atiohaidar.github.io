import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getForm, createForm, updateForm } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { FormCreate, FormUpdate } from '../apiTypes';

interface QuestionInput {
    id?: string;
    question_text: string;
    question_order: number;
}

const DashboardFormEditorPage: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(formId && formId !== 'new');

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<QuestionInput[]>([
        { question_text: '', question_order: 1 },
    ]);

    useEffect(() => {
        if (isEditMode && formId) {
            loadForm();
        }
    }, [formId, isEditMode]);

    const loadForm = async () => {
        if (!formId) return;

        try {
            const data = await getForm(formId);
            setTitle(data.form.title);
            setDescription(data.form.description || '');
            setQuestions(
                data.questions.map((q) => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_order: q.question_order,
                }))
            );
        } catch (err) {
            alert('Gagal memuat formulir');
            navigate('/dashboard/forms');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: '',
                question_order: questions.length + 1,
            },
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length === 1) {
            alert('Formulir harus memiliki minimal 1 pertanyaan');
            return;
        }

        const newQuestions = questions.filter((_, i) => i !== index);
        // Reorder
        newQuestions.forEach((q, i) => {
            q.question_order = i + 1;
        });
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index].question_text = value;
        setQuestions(newQuestions);
    };

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) {
            return;
        }

        const newQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newQuestions[index], newQuestions[targetIndex]] = [
            newQuestions[targetIndex],
            newQuestions[index],
        ];

        // Reorder
        newQuestions.forEach((q, i) => {
            q.question_order = i + 1;
        });

        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Judul formulir harus diisi');
            return;
        }

        if (questions.some((q) => !q.question_text.trim())) {
            alert('Semua pertanyaan harus diisi');
            return;
        }

        setSubmitting(true);

        try {
            if (isEditMode && formId) {
                const updateData: FormUpdate = {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    questions: questions.map((q) => ({
                        id: q.id,
                        question_text: q.question_text.trim(),
                        question_order: q.question_order,
                    })),
                };
                await updateForm(formId, updateData);
            } else {
                const createData: FormCreate = {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    questions: questions.map((q) => ({
                        question_text: q.question_text.trim(),
                        question_order: q.question_order,
                    })),
                };
                await createForm(createData);
            }

            navigate('/dashboard/forms');
        } catch (err) {
            alert('Gagal menyimpan formulir');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p className={COLORS.TEXT_SECONDARY}>Memuat formulir...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-6`}>
                {isEditMode ? 'Edit Formulir' : 'Buat Formulir Baru'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                        Informasi Formulir
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Judul Formulir <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Masukkan judul formulir"
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Deskripsi (Opsional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Masukkan deskripsi formulir"
                                rows={3}
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none`}
                            />
                        </div>
                    </div>
                </div>

                <div className={`${COLORS.BG_SECONDARY} rounded-lg p-6 shadow-md`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                            Pertanyaan
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className={`${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm`}
                        >
                            + Tambah Pertanyaan
                        </button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div
                                key={index}
                                className={`${COLORS.BG_PRIMARY} p-4 rounded-lg border ${COLORS.BORDER}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col gap-1 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveQuestion(index, 'up')}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-accent-blue disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Pindah ke atas"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveQuestion(index, 'down')}
                                            disabled={index === questions.length - 1}
                                            className="text-gray-400 hover:text-accent-blue disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Pindah ke bawah"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor={`question-${index}`} className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                            Pertanyaan {index + 1} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id={`question-${index}`}
                                            value={question.question_text}
                                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                                            placeholder="Masukkan pertanyaan"
                                            rows={3}
                                            className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none`}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(index)}
                                        className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors mt-8"
                                        title="Hapus pertanyaan"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/forms')}
                        className={`flex-1 ${COLORS.BG_SECONDARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`flex-1 ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Formulir'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DashboardFormEditorPage;
