/**
 * @file Komponen Footer aplikasi dengan smooth animations.
 * Menampilkan tautan sosial media (hanya di mobile) dan teks hak cipta.
 */
import React from 'react';
import { motion } from 'framer-motion';
import type { SocialLinks } from '../types';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './Icons';

/**
 * Props untuk komponen Footer.
 */
interface FooterProps {
    /** Objek yang berisi URL sosial media. */
    socials: SocialLinks;
    /** Teks hak cipta. */
    copyright: string;
}

const Footer: React.FC<FooterProps> = ({ socials, copyright }) => {
    return (
        <footer className="py-8 text-center text-soft-gray text-sm">
            <motion.div 
                className="flex justify-center items-center space-x-6 mb-4 md:hidden print:hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.a 
                    href={socials.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-accent-blue transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <GitHubIcon className="w-6 h-6" />
                </motion.a>
                <motion.a 
                    href={socials.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-accent-blue transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <LinkedInIcon className="w-6 h-6" />
                </motion.a>
                {socials.instagram && (
                    <motion.a 
                        href={socials.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-accent-blue transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <InstagramIcon className="w-6 h-6" />
                    </motion.a>
                )}
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {copyright}
            </motion.p>
        </footer>
    );
};

export default Footer;