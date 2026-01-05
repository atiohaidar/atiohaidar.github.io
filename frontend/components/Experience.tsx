import React from 'react';
import Section from './Section';
import type { Experience, Education } from '../types';
import { COLORS } from '../utils/styles';
import { Typography, Heading, Text } from './ui';

/**
 * Komponen untuk menampilkan satu item dalam linimasa.
 */
const TimelineItem: React.FC<{ item: Experience | Education }> = ({ item }) => (
    <div className="relative pl-8 sm:pl-12 py-6 group print-avoid-break">
        <div className={`absolute left-0 h-full w-1 border-l-2 border-dashed ${COLORS.BORDER} opacity-40 print:bg-gray-400`}></div>
        <div className={`absolute left-[-6px] top-8 w-3 h-3 rounded-full border-2 ${COLORS.BORDER} ${COLORS.BG_ACCENT} group-hover:scale-125 transition-transform print:bg-black`}></div>
        <Typography variant="caption" className={`${COLORS.TEXT_ACCENT} mb-2 tracking-wide`}>{item.date}</Typography>
        <Heading level={4} className={`${COLORS.TEXT_PRIMARY}`}>
            {'title' in item ? item.title : item.degree}
        </Heading>
        <Text variant="body" className={`${COLORS.TEXT_SECONDARY} mb-2 opacity-80`}>
            {'company' in item ? item.company : item.institution}
        </Text>
        {'description' in item && <Text className={`${COLORS.TEXT_MUTED} leading-relaxed`}>{item.description}</Text>}
    </div>
);

/**
 * Props untuk komponen Experience.
 */
interface ExperienceProps {
    experiences: Experience[];
    education: Education[];
    workInterest?: string[];
}

const ExperienceComponent: React.FC<ExperienceProps> = ({ experiences = [], education = [], workInterest = [] }) => {
    return (
        <Section id="experience" number="04" title="Pengalaman" className="max-w-3xl" delay={200} printPageBreak={true}>
            <div className="space-y-8">
                <div>
                    <Heading level={3} className="text-light-muted dark:text-light-slate mb-6 print:text-black">Pengalaman Kerja</Heading>
                    <div className="relative">
                        {experiences.map((exp, index) => (
                            <TimelineItem key={index} item={exp} />
                        ))}
                    </div>
                </div>

                <div>
                    <Heading level={3} className="text-light-muted dark:text-light-slate mt-12 mb-6 print:text-black">Pendidikan</Heading>
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
