/**
 * @file Komponen Footer aplikasi.
 * Menampilkan tautan sosial media (hanya di mobile) dan teks hak cipta.
 */
import React, { useState, useRef } from 'react';
import type { SocialLinks } from '../types';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './Icons';
import SpyTooltip from './SpyTooltip';

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
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const githubRef = useRef<HTMLAnchorElement>(null);
    const linkedinRef = useRef<HTMLAnchorElement>(null);
    const instagramRef = useRef<HTMLAnchorElement>(null);

    return (
        <footer className="py-8 text-center text-light-muted dark:text-soft-gray text-sm">
            <div className="flex justify-center items-center space-x-6 mb-4 md:hidden print:hidden">
                {/* GitHub */}
                <div
                    className="relative"
                    onMouseEnter={() => setActiveTooltip('github')}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <a
                        ref={githubRef}
                        href={socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-light-accent dark:hover:text-accent-blue transition-colors"
                    >
                        <GitHubIcon className="w-6 h-6" />
                    </a>
                    <SpyTooltip
                        visible={activeTooltip === 'github'}
                        title="SOCIAL"
                        items={[
                            { label: 'PLATFORM', value: 'GitHub' },
                            { label: 'TYPE', value: 'Code Repository' },
                            { label: 'ACTION', value: 'View Projects' },
                        ]}
                        targetRef={githubRef}
                        color="#6e5494"
                    />
                </div>

                {/* LinkedIn */}
                <div
                    className="relative"
                    onMouseEnter={() => setActiveTooltip('linkedin')}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <a
                        ref={linkedinRef}
                        href={socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:text-light-accent dark:hover:text-accent-blue transition-colors"
                    >
                        <LinkedInIcon className="w-6 h-6" />
                    </a>
                    <SpyTooltip
                        visible={activeTooltip === 'linkedin'}
                        title="SOCIAL"
                        items={[
                            { label: 'PLATFORM', value: 'LinkedIn' },
                            { label: 'TYPE', value: 'Professional Network' },
                            { label: 'ACTION', value: 'Connect' },
                        ]}
                        targetRef={linkedinRef}
                        color="#0077b5"
                    />
                </div>

                {/* Instagram */}
                {socials.instagram && (
                    <div
                        className="relative"
                        onMouseEnter={() => setActiveTooltip('instagram')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <a
                            ref={instagramRef}
                            href={socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:text-light-accent dark:hover:text-accent-blue transition-colors"
                        >
                            <InstagramIcon className="w-6 h-6" />
                        </a>
                        <SpyTooltip
                            visible={activeTooltip === 'instagram'}
                            title="SOCIAL"
                            items={[
                                { label: 'PLATFORM', value: 'Instagram' },
                                { label: 'TYPE', value: 'Photo Sharing' },
                                { label: 'ACTION', value: 'Follow' },
                            ]}
                            targetRef={instagramRef}
                            color="#E1306C"
                        />
                    </div>
                )}
            </div>
            <p>{copyright}</p>
        </footer>
    );
};

export default Footer;