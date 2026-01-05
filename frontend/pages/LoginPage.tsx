import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../components/Login';

import ThemeToggle from '../components/ThemeToggle';
import { getAuthToken, getStoredUser } from '../lib/api';
import type { LoginResponse } from '../lib/api/types';
import TypewriterText from '../components/TypewriterText';
import { COLORS } from '../utils/styles';
import { Typography, Heading, Text } from '../components/ui';

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
        <div className={`min-h-screen w-full relative flex flex-col ${COLORS.BG_PRIMARY} overflow-y-auto overflow-x-hidden`}>


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
                <div className="w-full max-w-6xl flex flex-col items-center lg:flex-row gap-12 lg:gap-20">
                    {/* Left Section - Welcome Text */}
                    <div className="flex-1 space-y-8 text-center lg:text-left relative max-w-xl">
                        {/* Decorative Circle */}
                        <div className="hand-drawn-circle absolute -top-10 -left-10 w-32 h-32 opacity-20 pointer-events-none hidden lg:block text-blue-500"></div>

                        <div className="space-y-4 relative z-10">
                            <Heading level={1} className={`${COLORS.TEXT_PRIMARY} leading-tight min-h-[4rem] sm:min-h-[5rem]`}>
                                <TypewriterText
                                    texts={["ꦮꦶꦭꦸꦗꦺꦁ ꦱꦸꦩ꧀ꦥꦶꦁ", "Selamat Datang", "Welcome", "مرحبا"]}
                                    typingSpeed={100}
                                    deletingSpeed={50}
                                    delayBetween={1000}
                                />
                            </Heading>
                            <Typography variant="h3" as="p" className={`${COLORS.TEXT_SECONDARY} max-w-lg mx-auto lg:mx-0 font-medium`}>
                                Masuk ke dashboard untuk mengakses lebih banyak fitur backend yang sudah tersedia
                            </Typography>
                        </div>

                        {/* Info Login Section */}
                        <div className={`mt-10 p-6 border-2 border-dashed ${COLORS.BORDER} relative rounded-xl bg-white/30 dark:bg-black/10 backdrop-blur-sm`}>
                            <div className="absolute -top-4 left-1/2 lg:left-6 transform -translate-x-1/2 lg:translate-x-0 bg-marker-yellow dark:bg-yellow-900 text-slate-900 dark:text-yellow-100 px-4 py-1 rotate-[-2deg] shadow-sm rounded-sm z-10">
                                <Typography variant="caption" className="font-bold uppercase tracking-wider">Info Login</Typography>
                            </div>

                            <Text className={`text-center lg:text-left ${COLORS.TEXT_SECONDARY} mb-4 mt-2`}>
                                Gunakan akun demo berikut untuk mencoba:
                            </Text>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border-2 ${COLORS.BORDER} bg-white/60 dark:bg-white/5 hover:rotate-1 transition-transform cursor-help shadow-sm text-left`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Typography variant="h4" className="text-blue-600 dark:text-blue-300">Admin</Typography>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-mono">Full Access</span>
                                    </div>
                                    <div className={`text-sm ${COLORS.TEXT_PRIMARY} font-mono space-y-1`}>
                                        <div>User: admin</div>
                                        <div>Pass: admin123</div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-xl border-2 ${COLORS.BORDER} bg-white/60 dark:bg-white/5 hover:-rotate-1 transition-transform cursor-help shadow-sm text-left`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Typography variant="h4" className="text-green-600 dark:text-green-300">User</Typography>
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full font-mono">Limited</span>
                                    </div>
                                    <div className={`text-sm ${COLORS.TEXT_PRIMARY} font-mono space-y-1`}>
                                        <div>User: user</div>
                                        <div>Pass: user123</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="flex-1 w-full max-w-md relative">
                        {/* Underline Decoration */}
                        <div className="absolute -bottom-10 right-0 w-full h-8 hand-drawn-underline opacity-30 pointer-events-none hidden lg:block text-purple-500 bg-contain bg-no-repeat bg-center"></div>

                        <Login onLoginSuccess={handleLoginSuccess} navigateDelay={1000} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-8 px-6 text-center">
                <Typography variant="caption" className={`${COLORS.TEXT_SECONDARY} opacity-70`}>
                    &copy; {new Date().getFullYear()} Atio Haidar. All rights reserved.
                </Typography>
            </footer>
        </div>
    );
};

export default LoginPage;
