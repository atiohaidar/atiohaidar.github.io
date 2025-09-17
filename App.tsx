
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import ExperienceComponent from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import type { Project, Experience, Education } from './types';
import { GitHubIcon, LinkedInIcon } from './components/Icons';

const projects: Project[] = [
    { name: 'Belajar NestJS (API)', description: 'Proyek fundamental untuk mempelajari framework NestJS dalam membangun API yang scalable dan efisien.', problem: 'Memahami arsitektur backend modern menggunakan NestJS.', tech: ['NestJS', 'TypeScript', 'TypeORM'], links: [{ type: 'github', url: 'https://github.com/TioHaidarHanif/belajar-nestjs' }] },
    { name: 'QR Generator', description: 'Aplikasi web sederhana untuk membuat kode QR secara dinamis dari input teks atau URL.', problem: 'Menyediakan alat yang cepat dan mudah untuk membuat kode QR.', links: [{ type: 'live', url: 'https://wajihah-qr-generator.pages.dev/' }] },
    { name: 'TA Backend', description: 'Sistem backend untuk aplikasi tugas akhir yang menangani logika bisnis dan manajemen data.', problem: 'Menyediakan API yang andal untuk aplikasi capstone project.', links: [{ type: 'github', url: 'https://github.com/TioHaidarHanif/Draft-Tugas-Akhir' }, { type: 'postman', url: 'https://capstone-bang.postman.co/' }] },
    { name: 'Surat Generator', description: 'Alat untuk membuat dokumen surat formal secara otomatis berdasarkan template yang ada.', problem: 'Mempercepat proses pembuatan surat yang seringkali repetitif.', links: [{ type: 'live', url: 'https://tiohaidarhanif.github.io/Surat-Generator/' }] },
    { name: 'Statistik Chat WA', description: 'Menganalisis dan memvisualisasikan data dari ekspor riwayat obrolan WhatsApp.', problem: 'Memberikan wawasan dari data percakapan WhatsApp yang tidak terstruktur.', links: [{ type: 'live', url: 'https://atiohaidar.github.io/statistik-chat-wa/' }] },
    { name: 'Extractor Metadata Penelitian', description: 'Alat untuk mengekstrak metadata penting dari dokumen penelitian secara otomatis.', problem: 'Mengurangi waktu entri data manual untuk metadata penelitian.', links: [{ type: 'live', url: 'https://atiohaidar.github.io/extractor-metadata-of-research/' }] },
    { name: 'Verifikasi Publikasi', description: 'Aplikasi untuk memfilter dan memverifikasi data publikasi dari Google Scholar.', problem: 'Memastikan akurasi dan klasifikasi data publikasi dosen.', links: [{ type: 'live', url: 'https://atiohaidar.github.io/filter-data-verif-gs-ppm/' }] },
    { name: 'Bot Telegram Google Appscript', description: 'Bot Telegram yang dibangun di atas Google Appscript untuk otomatisasi tugas MSDM.', problem: 'Otomatisasi proses manajemen sumber daya manusia melalui Telegram.', links: [{ type: 'github', url: 'https://github.com/Al-Fath-Developer/Bot-Telegram-MSDM-Prada-1446H' }] },
    { name: 'Google Appscript Template', description: 'Template kode Google Appscript untuk menambahkan fungsionalitas kustom di Google Sheets.', problem: 'Menyediakan solusi boilerplate untuk otomatisasi tugas di Spreadsheet.', links: [{ type: 'github', url: 'https://github.com/Al-Fath-Developer/AlFathTemplate2024' }] },
];

const experiences: Experience[] = [
    { date: 'Sep 2025 - Sekarang', title: 'Asisten Praktikum Pemrograman Web', company: 'Informatics Lab - Telkom University', description: 'Membantu mahasiswa memahami konsep dan menyelesaikan tugas praktikum. Melakukan penilaian tugas.' },
    { date: 'Agu 2025 - Sep 2025', title: 'Verifikator data Google Scholar (TLH)', company: 'Direktorat Penelitian dan Pengabdian Masyarakat - Telkom University', description: 'Verifikasi data publikasi dosen dari Google Scholar, memastikan akurasi klasifikasi jurnal dan konferensi. Membuat otomatisasi tugas repetitif untuk efisiensi.' },
    { date: 'Feb 2025 - Jun 2025', title: 'Asisten Praktikum Basis Data', company: 'Informatics Lab - Telkom University', description: 'Membantu mahasiswa dalam memahami konsep basis data dan menyelesaikan tugas praktikum. Melakukan penilaian tugas.' },
    { date: 'Sep 2024 - Des 2024', title: 'Asisten Praktikum Algoritma Pemrograman dan Pemrograman Web', company: 'Informatics Lab - Telkom University', description: 'Membantu mahasiswa dalam memahami konsep basis data dan menyelesaikan tugas praktikum. Melakukan penilaian tugas.' },
];

const education: Education[] = [
    { date: 'Sep 2021 - Nov 2025 (Expected)', degree: 'Sarjana S1 Rekayasa Perangkat Lunak', institution: 'Universitas Telkom - Bandung' },
];


const SocialLinks: React.FC = () => (
    <div className="hidden md:flex flex-col items-center fixed bottom-0 left-10 z-10">
        <a href="https://github.com/TioHaidarHanif" target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <GitHubIcon className="w-6 h-6" />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1">
            <LinkedInIcon className="w-6 h-6" />
        </a>
        <div className="w-px h-24 bg-soft-gray mt-2"></div>
    </div>
);

const EmailLink: React.FC = () => (
    <div className="hidden md:flex flex-col items-center fixed bottom-0 right-10 z-10">
        <a href="mailto:tiohaidarhanif@gmail.com" className="text-soft-gray hover:text-accent-blue p-2 transition-all hover:-translate-y-1 text-sm" style={{ writingMode: 'vertical-rl' }}>
            tiohaidarhanif@gmail.com
        </a>
        <div className="w-px h-24 bg-soft-gray mt-2"></div>
    </div>
);

const App: React.FC = () => {
    return (
        <div className="relative">
            <Navbar />
            <SocialLinks />
            <EmailLink />
            <main className="mx-auto">
                <Hero />
                <About />
                <Portfolio projects={projects} />
                <ExperienceComponent experiences={experiences} education={education} />
                <Contact />
            </main>
            <Footer />
        </div>
    );
}

export default App;
