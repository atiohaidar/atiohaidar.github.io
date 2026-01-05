import React, { useState, useEffect, useRef } from 'react';
import { Typography, Heading } from './ui';
import { DoodleArrow, DoodleStar, DoodleCurly, DoodleCoffeeRing, DoodleSparkle } from './ui/Doodles';

/**
 * CONFIGURATION: Edit these values to change loading speed
 */
const SPEED_CONFIG = {
    INTERVAL_MS: 7,      // Global update speed (smaller = faster)
    TEXT_SPEED: 0.2,      // Speed of name typing (larger = faster)
    PROGRESS_SPEED: 1.2,  // Speed of bar filling (larger = faster)
    INIT_DELAY: 500,      // Wait before starting (ms)
    FINISH_DELAY: 600,    // Wait after finished at 100% (ms)
    EXIT_DURATION: 700    // Zoom exit duration (ms) - should sync with index.css
};

interface SketchLoaderProps {
    onComplete?: () => void;
    /** Called slightly before onComplete (default: 100ms before) for early content mount */
    onEarlyLoad?: () => void;
    /** Milliseconds before onComplete to fire onEarlyLoad (default: 100) */
    earlyLoadOffset?: number;
    /** If true, the loader will wait for this to be true before completing */
    waitForData?: boolean;
}

