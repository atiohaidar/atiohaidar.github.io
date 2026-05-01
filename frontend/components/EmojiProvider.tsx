/**
 * @file EmojiProvider – renders semua emoji unicode sebagai gambar Twemoji
 * sehingga tampilan konsisten di semua browser dan tidak terlihat seperti
 * emoji bawaan keyboard sistem operasi.
 */
import { useEffect, type ReactNode } from 'react';
import twemoji from 'twemoji';

/** Opsi Twemoji: gunakan format SVG via jsDelivr CDN */
const TWEMOJI_OPTIONS: TwemojiOptions = {
    folder: 'svg',
    ext: '.svg',
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
    className: 'emoji',
};

/**
 * Terapkan parsing Twemoji ke sebuah elemen DOM.
 */
function parseNode(node: Element | HTMLElement): void {
    twemoji.parse(node as HTMLElement, TWEMOJI_OPTIONS);
}

interface EmojiProviderProps {
    children: ReactNode;
}

/**
 * Provider yang secara otomatis mengkonversi semua karakter emoji unicode
 * menjadi gambar Twemoji (Twitter emoji) menggunakan MutationObserver,
 * sehingga tampilan emoji konsisten dan tidak menggunakan font emoji bawaan.
 */
const EmojiProvider: React.FC<EmojiProviderProps> = ({ children }) => {
    useEffect(() => {
        // Parse seluruh body saat pertama kali mount
        parseNode(document.body);

        // Amati perubahan DOM dan parse node baru secara otomatis
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of Array.from(mutation.addedNodes)) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            parseNode(node as Element);
                        } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                            parseNode(node.parentElement);
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return <>{children}</>;
};

export default EmojiProvider;
