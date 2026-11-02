import { createHmac, timingSafeEqual } from 'node:crypto';
import { isValidObjectId } from 'mongoose';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/server/config/env';
import { connectDatabase } from '@/server/db/connection';
import { effectiveUserRole, UserModel } from '@/server/models/user';
import type { UserRole } from '@/constants';

const sessionCookieName = 'tiptip_session';
const gateSessionCookieName = 'tiptip_gate_session';
const sessionMaxAge = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function encode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string): string {
  return createHmac('sha256', getServerEnv().AUTH_SESSION_SECRET)
    .update(value)
    .digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    expiresAt: Date.now() + sessionMaxAge * 1_000,
  };
  const encodedPayload = encode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, receivedSignature] = token.split('.');
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export type CurrentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAdmin: boolean;
  role: UserRole;
};

async function getUserFromCookie(cookieName: string): Promise<CurrentUser | null> {
  try {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return null;
    const session = verifySessionToken(token);
    if (!session || !isValidObjectId(session.userId)) return null;
    await connectDatabase();
    const user = await UserModel.findById(session.userId)
      .select('name email phone isAdmin role active')
      .lean();
    if (!user || user.active === false) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
      isAdmin: user.isAdmin,
      role: effectiveUserRole(user),
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await getUserFromCookie(sessionCookieName);
  return user?.role === 'GATE' ? null : user;
}

export async function getGateUser(): Promise<CurrentUser | null> {
  const user = await getUserFromCookie(gateSessionCookieName);
  return user?.role === 'GATE' || user?.role === 'ADMIN' ? user : null;
}

const cookieOptions = {
  maxAge: sessionMaxAge,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const sessionCookie = { name: sessionCookieName, ...cookieOptions };
export const gateSessionCookie = { name: gateSessionCookieName, ...cookieOptions };
