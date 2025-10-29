import * as bcrypt from 'bcryptjs';
import type { AppContext, UserRole } from '../models/types';
import { parseToken } from '../middlewares/auth';

/**
 * Hash a password using bcrypt with salt rounds of 10
 * @param password - Plain text password to hash
 * @returns Promise that resolves to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise that resolves to true if passwords match
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export interface VerifiedUser {
  username: string;
  name: string;
  role: UserRole;
}

export function verifyAuth(c: AppContext): VerifiedUser | null {
  const header = c.req.header('Authorization');
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const payload = parseToken(match[1]?.trim() ?? '');
  if (!payload) {
    return null;
  }

  return {
    username: payload.sub,
    name: payload.name,
    role: payload.role,
  };
}
