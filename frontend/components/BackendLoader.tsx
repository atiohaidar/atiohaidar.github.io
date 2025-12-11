import React, { useState, useEffect, useRef, useMemo } from 'react';

type LoaderStatus = 'loading' | 'success' | 'error';

interface BackendLoaderProps {
    /** Current status of the operation */
    status: LoaderStatus;
    /** Called when animation completes successfully */
    onComplete?: () => void;
    /** Called when user dismisses error state */
    onDismiss?: () => void;
    /** Custom title for this operation */
    title?: string;
    /** Optional subtitle for additional context */
    subtitle?: string;
    /** Success message to display (from real response) */
    successMessage?: string;
    /** Error message to display (from real error) */
    errorMessage?: string | null;
    /** Response data to display in JSON (real data from API) */
    responseData?: Record<string, unknown>;
    /** API endpoint that was called */
    endpoint?: string;
    /** HTTP method used */
    method?: string;
    /** Delay in ms after animation ends before calling onComplete (default: 0) */
    completeDelay?: number;
    /** Actual HTTP status code from response */
    actualStatusCode?: number;
    /** Actual request latency in ms */
    actualLatency?: number;
    /** Server hostname/domain */
    serverHost?: string;
    /** Whether connection is secure (HTTPS) */
    isSecure?: boolean;
}

type Phase = 'connecting' | 'requesting' | 'waiting' | 'response' | 'json' | 'done' | 'error' | 'exit' | 'complete';

