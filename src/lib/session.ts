import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { UserAccount } from '@/types/accounts';

export const SESSION_COOKIE_NAME = 'kv_dryfish_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'kv-dryfish-kulumani-secure-master-session-salt-2026';
const SESSION_MAX_AGE_SEC = 30 * 60; // 30 minutes

export interface SessionPayload {
  user: UserAccount;
  masterPassword: string;
  createdAt: number;
}

function getSecretKey(): Buffer {
  return crypto.createHash('sha256').update(SESSION_SECRET).digest();
}

export function encryptSessionPayload(payload: SessionPayload): string {
  const text = JSON.stringify(payload);
  const iv = crypto.randomBytes(12);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decryptSessionPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const key = getSecretKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const payload: SessionPayload = JSON.parse(decrypted);

    // Idle timeout check (30 minutes)
    if (Date.now() - payload.createdAt > SESSION_MAX_AGE_SEC * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(user: UserAccount, masterPassword: string): void {
  try {
    const token = encryptSessionPayload({
      user,
      masterPassword,
      createdAt: Date.now(),
    });

    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SEC,
    });
  } catch (err) {
    // Expected when called outside request context
  }
}

export function getSessionCookie(): SessionPayload | null {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return decryptSessionPayload(cookie.value);
  } catch {
    return null;
  }
}

export function clearSessionCookie(): void {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
  } catch {}
}

