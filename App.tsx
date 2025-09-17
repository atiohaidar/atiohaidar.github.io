import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import ExperienceComponent from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PrintButton from './components/PrintButton';
import { GitHubIcon, LinkedInIcon } from './components/Icons';
import { getProfile, getAbout, getProjects, getExperiences, getEducation } from './api';
import type { Profile, About as AboutType, Project, Experience, Education, SocialLinks as SocialLinksType } from './types';


const SocialLinks: React.FC<{ socials: SocialLinksType }> = ({ socials }) => (
    <div className="hidden md:flex flex-col items-center fixed bottom-0 left-10 z-10 print:hidden">
        <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <GitHubIcon className="w-6 h-6" />
        </a>
        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <LinkedInIcon className="w-6 h-6" />
        </a>
        <div className="w-px h-24 bg-soft-gray mt-2"></div>
    </div>
);

const App: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [about, setAbout] = useState<AboutType | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, aboutData, projectsData, experiencesData, educationData] = await Promise.all([
                    getProfile(),
                    getAbout(),
                    getProjects(),
                    getExperiences(),
                    getEducation(),
                ]);
                setProfile(profileData);
                setAbout(aboutData);
                setProjects(projectsData);
                setExperiences(experiencesData);
                setEducation(educationData);
            } catch (err) {
                setError('Failed to load portfolio data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-navy text-accent-blue text-xl font-poppins">
                Loading Portfolio...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-navy text-red-500 text-xl font-poppins">
                {error}
            </div>
        );
    }
    
    if (!profile || !about) {
        return null; // Should not happen if loading is false and no error, but good for type safety
    }

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
                <About 
                    description={about.description}
                    coreValues={about.coreValues}
                    interests={about.interests}
                />
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