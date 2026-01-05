/**
 * @file HandwritingText component
 * Creates an SVG-based handwriting animation effect where text appears
 * to be drawn/written stroke by stroke.
 */
import React, { useEffect, useRef, useState } from 'react';

export interface HandwritingTextProps {
    /** The text to animate */
    text: string;
    /** Font family to use (should be a handwriting-style font) */
    fontFamily?: string;
    /** Font size in pixels */
    fontSize?: number;
    /** Stroke color */
    strokeColor?: string;
    /** Fill color (appears after stroke animation) */
    fillColor?: string;
    /** Animation duration in seconds */
    duration?: number;
    /** Delay before animation starts in seconds */
    delay?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * HandwritingText - Creates an authentic handwriting animation using SVG stroke animation.
 * The text is rendered as SVG text with stroke-dasharray/dashoffset animation
 * to simulate the effect of someone drawing/writing the letters.
 */
export const HandwritingText: React.FC<HandwritingTextProps> = ({
    text,
    fontFamily = 'Caveat, cursive',
    fontSize = 80,
    strokeColor = 'currentColor',
    fillColor = 'currentColor',
    duration = 2.5,
    delay = 0.3,
    className = '',
}) => {
    const textRef = useRef<SVGTextElement>(null);
    const [pathLength, setPathLength] = useState(1000);
    const [dimensions, setDimensions] = useState({ width: 400, height: 100 });

    useEffect(() => {
        if (textRef.current) {
            // Get the computed text length for accurate animation
            const length = textRef.current.getComputedTextLength();
            setPathLength(length);

            // Get bounding box for SVG sizing
            const bbox = textRef.current.getBBox();
            setDimensions({
                width: Math.ceil(bbox.width) + 20,
                height: Math.ceil(bbox.height) + 20,
            });
        }
    }, [text, fontSize, fontFamily]);

    const animationStyle = {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        animation: `handwriting-draw ${duration}s ease-out ${delay}s forwards`,
    };

    return (
        <svg
            className={`handwriting-svg ${className}`}
            style={{
                display: 'inline-block',
                verticalAlign: 'baseline',
                overflow: 'visible',
                height: `${fontSize * 1.1}px`,
            }}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Define the animation keyframes */}
            <style>
                {`
          @keyframes handwriting-draw {
            0% {
              stroke-dashoffset: ${pathLength};
              fill-opacity: 0;
            }
            70% {
              stroke-dashoffset: 0;
              fill-opacity: 0;
            }
            100% {
              stroke-dashoffset: 0;
              fill-opacity: 1;
            }
          }
        `}
            </style>

            {/* The text element with stroke animation */}
            <text
                ref={textRef}
                x="10"
                y={fontSize * 0.85}
                fontFamily={fontFamily}
                fontSize={fontSize}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={animationStyle}
            >
                {text}
            </text>
        </svg>
    );
};

export default HandwritingText;
