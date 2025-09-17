/**
 * @file Bertindak sebagai lapisan service untuk mengambil data.
 * Saat ini, ini mensimulasikan panggilan API dengan mengambil file JSON lokal.
 * Di masa depan, Anda hanya perlu mengubah BASE_URL dan mungkin logika fetchData
 * untuk menunjuk ke API backend sungguhan tanpa mengubah komponen apa pun.
 */
import type { Profile, About, Project, ResearchItem, Experience, Education } from './types';

// Di masa depan, ubah BASE_URL ini ke endpoint API production Anda.
const BASE_URL = './data'; 

/**
 * Fungsi generik untuk mengambil data dari endpoint yang ditentukan.
 * @template T Tipe data yang diharapkan untuk di-return.
 * @param {string} endpoint Nama file JSON (tanpa ekstensi) di dalam folder /data.
 * @returns {Promise<T>} Promise yang resolve dengan data yang telah di-parse.
 * @throws {Error} Jika respons jaringan tidak 'ok'.
 */
const fetchData = async <T>(endpoint: string): Promise<T> => {
    // Mensimulasikan jeda jaringan agar terlihat seperti panggilan API sungguhan
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await fetch(`${BASE_URL}/${endpoint}.json`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

/** Mengambil data profil. */
export const getProfile = () => fetchData<Profile>('profile');

/** Mengambil data untuk bagian "Tentang Saya". */
export const getAbout = () => fetchData<About>('about');

/** Mengambil daftar proyek portofolio. */
export const getProjects = () => fetchData<Project[]>('projects');

/** Mengambil daftar item penelitian. */
export const getResearch = () => fetchData<ResearchItem[]>('research');

/** Mengambil daftar pengalaman kerja. */
export const getExperiences = () => fetchData<Experience[]>('experiences');

/** Mengambil riwayat pendidikan. */
export const getEducation = () => fetchData<Education[]>('education');
