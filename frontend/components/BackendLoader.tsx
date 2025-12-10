import React, { useState, useEffect, useRef, useMemo } from 'react';

type LoaderStatus = 'loading' | 'success' | 'error';
type OperationType = 'login' | 'logout' | 'fetch' | 'upload' | 'submit' | 'delete' | 'custom';

interface BackendLoaderProps {
    /** Current status of the operation */
    status: LoaderStatus;
    /** Called when animation completes successfully */
    onComplete?: () => void;
    /** Called when user dismisses error state */
    onDismiss?: () => void;
    /** Type of operation for customized messages */
    operationType?: OperationType;
    /** Custom title (overrides operationType default) */
    title?: string;
    /** Custom subtitle (overrides operationType default) */
    subtitle?: string;
    /** Success message to display */
    successMessage?: string;
    /** Error message to display */
    errorMessage?: string | null;
    /** Response data to display in JSON animation (any object) */
    responseData?: Record<string, unknown>;
    /** API endpoint that was called */
    endpoint?: string;
    /** HTTP method used */
    method?: string;
    /** Delay in ms after animation ends before calling onComplete (default: 0) */
    completeDelay?: number;
    /** Custom HTTP status code to display on success */
    successStatusCode?: number;
    /** Custom HTTP status code to display on error */
    errorStatusCode?: number;
}

type Phase = 'dns' | 'tcp' | 'tls' | 'request' | 'processing' | 'waiting' | 'response' | 'json' | 'session' | 'success' | 'error' | 'exit' | 'complete';

// Default titles/subtitles based on operation type
const operationDefaults: Record<OperationType, { title: string; subtitle: string; successMessage: string }> = {
    login: {
        title: 'Authenticating',
        subtitle: 'Establishing secure connection...',
        successMessage: 'Login successful!'
    },
    logout: {
        title: 'Signing Out',
        subtitle: 'Terminating session...',
        successMessage: 'Signed out successfully!'
    },
    fetch: {
        title: 'Fetching Data',
        subtitle: 'Retrieving from server...',
        successMessage: 'Data loaded successfully!'
    },
    upload: {
        title: 'Uploading',
        subtitle: 'Sending data to server...',
        successMessage: 'Upload complete!'
    },
    submit: {
        title: 'Submitting',
        subtitle: 'Processing your request...',
        successMessage: 'Submission successful!'
    },
    delete: {
        title: 'Deleting',
        subtitle: 'Removing data...',
        successMessage: 'Deleted successfully!'
    },
    custom: {
        title: 'Processing',
        subtitle: 'Please wait...',
        successMessage: 'Operation complete!'
    },
};

