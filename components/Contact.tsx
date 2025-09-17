
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Contact: React.FC = () => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="contact" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 text-center max-w-2xl ${animationClass}`}>
            <h2 className="text-lg text-accent-blue font-poppins mb-2">04. Hubungi Saya</h2>
            <h3 className="text-4xl font-poppins font-bold text-white mb-4">Get In Touch</h3>
            <p className="text-soft-gray leading-relaxed mb-8">
                Saya saat ini terbuka untuk peluang baru. Jika Anda memiliki pertanyaan atau ingin berkolaborasi, jangan ragu untuk menghubungi saya. Saya akan berusaha membalas email Anda secepatnya!
            </p>
            <a href="mailto:tiohaidarhanif@gmail.com" className="inline-block bg-transparent text-accent-blue border border-accent-blue rounded px-10 py-4 font-medium hover:bg-accent-blue/10 transition-colors duration-300 text-lg">
                Kirim Email
            </a>
        </section>
    );
};

export default Contact;
