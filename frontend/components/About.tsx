/**
 * @file Komponen untuk bagian "Tentang Saya"
 * Menampilkan deskripsi naratif, nilai-nilai inti (core values), dan minat.
 */
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { About as AboutType } from '../types';
import { COLORS, DECORATION } from '../utils/styles';
import { Typography, Heading, Text, DoodleWashiTape, DoodlePaperclip, DoodleSparkle, StickyNote, DoodleMascot, DoodleSignature } from './ui';

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
            <Typography variant="h3" as="h2" className={`${COLORS.TEXT_PRIMARY} mb-8 flex items-center print:mb-4 print:text-xl relative inline-block`}>
                <span className={`${DECORATION.CIRCLE} ${COLORS.TEXT_ACCENT} mr-4 print:mr-2 text-sm`}>01.</span>
                Tentang Saya
                <span className="h-1 w-20 sm:w-40 bg-slate-800 dark:bg-slate-400/30 ml-4 print:bg-gray-400 print:ml-2 print:w-16 rounded-full opacity-50"></span>
                {/* Washi Tape on Title */}
                <DoodleWashiTape className="absolute -top-6 -right-10 rotate-12 scale-75 opacity-50 hidden md:block" color="#bfdbfe" />
            </Typography>

            <div className="relative">
                {/* Paperclip on the edge */}
                <DoodlePaperclip className="absolute -left-3 top-10 w-8 h-18 text-slate-400/60 z-30 hidden md:block" />

                <div className="glass-panel p-8 rounded-3xl relative">
                    {/* Dog ear effect for the whole panel */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-marker-yellow/20 dark:bg-yellow-900/10 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 print:gap-6 relative z-10">
                        <div className="md:col-span-3 space-y-4 print:space-y-2">
                            {description.map((paragraph, index) => (
                                <Text key={index} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">
                                    {index === 0 ? (
                                        <>
                                            <span className="highlighter" style={{ '--tw-content': '"bg-marker-yellow"' } as any}>Halo!</span> {paragraph.substring(paragraph.indexOf(' ') + 1)}
                                        </>
                                    ) : paragraph}
                                </Text>
                            ))}

                            {/* Decorative Sparkles & Mascot to fill space */}
                            <div className="pt-10 flex items-end justify-between relative">
                                <div className="flex items-center gap-4">
                                    <DoodleMascot className="w-16 h-16 text-accent-blue/40" />
                                    <div className="hidden sm:block">
                                        <Text className="text-xs italic text-light-muted dark:text-gray-500 font-patrick">
                                            Status: Seperti ini saja....
                                        </Text>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <DoodleSignature className="w-32 h-12 text-slate-800 dark:text-slate-400" />
                                </div>

                                <div className="absolute -bottom-4 -left-4 opacity-30">
                                    <DoodleSparkle className="w-12 h-12 text-marker-pink" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-8 print:space-y-4 relative">
                            {/* Sticky Note overlapping here */}
                            <div className="absolute -top-16 -right-12 hidden lg:block z-20">
                                <StickyNote color="yellow" rotate={-3}>
                                    <p className="mb-2">💡 "Es Terooos...."</p>
                                    <div className="text-right text-sm italic">- Seseorang</div>
                                </StickyNote>
                            </div>

                            <div>
                                <Heading level={4} className="text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-marker-blue rounded-full mr-2"></span>
                                    Core Values
                                </Heading>
                                <ul className="space-y-2 list-disc list-inside">
                                    {coreValues.map(value => (
                                        <li key={value.title} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">
                                            <Text as="span" className="font-semibold text-light-text dark:text-white print:text-black underline decoration-marker-pink/50 decoration-2">{value.title}:</Text> <Text as="span">{value.description}</Text>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <Heading level={4} className="text-light-text dark:text-white mb-3 print:text-black print:text-base print:mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-marker-green rounded-full mr-2"></span>
                                    Minat & Hobi
                                </Heading>
                                <ul className="space-y-2 list-disc list-inside">
                                    {interests.map(interest => (
                                        <li key={interest.title} className="text-light-muted dark:text-gray-300 print:text-black print:text-sm">
                                            <Text as="span" className="font-semibold text-light-text dark:text-white print:text-black highlighter" style={{ '--tw-content': '"bg-marker-blue"' } as any}>{interest.title}:</Text> <Text as="span">{interest.description}</Text>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
