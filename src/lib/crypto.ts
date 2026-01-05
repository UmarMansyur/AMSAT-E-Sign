import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate SHA-256 hash dari konten
 */
export function generateContentHash(content: string): string {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

/**
 * Generate secret key unik
 */
export function generateSecretKey(): string {
  // Generate UUID dan tambahkan random bytes
  const uuid = uuidv4();
  const randomPart = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  return `SK-${uuid.substring(0, 8)}-${randomPart.substring(0, 16)}`.toUpperCase();
}

/**
 * Hash secret key menggunakan bcrypt
 */
export async function hashSecretKey(secretKey: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(secretKey, salt);
}

/**
 * Verifikasi secret key dengan hash
 */
export async function verifySecretKey(secretKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secretKey, hash);
}

/**
 * Generate hash untuk dokumen/surat
 * Menggabungkan semua field penting untuk membuat fingerprint unik
 */
export function generateLetterHash(
  letterNumber: string,
  letterDate: Date,
  subject: string,
  attachment: string,
  content?: string
): string {
  const dataToHash = JSON.stringify({
    letterNumber,
    letterDate: letterDate.toISOString(),
    subject,
    attachment,
    content: content || '',
  });
  return generateContentHash(dataToHash);
}

/**
 * Generate signature hash
 * Menggabungkan hash dokumen dengan identitas penandatangan
 */
export function generateSignatureHash(
  letterHash: string,
  signerId: string,
  timestamp: Date
): string {
  const dataToHash = JSON.stringify({
    letterHash,
    signerId,
    timestamp: timestamp.toISOString(),
  });
  return generateContentHash(dataToHash);
}

/**
 * Verifikasi integritas dokumen
 */
export function verifyLetterIntegrity(
  letterNumber: string,
  letterDate: Date,
  subject: string,
  attachment: string,
  content: string | undefined,
  storedHash: string
): boolean {
  const currentHash = generateLetterHash(letterNumber, letterDate, subject, attachment, content);
  return currentHash === storedHash;
}
