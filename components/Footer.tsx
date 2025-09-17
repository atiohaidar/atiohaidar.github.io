/**
 * @file Komponen Footer aplikasi.
 * Menampilkan tautan sosial media (hanya di mobile) dan teks hak cipta.
 */
import React from 'react';
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
            <div className="flex justify-center items-center space-x-6 mb-4 md:hidden print:hidden">
                <a href={socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-colors">
                    <GitHubIcon className="w-6 h-6" />
                </a>
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-colors">
                    <LinkedInIcon className="w-6 h-6" />
                </a>
                {socials.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-colors">
                        <InstagramIcon className="w-6 h-6" />
                    </a>
                )}
            </div>
            <p>{copyright}</p>
        </footer>
    );
};

export default Footer;