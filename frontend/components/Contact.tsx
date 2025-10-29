/**
 * @file Komponen untuk bagian "Kontak" dengan enhanced animations.
 * Menampilkan ajakan untuk terhubung dan sebuah tombol yang mengarah ke profil LinkedIn.
 */
import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import { fadeInUp, scaleIn } from '../utils/motionVariants';

/**
 * Props untuk komponen Contact.
 */
interface ContactProps {
    /** Teks ajakan untuk menghubungi. */
    pitch: string;
    /** URL profil LinkedIn. */
    linkedinUrl: string;
}

const Contact: React.FC<ContactProps> = ({ pitch, linkedinUrl }) => {
    return (
        <Section id="contact" number="05" title="Apa Selanjutnya?" className="text-center max-w-2xl" delay={2400} printPageBreak={false}>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.2,
                            delayChildren: 0.1
                        }
                    }
                }}
            >
                <motion.h3 
                    className="text-4xl font-poppins font-bold text-white mb-4 print:text-black print:text-3xl"
                    variants={fadeInUp}
                >
                    Kenalan
                </motion.h3>
                <motion.p 
                    className="text-soft-gray leading-relaxed mb-8 print:text-black"
                    variants={fadeInUp}
                >
                    {pitch}
                </motion.p>
                <motion.div variants={scaleIn}>
                    <motion.a 
                        href={linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-transparent text-accent-blue border border-accent-blue rounded px-10 py-4 font-medium transition-colors duration-300 text-lg print:hidden"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: 'rgba(224, 224, 224, 0.1)',
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        LinkedIn
                    </motion.a>
                </motion.div>
                <div className="hidden print:block text-center mt-4">
                    <p>Anda dapat menemukan saya di LinkedIn:</p>
                    <p className="font-semibold text-blue-600">{linkedinUrl}</p>
                </div>
            </motion.div>
        </Section>
    );
};

export default Contact;
