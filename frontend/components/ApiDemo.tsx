/**
 * @file Ajakan untuk mencoba dashboard Backend pada route terpisah
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from './Section';
import { COLORS } from '../utils/styles';
import { Card, Text, Heading, Button } from './ui';
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
                <Text className={`${COLORS.TEXT_SECONDARY} text-xl font-patrick max-w-2xl mx-auto leading-relaxed`}>
                    Dashboard Backend sekarang berada pada halaman terpisah. Kamu bisa mencoba autentikasi, mengelola todo list,
                    serta—jika login sebagai admin—mengatur data pengguna secara real-time dari backend Worker.
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <Card className="h-full flex flex-col justify-center">
                        <div className="space-y-3">
                            <Heading level={3} className={`text-xl font-bold font-patrick ${COLORS.TEXT_PRIMARY}`}>Untuk Semua Pengguna</Heading>
                            <ul className={`${COLORS.TEXT_MUTED} text-lg font-patrick space-y-2 list-disc list-inside`}>
                                <li><Text as="span">Mencoba proses login menggunakan kredensial demo</Text></li>
                                <li><Text as="span">Membuat, memfilter, dan menghapus tugas pada todo list</Text></li>
                                <li><Text as="span">Merasakan alur kerja full-stack dari frontend hingga backend</Text></li>
                            </ul>
                        </div>
                    </Card>
                    <Card className="h-full flex flex-col justify-center">
                        <div className="space-y-3">
                            <Heading level={3} className={`text-xl font-bold font-patrick ${COLORS.TEXT_PRIMARY}`}>Fitur Admin</Heading>
                            <ul className={`${COLORS.TEXT_MUTED} text-lg font-patrick space-y-2 list-disc list-inside`}>
                                <li><Text as="span">Membuat akun baru beserta role</Text></li>
                                <li><Text as="span">Memperbarui nama atau password pengguna</Text></li>
                                <li><Text as="span">Menghapus akun yang tidak diperlukan</Text></li>
                            </ul>
                        </div>
                    </Card>
                </div>

                <div className="pt-6">
                    <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                        <Button variant="primary" size="lg" className="font-patrick text-xl">
                            {isAuthenticated ? 'Buka Dashboard' : 'Coba Dashboard Sekarang'}
                        </Button>
                    </Link>
                </div>

            </div>
        </Section>
    );
};

export default ApiDemo;