const BackendLoader: React.FC<BackendLoaderProps> = ({
    status,
    onComplete,
    onDismiss,
    operationType = 'custom',
    title,
    subtitle,
    successMessage,
    errorMessage,
    responseData,
    endpoint = '/api/endpoint',
    method = 'POST',
    completeDelay = 0,
    successStatusCode = 200,
    errorStatusCode = 401,
}) => {
    const [phase, setPhase] = useState<Phase>('dns');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [jsonText, setJsonText] = useState('');
    const [currentStatusCode, setCurrentStatusCode] = useState('');
    const animationDoneRef = useRef(false);
    const statusRef = useRef(status);

    // Get defaults based on operation type
    const defaults = operationDefaults[operationType];
    const displayTitle = title || defaults.title;
    const displaySubtitle = subtitle || defaults.subtitle;
    const displaySuccessMessage = successMessage || defaults.successMessage;

    // Keep status ref updated
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Generate realistic server IP
    const serverIP = useMemo(() => {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }, []);

    // Generate fake latency values
    const latencies = useMemo(() => ({
        dns: Math.floor(Math.random() * 20) + 10,
        tcp: Math.floor(Math.random() * 30) + 20,
        tls: Math.floor(Math.random() * 50) + 40,
        request: Math.floor(Math.random() * 100) + 50,
    }), []);

    // JSON response data
    const jsonResponse = useMemo(() => {
        if (responseData) {
            return { success: true, ...responseData };
        }
        return { success: true, message: displaySuccessMessage };
    }, [responseData, displaySuccessMessage]);

    const addLog = (log: string) => {
        setLogs(prev => [...prev.slice(-5), log]); // Keep last 6 logs
    };

    // Phase transitions
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        const runSequence = async () => {
            // DNS Resolution
            addLog(`> Resolving server address...`);
            setProgress(5);
            timers.push(setTimeout(() => {
                addLog(`✓ DNS resolved → ${serverIP}`);
                setProgress(15);
                setPhase('tcp');
            }, 400));

            // TCP Connection
            timers.push(setTimeout(() => {
                addLog(`> Establishing TCP connection to ${serverIP}:443...`);
                setProgress(25);
            }, 600));

            timers.push(setTimeout(() => {
                addLog(`✓ TCP connected (${latencies.tcp}ms)`);
                setProgress(35);
                setPhase('tls');
            }, 900));

            // TLS/SSL Handshake
            timers.push(setTimeout(() => {
                addLog(`> TLS Handshake...`);
                setProgress(40);
            }, 1100));

            timers.push(setTimeout(() => {
                addLog(`✓ SSL Certificate verified`);
                setProgress(50);
                setPhase('request');
            }, 1400));

            // HTTP Request
            timers.push(setTimeout(() => {
                addLog(`> ${method} ${endpoint} HTTP/1.1`);
                setProgress(55);
            }, 1600));

            timers.push(setTimeout(() => {
                addLog(`> Headers: Content-Type: application/json`);
                addLog(`> Sending request body...`);
                setProgress(60);
                setPhase('processing');
            }, 1800));

            // Server Processing - wait here for status to change
            timers.push(setTimeout(() => {
                addLog(`⏳ Awaiting server response...`);
                setProgress(70);
                setPhase('waiting');
            }, 2000));
        };

        runSequence();

        return () => timers.forEach(t => clearTimeout(t));
    }, [serverIP, latencies, method, endpoint]);

    // Watch for status change while in waiting phase
    useEffect(() => {
        if (phase === 'waiting') {
            if (status === 'success') {
                // Success flow
                setCurrentStatusCode(String(successStatusCode));
                addLog(`✓ HTTP/1.1 ${successStatusCode} OK`);
                setProgress(80);
                setPhase('response');

                // Continue to JSON parsing
                setTimeout(() => {
                    setPhase('json');
                    setProgress(85);
                }, 200);

                // Session storage
                setTimeout(() => {
                    addLog(`> Processing response...`);
                    setProgress(95);
                    setPhase('session');
                }, 1000);

                // Success
                setTimeout(() => {
                    addLog(`✓ Operation completed`);
                    setProgress(100);
                    setPhase('success');
                }, 1300);

                // Exit
                setTimeout(() => {
                    animationDoneRef.current = true;
                    setPhase('exit');
                }, 1800);

            } else if (status === 'error') {
                // Error flow
                setCurrentStatusCode(String(errorStatusCode));
                addLog(`✗ HTTP/1.1 ${errorStatusCode} Error`);
                setProgress(70);

                setTimeout(() => {
                    addLog(`✗ ${errorMessage || 'Request failed'}`);
                    setPhase('error');
                }, 500);
            }
        }
    }, [phase, status, successStatusCode, errorStatusCode, errorMessage]);

    // JSON typing animation
    useEffect(() => {
        if (phase === 'json') {
            const fullJson = JSON.stringify(jsonResponse, null, 2);
            let idx = 0;
            const interval = setInterval(() => {
                if (idx < fullJson.length) {
                    setJsonText(fullJson.substring(0, idx + 1));
                    idx += 3;
                } else {
                    clearInterval(interval);
                }
            }, 15);
            return () => clearInterval(interval);
        }
    }, [phase, jsonResponse]);

    // Exit phase handling
    useEffect(() => {
        if (phase === 'exit') {
            const exitDuration = 800;
            const completeTimer = setTimeout(() => {
                setPhase('complete');
                if (onComplete) onComplete();
            }, exitDuration + completeDelay);

            return () => clearTimeout(completeTimer);
        }
    }, [phase, onComplete, completeDelay]);

    if (phase === 'complete') return null;

    return (
        <div
            className={`
                fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex flex-col items-center justify-center font-mono overflow-hidden
                ${phase === 'exit' ? 'animate-cyber-zoom-in-blur' : ''}
            `}
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Animated orbs */}
            <div className={`absolute top-1/4 left-1/4 w-64 h-64 ${phase === 'error' ? 'bg-red-500/10' : 'bg-green-500/10'} rounded-full blur-3xl animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${phase === 'error' ? 'bg-orange-500/10' : 'bg-cyan-500/10'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }} />

            <div className="relative z-10 w-full max-w-2xl px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${phase === 'error' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-full mb-4`}>
                        <span className={`w-2 h-2 ${phase === 'error' ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`}></span>
                        <span className={`${phase === 'error' ? 'text-red-400' : 'text-green-400'} text-sm font-medium`}>
                            {phase === 'error' ? 'CONNECTION ERROR' : 'SECURE CONNECTION'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {phase === 'error' ? 'Error' : displayTitle}<span className="animate-pulse">...</span>
                    </h1>
                    <p className="text-gray-400 text-sm">{phase === 'error' ? errorMessage : displaySubtitle}</p>
                </div>

                {/* Terminal Window */}
                <div className={`bg-[#1a1a2e] rounded-lg border ${phase === 'error' ? 'border-red-700/50' : 'border-gray-700/50'} shadow-2xl overflow-hidden`}>
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d15] border-b border-gray-700/50">
                        <div className="flex gap-2">
                            <div className={`w-3 h-3 rounded-full ${phase === 'error' ? 'bg-red-500' : 'bg-red-500'}`}></div>
                            <div className={`w-3 h-3 rounded-full ${phase === 'error' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                            <div className={`w-3 h-3 rounded-full ${phase === 'error' ? 'bg-gray-500' : 'bg-green-500'}`}></div>
                        </div>
                        <span className="ml-4 text-gray-500 text-sm">backend-connection</span>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-4 h-72 overflow-hidden">
                        {/* Logs */}
                        <div className="space-y-1 mb-4">
                            {logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={`text-sm font-mono ${log.startsWith('✓') ? 'text-green-400' :
                                            log.startsWith('✗') ? 'text-red-400' :
                                                log.startsWith('⏳') ? 'text-yellow-400' :
                                                    log.startsWith('>') ? 'text-cyan-400' :
                                                        'text-gray-400'
                                        } animate-fade-in`}
                                >
                                    {log}
                                </div>
                            ))}
                        </div>

                        {/* JSON Response Display */}
                        {(phase === 'json' || phase === 'session' || phase === 'success' || phase === 'exit') && (
                            <div className="mt-4 p-3 bg-black/30 rounded border border-green-500/20">
                                <div className="text-xs text-gray-500 mb-2">Response Body:</div>
                                <pre className="text-green-400 text-xs overflow-hidden whitespace-pre-wrap">
                                    {jsonText}
                                    <span className="animate-pulse">▌</span>
                                </pre>
                            </div>
                        )}

                        {/* HTTP Status Badge */}
                        {currentStatusCode && (
                            <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 ${phase === 'error' ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'
                                } border rounded`}>
                                <span className={`${phase === 'error' ? 'text-red-400' : 'text-green-400'} text-sm font-bold`}>
                                    HTTP {currentStatusCode}
                                </span>
                                <span className={`${phase === 'error' ? 'text-red-400' : 'text-green-400'} text-sm`}>
                                    {phase === 'error' ? 'ERROR' : 'OK'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${phase === 'error' ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-green-500 to-cyan-400'} transition-all duration-300 ease-out`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Success Message - stays visible during exit for smooth animation */}
                {(phase === 'success' || phase === 'exit') && (
                    <div className="mt-6 text-center animate-fade-in">
                        <p className="text-2xl text-green-400 font-bold">
                            {displaySuccessMessage} 🎉
                        </p>
                        <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
                    </div>
                )}

                {/* Error Message with Dismiss Button */}
                {phase === 'error' && (
                    <div className="mt-6 text-center animate-fade-in">
                        <p className="text-2xl text-red-400 font-bold">
                            Operation Failed ❌
                        </p>
                        <p className="text-gray-400 text-sm mt-2 mb-4">{errorMessage}</p>
                        <button
                            onClick={onDismiss}
                            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-medium transition-all hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Scanline Effect */}
            <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                    background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)',
                    backgroundSize: '100% 4px',
                    opacity: 0.3
                }}
            />
        </div>
    );
};

export default BackendLoader;
