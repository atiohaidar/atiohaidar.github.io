import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import ParallaxBackground from '../components/ParallaxBackground';
import ThemeToggle from '../components/ThemeToggle';
import { getAuthToken, getStoredUser } from '../lib/api';
import type { LoginResponse } from '../lib/api/types';
import TypewriterText from '../components/TypewriterText';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLoginSuccess = (_response: LoginResponse) => {
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen w-full relative flex flex-col bg-light-bg dark:bg-deep-navy overflow-hidden">
            {/* Parallax Background */}
            <ParallaxBackground intensity={0.6} />

            {/* Header */}
            <header className="relative px-6 py-5 flex justify-between items-center z-20">
                <Link
                    to="/"
                    className="flex items-center gap-3 text-light-text dark:text-white hover:text-accent-blue dark:hover:text-accent-blue transition-all duration-300 group"
                >
                    <span className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-all duration-300">
                        ←
                    </span>
                    <span className="hidden sm:inline font-medium">Kembali</span>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                    {/* Left Section - Welcome Text */}
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <div className="space-y-2">
                            Authentication Portal

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text dark:text-white min-h-[2.5rem] sm:min-h-[3.5rem] lg:min-h-[4rem]">
                                <TypewriterText
                                    texts={["ꦮꦶꦭꦸꦗꦺꦁ ꦱꦸꦩ꧀ꦥꦶꦁ", "Selamat Datang", "Welcome", "مرحبا"]}
                                    typingSpeed={100}
                                    deletingSpeed={50}
                                    delayBetween={1000}
                                />
                            </h1>
                        </div>

                        <p className="text-base sm:text-lg text-light-muted dark:text-soft-gray leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Masuk ke dashboard untuk mengakses lebih banyak fitur backend yang sudah tersedia
                        </p>

                        {/* Stats/Features Cards - Desktop Only */}
                        <div className="hidden lg:grid grid-cols-3 gap-4 pt-6">
                            <div className="glass-panel p-4 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
                                <div className="text-2xl font-bold text-accent-blue">10+</div>
                                <div className="text-xs text-light-muted dark:text-soft-gray mt-1">API Endpoints</div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
                                <div className="text-2xl font-bold text-green-500">24/7</div>
                                <div className="text-xs text-light-muted dark:text-soft-gray mt-1">Ketersediaan</div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
                                <div className="text-2xl font-bold text-purple-500">∞</div>
                                <div className="text-xs text-light-muted dark:text-soft-gray mt-1">Kemungkinan</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="flex-1 w-full max-w-md">
                        {/* Login component has its own glass-panel styling */}
                        <Login onLoginSuccess={handleLoginSuccess} navigateDelay={1000} />

                        <div className="text-sm text-center mt-6 space-y-3">
                            <p className="text-light-muted/80 dark:text-soft-gray/60">
                                Belum punya akun?{' '}
                                <Link
                                    to="/register"
                                    className="text-accent-blue hover:text-accent-blue/80 hover:underline font-medium transition-colors"
                                >
                                    Daftar di sini
                                </Link>
                            </p>
                            <p className="text-light-muted/80 dark:text-soft-gray/60">
                                <Link
                                    to="/forgot-password"
                                    className="text-amber-500 dark:text-amber-400 hover:underline font-medium transition-colors"
                                >
                                    Lupa Password?
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-4 px-6 text-center">
                <p className="text-xs text-light-muted/60 dark:text-soft-gray/40">
                    © {new Date().getFullYear()} Tio Haidar. Built with ❤️
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;
