import React, { useEffect, useRef, useState } from 'react';

interface HandwritingTextProps {
    /** The text to display with handwriting animation */
    text: string;
    /** Animation duration in milliseconds */
    duration?: number;
    /** Delay before animation starts in milliseconds */
    delay?: number;
    /** Font size in pixels */
    fontSize?: number;
    /** Text color */
    color?: string;
    /** Stroke width for the handwriting effect */
    strokeWidth?: number;
    /** Custom className */
    className?: string;
    /** Callback when animation completes */
    onComplete?: () => void;
}

const HandwritingText: React.FC<HandwritingTextProps> = ({
    text,
    duration = 2000,
    delay = 0,
    fontSize = 48,
    color = 'currentColor',
    strokeWidth = 2,
    className = '',
    onComplete
}) => {
    const pathRef = useRef<SVGPathElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (pathRef.current && isVisible) {
            const length = pathRef.current.getTotalLength();
            setPathLength(length);

            // Trigger animation complete callback
            const completeTimer = setTimeout(() => {
                onComplete?.();
            }, duration);

            return () => clearTimeout(completeTimer);
        }
    }, [isVisible, duration, onComplete]);

    // Generate a handwriting-style path for text
    const generateHandwritingPath = (text: string): string => {
        // This creates a cursive-style path approximation
        let path = '';
        let x = 10;
        const y = fontSize * 0.7;
        const letterSpacing = fontSize * 0.6;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                x += letterSpacing * 0.5;
                continue;
            }

            // Generate cursive-like strokes for each character
            const charPath = generateCharPath(char, x, y, fontSize);
            path += charPath;
            x += letterSpacing;
        }

        return path;
    };

    // Generate path for individual characters (simplified cursive approximation)
    const generateCharPath = (char: string, startX: number, startY: number, size: number): string => {
        const h = size * 0.8;
        const w = size * 0.4;

        // Simplified cursive-style paths for common letters
        const paths: Record<string, string> = {
            'a': `M${startX} ${startY} q${w * 0.5} ${-h * 0.3} ${w} 0 q${-w * 0.2} ${h * 0.4} ${-w * 0.3} ${h * 0.3}`,
            'b': `M${startX} ${startY - h} l0 ${h} q${w} ${-h * 0.3} 0 ${-h * 0.4}`,
            'c': `M${startX + w} ${startY - h * 0.3} q${-w * 0.8} ${-h * 0.2} ${-w * 0.5} ${h * 0.3} q${w * 0.3} ${h * 0.3} ${w * 0.8} 0`,
            'd': `M${startX + w} ${startY - h} l0 ${h} q${-w} ${-h * 0.3} 0 ${-h * 0.4}`,
            'e': `M${startX} ${startY - h * 0.2} q${w * 0.8} ${-h * 0.3} ${w * 0.3} ${h * 0.2} q${-w * 0.5} ${h * 0.3} ${w * 0.2} ${h * 0.2}`,
            'f': `M${startX + w * 0.5} ${startY - h} q${-w * 0.3} ${h * 0.3} 0 ${h} M${startX} ${startY - h * 0.4} l${w * 0.8} 0`,
            'g': `M${startX + w} ${startY - h * 0.3} q${-w * 0.5} ${-h * 0.2} ${-w * 0.3} ${h * 0.3} q${w * 0.5} ${h * 0.2} ${w * 0.3} ${h * 0.4}`,
            'h': `M${startX} ${startY - h} l0 ${h} M${startX} ${startY - h * 0.4} q${w * 0.8} ${-h * 0.2} ${w * 0.6} ${h * 0.4}`,
            'i': `M${startX + w * 0.3} ${startY - h * 0.5} l0 ${h * 0.5} M${startX + w * 0.3} ${startY - h * 0.7} l0 ${-h * 0.05}`,
            'j': `M${startX + w * 0.5} ${startY - h * 0.5} l0 ${h * 0.7} q${-w * 0.3} ${h * 0.2} ${-w * 0.5} 0 M${startX + w * 0.5} ${startY - h * 0.7} l0 ${-h * 0.05}`,
            'k': `M${startX} ${startY - h} l0 ${h} M${startX + w} ${startY - h * 0.5} l${-w * 0.6} ${h * 0.25} l${w * 0.7} ${h * 0.3}`,
            'l': `M${startX + w * 0.3} ${startY - h} l0 ${h}`,
            'm': `M${startX} ${startY} l0 ${-h * 0.5} q${w * 0.4} ${-h * 0.2} ${w * 0.4} ${h * 0.5} q${w * 0.4} ${-h * 0.7} ${w * 0.4} ${0}`,
            'n': `M${startX} ${startY} l0 ${-h * 0.5} q${w * 0.6} ${-h * 0.3} ${w * 0.6} ${h * 0.5}`,
            'o': `M${startX + w * 0.5} ${startY - h * 0.5} a${w * 0.4} ${h * 0.25} 0 1 0 0.01 0`,
            'p': `M${startX} ${startY + h * 0.3} l0 ${-h * 0.8} q${w} ${-h * 0.2} 0 ${h * 0.4}`,
            'q': `M${startX + w} ${startY + h * 0.3} l0 ${-h * 0.8} q${-w} ${-h * 0.2} 0 ${h * 0.4}`,
            'r': `M${startX} ${startY} l0 ${-h * 0.5} q${w * 0.6} ${-h * 0.3} ${w * 0.4} ${h * 0.1}`,
            's': `M${startX + w * 0.6} ${startY - h * 0.45} q${-w * 0.4} ${-h * 0.15} ${-w * 0.2} ${h * 0.2} q${w * 0.5} ${h * 0.15} ${w * 0.3} ${h * 0.25}`,
            't': `M${startX + w * 0.3} ${startY - h * 0.8} l0 ${h * 0.8} M${startX} ${startY - h * 0.5} l${w * 0.6} 0`,
            'u': `M${startX} ${startY - h * 0.5} l0 ${h * 0.35} q0 ${h * 0.2} ${w * 0.5} ${h * 0.15} l0 ${-h * 0.5}`,
            'v': `M${startX} ${startY - h * 0.5} l${w * 0.4} ${h * 0.5} l${w * 0.4} ${-h * 0.5}`,
            'w': `M${startX} ${startY - h * 0.5} l${w * 0.25} ${h * 0.5} l${w * 0.25} ${-h * 0.3} l${w * 0.25} ${h * 0.3} l${w * 0.25} ${-h * 0.5}`,
            'x': `M${startX} ${startY - h * 0.5} l${w * 0.6} ${h * 0.5} M${startX + w * 0.6} ${startY - h * 0.5} l${-w * 0.6} ${h * 0.5}`,
            'y': `M${startX} ${startY - h * 0.5} l${w * 0.4} ${h * 0.5} M${startX + w * 0.8} ${startY - h * 0.5} l${-w * 0.4} ${h * 0.5} q${-w * 0.2} ${h * 0.3} ${-w * 0.4} ${h * 0.2}`,
            'z': `M${startX} ${startY - h * 0.5} l${w * 0.6} 0 l${-w * 0.6} ${h * 0.5} l${w * 0.6} 0`,
            // Uppercase letters
            'A': `M${startX} ${startY} l${w * 0.5} ${-h} l${w * 0.5} ${h} M${startX + w * 0.2} ${startY - h * 0.4} l${w * 0.6} 0`,
            'B': `M${startX} ${startY} l0 ${-h} l${w * 0.5} 0 q${w * 0.3} 0 ${w * 0.3} ${h * 0.25} q0 ${h * 0.25} ${-w * 0.3} ${h * 0.25} l${w * 0.4} 0 q${w * 0.3} 0 ${w * 0.3} ${h * 0.25} q0 ${h * 0.25} ${-w * 0.3} ${h * 0.25} l${-w * 0.7} 0`,
            'C': `M${startX + w} ${startY - h * 0.8} q${-w * 0.5} ${-h * 0.3} ${-w * 0.8} ${h * 0.3} q0 ${h * 0.6} ${w * 0.8} ${h * 0.3} q${w * 0.3} ${h * 0.1} ${w * 0.5} ${-h * 0.1}`,
            'D': `M${startX} ${startY} l0 ${-h} l${w * 0.4} 0 q${w * 0.6} 0 ${w * 0.6} ${h * 0.5} q0 ${h * 0.5} ${-w * 0.6} ${h * 0.5} l${-w * 0.4} 0`,
            'E': `M${startX + w * 0.8} ${startY} l${-w * 0.8} 0 l0 ${-h} l${w * 0.8} 0 M${startX} ${startY - h * 0.5} l${w * 0.6} 0`,
            'F': `M${startX} ${startY} l0 ${-h} l${w * 0.8} 0 M${startX} ${startY - h * 0.5} l${w * 0.6} 0`,
            'G': `M${startX + w} ${startY - h * 0.8} q${-w * 0.5} ${-h * 0.3} ${-w * 0.8} ${h * 0.3} q0 ${h * 0.6} ${w * 0.8} ${h * 0.3} l0 ${-h * 0.4} l${-w * 0.4} 0`,
            'H': `M${startX} ${startY} l0 ${-h} M${startX + w * 0.8} ${startY} l0 ${-h} M${startX} ${startY - h * 0.5} l${w * 0.8} 0`,
            'I': `M${startX + w * 0.4} ${startY} l0 ${-h} M${startX + w * 0.1} ${startY} l${w * 0.6} 0 M${startX + w * 0.1} ${startY - h} l${w * 0.6} 0`,
            'J': `M${startX + w * 0.6} ${startY - h} l0 ${h * 0.8} q0 ${h * 0.3} ${-w * 0.4} ${h * 0.2} q${-w * 0.3} 0 ${-w * 0.4} ${-h * 0.2}`,
            'K': `M${startX} ${startY} l0 ${-h} M${startX + w * 0.8} ${startY - h} l${-w * 0.6} ${h * 0.5} l${w * 0.7} ${h * 0.5}`,
            'L': `M${startX} ${startY - h} l0 ${h} l${w * 0.7} 0`,
            'M': `M${startX} ${startY} l0 ${-h} l${w * 0.5} ${h * 0.6} l${w * 0.5} ${-h * 0.6} l0 ${h}`,
            'N': `M${startX} ${startY} l0 ${-h} l${w * 0.8} ${h} l0 ${-h}`,
            'O': `M${startX + w * 0.5} ${startY} a${w * 0.5} ${h * 0.5} 0 1 0 0.01 0`,
            'P': `M${startX} ${startY} l0 ${-h} l${w * 0.5} 0 q${w * 0.4} 0 ${w * 0.4} ${h * 0.3} q0 ${h * 0.3} ${-w * 0.4} ${h * 0.3} l${-w * 0.5} 0`,
            'Q': `M${startX + w * 0.5} ${startY} a${w * 0.5} ${h * 0.5} 0 1 0 0.01 0 M${startX + w * 0.4} ${startY - h * 0.2} l${w * 0.5} ${h * 0.3}`,
            'R': `M${startX} ${startY} l0 ${-h} l${w * 0.5} 0 q${w * 0.4} 0 ${w * 0.4} ${h * 0.3} q0 ${h * 0.3} ${-w * 0.4} ${h * 0.3} l${-w * 0.5} 0 M${startX + w * 0.4} ${startY - h * 0.4} l${w * 0.5} ${h * 0.4}`,
            'S': `M${startX + w * 0.8} ${startY - h * 0.85} q${-w * 0.3} ${-h * 0.2} ${-w * 0.6} 0 q${-w * 0.3} ${h * 0.2} 0 ${h * 0.4} q${w * 0.6} ${h * 0.3} ${w * 0.5} ${h * 0.5} q${-w * 0.2} ${h * 0.2} ${-w * 0.6} 0`,
            'T': `M${startX + w * 0.5} ${startY - h} l0 ${h} M${startX} ${startY - h} l${w} 0`,
            'U': `M${startX} ${startY - h} l0 ${h * 0.7} q0 ${h * 0.4} ${w * 0.5} ${h * 0.3} q${w * 0.5} ${-h * 0.1} ${w * 0.5} ${-h * 0.3} l0 ${-h * 0.7}`,
            'V': `M${startX} ${startY - h} l${w * 0.5} ${h} l${w * 0.5} ${-h}`,
            'W': `M${startX} ${startY - h} l${w * 0.25} ${h} l${w * 0.25} ${-h * 0.6} l${w * 0.25} ${h * 0.6} l${w * 0.25} ${-h}`,
            'X': `M${startX} ${startY - h} l${w * 0.8} ${h} M${startX + w * 0.8} ${startY - h} l${-w * 0.8} ${h}`,
            'Y': `M${startX} ${startY - h} l${w * 0.5} ${h * 0.5} l0 ${h * 0.5} M${startX + w} ${startY - h} l${-w * 0.5} ${h * 0.5}`,
            'Z': `M${startX} ${startY - h} l${w * 0.8} 0 l${-w * 0.8} ${h} l${w * 0.8} 0`,
            // Numbers
            '0': `M${startX + w * 0.5} ${startY} a${w * 0.4} ${h * 0.5} 0 1 0 0.01 0`,
            '1': `M${startX + w * 0.2} ${startY - h * 0.8} l${w * 0.3} ${-h * 0.2} l0 ${h} M${startX} ${startY} l${w * 0.7} 0`,
            '2': `M${startX} ${startY - h * 0.75} q${w * 0.2} ${-h * 0.3} ${w * 0.5} ${-h * 0.2} q${w * 0.4} ${h * 0.1} ${w * 0.3} ${h * 0.4} l${-w * 0.8} ${h * 0.55} l${w * 0.9} 0`,
            '3': `M${startX} ${startY - h * 0.85} q${w * 0.4} ${-h * 0.2} ${w * 0.6} ${h * 0.1} q${w * 0.2} ${h * 0.2} ${-w * 0.2} ${h * 0.3} q${w * 0.4} ${h * 0.1} ${w * 0.3} ${h * 0.35} q${-w * 0.1} ${h * 0.25} ${-w * 0.6} ${h * 0.1}`,
            '4': `M${startX + w * 0.7} ${startY} l0 ${-h} M${startX} ${startY - h * 0.3} l${w * 0.9} 0 M${startX} ${startY - h * 0.3} l${w * 0.5} ${-h * 0.7}`,
            '5': `M${startX + w * 0.8} ${startY - h} l${-w * 0.7} 0 l0 ${h * 0.4} q${w * 0.6} ${-h * 0.1} ${w * 0.7} ${h * 0.25} q0 ${h * 0.4} ${-w * 0.6} ${h * 0.35}`,
            '6': `M${startX + w * 0.7} ${startY - h * 0.9} q${-w * 0.5} ${-h * 0.2} ${-w * 0.6} ${h * 0.4} q0 ${h * 0.6} ${w * 0.5} ${h * 0.5} q${w * 0.5} ${-h * 0.1} ${w * 0.4} ${-h * 0.4} q${-w * 0.1} ${-h * 0.3} ${-w * 0.5} ${-h * 0.2}`,
            '7': `M${startX} ${startY - h} l${w * 0.9} 0 l${-w * 0.5} ${h}`,
            '8': `M${startX + w * 0.5} ${startY - h * 0.5} a${w * 0.35} ${h * 0.25} 0 1 0 0.01 0 M${startX + w * 0.5} ${startY - h * 0.5} a${w * 0.4} ${h * 0.3} 0 1 1 0.01 0`,
            '9': `M${startX + w * 0.2} ${startY - h * 0.1} q${w * 0.5} ${h * 0.2} ${w * 0.6} ${-h * 0.4} q0 ${-h * 0.6} ${-w * 0.5} ${-h * 0.5} q${-w * 0.5} ${h * 0.1} ${-w * 0.4} ${h * 0.4} q${w * 0.1} ${h * 0.3} ${w * 0.5} ${h * 0.2}`,
            // Punctuation
            '.': `M${startX + w * 0.3} ${startY - h * 0.05} a${w * 0.08} ${h * 0.05} 0 1 0 0.01 0`,
            ',': `M${startX + w * 0.3} ${startY} l${-w * 0.1} ${h * 0.15}`,
            '!': `M${startX + w * 0.3} ${startY - h} l0 ${h * 0.7} M${startX + w * 0.3} ${startY - h * 0.1} l0 ${h * 0.05}`,
            '?': `M${startX} ${startY - h * 0.8} q${w * 0.3} ${-h * 0.3} ${w * 0.6} ${0} q${w * 0.3} ${h * 0.3} ${-w * 0.2} ${h * 0.5} l0 ${h * 0.15} M${startX + w * 0.4} ${startY - h * 0.05} l0 ${h * 0.05}`,
            ':': `M${startX + w * 0.3} ${startY - h * 0.6} l0 ${h * 0.05} M${startX + w * 0.3} ${startY - h * 0.2} l0 ${h * 0.05}`,
            ' ': '',
        };

        return paths[char] || `M${startX} ${startY - h * 0.5} l${w * 0.5} 0`;
    };

    const handwritingPath = generateHandwritingPath(text);
    const svgWidth = text.length * fontSize * 0.6 + 20;
    const svgHeight = fontSize * 1.5;

    return (
        <div className={`inline-block ${className}`}>
            <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="overflow-visible"
            >
                {isVisible && (
                    <path
                        ref={pathRef}
                        d={handwritingPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            strokeDasharray: pathLength || 1000,
                            strokeDashoffset: pathLength || 1000,
                            animation: `handwriting-draw ${duration}ms ease-out forwards`
                        }}
                    />
                )}
            </svg>
            <style>{`
                @keyframes handwriting-draw {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default HandwritingText;
