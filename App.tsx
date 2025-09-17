/**
 * @file Komponen root aplikasi.
 * Bertanggung jawab untuk:
 * - Mengambil semua data dari 'API'.
 * - Mengelola state loading dan error.
 * - Merakit dan merender semua bagian utama halaman.
 */
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Research from './components/Research';
import Portfolio from './components/Portfolio';
import ExperienceComponent from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PrintButton from './components/PrintButton';
import { GitHubIcon, LinkedInIcon, InstagramIcon } from './components/Icons';
import { getProfile, getAbout, getProjects, getResearch, getExperiences, getEducation } from './api';
import type { Profile, About as AboutType, Project, ResearchItem, Experience, Education, SocialLinks as SocialLinksType } from './types';


const SocialLinks: React.FC<{ socials: SocialLinksType }> = ({ socials }) => (
    <div className="hidden md:flex flex-col items-center fixed bottom-24 right-6 z-10 print:hidden group">
        {/* Background circle overlay that covers all icons initially */}
        <div className="absolute inset-0 bg-light-navy rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-0 shadow-lg">
            <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center">
                <span className="text-deep-navy text-xs font-bold">+</span>
            </div>
        </div>
        
        {/* Social media icons - initially stacked and hidden */}
        <div className="flex flex-col items-center space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
            <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1 bg-light-navy rounded-full shadow-md transform translate-y-8 group-hover:translate-y-0" style={{ transitionDelay: '0.1s' }}>
                <GitHubIcon className="w-5 h-5" />
            </a>
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1 bg-light-navy rounded-full shadow-md transform translate-y-8 group-hover:translate-y-0" style={{ transitionDelay: '0.15s' }}>
                <LinkedInIcon className="w-5 h-5" />
            </a>
            {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1 bg-light-navy rounded-full shadow-md transform translate-y-8 group-hover:translate-y-0" style={{ transitionDelay: '0.2s' }}>
                    <InstagramIcon className="w-5 h-5" />
                </a>
            )}
        </div>
        
        {/* Vertical line that appears after icons expand */}
        <div className="w-px h-16 bg-soft-gray mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300"></div>
    </div>
);

const App: React.FC = () => {
    // State untuk menyimpan semua data yang diambil dari API
    const [profile, setProfile] = useState<Profile | null>(null);
    const [about, setAbout] = useState<AboutType | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [research, setResearch] = useState<ResearchItem[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mengambil semua data saat komponen pertama kali dimuat
    useEffect(() => {
        const loadData = async () => {
            try {
                // Mengambil semua data secara paralel untuk efisiensi
                const [profileData, aboutData, projectsData, researchData, experiencesData, educationData] = await Promise.all([
                    getProfile(),
                    getAbout(),
                    getProjects(),
                    getResearch(),
                    getExperiences(),
                    getEducation(),
                ]);
                setProfile(profileData);
                setAbout(aboutData);
                setProjects(projectsData);
                setResearch(researchData);
                setExperiences(experiencesData);
                setEducation(educationData);
            } catch (err) {
                setError('Gagal memuat data portofolio. Silakan coba lagi nanti.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Menampilkan state loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-navy text-accent-blue text-xl font-poppins">
                Memuat Portofolio...
            </div>
        );
    }

    // Menampilkan state error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-navy text-red-500 text-xl font-poppins">
                {error}
            </div>
        );
    }
    
    // Guard untuk memastikan data profil dan about telah dimuat
    if (!profile || !about) {
        return null;
    }

    // Merender UI utama setelah data berhasil dimuat
    return (
        <div className="relative print-preserve-colors">
            <Navbar logoSrc={profile.logoSrc} socials={profile.socials} />
            {/* <SocialLinks socials={profile.socials} /> */}
            <main className="mx-auto">
                <Hero 
                    greeting={profile.heroGreeting}
                    name={profile.name}
                    tagline={profile.heroTagline}
                    bio={profile.heroBio}
                    linkedinUrl={profile.socials.linkedin}
                />
                <About data={about} />
                <Research research={research} />
                <Portfolio projects={projects} />
                <ExperienceComponent experiences={experiences} education={education} />
                <Contact 
                    pitch={profile.contactPitch}
                    linkedinUrl={profile.socials.linkedin}
                />
            </main>
            <Footer socials={profile.socials} copyright={profile.copyright} />
            <PrintButton />
        </div>
    );
}

export default App;