import React from 'react';
import { PrinterIcon } from './Icons';

const PrintButton: React.FC = () => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="fixed bottom-6 right-6 z-50 bg-accent-blue text-deep-navy w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors duration-300 print:hidden"
            aria-label="Cetak Portofolio"
        >
            <PrinterIcon className="w-6 h-6" />
        </button>
    );
};

export default PrintButton;
