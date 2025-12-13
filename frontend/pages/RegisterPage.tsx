import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/api/services';
import ParallaxBackground from '../components/ParallaxBackground';
import ThemeToggle from '../components/ThemeToggle';

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
        <div className="min-h-screen w-full relative flex flex-col bg-light-bg dark:bg-deep-navy overflow-hidden">
            {/* Parallax Background */}
            {/* <ParallaxBackground intensity={0.6} /> */}

            {/* Header */}
            <header className="relative px-6 py-5 flex justify-between items-center z-20">
                <Link
                    to="/login"
                    className="flex items-center gap-3 text-light-text dark:text-white hover:text-green-500 dark:hover:text-green-400 transition-all duration-300 group"
                >
                    <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                        ←
                    </span>
                    <span className="hidden sm:inline font-medium">Kembali ke Login</span>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className={`flex-1 flex items-center justify-center p-4 sm:p-6 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-full max-w-md">
                    <div className="glass-panel relative overflow-hidden w-full p-6 sm:p-8 rounded-2xl shadow-xl">
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-green-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            Buat Akun
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">Daftar Akun</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Buat akun baru untuk mengakses dashboard</p>

                            {success ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                    <span className="text-xl">✅</span>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                                        Registrasi berhasil! Mengalihkan ke halaman login...
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                            placeholder="username"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                            Konfirmasi Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                            <span className="text-xl">⚠️</span>
                                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none mt-2"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mendaftarkan...
                                            </span>
                                        ) : 'Daftar'}
                                    </button>
                                </form>
                            )}

                            <p className="text-sm text-center mt-6 text-gray-500 dark:text-gray-400">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                                    Login di sini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-4 px-6 text-center">
                <p className="text-xs text-light-muted/60 dark:text-soft-gray/40">
                    Sebuah website random
                </p>
            </footer>
        </div>
    );
};

export default RegisterPage;
