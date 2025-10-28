/**
 * @file Komponen Navbar dengan refactored utilities
 * Menampilkan navigasi utama dan beradaptasi ke menu mobile pada layar kecil.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './Icons';
import { COLORS, LAYOUT, PRINT, SPACING } from '../utils/styles';
import { getExternalLinkProps } from '../utils/url';
import ThemeToggle from './ThemeToggle';
import type { SocialLinks } from '../types';

/**
 * Props untuk komponen Navbar.
 */
interface NavbarProps {
  /** Sumber (URL atau data URI) untuk gambar logo. */
  logoSrc: string;
  /** Social media links untuk dropdown hover. */
  socials: SocialLinks;
  /** Username jika user sudah login */
  loggedInUser?: string | null;
  /** Callback untuk logout */
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ logoSrc, socials, loggedInUser, onLogout }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${PRINT.HIDE} ${isScrolled ? 'bg-deep-navy/80 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
            <nav className={`container mx-auto ${SPACING.CONTAINER_PADDING} py-4 ${LAYOUT.FLEX_BETWEEN}`}>
                {/* Logo with social media dropdown */}
                <div className="relative group z-50">
                    <a href="#hero" className="block">
                        <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-full object-cover transition-all duration-300 group-hover:ring-2 group-hover:ring-accent-blue group-hover:ring-offset-2 group-hover:ring-offset-deep-navy" />
                    </a>
                    
                    {/* Social media dropdown */}
                    <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                        <div className="bg-light-navy rounded-lg shadow-xl p-3 min-w-[160px] border border-soft-gray/20">
                            <p className="text-xs text-soft-gray mb-2 font-medium">Connect with me</p>
                            <div className="space-y-2">
                                <a href={socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-200 p-2 rounded hover:bg-deep-navy">
                                    <GitHubIcon className="w-4 h-4 mr-3" />
                                    GitHub
                                </a>
                                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-200 p-2 rounded hover:bg-deep-navy">
                                    <LinkedInIcon className="w-4 h-4 mr-3" />
                                    LinkedIn
                                </a>
                                {socials.instagram && (
                                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-200 p-2 rounded hover:bg-deep-navy">
                                        <InstagramIcon className="w-4 h-4 mr-3" />
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Desktop Nav */}
                <ul className="hidden md:flex items-center space-x-8">
                    {NAV_LINKS.map((link, index) => (
                        <li key={link.name}>
                            {link.href.startsWith('#') ? (
                                <a href={link.href} className="text-light-slate hover:text-accent-blue transition-colors duration-300">
                                    <span className="text-accent-blue mr-1">0{index + 1}.</span>{link.name}
                                </a>
                            ) : (
                                <Link to={link.href} className="text-light-slate hover:text-accent-blue transition-colors duration-300">
                                    <span className="text-accent-blue mr-1">0{index + 1}.</span>{link.name}
                                </Link>
                            )}
                        </li>
                    ))}
                    
                    {/* Theme Toggle */}
                    <li>
                        <ThemeToggle />
                    </li>
                    
                    {/* User info atau Login button */}
                    {loggedInUser ? (
                        <li className="relative user-menu-container">
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center space-x-2 text-light-slate hover:text-accent-blue transition-colors duration-300 bg-light-navy/50 px-4 py-2 rounded-lg border border-accent-blue/30"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>{loggedInUser}</span>
                                <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {/* User dropdown menu */}
                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-light-navy rounded-lg shadow-xl p-2 min-w-[180px] border border-soft-gray/20">
                                    <Link 
                                        to="/dashboard" 
                                        className="block px-4 py-2 text-sm text-soft-gray hover:text-accent-blue hover:bg-deep-navy rounded transition-colors duration-200"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            onLogout?.();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-soft-gray hover:text-red-400 hover:bg-deep-navy rounded transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    ) : (
                        <li>
                            <Link 
                                to="/login" 
                                className="text-accent-blue border border-accent-blue px-4 py-2 rounded hover:bg-accent-blue hover:text-deep-navy transition-all duration-300"
                            >
                                Login
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Mobile Menu Button */}
                <div className="md:hidden z-50">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-accent-blue">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed top-0 right-0 h-full w-3/4 bg-light-navy transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <ul className="flex flex-col items-center justify-center h-full space-y-8">
                    {NAV_LINKS.map((link, index) => (
                        <li key={link.name}>
                            {link.href.startsWith('#') ? (
                                <a href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl text-light-slate hover:text-accent-blue transition-colors duration-300">
                                    <span className="text-accent-blue mr-2">0{index + 1}.</span>{link.name}
                                </a>
                            ) : (
                                <Link to={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl text-light-slate hover:text-accent-blue transition-colors duration-300">
                                    <span className="text-accent-blue mr-2">0{index + 1}.</span>{link.name}
                                </Link>
                            )}
                        </li>
                    ))}
                    
                    {/* Mobile user info atau login */}
                    {loggedInUser ? (
                        <>
                            <li className="pt-4 border-t border-soft-gray/20 w-full text-center">
                                <div className="text-light-slate mb-4">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <svg className="w-6 h-6 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xl">{loggedInUser}</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-xl text-accent-blue hover:text-accent-blue transition-colors duration-300"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <button 
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onLogout?.();
                                    }}
                                    className="text-xl text-red-400 hover:text-red-300 transition-colors duration-300"
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li className="pt-4 border-t border-soft-gray/20">
                            <Link 
                                to="/login" 
                                onClick={() => setIsMenuOpen(false)}
                                className="text-xl text-accent-blue border border-accent-blue px-6 py-3 rounded hover:bg-accent-blue hover:text-deep-navy transition-all duration-300 inline-block"
                            >
                                Login
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
             {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-30"></div>}
        </header>
    );
};

export default Navbar;
