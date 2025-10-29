import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { getEvent, scanAttendance, listEventAttendees } from '../lib/api/services';
import { COLORS } from '../utils/styles';
import type { EventAttendee } from '../apiTypes';

const DashboardEventScanPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isScanning, setIsScanning] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [manualToken, setManualToken] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [lastScan, setLastScan] = useState<{
        attendee: EventAttendee;
        isFirstScan: boolean;
        timestamp: Date;
    } | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    // Fetch event
    const { data: event } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => getEvent(eventId!),
        enabled: !!eventId,
    });

    // Fetch attendees for verification
    const { data: attendees } = useQuery({
        queryKey: ['event-attendees', eventId],
        queryFn: () => listEventAttendees(eventId!),
        enabled: !!eventId,
    });

    // Scan mutation
    const scanMutation = useMutation({
        mutationFn: (token: string) =>
            scanAttendance(eventId!, {
                attendance_token: token,
                latitude: location?.latitude,
                longitude: location?.longitude,
            }),
        onSuccess: (data) => {
            setLastScan({
                attendee: data.attendee,
                isFirstScan: data.isFirstScan,
                timestamp: new Date(),
            });
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
            setShowConfirmModal(false);
            setPendingToken(null);
            setManualToken('');
            setError(null);
        },
        onError: (error: any) => {
            setError(error.message || 'Gagal memproses scan');
            setShowConfirmModal(false);
            setPendingToken(null);
        },
    });

    // Get user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn('Could not get location:', error);
                }
            );
        }
    }, []);

    // Get available cameras
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length) {
                    const cameraList = devices.map((device) => ({
                        id: device.id,
                        label: device.label || `Camera ${device.id}`,
                    }));
                    setCameras(cameraList);
                    if (cameraList.length > 0) {
                        setSelectedCamera(cameraList[0].id);
                    }
                }
            })
            .catch((err) => {
                console.error('Error getting cameras:', err);
                setError('Tidak dapat mengakses kamera. Gunakan input manual.');
            });
    }, []);

    // Start/stop scanning
    useEffect(() => {
        if (isScanning && selectedCamera) {
            startScanning();
        } else if (html5QrCodeRef.current) {
            stopScanning();
        }

        return () => {
            if (html5QrCodeRef.current) {
                stopScanning();
            }
        };
    }, [isScanning, selectedCamera]);

    const startScanning = async () => {
        if (!selectedCamera || html5QrCodeRef.current) return;

        try {
            const html5QrCode = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors (camera is still working)
                }
            );
        } catch (err) {
            console.error('Failed to start scanning:', err);
            setError('Gagal memulai scanner. Coba gunakan input manual.');
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            } catch (err) {
                console.error('Failed to stop scanning:', err);
            }
        }
    };

    const handleScanSuccess = (token: string) => {
        // Stop scanning temporarily
        setIsScanning(false);
        
        // Show confirmation modal
        setPendingToken(token);
        setShowConfirmModal(true);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.trim()) {
            setPendingToken(manualToken.trim());
            setShowConfirmModal(true);
        }
    };

    const handleConfirmScan = () => {
        if (pendingToken) {
            scanMutation.mutate(pendingToken);
        }
    };

    const handleCancelScan = () => {
        setShowConfirmModal(false);
        setPendingToken(null);
        setManualToken('');
    };

    const getAttendeeInfo = (token: string) => {
        return attendees?.find((a) => a.attendance_token === token);
    };

    const toggleScanning = () => {
        setIsScanning(!isScanning);
        setError(null);
    };

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} p-6`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/dashboard/events/${eventId}`)}
                        className={`${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_PRIMARY} mb-4 flex items-center`}
                    >
                        ← Kembali ke Detail Acara
                    </button>
                    <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                        Scan QR Code
                    </h1>
                    {event && (
                        <p className={COLORS.TEXT_SECONDARY}>Acara: {event.title}</p>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Last scan notification */}
                {lastScan && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                        lastScan.isFirstScan ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                        <p className={`font-semibold ${lastScan.isFirstScan ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {lastScan.isFirstScan ? '✅ Scan pertama - Status diubah ke HADIR' : '✅ Scan berhasil dicatat'}
                        </p>
                        <p className={`text-sm ${lastScan.isFirstScan ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            User: {lastScan.attendee.user_username} | {lastScan.timestamp.toLocaleTimeString('id-ID')}
                        </p>
                    </div>
                )}

                {/* Camera Scanner */}
                <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER} mb-6`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                        Scanner Kamera
                    </h2>

                    {/* Camera selection */}
                    {cameras.length > 1 && (
                        <div className="mb-4">
                            <label className={`block mb-2 ${COLORS.TEXT_SECONDARY}`}>
                                Pilih Kamera:
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                disabled={isScanning}
                                className={`w-full px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                            >
                                {cameras.map((camera) => (
                                    <option key={camera.id} value={camera.id}>
                                        {camera.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Scanner area */}
                    <div
                        id="qr-reader"
                        ref={scannerRef}
                        className={`w-full rounded-lg overflow-hidden mb-4 ${
                            isScanning ? 'block' : 'hidden'
                        }`}
                        style={{ maxWidth: '500px', margin: '0 auto' }}
                    />

                    {/* Start/Stop button */}
                    <div className="flex gap-4">
                        <button
                            onClick={toggleScanning}
                            disabled={cameras.length === 0}
                            className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                                isScanning
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : `${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} hover:opacity-90`
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isScanning ? 'Stop Scanner' : 'Mulai Scanner'}
                        </button>
                        <button
                            onClick={() => setShowManualInput(!showManualInput)}
                            className={`px-6 py-3 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER} hover:${COLORS.BG_HOVER}`}
                        >
                            Input Manual
                        </button>
                    </div>
                </div>

                {/* Manual Input */}
                {showManualInput && (
                    <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg border ${COLORS.BORDER}`}>
                        <h2 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                            Input Token Manual
                        </h2>
                        <form onSubmit={handleManualSubmit}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="Masukkan token dari QR code"
                                    className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!manualToken.trim() || scanMutation.isPending}
                                className={`w-full px-6 py-3 ${COLORS.BG_ACCENT} ${COLORS.TEXT_ACCENT_CONTRAST} rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {scanMutation.isPending ? 'Memproses...' : 'Verifikasi Token'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && pendingToken && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${COLORS.BG_SECONDARY} p-6 rounded-lg max-w-md w-full`}>
                            <h3 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY} mb-4`}>
                                Verifikasi Kehadiran
                            </h3>
                            
                            {(() => {
                                const attendee = getAttendeeInfo(pendingToken);
                                if (!attendee) {
                                    return (
                                        <>
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                                <p className="text-red-600 dark:text-red-400">
                                                    ❌ Token tidak valid atau peserta tidak terdaftar
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleCancelScan}
                                                className={`w-full px-4 py-2 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER}`}
                                            >
                                                Tutup
                                            </button>
                                        </>
                                    );
                                }

                                return (
                                    <>
                                        <div className="mb-6">
                                            <div className="flex items-center mb-3">
                                                <div className="w-12 h-12 bg-accent-blue text-white rounded-full flex items-center justify-center text-xl mr-3">
                                                    👤
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>
                                                        {attendee.user_username}
                                                    </p>
                                                    <p className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                                                        Status saat ini: {attendee.status === 'present' ? 'Hadir' : attendee.status === 'absent' ? 'Tidak Hadir' : 'Terdaftar'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {attendee.status === 'present' && (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                                        ℹ️ Peserta ini sudah pernah hadir. Scan ini akan dicatat sebagai scan tambahan.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <p className={`${COLORS.TEXT_SECONDARY} mb-6 text-center`}>
                                            Apakah ini orang yang benar?
                                        </p>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleCancelScan}
                                                className={`flex-1 px-4 py-2 ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} rounded-lg border ${COLORS.BORDER}`}
                                                disabled={scanMutation.isPending}
                                            >
                                                Batalkan
                                            </button>
                                            <button
                                                onClick={handleConfirmScan}
                                                disabled={scanMutation.isPending}
                                                className={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50`}
                                            >
                                                {scanMutation.isPending ? 'Memproses...' : 'Ya, Konfirmasi'}
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardEventScanPage;
