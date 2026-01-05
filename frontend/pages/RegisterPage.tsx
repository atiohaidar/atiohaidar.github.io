import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/api/services';

import ThemeToggle from '../components/ThemeToggle';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
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

        if (password !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            await authService.register({ username, name, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Registrasi gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full relative flex flex-col ${COLORS.BG_PRIMARY} overflow-hidden`}>


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
                    <div className={`glass-panel relative overflow-hidden w-full p-6 sm:p-8`}>
                        {/* Tape Effect */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-green-100/80 dark:bg-green-900/30 rotate-1 shadow-sm z-20"></div>

                        <div className="relative z-10">
                            <h2 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY} mb-2 text-center`}>Daftar Akun</h2>
                            <p className={`${COLORS.TEXT_SECONDARY} mb-6 text-center font-caveat text-xl`}>Buat akun baru untuk mengakses dashboard</p>

                            {success ? (
                                <div className="p-6 bg-green-100 dark:bg-green-900/30 border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center gap-3 font-patrick transform rotate-1">
                                    <span className="text-3xl">✅</span>
                                    <p className="text-green-800 dark:text-green-200 text-lg font-bold text-center">
                                        Registrasi berhasil! <br />
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
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg mb-1 ml-1`}>
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 active:bg-transparent`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-lg mb-1 ml-1`}>
                                            Konfirmasi Password
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
                                        className={`w-full glass-button-green ${COLORS.TEXT_PRIMARY} py-3.5 px-4 rounded-lg shadow-lg font-bold font-patrick text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2`}
                                        style={{ backgroundColor: 'var(--color-button-primary)' }}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mendaftarkan...
                                            </span>
                                        ) : 'Daftar'}
                                    </button>
                                </form>
                            )}

                            <p className={`text-sm text-center mt-6 ${COLORS.TEXT_SECONDARY} font-patrick`}>
                                Sudah punya akun?{' '}
                                <Link to="/login" className={`${COLORS.TEXT_ACCENT} hover:underline font-bold`}>
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

export default RegisterPage;
