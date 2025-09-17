import React from 'react';
import type { Experience, Education } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';


const TimelineItem: React.FC<{ item: Experience | Education }> = ({ item }) => (
    <div className="relative pl-8 sm:pl-12 py-4 group print-avoid-break">
        <div className="absolute left-0 h-full w-px bg-soft-gray/30 print:bg-gray-400"></div>
        <div className="absolute left-[-5px] top-6 w-3 h-3 rounded-full bg-soft-gray group-hover:bg-accent-blue transition-colors print:bg-black"></div>
        <p className="text-sm text-accent-blue mb-1 print:text-gray-600">{item.date}</p>
        <h3 className="text-lg font-poppins font-bold text-white print:text-black">
            {'title' in item ? item.title : item.degree}
        </h3>
        <p className="text-md text-light-slate mb-2 print:text-gray-800">
            {'company' in item ? item.company : item.institution}
        </p>
        {'description' in item && <p className="text-sm text-soft-gray print:text-gray-700">{item.description}</p>}
    </div>
);


const ExperienceComponent: React.FC<{ experiences: Experience[], education: Education[] }> = ({ experiences, education }) => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const animationClass = isIntersecting ? 'animate-fade-in-up' : 'opacity-0';

    return (
        <section id="experience" ref={ref} className={`py-24 container mx-auto px-6 md:px-10 max-w-3xl print-break-before print:py-12 ${animationClass}`}>
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-12 flex items-center print:text-black print:text-2xl">
                <span className="text-accent-blue mr-3 print:text-gray-600">03.</span>
                Pengalaman
                <span className="h-px w-20 sm:w-40 bg-soft-gray/30 ml-4 print:bg-gray-400"></span>
            </h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-poppins text-light-slate mb-6 print:text-black">Pengalaman Kerja</h3>
                    <div className="relative">
                        {experiences.map((exp, index) => (
                            <TimelineItem key={index} item={exp} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-poppins text-light-slate mt-12 mb-6 print:text-black">Pendidikan</h3>
                    <div className="relative">
                        {education.map((edu, index) => (
                            <TimelineItem key={index} item={edu} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExperienceComponent;