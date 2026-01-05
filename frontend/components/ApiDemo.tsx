/**
 * @file Ajakan untuk mencoba dashboard Backend pada route terpisah
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from './Section';
import { COLORS } from '../utils/styles';
import { Card } from './ui';
import { getAuthToken, getStoredUser } from '../apiClient';

const ApiDemo: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        setIsAuthenticated(Boolean(token && storedUser));
    }, []);

    return (
        <Section id="backend" number="05" title="Backend" className="transition-colors duration-300">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <p className={`${COLORS.TEXT_SECONDARY} text-xl font-patrick max-w-2xl mx-auto leading-relaxed`}>
                    Dashboard Backend sekarang berada pada halaman terpisah. Kamu bisa mencoba autentikasi, mengelola todo list,
                    serta—jika login sebagai admin—mengatur data pengguna secara real-time dari backend Worker.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <Card className="h-full flex flex-col justify-center">
                        <div className="space-y-3">
                            <h3 className={`text-xl font-bold font-patrick ${COLORS.TEXT_PRIMARY}`}>Untuk Semua Pengguna</h3>
                            <ul className={`${COLORS.TEXT_MUTED} text-lg font-patrick space-y-2 list-disc list-inside`}>
                                <li>Mencoba proses login menggunakan kredensial demo</li>
                                <li>Membuat, memfilter, dan menghapus tugas pada todo list</li>
                                <li>Merasakan alur kerja full-stack dari frontend hingga backend</li>
                            </ul>
                        </div>
                    </Card>
                    <Card className="h-full flex flex-col justify-center">
                        <div className="space-y-3">
                            <h3 className={`text-xl font-bold font-patrick ${COLORS.TEXT_PRIMARY}`}>Fitur Admin</h3>
                            <ul className={`${COLORS.TEXT_MUTED} text-lg font-patrick space-y-2 list-disc list-inside`}>
                                <li>Membuat akun baru beserta role</li>
                                <li>Memperbarui nama atau password pengguna</li>
                                <li>Menghapus akun yang tidak diperlukan</li>
                            </ul>
                        </div>
                    </Card>
                </div>

                <div className="pt-6">
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-bold font-patrick text-xl transition-transform hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] 
                        bg-marker-blue text-slate-900 border-2 border-slate-800 hover:bg-blue-200 
                        dark:bg-slate-700 dark:text-white dark:border-chalk-blue dark:hover:bg-slate-600`}
                    >
                        {isAuthenticated ? 'Buka Dashboard' : 'Coba Dashboard Sekarang'}
                    </Link>
                </div>

            </div>
        </Section>
    );
};

export default ApiDemo;
