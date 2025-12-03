import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../lib/api';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const user = getStoredUser();
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className={`${palette.badges.danger} border ${palette.panel.border} rounded-lg p-8 text-center`}>
                    <div className="text-5xl mb-4">🚫</div>
                    <h2 className={`text-2xl font-semibold ${palette.panel.text} mb-3`}>Akses Ditolak</h2>
                    <p className={`${palette.panel.textMuted} text-lg mb-3`}>
                        Halaman ini hanya dapat diakses oleh administrator.
                    </p>
                    <p className={`${palette.panel.textMuted} text-base`}>
                        Role Anda: <span className={`font-mono px-2 py-1 rounded ${palette.badges.info}`}>{user.role}</span>
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
