import React from 'react';
import UsersManager from '../components/UsersManager';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';

const DashboardUsersPage: React.FC = () => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>Manajemen Pengguna</h2>
                <p className={`text-sm ${palette.panel.textMuted}`}>
                    Kelola pengguna aplikasi (hanya untuk admin)
                </p>
            </div>
            <UsersManager />
        </div>
    );
};

export default DashboardUsersPage;
