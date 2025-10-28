/**
 * @file API Demo section with tabbed interface
 */
import React, { useState, useEffect } from 'react';
import Section from './Section';
import Login from './Login';
import UsersManager from './UsersManager';
import TasksManager from './TasksManager';
import { useLogout } from '../hooks/useApi';
import { getAuthToken, getStoredUser } from '../apiClient';
import { COLORS } from '../utils/styles';

type Tab = 'tasks' | 'users';

const ApiDemo: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [user, setUser] = useState<{ username: string; name: string; role: string } | null>(null);
    const logout = useLogout();

    useEffect(() => {
        // Check if user is already authenticated
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        const storedUser = getStoredUser();
        setUser(storedUser);
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <Section id="api-demo" title="API Demo" className="bg-deep-navy">
            <div className="max-w-6xl mx-auto">
                {!isAuthenticated ? (
                    <div className="mb-8">
                        <p className="text-center text-light-slate mb-6">
                            Login to test the backend API endpoints for managing users and tasks.
                        </p>
                        <Login onLoginSuccess={handleLoginSuccess} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* User info and logout */}
                        <div className="bg-light-navy p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-light-slate">
                                    Logged in as: <strong className={COLORS.TEXT_ACCENT}>{user?.name}</strong>
                                </p>
                                <p className="text-soft-gray text-sm">
                                    Username: {user?.username} • Role: {user?.role}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-soft-gray/30">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-6 py-3 font-semibold transition-colors ${
                                    activeTab === 'tasks'
                                        ? `${COLORS.TEXT_ACCENT} border-b-2 border-accent-blue`
                                        : 'text-soft-gray hover:text-light-slate'
                                }`}
                            >
                                Tasks
                            </button>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`px-6 py-3 font-semibold transition-colors ${
                                        activeTab === 'users'
                                            ? `${COLORS.TEXT_ACCENT} border-b-2 border-accent-blue`
                                            : 'text-soft-gray hover:text-light-slate'
                                    }`}
                                >
                                    Users (Admin)
                                </button>
                            )}
                        </div>

                        {/* Tab content */}
                        <div className="min-h-[400px]">
                            {activeTab === 'tasks' && <TasksManager />}
                            {activeTab === 'users' && user?.role === 'admin' && <UsersManager />}
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};

export default ApiDemo;
