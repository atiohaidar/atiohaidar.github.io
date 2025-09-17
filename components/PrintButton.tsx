/**
 * @file Print Button component dengan utility functions
 */
import React from 'react';
import { PrinterIcon } from './Icons';
import { triggerPrint } from '../utils/print';
import { LAYOUT, COLORS, PRINT } from '../utils/styles';

/**
 * Komponen tombol print yang optimized untuk PDF generation
 */
const PrintButton: React.FC = () => {
    return (
        <button
            onClick={triggerPrint}
            className={`${LAYOUT.FIXED_BOTTOM_RIGHT} ${COLORS.BG_ACCENT} ${COLORS.TEXT_PRIMARY} w-14 h-14 rounded-full shadow-lg ${LAYOUT.FLEX_CENTER} hover:bg-white transition-colors duration-300 ${PRINT.HIDE}`}
            aria-label="Cetak Portofolio"
            title="Cetak Portofolio - Pastikan 'Background graphics' aktif untuk hasil terbaik"
        >
            <PrinterIcon className="w-6 h-6" />
        </button>
    );
};

export default PrintButton;
