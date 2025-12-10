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
import FormTokenSection from '../components/FormTokenSection';
import TicketSubmissionSection from '../components/TicketSubmissionSection';
import TicketTrackingSection from '../components/TicketTrackingSection';
import ScrollReveal from '../components/ScrollReveal';
import { getProfile, getAbout, getProjects, getResearch, getExperiences, getEducation } from '../api';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import { COLORS, LAYOUT, PRINT } from '../utils/styles';
import type { NavAction } from '../constants';
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
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [ticketTokenInput, setTicketTokenInput] = useState('');
    const [prefilledTicketToken, setPrefilledTicketToken] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formTokenInput, setFormTokenInput] = useState('');

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

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleNavAction = (action: NavAction) => {
        switch (action) {
            case 'ticketing':
                scrollToSection('ticket-tracking');
                // Small delay to allow scroll to start/complete visually before modal overlay appears (optional, but feels better)
                setTimeout(() => {
                    setTicketTokenInput('');
                    setIsTicketModalOpen(true);
                }, 300);
                break;
            case 'form':
                scrollToSection('form-token-section');
                setTimeout(() => {
                    setFormTokenInput('');
                    setIsFormModalOpen(true);
                }, 300);
                break;
            case 'anonymousChat':
                setIsAnonymousChatOpen(true);
                break;
            default:
                break;
        }
    };

    const handleTicketModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = ticketTokenInput.trim();
        if (!trimmed) {
            return;
        }

        setPrefilledTicketToken(trimmed);
        setIsTicketModalOpen(false);
        scrollToSection('ticket-tracking');
    };

    const handleTicketCreateNew = () => {
        setIsTicketModalOpen(false);
        setPrefilledTicketToken(null);
        setTicketTokenInput('');
        scrollToSection('ticket-submission');
    };

    const handleFormModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = formTokenInput.trim();
        if (!trimmed) {
            return;
        }

        setIsFormModalOpen(false);
        navigate(`/form/${trimmed}`);
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
        <div className={`relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden`}>
            {/* Global Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />

            {/* Animated Orbs (Fixed) */}
            <div className="fixed top-[20%] right-[10%] w-[500px] h-[500px] bg-accent-blue/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70 -z-10 pointer-events-none" />
            <div className="fixed bottom-[20%] left-[10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-70 -z-10 pointer-events-none" />
            <div className="fixed top-[40%] left-[40%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-70 -z-10 pointer-events-none" />

            {/* Particle Overlay (Optional, keep it subtle) */}
            {/* <div className="fixed inset-0 opacity-20 dark:opacity-30 -z-10 pointer-events-none">
                 <ParticleBackground />
            </div> */}

            <Navbar
                logoSrc={profile.logoSrc}
                socials={profile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
                onNavAction={handleNavAction}
            />

            <main className="mx-auto relative z-10">
                <ScrollReveal delay={200}>


                    <Hero
                        greeting={profile.heroGreeting}
                        name={profile.name}
                        tagline={profile.heroTagline}
                        bio={profile.heroBio}
                        linkedinUrl={profile.socials.linkedin}
                    />
                </ScrollReveal>

                <section id="about" className="relative z-10">
                    <About data={about} />
                </section>

                <section id="research" className="relative z-10">
                    <Research research={research} />
                </section>

                <section id="portfolio" className="relative z-10">
                    <Portfolio projects={projects} />
                </section>

                <section id="experience" className="relative z-10">
                    <ExperienceComponent experiences={experiences} education={education} />
                </section>

                <ApiDemo />

                <TicketSubmissionSection />

                <TicketTrackingSection
                    prefillToken={prefilledTicketToken}
                    onPrefillConsumed={() => setPrefilledTicketToken(null)}
                />

                <FormTokenSection />

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
                className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} p-3 md:p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity z-[60]`}
                title="Open Anonymous Chat"
            >
                <span className="text-xl md:text-2xl">💬</span>
            </button>

            {/* Anonymous Chat Modal */}
            <AnonymousChatModal
                isOpen={isAnonymousChatOpen}
                onClose={() => setIsAnonymousChatOpen(false)}
            />

            {/* Ticket Tracking Modal */}
            {isTicketModalOpen && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setIsTicketModalOpen(false)}
                >
                    <div
                        className={`${COLORS.BG_SECONDARY} ${COLORS.BORDER} relative w-full max-w-md rounded-xl border p-6 shadow-2xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsTicketModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            aria-label="Tutup modal ticketing"
                        >
                            ✕
                        </button>
                        <h2 className={`text-2xl font-semibold mb-2 ${COLORS.TEXT_PRIMARY}`}>
                            Lacak Tiket
                        </h2>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                            Masukkan token tiket untuk melihat status pengaduan Anda atau buat tiket baru jika belum punya token.
                        </p>
                        <form onSubmit={handleTicketModalSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${COLORS.TEXT_PRIMARY}`} htmlFor="ticket-token-input">
                                    Token Tiket
                                </label>
                                <input
                                    id="ticket-token-input"
                                    type="text"
                                    value={ticketTokenInput}
                                    onChange={(e) => setTicketTokenInput(e.target.value)}
                                    placeholder="Contoh: TKT-ABC12345"
                                    className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                />
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity`}
                                >
                                    Lacak Tiket
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTicketCreateNew}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold border ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                                >
                                    Buat Tiket Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Form Token Modal */}
            {isFormModalOpen && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setIsFormModalOpen(false)}
                >
                    <div
                        className={`${COLORS.BG_SECONDARY} ${COLORS.BORDER} relative w-full max-w-md rounded-xl border p-6 shadow-2xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsFormModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            aria-label="Tutup modal form"
                        >
                            ✕
                        </button>
                        <h2 className={`text-2xl font-semibold mb-2 ${COLORS.TEXT_PRIMARY}`}>
                            Akses Formulir
                        </h2>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                            Masukkan token formulir untuk mulai mengisi form yang tersedia.
                        </p>
                        <form onSubmit={handleFormModalSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${COLORS.TEXT_PRIMARY}`} htmlFor="form-token-input">
                                    Token Formulir
                                </label>
                                <input
                                    id="form-token-input"
                                    type="text"
                                    value={formTokenInput}
                                    onChange={(e) => setFormTokenInput(e.target.value)}
                                    placeholder="Masukkan token formulir"
                                    className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full px-4 py-3 rounded-lg font-semibold ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity`}
                            >
                                Buka Formulir
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
