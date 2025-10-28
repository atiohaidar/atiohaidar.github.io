/**
 * @file Komponen Navbar dengan refactored utilities
 * Menampilkan navigasi utama dan beradaptasi ke menu mobile pada layar kecil.
 */
import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../constants';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './Icons';
import { COLORS, LAYOUT, PRINT, SPACING } from '../utils/styles';
import { getExternalLinkProps } from '../utils/url';
import type { SocialLinks } from '../types';

/**
 * Props untuk komponen Navbar.
 */
interface NavbarProps {
  /** Sumber (URL atau data URI) untuk gambar logo. */
  logoSrc: string;
  /** Social media links untuk dropdown hover. */
  socials: SocialLinks;
}

const Navbar: React.FC<NavbarProps> = ({ logoSrc, socials }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                            <a href={link.href} className="text-light-slate hover:text-accent-blue transition-colors duration-300">
                                <span className="text-accent-blue mr-1">0{index + 1}.</span>{link.name}
                            </a>
                        </li>
                    ))}
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
                            <a href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl text-light-slate hover:text-accent-blue transition-colors duration-300">
                                <span className="text-accent-blue mr-2">0{index + 1}.</span>{link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
             {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-30"></div>}
        </header>
    );
};

export default Navbar;
