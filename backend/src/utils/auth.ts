import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function createToken(user: any): string {
  // Ini adalah implementasi sederhana, sebaiknya gunakan JWT atau library serupa
  // untuk implementasi produksi
  const payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 hari
  };
  
  // Di production, gunakan secret key yang aman
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  // Ini hanya contoh, sebaiknya gunakan library JWT seperti jsonwebtoken
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
