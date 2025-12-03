import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getAuthToken, getStoredUser } from '../lib/api';
import { COLORS } from '../utils/styles';

interface StoredUser {
    username: string;
    name: string;
    role: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();

        if (!token || !storedUser) {
            navigate('/login', { replace: true });
            return;
        }

        setUser(storedUser);
        setCheckingAuth(false);
    }, [navigate]);

    if (checkingAuth) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} ${COLORS.TEXT_ACCENT} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                    <p>Memeriksa sesi pengguna...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <DashboardLayout user={user}>
            <Outlet />
        </DashboardLayout>
    );
};

export default DashboardPage;

