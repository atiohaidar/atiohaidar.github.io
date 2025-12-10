import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import ParallaxBackground from '../components/ParallaxBackground';
import { getAuthToken, getStoredUser } from '../lib/api';
import type { LoginResponse } from '../lib/api/types';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLoginSuccess = (_response: LoginResponse) => {
        // Login successful - navigate to dashboard
        // BackendLoader animation is handled inside Login component
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-light-bg dark:bg-deep-navy overflow-hidden">
            {/* Parallax Background */}
            <ParallaxBackground intensity={0.6} />

            <header className="absolute top-0 left-0 right-0 px-6 py-6 flex justify-between items-center z-20">
                <Link to="/" className="flex items-center gap-2 text-light-muted dark:text-light-slate hover:text-accent-blue transition-colors">
                    <span>←</span> Kembali ke Landing Page
                </Link>
            </header>

            <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center z-10">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-5xl font-bold text-light-text dark:text-white">
                        Welcome Back.
                    </h1>
                    <p className="text-lg text-light-muted dark:text-soft-gray leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Masuk ke Dashboard untuk mengelola konten, memantau tiket, dan melihat statistik project Anda.
                    </p>
                    <div className="hidden lg:flex gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 border-2 border-white dark:border-deep-navy flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                    {i}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center text-sm text-light-muted dark:text-soft-gray">
                            <span className="font-bold text-accent-blue mr-1">Entah berapa</span> users yang join
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md">
                    {/* navigateDelay: delay in ms after login success before navigating to dashboard */}
                    {/* Set to 0 for immediate, or higher value to let BackendLoader animation play longer */}
                    <Login onLoginSuccess={handleLoginSuccess} navigateDelay={3200} />
                    <div className="text-sm text-center mt-6 space-y-2">
                        <p className="text-light-muted/80 dark:text-soft-gray/60">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Daftar di sini
                            </Link>
                        </p>
                        <p className="text-light-muted/80 dark:text-soft-gray/60">
                            <Link to="/forgot-password" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                                Lupa Password?
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
