/**
 * @file Komponen untuk bagian "Tentang Saya"
 * Menampilkan deskripsi naratif, nilai-nilai inti (core values), dan minat.
 */
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { About as AboutType } from '../types';
import { COLORS, DECORATION } from '../utils/styles';
import { Typography, Heading, Text } from './ui';

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
            <Typography variant="h3" as="h2" className={`${COLORS.TEXT_PRIMARY} mb-8 flex items-center print:mb-4 print:text-xl`}>
                <span className={`${DECORATION.CIRCLE} ${COLORS.TEXT_ACCENT} mr-4 print:mr-2 text-sm`}>01.</span>
                Tentang Saya
                <span className="h-1 w-20 sm:w-40 bg-slate-800 dark:bg-slate-400/30 ml-4 print:bg-gray-400 print:ml-2 print:w-16 rounded-full opacity-50"></span>
            </Typography>
            <div className="glass-panel p-8 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 print:gap-6">
                    <div className="md:col-span-3 space-y-4 print:space-y-2">
                        {description.map((paragraph, index) => (
                            <Text key={index} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">{paragraph}</Text>
                        ))}
                    </div>
                    <div className="md:col-span-2 space-y-8 print:space-y-4">
                        <div>
                            <Heading level={4} className="text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2">🧩 Core Values</Heading>
                            <ul className="space-y-2 list-disc list-inside">
                                {coreValues.map(value => (
                                    <li key={value.title} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">
                                        <Text as="span" className="font-semibold text-light-text dark:text-white print:text-black">{value.title}:</Text> <Text as="span">{value.description}</Text>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <Heading level={4} className="text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2">🎯 Minat & Hobi</Heading>
                            <ul className="space-y-2 list-disc list-inside">
                                {interests.map(interest => (
                                    <li key={interest.title} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">
                                        <Text as="span" className="font-semibold text-light-text dark:text-white print:text-black">{interest.title}:</Text> <Text as="span">{interest.description}</Text>
                                    </li>
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
