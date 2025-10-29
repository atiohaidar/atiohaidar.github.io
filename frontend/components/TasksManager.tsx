/**
 * @file Tasks management component
 */
import React, { useState } from 'react';
import { useTasks, useCreateTask, useDeleteTask } from '../hooks/useApi';
import { COLORS, DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import type { TaskCreate } from '../apiTypes';

const TasksManager: React.FC = () => {
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const { data: tasks, isLoading, error } = useTasks({ isCompleted: filter });
    const createTaskMutation = useCreateTask();
    const deleteTaskMutation = useDeleteTask();
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];

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
        return <div className={`text-center py-8 ${palette.panel.textMuted}`}>Loading tasks...</div>;
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg border border-status-danger/40 bg-status-danger-muted">
                <p className="text-status-danger-dark">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className={`text-xl font-bold ${palette.panel.text}`}>Tasks Management</h3>
                
                <div className="flex gap-2 items-center flex-wrap">
                    <select
                        value={filter === undefined ? 'all' : filter ? 'completed' : 'incomplete'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilter(val === 'all' ? undefined : val === 'completed');
                        }}
                        className={`px-3 py-2 rounded-lg text-sm ${palette.input}`}
                    >
                        <option value="all">All Tasks</option>
                        <option value="completed">Completed</option>
                        <option value="incomplete">Incomplete</option>
                    </select>
                    
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${palette.buttons.info}`}
                    >
                        {showCreateForm ? 'Cancel' : 'Create Task'}
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <form
                    onSubmit={handleCreateTask}
                    className={`${palette.panel.bg} ${palette.panel.border} ${palette.panel.text} p-6 rounded-lg space-y-4`}
                >
                    <h4 className={`text-lg font-semibold ${palette.panel.text}`}>Create New Task</h4>
                    
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Task name"
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg ${palette.input}`}
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg ${palette.input} resize-none`}
                            rows={3}
                        />
                        <label className="flex items-center gap-2 text-light-slate">
                            <input
                                type="checkbox"
                                checked={newTask.completed}
                                onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
                                className="w-4 h-4 rounded border border-status-info/40 bg-transparent text-accent-blue focus:ring-status-info"
                            />
                            <span>Mark as completed</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={createTaskMutation.isPending}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${palette.buttons.success} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                    </button>

                    {createTaskMutation.isError && (
                        <p className="text-sm text-status-danger-dark">{createTaskMutation.error?.message}</p>
                    )}
                </form>
            )}

            <div className="space-y-3">
                {tasks && tasks.length === 0 ? (
                    <div className={`text-center py-8 ${palette.panel.textMuted}`}>
                        No tasks found. Create one to get started!
                    </div>
                ) : (
                    tasks?.map((task) => (
                        <div key={task.id} className={`${palette.panel.bg} ${palette.panel.border} ${palette.panel.text} p-4 rounded-lg`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className={`font-semibold ${palette.panel.text}`}>{task.name}</h4>
                                        {task.completed ? (
                                            <span className={`px-2 py-1 text-xs rounded-full ${palette.badges.success}`}>
                                                ✓ Completed
                                            </span>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs rounded-full ${palette.badges.warning}`}>
                                                ○ Pending
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className={`${palette.panel.textMuted} text-sm mb-2`}>{task.description}</p>
                                    )}
                                    <p className={`${palette.panel.textMuted} text-xs`}>
                                        {task.created_at && `Created: ${new Date(task.created_at).toLocaleDateString()}`}
                                        {task.updated_at && ` • Updated: ${new Date(task.updated_at).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteTask(task.id, task.name)}
                                    disabled={deleteTaskMutation.isPending}
                                    className={`px-3 py-1 text-sm rounded transition-colors ml-4 ${palette.buttons.danger} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TasksManager;
