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
    <div className="hidden md:flex flex-col items-center fixed bottom-0 left-10 z-10 print:hidden">
        <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <GitHubIcon className="w-6 h-6" />
        </a>
        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <LinkedInIcon className="w-6 h-6" />
        </a>
        {socials.instagram && (
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
                <InstagramIcon className="w-6 h-6" />
            </a>
        )}
        <div className="w-px h-24 bg-soft-gray mt-2"></div>
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
        <div className="relative">
            <Navbar logoSrc={profile.logoSrc} />
            <SocialLinks socials={profile.socials} />
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