/**
 * @file Komponen untuk bagian "Tentang Saya" dengan enhanced scroll animations
 * Menampilkan deskripsi naratif, nilai-nilai inti (core values), dan minat.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer } from './MotionWrappers';
import { fadeInUp, staggerItem, fadeInLeft, fadeInRight } from '../utils/motionVariants';
import type { About as AboutType } from '../types';

/**
 * Props untuk komponen About.
 * Menerima semua data yang diperlukan untuk ditampilkan.
 */
interface AboutProps {
  data: AboutType;
}

const About: React.FC<AboutProps> = ({ data }) => {
    const { description, coreValues, interests } = data;

    return (
        <section 
            id="about" 
            className="py-12 container mx-auto px-6 md:px-16 lg:px-20 print:py-4 print:px-4 print-avoid-break"
        >
            <ScrollReveal variants={fadeInUp}>
                <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-8 flex items-center print:mb-4 print:text-xl">
                    <span className="text-accent-blue mr-3 print:mr-2">01.</span>
                    Tentang Saya
                    <span className="h-px w-20 sm:w-40 bg-soft-gray/30 ml-4 print:bg-gray-400 print:ml-2 print:w-16"></span>
                </h2>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 print:gap-6">
                <ScrollReveal variants={fadeInLeft} className="md:col-span-3">
                    <div className="text-soft-gray space-y-4 leading-relaxed print:text-black print:space-y-2 print:text-sm">
                        {description.map((paragraph, index) => (
                            <motion.p 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.1,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                {paragraph}
                            </motion.p>
                        ))}
                    </div>
                </ScrollReveal>
                
                <ScrollReveal variants={fadeInRight} className="md:col-span-2">
                    <div className="space-y-8 print:space-y-4">
                        <StaggerContainer staggerDelay={0.1}>
                            <motion.div variants={staggerItem}>
                                <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black print:text-base print:mb-2">
                                    🧩 Core Values
                                </h3>
                                <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black print:space-y-1 print:text-sm">
                                    {coreValues.map((value, index) => (
                                        <motion.li 
                                            key={value.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ 
                                                duration: 0.5, 
                                                delay: index * 0.1,
                                                ease: [0.22, 1, 0.36, 1]
                                            }}
                                        >
                                            <span className="font-semibold text-light-slate print:text-black">{value.title}:</span> {value.description}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                            
                            <motion.div variants={staggerItem}>
                                <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black print:text-base print:mb-2">
                                    🎯 Minat & Hobi
                                </h3>
                                <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black print:space-y-1 print:text-sm">
                                    {interests.map((interest, index) => (
                                        <motion.li 
                                            key={interest.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ 
                                                duration: 0.5, 
                                                delay: index * 0.1,
                                                ease: [0.22, 1, 0.36, 1]
                                            }}
                                        >
                                            <span className="font-semibold text-light-slate print:text-black">{interest.title}:</span> {interest.description}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </StaggerContainer>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default About;
