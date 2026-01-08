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
import { Typography, Heading, Text, Card, Divider } from './ui';

/**
 * Props untuk komponen ResearchCard, yang menampilkan satu item penelitian.
 */
interface ResearchCardProps {
    item: ResearchItem;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ item }) => {
    const getIconForLink = (type: ResearchItem['links'][0]['type']) => {
        const iconProps = { className: "w-4 h-4 flex-shrink-0" };
        switch (type) {
            case 'researchgate':
                return <BookOpenIcon {...iconProps} />;
            default:
                return <ExternalLinkIcon {...iconProps} />;
        }
    };

    // Determine category badge style based on type
    const categoryBadgeClass = item.type.toLowerCase().includes('sharing')
        ? 'category-badge-sharing'
        : 'category-badge';

    return (
        <div className="h-full group animate-card-entrance">
            <Card
                variant="glass"
                padding="none"
                className="h-full research-card-enhanced print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break"
            >
                {/* Gradient Overlay on Hover */}
                <div className="card-gradient-overlay" />

                <div className="p-6 flex flex-col h-full relative z-10">
                    <main className="flex-grow space-y-4">
                        {/* Category Badge with Animation */}
                        <div className="flex items-center justify-between">
                            <span className={`${categoryBadgeClass} animate-badge-pulse`}>
                                {item.type}
                            </span>
                        </div>

                        {/* Title with Gradient on Hover */}
                        <Heading
                            level={4}
                            className={`${COLORS.TEXT_PRIMARY} group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight`}
                        >
                            {item.title}
                        </Heading>

                        {/* Description */}
                        <Text className={`${COLORS.TEXT_SECONDARY} leading-relaxed font-sans`}>
                            {item.description}
                        </Text>

                        {/* Contribution with Enhanced Styling */}
                        <div className="relative p-4 bg-marker-yellow/10 dark:bg-marker-yellow/5 rounded-lg border-2 border-slate-800 dark:border-slate-600" style={{
                            borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px'
                        }}>
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-marker-yellow rounded-full flex items-center justify-center text-lg transform rotate-12 shadow-md">
                                💡
                            </div>
                            <Text className={COLORS.TEXT_SECONDARY}>
                                <Text as="span" className={`font-bold ${COLORS.TEXT_PRIMARY} text-sm uppercase tracking-wide highlighter inline-block mb-2`}>
                                    Kontribusi
                                </Text>
                                <br />
                                <Text as="span" className="text-sm mt-2 block leading-relaxed">
                                    {item.contribution}
                                </Text>
                            </Text>
                        </div>
                    </main>

                    {/* Links Section with Button Style */}
                    <footer className="pt-4 mt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col gap-2">
                            {item.links.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-button text-sm group/link print:bg-blue-600"
                                >
                                    {getIconForLink(link.type)}
                                    <span className="ml-2 flex-1 truncate">
                                        {link.url.replace(/^https?:\/\//, '')}
                                    </span>
                                    <ExternalLinkIcon className="w-4 h-4 ml-2 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </footer>
                </div>
            </Card>
        </div>
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
                    <div
                        key={index}
                        className="h-full"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <ResearchCard item={item} />
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Research;
