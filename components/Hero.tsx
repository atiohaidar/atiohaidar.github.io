
import React from 'react';

const Hero: React.FC = () => {
    return (
        <section id="hero" className="min-h-screen flex items-center container mx-auto px-6 md:px-10">
            <div className="max-w-3xl space-y-4">
                <p className="text-accent-blue text-lg" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}>
                    Halo, nama saya
                </p>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-poppins font-bold text-white" style={{ animation: 'fadeInUp 0.5s ease-out 0.4s forwards', opacity: 0 }}>
                    Tio Haidar Hanif.
                </h1>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold text-soft-gray" style={{ animation: 'fadeInUp 0.5s ease-out 0.6s forwards', opacity: 0 }}>
                    Saya Membangun Solusi Digital Inovatif.
                </h2>
                <p className="max-w-xl text-soft-gray leading-relaxed pt-4" style={{ animation: 'fadeInUp 0.5s ease-out 0.8s forwards', opacity: 0 }}>
                    Saya adalah seorang lulusan S1 Rekayasa Perangkat Lunak dari Universitas Telkom dengan minat mendalam pada pengembangan perangkat lunak, khususnya di bidang backend. Saya memiliki semangat belajar yang tinggi, rasa ingin tahu yang besar, dan kemampuan beradaptasi yang cepat.
                </p>
                <div className="pt-8" style={{ animation: 'fadeInUp 0.5s ease-out 1s forwards', opacity: 0 }}>
                    <a href="#portfolio" className="bg-transparent text-accent-blue border border-accent-blue rounded px-8 py-4 font-medium hover:bg-accent-blue/10 transition-colors duration-300">
                        Lihat Portofolio Saya
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
