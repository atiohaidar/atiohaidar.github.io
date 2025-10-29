/**
 * @file Komponen untuk bagian "Penelitian" dengan enhanced animations.
 * Menampilkan daftar riset atau publikasi dalam format kartu dengan smooth transitions.
 */
import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import { AnimatedCard } from './MotionWrappers';
import type { ResearchItem } from '../types';
import { BookOpenIcon, ExternalLinkIcon } from './Icons';

/**
 * Props untuk komponen ResearchCard, yang menampilkan satu item penelitian.
 */
interface ResearchCardProps {
  item: ResearchItem;
  index: number;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ item, index }) => {
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
        <AnimatedCard 
            className="bg-light-navy rounded-md shadow-lg p-6 flex flex-col h-full group print-avoid-break"
            delay={index * 0.15}
        >
            <main className="flex-grow">
                <motion.p 
                    className="text-xs font-semibold uppercase tracking-wider text-accent-blue mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    {item.type}
                </motion.p>
                <h3 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-accent-blue transition-colors">
                    {item.title}
                </h3>
                <p className="text-sm text-soft-gray mb-2 leading-relaxed">{item.description}</p>
                <p className="text-sm text-soft-gray leading-relaxed">
                    <span className="font-semibold text-light-slate">Kontribusi:</span> {item.contribution}
                </p>
            </main>
            <footer className="mt-4 pt-4 border-t border-soft-gray/20">
                {item.links.map((link, linkIndex) => (
                    <motion.a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-300 group/link overflow-hidden mb-1"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                            duration: 0.4, 
                            delay: linkIndex * 0.1,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        whileHover={{ x: 5 }}
                    >
                        {getIconForLink(link.type)}
                        <span className="group-hover/link:underline print:underline">
                            {link.url.replace(/^https?:\/\//, '')}
                        </span>
                    </motion.a>
                ))}
            </footer>
        </AnimatedCard>
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
    <Section id="research" number="02" title="Riset/Tulisan" delay={1200} printPageBreak={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-6">
            {research.map((item, index) => (
                <ResearchCard key={index} item={item} index={index} />
            ))}
        </div>
    </Section>
  );
};

export default Research;
