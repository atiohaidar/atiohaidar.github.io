/**
 * @file Komponen Hero dengan refactored utilities
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React from 'react';
import { COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { createAnimationStyle, ANIMATION_DELAYS } from '../utils/animations';
import { getExternalLinkProps } from '../utils/url';

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
            
            <section id="hero" className={`min-h-screen flex items-center container mx-auto px-6 md:px-16 lg:px-20 ${PRINT.COMPACT_SPACING} print:min-h-0 print:py-4 print:px-4`}>
                <div className={`max-w-3xl space-y-4 ${PRINT.COMPACT_SPACING}`}>
                <p className={`${COLORS.TEXT_ACCENT} text-lg print:text-gray-600 print:text-base`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.NAME)}>
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
                
                <p className={`max-w-xl ${TYPOGRAPHY.BODY_TEXT} pt-4`} style={createAnimationStyle(ANIMATION_DELAYS.HERO.CTA)}>
                    {bio}
                </p>
                <div className={`pt-8 ${PRINT.HIDE}`} style={createAnimationStyle(1000)}>
                    <a href="#portfolio" className={`bg-transparent ${COLORS.TEXT_ACCENT} border ${COLORS.BORDER_ACCENT} rounded px-8 py-4 font-medium ${COLORS.HOVER_ACCENT}/10 transition-colors duration-300`}>
                        Lihat Portofolio Saya
                    </a>
                </div>
            </div>
        </section>
        </>
    );
};

export default Hero;
