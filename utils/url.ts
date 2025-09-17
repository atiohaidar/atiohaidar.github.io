/**
 * @file Utility functions untuk URL dan link handling
 */

/**
 * Membersihkan URL dengan menghapus protocol untuk display
 */
export const cleanUrl = (url: string): string => {
  return url.replace(/^https?:\/\//, '');
};

/**
 * Validasi apakah string adalah URL yang valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Membuat props untuk external links dengan keamanan
 */
export const getExternalLinkProps = (url: string) => ({
  href: url,
  target: '_blank',
  rel: 'noopener noreferrer',
});

/**
 * Portfolio URL constants
 */
export const PORTFOLIO_URL = 'https://atiohaidar.github.io';

/**
 * Mendapatkan URL absolut untuk portfolio
 */
export const getPortfolioUrl = (): string => PORTFOLIO_URL;