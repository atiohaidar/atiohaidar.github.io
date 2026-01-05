/**
 * @file Komponen untuk bagian "Penelitian".
 * Menampilkan daftar riset atau publikasi dalam format kartu.
 */
import React from 'react';
import Section from './Section';
import type { ResearchItem } from '../types';
import { BookOpenIcon, ExternalLinkIcon } from './Icons';
import SpotlightCard from './SpotlightCard';
import TiltCard from './TiltCard';
import { COLORS } from '../utils/styles';
import { Typography, Heading, Text } from './ui';

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
            <SpotlightCard className="glass-panel h-full p-0 overflow-hidden group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
                <div className="p-6 flex flex-col h-full relative z-10">
                    <main className="flex-grow">
                        <Typography variant="caption" className={`font-bold uppercase tracking-wider ${COLORS.TEXT_ACCENT} mb-2`}>
                            {item.type}
                        </Typography>
                        <Heading level={4} className={`${COLORS.TEXT_PRIMARY} mb-4 group-hover:text-blue-500 transition-colors`}>{item.title}</Heading>
                        <Text className={`${COLORS.TEXT_SECONDARY} mb-4`}>{item.description}</Text>
                        <Text className={COLORS.TEXT_SECONDARY}>
                            <Text as="span" className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>Kontribusi:</Text> {item.contribution}
                        </Text>
                    </main>
                    <footer className={`mt-4 pt-4 border-t-2 border-dashed ${COLORS.BORDER} opacity-80`}>
                        {item.links.map(link => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center ${COLORS.TEXT_SECONDARY} hover:text-blue-500 transition-colors duration-300 group/link overflow-hidden mb-1`}
                            >
                                {getIconForLink(link.type)}
                                <Typography variant="caption" className="group-hover/link:underline print:underline">{link.url.replace(/^https?:\/\//, '')}</Typography>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6 p-2">
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
