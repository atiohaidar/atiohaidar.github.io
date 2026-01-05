import React from 'react';
import TasksManager from '../components/TasksManager';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

const DashboardTasksPage: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className={`${TYPOGRAPHY.HEADING_PAGE} ${COLORS.TEXT_PRIMARY}`}>Kelola Todo List Anda</h1>
                <p className={`${COLORS.TEXT_SECONDARY} text-lg font-caveat`}>
                    Buat, edit, dan hapus tugas-tugas Anda di sini
                </p>
            </div>
            <TasksManager />
        </div>
    );
};

export default DashboardTasksPage;
