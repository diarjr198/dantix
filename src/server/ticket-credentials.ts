import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from 'node:crypto';
import { getServerEnv } from '@/server/config/env';

const prefix = 'tiptip:v1:';

function encryptionKey() {
  return Buffer.from(hkdfSync('sha256', getServerEnv().AUTH_SESSION_SECRET, 'tiptip-ticket-qr', 'aes-256-gcm', 32));
}

export function hashTicketPayload(payload: string) {
  return createHash('sha256').update(payload).digest('hex');
}

export function createTicketCredential() {
  const payload = `${prefix}${randomBytes(32).toString('base64url')}`;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  return {
    payload,
    hash: hashTicketPayload(payload),
    ciphertext: ciphertext.toString('base64url'),
    iv: iv.toString('base64url'),
    authTag: cipher.getAuthTag().toString('base64url'),
  };
}

export function decryptTicketCredential(ciphertext: string, iv: string, authTag: string) {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function parseTicketPayload(payload: string) {
  if (!payload.startsWith(prefix) || payload.length <= prefix.length) throw new Error('INVALID_TICKET');
  return payload;
}
