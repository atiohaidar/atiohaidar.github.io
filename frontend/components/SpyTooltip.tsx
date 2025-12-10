import React, { useState, useEffect, useRef } from 'react';

interface SpyTooltipProps {
    visible: boolean;
    title?: string;
    items?: { label: string; value: string }[];
    targetRef: React.RefObject<HTMLElement>;
    color?: string;
}

const SpyTooltip: React.FC<SpyTooltipProps> = ({
    visible,
    title = 'CLASSIFIED',
    items = [],
    targetRef,
    color = '#3b82f6'
}) => {
    const [render, setRender] = useState(visible);
    const [glitchActive, setGlitchActive] = useState(false);

    // Animation Stages
    const [showLine, setShowLine] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Draggable Logic
    const [isDragging, setIsDragging] = useState(false);
    // Base position (offset from center)
    const [basePos, setBasePos] = useState({ x: 0, y: 0 });
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, baseX: 0, baseY: 0 });

    // Physics Refs
    const posRef = useRef({ x: 0, y: 0 }); // Current visual position (lerped)
    const requestRef = useRef<number>();

    // Derived state for render
    const [stylePos, setStylePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (visible) {
            setRender(true);
            setGlitchActive(true);

            // Initial Repel Spawn (if not already set)
            // Ideally we spawn it somewhere logical if it's 0,0
            // But let's let the repel logic handle the initial push or defaults

            // Animation Sequence
            // Line draws first
            requestAnimationFrame(() => setShowLine(true));
            // Content appears after line
            const contentTimer = setTimeout(() => setShowContent(true), 400);
            const glitchTimer = setTimeout(() => setGlitchActive(false), 900);

            return () => {
                clearTimeout(contentTimer);
                clearTimeout(glitchTimer);
            };
        } else {
            // Exit Sequence
            setShowContent(false);
            const lineTimer = setTimeout(() => setShowLine(false), 200);
            const unmountTimer = setTimeout(() => setRender(false), 500);
            return () => {
                clearTimeout(lineTimer);
                clearTimeout(unmountTimer);
            };
        }
    }, [visible]);

    // Handle Dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking through
        setIsDragging(true);
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            baseX: basePos.x || posRef.current.x, // Use current visual pos as start if base is 0
            baseY: basePos.y || posRef.current.y
        };
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const dx = e.clientX - dragStartRef.current.mouseX;
                const dy = e.clientY - dragStartRef.current.mouseY;
                setBasePos({
                    x: dragStartRef.current.baseX + dx,
                    y: dragStartRef.current.baseY + dy
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging]);


    // Physics Loop (Repel + Lerp)
    useEffect(() => {
        if (!visible || !targetRef.current) return;

        const handleRepel = (mouseX: number, mouseY: number) => {
            if (isDragging || !targetRef.current) return null;

            // Only repel if we haven't manually moved it far? 
            // OR repel acts as a "wind" pushing the base position? 
            // OR repel is just a temporary offset?
            // "tetapi tetep ada efek gerak gerakjnya" - user implies movement effects.
            // Let's make "Repel" only active if the user hasn't dragged yet (basePos is near 0)?
            // OR repel is always an added force. Let's make it an added force for visual juice.

            const rect = targetRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;

            // Repel Force
            const repelFactor = 0.4;
            return { x: -dx * repelFactor, y: -dy * repelFactor };
        };

        // We will store the last mouse pos to continue calculating repel
        let lastMouse = { x: 0, y: 0 };
        const updateMouse = (e: MouseEvent) => {
            lastMouse = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', updateMouse);

        const animate = () => {
            // Target Position Calculation
            let targetX = basePos.x;
            let targetY = basePos.y;

            // If we haven't dragged (or even if we have?), add Repel logic?
            // User wants "moves away from pointer".
            // If I dragged it to the right, and pointer is on left, it should stay on right.
            // If I point AT it, it should move away? But I need to click it.
            // Requirement conflict: "Repel" vs "Draggable".
            // Solution: Repel is active, but Dragging overrides/disables Repel.

            if (!isDragging) {
                // If BasePos is (0,0) (initial), we MUST calculate a default position
                // so it doesn't spawn ON the logo.
                // Let's rely on Repel to set the initial position if BasePos is empty.

                const repel = handleRepel(lastMouse.x, lastMouse.y);
                if (repel) {
                    // Check if basePos is "touched" (dragged). 
                    // Let's assume if basePos is 0,0 we strictly follow repel.
                    // If basePos is set, we use basePos only? 
                    // User said: "posisinya bukann di bawah, tapi berlawanan dengan pointer" (initial behavior).
                    // "bisa di pindah pindahkan" (subsequent behavior).

                    if (basePos.x === 0 && basePos.y === 0) {
                        targetX = repel.x;
                        targetY = repel.y;

                        // Safety Clamp for initial spawn to ensure not offscreen
                        // (Simplified version of previous boundary logic)
                        if (Math.abs(targetX) < 50) targetX = targetX > 0 ? 100 : -100;
                        if (Math.abs(targetY) < 50) targetY = targetY > 0 ? 50 : -50;
                    }
                }
            }

            // Lerp
            const ease = isDragging ? 0.2 : 0.05; // Snappier when dragging
            posRef.current.x += (targetX - posRef.current.x) * ease;
            posRef.current.y += (targetY - posRef.current.y) * ease;

            setStylePos({ x: posRef.current.x, y: posRef.current.y });
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', updateMouse);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [visible, isDragging, basePos, targetRef]);

    if (!render) return null;

    const borderColor = color;
    const glowColor = `${color}40`;

    // Calculate line path
    // Origin is Logo (-stylePos.x, -stylePos.y)
    // Target is Tooltip (0, 0)
    // We want the line to draw FROM Origin TO Target.
    // SVG Path: M originX originY L 0 0
    const lineOriginX = -stylePos.x;
    const lineOriginY = -stylePos.y;

    return (
        <div
            className="absolute z-50 top-1/2 left-1/2"
            style={{
                transform: `translate3d(calc(-50% + ${stylePos.x}px), calc(-50% + ${stylePos.y}px), 0)`,
                willChange: 'transform',
                perspective: '1000px',
                pointerEvents: 'none' // Wrapper handles positioning, inner handles events
            }}
        >
            {/* Float Animation Wrapper - user said "tetep ada efek gerak gerakjnya" */}
            <div className="animate-spy-float">

                {/* Connecting Line - SVG Overlay */}
                <svg
                    className="absolute overflow-visible"
                    style={{ left: '50%', top: '50%', overflow: 'visible' }}
                >
                    <path
                        d={`M${lineOriginX} ${lineOriginY} L0 0`}
                        stroke={borderColor}
                        strokeWidth="1.5"
                        // pathLength="1" allows us to animate from 1 (empty) to 0 (full) or vice versa simply using 0-1 range
                        pathLength={1}
                        strokeDasharray="1"
                        strokeDashoffset={showLine ? 0 : 1}
                        fill="none"
                        className="transition-[stroke-dashoffset] duration-700 ease-out"
                        style={{ opacity: 0.6 }}
                    />

                    {/* Origin Dot (Logo) */}
                    <circle cx={lineOriginX} cy={lineOriginY} r="3" fill={borderColor} className="animate-pulse">
                        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
                    </circle>

                    {/* Target Dot (Tooltip) */}
                    {showLine && (
                        <circle cx="0" cy="0" r="2" fill={borderColor} />
                    )}
                </svg>

                {/* Main Card */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`
                        relative bg-[#0f172a]/90 backdrop-blur-xl border border-white/10
                        p-4 min-w-[240px] overflow-hidden rounded-sm
                        text-sky-400 font-mono text-xs
                        shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto
                        transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                        ${showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}
                    `}
                    style={{
                        borderColor: borderColor,
                        boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px -10px ${glowColor}`
                    }}
                >
                    {/* Scanline Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(59,130,246,0.2)_50%)] bg-[length:100%_3px] animate-scanline" />

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-2 mb-3 select-none">
                        <span className={`font-bold tracking-[0.2em] text-sm text-[${borderColor}] ${glitchActive ? 'animate-glitch' : ''}`}>
                            // {title}
                        </span>
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse delay-100" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-200" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 relative z-10 select-none">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center gap-6"
                                style={{
                                    animation: showContent ? `type-in 0.4s forwards` : 'none',
                                    animationDelay: `${idx * 100}ms`,
                                    opacity: 0
                                }}
                            >
                                <span className="opacity-60 text-[0.65rem] tracking-wider uppercase text-slate-400">{item.label}</span>
                                <span className="font-bold text-slate-100 text-xs tracking-wide">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Tech Corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l pointer-events-none" style={{ borderColor }} />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r pointer-events-none" style={{ borderColor }} />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l pointer-events-none" style={{ borderColor }} />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r pointer-events-none" style={{ borderColor }} />
                </div>
            </div>
        </div>
    );
};

export default SpyTooltip;