const BackendLoader: React.FC<BackendLoaderProps> = ({
    status,
    onComplete,
    onDismiss,
    title = 'Processing',
    subtitle,
    successMessage,
    errorMessage,
    responseData,
    endpoint,
    method,
    completeDelay = 0,
    actualStatusCode,
    actualLatency,
    serverHost,
    isSecure,
}) => {
    const [phase, setPhase] = useState<Phase>('connecting');
    const [logs, setLogs] = useState<string[]>([]);
    const [jsonText, setJsonText] = useState('');
    const animationDoneRef = useRef(false);

    // Determine if secure based on prop or serverHost
    const isSecureConnection = isSecure ?? (serverHost?.startsWith('https://') || serverHost?.includes('localhost') === false);

    // JSON response data - only show if we have real data
    const jsonResponse = useMemo(() => {
        if (responseData) {
            return responseData;
        }
        return null;
    }, [responseData]);

    const addLog = (log: string) => {
        setLogs(prev => [...prev.slice(-6), log]);
    };

    // Initial connection phase
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        // Only log what we actually know
        if (serverHost) {
            addLog(`> Connecting to ${serverHost}...`);
        }

        timers.push(setTimeout(() => {
            setPhase('requesting');
        }, 300));

        // Show request info if we have it
        timers.push(setTimeout(() => {
            if (method && endpoint) {
                addLog(`> ${method} ${endpoint}`);
            }
            addLog(`⏳ Waiting for response...`);
            setPhase('waiting');
        }, 600));

        return () => timers.forEach(t => clearTimeout(t));
    }, [serverHost, method, endpoint]);

    // Watch for status change while in waiting phase
    useEffect(() => {
        if (phase === 'waiting') {
            if (status === 'success') {
                // Build response log with real data only
                let responseLog = '✓';
                if (actualStatusCode) {
                    responseLog += ` HTTP ${actualStatusCode}`;
                }
                if (actualLatency) {
                    responseLog += ` (${actualLatency}ms)`;
                }
                if (!actualStatusCode && !actualLatency) {
                    responseLog += ' Response received';
                }
                addLog(responseLog);
                setPhase('response');

                // Show JSON if we have real response data
                if (jsonResponse) {
                    setTimeout(() => {
                        setPhase('json');
                    }, 200);
                } else {
                    setTimeout(() => {
                        setPhase('done');
                    }, 200);
                }

            } else if (status === 'error') {
                // Show error with real data
                let errorLog = '✗';
                if (actualStatusCode) {
                    errorLog += ` HTTP ${actualStatusCode}`;
                }
                if (errorMessage) {
                    errorLog += ` - ${errorMessage}`;
                } else {
                    errorLog += ' Request failed';
                }
                addLog(errorLog);
                setPhase('error');
            }
        }
    }, [phase, status, actualStatusCode, actualLatency, errorMessage, jsonResponse]);

    // Transition from json to done
    useEffect(() => {
        if (phase === 'json' && jsonResponse) {
            const fullJson = JSON.stringify(jsonResponse, null, 2);
            let idx = 0;
            const interval = setInterval(() => {
                if (idx < fullJson.length) {
                    setJsonText(fullJson.substring(0, idx + 1));
                    idx += 4;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        addLog('✓ Complete');
                        setPhase('done');
                    }, 300);
                }
            }, 10);
            return () => clearInterval(interval);
        }
    }, [phase, jsonResponse]);

    // Done phase - trigger exit
    useEffect(() => {
        if (phase === 'done') {
            const timer = setTimeout(() => {
                animationDoneRef.current = true;
                setPhase('exit');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

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

    // Calculate progress based on phase
    const getProgress = () => {
        switch (phase) {
            case 'connecting': return 20;
            case 'requesting': return 40;
            case 'waiting': return 60;
            case 'response': return 75;
            case 'json': return 85;
            case 'done': return 100;
            case 'exit': return 100;
            case 'error': return 60;
            default: return 0;
        }
    };

    const isError = phase === 'error';

    return (
        <div
            className={`
                fixed inset-0 z-[9999] flex flex-col items-center justify-center font-mono overflow-hidden
            `}
            style={{
                animation: phase === 'exit' ? 'slideDownFadeOut 0.6s ease-in forwards' : 'fadeIn 0.4s ease-out forwards',
            }}
        >
            {/* Backdrop with fade-in */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                }}
            />

            {/* Subtle background orbs with scale animation */}
            <div
                className={`absolute top-1/4 left-1/4 w-64 h-64 ${isError ? 'bg-red-500/5' : 'bg-green-500/5'} rounded-full blur-3xl`}
                style={{
                    animation: 'scaleIn 0.8s ease-out forwards',
                    animationDelay: '0.2s',
                    opacity: 0,
                }}
            />
            <div
                className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${isError ? 'bg-orange-500/5' : 'bg-cyan-500/5'} rounded-full blur-3xl`}
                style={{
                    animation: 'scaleIn 0.8s ease-out forwards',
                    animationDelay: '0.3s',
                    opacity: 0,
                }}
            />

            {/* Main content with slide-down animation */}
            <div
                className="relative z-10 w-full max-w-xl px-6"
                style={{
                    animation: phase === 'exit'
                        ? 'slideDownOut 0.5s ease-in forwards'
                        : 'slideDownFadeIn 0.5s ease-out forwards',
                    animationDelay: phase === 'exit' ? '0s' : '0.1s',
                    opacity: phase === 'exit' ? 1 : 0,
                    transform: phase === 'exit' ? 'translateY(0)' : 'translateY(-30px)',
                }}
            >
                {/* Header - Title from props */}
                <div
                    className="text-center mb-6"
                    style={{
                        animation: phase !== 'exit' ? 'slideDownFadeIn 0.5s ease-out forwards' : undefined,
                        animationDelay: '0.2s',
                        opacity: phase === 'exit' ? 1 : 0,
                    }}
                >
                    {/* Connection status badge - only show if we know */}
                    {isSecureConnection !== undefined && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${isError ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-full mb-3`}>
                            <span className={`w-2 h-2 ${isError ? 'bg-red-500' : 'bg-green-500'} rounded-full ${phase !== 'done' && phase !== 'exit' && phase !== 'error' ? 'animate-pulse' : ''}`}></span>
                            <span className={`${isError ? 'text-red-400' : 'text-green-400'} text-xs font-medium`}>
                                {isError ? 'ERROR' : (isSecureConnection ? 'HTTPS' : 'HTTP')}
                            </span>
                        </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {title}
                        {phase !== 'done' && phase !== 'exit' && phase !== 'error' && <span className="animate-pulse">...</span>}
                    </h1>
                    {subtitle && (
                        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Terminal Window with slide-down */}
                <div
                    className={`bg-[#1a1a2e] rounded-lg border ${isError ? 'border-red-700/50' : 'border-gray-700/50'} shadow-2xl overflow-hidden`}
                    style={{
                        animation: phase !== 'exit' ? 'slideDownFadeIn 0.6s ease-out forwards' : undefined,
                        animationDelay: '0.3s',
                        opacity: phase === 'exit' ? 1 : 0,
                    }}
                >
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d15] border-b border-gray-700/50">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        {serverHost && <span className="ml-3 text-gray-500 text-xs">{serverHost}</span>}
                    </div>

                    {/* Terminal Body */}
                    <div className="p-4 min-h-[200px] max-h-[300px] overflow-auto">
                        {/* Logs */}
                        <div className="space-y-1">
                            {logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={`text-sm font-mono ${log.startsWith('✓') ? 'text-green-400' :
                                        log.startsWith('✗') ? 'text-red-400' :
                                            log.startsWith('⏳') ? 'text-yellow-400' :
                                                log.startsWith('>') ? 'text-cyan-400' :
                                                    'text-gray-400'
                                        }`}
                                    style={{
                                        animation: 'slideInFromLeft 0.3s ease-out forwards',
                                    }}
                                >
                                    {log}
                                </div>
                            ))}
                        </div>

                        {/* JSON Response Display - only if we have real data */}
                        {(phase === 'json' || phase === 'done' || phase === 'exit') && jsonText && (
                            <div
                                className="mt-3 p-2 bg-black/30 rounded border border-green-500/20"
                                style={{
                                    animation: 'slideUpFadeIn 0.4s ease-out forwards',
                                }}
                            >
                                <pre className="text-green-400 text-xs overflow-hidden whitespace-pre-wrap">
                                    {jsonText}
                                    {phase === 'json' && <span className="animate-pulse">▌</span>}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    className="mt-4"
                    style={{
                        animation: phase !== 'exit' ? 'slideDownFadeIn 0.5s ease-out forwards' : undefined,
                        animationDelay: '0.4s',
                        opacity: phase === 'exit' ? 1 : 0,
                    }}
                >
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-cyan-400'} transition-all duration-300 ease-out`}
                            style={{ width: `${getProgress()}%` }}
                        />
                    </div>
                </div>

                {/* Success Message - only show if provided */}
                {(phase === 'done' || phase === 'exit') && successMessage && (
                    <div
                        className="mt-4 text-center"
                        style={{
                            animation: 'scaleIn 0.4s ease-out forwards',
                        }}
                    >
                        <p className="text-lg text-green-400 font-medium">
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* Error Message with Dismiss Button */}
                {phase === 'error' && (
                    <div
                        className="mt-4 text-center"
                        style={{
                            animation: 'shakeIn 0.5s ease-out forwards',
                        }}
                    >
                        {errorMessage && (
                            <p className="text-red-400 text-sm mb-3">{errorMessage}</p>
                        )}
                        <button
                            onClick={onDismiss}
                            className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Inline keyframes for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDownFadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                @keyframes slideDownFadeOut {
                    from { 
                        opacity: 1; 
                    }
                    to { 
                        opacity: 0; 
                    }
                }
                @keyframes slideDownOut {
                    from { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                    to { 
                        opacity: 0; 
                        transform: translateY(50px); 
                    }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.8); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                }
                @keyframes slideInFromLeft {
                    from { 
                        opacity: 0; 
                        transform: translateX(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
                @keyframes shakeIn {
                    0% { transform: translateX(-5px); opacity: 0; }
                    20% { transform: translateX(5px); }
                    40% { transform: translateX(-3px); }
                    60% { transform: translateX(3px); }
                    80% { transform: translateX(-1px); }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default BackendLoader;
