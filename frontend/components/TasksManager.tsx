/**
 * @file Tasks management component
 */
import React, { useState } from 'react';
import { useTasks, useCreateTask, useDeleteTask } from '../hooks/useApi';
import { COLORS, TYPOGRAPHY } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import type { TaskCreate } from '../apiTypes';

const TasksManager: React.FC = () => {
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const { data: tasks, isLoading, error } = useTasks({ isCompleted: filter });
    const createTaskMutation = useCreateTask();
    const deleteTaskMutation = useDeleteTask();
    const { theme } = useTheme();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState<TaskCreate>({
        name: '',
        description: '',
        completed: false,
    });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTaskMutation.mutateAsync(newTask);
            setNewTask({ name: '', description: '', completed: false });
            setShowCreateForm(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleDeleteTask = async (taskId: number, taskName: string) => {
        if (window.confirm(`Are you sure you want to delete task "${taskName}"?`)) {
            try {
                await deleteTaskMutation.mutateAsync(taskId);
            } catch (error) {
                // Error handled by mutation
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <p className={`${COLORS.TEXT_SECONDARY} font-patrick text-xl animate-pulse`}>Sedang memuat daftar tugas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`glass-panel p-6 border-2 border-red-300 bg-red-50 dark:bg-red-900/20`}>
                <p className="text-red-700 dark:text-red-300 font-patrick text-lg">⚠️ {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 flex justify-between items-center flex-wrap gap-4">
                <h3 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY}`}>Daftar Tugas</h3>

                <div className="flex gap-3 items-center flex-wrap">
                    <select
                        value={filter === undefined ? 'all' : filter ? 'completed' : 'incomplete'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilter(val === 'all' ? undefined : val === 'completed');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-patrick font-bold bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5`}
                    >
                        <option value="all" className="dark:bg-slate-800">Semua Tugas</option>
                        <option value="completed" className="dark:bg-slate-800">Selesai</option>
                        <option value="incomplete" className="dark:bg-slate-800">Belum Selesai</option>
                    </select>

                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={`glass-button ${COLORS.TEXT_PRIMARY} font-bold font-patrick text-sm hover:scale-[1.02]`}
                    >
                        {showCreateForm ? 'Batal' : 'Buat Tugas Baru'}
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <form
                    onSubmit={handleCreateTask}
                    className={`glass-panel p-6 space-y-4 relative`}
                >
                    {/* Tape decoration */}
                    <div className="absolute -top-3 left-10 w-24 h-6 bg-blue-200/80 dark:bg-blue-800/50 shadow-sm -rotate-2 z-20"></div>

                    <h4 className={`${TYPOGRAPHY.HEADING_SECTION} ${COLORS.TEXT_PRIMARY} text-lg`}>Buat Tugas Baru</h4>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nama tugas..."
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5`}
                            required
                        />
                        <textarea
                            placeholder="Deskripsi (opsional)..."
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className={`w-full px-4 py-3 bg-transparent border-b-2 ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:border-[${COLORS.TEXT_ACCENT}] transition-colors font-patrick placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-t-lg hover:bg-black/5 dark:hover:bg-white/5 resize-none`}
                            rows={3}
                        />
                        <label className={`flex items-center gap-2 ${COLORS.TEXT_SECONDARY} font-patrick cursor-pointer`}>
                            <input
                                type="checkbox"
                                checked={newTask.completed}
                                onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
                                className="w-5 h-5 rounded border-2 border-gray-400 bg-transparent text-blue-500 focus:ring-0 checked:bg-blue-500"
                            />
                            <span>Tandai sebagai selesai</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={createTaskMutation.isPending}
                            className={`glass-button bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 font-bold font-patrick px-6 disabled:opacity-50`}
                        >
                            {createTaskMutation.isPending ? 'Menyimpan...' : 'Simpan Tugas'}
                        </button>
                    </div>

                    {createTaskMutation.isError && (
                        <p className="text-sm text-red-600 dark:text-red-400 font-patrick">⚠️ {createTaskMutation.error?.message}</p>
                    )}
                </form>
            )}

            <div className="space-y-4">
                {tasks && tasks.length === 0 ? (
                    <div className={`glass-panel p-12 text-center`}>
                        <p className={`text-xl font-patrick ${COLORS.TEXT_SECONDARY}`}>Tidak ada tugas ditemukan. Buat satu untuk memulai!</p>
                        <p className="text-4xl mt-3">📝</p>
                    </div>
                ) : (
                    tasks?.map((task) => (
                        <div key={task.id} className={`glass-panel p-4 flex flex-col sm:flex-row justify-between items-start gap-4 transition-transform hover:-translate-y-1`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h4 className={`text-lg font-bold font-patrick ${COLORS.TEXT_PRIMARY} leading-tight`}>{task.name}</h4>
                                    {task.completed ? (
                                        <span className={`px-2 py-0.5 text-xs font-bold font-patrick rounded border-2 border-green-400 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200`}>
                                            ✓ Selesai
                                        </span>
                                    ) : (
                                        <span className={`px-2 py-0.5 text-xs font-bold font-patrick rounded border-2 border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`}>
                                            ○ Pending
                                        </span>
                                    )}
                                </div>
                                {task.description && (
                                    <p className={`${COLORS.TEXT_SECONDARY} text-sm mb-2 font-patrick`}>{task.description}</p>
                                )}
                                <p className={`${COLORS.TEXT_MUTED} text-xs font-patrick`}>
                                    {task.created_at && `Dibuat: ${new Date(task.created_at).toLocaleDateString()}`}
                                    {task.updated_at && ` • Diupdate: ${new Date(task.updated_at).toLocaleDateString()}`}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteTask(task.id, task.name)}
                                disabled={deleteTaskMutation.isPending}
                                className={`px-3 py-1.5 text-xs font-bold font-patrick text-red-600 dark:text-red-400 border border-dashed border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50`}
                            >
                                Hapus
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TasksManager;
