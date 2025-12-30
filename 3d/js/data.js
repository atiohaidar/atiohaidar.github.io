/**
 * Resume Data Module
 * Contains all personal information for the 3D resume
 */

export const profileData = {
    name: "Tio Haidar Hanif",
    title: "Software Engineering Graduate",
    bio: "Saya adalah seorang lulusan S1 Rekayasa Perangkat Lunak dari Universitas Telkom dengan minat pada pengembangan perangkat lunak. Saya memiliki semangat belajar yang tinggi dan rasa ingin tahu yang besar.",
    description: [
        "Saya senang berinovasi, fokus pada pekerjaan teknis, dan termotivasi untuk terus meningkatkan keahlian dalam pengembangan perangkat lunak serta kolaborasi tim.",
        "Saya mengembangkan metode pembelajaran yang efektif dengan bantuan AI untuk mempercepat adaptasi terhadap teknologi baru."
    ],
    coreValues: [
        { title: "Innovation", description: "Selalu mencari solusi yang lebih efektif dan efisien." },
        { title: "Curiosity", description: "Memiliki rasa keingintahuan yang tinggi terhadap hal yang menarik." },
        { title: "Continuous Learning", description: "Masih belajar untuk memperbaiki diri." }
    ]
};

export const educationData = [
    {
        date: "Sep 2021 - Nov 2025 (Expected)",
        degree: "Sarjana S1 Rekayasa Perangkat Lunak",
        institution: "Universitas Telkom - Bandung"
    }
];

export const experienceData = [
    {
        date: "Sep 2025 - Sekarang",
        title: "Asisten Praktikum Pemrograman Web",
        company: "Informatics Lab - Telkom University",
        description: "Membantu mahasiswa memahami konsep dan menyelesaikan tugas praktikum. Melakukan penilaian tugas."
    },
    {
        date: "Agu 2025 - Sep 2025",
        title: "Verifikator data Google Scholar (TLH)",
        company: "Direktorat Penelitian dan Pengabdian Masyarakat - Telkom University",
        description: "Verifikasi data publikasi dosen dari Google Scholar, memastikan akurasi klasifikasi jurnal dan konferensi."
    },
    {
        date: "Feb 2025 - Jun 2025",
        title: "Asisten Praktikum Basis Data",
        company: "Informatics Lab - Telkom University",
        description: "Membantu mahasiswa dalam memahami konsep basis data dan menyelesaikan tugas praktikum."
    },
    {
        date: "Sep 2024 - Des 2024",
        title: "Asisten Praktikum Algoritma Pemrograman",
        company: "Informatics Lab - Telkom University",
        description: "Membantu mahasiswa dalam memahami konsep algoritma dan menyelesaikan tugas praktikum."
    }
];

export const skillsData = {
    frontend: ["React JS", "JavaScript", "TypeScript", "HTML", "CSS"],
    backend: ["NestJS", "Laravel", "Python", "Node.js"],
    database: ["SQL", "Prisma", "TypeORM"],
    tools: ["Git", "Google Apps Script", "Postman"],
    exploring: ["Rust", "Go", "MCP (Model Context Protocol)"]
};

export const contactData = {
    github: {
        label: "GitHub",
        url: "https://github.com/atiohaidar",
        icon: "🐙"
    },
    linkedin: {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/atiohaidar/",
        icon: "💼"
    },
    instagram: {
        label: "Instagram",
        url: "https://www.instagram.com/tiohaidarhanif",
        icon: "📸"
    }
};

export const projectsHighlight = [
    { name: "Web App Ploting Jadwal Dosen", tech: ["React JS", "NestJS", "Python"] },
    { name: "QR Generator For Wajihah", tech: ["React JS"] },
    { name: "Statistik Chat WA", tech: ["HTML", "CSS", "JavaScript"] },
    { name: "Bot Telegram MSDM", tech: ["Google Apps Script"] }
];
