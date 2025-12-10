/**
 * @file Komponen Hero dengan refactored utilities dan particle background
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React, { useRef, useState } from 'react';
import { COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { createAnimationStyle, ANIMATION_DELAYS } from '../utils/animations';
import { getExternalLinkProps } from '../utils/url';
import ParticleBackground from './ParticleBackground';
import SpyTooltip from './SpyTooltip';

/**
 * Props untuk komponen Hero.
 */
interface HeroProps {
    /** Teks sapaan, mis. "Halo, nama saya". */
    greeting: string;
    /** Nama lengkap. */
    name: string;
    /** Tagline atau jabatan. */
    tagline: string;
    /** Paragraf bio singkat. */
    bio: string;
    /** URL profil LinkedIn untuk ditampilkan di versi cetak. */
    linkedinUrl: string;
}

const Hero: React.FC<HeroProps> = ({ greeting, name, tagline, bio, linkedinUrl }) => {
    const backendButtonRef = useRef<HTMLAnchorElement>(null);
    const [isBackendTooltipOpen, setIsBackendTooltipOpen] = useState(false);

    return (
        <>
            {/* Header untuk print dengan URL portfolio */}
            <div className={`${PRINT.SHOW} text-center py-4 border-b border-soft-gray/30`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.GREETING)}>
                <h3 className={`text-lg ${TYPOGRAPHY.WEIGHT_SEMIBOLD} ${COLORS.TEXT_WHITE} mb-2`}>Portfolio Online</h3>
                <p className={`${TYPOGRAPHY.SMALL_TEXT}`}>
                    Portfolio:
                    <a className={`${COLORS.TEXT_ACCENT} underline ml-1`} {...getExternalLinkProps('https://atiohaidar.github.io')}>
                        https://atiohaidar.github.io 🔗
                    </a>
                </p>
            </div>

            <section
                id="hero"
                className={`min-h-screen ${LAYOUT.FLEX_CENTER} relative overflow-hidden pt-20 pb-0 md:pt-0`}
            >
                {/* Content Container - Background is handled by parent/layout */}
                <div className={`container mx-auto px-6 md:px-16 lg:px-20 relative z-10 text-center`}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className={`text-lg md:text-xl font-medium text-accent-blue dark:text-cyan-400 tracking-wide uppercase`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.NAME)}>
                            {greeting}
                        </p>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-light-text dark:text-white mb-4" style={createAnimationStyle(ANIMATION_DELAYS.HERO.TAGLINE)}>
                            <span className="inline-block relative">
                                {name}
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-accent-blue rounded-full opacity-0 animate-fade-in-up animation-delay-500"></span>
                            </span>
                            <span className="text-accent-blue">.</span>
                        </h1>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-light-muted dark:text-slate-300" style={createAnimationStyle(ANIMATION_DELAYS.HERO.BIO)}>
                            {tagline}
                        </h2>

                        <div className={`${PRINT.SHOW} pt-2 text-sm`}>
                            <p>Portfolio: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps('https://atiohaidar.github.io')}>https://atiohaidar.github.io</a></p>
                            <p>LinkedIn: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps(linkedinUrl)}>{linkedinUrl}</a></p>
                        </div>

                        <p className={`max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-slate-400 pt-6`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.CTA)}>
                            {bio}
                        </p>

                        <div className={`pt-10 flex flex-col sm:flex-row gap-4 justify-center ${PRINT.HIDE}`} style={createAnimationStyle(1000)}>
                            <a href="#portfolio" className="glass-button px-8 py-4 rounded-full text-lg font-medium text-light-text dark:text-white hover:text-accent-blue hover:border-accent-blue/50">
                                Lihat Portofolio
                            </a>
                            <div
                                className="relative"
                                onMouseEnter={() => setIsBackendTooltipOpen(true)}
                                onMouseLeave={() => setIsBackendTooltipOpen(false)}
                            >
                                <a
                                    ref={backendButtonRef}
                                    href="#backend"
                                    className="block px-8 py-4 rounded-full text-lg font-medium bg-accent-blue text-white shadow-lg shadow-accent-blue/30 hover:bg-accent-blue/90 hover:-translate-y-1 transition-all duration-300"
                                >
                                    ⚡ Coba Backend
                                </a>
                                <SpyTooltip
                                    visible={isBackendTooltipOpen}
                                    title="BACKEND DEMO"
                                    items={[
                                        { label: 'AKSES', value: 'Login sebagai Admin' },
                                        { label: 'KELOLA', value: 'Users, Items, Tasks, Forms' },
                                        { label: 'FINANCE', value: 'Top-up, Transfer, Transaksi' },
                                        { label: 'BOOKING', value: 'Event & Ruangan' },
                                        { label: 'SUPPORT', value: 'Ticketing System' },
                                    ]}
                                    targetRef={backendButtonRef as React.RefObject<HTMLElement>}
                                    color="#10b981"
                                />
                            </div>
                            <a
                                href="#form-token"
                                className="px-8 py-4 rounded-full text-lg font-medium border border-gray-300 dark:border-white/20 hover:bg-white/5 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                            >
                                Akses Form
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;

