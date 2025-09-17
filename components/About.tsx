/**
 * @file Komponen untuk bagian "Tentang Saya".
 * Menampilkan deskripsi naratif, nilai-nilai inti (core values), dan minat.
 */
import React from 'react';
import Section from './Section';
import type { About as AboutType } from '../types';

/**
 * Props untuk komponen About.
 * Menerima semua data yang diperlukan untuk ditampilkan.
 */
interface AboutProps {
  data: AboutType;
}

const About: React.FC<AboutProps> = ({ data }) => {
    const { description, coreValues, interests } = data;

    return (
        <Section id="about" number="01" title="Tentang Saya">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-3 text-soft-gray space-y-4 leading-relaxed print:text-black">
                    {description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black">🧩 Core Values</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black">
                            {coreValues.map(value => (
                                <li key={value.title}><span className="font-semibold text-light-slate print:text-black">{value.title}:</span> {value.description}</li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-poppins font-semibold text-white mb-3 print:text-black">🎯 Interests</h3>
                        <ul className="space-y-2 list-disc list-inside text-soft-gray print:text-black">
                             {interests.map(interest => (
                                <li key={interest.title}><span className="font-semibold text-light-slate print:text-black">{interest.title}:</span> {interest.description}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default About;
