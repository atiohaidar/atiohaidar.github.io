import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitService } from '../lib/api/services';
import type { HabitWithStats, HabitCreateInput, HabitUpdateInput, HabitPeriodType } from '../types/habit';

const DashboardHabitsPage: React.FC = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useState<HabitWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<HabitCreateInput>({
        name: '',
        description: '',
        period_type: 'daily',
        period_days: 1,
    });
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            setLoading(true);
            const data = await habitService.list();
            setHabits(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habits');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await habitService.create(formData);
            setShowCreateForm(false);
            setFormData({
                name: '',
                description: '',
                period_type: 'daily',
                period_days: 1,
            });
            loadHabits();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create habit');
        }
    };

    const handleUpdateHabit = async (habitId: string, updates: HabitUpdateInput) => {
        try {
            await habitService.update(habitId, updates);
            setEditingHabitId(null);
            loadHabits();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update habit');
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        if (!confirm('Are you sure you want to delete this habit?')) return;
        try {
            await habitService.delete(habitId);
            loadHabits();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete habit');
        }
    };

    const handleToggleCompletion = async (habit: HabitWithStats) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            if (habit.is_completed_today) {
                await habitService.unmarkComplete(habit.id, today);
            } else {
                await habitService.markComplete(habit.id, today);
            }
            loadHabits();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to toggle completion');
        }
    };

    const getPeriodLabel = (periodType: string, periodDays: number) => {
        if (periodType === 'daily') return 'Daily';
        if (periodType === 'weekly') return 'Weekly';
        if (periodType === 'monthly') return 'Monthly';
        return `Every ${periodDays} days`;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">Loading habits...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Habit Tracker</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showCreateForm ? 'Cancel' : '+ New Habit'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Create New Habit</h2>
                    <form onSubmit={handleCreateHabit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={3}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Period Type
                            </label>
                            <select
                                value={formData.period_type}
                                onChange={(e) => setFormData({ ...formData, period_type: e.target.value as HabitPeriodType })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        {formData.period_type === 'custom' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Days per Period
                                </label>
                                <input
                                    type="number"
                                    value={formData.period_days}
                                    onChange={(e) => setFormData({ ...formData, period_days: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    min="1"
                                    required
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Create Habit
                        </button>
                    </form>
                </div>
            )}

            {/* Habits List */}
            <div className="space-y-4">
                {habits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No habits yet. Create your first habit to get started!
                    </div>
                ) : (
                    habits.map((habit) => (
                        <div
                            key={habit.id}
                            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button
                                            onClick={() => handleToggleCompletion(habit)}
                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                                habit.is_completed_today
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {habit.is_completed_today && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <h3 className="text-lg font-semibold dark:text-white">
                                            {habit.name}
                                        </h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {getPeriodLabel(habit.period_type, habit.period_days)}
                                        </span>
                                    </div>
                                    {habit.description && (
                                        <p className="text-gray-600 dark:text-gray-300 mb-2 ml-9">
                                            {habit.description}
                                        </p>
                                    )}
                                    <div className="flex gap-4 text-sm ml-9">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 dark:text-gray-400">Streak:</span>
                                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                🔥 {habit.current_streak}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {habit.total_completions}/{habit.total_periods}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {habit.completion_percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/dashboard/habits/${habit.id}/history`)}
                                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                    >
                                        View History
                                    </button>
                                    <button
                                        onClick={() => handleDeleteHabit(habit.id)}
                                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3 ml-9">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${habit.completion_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardHabitsPage;
