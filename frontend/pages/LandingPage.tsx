import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Research from '../components/Research';
import Portfolio from '../components/Portfolio';
import ExperienceComponent from '../components/Experience';
import ApiDemo from '../components/ApiDemo';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import PrintButton from '../components/PrintButton';
import AnonymousChatModal from '../components/AnonymousChatModal';
import { getProfile, getAbout, getProjects, getResearch, getExperiences, getEducation } from '../api';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import { COLORS, LAYOUT, PRINT } from '../utils/styles';
import type {
    Profile,
    About as AboutType,
    Project,
    ResearchItem,
    Experience,
    Education,
} from '../types';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [about, setAbout] = useState<AboutType | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [research, setResearch] = useState<ResearchItem[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [isAnonymousChatOpen, setIsAnonymousChatOpen] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setLoggedInUser(storedUser.username);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
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

    const handleLogout = () => {
        clearAuth();
        setLoggedInUser(null);
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_ACCENT} text-xl font-poppins`}>
                Memuat Portofolio...
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY} text-red-500 text-xl font-poppins`}>
                {error}
            </div>
        );
    }

    if (!profile || !about) {
        return null;
    }

    return (
        <div className={`relative ${PRINT.PRESERVE_COLORS} bg-light-bg dark:bg-deep-navy transition-colors duration-300`}>
            <Navbar 
                logoSrc={profile.logoSrc} 
                socials={profile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />
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
                <ApiDemo />
                <Contact
                    pitch={profile.contactPitch}
                    linkedinUrl={profile.socials.linkedin}
                />
            </main>
            <Footer socials={profile.socials} copyright={profile.copyright} />
            <PrintButton />
            
            {/* Anonymous Chat Button */}
            <button
                onClick={() => setIsAnonymousChatOpen(true)}
                className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} p-3 md:p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity z-[60]`}
                title="Open Anonymous Chat"
            >
                <span className="text-xl md:text-2xl">💬</span>
            </button>

            {/* Anonymous Chat Modal */}
            <AnonymousChatModal
                isOpen={isAnonymousChatOpen}
                onClose={() => setIsAnonymousChatOpen(false)}
            />
        </div>
    );
};

export default LandingPage;
