/**
 * @file Komponen untuk bagian "Kontak".
 * Menampilkan ajakan untuk terhubung dan sebuah tombol yang mengarah ke profil LinkedIn.
 */
import React, { memo, useMemo } from 'react';
import Section from './Section';
import { PRINT } from '../utils/styles';
import { Typography, Heading, Text } from './ui';

interface ContactProps {
    /** Teks ajakan untuk menghubungi. */
    pitch: string;
    /** URL profil LinkedIn. */
    linkedinUrl: string;
}

// Style constants
// Style constants
const STYLES = {
    button: `inline-block glass-button px-12 py-4 ${PRINT.HIDE}`,
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
            <Heading level={2} className="mb-6 print:text-black">Hubungi Saya</Heading>
            <Text className="text-xl mb-10 print:text-black">{pitch}</Text>

            {isValid && (
                <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={STYLES.button}
                    aria-label="Kunjungi profil LinkedIn saya"
                >
                    <Typography variant="h4" as="span">LinkedIn</Typography>
                </a>
            )}

            <div className={STYLES.printContainer}>
                <Text>Anda dapat menemukan saya di LinkedIn:</Text>
                <Text variant="body" className="font-semibold text-blue-600">{linkedinUrl}</Text>
            </div>
        </Section>
    );
});

Contact.displayName = 'Contact';

export default Contact;
