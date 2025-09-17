
import type { Profile, About, Project, Experience, Education } from './types';

// Di masa depan, ubah BASE_URL ini ke endpoint API production Anda.
// Untuk saat ini, kita mengambil dari file JSON lokal.
const BASE_URL = './data'; 

const fetchData = async <T>(endpoint: string): Promise<T> => {
    // Mensimulasikan jeda jaringan agar terlihat seperti panggilan API sungguhan
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await fetch(`${BASE_URL}/${endpoint}.json`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

export const getProfile = () => fetchData<Profile>('profile');
export const getAbout = () => fetchData<About>('about');
export const getProjects = () => fetchData<Project[]>('projects');
export const getExperiences = () => fetchData<Experience[]>('experiences');
export const getEducation = () => fetchData<Education[]>('education');
