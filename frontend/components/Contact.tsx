/**
 * @file Komponen untuk bagian "Kontak".
 * Menampilkan ajakan untuk terhubung dan sebuah tombol yang mengarah ke profil LinkedIn.
 */
import React, { memo, useMemo } from 'react';
import Section from './Section';
import { COLORS, PRINT, TYPOGRAPHY } from '../utils/styles';

interface ContactProps {
    /** Teks ajakan untuk menghubungi. */
    pitch: string;
    /** URL profil LinkedIn. */
    linkedinUrl: string;
}

// Style constants
const STYLES = {
    heading: `text-4xl font-poppins font-bold ${COLORS.TEXT_PRIMARY} mb-4 print:text-black print:text-3xl`,
    description: `${COLORS.TEXT_SECONDARY} leading-relaxed mb-8 print:text-black`,
    button: `inline-block bg-transparent ${COLORS.TEXT_ACCENT} border ${COLORS.BORDER_ACCENT} rounded px-10 py-4 font-medium ${COLORS.HOVER_ACCENT} transition-colors duration-300 text-lg ${PRINT.HIDE}`,
    printContainer: `${PRINT.SHOW} text-center mt-4`,
} as const;

const LINKEDIN_PATTERN = /^https?:\/\/(www\.)?linkedin\.com\//i;

const isValidLinkedInUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) && LINKEDIN_PATTERN.test(url);
    } catch {
        return false;
    }
};

const Contact: React.FC<ContactProps> = memo(({ pitch, linkedinUrl }) => {
    const safeUrl = useMemo(() => {
        return isValidLinkedInUrl(linkedinUrl) ? linkedinUrl : '#';
    }, [linkedinUrl]);

    const isValid = safeUrl !== '#';

    return (
        <Section
            id="contact"
            number="05"
            title="Apa Selanjutnya?"
            className="text-center max-w-2xl"
            delay={2400}
            printPageBreak={false}
        >
            <h3 className={STYLES.heading}>Hubungi Saya</h3>
            <p className={STYLES.description}>{pitch}</p>
            
            {isValid && (
                <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={STYLES.button}
                    aria-label="Kunjungi profil LinkedIn saya"
                >
                    LinkedIn
                </a>
            )}

            <div className={STYLES.printContainer}>
                <p>Anda dapat menemukan saya di LinkedIn:</p>
                <p className="font-semibold text-blue-600">{linkedinUrl}</p>
            </div>
        </Section>
    );
});

Contact.displayName = 'Contact';

export default Contact;
