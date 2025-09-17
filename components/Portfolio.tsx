import React from 'react';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
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
        <div className="bg-light-navy rounded-md shadow-lg p-6 flex flex-col h-full transition-transform duration-300 hover:-translate-y-2 group print:shadow-none print:border print:border-gray-300 print:rounded-none print:bg-transparent print-avoid-break">
            <header className="flex justify-between items-center mb-4 print:hidden">
                <FolderIcon className="w-10 h-10 text-accent-blue" />
            </header>
            <main className="flex-grow">
                <h3 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-accent-blue transition-colors print:text-black">{project.name}</h3>
                <p className="text-sm text-soft-gray mb-2 leading-relaxed print:text-gray-800">{project.description}</p>
                <p className="text-sm text-soft-gray leading-relaxed print:text-gray-800"><span className="font-semibold text-light-slate print:text-black">Kontribusi:</span> {project.contribution}</p>
            </main>
            <footer className="mt-4">
                <div className="mb-4 space-y-2">
                    {project.links.map(link => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-soft-gray hover:text-accent-blue transition-colors duration-300 group/link print:text-blue-600 print:hover:text-blue-800"
                        >
                            {getIconForLink(link.type)}
                            <span className="truncate group-hover/link:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                    ))}
                </div>
                {project.tech && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-soft-gray pt-4 border-t border-soft-gray/20 print:text-gray-600 print:border-gray-300">
                        {project.tech.map(t => <li key={t}>{t}</li>)}
                    </ul>
                )}
            </footer>
        </div>
    );
};


const Portfolio: React.FC<{ projects: Project[] }> = ({ projects }) => {
     const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
     const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="portfolio" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 print-break-before print:py-12 ${animationClass}`}>
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center justify-center print:text-black print:text-2xl">
                <span className="text-accent-blue mr-3 print:text-gray-600">02.</span>
                Portofolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1">
                {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>
        </section>
    );
};

export default Portfolio;