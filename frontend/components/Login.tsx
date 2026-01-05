/**
 * @file Login component for API authentication
 */
import React, { useState, useRef, useEffect } from 'react';
import { useLogin } from '../hooks/useApi';
import BackendLoader from './BackendLoader';
import type { LoginResponse } from '../lib/api/types';
import { notificationService } from '../utils/notificationService';
import { Link } from 'react-router-dom';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

// Get API base URL for server host display
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const parsedUrl = new URL(API_BASE_URL);
const serverHost = parsedUrl.host;
const isSecure = parsedUrl.protocol === 'https:';

interface LoginProps {
    onLoginSuccess: (userData: LoginResponse) => void;
    /** Delay in ms after login success before calling onLoginSuccess (default: 0 = immediate) */
    navigateDelay?: number;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, navigateDelay = 0 }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [loaderStatus, setLoaderStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [navigationTriggered, setNavigationTriggered] = useState(false);
    const [actualLatency, setActualLatency] = useState<number | undefined>(undefined);
    const [actualStatusCode, setActualStatusCode] = useState<number | undefined>(undefined);
    const loginMutation = useLogin();
    const responseRef = useRef<LoginResponse | null>(null);
    const navigateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const requestStartTime = useRef<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Show loader IMMEDIATELY when button is clicked
        setShowLoader(true);
        setLoaderStatus('loading');
        setErrorMessage(null);
        setNavigationTriggered(false);
        setActualLatency(undefined);
        setActualStatusCode(undefined);

        // Record start time for latency measurement
        requestStartTime.current = performance.now();

        try {
            const response = await loginMutation.mutateAsync({ username, password });

            // Calculate actual latency
            const latency = Math.round(performance.now() - requestStartTime.current);
            setActualLatency(latency);
            setActualStatusCode(200); // Success = 200

            // Trigger Local Notification
            notificationService.scheduleSimpleNotification(
                'Login Berhasil',
                `Selamat datang kembali, ${response.user.name}!`
            );

            // Store response and update status
            responseRef.current = response;
            setLoaderStatus('success');

            // Start navigate delay timer immediately after login success
            // This is INDEPENDENT of BackendLoader animation
            navigateTimerRef.current = setTimeout(() => {
                setNavigationTriggered(true);
            }, navigateDelay);

        } catch (error) {
            // Calculate actual latency even for errors
            const latency = Math.round(performance.now() - requestStartTime.current);
            setActualLatency(latency);

            // Try to extract status code from error
            let statusCode = 401; // Default error code
            if (error && typeof error === 'object' && 'status' in error) {
                statusCode = (error as { status: number }).status;
            }
            setActualStatusCode(statusCode);

            // Show error in loader
            setLoaderStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Gagal masuk. Mohon periksa kredensial Anda.');
        }
    };

    // Navigate when navigateDelay timer completes
    useEffect(() => {
        if (navigationTriggered && responseRef.current) {
            onLoginSuccess(responseRef.current);
        }
    }, [navigationTriggered, onLoginSuccess]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (navigateTimerRef.current) {
                clearTimeout(navigateTimerRef.current);
            }
        };
    }, []);

    const handleLoaderComplete = () => {
        // BackendLoader animation finished
        // If navigateDelay already passed, navigate now
        // Otherwise, wait for navigateDelay timer
        if (navigationTriggered && responseRef.current) {
            onLoginSuccess(responseRef.current);
        }
    };

    const handleLoaderDismiss = () => {
        // Called when user dismisses error state - go back to login form
        setShowLoader(false);
        setLoaderStatus('loading');
        setErrorMessage(null);
        setNavigationTriggered(false);
        if (navigateTimerRef.current) {
            clearTimeout(navigateTimerRef.current);
        }
    };

    // Show loader when active
    if (showLoader) {
        const userData = responseRef.current?.user;
        return (
            <BackendLoader
                status={loaderStatus}
                onComplete={handleLoaderComplete}
                onDismiss={handleLoaderDismiss}
                title="Sedang Mengotentikasi"
                subtitle="Memverifikasi kredensial Anda"
                successMessage={userData ? `Selamat datang kembali, ${userData.name}!` : undefined}
                errorMessage={errorMessage}
                responseData={userData ? {
                    username: userData.username,
                    name: userData.name,
                    role: userData.role,
                    balance: userData.balance
                } : undefined}
                endpoint="/api/auth/login"
                method="POST"
                completeDelay={0}
                actualLatency={actualLatency}
                actualStatusCode={actualStatusCode}
                serverHost={serverHost}
                isSecure={isSecure}
            />
        );
    }

    return (
        <div className={`glass-panel relative w-full max-w-md mx-auto p-8 animate-fade-in-up overflow-hidden`}>
            {/* Tape Effect */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100/80 dark:bg-yellow-900/30 rotate-1 shadow-sm z-20"></div>

            {/* Ambient Doodle */}
            <div className={`absolute top-0 right-0 p-4 opacity-10 pointer-events-none`}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                    <path d="M10 10C20 10 20 90 30 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M40 10C50 10 50 90 60 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            <div className="relative z-10">
                <h2 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY} mb-2 text-center`}>Balik Lagii</h2>
                <p className={`${COLORS.TEXT_SECONDARY} mb-8 text-center font-caveat text-xl`}>Masuk untuk mengelola dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg`}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin atau user"
                            required
                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg`}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full glass-button ${COLORS.TEXT_PRIMARY} py-3 px-6 rounded-lg mt-4 font-bold font-patrick text-xl hover:scale-[1.02] transition-transform shadow-md`}
                    >
                        Masuk
                    </button>
                </form>

                <div className="text-center mt-8 space-y-3 font-patrick">
                    <p className={`${COLORS.TEXT_SECONDARY}`}>
                        Belum punya akun?{' '}
                        <Link
                            to="/register"
                            className={`${COLORS.TEXT_ACCENT} hover:underline font-bold transition-colors`}
                        >
                            Daftar di sini
                        </Link>
                    </p>
                    <p className={`${COLORS.TEXT_SECONDARY}`}>
                        <Link
                            to="/forgot-password"
                            className="text-amber-600 dark:text-amber-400 hover:underline font-bold transition-colors"
                        >
                            Lupa Password?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
