/**
 * @file Komponen untuk bagian "Penelitian".
 * Menampilkan daftar riset atau publikasi dalam format kartu.
 */
import React from 'react';
import Section from './Section';
import type { ResearchItem } from '../types';
import { BookOpenIcon, ExternalLinkIcon } from './Icons';

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
        <div className="bg-light-navy rounded-md shadow-lg p-6 flex flex-col h-full transition-transform duration-300 hover:-translate-y-2 group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
            <main className="flex-grow">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-blue mb-2 print:text-gray-600">
                    {item.type}
                </p>
                <h3 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-accent-blue transition-colors print:text-black">{item.title}</h3>
                <p className="text-sm text-soft-gray mb-2 leading-relaxed print:text-gray-800">{item.description}</p>
                <p className="text-sm text-soft-gray leading-relaxed print:text-gray-800"><span className="font-semibold text-light-slate print:text-black">Kontribusi:</span> {item.contribution}</p>
            </main>
            <footer className="mt-4 pt-4 border-t border-soft-gray/20 print:border-gray-300">
                {item.links.map(link => (
                     <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-300 group/link print:text-blue-600 print:hover:text-blue-800 overflow-hidden"
                    >
                        {getIconForLink(link.type)}
                        <span className="truncate group-hover/link:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                    </a>
                ))}
            </footer>
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
    <Section id="research" number="02" title="Penelitian">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {research.map((item, index) => (
                <ResearchCard key={index} item={item} />
            ))}
        </div>
    </Section>
  );
};

export default Research;