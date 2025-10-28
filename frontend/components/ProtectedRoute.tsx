import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../apiClient';
import { COLORS } from '../utils/styles';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const user = getStoredUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return (
            <div className="max-w-6xl mx-auto">
                <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center`}>
                    <div className="text-4xl mb-4">🚫</div>
                    <h2 className="text-xl font-semibold text-white mb-2">Akses Ditolak</h2>
                    <p className="text-soft-gray">
                        Halaman ini hanya dapat diakses oleh administrator.
                    </p>
                    <p className="text-soft-gray text-sm mt-2">
                        Role Anda: <span className={COLORS.TEXT_ACCENT}>{user.role}</span>
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
