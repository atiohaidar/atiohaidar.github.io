/**
 * @file Berisi semua definisi tipe TypeScript yang digunakan di seluruh aplikasi.
 */

/**
 * Merepresentasikan tautan yang terkait dengan sebuah proyek.
 * 'type' menentukan ikon dan konteks tautan.
 */
export interface ProjectLink {
  type: 'github' | 'postman' | 'live';
  url: string;
}

/**
 * Merepresentasikan satu proyek dalam portofolio.
 */
export interface Project {
  name: string;
  description: string;
  contribution: string;
  tech?: string[];
  links: ProjectLink[];
}

/**
 * Merepresentasikan tautan yang terkait dengan sebuah penelitian.
 */
export interface ResearchLink {
  type: 'researchgate' | 'pdf' | 'other';
  url: string;
}

/**
 * Merepresentasikan satu item penelitian.
 */
export interface ResearchItem {
    type: string;
    title: string;
    description: string;
    contribution: string;
    links: ResearchLink[];
}

/**
 * Merepresentasikan satu pengalaman kerja.
 */
export interface Experience {
  date: string;
  title: string;
  company: string;
  description: string;
}

/**
 * Merepresentasikan riwayat pendidikan.
 */
export interface Education {
    date: string;
    degree: string;
    institution: string;
}

/**
 * Merepresentasikan tautan ke profil sosial media.
 */
export interface SocialLinks {
  github: string;
  linkedin: string;
  instagram?: string;
}

/**
 * Merepresentasikan data profil utama pengguna, digunakan di Hero, Kontak, dan Footer.
 */
export interface Profile {
  name: string;
  logoSrc: string;
  heroGreeting: string;
  heroTagline: string;
  heroBio: string;
  contactPitch: string;
  socials: SocialLinks;
  copyright: string;
}

/**
 * Merepresentasikan satu nilai inti (core value).
 */
export interface CoreValue {
  title: string;
  description: string;
}

/**
 * Merepresentasikan satu minat (interest).
 */
export interface Interest {
  title: string;
  description: string;
}

/**
 * Merepresentasikan konten untuk bagian "Tentang Saya".
 */
export interface About {
  description: string[];
  coreValues: CoreValue[];
  interests: Interest[];
}