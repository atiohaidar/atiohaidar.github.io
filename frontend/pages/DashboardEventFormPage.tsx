import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvent, createEvent, updateEvent } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { EventCreate, EventUpdate } from '../apiTypes';

const DashboardEventFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const queryClient = useQueryClient();
    const isEditMode = !!eventId;

    const [formData, setFormData] = useState<EventCreate>({
        title: '',
        description: '',
        event_date: '',
        location: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch event data if editing
    const { data: event, isLoading: loadingEvent } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEvent(eventId!),
        enabled: isEditMode,
    });

    // Populate form when editing
    useEffect(() => {
        if (event && isEditMode) {
            setFormData({
                title: event.title,
                description: event.description || '',
                event_date: event.event_date,
                location: event.location || '',
            });
        }
    }, [event, isEditMode]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            navigate(`/dashboard/events/${data.id}`);
        },
        onError: (error: any) => {
            setErrors({ submit: error.message || 'Gagal membuat acara' });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: EventUpdate) => updateEvent(eventId!, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            navigate(`/dashboard/events/${data.id}`);
        },
        onError: (error: any) => {
            setErrors({ submit: error.message || 'Gagal memperbarui acara' });
        },
    });

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Judul acara harus diisi';
        }

        if (!formData.event_date) {
            newErrors.event_date = 'Tanggal dan waktu acara harus diisi';
        } else {
            const eventDate = new Date(formData.event_date);
            if (eventDate < new Date() && !isEditMode) {
                newErrors.event_date = 'Tanggal acara tidak boleh di masa lalu';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (isEditMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleChange = (field: keyof EventCreate, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    if (isEditMode && loadingEvent) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
                <div className={`${COLORS.BG_SECONDARY} p-8 rounded-lg border ${COLORS.BORDER} text-center`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p className={COLORS.TEXT_SECONDARY}>Memuat data acara...</p>
                </div>
            </div>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard/events')}
                        className={`${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_PRIMARY} mb-4 flex items-center`}
                    >
                        ← Kembali ke Daftar Acara
                    </button>
                    <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                        {isEditMode ? 'Edit Acara' : 'Buat Acara Baru'}
                    </h1>
                    <p className={COLORS.TEXT_SECONDARY}>
                        {isEditMode ? 'Perbarui informasi acara' : 'Buat acara dan kelola pendaftaran peserta'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                    {/* Error message */}
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="mb-6">
                        <label htmlFor="title" className={`block mb-2 font-medium ${COLORS.TEXT_PRIMARY}`}>
                            Judul Acara <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.title ? 'border-red-500' : COLORS.BORDER
                            } ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                            placeholder="Contoh: Workshop Web Development"
                            disabled={isSubmitting}
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label htmlFor="description" className={`block mb-2 font-medium ${COLORS.TEXT_PRIMARY}`}>
                            Deskripsi
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                            placeholder="Jelaskan tentang acara ini..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Event Date */}
                    <div className="mb-6">
                        <label htmlFor="event_date" className={`block mb-2 font-medium ${COLORS.TEXT_PRIMARY}`}>
                            Tanggal dan Waktu <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="event_date"
                            type="datetime-local"
                            value={formData.event_date ? new Date(formData.event_date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleChange('event_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.event_date ? 'border-red-500' : COLORS.BORDER
                            } ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                            disabled={isSubmitting}
                        />
                        {errors.event_date && <p className="mt-1 text-sm text-red-500">{errors.event_date}</p>}
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <label htmlFor="location" className={`block mb-2 font-medium ${COLORS.TEXT_PRIMARY}`}>
                            Lokasi
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                            placeholder="Contoh: Auditorium Utama"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/events')}
                            className={`px-6 py-3 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_SECONDARY} rounded-lg hover:${COLORS.BG_HOVER} transition-colors border ${COLORS.BORDER}`}
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-6 py-3 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                    {isEditMode ? 'Memperbarui...' : 'Membuat...'}
                                </span>
                            ) : (
                                isEditMode ? 'Perbarui Acara' : 'Buat Acara'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DashboardEventFormPage;
