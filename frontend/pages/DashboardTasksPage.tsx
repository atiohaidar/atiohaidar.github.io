import React from 'react';
import TasksManager from '../components/TasksManager';

const DashboardTasksPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Kelola Todo List Anda</h2>
                <p className="text-soft-gray text-sm">
                    Buat, edit, dan hapus tugas-tugas Anda di sini
                </p>
            </div>
            <TasksManager />
        </div>
    );
};

export default DashboardTasksPage;
