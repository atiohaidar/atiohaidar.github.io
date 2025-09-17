import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ContactProps {
    pitch: string;
    linkedinUrl: string;
}

const Contact: React.FC<ContactProps> = ({ pitch, linkedinUrl }) => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="contact" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 text-center max-w-2xl print-break-before print:py-12 ${animationClass}`}>
            <h2 className="text-lg text-accent-blue font-poppins mb-2 print:text-gray-600">04. Apa Selanjutnya?</h2>
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
        </section>
    );
};

export default Contact;