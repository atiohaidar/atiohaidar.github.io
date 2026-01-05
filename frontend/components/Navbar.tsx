import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, type NavAction } from '../constants';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './Icons';
import { COLORS, TYPOGRAPHY, PRINT } from '../utils/styles';
import ThemeToggle from './ThemeToggle';
import type { SocialLinks } from '../types';
import SpyTooltip from './SpyTooltip';
import SessionTimer from './SessionTimer';

interface NavbarProps {
    logoSrc: string;
    socials: SocialLinks;
    loggedInUser?: string | null;
    onLogout?: () => void;
    onNavAction?: (action: NavAction) => void;
}

const Navbar: React.FC<NavbarProps> = ({ logoSrc, socials, loggedInUser, onLogout, onNavAction }) => {
    const logoRef = React.useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoTooltipOpen, setIsLogoTooltipOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUserMenuOpen) {
                const target = event.target as HTMLElement;
                if (!target.closest('.user-menu-container')) {
                    setIsUserMenuOpen(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isUserMenuOpen]);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${PRINT.HIDE} ${isScrolled ? 'py-4' : 'py-6'}`}>
            <nav className={`container mx-auto px-6 md:px-12`}>
                <div className={`rounded-full transition-all duration-300 ${isScrolled ? 'glass-panel px-6 py-3 border-2 border-slate-800' : 'bg-transparent py-2'}`}>
                    <div className="flex items-center justify-between">
                        {/* Logo section */}
                        <div
                            ref={logoRef}
                            className="flex items-center gap-4 relative"
                            onMouseEnter={() => setIsLogoTooltipOpen(true)}
                            onMouseLeave={() => setIsLogoTooltipOpen(false)}
                            onClick={() => setIsLogoTooltipOpen(!isLogoTooltipOpen)}
                        >
                            <a href="#hero" className="block relative group">
                                <div className={`absolute inset-0 ${COLORS.BG_ACCENT} opacity-20 rounded-full blur-md group-hover:blur-lg transition-all duration-300 opacity-0 group-hover:opacity-100`} />
                                <img src={logoSrc} alt="Logo" className={`relative h-10 w-10 rounded-full object-cover border-2 shadow-sm border-slate-800 dark:border-slate-600 transition-all duration-300`} />
                            </a>

                            <SpyTooltip
                                visible={isLogoTooltipOpen}
                                title="IDENTITY"
                                items={[
                                    { label: 'CODENAME', value: 'Tio Haidar' },
                                    { label: 'ROLE', value: 'Software Dev' },
                                    { label: 'STATUS', value: 'Active' },
                                    { label: 'LOC', value: 'Bandung, ID' }
                                ]}
                                targetRef={logoRef}
                            />
                        </div>

                        {/* Desktop Nav */}
                        <ul className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            {NAV_LINKS.map((link, index) => (
                                <li key={link.name}>
                                    {link.type === 'route' ? (
                                        <Link to={link.href} className={`px-4 py-2 rounded-lg text-lg font-bold font-patrick ${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_ACCENT} transition-all duration-200`}>
                                            <span className={`${COLORS.TEXT_ACCENT} opacity-70 mr-1.5 text-xs font-mono`}>0{index + 1}.</span>{link.name}
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onNavAction?.(link.action)}
                                            className={`px-4 py-2 rounded-lg text-lg font-bold font-patrick ${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_ACCENT} transition-all duration-200`}
                                        >
                                            <span className={`${COLORS.TEXT_ACCENT} opacity-70 mr-1.5 text-xs font-mono`}>0{index + 1}.</span>{link.name}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Right Side Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Session Timer (replaces LiveClock) */}
                            <SessionTimer />

                            {/* Socials Mini */}
                            <div className={`flex items-center px-3 border-l border-r ${COLORS.BORDER} space-x-1`}>
                                <a href={socials.github} target="_blank" rel="noopener noreferrer" className={`p-2 ${COLORS.TEXT_MUTED} hover:${COLORS.TEXT_PRIMARY} rounded-full transition-all`}>
                                    <GitHubIcon className="w-4 h-4" />
                                </a>
                                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className={`p-2 ${COLORS.TEXT_MUTED} hover:${COLORS.TEXT_PRIMARY} rounded-full transition-all`}>
                                    <LinkedInIcon className="w-4 h-4" />
                                </a>
                            </div>

                            <ThemeToggle />

                            {loggedInUser ? (
                                <div className="relative user-menu-container">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className={`flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full glass-button hover:${COLORS.BG_ACCENT} transition-colors border-2 ${COLORS.BORDER}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${COLORS.BG_ACCENT} flex items-center justify-center ${COLORS.TEXT_ACCENT} font-bold text-xs`}>
                                            {loggedInUser.substring(0, 2).toUpperCase()}
                                        </div>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute top-full right-0 mt-3 glass-card min-w-[200px] p-2 animate-fade-in-up">
                                            <div className={`px-4 py-3 border-b ${COLORS.BORDER} mb-2`}>
                                                <p className={`text-xs ${COLORS.TEXT_MUTED}`}>Masuk sebagai</p>
                                                <p className={`font-bold font-patrick text-base truncate ${COLORS.TEXT_PRIMARY}`}>{loggedInUser}</p>
                                            </div>
                                            <Link
                                                to="/dashboard"
                                                className={`block px-4 py-2 text-sm ${COLORS.TEXT_SECONDARY} hover:${COLORS.TEXT_ACCENT} hover:underline rounded-lg transition-colors font-patrick`}
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    onLogout?.();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-1 font-patrick"
                                            >
                                                Keluar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="glass-button px-6 py-2 font-bold font-patrick text-xl"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>

                        {/* Mobile Session Timer - shows between logo and hamburger */}
                        <div className="md:hidden flex-1 flex justify-center">
                            <SessionTimer />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg text-light-muted dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            <div
                className={`md:hidden fixed inset-y-0 right-0 z-40 w-[80%] max-w-sm glass-panel transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-lg font-bold text-gradient">Menu</span>
                        <ThemeToggle />
                    </div>

                    <nav className="flex-1 space-y-2">
                        {NAV_LINKS.map((link, index) => (
                            <div key={link.name}>
                                {link.type === 'route' ? (
                                    <Link
                                        to={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl text-xl font-bold font-patrick ${COLORS.TEXT_SECONDARY} hover:${COLORS.BG_ACCENT} hover:${COLORS.TEXT_ACCENT} transition-all`}
                                    >
                                        <span className={`${COLORS.TEXT_ACCENT} opacity-50 mr-3 text-sm font-mono`}>0{index + 1}.</span>
                                        {link.name}
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            onNavAction?.(link.action);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xl font-bold font-patrick ${COLORS.TEXT_SECONDARY} hover:${COLORS.BG_ACCENT} hover:${COLORS.TEXT_ACCENT} transition-all`}
                                    >
                                        <span className={`${COLORS.TEXT_ACCENT} opacity-50 mr-3 text-sm font-mono`}>0{index + 1}.</span>
                                        {link.name}
                                    </button>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className={`mt-auto pt-6 border-t ${COLORS.BORDER} space-y-4`}>
                        {/* Session Timer for Mobile */}
                        <div className="flex justify-center py-2">
                            <SessionTimer />
                        </div>

                        <div className="flex gap-4 justify-center py-4">
                            <a href={socials.github} className={`p-3 rounded-full ${COLORS.BG_ACCENT} opacity-20 hover:opacity-100 transition-opacity`}>
                                <GitHubIcon className={`w-5 h-5 ${COLORS.TEXT_PRIMARY}`} />
                            </a>
                            <a href={socials.linkedin} className={`p-3 rounded-full ${COLORS.BG_ACCENT} opacity-20 hover:opacity-100 transition-opacity`}>
                                <LinkedInIcon className={`w-5 h-5 ${COLORS.TEXT_PRIMARY}`} />
                            </a>
                        </div>

                        {loggedInUser ? (
                            <div className="space-y-3">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block w-full text-center py-3 rounded-xl ${COLORS.BG_ACCENT} ${COLORS.TEXT_ON_ACCENT} font-bold font-patrick text-xl border-2 ${COLORS.BORDER}`}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onLogout?.();
                                    }}
                                    className="block w-full text-center py-3 rounded-xl border-2 border-red-500/20 text-red-500 font-bold font-patrick text-xl hover:bg-red-500/5 shadow-sm"
                                >
                                    Keluar ({loggedInUser})
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block w-full text-center py-3 rounded-xl glass-button font-bold font-patrick text-2xl`}
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
                />
            )}
        </header>
    );
};

export default Navbar;
