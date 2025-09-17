import React from 'react';
import { PrinterIcon } from './Icons';

const PrintButton: React.FC = () => {
    const handlePrint = () => {
        // Show alert with print instructions
        alert('Tips untuk hasil print/PDF terbaik:\n\n✅ Warna dan Design:\n1. Di dialog print, pastikan "More settings" > "Options" > "Background graphics" dicentang/aktif\n2. Atau di Chrome: klik "More settings" > centang "Background graphics"\n\n✅ Link yang Clickable:\n3. Pilih "Save as PDF" untuk mendapatkan PDF dengan link yang bisa diklik\n4. Link ke GitHub, LinkedIn, dan project akan tetap berfungsi di PDF!\n\n✅ Hasil: PDF dengan warna gelap profesional + link yang aktif');
        
        // Small delay to ensure alert is seen before print dialog
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <button
            onClick={handlePrint}
            className="fixed bottom-6 right-6 z-50 bg-accent-blue text-deep-navy w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-300 print:hidden"
            aria-label="Cetak Portofolio"
            title="Cetak Portofolio - Pastikan 'Background graphics' aktif untuk hasil terbaik"
        >
            <PrinterIcon className="w-6 h-6" />
        </button>
    );
};

export default PrintButton;
