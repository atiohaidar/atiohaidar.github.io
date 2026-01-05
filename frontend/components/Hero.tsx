/**
 * @file Komponen Hero dengan refactored utilities dan particle background
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React, { useRef, useState } from 'react';
import { COLORS as STYLE_COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { createAnimationStyle, ANIMATION_DELAYS } from '../utils/animations';
import { getExternalLinkProps } from '../utils/url';
import ParticleBackground from './ParticleBackground';
import SpyTooltip from './SpyTooltip';
import { COLORS } from '../constants';

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
                <h3 className={`text-lg ${TYPOGRAPHY.WEIGHT_SEMIBOLD} ${STYLE_COLORS.TEXT_WHITE} mb-2`}>Portfolio Online</h3>
                <p className={`${TYPOGRAPHY.SMALL_TEXT}`}>
                    Portfolio:
                    <a className={`${STYLE_COLORS.TEXT_ACCENT} underline ml-1`} {...getExternalLinkProps('https://atiohaidar.github.io')}>
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
                        <p className={`text-xl md:text-2xl font-caveat font-medium text-ink-blue dark:text-chalk-blue tracking-wide`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.NAME)}>
                            {greeting}
                        </p>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-4" style={createAnimationStyle(ANIMATION_DELAYS.HERO.TAGLINE)}>
                            <span className="inline-block relative">
                                {name}
                                <span className="absolute -bottom-1 left-0 w-full h-3 bg-marker-yellow/80 rounded-full opacity-0 animate-fade-in-up animation-delay-500 -z-10 transform -rotate-1"></span>
                            </span>
                            <span className="text-ink-blue dark:text-chalk-blue">.</span>
                        </h1>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-light-muted dark:text-slate-300" style={createAnimationStyle(ANIMATION_DELAYS.HERO.BIO)}>
                            {tagline}
                        </h2>

                        <div className={`${PRINT.SHOW} pt-2 text-sm`}>
                            <p>Portfolio: <a className={`${STYLE_COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps('https://atiohaidar.github.io')}>https://atiohaidar.github.io</a></p>
                            <p>LinkedIn: <a className={`${STYLE_COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps(linkedinUrl)}>{linkedinUrl}</a></p>
                        </div>

                        <p className={`max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-slate-400 pt-6`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.CTA)}>
                            {bio}
                        </p>

                        <div className={`pt-10 flex flex-col sm:flex-row gap-4 justify-center ${PRINT.HIDE}`} style={createAnimationStyle(1000)}>
                            <a href="#portfolio" className="glass-button px-8 py-4 text-lg font-medium text-light-text dark:text-white hover:text-accent-blue hover:border-accent-blue/50">
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
                                    className="glass-button block px-8 py-4 text-lg font-medium bg-accent-blue text-white hover:bg-accent-blue/90"
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
                                    color={COLORS.success}
                                />
                            </div>
                            <a
                                href="#form-token"
                                className="glass-button px-8 py-4 text-lg font-medium bg-transparent hover:bg-white/5 hover:text-accent-blue"
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

