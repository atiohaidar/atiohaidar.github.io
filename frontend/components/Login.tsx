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
        <div className="relative overflow-hidden w-full max-w-md mx-auto p-8 rounded-3xl bg-white/70 dark:bg-[#1A2230]/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl animate-fade-in-up">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to access your dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="admin or user"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {loginMutation.isError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                                {loginMutation.error?.message || 'Login failed. Please check your credentials.'}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none mt-2"
                    >
                        {loginMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
                    <div className="flex justify-center gap-4 text-xs">
                        <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                            <strong>Admin:</strong> admin
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                            <strong>User:</strong> user
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
