import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { habitService } from '../lib/api/services';
import type { HabitWithStats, HabitCompletion } from '../types/habit';

const DashboardHabitHistoryPage: React.FC = () => {
    const { habitId } = useParams<{ habitId: string }>();
    const navigate = useNavigate();
    const [habit, setHabit] = useState<HabitWithStats | null>(null);
    const [completions, setCompletions] = useState<HabitCompletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month' | '3months' | 'all'>('month');

    useEffect(() => {
        if (habitId) {
            loadHabitData();
        }
    }, [habitId, dateRange]);

    const loadHabitData = async () => {
        if (!habitId) return;
        
        try {
            setLoading(true);
            const [habitData, completionsData] = await Promise.all([
                habitService.get(habitId),
                habitService.getCompletions(habitId, getStartDate(), undefined)
            ]);
            setHabit(habitData);
            setCompletions(completionsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habit data');
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = (): string | undefined => {
        const now = new Date();
        switch (dateRange) {
            case 'week':
                now.setDate(now.getDate() - 7);
                return now.toISOString().split('T')[0];
            case 'month':
                now.setMonth(now.getMonth() - 1);
                return now.toISOString().split('T')[0];
            case '3months':
                now.setMonth(now.getMonth() - 3);
                return now.toISOString().split('T')[0];
            case 'all':
                return undefined;
            default:
                return undefined;
        }
    };

    const generateDateRange = (): string[] => {
        if (!habit) return [];
        
        const startDate = new Date(habit.created_at || new Date());
        const endDate = new Date();
        const dates: string[] = [];
        
        // Limit to the selected range
        const rangeStartDate = getStartDate();
        const actualStartDate = rangeStartDate 
            ? new Date(Math.max(new Date(rangeStartDate).getTime(), startDate.getTime()))
            : startDate;
        
        const current = new Date(actualStartDate);
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        
        return dates.reverse(); // Most recent first
    };

    const isCompleted = (date: string): boolean => {
        return completions.some(c => c.completion_date === date);
    };

    const getPeriodLabel = (periodType: string, periodDays: number) => {
        if (periodType === 'daily') return 'Daily';
        if (periodType === 'weekly') return 'Weekly';
        if (periodType === 'monthly') return 'Monthly';
        return `Every ${periodDays} days`;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dateOnly = dateStr;
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (dateOnly === todayStr) return 'Today';
        if (dateOnly === yesterdayStr) return 'Yesterday';
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    };

    const calculateStats = (dates: string[]) => {
        const totalDays = dates.length;
        const completedDays = dates.filter(date => isCompleted(date)).length;
        const missedDays = totalDays - completedDays;
        const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
        
        return { totalDays, completedDays, missedDays, percentage };
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">Loading habit history...</div>
            </div>
        );
    }

    if (error || !habit) {
        return (
            <div className="p-6">
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error || 'Habit not found'}
                </div>
                <button
                    onClick={() => navigate('/dashboard/habits')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    ← Back to Habits
                </button>
            </div>
        );
    }

    const dates = generateDateRange();
    const stats = calculateStats(dates);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/habits')}
                    className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                    ← Back to Habits
                </button>
                <h1 className="text-2xl font-bold dark:text-white mb-2">{habit.name}</h1>
                {habit.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{habit.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Period: {getPeriodLabel(habit.period_type, habit.period_days)}</span>
                    <span>Started: {new Date(habit.created_at || '').toLocaleDateString()}</span>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    Last Week
                </button>
                <button
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    Last Month
                </button>
                <button
                    onClick={() => setDateRange('3months')}
                    className={`px-4 py-2 rounded ${dateRange === '3months' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    Last 3 Months
                </button>
                <button
                    onClick={() => setDateRange('all')}
                    className={`px-4 py-2 rounded ${dateRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    All Time
                </button>
            </div>

            {/* Statistics Summary */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Days</div>
                    <div className="text-2xl font-bold dark:text-white">{stats.totalDays}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedDays}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.missedDays}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.percentage}%</div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dates.map((date) => {
                                const completed = isCompleted(date);
                                return (
                                    <tr key={date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(date)}
                                            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                                {date}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {completed ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                    ✓ Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                                    ✗ Missed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {dates.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No data available for the selected period
                    </div>
                )}
            </div>

            {/* Overall Performance from Habit Stats */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Overall Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
                        <span className="ml-2 font-bold text-orange-600 dark:text-orange-400">
                            🔥 {habit.current_streak}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Completed:</span>
                        <span className="ml-2 font-bold dark:text-white">
                            {habit.total_completions}/{habit.total_periods}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Overall Success:</span>
                        <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                            {habit.completion_percentage}%
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Status Today:</span>
                        <span className={`ml-2 font-bold ${habit.is_completed_today ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {habit.is_completed_today ? '✓ Done' : '○ Pending'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHabitHistoryPage;
