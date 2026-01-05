/**
 * @file Komponen untuk bagian "Portofolio".
 * Menampilkan grid proyek-proyek yang telah dikerjakan.
 */
import React from 'react';
import Section from './Section';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';
import SpotlightCard from './SpotlightCard';
import TiltCard from './TiltCard';
import { COLORS, TYPOGRAPHY } from '../utils/styles';

/**
 * Komponen kartu untuk menampilkan satu proyek.
 * @param {{ project: Project }} props Props yang berisi detail proyek.
 */
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    /**
     * Mengembalikan komponen ikon berdasarkan tipe tautan.
     * @param {Project['links'][0]['type']} type Tipe tautan ('github', 'live', 'postman').
     */
    const getIconForLink = (type: Project['links'][0]['type']) => {
        const iconProps = { className: "w-5 h-5 mr-2 flex-shrink-0" };
        switch (type) {
            case 'github':
                return <GitHubIcon {...iconProps} />;
            case 'live':
                return <ExternalLinkIcon {...iconProps} />;
            case 'postman':
                return <PostmanIcon {...iconProps} />;
            default:
                return null;
        }
    };

    return (
        <TiltCard maxTilt={8} scale={1.02} glare={true} glareMaxOpacity={0.15} className="h-full">
            <SpotlightCard className="glass-panel h-full p-0 overflow-hidden group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
                <div className="p-6 flex flex-col h-full relative z-10">
                    <header className="flex justify-between items-center mb-4 print:hidden">
                        <FolderIcon className={`w-10 h-10 ${COLORS.TEXT_ACCENT}`} />
                    </header>
                    <main className="flex-grow">
                        <h3 className={`${TYPOGRAPHY.HEADING_CARD} ${COLORS.TEXT_PRIMARY} mb-2 group-hover:text-blue-500 transition-colors print:text-black`}>{project.name}</h3>
                        <p className={`text-sm ${COLORS.TEXT_SECONDARY} mb-2 leading-relaxed font-caveat text-lg`}>{project.description}</p>
                        <p className={`text-sm ${COLORS.TEXT_SECONDARY} leading-relaxed font-caveat text-lg`}><span className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>Kontribusi:</span> {project.contribution}</p>
                    </main>
                    <footer className="mt-4">
                        <div className="mb-4 space-y-2">
                            {project.links.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center text-sm ${COLORS.TEXT_SECONDARY} hover:text-blue-500 transition-colors duration-300 group/link overflow-hidden mb-1 font-patrick`}
                                >
                                    {getIconForLink(link.type)}
                                    <span className="group-hover/link:underline print:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                                </a>
                            ))}
                        </div>
                        {project.tech && (
                            <ul className={`flex flex-wrap gap-x-4 gap-y-2 text-xs ${COLORS.TEXT_MUTED} pt-4 border-t-2 border-dashed ${COLORS.BORDER} font-mono`}>
                                {project.tech.map(t => <li key={t}>{t}</li>)}
                            </ul>
                        )}
                    </footer>
                </div>
            </SpotlightCard>
        </TiltCard>
    );
};

/**
 * Props untuk komponen Portfolio.
 */
interface PortfolioProps {
    /** Daftar proyek yang akan ditampilkan. */
    projects: Project[];
}

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
    return (
        <Section id="portfolio" number="03" title="Portofolio" centerTitle delay={200} printPageBreak={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4 p-2">
                {projects.map((project, index) => (
                    <div key={index} className="h-full">
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Portfolio;