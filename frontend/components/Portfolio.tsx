/**
 * @file Komponen untuk bagian "Portofolio".
 * Menampilkan grid proyek-proyek yang telah dikerjakan.
 */
import React from 'react';
import Section from './Section';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';

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

        <div className="glass-card p-6 flex flex-col h-full hover:-translate-y-2 group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
            <header className="flex justify-between items-center mb-4 print:hidden">
                <FolderIcon className="w-10 h-10 text-accent-blue" />
            </header>
            <main className="flex-grow">
                <h3 className="text-xl font-poppins font-bold text-light-text dark:text-white mb-2 group-hover:text-accent-blue transition-colors print:text-black">{project.name}</h3>
                <p className="text-sm text-light-muted dark:text-gray-300 mb-2 leading-relaxed">{project.description}</p>
                <p className="text-sm text-light-muted dark:text-gray-300 leading-relaxed"><span className="font-semibold text-light-text dark:text-white">Kontribusi:</span> {project.contribution}</p>
            </main>
            <footer className="mt-4">
                <div className="mb-4 space-y-2">
                    {project.links.map(link => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-light-muted dark:text-gray-300 hover:text-accent-blue transition-colors duration-300 group/link overflow-hidden mb-1"
                        >
                            {getIconForLink(link.type)}
                            <span className="group-hover/link:underline print:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                    ))}
                </div>
                {project.tech && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-light-muted dark:text-gray-400 pt-4 border-t border-gray-300 dark:border-white/10">
                        {project.tech.map(t => <li key={t}>{t}</li>)}
                    </ul>
                )}
            </footer>
        </div>
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
        <Section id="portfolio" number="03" title="Portofolio" centerTitle delay={1600} printPageBreak={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>
        </Section>
    );
};

export default Portfolio;