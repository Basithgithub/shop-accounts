import crypto from 'node:crypto';
import { EncryptedContainer, ShopVaultData } from '@/types/accounts';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha512';

/**
 * Derives a 256-bit encryption key from a master password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

/**
 * Encrypts arbitrary ShopVaultData into an EncryptedContainer
 */
export function encryptVaultData(data: ShopVaultData, password: string): EncryptedContainer {
  const jsonString = JSON.stringify(data);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted,
  };
}

/**
 * Decrypts an EncryptedContainer into ShopVaultData.
 * Throws an error if the password is incorrect or file is tampered.
 */
export function decryptVaultData(container: EncryptedContainer, password: string): ShopVaultData {
  if (!container || !container.salt || !container.iv || !container.authTag || !container.data) {
    throw new Error('Invalid vault container format');
  }

  const salt = Buffer.from(container.salt, 'hex');
  const iv = Buffer.from(container.iv, 'hex');
  const authTag = Buffer.from(container.authTag, 'hex');
  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(container.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted) as ShopVaultData;
}

/**
 * Generates a verification hash for checking password without full decryption
 */
export function hashPassword(password: string, salt?: Buffer): { hash: string; salt: string } {
  const saltBuffer = salt || crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, saltBuffer, 50_000, 32, 'sha256').toString('hex');
  return { hash, salt: saltBuffer.toString('hex') };
}

export function verifyPasswordHash(password: string, expectedHash: string, saltHex: string): boolean {
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, 50_000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}
