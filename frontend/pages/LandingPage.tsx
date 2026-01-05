import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import SpyTooltip from '../components/SpyTooltip';

import { useLandingData } from '../contexts/LandingDataContext';
import { useMultiParallax } from '../hooks/useParallax';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import { COLORS, LAYOUT, PRINT } from '../utils/styles';
import { Card, Heading, Typography, Input, Button, DoodleCoffeeRing } from '../components/ui';
import type { NavAction } from '../constants';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    // Get pre-fetched data from context (fetched during intro animation)
    const { data, loading, error } = useLandingData();
    const { profile, about, projects, research, experiences, education } = data;

    // Parallax effect for background layers
    const parallax = useMultiParallax();

    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [isAnonymousChatOpen, setIsAnonymousChatOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [ticketTokenInput, setTicketTokenInput] = useState('');
    const [prefilledTicketToken, setPrefilledTicketToken] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formTokenInput, setFormTokenInput] = useState('');
    const [isChatTooltipOpen, setIsChatTooltipOpen] = useState(false);
    const chatButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setLoggedInUser(storedUser.username);
        }
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

    // Note: Loading is now handled by intro animation - no loading screen needed here

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
        <div className={`relative min-h-screen duration-300 overflow-hidden`}>



            {/* Particle Overlay (Optional, keep it subtle) */}
            {/* <div className="fixed inset-0 opacity-20 dark:opacity-30 -z-10 pointer-events-none">
            </div> */}

            <Navbar
                logoSrc={profile.logoSrc}
                socials={profile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
                onNavAction={handleNavAction}
            />

            <main className={`mx-auto relative -z-12 ${COLORS.BG_PRIMARY} transition-colors min-h-screen`}>
                {/* Background Decorations */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <DoodleCoffeeRing className="absolute -top-10 -left-10 w-64 h-64 scale-150 rotate-45" />
                    <DoodleCoffeeRing className="absolute bottom-1/4 right-[15%] w-48 h-48 opacity-10" />

                    {/* Pencil Smudges/Scribbles */}
                    <div className="absolute top-1/4 right-10 w-40 h-1 bg-slate-400/5 rotate-12 blur-md" />
                    <div className="absolute bottom-1/3 left-10 w-60 h-2 bg-slate-400/5 -rotate-6 blur-lg" />
                </div>

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
            <div
                className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] print:hidden"
                onMouseEnter={() => setIsChatTooltipOpen(true)}
                onMouseLeave={() => setIsChatTooltipOpen(false)}
            >
                <button
                    ref={chatButtonRef}
                    onClick={() => setIsAnonymousChatOpen(true)}
                    className={`relative ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} p-3 md:p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity`}
                >
                    <span className="text-xl md:text-2xl">💬</span>
                </button>

                <SpyTooltip
                    visible={isChatTooltipOpen}
                    title="CHAT"
                    items={[
                        { label: 'TYPE', value: 'Anonymous Chat' },
                        { label: 'CHANNEL', value: 'Durable Object Cloudflare' },
                        { label: 'PRIVACY', value: 'No Login Required' },
                    ]}
                    targetRef={chatButtonRef}
                    color="#f59e0b"
                />
            </div>

            {/* Anonymous Chat Modal */}
            <AnonymousChatModal
                isOpen={isAnonymousChatOpen}
                onClose={() => setIsAnonymousChatOpen(false)}
            />

            {/* Ticket Tracking Modal */}
            {isTicketModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setIsTicketModalOpen(false)}
                >
                    <Card
                        variant="glass"
                        className="relative w-full max-w-md p-8 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-blue-100/80 dark:bg-blue-900/30 rotate-1 shadow-sm z-20"></div>

                        <button
                            type="button"
                            onClick={() => setIsTicketModalOpen(false)}
                            className={`absolute right-4 top-4 ${COLORS.TEXT_SECONDARY} hover:text-red-500 transition-colors p-1`}
                            aria-label="Tutup modal ticketing"
                        >
                            ✕
                        </button>
                        <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4`}>
                            Lacak Tiket
                        </Heading>
                        <Typography variant="body" className={`${COLORS.TEXT_SECONDARY} mb-8 font-patrick`}>
                            Masukkan token tiket untuk melihat status pengaduan Anda atau buat tiket baru jika belum punya token.
                        </Typography>
                        <form onSubmit={handleTicketModalSubmit} className="space-y-6">
                            <Input
                                label="Token Tiket"
                                id="ticket-token-input"
                                type="text"
                                value={ticketTokenInput}
                                onChange={(e) => setTicketTokenInput(e.target.value)}
                                placeholder="Contoh: TKT-ABC12345"
                                fullWidth
                                variant="glass"
                                className="font-patrick"
                            />
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    className="font-patrick text-xl"
                                >
                                    Lacak Tiket 🎫
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleTicketCreateNew}
                                    variant="glass"
                                    fullWidth
                                    size="lg"
                                    className="font-patrick text-xl"
                                >
                                    Buat Baru
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>,
                document.body
            )}

            {/* Form Token Modal */}
            {isFormModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setIsFormModalOpen(false)}
                >
                    <Card
                        variant="glass"
                        className="relative w-full max-w-md p-8 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-purple-100/80 dark:bg-purple-900/30 -rotate-1 shadow-sm z-20"></div>

                        <button
                            type="button"
                            onClick={() => setIsFormModalOpen(false)}
                            className={`absolute right-4 top-4 ${COLORS.TEXT_SECONDARY} hover:text-red-500 transition-colors p-1`}
                            aria-label="Tutup modal form"
                        >
                            ✕
                        </button>
                        <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4`}>
                            Akses Formulir
                        </Heading>
                        <Typography variant="body" className={`${COLORS.TEXT_SECONDARY} mb-8 font-patrick`}>
                            Masukkan token formulir untuk mulai mengisi form yang tersedia.
                        </Typography>
                        <form onSubmit={handleFormModalSubmit} className="space-y-6">
                            <Input
                                label="Token Formulir"
                                id="form-token-input"
                                type="text"
                                value={formTokenInput}
                                onChange={(e) => setFormTokenInput(e.target.value)}
                                placeholder="Masukkan token formulir"
                                fullWidth
                                variant="glass"
                                className="font-patrick"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                className="font-patrick text-xl"
                                style={{ backgroundColor: '#8b5cf6' }} // Purple accent
                            >
                                Buka Formulir 📝
                            </Button>
                        </form>
                    </Card>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LandingPage;

