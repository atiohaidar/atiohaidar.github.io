import React from 'react';
import type { DashboardPalette } from './types';

type ArticlesHeaderProps = {
    palette: DashboardPalette;
};

export function ArticlesHeader({ palette }: ArticlesHeaderProps) {
    return (
        <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>Kelola Articles</h2>
            <p className={`text-sm ${palette.panel.textMuted}`}>
                Buat dan kelola artikel blog atau konten Anda
            </p>
        </div>
    );
}
