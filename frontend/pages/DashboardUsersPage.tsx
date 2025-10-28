import React from 'react';
import UsersManager from '../components/UsersManager';

const DashboardUsersPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Manajemen Pengguna</h2>
                <p className="text-soft-gray text-sm">
                    Kelola pengguna aplikasi (hanya untuk admin)
                </p>
            </div>
            <UsersManager />
        </div>
    );
};

export default DashboardUsersPage;
