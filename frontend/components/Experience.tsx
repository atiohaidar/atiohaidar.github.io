/**
 * @file Komponen untuk bagian "Pengalaman" dengan timeline animations.
 * Menampilkan linimasa (timeline) untuk pengalaman kerja dan pendidikan dengan sequential animations.
 */
import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import type { Experience, Education } from '../types';

/**
 * Komponen untuk menampilkan satu item dalam linimasa.
 * Dapat digunakan untuk pengalaman kerja maupun pendidikan.
 * @param {{ item: Experience | Education, index: number }} props Props yang berisi detail item dan index.
 */
const TimelineItem: React.FC<{ item: Experience | Education; index: number }> = ({ item, index }) => (
    <motion.div 
        className="relative pl-8 sm:pl-12 py-4 group print-avoid-break"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ 
            duration: 0.6, 
            delay: index * 0.15,
            ease: [0.22, 1, 0.36, 1]
        }}
    >
        <div className="absolute left-0 h-full w-px bg-soft-gray/30 print:bg-gray-400"></div>
        <motion.div 
            className="absolute left-[-5px] top-6 w-3 h-3 rounded-full bg-soft-gray group-hover:bg-accent-blue transition-colors print:bg-black"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
                duration: 0.3, 
                delay: index * 0.15 + 0.2,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{ scale: 1.5 }}
        />
        <motion.p 
            className="text-sm text-accent-blue mb-1 print:text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ 
                duration: 0.4, 
                delay: index * 0.15 + 0.1
            }}
        >
            {item.date}
        </motion.p>
        <h3 className="text-lg font-poppins font-bold text-white print:text-black">
            {'title' in item ? item.title : item.degree}
        </h3>
        <p className="text-md text-light-slate mb-2 print:text-gray-800">
            {'company' in item ? item.company : item.institution}
        </p>
        {'description' in item && <p className="text-sm text-soft-gray print:text-gray-700">{item.description}</p>}
    </motion.div>
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
        <Section id="experience" number="04" title="Pengalaman" className="max-w-3xl" delay={2000} printPageBreak={true}>
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h3 className="text-xl font-poppins text-light-slate mb-6 print:text-black">Pengalaman Kerja</h3>
                    <div className="relative">
                        {experiences.map((exp, index) => (
                            <TimelineItem key={index} item={exp} index={index} />
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h3 className="text-xl font-poppins text-light-slate mt-12 mb-6 print:text-black">Pendidikan</h3>
                    <div className="relative">
                        {education.map((edu, index) => (
                            <TimelineItem key={index} item={edu} index={index} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </Section>
    );
};

export default ExperienceComponent;
