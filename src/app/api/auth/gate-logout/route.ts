import { gateSessionCookie } from '@/server/auth/session';

export const runtime = 'nodejs';

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append('Set-Cookie', `${gateSessionCookie.name}=; Max-Age=0; Path=${gateSessionCookie.path}; HttpOnly; SameSite=Lax${gateSessionCookie.secure ? '; Secure' : ''}`);
  return response;
}
