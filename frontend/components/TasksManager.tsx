/**
 * @file Tasks management component
 */
import React, { useState } from 'react';
import { useTasks, useCreateTask, useDeleteTask } from '../hooks/useApi';
import { COLORS } from '../utils/styles';
import type { TaskCreate } from '../apiTypes';

const TasksManager: React.FC = () => {
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const { data: tasks, isLoading, error } = useTasks({ isCompleted: filter });
    const createTaskMutation = useCreateTask();
    const deleteTaskMutation = useDeleteTask();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState<TaskCreate>({
        slug: '',
        name: '',
        description: '',
        completed: false,
    });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTaskMutation.mutateAsync(newTask);
            setNewTask({ slug: '', name: '', description: '', completed: false });
            setShowCreateForm(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleDeleteTask = async (slug: string) => {
        if (window.confirm(`Are you sure you want to delete task "${slug}"?`)) {
            try {
                await deleteTaskMutation.mutateAsync(slug);
            } catch (error) {
                // Error handled by mutation
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-8 text-light-slate">Loading tasks...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className={`text-xl font-bold ${COLORS.TEXT_ACCENT}`}>Tasks Management</h3>
                
                <div className="flex gap-2 items-center flex-wrap">
                    <select
                        value={filter === undefined ? 'all' : filter ? 'completed' : 'incomplete'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilter(val === 'all' ? undefined : val === 'completed');
                        }}
                        className="px-3 py-2 bg-light-navy border border-soft-gray/30 rounded-lg text-light-slate text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    >
                        <option value="all">All Tasks</option>
                        <option value="completed">Completed</option>
                        <option value="incomplete">Incomplete</option>
                    </select>
                    
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={`px-4 py-2 ${COLORS.BG_ACCENT} text-deep-navy font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                    >
                        {showCreateForm ? 'Cancel' : 'Create Task'}
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateTask} className="bg-light-navy p-6 rounded-lg space-y-4">
                    <h4 className="text-lg font-semibold text-light-slate">Create New Task</h4>
                    
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Slug (unique identifier, e.g., 'clean-room')"
                            value={newTask.slug}
                            onChange={(e) => setNewTask({ ...newTask, slug: e.target.value })}
                            className="w-full px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Task name"
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                            className="w-full px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                            rows={3}
                        />
                        <label className="flex items-center gap-2 text-light-slate">
                            <input
                                type="checkbox"
                                checked={newTask.completed}
                                onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
                                className="w-4 h-4 bg-deep-navy border border-soft-gray/30 rounded"
                            />
                            <span>Mark as completed</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={createTaskMutation.isPending}
                        className={`px-6 py-2 ${COLORS.BG_ACCENT} text-deep-navy font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                    </button>

                    {createTaskMutation.isError && (
                        <p className="text-red-400 text-sm">{createTaskMutation.error?.message}</p>
                    )}
                </form>
            )}

            <div className="space-y-3">
                {tasks && tasks.length === 0 ? (
                    <div className="text-center py-8 text-soft-gray">
                        No tasks found. Create one to get started!
                    </div>
                ) : (
                    tasks?.map((task) => (
                        <div key={task.slug} className="bg-light-navy p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-light-slate font-semibold">{task.name}</h4>
                                        {task.completed ? (
                                            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                                                ✓ Completed
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                                                ○ Pending
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className="text-soft-gray text-sm mb-2">{task.description}</p>
                                    )}
                                    <p className="text-soft-gray text-xs">
                                        Slug: {task.slug}
                                        {task.created_at && ` • Created: ${new Date(task.created_at).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteTask(task.slug)}
                                    disabled={deleteTaskMutation.isPending}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 ml-4"
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
