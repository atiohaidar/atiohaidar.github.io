import React, { useState, useEffect } from 'react';

const HackerLoader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'init' | 'decoding' | 'access' | 'exit' | 'complete'>('init');
    const [logs, setLogs] = useState<string[]>([]);

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&[]{}<>';
    const targetText = 'ATIO HAIDAR';

    const identityLogs = [
        "INITIALIZING CONNECTION...",
        "IDENTITY CONFIRMED: VIBE CODER",
        "SPECIALIZATION: FULL STACK",
        "ESTABLISHING SECURE LINK...",
        "ENCRYPTING SESSION...",
        "ACCESS_TOKEN: VERIFIED"
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
            }, 50); // Increased from 30ms to 50ms for performance

            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'access') {
            const timer = setTimeout(() => {
                setPhase('exit'); // Trigger exit animation
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'exit') {
            const timer = setTimeout(() => {
                setPhase('complete');
                if (onComplete) onComplete();
            }, 800); // Wait for zoom out animation
            return () => clearTimeout(timer);
        }
    }, [phase, onComplete]);

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
                    {logs.map((log, idx) => (
                        <div key={idx} className="text-xs text-cyan-500/80 font-bold tracking-widest animate-type-in">
                            {'>'} {log}
                        </div>
                    ))}
                    {phase === 'access' && (
                        <div className="text-sm text-green-500 font-bold tracking-[0.2em] animate-bounce mt-2">
                            ACCESS GRANTED
                        </div>
                    )}
                </div>
            </div>

            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-20 pointer-events-none" />
        </div>
    );
};

export default HackerLoader;
