
import React from 'react';
import { GitHubIcon, LinkedInIcon } from './Icons';

const Footer: React.FC = () => {
    return (
        <footer className="py-8 text-center text-soft-gray text-sm">
            <div className="flex justify-center items-center space-x-6 mb-4 md:hidden">
                <a href="https://github.com/TioHaidarHanif" target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-colors">
                    <GitHubIcon className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-colors">
                    <LinkedInIcon className="w-6 h-6" />
                </a>
            </div>
            <p>Didesain & Dibangun oleh Tio Haidar Hanif © 2025</p>
        </footer>
    );
};

export default Footer;
