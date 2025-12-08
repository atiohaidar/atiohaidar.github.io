/**
 * Cryptographically secure ID generation utilities
 * Uses crypto.randomUUID() which is available in Cloudflare Workers
 */

/**
 * Generate a secure unique ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @returns Secure unique ID string
 */
export function generateSecureId(prefix?: string): string {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * Generate a secure token for URLs/sharing
 * @param length - Length of the token (default: 12)
 * @returns Secure random token string
 */
export function generateSecureToken(length: number = 12): string {
    const array = new Uint8Array(Math.ceil(length * 0.75));
    crypto.getRandomValues(array);
    // Convert to base64 and take required length, making it URL-safe
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, length);
}
