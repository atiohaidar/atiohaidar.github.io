import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

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
        const timers: any[] = [];

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

    // Helper functions for styling
    const paramsStyle = (isError: boolean) => ({
        badge: isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700',
        indicator: isError ? 'bg-red-500' : 'bg-green-500'
    });

    const getLogColor = (log: string) => {
        if (log.startsWith('✓')) return 'text-green-600 dark:text-green-400 font-bold';
        if (log.startsWith('✗')) return 'text-red-600 dark:text-red-400 font-bold';
        if (log.startsWith('⏳')) return 'text-amber-600 dark:text-amber-400 italic';
        if (log.startsWith('>')) return 'text-blue-600 dark:text-blue-400';
        return 'text-slate-600 dark:text-slate-400';
    };

    const getLogIcon = (log: string) => {
        if (log.startsWith('✓')) return '✅';
        if (log.startsWith('✗')) return '❌';
        if (log.startsWith('⏳')) return '⏳';
        if (log.startsWith('>')) return '🚀';
        return '📝';
    };

    const cleanLog = (log: string) => {
        return log.replace(/^[✓✗⏳>]\s*/, '');
    };

    // Use portal to ensure loader stays on top of everything
    return createPortal(
        <div
            className={`
                fixed inset-0 z-[9999] flex flex-col items-center justify-center font-patrick overflow-hidden
            `}
            style={{
                animation: phase === 'exit' ? 'fadeOut 0.6s ease-in forwards' : 'fadeIn 0.4s ease-out forwards',
            }}
        >
            {/* Backdrop with paper texture overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" />

            {/* Notebook / Clipboard Container */}
            <div
                className={`
                    relative z-10 w-full max-w-md bg-paper-cream dark:bg-slate-800 
                    border-2 border-slate-800 dark:border-slate-600 rounded-xl shadow-2xl 
                    transform transition-all duration-500
                    p-6 md:p-8
                `}
                style={{
                    animation: phase === 'exit'
                        ? 'slideDownOut 0.5s ease-in forwards'
                        : 'slideUpIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    borderRadius: '2px 4px 255px 15px/255px 15px 2px 4px' // Subtle irregularity
                }}
            >
                {/* Spiral/Clip Decoration at top */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-slate-800 dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-md z-20">
                    <span className="text-white font-bold tracking-widest text-xs uppercase">SYSTEM LOG</span>
                </div>

                {/* Header Section */}
                <div className="text-center mb-6 mt-4">
                    {/* Status Badge */}
                    {isSecureConnection !== undefined && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 mb-2 border-2 border-dashed rounded-full ${paramsStyle(isError).badge} transform -rotate-2`}>
                            <span className={`w-2 h-2 rounded-full ${paramsStyle(isError).indicator} ${phase !== 'done' && phase !== 'exit' && phase !== 'error' ? 'animate-pulse' : ''}`}></span>
                            <span className="text-xs font-bold font-mono">
                                {isError ? 'ERROR' : (isSecureConnection ? 'SECURE' : 'INSECURE')}
                            </span>
                        </div>
                    )}

                    <h2 className="text-2xl md:text-3xl font-bold font-caveat text-slate-900 dark:text-white mb-1">
                        {title}
                        {phase !== 'done' && phase !== 'exit' && phase !== 'error' && <span className="animate-pulse">...</span>}
                    </h2>
                    {subtitle && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-patrick italic">{subtitle}</p>
                    )}
                </div>

                {/* Log Area (Paper Lines) */}
                <div className="relative bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-auto notebook-lines">
                    <div className="space-y-2">
                        {logs.map((log, idx) => (
                            <div
                                key={idx}
                                className={`text-sm font-patrick flex items-start gap-2 ${getLogColor(log)}`}
                                style={{ animation: 'slideInLeft 0.3s ease-out forwards' }}
                            >
                                <span className="opacity-70 mt-0.5">{getLogIcon(log)}</span>
                                <span className="leading-tight">{cleanLog(log)}</span>
                            </div>
                        ))}
                    </div>

                    {/* JSON Dump Area */}
                    {(phase === 'json' || phase === 'done' || phase === 'exit') && jsonText && (
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-auto whitespace-pre-wrap shadow-inner relative transform rotate-1">
                            {jsonText}
                            {phase === 'json' && <span className="animate-pulse border-r-2 border-slate-400 ml-1"></span>}
                        </div>
                    )}
                </div>

                {/* Marker Progress Bar */}
                <div className="mt-6 relative">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
                        <div
                            className={`h-full ${isError ? 'bg-red-400' : 'bg-marker-blue'} transition-all duration-300 ease-out`}
                            style={{
                                width: `${getProgress()}%`,
                                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                                backgroundSize: '1rem 1rem'
                            }}
                        />
                    </div>
                </div>

                {/* Success/Error Actions */}
                {(phase === 'done' || phase === 'exit') && successMessage && (
                    <div className="mt-4 text-center animate-bounce">
                        <p className="text-xl font-caveat font-bold text-green-600 dark:text-green-400 transform -rotate-1">
                            {successMessage} 🎉
                        </p>
                    </div>
                )}

                {phase === 'error' && (
                    <div className="mt-4 text-center">
                        {errorMessage && <p className="text-red-500 font-bold mb-3 font-patrick">{errorMessage}</p>}
                        <button
                            onClick={() => {
                                if (onDismiss) onDismiss();
                                setPhase('exit');
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-6 rounded-lg border-2 border-red-300 border-dashed transition-transform hover:scale-105"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}
            </div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes slideUpIn { 
                    from { opacity: 0; transform: translateY(50px) scale(0.9); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes slideDownOut { 
                    from { opacity: 1; transform: translateY(0); } 
                    to { opacity: 0; transform: translateY(50px); } 
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default BackendLoader;
