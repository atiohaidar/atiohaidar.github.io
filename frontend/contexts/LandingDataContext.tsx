/**
 * @file Context untuk menyimpan data landing page yang di-prefetch saat intro.
 * Data di-fetch bersamaan dengan animasi intro sehingga tidak ada loading tambahan.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProfile, getAbout, getProjects, getResearch, getExperiences, getEducation } from '../api';
import type { Profile, About, Project, ResearchItem, Experience, Education } from '../types';

interface LandingData {
    profile: Profile | null;
    about: About | null;
    projects: Project[];
    research: ResearchItem[];
    experiences: Experience[];
    education: Education[];
}

interface LandingDataContextType {
    data: LandingData;
    loading: boolean;
    error: string | null;
}

const LandingDataContext = createContext<LandingDataContextType | undefined>(undefined);

interface LandingDataProviderProps {
    children: ReactNode;
    onDataReady?: (ready: boolean) => void;
}

export const LandingDataProvider: React.FC<LandingDataProviderProps> = ({ children, onDataReady }) => {
    const [data, setData] = useState<LandingData>({
        profile: null,
        about: null,
        projects: [],
        research: [],
        experiences: [],
        education: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                setData({
                    profile: profileData,
                    about: aboutData,
                    projects: projectsData,
                    research: researchData,
                    experiences: experiencesData,
                    education: educationData,
                });

                onDataReady?.(true);
            } catch (err) {
                setError('Gagal memuat data portofolio. Silakan coba lagi nanti.');
                console.error(err);
                // Still mark as ready so intro can complete and show error
                onDataReady?.(true);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [onDataReady]);

    return (
        <LandingDataContext.Provider value={{ data, loading, error }}>
            {children}
        </LandingDataContext.Provider>
    );
};

export const useLandingData = (): LandingDataContextType => {
    const context = useContext(LandingDataContext);
    if (context === undefined) {
        throw new Error('useLandingData must be used within a LandingDataProvider');
    }
    return context;
};
