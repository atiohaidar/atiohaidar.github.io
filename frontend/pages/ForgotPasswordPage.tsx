import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/api/services';

import ThemeToggle from '../components/ThemeToggle';
import { COLORS } from '../utils/styles';
import { Card, Input, Button, Heading, Typography } from '../components/ui';

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
                    <Card variant="glass" className="relative overflow-hidden w-full p-6 sm:p-8" padding="none">
                        {/* Tape Effect */}
                        <div className="absolute -top-3 right-10 w-24 h-8 bg-red-100/80 dark:bg-red-900/30 -rotate-2 shadow-sm z-20"></div>

                        <div className="relative z-10 p-6 sm:p-8">
                            <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-2 text-center`}>Reset Password</Heading>
                            <Typography variant="body" className={`${COLORS.TEXT_SECONDARY} mb-6 text-center font-caveat text-xl`}>Masukkan username dan password baru</Typography>

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
                                    <Input
                                        label="Username"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        fullWidth
                                    />

                                    <Input
                                        label="Password Baru"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        fullWidth
                                    />

                                    <Input
                                        label="Konfirmasi Password Baru"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        fullWidth
                                    />

                                    {error && (
                                        <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-dashed border-red-300 rounded-xl flex items-center gap-3 transform -rotate-1">
                                            <span className="text-xl">⚠️</span>
                                            <p className="text-red-800 dark:text-red-200 text-sm font-bold font-patrick">{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isLoading}
                                        fullWidth
                                        size="lg"
                                        className="mt-2 text-white font-patrick text-xl"
                                        style={{ backgroundColor: 'rgb(245 158 11)' }} // Keep specific inline style for warning color match if variant warning isn't exact match or to be safe
                                    >
                                        {isLoading ? 'Mereset Password...' : 'Reset Password'}
                                    </Button>
                                </form>
                            )}

                            <div className={`text-sm text-center mt-6 ${COLORS.TEXT_SECONDARY} font-patrick`}>
                                Ingat password?{' '}
                                <Link to="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-bold">
                                    Login di sini
                                </Link>
                            </div>
                        </div>
                    </Card>
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
