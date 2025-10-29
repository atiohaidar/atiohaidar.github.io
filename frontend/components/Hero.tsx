/**
 * @file Komponen Hero dengan enhanced Framer Motion animations
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, LAYOUT, PRINT, SPACING, TYPOGRAPHY } from '../utils/styles';
import { getExternalLinkProps } from '../utils/url';
import ParticleBackground from './ParticleBackground';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/motionVariants';

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
            <div className={`${PRINT.SHOW} text-center py-4 border-b border-soft-gray/30`}>
                <h3 className={`text-lg ${TYPOGRAPHY.WEIGHT_SEMIBOLD} ${COLORS.TEXT_WHITE} mb-2`}>Portfolio Online</h3>
                <p className={`${TYPOGRAPHY.SMALL_TEXT}`}>
                    Portfolio: 
                    <a className={`${COLORS.TEXT_ACCENT} underline ml-1`} {...getExternalLinkProps('https://atiohaidar.github.io')}>
                        https://atiohaidar.github.io 🔗
                    </a>
                </p>
            </div>
            
            <section id="hero" className={`h-screen ${LAYOUT.FLEX_CENTER} container mx-auto px-6 md:px-16 lg:px-20 ${PRINT.COMPACT_SPACING} print:min-h-0 print:py-4 print:px-4 relative overflow-hidden bg-gradient-to-br from-deep-navy/95 via-slate-navy/95 to-midnight/95`}>
                <ParticleBackground />
                <motion.div 
                    className={`max-w-3xl space-y-4 ${PRINT.COMPACT_SPACING} text-center relative z-10`}
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.p 
                        className={`${COLORS.TEXT_ACCENT} text-lg print:text-gray-600 print:text-base`}
                        variants={staggerItem}
                    >
                        {greeting}
                    </motion.p>
                    <motion.h1 
                        className={TYPOGRAPHY.HEADING_LARGE}
                        variants={staggerItem}
                    >
                        {name}.
                    </motion.h1>
                    <motion.h2 
                        className={TYPOGRAPHY.HEADING_MEDIUM}
                        variants={staggerItem}
                    >
                        {tagline}
                    </motion.h2>

                    <div className={`${PRINT.SHOW} pt-2 text-sm`}>
                        <p>Portfolio: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps('https://atiohaidar.github.io')}>https://atiohaidar.github.io</a></p>
                        <p>LinkedIn: <a className={`${COLORS.TEXT_ACCENT} underline`} {...getExternalLinkProps(linkedinUrl)}>{linkedinUrl}</a></p>
                    </div>
                    
                    <motion.p 
                        className={`max-w-xl ${TYPOGRAPHY.BODY_TEXT} pt-4`}
                        variants={staggerItem}
                    >
                        {bio}
                    </motion.p>
                    <motion.div 
                        className={`pt-8 ${PRINT.HIDE}`}
                        variants={staggerItem}
                    >
                        <motion.a 
                            href="#portfolio" 
                            className={`inline-block bg-transparent ${COLORS.TEXT_ACCENT} border ${COLORS.BORDER_ACCENT} rounded px-8 py-4 font-medium transition-colors duration-300`}
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: 'rgba(224, 224, 224, 0.1)',
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Lihat Portofolio Saya
                        </motion.a>
                    </motion.div>
                </motion.div>
            </section>
        </>
    );
};

export default Hero;
