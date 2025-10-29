/**
 * @file Komponen Hero dengan refactored utilities dan particle background
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React from 'react';
import { COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { createAnimationStyle, ANIMATION_DELAYS } from '../utils/animations';
import { getExternalLinkProps } from '../utils/url';
import ParticleBackground from './ParticleBackground';

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
                className={`h-screen ${LAYOUT.FLEX_CENTER} container mx-auto px-6 md:px-16 lg:px-20 ${PRINT.COMPACT_SPACING} print:min-h-0 print:py-4 print:px-4 relative overflow-hidden bg-gradient-to-br from-light-bg via-accent-blue/10 to-light-card dark:from-deep-navy dark:via-accent-blue/20 dark:to-light-navy`}
            >
                <ParticleBackground />
                <div className={`max-w-3xl space-y-4 ${PRINT.COMPACT_SPACING} text-center relative z-10`}>
                <p className={`text-light-accent dark:text-accent-blue text-lg print:text-gray-600 print:text-base`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.NAME)}>
                    {greeting}
                </p>
                <h1 className={TYPOGRAPHY.HEADING_LARGE} style={createAnimationStyle(ANIMATION_DELAYS.HERO.TAGLINE)}>
                    {name}.
                </h1>
                <h2 className={TYPOGRAPHY.HEADING_MEDIUM} style={createAnimationStyle(ANIMATION_DELAYS.HERO.BIO)}>
                    {tagline}
                </h2>

                <div className={`${PRINT.SHOW} pt-2 text-sm`}>
                    <p>Portfolio: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps('https://atiohaidar.github.io')}>https://atiohaidar.github.io</a></p>
                    <p>LinkedIn: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps(linkedinUrl)}>{linkedinUrl}</a></p>
                </div>
                
                <p className={`max-w-xl ${TYPOGRAPHY.BODY_TEXT} pt-4 text-light-muted dark:text-soft-gray`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.CTA)}>
                    {bio}
                </p>
                <div className={`pt-8 ${PRINT.HIDE}`} style={createAnimationStyle(1000)}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#portfolio" className={`bg-transparent ${COLORS.TEXT_ACCENT} border ${COLORS.BORDER_ACCENT} rounded px-8 py-4 font-medium ${COLORS.HOVER_ACCENT} transition-colors duration-300`}>
                            Lihat Portofolio Saya
                        </a>
                        <a
                            href="#backend"
                            className={`px-8 py-4 rounded font-medium transition-colors duration-300 ${COLORS.BUTTON_PRIMARY} text-white border border-light-accent dark:border-accent-blue hover:opacity-90`}
                        >
                            �️ Coba Backend
                        </a>
                        <a
                            href="#form-token"
                            className={`px-8 py-4 rounded font-medium transition-colors duration-300 ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} border border-light-accent/40 dark:border-accent-blue/40 hover:opacity-90`}
                        >
                            Masukkan Token Formulir
                        </a>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default Hero;
