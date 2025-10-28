/**
 * @file Ajakan untuk mencoba dashboard API demo pada route terpisah
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from './Section';
import { COLORS } from '../utils/styles';
import { getAuthToken, getStoredUser } from '../apiClient';

const ApiDemo: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        setIsAuthenticated(Boolean(token && storedUser));
    }, []);

    return (
        <Section id="api-demo" number="05" title="API Demo" className="bg-deep-navy">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <p className="text-light-slate">
                    Dashboard API demo sekarang berada pada halaman terpisah. Kamu bisa mencoba autentikasi, mengelola todo list,
                    serta—jika login sebagai admin—mengatur data pengguna secara real-time dari backend Worker.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="bg-light-navy/40 border border-soft-gray/20 rounded-xl p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-white">Untuk Semua Pengguna</h3>
                        <ul className="text-soft-gray text-sm space-y-2 list-disc list-inside">
                            <li>Mencoba proses login menggunakan kredensial demo</li>
                            <li>Membuat, memfilter, dan menghapus tugas pada todo list</li>
                            <li>Merasakan alur kerja full-stack dari frontend hingga backend</li>
                        </ul>
                    </div>
                    <div className="bg-light-navy/40 border border-soft-gray/20 rounded-xl p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-white">Fitur Admin</h3>
                        <ul className="text-soft-gray text-sm space-y-2 list-disc list-inside">
                            <li>Membuat akun baru beserta role</li>
                            <li>Memperbarui nama atau password pengguna</li>
                            <li>Menghapus akun yang tidak diperlukan</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-2">
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors ${COLORS.BG_ACCENT} ${COLORS.TEXT_PRIMARY} hover:opacity-90`}
                    >
                        {isAuthenticated ? 'Buka Dashboard' : 'Coba Dashboard Sekarang'}
                    </Link>
                </div>
            </div>
        </Section>
    );
};

export default ApiDemo;
