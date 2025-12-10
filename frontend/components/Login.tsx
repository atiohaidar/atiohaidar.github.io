/**
 * @file Login component for API authentication
 */
import React, { useState, useRef, useEffect } from 'react';
import { useLogin } from '../hooks/useApi';
import BackendLoader from './BackendLoader';
import type { LoginResponse } from '../lib/api/types';

interface LoginProps {
    onLoginSuccess: (userData: LoginResponse) => void;
    /** Delay in ms after login success before calling onLoginSuccess (default: 0 = immediate) */
    navigateDelay?: number;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, navigateDelay = 0 }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [loaderStatus, setLoaderStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [navigationTriggered, setNavigationTriggered] = useState(false);
    const loginMutation = useLogin();
    const responseRef = useRef<LoginResponse | null>(null);
    const navigateTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Show loader IMMEDIATELY when button is clicked
        setShowLoader(true);
        setLoaderStatus('loading');
        setErrorMessage(null);
        setNavigationTriggered(false);

        try {
            const response = await loginMutation.mutateAsync({ username, password });
            // Store response and update status
            responseRef.current = response;
            setLoaderStatus('success');

            // Start navigate delay timer immediately after login success
            // This is INDEPENDENT of BackendLoader animation
            navigateTimerRef.current = setTimeout(() => {
                setNavigationTriggered(true);
            }, navigateDelay);

        } catch (error) {
            // Show error in loader
            setLoaderStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
        }
    };

    // Navigate when navigateDelay timer completes
    useEffect(() => {
        if (navigationTriggered && responseRef.current) {
            onLoginSuccess(responseRef.current);
        }
    }, [navigationTriggered, onLoginSuccess]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (navigateTimerRef.current) {
                clearTimeout(navigateTimerRef.current);
            }
        };
    }, []);

    const handleLoaderComplete = () => {
        // BackendLoader animation finished
        // If navigateDelay already passed, navigate now
        // Otherwise, wait for navigateDelay timer
        if (navigationTriggered && responseRef.current) {
            onLoginSuccess(responseRef.current);
        }
    };

    const handleLoaderDismiss = () => {
        // Called when user dismisses error state - go back to login form
        setShowLoader(false);
        setLoaderStatus('loading');
        setErrorMessage(null);
        setNavigationTriggered(false);
        if (navigateTimerRef.current) {
            clearTimeout(navigateTimerRef.current);
        }
    };

    // Show loader when active
    if (showLoader) {
        const userData = responseRef.current?.user;
        return (
            <BackendLoader
                status={loaderStatus}
                onComplete={handleLoaderComplete}
                onDismiss={handleLoaderDismiss}
                operationType="login"
                successMessage={userData ? `Welcome back, ${userData.name}!` : 'Login successful!'}
                errorMessage={errorMessage}
                responseData={userData ? {
                    username: userData.username,
                    name: userData.name,
                    role: userData.role,
                    balance: userData.balance
                } : undefined}
                endpoint="/api/auth/login"
                method="POST"
                completeDelay={0}
                errorStatusCode={401}
            />
        );
    }

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

                    <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
                    <div className="flex justify-center gap-4 text-xs">
                        <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                            <strong>Admin:</strong> username: admin, password: admin123
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                            <strong>User:</strong> username: user, password: user123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
