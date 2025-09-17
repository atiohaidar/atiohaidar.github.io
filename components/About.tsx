import React from 'react';
import type { About as AboutType } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const SectionTitle: React.FC<{ number: string; title: string }> = ({ number, title }) => (
    <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center print:text-black print:text-2xl">
        <span className="text-accent-blue mr-3 print:text-gray-600">{number}.</span>
        {title}
        <span className="h-px w-20 sm:w-40 bg-soft-gray/30 ml-4 print:bg-gray-400"></span>
    </h2>
);

const About: React.FC<AboutType> = ({ description, coreValues, interests }) => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="about" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 print-break-before print:py-12 ${animationClass}`}>
            <SectionTitle number="01" title="Tentang Saya" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-3 text-soft-gray space-y-4 leading-relaxed print:text-black">
                    {description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black">🧩 Core Values</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black">
                            {coreValues.map(value => (
                                <li key={value.title}><span className="font-semibold text-light-slate print:text-black">{value.title}:</span> {value.description}</li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black">🎯 Interests</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black">
                             {interests.map(interest => (
                                <li key={interest.title}><span className="font-semibold text-light-slate print:text-black">{interest.title}:</span> {interest.description}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;