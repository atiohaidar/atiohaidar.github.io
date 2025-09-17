/**
 * @file Komponen untuk bagian "Pengalaman".
 * Menampilkan linimasa (timeline) untuk pengalaman kerja dan pendidikan.
 */
import React from 'react';
import Section from './Section';
import type { Experience, Education } from '../types';

/**
 * Komponen untuk menampilkan satu item dalam linimasa.
 * Dapat digunakan untuk pengalaman kerja maupun pendidikan.
 * @param {{ item: Experience | Education }} props Props yang berisi detail item.
 */
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

/**
 * Props untuk komponen Experience.
 */
interface ExperienceProps {
  experiences: Experience[];
  education: Education[];
}

const ExperienceComponent: React.FC<ExperienceProps> = ({ experiences, education }) => {
    return (
        <Section id="experience" number="04" title="Pengalaman" className="max-w-3xl">
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
        </Section>
    );
};

export default ExperienceComponent;
