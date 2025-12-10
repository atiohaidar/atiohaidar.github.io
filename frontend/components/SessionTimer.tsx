/**
 * @file Session Timer component yang menampilkan berapa lama user mengakses website.
 * Termasuk milestone effects dan browser info dalam tooltip.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SpyTooltip from './SpyTooltip';

interface SessionTimerProps {
    className?: string;
}

// Milestone points in seconds
const MILESTONES = [60, 300, 600, 900, 1800, 3600]; // 1min, 5min, 10min, 15min, 30min, 1hr

const SessionTimer: React.FC<SessionTimerProps> = ({ className = '' }) => {
    const timerRef = useRef<HTMLDivElement>(null);
    const [seconds, setSeconds] = useState(0);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const [showMilestone, setShowMilestone] = useState(false);
    const [lastMilestone, setLastMilestone] = useState(0);

    // Store session start time
    const [sessionStart] = useState(() => new Date());

    // Format seconds to MM:SS or HH:MM:SS
    const formatDuration = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get browser info
    const browserInfo = useMemo(() => {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let os = 'Unknown';

        // Detect browser
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

        // Detect OS
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        return { browser, os };
    }, []);

    // Format session start
    const sessionStartInfo = useMemo(() => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const day = days[sessionStart.getDay()];
        const time = sessionStart.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return { day, time };
    }, [sessionStart]);

    // Get milestone message
    const getMilestoneMessage = (secs: number): string => {
        if (secs >= 3600) return '1 jam! Kamu sungguhan! 🏆';
        if (secs >= 1800) return '30 menit! Luar biasa! 🌟';
        if (secs >= 900) return '15 menit! Hebat! 💪';
        if (secs >= 600) return '10 menit! Amazing! 🔥';
        if (secs >= 300) return '5 menit! Tetap disini ya! ⭐';
        if (secs >= 60) return '1 menit! Selamat datang! 🎉';
        return '';
    };

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Milestone detection - milestone message persists until next milestone
    useEffect(() => {
        // Check if we've reached a new milestone
        const reachedMilestone = [...MILESTONES].reverse().find(m => seconds >= m);

        if (reachedMilestone && reachedMilestone !== lastMilestone) {
            setLastMilestone(reachedMilestone);
            setShowMilestone(true);
        }
    }, [seconds, lastMilestone]);

    // Format duration for tooltip
    const durationText = useMemo(() => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}j ${minutes}m`;
        }
        if (minutes > 0) {
            return `${minutes} menit`;
        }
        return `${seconds} detik`;
    }, [seconds]);

    return (
        <div
            ref={timerRef}
            className={`relative px-3 py-1.5 rounded-lg bg-white/5 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 cursor-pointer hover:bg-accent-blue/5 transition-all ${className} ${showMilestone ? 'animate-pulse ring-2 ring-accent-blue/50' : ''}`}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
        >
            {/* Timer Display */}
            <div className="flex items-center gap-2">
                <span className="text-accent-blue/70 text-xs">⏱</span>
                <span className="text-light-text dark:text-white/80 font-mono text-xs tabular-nums">
                    {formatDuration(seconds)}
                </span>
            </div>

            {/* Milestone Toast */}
            {showMilestone && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium whitespace-nowrap animate-bounce shadow-lg">
                    {getMilestoneMessage(seconds)}
                </div>
            )}

            {/* SpyTooltip */}
            <SpyTooltip
                visible={isTooltipOpen}
                title="SESSION INFO"
                items={[
                    { label: 'DURASI', value: durationText },
                    { label: 'MULAI', value: `${sessionStartInfo.day}, ${sessionStartInfo.time}` },
                    { label: 'BROWSER', value: browserInfo.browser },
                    { label: 'SISTEM', value: browserInfo.os },
                    { label: 'STATUS', value: '🟢 Aktif' }
                ]}
                targetRef={timerRef}
                color="#10b981"
            />
        </div>
    );
};

export default SessionTimer;
