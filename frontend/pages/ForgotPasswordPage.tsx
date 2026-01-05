import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/api/services';
import ParallaxBackground from '../components/ParallaxBackground';
import ThemeToggle from '../components/ThemeToggle';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Password baru tidak sama');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            await authService.forgotPassword({ username, newPassword });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Gagal mereset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full relative flex flex-col ${COLORS.BG_PRIMARY} overflow-hidden`}>
            {/* Parallax Background */}
            <ParallaxBackground intensity={0.6} zIndex={10} opacity={0.1} />

            {/* Notebook Lines Background Effect (Overlay) */}
            <div className="absolute inset-0 notebook-lines opacity-10 pointer-events-none z-0"></div>

            {/* Header */}
            <header className="relative px-6 py-5 flex justify-between items-center z-20">
                <Link
                    to="/login"
                    className={`flex items-center gap-3 ${COLORS.TEXT_PRIMARY} hover:scale-105 transition-all duration-300 group font-patrick font-bold text-lg`}
                >
                    <span className={`w-10 h-10 rounded-full border-2 border-dashed ${COLORS.BORDER} flex items-center justify-center group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-all duration-300`}>
                        ←
                    </span>
                    <span className="hidden sm:inline">Kembali ke Login</span>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className={`flex-1 flex items-center justify-center p-4 sm:p-6 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-full max-w-md">
                    <div className={`glass-card relative overflow-hidden w-full p-6 sm:p-8 rounded-lg shadow-xl border-2 border-dashed ${COLORS.BORDER}`}>
                        {/* Tape Effect */}
                        <div className="absolute -top-3 right-10 w-24 h-8 bg-red-100/80 dark:bg-red-900/30 -rotate-2 shadow-sm z-20"></div>

                        <div className="relative z-10">
                            <h2 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY} mb-2 text-center`}>Reset Password</h2>
                            <p className={`${COLORS.TEXT_SECONDARY} mb-6 text-center font-caveat text-xl`}>Masukkan username dan password baru</p>

                            {success ? (
                                <div className="p-6 bg-green-100 dark:bg-green-900/30 border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center gap-3 font-patrick transform rotate-1">
                                    <span className="text-3xl">✅</span>
                                    <p className="text-green-800 dark:text-green-200 text-lg font-bold text-center">
                                        Password berhasil direset! <br />
                                        <span className="text-base font-normal">Mengalihkan ke halaman login...</span>
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg mb-1 ml-1`}>
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                                            placeholder="username"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg mb-1 ml-1`}>
                                            Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg mb-1 ml-1`}>
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-dashed border-red-300 rounded-xl flex items-center gap-3 transform -rotate-1">
                                            <span className="text-xl">⚠️</span>
                                            <p className="text-red-800 dark:text-red-200 text-sm font-bold font-patrick">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full glass-button-warning ${COLORS.TEXT_PRIMARY} py-3.5 px-4 rounded-lg shadow-lg font-bold font-patrick text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-white`}
                                        style={{ backgroundColor: 'rgb(245 158 11)' }}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mereset Password...
                                            </span>
                                        ) : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            <p className={`text-sm text-center mt-6 ${COLORS.TEXT_SECONDARY} font-patrick`}>
                                Ingat password?{' '}
                                <Link to="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-bold">
                                    Login di sini
                                </Link>
                            </p>
                        </div>
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

export default ForgotPasswordPage;
