import React, { useState, useEffect, useRef } from 'react';

interface HackerLoaderProps {
    onComplete?: () => void;
    /** Called slightly before onComplete (default: 100ms before) for early content mount */
    onEarlyLoad?: () => void;
    /** Milliseconds before onComplete to fire onEarlyLoad (default: 100) */
    earlyLoadOffset?: number;
    /** If true, the loader will wait for this to be true before completing */
    waitForData?: boolean;
}

const HackerLoader: React.FC<HackerLoaderProps> = ({
    onComplete,
    onEarlyLoad,
    earlyLoadOffset = 100,
    waitForData = true
}) => {
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'init' | 'decoding' | 'access' | 'waiting' | 'exit' | 'complete'>('init');
    const [logs, setLogs] = useState<string[]>([]);

    // Track if animation has finished its sequence
    const animationDoneRef = useRef(false);

    // Matrix characters
    const chars = 'TIOHAIDARHANIF';
    const targetText = 'SIAPA AKU';

    const identityLogs = [
        "DALAM PROSES...",
        "MASIH BELAJAR...",
        "IDENTITY CONFIRMED: VIBE CODER",
        "SPECIALIZATION: SEMOGA PALUGADA",
        "YOK BISA YOK",
        "PASSWORD: JANGAN DIKASIH TAU"
    ];

    useEffect(() => {
        // Phase 1: Initialization
        const initTimer = setTimeout(() => {
            setPhase('decoding');
        }, 500);
        return () => clearTimeout(initTimer);
    }, []);

    useEffect(() => {
        if (phase === 'decoding') {
            let iteration = 0;
            let currentProgress = 0;
            let logIndex = 0;

            const interval = setInterval(() => {
                // Update Text (Decoding Effect)
                setText(prev => targetText.split('').map((char, index) => {
                    if (index < iteration) return targetText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(''));

                // Update Progress
                if (currentProgress < 100) {
                    currentProgress += 1.5;
                    setProgress(Math.min(currentProgress, 100));
                }

                // Add Logs sequentially
                if (currentProgress > (logIndex + 1) * (100 / identityLogs.length) && logIndex < identityLogs.length) {
                    setLogs(prev => [...prev, identityLogs[logIndex]]);
                    logIndex++;
                }

                if (iteration >= targetText.length && currentProgress >= 100) {
                    clearInterval(interval);
                    setPhase('access');
                }

                iteration += 1 / 4;
            }, 50);

            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'access') {
            const timer = setTimeout(() => {
                animationDoneRef.current = true;
                // If data is ready, proceed to exit. Otherwise wait.
                if (waitForData) {
                    setPhase('exit');
                } else {
                    setPhase('waiting');
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, waitForData]);

    // Watch for data becoming ready while in waiting phase
    useEffect(() => {
        if (phase === 'waiting' && waitForData) {
            setPhase('exit');
        }
    }, [phase, waitForData]);

    useEffect(() => {
        if (phase === 'exit') {
            // Fire early load callback before complete (for smoother content transition)
            const exitDuration = 800; // ms - matches animate-cyber-zoom-out
            const earlyTimer = setTimeout(() => {
                if (onEarlyLoad) onEarlyLoad();
            }, exitDuration - earlyLoadOffset);

            const completeTimer = setTimeout(() => {
                setPhase('complete');
                if (onComplete) onComplete();
            }, exitDuration);

            return () => {
                clearTimeout(earlyTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [phase, onComplete, onEarlyLoad, earlyLoadOffset]);

    if (phase === 'complete') return null;

    return (
        <div
            className={`
                fixed inset-0 bg-paper-cream dark:bg-slate-900 z-[9999] flex flex-col items-center justify-center font-patrick overflow-hidden
                ${phase === 'exit' ? 'animate-cyber-zoom-out' : ''}
            `}
        >
            {/* Notebook Background Lines */}
            <div className="absolute inset-0 pointer-events-none notebook-lines opacity-10 dark:opacity-5"></div>

            <div className="relative z-10 text-center w-full max-w-md px-4">
                {/* Decoding Name - Sketch Style */}
                <h1 className="text-4xl md:text-6xl font-bold font-caveat text-slate-900 dark:text-white animate-pulse tracking-wide mb-4 min-h-[60px]">
                    {text}
                    <span className="animate-pulse text-marker-blue">|</span>
                </h1>

                {/* Progress Bar Container - Hand Drawn */}
                <div className="w-full h-4 bg-transparent rounded-full overflow-hidden mb-6 border-2 border-dashed border-slate-400 dark:border-slate-600 relative">
                    <div
                        className="h-full bg-marker-yellow dark:bg-yellow-600 transition-all duration-100 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Marker Texture Overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                    </div>
                </div>

                {/* Status Text & Logs */}
                <div className="h-32 flex flex-col justify-end items-center gap-2">
                    {phase === 'access' && (
                        <div className="text-xl text-ink-blue dark:text-blue-300 font-bold font-caveat animate-bounce mt-2 transform -rotate-2">
                            ꦮꦶꦭꦸꦗꦺꦁ ꦱꦸꦩ꧀ꦥꦶꦁ
                        </div>
                    )}
                    {logs.map((log, idx) => (
                        <div key={idx} className="text-sm text-slate-500 dark:text-slate-400 font-patrick tracking-wider animate-type-in border-b border-dashed border-slate-300/50 dark:border-slate-700/50 pb-0.5 w-full">
                            <span className="inline-block w-4 mr-2">✏️</span> {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HackerLoader;
