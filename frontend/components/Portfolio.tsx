/**
 * @file Komponen untuk bagian "Portofolio" dengan enhanced card animations.
 * Menampilkan grid proyek-proyek yang telah dikerjakan dengan interactive hover effects.
 */
import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import { AnimatedCard } from './MotionWrappers';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';

/**
 * Komponen kartu untuk menampilkan satu proyek.
 * @param {{ project: Project }} props Props yang berisi detail proyek.
 */
const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
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
        <AnimatedCard 
            className="bg-light-navy rounded-md shadow-lg p-6 flex flex-col h-full group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break"
            delay={index * 0.1}
        >
            <header className="flex justify-between items-center mb-4 print:hidden">
                <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                >
                    <FolderIcon className="w-10 h-10 text-accent-blue" />
                </motion.div>
            </header>
            <main className="flex-grow">
                <h3 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-accent-blue transition-colors print:text-black">
                    {project.name}
                </h3>
                <p className="text-sm text-soft-gray mb-2 leading-relaxed">{project.description}</p>
                <p className="text-sm text-soft-gray leading-relaxed">
                    <span className="font-semibold text-light-slate">Kontribusi:</span> {project.contribution}
                </p>
            </main>
            <footer className="mt-4">
                <div className="mb-4 space-y-2">
                    {project.links.map((link, linkIndex) => (
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
                </div>
                {project.tech && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-soft-gray pt-4 border-t border-soft-gray/20">
                        {project.tech.map((t, techIndex) => (
                            <motion.li 
                                key={t}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ 
                                    duration: 0.3, 
                                    delay: techIndex * 0.05,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                {t}
                            </motion.li>
                        ))}
                    </ul>
                )}
            </footer>
        </AnimatedCard>
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
                    <ProjectCard key={index} project={project} index={index} />
                ))}
            </div>
        </Section>
    );
};

export default Portfolio;