const SketchLoader: React.FC<SketchLoaderProps> = ({
    onComplete,
    onEarlyLoad,
    earlyLoadOffset = 100,
    waitForData = true
}) => {
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'init' | 'sketching' | 'finishing' | 'waiting' | 'exit' | 'complete'>('init');
    const [logs, setLogs] = useState<string[]>([]);
    const [showCoffee, setShowCoffee] = useState(false);
    const [showStar, setShowStar] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);

    // Track if animation has finished its sequence
    const animationDoneRef = useRef(false);

    const targetText = 'KAMU SIAPA?'

    const sketchLogs = [
        "Ingin menjadi vibe coder...",
        "Tukang ngide...",
        "Driven By Curiosity...",
        "Ingin menjadi inovator...",
        "Aku Siapa?...",
        "Siapa yaaa!"
    ];

    useEffect(() => {
        // Phase 1: Initialization
        const initTimer = setTimeout(() => {
            setPhase('sketching');
        }, SPEED_CONFIG.INIT_DELAY);
        return () => clearTimeout(initTimer);
    }, []);

    useEffect(() => {
        if (phase === 'sketching') {
            let iteration = 0;
            let currentProgress = 0;
            let logIndex = 0;

            const interval = setInterval(() => {
                // Update Text (Handwriting/Sketching Effect)
                setText(targetText.substring(0, Math.floor(iteration)));

                // Update Progress
                if (currentProgress < 100) {
                    currentProgress += SPEED_CONFIG.PROGRESS_SPEED;
                    setProgress(Math.min(currentProgress, 100));
                }

                // Trigger Doodles based on progress
                if (currentProgress > 20 && !showCoffee) setShowCoffee(true);
                if (currentProgress > 50 && !showStar) setShowStar(true);
                if (currentProgress > 80 && !showSparkles) setShowSparkles(true);

                // Add Logs sequentially
                if (currentProgress > (logIndex + 1) * (100 / sketchLogs.length) && logIndex < sketchLogs.length) {
                    setLogs(prev => [...prev.slice(-2), sketchLogs[logIndex]]);
                    logIndex++;
                }

                if (iteration >= targetText.length && currentProgress >= 100) {
                    clearInterval(interval);
                    setPhase('finishing');
                }

                iteration += SPEED_CONFIG.TEXT_SPEED;
            }, SPEED_CONFIG.INTERVAL_MS);

            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'finishing') {
            const timer = setTimeout(() => {
                animationDoneRef.current = true;
                if (waitForData) {
                    setPhase('exit');
                } else {
                    setPhase('waiting');
                }
            }, SPEED_CONFIG.FINISH_DELAY);
            return () => clearTimeout(timer);
        }
    }, [phase, waitForData]);

    useEffect(() => {
        if (phase === 'waiting' && waitForData) {
            setPhase('exit');
        }
    }, [phase, waitForData]);

    useEffect(() => {
        if (phase === 'exit') {
            const exitDuration = SPEED_CONFIG.EXIT_DURATION;
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
            style={{ willChange: 'transform, opacity' }}
        >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

            {/* Notebook Background Lines */}
            <div className="absolute inset-0 pointer-events-none notebook-lines opacity-20 dark:opacity-10"></div>

            {/* Coffee Ring - Bottom Right */}
            <div className={`absolute -bottom-20 -right-20 transition-all duration-1000 ${showCoffee ? 'opacity-20 rotate-12 scale-100' : 'opacity-0 scale-150 rotate-0'}`}>
                <DoodleCoffeeRing className="w-80 h-80 text-amber-900/40 dark:text-amber-100/10" />
            </div>

            {/* Coffee Ring - Top Left */}
            <div className={`absolute -top-32 -left-20 transition-all duration-1000 delay-500 ${showCoffee ? 'opacity-10 -rotate-12 scale-100' : 'opacity-0 scale-150 rotate-0'}`}>
                <DoodleCoffeeRing className="w-96 h-96 text-amber-900/30 dark:text-amber-100/5" />
            </div>

            <div className="relative z-10 text-center w-full max-w-lg px-8">
                {/* Sketching Decoration */}
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-700 ${showStar ? 'opacity-100 translate-y-0 rotate-12' : 'opacity-0 -translate-y-8 rotate-0'}`}>
                    <DoodleStar className="w-12 h-12 text-marker-yellow animate-wiggle" />
                </div>

                {/* Sparkling Doodles Around Name */}
                <div className={`absolute top-0 -left-8 transition-all duration-500 ${showSparkles ? 'opacity-40 scale-100' : 'opacity-0 scale-0'}`}>
                    <DoodleSparkle className="w-8 h-8 text-marker-blue animate-bounce" />
                </div>
                <div className={`absolute top-4 -right-8 transition-all duration-500 delay-200 ${showSparkles ? 'opacity-40 scale-100' : 'opacity-0 scale-0'}`}>
                    <DoodleSparkle className="w-6 h-6 text-marker-pink animate-bounce" />
                </div>

                {/* The Name - Scribble Style */}
                <div className="mb-8 relative">
                    <Heading level={1} className="text-4xl md:text-6xl font-caveat text-slate-900 dark:text-white tracking-widest min-h-[70px] flex items-center justify-center">
                        {text}
                        <span className="w-1 h-10 bg-blue-500/50 ml-1 animate-pulse"></span>
                    </Heading>
                    {/* Sketched Underline */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 opacity-30">
                        <DoodleCurly className="w-full h-full text-slate-400" />
                    </div>
                </div>

                {/* Progress Bar - Hand Drawn Arsir (Cross-hatching) Style */}
                <div className="w-full h-8 bg-transparent mb-10 border-2 border-dashed border-slate-300 dark:border-slate-700 relative overflow-hidden transform -rotate-1">
                    <div
                        className="h-full bg-marker-yellow/40 dark:bg-yellow-900/30 transition-all duration-100 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Arsir (Scribble) pattern */}
                        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cGF0aCBkPSJNMCA4TDggMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGQ9Ik0tMSAxTDggMTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')]"></div>
                    </div>
                    {/* Progress percentage doodle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-patrick text-sm font-bold opacity-40 mix-blend-multiply dark:mix-blend-overlay">
                            {Math.floor(progress)}% Sketching...
                        </span>
                    </div>
                </div>

                {/* Status Text & Dynamic Logs */}
                <div className="h-24 flex flex-col justify-center items-center gap-3">
                    {logs.map((log, idx) => (
                        <div
                            key={idx}
                            className={`text-lg text-slate-500 dark:text-slate-400 font-patrick opacity-0 animate-fade-in-up flex items-center gap-3`}
                            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
                        >
                            <span className="text-xl">✏️</span>
                            <span className="italic">{log}</span>
                        </div>
                    ))}
                </div>

                {/* Finishing Quote */}
                {phase === 'finishing' && (
                    <div className="mt-8 animate-fade-in">
                        <Typography variant="h4" className="text-marker-blue font-caveat animate-pulse transform -rotate-2">
                            "Letsgooo..."
                        </Typography>
                    </div>
                )}
            </div>

            {/* Moving Arrow Decoration */}
            <div className={`absolute bottom-10 left-10 transition-all duration-1000 ${showStar ? 'opacity-20 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <DoodleArrow className="w-16 h-16 text-slate-400 transform -rotate-45 animate-bounce" />
            </div>
        </div>
    );
};

export default SketchLoader;
