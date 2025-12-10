/**
 * @file Komponen untuk bagian "Penelitian".
 * Menampilkan daftar riset atau publikasi dalam format kartu.
 */
import React from 'react';
import Section from './Section';
import type { ResearchItem } from '../types';
import { BookOpenIcon, ExternalLinkIcon } from './Icons';
import ScrollReveal from './ScrollReveal';
import SpotlightCard from './SpotlightCard';
import TiltCard from './TiltCard';

/**
 * Props untuk komponen ResearchCard, yang menampilkan satu item penelitian.
 */
interface ResearchCardProps {
    item: ResearchItem;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ item }) => {
    const getIconForLink = (type: ResearchItem['links'][0]['type']) => {
        const iconProps = { className: "w-5 h-5 mr-2 flex-shrink-0" };
        switch (type) {
            case 'researchgate':
                // Menggunakan ikon buku untuk ResearchGate atau publikasi umum
                return <BookOpenIcon {...iconProps} />;
            default:
                return <ExternalLinkIcon {...iconProps} />;
        }
    };

    return (
        <TiltCard maxTilt={8} scale={1.02} glare={true} glareMaxOpacity={0.15} className="h-full">
            <SpotlightCard className="bg-white dark:bg-light-navy/50 rounded-2xl shadow-lg border border-gray-200 dark:border-white/5 h-full transition-transform duration-300 group print-avoid-break overflow-hidden">
                <div className="p-6 flex flex-col h-full relative z-10">
                    <main className="flex-grow">
                        <p className="text-xs font-semibold uppercase tracking-wider text-light-accent dark:text-accent-blue mb-2">
                            {item.type}
                        </p>
                        <h3 className="text-xl font-poppins font-bold text-light-text dark:text-white mb-2 group-hover:text-light-accent dark:group-hover:text-accent-blue transition-colors">{item.title}</h3>
                        <p className="text-sm text-light-muted dark:text-soft-gray mb-2 leading-relaxed">{item.description}</p>
                        <p className="text-sm text-light-muted dark:text-soft-gray leading-relaxed"><span className="font-semibold text-light-text dark:text-light-slate">Kontribusi:</span> {item.contribution}</p>
                    </main>
                    <footer className="mt-4 pt-4 border-t border-gray-300 dark:border-soft-gray/20">
                        {item.links.map(link => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-light-muted dark:text-soft-gray hover:text-light-accent dark:hover:text-accent-blue transition-colors duration-300 group/link overflow-hidden mb-1"
                            >
                                {getIconForLink(link.type)}
                                <span className="group-hover/link:underline print:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                            </a>
                        ))}
                    </footer>
                </div>
            </SpotlightCard>
        </TiltCard>
    );
};

/**
 * Props untuk komponen Research.
 */
interface ResearchProps {
    /** Daftar item penelitian yang akan ditampilkan. */
    research: ResearchItem[];
}

const Research: React.FC<ResearchProps> = ({ research }) => {
    return (
        <Section id="research" number="02" title="Riset/Tulisan" delay={200} printPageBreak={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-6 p-2">
                {research.map((item, index) => (
                    <div key={index} className="h-full">
                        <ResearchCard item={item} />
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Research;
