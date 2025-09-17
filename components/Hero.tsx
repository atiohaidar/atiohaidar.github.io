/**
 * @file Komponen Hero, bagian pertama yang dilihat pengguna.
 * Menampilkan perkenalan singkat, nama, tagline, bio, dan tombol CTA.
 */
import React from 'react';

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
        <section id="hero" className="min-h-screen flex items-center container mx-auto px-6 md:px-10 print:min-h-0 print:py-12">
            <div className="max-w-3xl space-y-4">
                <p className="text-accent-blue text-lg print:text-gray-600 print:text-base" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}>
                    {greeting}
                </p>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-poppins font-bold text-white print:text-black print:text-5xl" style={{ animation: 'fadeInUp 0.5s ease-out 0.4s forwards', opacity: 0 }}>
                    {name}.
                </h1>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold text-soft-gray print:text-gray-700 print:text-4xl" style={{ animation: 'fadeInUp 0.5s ease-out 0.6s forwards', opacity: 0 }}>
                    {tagline}
                </h2>

                <div className="hidden print:block pt-2 text-sm text-gray-600">
                    <p>LinkedIn: <a href={linkedinUrl} className="text-blue-600">{linkedinUrl}</a></p>
                </div>
                
                <p className="max-w-xl text-soft-gray leading-relaxed pt-4 print:text-black print:text-base" style={{ animation: 'fadeInUp 0.5s ease-out 0.8s forwards', opacity: 0 }}>
                    {bio}
                </p>
                <div className="pt-8 print:hidden" style={{ animation: 'fadeInUp 0.5s ease-out 1s forwards', opacity: 0 }}>
                    <a href="#portfolio" className="bg-transparent text-accent-blue border border-accent-blue rounded px-8 py-4 font-medium hover:bg-accent-blue/10 transition-colors duration-300">
                        Lihat Portofolio Saya
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
