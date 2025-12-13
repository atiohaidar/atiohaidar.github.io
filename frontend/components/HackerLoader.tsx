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
                fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center font-mono overflow-hidden
                ${phase === 'exit' ? 'animate-cyber-zoom-out' : ''}
            `}
        >
            <div className="relative z-10 text-center w-full max-w-md px-4">
                {/* Decoding Name */}
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 animate-pulse tracking-[0.2em] mb-4 min-h-[60px]">
                    {text}
                </h1>

                {/* Progress Bar Container */}
                <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden mb-6 border border-blue-900/50">
                    <div
                        className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Status Text & Logs */}
                <div className="h-24 flex flex-col justify-end items-center gap-1">
                    {phase === 'access' && (
                        <div className="text-sm text-green-500 font-bold tracking-[0.2em] animate-bounce mt-2">
                            ꦮꦶꦭꦸꦗꦺꦁ ꦱꦸꦩ꧀ꦥꦶꦁ
                        </div>
                    )}
                    {logs.map((log, idx) => (
                        <div key={idx} className="text-xs text-cyan-500/80 font-bold tracking-widest animate-type-in">
                            {'>'} {log}
                        </div>
                    ))}

                </div>
            </div>

            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-20 pointer-events-none" />
        </div>
    );
};

export default HackerLoader;
