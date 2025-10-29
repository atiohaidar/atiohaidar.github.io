/**
 * @file Login component for API authentication
 */
import React, { useState } from 'react';
import { useLogin } from '../hooks/useApi';
import { COLORS } from '../utils/styles';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const loginMutation = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginMutation.mutateAsync({ username, password });
            onLoginSuccess();
        } catch (error) {
            // Error is handled by mutation
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-light-navy p-8 rounded-lg shadow-lg">
            <h2 className={`text-2xl font-bold mb-6 ${COLORS.TEXT_ACCENT}`}>Login to API Demo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-light-muted dark:text-light-slate mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-deep-navy border border-gray-300 dark:border-soft-gray/30 rounded-lg text-light-text dark:text-light-slate focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-accent-blue"
                        placeholder="admin or user"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-light-muted dark:text-light-slate mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-deep-navy border border-gray-300 dark:border-soft-gray/30 rounded-lg text-light-text dark:text-light-slate focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-accent-blue"
                        placeholder="password"
                        required
                    />
                </div>

                {loginMutation.isError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 rounded-lg">
                        <p className="text-red-700 dark:text-red-400 text-sm">
                            {loginMutation.error?.message || 'Login failed'}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={`w-full py-3 px-4 ${COLORS.BG_ACCENT} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
                >
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-6 p-4 bg-gray-100 dark:bg-deep-navy/50 rounded-lg">
                <p className="text-xs text-light-muted dark:text-soft-gray mb-2">Test Credentials:</p>
                <p className="text-xs text-light-text dark:text-light-slate">
                    <strong>Admin:</strong> admin / admin123<br />
                    <strong>Member:</strong> user / user123
                </p>
            </div>
        </div>
    );
};

export default Login;
