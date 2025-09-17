
import React, { useState, useEffect } from 'react';

const navLinks = [
    { name: 'Tentang Saya', href: '#about' },
    { name: 'Portofolio', href: '#portfolio' },
    { name: 'Pengalaman', href: '#experience' },
    { name: 'Kontak', href: '#contact' },
];

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-deep-navy/80 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
            <nav className="container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
                <a href="#hero" className="text-2xl font-poppins font-bold text-accent-blue z-50">THH</a>
                
                {/* Desktop Nav */}
                <ul className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link, index) => (
                        <li key={link.name}>
                            <a href={link.href} className="text-light-slate hover:text-accent-blue transition-colors duration-300">
                                <span className="text-accent-blue mr-1">0{index + 1}.</span>{link.name}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu Button */}
                <div className="md:hidden z-50">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-accent-blue">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed top-0 right-0 h-full w-3/4 bg-light-navy transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <ul className="flex flex-col items-center justify-center h-full space-y-8">
                    {navLinks.map((link, index) => (
                        <li key={link.name}>
                            <a href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl text-light-slate hover:text-accent-blue transition-colors duration-300">
                                <span className="text-accent-blue mr-2">0{index + 1}.</span>{link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
             {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-30"></div>}
        </header>
    );
};

export default Navbar;
