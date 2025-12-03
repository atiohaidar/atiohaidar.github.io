import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { getAuthToken, getStoredUser } from '../lib/api';
import { COLORS } from '../utils/styles';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLoginSuccess = () => {
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY} text-light-muted dark:text-light-slate transition-colors duration-300`}>
            <header className="px-6 py-4 flex justify-between items-center border-b border-gray-300 dark:border-light-slate/20">
                <Link to="/" className="text-light-accent dark:text-accent-blue font-semibold">
                    &larr; Kembali ke Landing Page
                </Link>
                <span className="text-sm text-light-muted dark:text-soft-gray">Dashboard Backend</span>
            </header>
            <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl font-bold text-light-text dark:text-white">Login ke Dashboard</h1>
                    <p className="text-light-muted dark:text-soft-gray leading-relaxed">
                        Gunakan kredensial demo untuk mengakses fitur manajemen pengguna dan tugas. Role admin akan mendapatkan
                        akses penuh untuk mengelola pengguna, sedangkan role member dapat mencoba fitur todo list.
                    </p>
                    <p className="text-sm text-light-muted/80 dark:text-soft-gray/80">
                        Belum punya akun? Hubungi administrator untuk dibuatkan akun baru.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    <Login onLoginSuccess={handleLoginSuccess} />
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
