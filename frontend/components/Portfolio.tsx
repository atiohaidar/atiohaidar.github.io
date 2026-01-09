/**
 * @file Komponen untuk bagian "Portofolio".
 * Menampilkan grid proyek-proyek yang telah dikerjakan.
 */
import React from 'react';
import Section from './Section';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';
import { COLORS } from '../utils/styles';
import { Typography, Heading, Text, DoodleWashiTape, Card, Divider } from './ui';

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
        <Card variant="glass" dogEar padding="none" className="h-full flex flex-col overflow-hidden group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
            {/* Screenshot Image */}
            {project.screenshot && (
                <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                        src={project.screenshot}
                        alt={`Screenshot of ${project.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Sketchy border overlay */}
                    <div className="absolute inset-0 border-b-2 border-dashed border-gray-300 dark:border-gray-600 pointer-events-none" />
                </div>
            )}

            <div className="p-6 flex flex-col flex-1 relative z-10">
                <header className="flex justify-between items-center mb-4 print:hidden">
                    <FolderIcon className={`w-10 h-10 ${COLORS.TEXT_ACCENT}`} />
                </header>
                <main className="flex-grow">
                    <Heading level={4} className={`${COLORS.TEXT_PRIMARY} mb-3 group-hover:text-blue-600 transition-colors print:text-black`}>{project.name}</Heading>
                    <Text className={`${COLORS.TEXT_SECONDARY} mb-4 font-sans leading-relaxed`}>{project.description}</Text>
                    <Text className={`${COLORS.TEXT_SECONDARY} font-sans`}>
                        <Text as="span" className={`font-semibold ${COLORS.TEXT_PRIMARY}`}>Kontribusi:</Text> {project.contribution}
                    </Text>
                </main>
                <footer className="mt-4">
                    <div className="mb-4 space-y-2">
                        {project.links.map(link => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center ${COLORS.TEXT_SECONDARY} hover:text-blue-600 transition-colors duration-300 group/link overflow-hidden mb-1`}
                            >
                                {getIconForLink(link.type)}
                                <Typography variant="caption" className="group-hover/link:underline print:underline">{link.url.replace(/^https?:\/\//, '')}</Typography>
                            </a>
                        ))}
                    </div>
                    {project.tech && (
                        <>
                            <Divider variant="dashed" className="mt-4" />
                            <ul className={`flex flex-wrap gap-2 pt-4`}>
                                {project.tech.map(t => (
                                    <li key={t} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 shadow-sm">
                                        <Typography variant="caption" className={`${COLORS.TEXT_MUTED} font-sans text-xs`}>{t}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </footer>
            </div>
        </Card>
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
            <div className="relative mb-12 flex justify-center">
                <DoodleWashiTape className="absolute -top-4 -left-10 -rotate-6 opacity-40" color="#fbcfe8" />
                <DoodleWashiTape className="absolute -top-4 -right-10 rotate-6 opacity-40" color="#bbf7d0" />
            </div>
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