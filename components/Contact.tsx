/**
 * @file Komponen untuk bagian "Kontak".
 * Menampilkan ajakan untuk terhubung dan sebuah tombol yang mengarah ke profil LinkedIn.
 */
import React from 'react';
import Section from './Section';

/**
 * Props untuk komponen Contact.
 */
interface ContactProps {
    /** Teks ajakan untuk menghubungi. */
    pitch: string;
    /** URL profil LinkedIn. */
    linkedinUrl: string;
}

const Contact: React.FC<ContactProps> = ({ pitch, linkedinUrl }) => {
    return (
        <Section id="contact" number="05" title="Apa Selanjutnya?" className="text-center max-w-2xl">
            <h3 className="text-4xl font-poppins font-bold text-white mb-4 print:text-black print:text-3xl">Terhubung Dengan Saya</h3>
            <p className="text-soft-gray leading-relaxed mb-8 print:text-black">
                {pitch}
            </p>
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-transparent text-accent-blue border border-accent-blue rounded px-10 py-4 font-medium hover:bg-accent-blue/10 transition-colors duration-300 text-lg print:hidden">
                Katakan Halo di LinkedIn
            </a>
            <div className="hidden print:block text-center mt-4">
                <p>Anda dapat menemukan saya di LinkedIn:</p>
                <p className="font-semibold text-blue-600">{linkedinUrl}</p>
            </div>
        </Section>
    );
};

export default Contact;
