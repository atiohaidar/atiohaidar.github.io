
import React from 'react';
import type { Project } from '../types';
import { GitHubIcon, ExternalLinkIcon, PostmanIcon, FolderIcon } from './Icons';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className="bg-light-navy rounded-md shadow-lg p-6 flex flex-col h-full transition-transform duration-300 hover:-translate-y-2 group">
            <header className="flex justify-between items-center mb-4">
                <FolderIcon className="w-10 h-10 text-accent-blue" />
                <div className="flex items-center space-x-4">
                    {project.links.map(link => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue transition-colors">
                            {link.type === 'github' && <GitHubIcon className="w-6 h-6" />}
                            {link.type === 'live' && <ExternalLinkIcon className="w-6 h-6" />}
                            {link.type === 'postman' && <PostmanIcon className="w-6 h-6" />}
                        </a>
                    ))}
                </div>
            </header>
            <main className="flex-grow">
                <h3 className="text-xl font-poppins font-bold text-white mb-2 group-hover:text-accent-blue transition-colors">{project.name}</h3>
                <p className="text-sm text-soft-gray mb-2 leading-relaxed">{project.description}</p>
                 <p className="text-sm text-soft-gray leading-relaxed"><span className="font-semibold text-light-slate">Problem:</span> {project.problem}</p>
            </main>
            {project.tech && (
                <footer className="mt-4">
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-soft-gray">
                        {project.tech.map(t => <li key={t}>{t}</li>)}
                    </ul>
                </footer>
            )}
        </div>
    );
};


const Portfolio: React.FC<{ projects: Project[] }> = ({ projects }) => {
     const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
     const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="portfolio" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 ${animationClass}`}>
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center justify-center">
                <span className="text-accent-blue mr-3">02.</span>
                Portofolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>
        </section>
    );
};

export default Portfolio;
