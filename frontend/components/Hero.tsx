/**
 * @file Komponen Hero dengan parallax decorations dan particle background
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React, { useRef, useState } from 'react';
import { COLORS as STYLE_COLORS, LAYOUT, PRINT } from '../utils/styles';
import { createAnimationStyle, ANIMATION_DELAYS } from '../utils/animations';
import { getExternalLinkProps } from '../utils/url';
import { useMultiParallax } from '../hooks/useParallax';
import { DoodleArrow, DoodleCar, DoodleCurly, DoodleSparkle, DoodleUnderline, DoodleCircle } from './ui/Doodles';
import SpyTooltip from './SpyTooltip';
import { COLORS } from '../constants';
import { Typography, Heading, Text, HandwritingText } from './ui';

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

/**
 * Helper to wrap each character with wave animation classes
 */
const WaveText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
    return (
        <span className={className}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className={`animate-wave wave-delay-${(index % 16) + 1}`}
                    style={{ display: 'inline-block' }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

const Hero: React.FC<HeroProps> = ({ greeting, name, tagline, bio, linkedinUrl }) => {
    const backendButtonRef = useRef<HTMLAnchorElement>(null);
    const [isBackendTooltipOpen, setIsBackendTooltipOpen] = useState(false);

    // Parallax effect for decorative elements
    const parallax = useMultiParallax();

    return (
        <>
            {/* Header untuk print dengan URL portfolio */}
            <div className={`${PRINT.SHOW} text-center py-4 border-b border-soft-gray/30`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.GREETING)}>
                <Heading level={3} className={`${STYLE_COLORS.TEXT_WHITE} mb-2`}>Portfolio Online</Heading>
                <Text variant="small">
                    Portfolio:
                    <a className={`${STYLE_COLORS.TEXT_ACCENT} underline ml-1`} {...getExternalLinkProps('https://atiohaidar.github.io')}>
                        https://atiohaidar.github.io 🔗
                    </a>
                </Text>
            </div>

            <section
                id="hero"
                className={`min-h-screen ${LAYOUT.FLEX_CENTER} relative overflow-hidden pt-20 pb-0 md:pt-0`}
            >
                {/* Notebook Binder Effect (Left Side) - Only on Desktop */}
                <div className="notebook-binder hidden lg:flex">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="binder-ring shadow-inner"></div>
                    ))}
                </div>

                {/* Content Container - Background is handled by parent/layout */}
                <div className={`container mx-auto px-6 md:px-16 lg:px-20 relative z-10 text-center`}>
                    <div className="max-w-4xl mx-auto space-y-6 relative">
                        {/* Decorative Sparkles scattered around top - with parallax */}
                        <DoodleSparkle
                            className="absolute -top-20 right-1/4 w-12 h-12 text-marker-pink opacity-60 dark:opacity-40 animate-pulse"
                            style={{ transform: `translateY(${parallax.getOffset(0.15, 'down')}px)` }}
                        />
                        <DoodleSparkle
                            className="absolute -top-10 left-1/4 w-8 h-8 text-marker-blue opacity-50 dark:opacity-30 animate-pulse animate-delay-700"
                            style={{ transform: `translateY(${parallax.getOffset(0.1, 'down')}px)` }}
                        />

                        <div className="relative inline-block">
                            <Typography variant="h3" className={`md:text-2xl font-medium text-ink-blue dark:text-chalk-blue tracking-wide relative z-10`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.NAME)}>
                                {greeting}
                            </Typography>
                            <DoodleUnderline className="absolute -bottom-2 left-0 w-full h-4 text-marker-blue opacity-60 dark:opacity-40" />
                        </div>

                        <Heading level={1} className="text-5xl sm:text-7xl lg:text-8xl font-caveat tracking-tight mb-4 relative z-10" style={createAnimationStyle(ANIMATION_DELAYS.HERO.TAGLINE)}>
                            <span className="inline-block relative">
                                {/* SVG Handwriting animation for name */}
                                <HandwritingText
                                    text={name}
                                    fontSize={80}
                                    fontFamily="Caveat, cursive"
                                    strokeColor="currentColor"
                                    fillColor="currentColor"
                                    duration={2.5}
                                    delay={0.5}
                                    className="inline-block align-baseline"
                                />
                                {/* Underline draw animation for highlight */}
                                <span className="absolute -bottom-1 left-0 w-full h-3 bg-marker-yellow/80 rounded-full -z-10 transform -rotate-1 animate-underline-draw"></span>

                                {/* Decorative circle around the dot or end of name */}
                                <DoodleCircle className="absolute -right-8 -top-4 w-16 h-16 text-marker-pink opacity-60 dark:opacity-30 animate-draw pointer-events-none" />
                            </span>
                            <span className="text-ink-blue dark:text-chalk-blue">.</span>
                        </Heading>

                        <div className="relative inline-block px-4">
                            <Heading level={2} className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-light-muted dark:text-slate-300" style={createAnimationStyle(ANIMATION_DELAYS.HERO.BIO)}>
                                {/* Wave animation for tagline */}
                                <WaveText text={tagline} />
                            </Heading>
                            {/* Curly line under tagline - with gentle float */}
                            <DoodleCurly className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-6 text-marker-green opacity-60 dark:opacity-40 animate-gentle-float" />
                        </div>

                        <div className={`${PRINT.SHOW} pt-2 text-sm`}>
                            <p>Portfolio: <a className={`${STYLE_COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps('https://atiohaidar.github.io')}>https://atiohaidar.github.io</a></p>
                            <p>LinkedIn: <a className={`${STYLE_COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps(linkedinUrl)}>{linkedinUrl}</a></p>
                        </div>

                        <Typography variant="body" className={`max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-slate-400 pt-6`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.CTA)}>
                            {bio}
                        </Typography>

                        <div className={`pt-12 flex flex-col sm:flex-row gap-6 justify-center relative ${PRINT.HIDE}`} style={createAnimationStyle(1000)}>
                            <div className="relative group">
                                <a href="#portfolio" className="glass-button px-8 py-4 hover:text-accent-blue hover:border-accent-blue/50 block">
                                    <Typography variant="h4" className="text-light-text dark:text-white">Lihat Portofolio</Typography>
                                </a>
                                {/* Arrow pointing from Portofolio downward */}
                                <DoodleArrow className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-12 h-12 text-marker-pink rotate-90 hidden sm:block opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div
                                className="relative"
                                onMouseEnter={() => setIsBackendTooltipOpen(true)}
                                onMouseLeave={() => setIsBackendTooltipOpen(false)}
                            >
                                <a
                                    ref={backendButtonRef}
                                    href="#backend"
                                    className="glass-button block px-8 py-4 bg-accent-blue text-white hover:bg-accent-blue/90 relative z-10"
                                >
                                    <Typography variant="h4">⚡ Coba Backend</Typography>
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
                                {/* Sparkles on backend button */}
                                <DoodleSparkle className="absolute -top-4 -right-4 w-8 h-8 text-marker-yellow animate-wiggle" />
                            </div>
                            <div className="relative group">
                                <a
                                    href="#form-token"
                                    className="glass-button px-8 py-4 bg-transparent hover:bg-white/5 hover:text-accent-blue block"
                                >
                                    <Typography variant="h4">Akses Form</Typography>
                                </a>
                                {/* Arrow pointing back to Portofolio on mobile or just decorative */}
                                <DoodleArrow className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-marker-blue -rotate-90 hidden sm:block opacity-30" />
                            </div>

                            {/* Call-out Arrow pointing to CTA (Desktop) */}
                            <div className="absolute -left-40 bottom-10 hidden xl:block pointer-events-none transition-transform group-hover:translate-x-2">
                                <span className="font-patrick text-2xl text-ink-blue dark:text-chalk-blue absolute -top-12 -left-4 -rotate-12 w-48">
                                    Ada Emot Roket! 🚀
                                </span>
                                <DoodleArrow className="w-24 h-24 text-marker-orange opacity-90 dark:text-marker-yellow dark:opacity-100 rotate-[15deg]" />
                            </div>
                        </div>

                        {/* Distant random doodles to fill space further out - with parallax */}
                        <div
                            className="absolute -top-20 -left-40 opacity-40 dark:opacity-20 pointer-events-none hidden lg:block"
                            style={{ transform: `translateY(${parallax.getOffset(0.2, 'down')}px)` }}
                        >
                            <DoodleCurly className="w-40 h-10 text-marker-blue rotate-45" />
                        </div>
                        <div
                            className="absolute top-1/4 -right-60 opacity-30 dark:opacity-10 pointer-events-none hidden xl:block"
                            style={{ transform: `translateY(${parallax.getOffset(0.05, 'up')}px)` }}
                        >
                            <DoodleCircle className="w-64 h-64 text-marker-green" />
                        </div>
                        <div
                            className="absolute -bottom-40 right-1/3 opacity-40 dark:opacity-20 pointer-events-none hidden lg:block"
                            style={{ transform: `translateY(${parallax.getOffset(0.25, 'up')}px)` }}
                        >
                            <DoodleCar className="w-20 h-20 text-marker-yellow animate-float" />
                        </div>
                    </div>
                </div>
                {/* Pencil Smudges textures - with parallax for depth */}
                <div
                    className="pencil-smudge w-64 h-64 -top-20 -left-20 rotate-45"
                    style={{ transform: `translateY(${parallax.getOffset(0.08, 'down')}px) rotate(45deg)` }}
                ></div>
                <div
                    className="pencil-smudge w-96 h-96 bottom-[10%] right-[15%] -rotate-12"
                    style={{ transform: `translateY(${parallax.getOffset(0.12, 'up')}px) rotate(-12deg)` }}
                ></div>
                <div
                    className="pencil-smudge w-48 h-48 top-1/2 -right-10 opacity-[0.03]"
                    style={{ transform: `translateY(${parallax.getOffset(0.06, 'down')}px)` }}
                ></div>
            </section>
        </>
    );
};

export default Hero;

