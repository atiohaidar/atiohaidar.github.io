/**
 * @file Print Button component dengan SpyTooltip
 */
import React, { useState, useRef } from 'react';
import { PrinterIcon } from './Icons';
import { triggerPrint } from '../utils/print';
import { LAYOUT, COLORS, PRINT } from '../utils/styles';
import SpyTooltip from './SpyTooltip';

/**
 * Komponen tombol print yang optimized untuk PDF generation
 */
const PrintButton: React.FC = () => {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
        <div
            className={`${LAYOUT.FIXED_BOTTOM_LEFT} ${PRINT.HIDE}`}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
        >
            <button
                ref={buttonRef}
                onClick={triggerPrint}
                className={`relative ${COLORS.BG_ACCENT} ${COLORS.TEXT_PRIMARY} w-14 h-14 rounded-full shadow-lg ${LAYOUT.FLEX_CENTER} hover:bg-white transition-colors duration-300`}
                aria-label="Cetak Portofolio"
            >
                <PrinterIcon className="w-6 h-6" />
            </button>

            <SpyTooltip
                visible={isTooltipOpen}
                title="PRINT"
                items={[
                    { label: 'ACTION', value: 'Export to PDF' },
                    { label: 'TIP', value: 'Enable BG Graphics' },
                    { label: 'FORMAT', value: 'A4 Portrait' },
                ]}
                targetRef={buttonRef}
                color="#10b981"
            />
        </div>
    );
};

export default PrintButton;
