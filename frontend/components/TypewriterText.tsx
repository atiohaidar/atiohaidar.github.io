import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetween?: number;
    className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetween = 2000,
    className = '',
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fullText = texts[currentTextIndex];

        const handleTyping = () => {
            if (isDeleting) {
                setDisplayText(prev => prev.substring(0, prev.length - 1));
            } else {
                setDisplayText(prev => fullText.substring(0, prev.length + 1));
            }

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), delayBetween);
            } else if (isDeleting && displayText === '') {
                setIsDeleting(false);
                setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }
        };

        const timer = setTimeout(
            handleTyping,
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, currentTextIndex, texts, typingSpeed, deletingSpeed, delayBetween]);

    return (
        <span className={`${className} inline-block`}>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default TypewriterText;
