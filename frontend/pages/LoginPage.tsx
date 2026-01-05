import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import ParallaxBackground from '../components/ParallaxBackground';
import ThemeToggle from '../components/ThemeToggle';
import { getAuthToken, getStoredUser } from '../lib/api';
import type { LoginResponse } from '../lib/api/types';
import TypewriterText from '../components/TypewriterText';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

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
        <div className={`min-h-screen w-full relative flex flex-col ${COLORS.BG_PRIMARY} overflow-y-auto`}>
            {/* Parallax Background */}
            <ParallaxBackground intensity={0.01} zIndex={10} opacity={0.1} />

            {/* Notebook Lines Background Effect (Overlay) */}
            <div className="absolute inset-0 notebook-lines opacity-10 pointer-events-none z-0"></div>

            {/* Header */}
            <header className="relative px-6 py-5 flex justify-between items-center z-20">
                <Link
                    to="/"
                    className={`flex items-center gap-3 ${COLORS.TEXT_PRIMARY} hover:scale-105 transition-all duration-300 group font-patrick font-bold text-lg`}
                >
                    <span className={`w-10 h-10 rounded-full border-2 border-dashed ${COLORS.BORDER} flex items-center justify-center group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-all duration-300`}>
                        ←
                    </span>
                    <span className="hidden sm:inline">Kembali</span>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-full max-w-6xl flex flex-col items-center lg:flex-row gap-8 lg:gap-12">
                    {/* Left Section - Welcome Text */}
                    <div className="flex-1 space-y-6 text-center lg:text-left relative">
                        {/* Decorative Circle */}
                        <div className="hand-drawn-circle absolute -top-10 -left-10 w-32 h-32 opacity-20 pointer-events-none hidden lg:block text-blue-500"></div>

                        <div className="space-y-2 relative z-10">
                            <h1 className={`${TYPOGRAPHY.HEADING_PAGE} ${COLORS.TEXT_PRIMARY} min-h-[2.5rem] sm:min-h-[3.5rem] lg:min-h-[4rem]`}>
                                <TypewriterText
                                    texts={["ꦮꦶꦭꦸꦗꦺꦁ ꦱꦸꦩ꧀ꦥꦶꦁ", "Selamat Datang", "Welcome", "مرحبا"]}
                                    typingSpeed={100}
                                    deletingSpeed={50}
                                    delayBetween={1000}
                                />
                            </h1>
                        </div>

                        <p className={`text-base sm:text-lg ${COLORS.TEXT_SECONDARY} leading-relaxed max-w-lg mx-auto lg:mx-0 font-caveat text-xl`}>
                            Masuk ke dashboard untuk mengakses lebih banyak fitur backend yang sudah tersedia
                        </p>

                        <div className={`mt-8 pt-6 border-t-2 border-dashed ${COLORS.BORDER} relative`}>
                            <div className="absolute top-0 left-1/2 lg:left-0 transform -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rotate-[-2deg] shadow-sm rounded-sm">
                                <p className={`text-xs ${COLORS.TEXT_PRIMARY} font-bold uppercase tracking-wider font-patrick`}>Info Login</p>
                            </div>

                            <p className={`text-sm text-center lg:text-left ${COLORS.TEXT_SECONDARY} mb-4 font-patrick`}>Kalo mau nyoba login:</p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 text-sm font-patrick">
                                <div className={`px-4 py-3 rounded-tr-xl rounded-bl-xl border-2 ${COLORS.BORDER} bg-white/50 dark:bg-white/5 hover:rotate-1 transition-transform cursor-help shadow-sm`}>
                                    <div className="font-bold text-blue-600 dark:text-blue-300">Admin</div>
                                    <div className={`${COLORS.TEXT_PRIMARY}`}>user: <span className="font-mono">admin</span></div>
                                    <div className={`${COLORS.TEXT_PRIMARY}`}>pass: <span className="font-mono">admin123</span></div>
                                </div>
                                <div className={`px-4 py-3 rounded-tl-xl rounded-br-xl border-2 ${COLORS.BORDER} bg-white/50 dark:bg-white/5 hover:-rotate-1 transition-transform cursor-help shadow-sm`}>
                                    <div className="font-bold text-green-600 dark:text-green-300">User</div>
                                    <div className={`${COLORS.TEXT_PRIMARY}`}>user: <span className="font-mono">user</span></div>
                                    <div className={`${COLORS.TEXT_PRIMARY}`}>pass: <span className="font-mono">user123</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="flex-1 w-full max-w-md relative">
                        {/* Underline Decoration */}
                        <div className="absolute -bottom-10 right-0 w-full h-4 hand-drawn-underline opacity-30 pointer-events-none hidden lg:block text-purple-500"></div>

                        <Login onLoginSuccess={handleLoginSuccess} navigateDelay={1000} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-6 px-6 text-center">
                <p className={`text-sm ${COLORS.TEXT_SECONDARY} font-caveat`}>
                    Sebuah website random &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;
