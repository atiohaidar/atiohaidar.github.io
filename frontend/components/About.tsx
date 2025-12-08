/**
 * @file Komponen untuk bagian "Tentang Sa                    </div>
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black print:text-base print:mb-2">🎯 Minat & Hobi</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black print:space-y-1 print:text-sm">
                             {interests.map(interest => (
                                <li key={interest.title}><span className="font-semibold text-light-slate print:text-black">{interest.title}:</span> {interest.description}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>mpilkan deskripsi naratif, nilai-nilai inti (core values), dan minat.
 */
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { About as AboutType } from '../types';

/**
 * Props untuk komponen About.
 * Menerima semua data yang diperlukan untuk ditampilkan.
 */
interface AboutProps {
    data: AboutType;
}

const About: React.FC<AboutProps> = ({ data }) => {
    const { description, coreValues, interests } = data;
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 }, 800); // Delay 800ms
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section
            id="about"
            ref={ref}
            className={`py-12 container mx-auto px-6 md:px-16 lg:px-20 print:py-4 print:px-4 print-avoid-break ${animationClass}`}
        >
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-light-text dark:text-white mb-8 flex items-center print:mb-4 print:text-xl">
                <span className="text-light-accent dark:text-accent-blue mr-3 print:mr-2">01.</span>
                Tentang Saya
                <span className="h-px w-20 sm:w-40 bg-gray-300 dark:bg-soft-gray/30 ml-4 print:bg-gray-400 print:ml-2 print:w-16"></span>
            </h2>
            <div className="glass-panel p-8 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 print:gap-6">
                    <div className="md:col-span-3 text-light-muted dark:text-gray-300 space-y-4 leading-relaxed print:text-black print:space-y-2 print:text-sm text-lg">
                        {description.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                    <div className="md:col-span-2 space-y-8 print:space-y-4">
                        <div>
                            <h3 className="text-lg font-poppins font-semibold text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2">🧩 Core Values</h3>
                            <ul className="space-y-2 list-disc list-inside text-light-muted dark:text-gray-300 print:text-black print:space-y-1 print:text-sm">
                                {coreValues.map(value => (
                                    <li key={value.title}><span className="font-semibold text-light-text dark:text-white print:text-black">{value.title}:</span> {value.description}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-poppins font-semibold text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2">🎯 Minat & Hobi</h3>
                            <ul className="space-y-2 list-disc list-inside text-light-muted dark:text-gray-300 print:text-black print:space-y-1 print:text-sm">
                                {interests.map(interest => (
                                    <li key={interest.title}><span className="font-semibold text-light-text dark:text-white print:text-black">{interest.title}:</span> {interest.description}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
