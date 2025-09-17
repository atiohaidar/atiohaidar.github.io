
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const SectionTitle: React.FC<{ number: string; title: string }> = ({ number, title }) => (
    <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center">
        <span className="text-accent-blue mr-3">{number}.</span>
        {title}
        <span className="h-px w-20 sm:w-40 bg-soft-gray/30 ml-4"></span>
    </h2>
);

const About: React.FC = () => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="about" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 ${animationClass}`}>
            <SectionTitle number="01" title="Tentang Saya" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-3 text-soft-gray space-y-4 leading-relaxed">
                    <p>
                        Saya senang berinovasi, fokus pada pekerjaan teknis, dan termotivasi untuk terus meningkatkan keahlian dalam pengembangan perangkat lunak serta kolaborasi tim. Saya mengembangkan metode pembelajaran yang efektif dengan bantuan AI untuk mempercepat adaptasi terhadap teknologi baru.
                    </p>
                    <p>
                        Dengan latar belakang di Rekayasa Perangkat Lunak, saya memiliki pemahaman yang kuat tentang siklus hidup pengembangan perangkat lunak, mulai dari analisis kebutuhan hingga penerapan dan pemeliharaan. Saya selalu tertarik untuk menjelajahi teknologi baru dan menerapkannya untuk menciptakan solusi yang efisien dan andal.
                    </p>
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3">🧩 Core Values</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray">
                            <li><span className="font-semibold text-light-slate">Innovation:</span> Selalu mencari solusi baru.</li>
                            <li><span className="font-semibold text-light-slate">Reliability:</span> Konsistensi dalam kualitas hasil.</li>
                            <li><span className="font-semibold text-light-slate">Problem-Solving:</span> Fokus menyelesaikan masalah.</li>
                            <li><span className="font-semibold text-light-slate">Continuous Learning:</span> Selalu berkembang.</li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3">🎯 Interests</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray">
                             <li><span className="font-semibold text-light-slate">Integrasi AI:</span> Untuk segala pekerjaan.</li>
                            <li><span className="font-semibold text-light-slate">Workflow Simplification:</span> Melalui otomasi.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
